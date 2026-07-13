#!/usr/bin/env python3
"""Deterministically capture the three approved complete-body artifacts."""

from pathlib import Path
import json
import shutil
import subprocess

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUTS = ROOT / "outputs"
FRAMES = Path("/tmp/self-awake-complete-body-frames")
BASE_URL = "http://127.0.0.1:4173/design-prototypes/prototype-complete-body-breathing/"
CHROMIUM = Path(
    "/Users/apple/Library/Caches/ms-playwright/chromium-1161/"
    "chrome-mac/Chromium.app/Contents/MacOS/Chromium"
)
FFMPEG = "/opt/homebrew/bin/ffmpeg"
FFPROBE = "/opt/homebrew/bin/ffprobe"
FPS = 60
BREATH_FRAMES = 432
APPROACH_FRAMES = 504


def run(command):
    subprocess.run(command, check=True)


def encode(sequence, frame_count, output):
    run(
        [
            FFMPEG,
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-framerate",
            str(FPS),
            "-start_number",
            "0",
            "-i",
            str(sequence),
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
            "12",
            "-pix_fmt",
            "yuv420p",
            "-profile:v",
            "high",
            "-level:v",
            "4.2",
            "-g",
            "60",
            "-keyint_min",
            "60",
            "-sc_threshold",
            "0",
            "-fps_mode",
            "cfr",
            "-movflags",
            "+faststart",
            "-color_primaries",
            "bt709",
            "-color_trc",
            "bt709",
            "-colorspace",
            "bt709",
            str(output),
        ]
    )


def probe(path):
    completed = subprocess.run(
        [
            FFPROBE,
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-count_frames",
            "-show_entries",
            (
                "stream=codec_name,profile,pix_fmt,width,height,r_frame_rate,"
                "avg_frame_rate,nb_read_frames,duration"
            ),
            "-show_entries",
            "format=duration,size",
            "-of",
            "json",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(completed.stdout)


def capture():
    if not CHROMIUM.exists():
        raise FileNotFoundError(f"Verified Chromium is missing: {CHROMIUM}")

    shutil.rmtree(FRAMES, ignore_errors=True)
    breath_dir = FRAMES / "breath"
    approach_dir = FRAMES / "approach"
    breath_dir.mkdir(parents=True)
    approach_dir.mkdir(parents=True)
    OUTPUTS.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=str(CHROMIUM),
            headless=True,
            args=["--enable-webgl", "--ignore-gpu-blocklist"],
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1,
            color_scheme="dark",
            locale="zh-CN",
            reduced_motion="no-preference",
        )
        page = context.new_page()
        page.goto(f"{BASE_URL}?capture=1&mode=breath", wait_until="networkidle")
        page.evaluate("() => document.fonts.ready")
        page.wait_for_function("() => window.SelfAwakeCapture?.ready === true")

        page.evaluate(
            "() => window.SelfAwakeCapture.render({ mode: 'shape', timeMs: 0 })"
        )
        page.screenshot(
            path=str(OUTPUTS / "01-core-static.png"),
            type="png",
            full_page=False,
            scale="css",
            animations="allow",
            caret="hide",
        )

        for index in range(BREATH_FRAMES):
            milliseconds = index * 1000 / FPS
            page.evaluate(
                "timeMs => window.SelfAwakeCapture.render({ mode: 'breath', timeMs })",
                milliseconds,
            )
            page.screenshot(
                path=str(breath_dir / f"breath-{index:04d}.png"),
                type="png",
                full_page=False,
                scale="css",
                animations="allow",
                caret="hide",
            )
            if index % 60 == 59 or index == BREATH_FRAMES - 1:
                print(f"breath {index + 1}/{BREATH_FRAMES}", flush=True)

        for index in range(APPROACH_FRAMES):
            milliseconds = index * 1000 / FPS
            page.evaluate(
                "timeMs => window.SelfAwakeCapture.render({ mode: 'approach', timeMs })",
                milliseconds,
            )
            page.screenshot(
                path=str(approach_dir / f"approach-{index:04d}.png"),
                type="png",
                full_page=False,
                scale="css",
                animations="allow",
                caret="hide",
            )
            if index % 60 == 59 or index == APPROACH_FRAMES - 1:
                print(f"approach {index + 1}/{APPROACH_FRAMES}", flush=True)

        context.close()
        browser.close()

    encode(
        breath_dir / "breath-%04d.png",
        BREATH_FRAMES,
        OUTPUTS / "02-breath-7.2s.mp4",
    )
    encode(
        approach_dir / "approach-%04d.png",
        APPROACH_FRAMES,
        OUTPUTS / "03-first-scroll.mp4",
    )

    report = {
        "breath": probe(OUTPUTS / "02-breath-7.2s.mp4"),
        "approach": probe(OUTPUTS / "03-first-scroll.mp4"),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    capture()
