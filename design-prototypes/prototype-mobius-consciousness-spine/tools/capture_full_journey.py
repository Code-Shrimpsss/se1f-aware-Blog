#!/usr/bin/python3
"""Deterministically capture and validate the Möbius consciousness journey.

The prototype is expected to expose one of these browser APIs:

    window.MobiusCapture.renderState(stateFloat, timeSeconds)  # preferred
    window.MobiusCapture.renderAt(progress, timeSeconds)       # legacy fallback

The fallback maps the 0..15 journey state range onto the legacy 0..1 progress
range. The script never scrolls the page to capture a state; every frame is
rendered explicitly so screenshots and video are repeatable.

Examples:

    /usr/bin/python3 tools/capture_full_journey.py
    /usr/bin/python3 tools/capture_full_journey.py --skip-video
    /usr/bin/python3 tools/capture_full_journey.py --frames-only --fps 24
    /usr/bin/python3 tools/capture_full_journey.py --show-debug --strict
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from playwright.sync_api import Browser, BrowserContext, Page, sync_playwright


SCRIPT_DIR = Path(__file__).resolve().parent
PROTOTYPE_DIR = SCRIPT_DIR.parent
DEFAULT_OUTPUT_DIR = PROTOTYPE_DIR / "outputs" / "full-journey"
DEFAULT_URL = (
    "http://127.0.0.1:4173/"
    "design-prototypes/prototype-mobius-consciousness-spine/"
)

STATE_COUNT = 16
LAST_STATE = STATE_COUNT - 1
VIEWPORT = {"width": 1440, "height": 900}
MOBILE_VIEWPORT = {"width": 390, "height": 844}

STATE_SPECS: Sequence[Tuple[int, str, str]] = (
    (0, "首页 · 完整骨架", "home-complete-spine"),
    (1, "观象 · 显名", "observation-name"),
    (2, "观象 · 信息经过", "observation-information"),
    (3, "观象 · 印痕留下", "observation-imprint"),
    (4, "转场 · 观象至构序", "transition-observation-to-order"),
    (5, "构序 · 归类", "order-classification"),
    (6, "构序 · 空间邻接", "order-spatial-adjacency"),
    (7, "构序 · 跨时间文字对齐", "order-cross-time-alignment"),
    (8, "转场 · 构序至观心", "transition-order-to-reflection"),
    (9, "观心 · 旧状态", "reflection-old-state"),
    (10, "观心 · 时间重现", "reflection-time-recurrence"),
    (11, "观心 · 空间反向观察", "reflection-space-observes"),
    (12, "转场 · 观心至见性", "transition-reflection-to-nature"),
    (13, "见性 · 整体显现", "nature-total-reveal"),
    (14, "见性 · 逐层剥离", "nature-layer-removal"),
    (15, "见性 · 最终返照", "nature-final-reflection"),
)

# The nine images requested for visual approval. Their source state remains in
# the filename so a reviewer can jump to the exact deterministic state.
KEYFRAME_SPECS: Sequence[Tuple[float, str]] = (
    (0, "01-home-complete-spine"),
    (2, "02-observation"),
    (4, "03-observation-to-order"),
    (6, "04-order"),
    (8, "05-order-to-reflection"),
    (10, "06-reflection"),
    # State 12 is intentionally the instant in which the camera has left every
    # visible surface. Sample the following return arc so this review frame
    # proves the transition instead of documenting a deliberate black hold.
    (12.55, "07-reflection-to-nature"),
    (13, "08-nature-total-reveal"),
    (15, "09-nature-removal-and-reflection"),
)

# These frames sit inside the formerly mechanical joins. They make material
# inheritance and the single-room time transformation reviewable without
# turning the live journey back into named stops.
CONTINUITY_SPECS: Sequence[Tuple[float, str]] = (
    (0.74, "opening-outer-surface-before-turn"),
    (0.78, "opening-continuous-surface-turn"),
    (0.82, "opening-inner-surface-after-turn"),
    (2.15, "observation-route-begins-at-title"),
    (2.55, "observation-route-connects-phrases"),
    (3.00, "imprint-before-fold"),
    (3.45, "fold-off-axis-open-side"),
    (4.00, "imprint-stretches-into-axis"),
    (4.45, "axis-rises-from-surface"),
    (4.85, "curved-wall-nearly-formed"),
    (7.45, "past-present-separate"),
    (7.00, "past-thought-readable-without-blur"),
    (8.20, "past-beneath-present"),
    (8.55, "single-synchronization"),
    (8.85, "entering-one-room"),
    (9.00, "room-2019-outline"),
    (9.50, "room-2022-open-gap"),
    (10.05, "room-2026-apparent-whole"),
    (10.85, "room-now-gap-reopens"),
    (11.00, "room-remembers-passage"),
    (11.45, "reflection-exit-keeps-surface-visible"),
    (12.00, "no-black-flash-between-acts"),
    (12.55, "continuous-pullback-before-nature"),
    (15.00, "final-reflection-keeps-white-point"),
)

DIRECTOR_SPECS: Sequence[Tuple[float, str]] = (
    (0.00, "home-sculptural-silhouette"),
    (2.55, "observation-oppressive-scale"),
    (3.00, "observation-one-scar-witnessed"),
    (4.55, "same-scar-becomes-bearing-axis"),
    (6.85, "order-precise-alignment"),
    (8.55, "single-time-synchronization"),
    (9.95, "reflection-one-room-many-times"),
    (10.85, "same-scar-reopens-room-gap"),
    (13.00, "nature-whole-with-inherited-scar"),
)

MOBILE_SPECS: Sequence[Tuple[float, str]] = (
    (0.0, "home"),
    (3.0, "observation"),
    (7.0, "order"),
    (10.0, "reflection"),
    (13.0, "nature"),
)

CAPTURE_JAVASCRIPT = """
async payload => {
  const capture = window.MobiusCapture;
  if (!capture || capture.ready !== true) {
    throw new Error('window.MobiusCapture is not ready');
  }

  let method;
  let result;
  if (typeof capture.renderState === 'function') {
    method = 'renderState';
    result = await Promise.resolve(
      capture.renderState(
        payload.stateFloat,
        payload.timeSeconds,
        { forceQuestion: payload.forceQuestion === true }
      )
    );
  } else if (typeof capture.renderAt === 'function') {
    method = 'renderAt';
    result = await Promise.resolve(
      capture.renderAt(payload.stateFloat / payload.lastState, payload.timeSeconds)
    );
  } else {
    throw new Error(
      'MobiusCapture must expose renderState(stateFloat, timeSeconds) ' +
      'or renderAt(progress, timeSeconds)'
    );
  }

  if (typeof capture.flush === 'function') {
    await Promise.resolve(capture.flush());
  }

  // A single RAF lets DOM labels commit without advancing the deterministic
  // WebGL timeline, which is driven solely by timeSeconds above.
  await new Promise(resolve => requestAnimationFrame(resolve));
  return { method, result: result ?? null };
}
"""

OVERFLOW_JAVASCRIPT = """
() => {
  const root = document.documentElement;
  const body = document.body;
  const viewportWidth = window.innerWidth;
  const rootOverflow = Math.max(0, root.scrollWidth - viewportWidth);
  const bodyOverflow = Math.max(0, body.scrollWidth - viewportWidth);
  const overflow = Math.max(rootOverflow, bodyOverflow);
  const offenders = [];

  if (overflow > 1) {
    for (const element of document.body.querySelectorAll('*')) {
      const rect = element.getBoundingClientRect();
      if (rect.right > viewportWidth + 1 || rect.left < -1) {
        offenders.push({
          element: element.tagName.toLowerCase(),
          id: element.id || null,
          classes: typeof element.className === 'string'
            ? element.className.trim().split(/\\s+/).filter(Boolean).slice(0, 5)
            : [],
          left: Number(rect.left.toFixed(2)),
          right: Number(rect.right.toFixed(2)),
          width: Number(rect.width.toFixed(2)),
        });
        if (offenders.length >= 12) break;
      }
    }
  }

  return {
    viewportWidth,
    rootScrollWidth: root.scrollWidth,
    bodyScrollWidth: body.scrollWidth,
    overflowPixels: overflow,
    offenders,
  };
}
"""

FRAME_CADENCE_JAVASCRIPT = """
() => new Promise(resolve => {
  const capture = window.MobiusCapture;
  const samples = [];
  let previous = 0;
  let warmup = 10;

  function frame(now) {
    capture.renderState(0, now / 1000);
    if (previous && warmup <= 0) samples.push(now - previous);
    previous = now;
    warmup -= 1;
    if (samples.length >= 90) {
      const sorted = samples.slice().sort((a, b) => a - b);
      const averageMs = samples.reduce((sum, value) => sum + value, 0) / samples.length;
      resolve({
        frames: samples.length,
        averageMs: Number(averageMs.toFixed(2)),
        averageFps: Number((1000 / averageMs).toFixed(1)),
        p95Ms: Number(sorted[Math.floor(sorted.length * 0.95)].toFixed(2)),
        maxMs: Number(Math.max(...samples).toFixed(2)),
        tier: document.body.dataset.performanceTier || null,
      });
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Capture all 16 deterministic Möbius journey states, create the "
            "nine review keyframes and optionally encode a full journey video."
        )
    )
    parser.add_argument("--url", default=DEFAULT_URL, help="Local prototype URL")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Capture output directory (default: prototype outputs/full-journey)",
    )
    parser.add_argument(
        "--chromium",
        type=Path,
        help="Explicit Chromium executable; otherwise auto-detected",
    )
    parser.add_argument(
        "--ffmpeg", help="Explicit ffmpeg executable; otherwise auto-detected"
    )
    parser.add_argument("--fps", type=int, default=30, help="Video frame rate")
    parser.add_argument(
        "--transition-seconds",
        type=float,
        default=0.9,
        help="Duration between adjacent states",
    )
    parser.add_argument(
        "--hold-seconds",
        type=float,
        default=0.45,
        help="Inspection hold after intermediate states",
    )
    parser.add_argument(
        "--opening-hold-seconds",
        type=float,
        default=1.5,
        help="Opening state hold duration",
    )
    parser.add_argument(
        "--closing-hold-seconds",
        type=float,
        default=2.0,
        help="Final reflection hold duration",
    )
    parser.add_argument(
        "--state-time-step",
        type=float,
        default=1.6,
        help="Seconds of deterministic scene time between integer screenshots",
    )
    video_mode = parser.add_mutually_exclusive_group()
    video_mode.add_argument(
        "--skip-video",
        action="store_true",
        help="Capture state/keyframe stills and validation only",
    )
    video_mode.add_argument(
        "--frames-only",
        action="store_true",
        help="Capture video PNG frames but do not invoke ffmpeg",
    )
    parser.add_argument(
        "--keep-frames",
        action="store_true",
        help="Keep video PNG frames after successful ffmpeg encoding",
    )
    parser.add_argument(
        "--show-debug",
        action="store_true",
        help="Keep the prototype blockout/debug panel visible in captures",
    )
    parser.add_argument(
        "--motion",
        choices=("normal", "reduce"),
        default="normal",
        help="Request normal or reduced motion from both URL and browser context",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help=(
            "Exit non-zero for console/page errors, failed/external requests, "
            "HTTP errors or horizontal overflow"
        ),
    )
    parser.add_argument(
        "--timeout-ms",
        type=int,
        default=30_000,
        help="Navigation and MobiusCapture readiness timeout",
    )
    return parser.parse_args()


def ensure_capture_query(url: str, show_debug: bool, motion: str) -> str:
    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    query["capture"] = "1"
    query["clean"] = "0" if show_debug else "1"
    if motion == "reduce":
        query["motion"] = "reduce"
    else:
        query.pop("motion", None)
    return urlunparse(parsed._replace(query=urlencode(query)))


def discover_chromium(explicit: Optional[Path], playwright: Any) -> Path:
    candidates: List[Path] = []
    if explicit:
        candidates.append(explicit.expanduser())
    environment_path = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
    if environment_path:
        candidates.append(Path(environment_path).expanduser())

    cache_root = Path.home() / "Library" / "Caches" / "ms-playwright"
    candidates.extend(
        sorted(
            cache_root.glob(
                "chromium-*/chrome-mac/Chromium.app/Contents/MacOS/Chromium"
            ),
            reverse=True,
        )
    )
    candidates.append(Path(playwright.chromium.executable_path))

    for candidate in candidates:
        if candidate.is_file():
            return candidate.resolve()
    raise FileNotFoundError(
        "No Playwright Chromium executable found. Pass --chromium PATH or set "
        "PLAYWRIGHT_CHROMIUM_EXECUTABLE."
    )


def discover_ffmpeg(explicit: Optional[str]) -> str:
    candidates = [explicit, os.environ.get("FFMPEG"), "/opt/homebrew/bin/ffmpeg"]
    candidates.append(shutil.which("ffmpeg"))
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return str(Path(candidate).resolve())
    raise FileNotFoundError(
        "ffmpeg was not found. Pass --ffmpeg PATH, set FFMPEG, or use "
        "--frames-only."
    )


def smootherstep(value: float) -> float:
    t = min(1.0, max(0.0, value))
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0)


