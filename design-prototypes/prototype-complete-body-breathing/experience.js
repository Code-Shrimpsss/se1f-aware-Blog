(() => {
  'use strict'

  const canvas = document.querySelector('#complete-core')
  const body = document.body
  const root = document.documentElement
  const status = document.querySelector('.assistive-state')
  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode') || ''
  const shot = params.get('shot') || ''
  const captureMode = params.get('capture') === '1'
  const initialCaptureTime = Math.max(0, Number(params.get('time')) || 0)
  const demoMode = params.get('demo') || ''
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointerQuery = window.matchMedia('(pointer: fine)')
  const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value))
  const mix = (start, end, amount) => start + (end - start) * amount
  const smoothstep = (value) => {
    const unit = clamp(value)
    return unit * unit * (3 - 2 * unit)
  }
  const smootherstep = (value) => {
    const unit = clamp(value)
    return unit * unit * unit * (unit * (unit * 6 - 15) + 10)
  }
  const easeInCubic = (value) => Math.pow(clamp(value), 3)
  const easeOutQuint = (value) => 1 - Math.pow(1 - clamp(value), 5)

  let world
  let animationFrame = 0
  let lastFrameAt = performance.now()
  let elapsedSeconds = 0
  let scrollProgress = 0
  let targetScrollProgress = 0
  let pointerX = 0
  let pointerY = 0
  let targetPointerX = 0
  let targetPointerY = 0
  let visible = !document.hidden
  let reducedMotion = reducedQuery.matches || params.get('motion') === 'reduce'
  let captureTime = 0
  let captureTimeline = mode || 'breath'
  let ready = false

  function breathPosition(totalSeconds) {
    const periods = [7.2, 7.8]
    let remaining = Math.max(0, totalSeconds)
    let completed = 0

    while (remaining >= periods[completed % periods.length] && completed < 120) {
      remaining -= periods[completed % periods.length]
      completed += 1
    }

    return {
      cycleIndex: completed,
      localTime: remaining,
      period: periods[completed % periods.length],
      permanentGrowth: Math.min(0.28, completed * 0.04),
    }
  }

  function breathFrame(totalSeconds) {
    const position = breathPosition(totalSeconds)
    const time = position.localTime
    const period = position.period
    const returnStart = period - 1.6
    const residual = 0.04

    let crackLight = 0.12
    let sideLeft = 0
    let sideRight = 0
    let pressurePhase = 0
    let pressureAmount = 0
    let armLift = 0
    let cavityOpen = 0

    if (time <= 1.4) {
      crackLight = mix(0.12, 1, smootherstep(time / 1.4))
    } else if (time <= 3.0) {
      const stage = smootherstep((time - 1.4) / 1.6)
      crackLight = 1
      sideLeft = stage
      sideRight = stage
    } else if (time <= 4.2) {
      const stage = smootherstep((time - 3.0) / 1.2)
      crackLight = 1
      sideLeft = 1
      sideRight = 1
      pressurePhase = stage
      pressureAmount = Math.sin(stage * Math.PI * 0.72)
    } else if (time <= returnStart) {
      const stage = smootherstep((time - 4.2) / Math.max(0.001, returnStart - 4.2))
      crackLight = 1
      sideLeft = 1
      sideRight = 1
      pressurePhase = 1
      pressureAmount = mix(0.82, 0.38, stage)
      armLift = stage
      cavityOpen = stage
    } else {
      const release = smootherstep((time - returnStart) / 1.6)
      const settle = mix(1, residual, release)
      crackLight = mix(1, 0.22, release)
      sideLeft = settle
      sideRight = settle
      pressurePhase = 1
      pressureAmount = mix(0.38, residual, release)
      armLift = settle
      cavityOpen = settle
    }

    return {
      time: totalSeconds,
      crackLight,
      sideLeft,
      sideRight,
      pressurePhase,
      pressureAmount,
      armLift,
      cavityOpen,
      growth: position.permanentGrowth,
      breathIndex: position.cycleIndex % 2,
    }
  }

  function approachScrollAt(seconds) {
    if (seconds <= 0.8) return 0
    if (seconds <= 5.7) {
      const stage = clamp((seconds - 0.8) / 4.9)
      const deliberateAcceleration = mix(easeInCubic(stage), easeOutQuint(stage), stage * 0.38)
      return 0.35 * deliberateAcceleration
    }
    const opening = smootherstep((seconds - 5.7) / 2.7)
    return mix(0.35, 0.58, opening)
  }

  function frameFor(timeline, seconds) {
    if (timeline === 'core') {
      return {
        ...breathFrame(0),
        crackLight: 0.48,
        sideLeft: 0.04,
        sideRight: 0.04,
        pressurePhase: 1,
        pressureAmount: 0.04,
        armLift: 0.04,
        cavityOpen: 0.04,
        growth: 0.04,
        scroll: 0,
      }
    }

    if (timeline === 'approach') {
      return {
        ...breathFrame(1.05 + seconds * 0.34),
        scroll: approachScrollAt(seconds),
      }
    }

    return {
      ...breathFrame(seconds),
      scroll: 0,
    }
  }

  function interactiveFrame() {
    const timeline = breathFrame(elapsedSeconds)
    return {
      ...timeline,
      scroll: scrollProgress,
    }
  }

  function renderFrame(frame) {
    const visual = frame || interactiveFrame()
    world.render({
      ...visual,
      pointerX,
      pointerY,
      reducedMotion,
    })

    body.classList.toggle('is-near-core', visual.scroll > 0.08)

    if (!ready) {
      ready = true
      window.__ready = true
      body.classList.add('is-ready')
    }
  }

  function updateInteractiveClock(now) {
    const delta = Math.min(50, Math.max(0, now - lastFrameAt)) / 1000
    lastFrameAt = now

    if (!reducedMotion) elapsedSeconds += delta
    scrollProgress = mix(scrollProgress, targetScrollProgress, reducedMotion ? 1 : 0.065)
    pointerX = mix(pointerX, targetPointerX, reducedMotion ? 1 : 0.055)
    pointerY = mix(pointerY, targetPointerY, reducedMotion ? 1 : 0.055)
  }

  function tick(now) {
    if (!visible) return
    updateInteractiveClock(now)

    if (demoMode === 'breath') {
      const demoTime = Math.min(elapsedSeconds, 7.2)
      renderFrame(frameFor('breath', demoTime))
      if (demoTime >= 7.2) return
    } else if (demoMode === 'approach') {
      const demoTime = Math.min(elapsedSeconds, 8.4)
      renderFrame(frameFor('approach', demoTime))
      if (demoTime >= 8.4) return
    } else {
      renderFrame()
    }

    animationFrame = window.requestAnimationFrame(tick)
  }

  function readNativeScroll() {
    const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    targetScrollProgress = clamp(window.scrollY / maximum)
  }

  function setPointer(clientX, clientY) {
    root.style.setProperty('--pointer-x', `${clientX}px`)
    root.style.setProperty('--pointer-y', `${clientY}px`)
    targetPointerX = clamp((clientX / window.innerWidth - 0.5) * 2, -1, 1)
    targetPointerY = clamp((clientY / window.innerHeight - 0.5) * 2, -1, 1)
  }

  function applyModeClasses() {
    const isDemo = Boolean(demoMode || captureMode)
    body.classList.toggle('is-demo', isDemo)
    body.classList.toggle('is-shot', Boolean(shot))
    body.classList.toggle('has-fine-pointer', finePointerQuery.matches && !isDemo && !shot)
  }

  function renderCaptureAt(seconds, timeline = captureTimeline) {
    captureTime = Math.max(0, Number(seconds) || 0)
    captureTimeline = timeline || 'breath'
    const frame = frameFor(captureTimeline, captureTime)
    pointerX = 0
    pointerY = 0
    renderFrame(frame)
    world.finish()
    return {
      timeline: captureTimeline,
      seconds: captureTime,
      scroll: frame.scroll,
      breath: {
        crackLight: frame.crackLight,
        sideLeft: frame.sideLeft,
        sideRight: frame.sideRight,
        pressurePhase: frame.pressurePhase,
        pressureAmount: frame.pressureAmount,
        armLift: frame.armLift,
        cavityOpen: frame.cavityOpen,
        growth: frame.growth,
        breathIndex: frame.breathIndex,
      },
    }
  }

  function initialize() {
    try {
      world = window.CompleteCoreWorld.create(canvas)
      world.resize()
      body.classList.add('has-webgl')
      applyModeClasses()

      window.__recording = captureMode
      window.__ready = false
      window.__captureDuration = captureTimeline === 'approach' ? 8.4 : 7.2
      window.__setCaptureTime = renderCaptureAt

      window.CompleteBodyBreathing = {
        renderAt(seconds, timeline = 'breath') {
          return renderCaptureAt(seconds, timeline)
        },
        getState() {
          return {
            elapsedSeconds,
            scrollProgress,
            targetScrollProgress,
            captureMode,
            captureTimeline,
            captureTime,
            demoMode,
            shot,
            reducedMotion,
            breath: breathFrame(elapsedSeconds),
            renderer: world.diagnostics(),
          }
        },
      }

      window.SelfAwakeCapture = {
        ready: false,
        async render(payload = {}) {
          const timeline = payload.mode === 'shape' ? 'core' : payload.mode || captureTimeline
          const seconds = Math.max(0, Number(payload.timeMs || 0) / 1000)
          const result = renderCaptureAt(seconds, timeline)
          if (Number.isFinite(payload.scrollProgress)) {
            const frame = {
              ...frameFor(timeline, seconds),
              scroll: clamp(payload.scrollProgress),
            }
            renderFrame(frame)
            world.finish()
            result.scroll = frame.scroll
          }
          await new Promise((resolve) => window.requestAnimationFrame(resolve))
          await new Promise((resolve) => window.requestAnimationFrame(resolve))
          return result
        },
      }

      if (captureMode) {
        renderCaptureAt(initialCaptureTime, captureTimeline)
        window.SelfAwakeCapture.ready = true
        return
      }

      if (shot === 'core') {
        renderCaptureAt(0, 'core')
        return
      }

      if (reducedMotion) {
        renderFrame({
          ...breathFrame(7.2),
          scroll: targetScrollProgress,
        })
        return
      }

      lastFrameAt = performance.now()
      animationFrame = window.requestAnimationFrame(tick)
    } catch (error) {
      console.error('The complete breathing body could not be rendered.', error)
      body.classList.remove('has-webgl')
      body.classList.add('is-fallback')
      status.textContent = '当前浏览器无法显示 WebGL2 核心，已启用静态完整体。'
    }
  }

  window.addEventListener('scroll', readNativeScroll, { passive: true })
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return
    setPointer(event.clientX, event.clientY)
  }, { passive: true })
  window.addEventListener('pointerleave', () => {
    targetPointerX = 0
    targetPointerY = 0
  }, { passive: true })
  window.addEventListener('resize', () => {
    if (!world) return
    world.resize()
    if (captureMode) renderCaptureAt(captureTime, captureTimeline)
    else if (shot === 'core') renderCaptureAt(0, 'core')
    else renderFrame()
  })

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden
    if (!visible) {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
      return
    }

    lastFrameAt = performance.now()
    if (!captureMode && !shot && !animationFrame) animationFrame = window.requestAnimationFrame(tick)
  })

  reducedQuery.addEventListener('change', (event) => {
    reducedMotion = event.matches || params.get('motion') === 'reduce'
    if (reducedMotion) {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
      renderFrame({
        ...breathFrame(7.2),
        scroll: targetScrollProgress,
      })
    } else if (!captureMode && !shot && !animationFrame) {
      lastFrameAt = performance.now()
      animationFrame = window.requestAnimationFrame(tick)
    }
  })

  finePointerQuery.addEventListener('change', applyModeClasses)
  readNativeScroll()
  initialize()
})()