def repeated_state(state: float, seconds: float, fps: int) -> Iterable[float]:
    for _ in range(max(1, round(seconds * fps))):
        yield state


VIDEO_BEATS: Sequence[Tuple[float, float, float, str]] = (
    (0.0, 0.0, 2.8, "hold"),
    (0.0, 1.0, 1.8, "opening"),
    (1.0, 2.0, 0.65, "burst"),
    (2.0, 3.0, 0.55, "burst"),
    (3.0, 3.0, 1.6, "hold"),
    (3.0, 5.0, 2.2, "cinematic"),
    (5.0, 6.0, 1.4, "direct"),
    (6.0, 7.0, 2.7, "align"),
    (7.0, 7.0, 1.3, "hold"),
    (7.0, 9.0, 0.9, "plunge"),
    (9.0, 10.0, 2.2, "echo"),
    (10.0, 11.0, 2.5, "echo"),
    (11.0, 11.0, 0.9, "hold"),
    (11.0, 13.0, 2.2, "cinematic"),
    (13.0, 13.0, 1.2, "hold"),
    (13.0, 14.0, 1.0, "reveal"),
    (14.0, 14.96, 4.5, "final"),
    (14.96, 14.96, 7.2, "hold"),
    (14.96, 15.0, 1.8, "final"),
    (15.0, 15.0, 2.4, "hold"),
)


def beat_easing(mode: str, value: float) -> float:
    """Mirror the different physical rhythms used by the live scroll journey."""

    t = min(1.0, max(0.0, value))
    if mode == "direct":
        return t
    if mode == "opening":
        return 1.0 - pow(1.0 - t, 2.0)
    if mode == "burst":
        return 1.0 - pow(1.0 - t, 2.4)
    if mode == "align":
        return smootherstep(t)
    if mode == "plunge":
        if t < 0.3:
            return t * 0.18
        return 0.054 + pow((t - 0.3) / 0.7, 1.45) * 0.946
    if mode == "echo":
        return t * t * (3.0 - 2.0 * t)
    if mode == "reveal":
        return 1.0 - pow(1.0 - t, 3.4)
    if mode == "cinematic":
        # Slow lock-on, decisive acceleration, soft arrival.
        return smootherstep(t)
    if mode == "settle":
        # Arrive early enough for the composition to become legible.
        return 1.0 - pow(1.0 - t, 3.0)
    return t


def build_journey_samples(
    fps: int,
    transition_seconds: float,
    hold_seconds: float,
    opening_hold_seconds: float,
    closing_hold_seconds: float,
) -> List[float]:
    # The old recorder gave all 15 state boundaries equal weight, which made a
    # continuous world look like a slide deck. VIDEO_BEATS intentionally skips
    # the transition-only states 4/8/12 as stops, gives each scene its own
    # inertia, and reserves a complete 7.2-second breath of darkness before the
    # final question. Legacy CLI duration arguments remain accepted so existing
    # automation does not break, but normal-motion pacing is authored here.
    del transition_seconds, hold_seconds, opening_hold_seconds, closing_hold_seconds
    samples: List[float] = []
    for start, end, seconds, mode in VIDEO_BEATS:
        frame_count = max(1, round(seconds * fps))
        if start == end:
            samples.extend(repeated_state(start, seconds, fps))
            continue
        for frame in range(1, frame_count + 1):
            amount = beat_easing(mode, frame / frame_count)
            samples.append(start + (end - start) * amount)
    return samples


def build_reduced_motion_samples(
    fps: int,
    hold_seconds: float,
    opening_hold_seconds: float,
    closing_hold_seconds: float,
) -> List[float]:
    """Return only inspectable integer compositions—never a flight path."""

    samples: List[float] = []
    for state in range(STATE_COUNT):
        seconds = hold_seconds
        if state == 0:
            seconds = opening_hold_seconds
        elif state == LAST_STATE:
            seconds = closing_hold_seconds
        samples.extend(repeated_state(float(state), seconds, fps))
    return samples


def local_hosts_for(url: str) -> set[str]:
    hosts = {"localhost", "127.0.0.1", "::1", "0.0.0.0"}
    hostname = urlparse(url).hostname
    if hostname:
        hosts.add(hostname.lower())
    return hosts


def request_is_external(url: str, local_hosts: set[str]) -> bool:
    parsed = urlparse(url)
    if parsed.scheme in {"", "about", "blob", "data", "file", "javascript"}:
        return False
    if parsed.scheme not in {"http", "https", "ws", "wss"}:
        return False
    return (parsed.hostname or "").lower() not in local_hosts


def is_implicit_favicon_request(url: str) -> bool:
    """Ignore only Chromium's automatic favicon probe, never declared assets."""

    return urlparse(url).path == "/favicon.ico"


def prepare_output(output_dir: Path, include_video_frames: bool) -> Dict[str, Path]:
    output_dir = output_dir.expanduser().resolve()
    states_dir = output_dir / "states"
    keyframes_dir = output_dir / "keyframes"
    continuity_dir = output_dir / "continuity"
    director_dir = output_dir / "director-frames"
    mobile_dir = output_dir / "mobile-390x844"
    frames_dir = output_dir / "frames"

    for directory in (
        states_dir,
        keyframes_dir,
        continuity_dir,
        director_dir,
        mobile_dir,
    ):
        shutil.rmtree(directory, ignore_errors=True)
        directory.mkdir(parents=True, exist_ok=True)
    if include_video_frames:
        shutil.rmtree(frames_dir, ignore_errors=True)
        frames_dir.mkdir(parents=True, exist_ok=True)

    return {
        "root": output_dir,
        "states": states_dir,
        "keyframes": keyframes_dir,
        "continuity": continuity_dir,
        "director": director_dir,
        "mobile": mobile_dir,
        "frames": frames_dir,
        "video": output_dir / "mobius-full-journey.mp4",
        "report": output_dir / "validation-report.json",
    }


def render_state(
    page: Page,
    state_float: float,
    time_seconds: float,
    force_question: bool = False,
) -> Dict[str, Any]:
    return page.evaluate(
        CAPTURE_JAVASCRIPT,
        {
            "stateFloat": state_float,
            "timeSeconds": time_seconds,
            "lastState": LAST_STATE,
            "forceQuestion": force_question,
        },
    )


def inspect_overflow(page: Page) -> Dict[str, Any]:
    return page.evaluate(OVERFLOW_JAVASCRIPT)


def screenshot(page: Page, destination: Path) -> None:
    page.screenshot(
        path=str(destination),
        type="png",
        full_page=False,
        scale="css",
        animations="allow",
        caret="hide",
        timeout=60_000,
    )


def encode_video(
    ffmpeg: str,
    frames_dir: Path,
    destination: Path,
    fps: int,
    frame_count: int,
) -> None:
    subprocess.run(
        [
            ffmpeg,
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-framerate",
            str(fps),
            "-start_number",
            "0",
            "-i",
            str(frames_dir / "frame-%05d.png"),
            "-frames:v",
            str(frame_count),
            "-an",
            "-c:v",
            "libx264",
            "-preset",
            "slow",
            "-tune",
            "animation",
            "-crf",
            "14",
            "-pix_fmt",
            "yuv420p",
            "-profile:v",
            "high",
            "-movflags",
            "+faststart",
            str(destination),
        ],
        check=True,
    )


def attach_diagnostics(
    page: Page,
    report: Dict[str, Any],
    local_hosts: set[str],
) -> None:
    def on_console(message: Any) -> None:
        entry = {
            "type": message.type,
            "text": message.text,
            "location": message.location,
        }
        report["browser"]["console_messages"].append(entry)
        if message.type == "error":
            location_url = (message.location or {}).get("url", "")
            if is_implicit_favicon_request(location_url):
                report["checks"]["ignored_implicit_favicon_errors"].append(entry)
            else:
                report["checks"]["console_errors"].append(entry)

    def on_page_error(error: Any) -> None:
        report["checks"]["page_errors"].append(str(error))

    def on_request(request: Any) -> None:
        url = request.url
        report["network"]["request_count"] += 1
        if request_is_external(url, local_hosts):
            report["checks"]["external_requests"].append(
                {"url": url, "resourceType": request.resource_type}
            )

    def on_request_failed(request: Any) -> None:
        entry = {
            "url": request.url,
            "resourceType": request.resource_type,
            "failure": request.failure,
        }
        if is_implicit_favicon_request(request.url):
            report["checks"]["ignored_implicit_favicon_errors"].append(entry)
        else:
            report["checks"]["failed_requests"].append(entry)

    def on_response(response: Any) -> None:
        if response.status >= 400:
            entry = {
                "url": response.url,
                "status": response.status,
                "resourceType": response.request.resource_type,
            }
            if is_implicit_favicon_request(response.url):
                report["checks"]["ignored_implicit_favicon_errors"].append(entry)
            else:
                report["checks"]["http_errors"].append(entry)

    page.on("console", on_console)
    page.on("pageerror", on_page_error)
    page.on("request", on_request)
    page.on("requestfailed", on_request_failed)
    page.on("response", on_response)


def has_validation_failures(report: Dict[str, Any]) -> bool:
    checks = report["checks"]
    return any(
        checks[key]
        for key in (
            "console_errors",
            "page_errors",
            "failed_requests",
            "http_errors",
            "external_requests",
            "horizontal_overflow",
        )
    )


def json_safe(value: Any) -> Any:
    try:
        json.dumps(value)
        return value
    except (TypeError, ValueError):
        return repr(value)


def main() -> int:
    args = parse_args()
    if args.fps < 1:
        raise ValueError("--fps must be at least 1")
    for name in (
        "transition_seconds",
        "hold_seconds",
        "opening_hold_seconds",
        "closing_hold_seconds",
        "state_time_step",
    ):
        if getattr(args, name) < 0:
            raise ValueError(f"--{name.replace('_', '-')} cannot be negative")

    include_video_frames = not args.skip_video
    paths = prepare_output(args.output_dir, include_video_frames)
    capture_url = ensure_capture_query(args.url, args.show_debug, args.motion)
    local_hosts = local_hosts_for(capture_url)
    started = time.monotonic()

    report: Dict[str, Any] = {
        "schemaVersion": 1,
        "startedAt": datetime.now(timezone.utc).isoformat(),
        "prototype": str(PROTOTYPE_DIR),
        "url": capture_url,
        "viewport": VIEWPORT,
        "motion": args.motion,
        "captureApi": None,
        "browser": {
            "chromium": None,
            "console_messages": [],
        },
        "network": {"request_count": 0},
        "stateCaptures": [],
        "keyframes": [],
        "continuityFrames": [],
        "directorFrames": [],
        "mobileCaptures": [],
        "performance": None,
        "video": None,
        "checks": {
            "console_errors": [],
            "page_errors": [],
            "failed_requests": [],
            "http_errors": [],
            "external_requests": [],
            "horizontal_overflow": [],
            "ignored_implicit_favicon_errors": [],
        },
        "fatalError": None,
        "passed": False,
    }

    browser: Optional[Browser] = None
    context: Optional[BrowserContext] = None
    try:
        with sync_playwright() as playwright:
            chromium = discover_chromium(args.chromium, playwright)
            report["browser"]["chromium"] = str(chromium)
            browser = playwright.chromium.launch(
                executable_path=str(chromium),
                headless=True,
                args=[
                    "--enable-webgl",
                    "--ignore-gpu-blocklist",
                    "--enable-unsafe-swiftshader",
                    "--disable-background-timer-throttling",
                    "--disable-backgrounding-occluded-windows",
                    "--disable-renderer-backgrounding",
                    "--no-proxy-server",
                ],
            )
            context = browser.new_context(
                viewport=VIEWPORT,
                device_scale_factor=1,
                color_scheme="dark",
                locale="zh-CN",
                reduced_motion=(
                    "reduce" if args.motion == "reduce" else "no-preference"
                ),
                service_workers="block",
            )
            page = context.new_page()
            page.set_default_timeout(args.timeout_ms)
            attach_diagnostics(page, report, local_hosts)

            page.goto(capture_url, wait_until="load", timeout=args.timeout_ms)
            page.evaluate(
                "async () => { if (document.fonts) await document.fonts.ready; return true; }"
            )
            page.wait_for_function(
                "() => window.MobiusCapture?.ready === true",
                timeout=args.timeout_ms,
            )

            api = page.evaluate(
                """
                () => ({
                  renderState: typeof window.MobiusCapture?.renderState === 'function',
                  renderAt: typeof window.MobiusCapture?.renderAt === 'function',
                })
                """
            )
            if not api["renderState"] and not api["renderAt"]:
                raise RuntimeError(
                    "MobiusCapture has neither renderState nor renderAt"
                )
            report["captureApi"] = "renderState" if api["renderState"] else "renderAt"
            print(f"capture API: {report['captureApi']}", flush=True)

            state_files: Dict[int, Path] = {}
            for state, label, slug in STATE_SPECS:
                state_time = state * args.state_time_step
                render_result = render_state(
                    page,
                    float(state),
                    state_time,
                    force_question=(state == LAST_STATE),
                )
                state_file = paths["states"] / f"state-{state:02d}-{slug}.png"
                screenshot(page, state_file)
                overflow = inspect_overflow(page)
                if overflow["overflowPixels"] > 1:
                    report["checks"]["horizontal_overflow"].append(
                        {"state": state, **overflow}
                    )
                report["stateCaptures"].append(
                    {
                        "state": state,
                        "label": label,
                        "timeSeconds": state_time,
                        "file": str(state_file),
                        "render": json_safe(render_result),
                        "overflow": overflow,
                    }
                )
                state_files[state] = state_file
                print(f"state {state:02d}/{LAST_STATE:02d}: {label}", flush=True)

            for state_float, slug in KEYFRAME_SPECS:
                state_label = f"{state_float:05.2f}".replace(".", "-")
                destination = paths["keyframes"] / f"{slug}-state-{state_label}.png"
                if float(state_float).is_integer():
                    shutil.copy2(state_files[int(state_float)], destination)
                else:
                    render_state(
                        page,
                        float(state_float),
                        float(state_float) * args.state_time_step,
                    )
                    screenshot(page, destination)
                report["keyframes"].append(
                    {"stateFloat": state_float, "file": str(destination)}
                )

            for state_float, slug in CONTINUITY_SPECS:
                state_label = f"{state_float:05.2f}".replace(".", "-")
                destination = (
                    paths["continuity"] / f"{slug}-state-{state_label}.png"
                )
                render_state(
                    page,
                    state_float,
                    state_float * args.state_time_step,
                )
                screenshot(page, destination)
                report["continuityFrames"].append(
                    {"stateFloat": state_float, "file": str(destination)}
                )

            for state_float, slug in DIRECTOR_SPECS:
                state_label = f"{state_float:05.2f}".replace(".", "-")
                destination = paths["director"] / f"{slug}-state-{state_label}.png"
                render_state(page, state_float, state_float * args.state_time_step)
                screenshot(page, destination)
                report["directorFrames"].append(
                    {"stateFloat": state_float, "file": str(destination)}
                )

            report["performance"] = page.evaluate(FRAME_CADENCE_JAVASCRIPT)

            if include_video_frames:
                if args.motion == "reduce":
                    samples = build_reduced_motion_samples(
                        args.fps,
                        args.hold_seconds,
                        args.opening_hold_seconds,
                        args.closing_hold_seconds,
                    )
                else:
                    samples = build_journey_samples(
                        args.fps,
                        args.transition_seconds,
                        args.hold_seconds,
                        args.opening_hold_seconds,
                        args.closing_hold_seconds,
                    )
                frame_count = len(samples)
                for index, state_float in enumerate(samples):
                    seconds = index / args.fps
                    render_state(page, state_float, seconds)
                    screenshot(page, paths["frames"] / f"frame-{index:05d}.png")
                    if (index + 1) % max(args.fps * 2, 1) == 0 or index + 1 == frame_count:
                        print(
                            f"video frames {index + 1}/{frame_count} "
                            f"(state {state_float:.2f})",
                            flush=True,
                        )

                duration = frame_count / args.fps
                if args.frames_only:
                    report["video"] = {
                        "encoded": False,
                        "framesDirectory": str(paths["frames"]),
                        "frameCount": frame_count,
                        "fps": args.fps,
                        "durationSeconds": duration,
                    }
                else:
                    ffmpeg = discover_ffmpeg(args.ffmpeg)
                    encode_video(
                        ffmpeg,
                        paths["frames"],
                        paths["video"],
                        args.fps,
                        frame_count,
                    )
                    report["video"] = {
                        "encoded": True,
                        "file": str(paths["video"]),
                        "frameCount": frame_count,
                        "fps": args.fps,
                        "durationSeconds": duration,
                        "ffmpeg": ffmpeg,
                    }
                    if not args.keep_frames:
                        shutil.rmtree(paths["frames"], ignore_errors=True)

            context.close()
            context = None

            mobile_context = browser.new_context(
                viewport=MOBILE_VIEWPORT,
                device_scale_factor=1,
                color_scheme="dark",
                locale="zh-CN",
                reduced_motion=(
                    "reduce" if args.motion == "reduce" else "no-preference"
                ),
                service_workers="block",
                is_mobile=True,
                has_touch=True,
            )
            try:
                mobile_page = mobile_context.new_page()
                mobile_page.set_default_timeout(args.timeout_ms)
                attach_diagnostics(mobile_page, report, local_hosts)
                mobile_page.goto(
                    capture_url, wait_until="load", timeout=args.timeout_ms
                )
                mobile_page.evaluate(
                    "async () => { if (document.fonts) await document.fonts.ready; return true; }"
                )
                mobile_page.wait_for_function(
                    "() => window.MobiusCapture?.ready === true",
                    timeout=args.timeout_ms,
                )
                for state_float, slug in MOBILE_SPECS:
                    render_state(
                        mobile_page,
                        state_float,
                        state_float * args.state_time_step,
                    )
                    destination = paths["mobile"] / f"{slug}.png"
                    screenshot(mobile_page, destination)
                    overflow = inspect_overflow(mobile_page)
                    if overflow["overflowPixels"] > 1:
                        report["checks"]["horizontal_overflow"].append(
                            {"state": state_float, "viewport": "mobile", **overflow}
                        )
                    report["mobileCaptures"].append(
                        {
                            "stateFloat": state_float,
                            "file": str(destination),
                            "overflow": overflow,
                        }
                    )
            finally:
                mobile_context.close()
            browser.close()
            browser = None

        report["passed"] = not has_validation_failures(report)
    except Exception as error:  # Preserve diagnostics even on a failed run.
        report["fatalError"] = f"{type(error).__name__}: {error}"
        report["passed"] = False
        raise
    finally:
        if context is not None:
            try:
                context.close()
            except Exception:
                pass
        if browser is not None:
            try:
                browser.close()
            except Exception:
                pass
        report["durationSeconds"] = round(time.monotonic() - started, 3)
        paths["root"].mkdir(parents=True, exist_ok=True)
        paths["report"].write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"validation report: {paths['report']}", flush=True)

    print(f"16 state stills: {paths['states']}", flush=True)
    print(f"9 review keyframes: {paths['keyframes']}", flush=True)
    print(f"{len(CONTINUITY_SPECS)} continuity frames: {paths['continuity']}", flush=True)
    print(f"9 director frames: {paths['director']}", flush=True)
    print(f"5 mobile frames: {paths['mobile']}", flush=True)
    if report["video"]:
        if report["video"]["encoded"]:
            print(f"journey video: {report['video']['file']}", flush=True)
        else:
            print(f"journey frames: {report['video']['framesDirectory']}", flush=True)
    print("validation: PASS" if report["passed"] else "validation: FAIL", flush=True)

    if args.strict and not report["passed"]:
        return 2
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("capture interrupted", file=sys.stderr)
        sys.exit(130)
