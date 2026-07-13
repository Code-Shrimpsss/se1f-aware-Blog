(function () {
  'use strict'

  const MEMORY_KEY = 'self-awake-c-v3-enveloping-core'
  const FORMATION_DURATION = 5200
  const DIVE_DURATION = 1850
  const SURFACE_DURATION = 1550
  const FREEZE_DURATION = 1950
  const IMPACT_DURATION = 1450
  const INTENT_LATCH = 210

  const body = document.body
  const canvas = document.querySelector('#consciousness-world')
  const status = document.querySelector('.assistive-status')
  const causalCaption = document.querySelector('.causal-caption')
  const approachCue = document.querySelector('[data-enter-observation]')
  const realityControls = document.querySelector('.reality-controls')
  const soundToggle = document.querySelector('[data-sound-toggle]')
  const soundOutput = soundToggle.querySelector('output')
  const anchorDialog = document.querySelector('#anchor-dialog')
  const readerDialog = document.querySelector('#reader-dialog')
  const archiveSearch = document.querySelector('#archive-search')
  const archiveList = document.querySelector('#archive-list')
  const archiveCount = document.querySelector('.archive-count')
  const readerMeta = document.querySelector('.reader-meta')
  const readerTitle = document.querySelector('#reader-title')
  const readerSummary = document.querySelector('.reader-summary')
  const readerBody = document.querySelector('.reader-body')
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
  const initialParams = new URLSearchParams(window.location.search)

  const content = window.SELF_AWAKE_CONTENT || {
    articles: [],
    themes: [],
    brand: {
      statement: '我试图穿过世界的表象，寻找未被命名的真实。',
    },
  }

  let world
  let frameRequest = 0
  let lastFrameAt = performance.now()
  let worldClock = 0
  let phaseElapsed = 0
  let phase = 'void'
  let formationRate = 1
  let pendingDive = false
  let coreAutoDiveAt = 0
  let frozenAt = 0
  let observedAt = 0
  let lastIntentAt = -Infinity
  let reducedMotion = reducedMotionQuery.matches || initialParams.get('motion') === 'reduce'
  let shotMode = false
  let shotProgress = 0
  let shotWorldTime = 16400
  let archiveMode = 'all'
  let coreDwellStarted = 0
  let coreNear = false
  let fragmentCandidate = null
  let fragmentCandidateAt = 0
  let pointerHoldStarted = 0
  let pointerIsDown = false
  let touchStart = null
  let resizeTimer = 0
  let wheelGestureTimer = 0
  let wheelGestureActive = false
  let wheelGestureLockedUntil = -Infinity
  let memory = loadMemory()

  const pointer = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
    normalizedX: 0.5,
    normalizedY: 0.5,
    pressure: 0,
    active: false,
    movedAt: 0,
  }

  class SpatialAudio {
    constructor() {
      this.context = null
      this.master = null
      this.pressure = null
      this.pressureGain = null
      this.enabled = false
    }

    async enable() {
      if (!this.context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) return false
        this.context = new AudioContext()
        this.master = this.context.createGain()
        this.master.gain.value = 0.0001
        this.master.connect(this.context.destination)

        this.pressure = this.context.createOscillator()
        this.pressure.type = 'sine'
        this.pressure.frequency.value = 43
        this.pressureGain = this.context.createGain()
        this.pressureGain.gain.value = 0.0001
        this.pressure.connect(this.pressureGain)
        this.pressureGain.connect(this.master)
        this.pressure.start()
      }
      await this.context.resume()
      this.enabled = true
      const now = this.context.currentTime
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now)
      this.master.gain.exponentialRampToValueAtTime(0.038, now + 0.8)
      this.pressureGain.gain.exponentialRampToValueAtTime(0.16, now + 1.1)
      return true
    }

    disable() {
      if (!this.context || !this.master) return
      this.enabled = false
      const now = this.context.currentTime
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now)
      this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.34)
    }

    setPhase(nextPhase) {
      if (!this.enabled || !this.context || !this.pressureGain) return
      const now = this.context.currentTime
      const active = ['core', 'core-observed', 'dive', 'surface', 'storm', 'fragment-observed'].includes(nextPhase)
      this.pressureGain.gain.cancelScheduledValues(now)
      this.pressureGain.gain.setValueAtTime(Math.max(0.0001, this.pressureGain.gain.value), now)
      this.pressureGain.gain.exponentialRampToValueAtTime(active ? 0.16 : 0.028, now + 0.45)
      if (nextPhase === 'freeze') this.note(293.66, 0.04, 0.62, -0.4)
      if (nextPhase === 'impact') this.note(73.42, 0.08, 0.9, 0.05)
      if (nextPhase === 'explore') window.setTimeout(() => this.note(329.63, 0.028, 1.2, 0.45), 1100)
    }

    note(frequency, level, duration, pan = 0) {
      if (!this.enabled || !this.context || !this.master) return
      const oscillator = this.context.createOscillator()
      const gain = this.context.createGain()
      const panner = typeof this.context.createStereoPanner === 'function' ? this.context.createStereoPanner() : null
      const now = this.context.currentTime
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(level, now + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
      oscillator.connect(gain)
      if (panner) {
        panner.pan.value = pan
        gain.connect(panner)
        panner.connect(this.master)
      } else {
        gain.connect(this.master)
      }
      oscillator.start(now)
      oscillator.stop(now + duration + 0.08)
    }
  }

  const audio = new SpatialAudio()

  function loadMemory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}')
      return {
        revision: Number(parsed.revision || 0),
        deepCrack: Boolean(parsed.deepCrack),
        reads: Array.isArray(parsed.reads) ? parsed.reads.slice(0, 40) : [],
        scar: parsed.scar && Number.isFinite(parsed.scar.x) && Number.isFinite(parsed.scar.y)
          ? { x: parsed.scar.x, y: parsed.scar.y }
          : null,
      }
    } catch (_) {
      return { revision: 0, deepCrack: false, reads: [], scar: null }
    }
  }

  function saveMemory() {
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(memory))
    } catch (_) {
      // The experience remains fully usable when storage is unavailable.
    }
  }

  function clearMemory() {
    try {
      localStorage.removeItem(MEMORY_KEY)
    } catch (_) {
      // Ignore unavailable storage.
    }
    memory = { revision: 0, deepCrack: false, reads: [], scar: null }
    world.setMemory(memory)
    world.setObservationScar(0.64, 0.46, 0)
    renderArchive()
    announce('当前浏览器中的阅读痕迹与结构变化已清除。')
  }

  function materialType(article) {
    const themes = article.themes || []
    if (themes.includes('authenticity') || article.kind.includes('个人')) return 'inscription'
    if (themes.includes('evidence')) return 'sediment'
    if (themes.includes('time')) return 'pressure'
    if (themes.includes('human-ai') || article.kind.includes('外部')) return 'observation'
    return 'technical'
  }

  function informationFromContent() {
    const items = []
    content.articles.forEach((article) => {
      items.push({ text: article.shortTitle || article.title, year: article.year, type: materialType(article) })
      const excerpt = String(article.excerpt || '')
      if (excerpt) items.push({ text: excerpt.slice(0, 18), year: article.year, type: materialType(article) })
    })
    return items
  }

  function announce(message, visibleMessage = '') {
    status.textContent = message
    causalCaption.textContent = visibleMessage
  }

  function setPhase(nextPhase, options = {}) {
    phase = nextPhase
    phaseElapsed = Number(options.elapsed || 0)
    body.dataset.phase = nextPhase
    realityControls.inert = ['void', 'point', 'formation'].includes(nextPhase)
    audio.setPhase(nextPhase)

    if (nextPhase === 'void') announce('黑暗尚未确定任何位置。')
    if (nextPhase === 'point') announce('黑暗中出现一个位置。')
    if (nextPhase === 'formation') announce('空间切面正在留下意识结构。')
    if (nextPhase === 'core') announce('白色意识核心已经形成。滚动、向下键或轻触“继续靠近”进入观象。')
    if (nextPhase === 'core-observed') announce('你的停留使核心局部停止呼吸。', '这里暂时不再呼吸。')
    if (nextPhase === 'dive') announce('镜头正在靠近同一个意识核心。')
    if (nextPhase === 'surface') announce('意识核心的外壳成为无边界地貌。')
    if (nextPhase === 'storm') {
      world.setObservedFragment(null)
      announce('外界信息正在经过意识表面。停留观看其中一个碎片。')
    }
    if (nextPhase === 'fragment-observed') announce('被观看的碎片改变了速度。再次滚动、按键或轻触以冻结空间。', '它没有继续远离。再次推进。')
    if (nextPhase === 'freeze') announce('信息风暴在同一瞬间冻结，只有被看见的碎片继续移动。', '')
    if (nextPhase === 'impact') announce('唯一碎片撞击表面，形成最深的裂缝。', '')
    if (nextPhase === 'explore') {
      announce('时间已经恢复，其他信息消散；最深的裂缝仍然留在意识表面。', '世界恢复以后，裂缝仍在。')
      body.classList.add('is-imprint-visible')
      memory.deepCrack = true
      memory.revision = Math.max(memory.revision, world.getDiagnostics().irreversibleRevision)
      if (!shotMode) saveMemory()
      world.setMemory(memory)
    } else if (nextPhase !== 'impact') {
      body.classList.remove('is-imprint-visible')
    }
  }

  function currentProgress() {
    if (shotMode) return shotProgress
    if (phase === 'void') return Math.min(1, phaseElapsed / 1100)
    if (phase === 'point') return Math.min(1, phaseElapsed / 820)
    if (phase === 'formation') return Math.min(1, phaseElapsed / FORMATION_DURATION)
    if (phase === 'dive') return Math.min(1, phaseElapsed / DIVE_DURATION)
    if (phase === 'surface') return Math.min(1, phaseElapsed / SURFACE_DURATION)
    if (phase === 'storm') return Math.min(1, phaseElapsed / 4800)
    if (phase === 'fragment-observed') return Math.min(1, phaseElapsed / 2600)
    if (phase === 'freeze') return Math.min(1, phaseElapsed / FREEZE_DURATION)
    if (phase === 'impact') return Math.min(1, phaseElapsed / IMPACT_DURATION)
    return 1
  }

  function renderFrame() {
    const renderTime = shotMode
      ? shotWorldTime
      : reducedMotion
        ? {
            core: 9600,
            'core-observed': 10200,
            surface: 11800,
            storm: 14600,
            'fragment-observed': 14600,
            freeze: 14600,
            impact: 14600,
            explore: 14600,
          }[phase] || worldClock
        : worldClock

    world.render({
      phase,
      progress: currentProgress(),
      time: renderTime,
      frozenAt: frozenAt || renderTime,
      observedAt: observedAt || renderTime,
      reducedMotion,
    })
  }

  function advanceAutomaticStates() {
    if (shotMode || reducedMotion) return

    if (phase === 'void' && phaseElapsed >= 700 + (memory.revision % 5) * 73) {
      setPhase('point')
    } else if (phase === 'point' && phaseElapsed >= 820) {
      setPhase('formation')
    } else if (phase === 'formation' && phaseElapsed >= FORMATION_DURATION) {
      formationRate = 1
      setPhase('core')
      if (pendingDive) coreAutoDiveAt = worldClock + 320
    } else if (phase === 'core' && coreAutoDiveAt && worldClock >= coreAutoDiveAt) {
      coreAutoDiveAt = 0
      pendingDive = false
      setPhase('dive')
    } else if (phase === 'core-observed' && coreAutoDiveAt && worldClock >= coreAutoDiveAt) {
      coreAutoDiveAt = 0
      pendingDive = false
      setPhase('dive')
    } else if (phase === 'dive' && phaseElapsed >= DIVE_DURATION) {
      setPhase('surface')
    } else if (phase === 'surface' && phaseElapsed >= SURFACE_DURATION) {
      setPhase('storm')
    } else if (phase === 'storm' && phaseElapsed >= 8200 && world.getDiagnostics().observedFragmentId == null) {
      const fallback = world.pickFragment(window.innerWidth * 0.5, window.innerHeight * 0.48, Math.max(window.innerWidth, window.innerHeight))
      if (fallback) markFragmentObserved(fallback)
    } else if (phase === 'fragment-observed' && phaseElapsed >= 4200) {
      beginFreeze()
    } else if (phase === 'freeze' && phaseElapsed >= FREEZE_DURATION) {
      setPhase('impact')
    } else if (phase === 'impact' && phaseElapsed >= IMPACT_DURATION) {
      setPhase('explore')
    }
  }

  function updateCoreDwell() {
    if (phase !== 'core' || !pointer.active) {
      if (phase !== 'core') coreDwellStarted = 0
      return
    }

    const target = window.innerWidth <= 760 ? { x: 0.51, y: 0.4, radius: 0.32 } : { x: 0.55, y: 0.48, radius: 0.3 }
    const dx = pointer.normalizedX - target.x
    const dy = (pointer.normalizedY - target.y) * (window.innerHeight / Math.max(1, window.innerWidth))
    coreNear = Math.hypot(dx, dy) < target.radius
    body.classList.toggle('is-core-near', coreNear)

    if (!coreNear) {
      coreDwellStarted = 0
      pointer.pressure = Math.max(0, pointer.pressure - 0.04)
      return
    }

    if (!coreDwellStarted) coreDwellStarted = worldClock
    const dwell = worldClock - coreDwellStarted
    pointer.pressure = Math.min(1, dwell / 680)
    if (dwell >= 680) {
      world.setObservationScar(pointer.normalizedX, pointer.normalizedY, 1)
      memory.scar = { x: pointer.normalizedX, y: pointer.normalizedY }
      setPhase('core-observed')
    }
  }

  function updateFragmentDwell() {
    if (phase !== 'storm') {
      fragmentCandidate = null
      fragmentCandidateAt = 0
      return
    }

    if (pointerIsDown && pointerHoldStarted && worldClock - pointerHoldStarted >= 720) {
      const held = world.pickFragment(pointer.x, pointer.y, window.innerWidth <= 760 ? 230 : 170)
      if (held) {
        markFragmentObserved(held)
        pointerHoldStarted = 0
        return
      }
    }

    if (!finePointerQuery.matches || !pointer.active) return
    const picked = world.pickFragment(pointer.x, pointer.y, 150)
    if (!picked) {
      fragmentCandidate = null
      fragmentCandidateAt = 0
      return
    }

    if (!fragmentCandidate || fragmentCandidate.id !== picked.id) {
      fragmentCandidate = picked
      fragmentCandidateAt = worldClock
      return
    }

    if (worldClock - fragmentCandidateAt >= 760) markFragmentObserved(fragmentCandidate)
  }

  function tick(now) {
    const delta = Math.min(40, Math.max(0, now - lastFrameAt))
    lastFrameAt = now
    if (!shotMode) {
      worldClock += delta
      if (!reducedMotion) phaseElapsed += delta * (phase === 'formation' ? formationRate : 1)
    }

    if (!shotMode) {
      updateCoreDwell()
      updateFragmentDwell()
    }
    advanceAutomaticStates()
    world.setPointer(pointer.normalizedX, pointer.normalizedY, pointer.pressure, pointer.active)
    document.documentElement.style.setProperty('--cursor-pressure', pointer.pressure.toFixed(3))
    renderFrame()
    frameRequest = requestAnimationFrame(tick)
  }

  function requestApproach() {
    if (['void', 'point', 'formation'].includes(phase)) {
      pendingDive = true
      formationRate = 6
      if (phase !== 'formation') setPhase('formation')
      return
    }

    if (phase === 'core' || phase === 'core-observed') {
      if (reducedMotion) {
        setPhase('surface')
      } else {
        setPhase('dive')
      }
    }
  }

  function markFragmentObserved(fragment) {
    if (!fragment || phase !== 'storm') return
    world.setObservedFragment(fragment.id)
    observedAt = worldClock
    setPhase('fragment-observed')
  }

  function selectCentralFragment() {
    const fragment = world.pickFragment(window.innerWidth * 0.5, window.innerHeight * 0.5, Math.max(window.innerWidth, window.innerHeight))
    if (fragment) markFragmentObserved(fragment)
  }

  function beginFreeze() {
    if (phase !== 'fragment-observed') return
    frozenAt = worldClock
    setPhase('freeze')
  }

  function reducedStep() {
    if (phase === 'core' || phase === 'core-observed') setPhase('surface')
    else if (phase === 'surface') setPhase('storm', { elapsed: 4800 })
    else if (phase === 'storm') {
      selectCentralFragment()
      if (phase === 'fragment-observed') {
        frozenAt = worldClock
        shotProgress = 0.62
      }
    } else if (phase === 'fragment-observed') beginFreeze()
    else if (phase === 'freeze') setPhase('impact', { elapsed: IMPACT_DURATION * 0.78 })
    else if (phase === 'impact') setPhase('explore')
  }

  function handleIntent(direction = 1) {
    const now = performance.now()
    if (now - lastIntentAt < INTENT_LATCH) return
    lastIntentAt = now

    if (direction < 0) {
      if (phase === 'explore') setPhase('core')
      return
    }

    if (reducedMotion) {
      reducedStep()
      return
    }

    if (['void', 'point', 'formation', 'core', 'core-observed'].includes(phase)) {
      requestApproach()
    } else if (phase === 'storm') {
      if (world.getDiagnostics().observedFragmentId == null) selectCentralFragment()
    } else if (phase === 'fragment-observed') {
      beginFreeze()
    } else if (phase === 'explore') {
      world.surfaceOffset = Math.min(1.8, world.surfaceOffset + 0.16)
    }
  }

  function onWheel(event) {
    if (body.classList.contains('is-dialog-open')) return
    if (Math.abs(event.deltaY) < 4) return
    event.preventDefault()
    const now = performance.now()
    window.clearTimeout(wheelGestureTimer)
    wheelGestureTimer = window.setTimeout(() => {
      wheelGestureActive = false
    }, 420)
    if (wheelGestureActive || now < wheelGestureLockedUntil) return
    wheelGestureActive = true
    wheelGestureLockedUntil = now + 2400
    handleIntent(Math.sign(event.deltaY))
  }

  function isInteractiveTarget(target) {
    return target instanceof Element && Boolean(target.closest('button, a, input, textarea, select, dialog, [contenteditable="true"]'))
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      if (readerDialog.open) {
        closeDialog(readerDialog)
      } else if (anchorDialog.open) {
        closeDialog(anchorDialog)
      } else {
        openAnchor()
      }
      return
    }

    if (body.classList.contains('is-dialog-open') || isInteractiveTarget(event.target)) return
    if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(event.key)) {
      event.preventDefault()
      handleIntent(1)
    } else if (['ArrowUp', 'PageUp'].includes(event.key)) {
      event.preventDefault()
      handleIntent(-1)
    }
  }

  function updatePointer(clientX, clientY, active = true) {
    const previousX = pointer.x
    const previousY = pointer.y
    pointer.x = clientX
    pointer.y = clientY
    pointer.normalizedX = Math.max(0, Math.min(1, clientX / Math.max(1, window.innerWidth)))
    pointer.normalizedY = Math.max(0, Math.min(1, clientY / Math.max(1, window.innerHeight)))
    pointer.active = active
    if (Math.hypot(previousX - clientX, previousY - clientY) > 3) {
      pointer.movedAt = worldClock
      if (phase === 'core') coreDwellStarted = 0
    }
    document.documentElement.style.setProperty('--px', (pointer.normalizedX - 0.5).toFixed(4))
    document.documentElement.style.setProperty('--py', (pointer.normalizedY - 0.5).toFixed(4))
    document.documentElement.style.setProperty('--cursor-x', `${clientX}px`)
    document.documentElement.style.setProperty('--cursor-y', `${clientY}px`)
    document.documentElement.style.setProperty('--cursor-pressure', pointer.pressure.toFixed(3))

    const surfaceDistance = Math.hypot(pointer.normalizedX - 0.28, pointer.normalizedY - 0.75)
    const surfaceAware = ['surface', 'storm', 'fragment-observed', 'freeze', 'impact', 'explore'].includes(phase) && surfaceDistance < 0.26
    body.classList.toggle('is-surface-aware', surfaceAware)
    if (phase === 'explore') body.classList.toggle('is-imprint-visible', surfaceDistance < 0.3 || window.innerWidth <= 760)
  }

  function onPointerMove(event) {
    if (body.classList.contains('is-dialog-open')) return
    const interactive = event.target instanceof Element
      ? event.target.closest('button, a, input, textarea, select, [contenteditable="true"]')
      : null
    const worldTarget = interactive && interactive.closest('.approach-cue, .imprint-entry')
    body.classList.toggle('is-ui-hover', Boolean(interactive && !worldTarget))
    updatePointer(event.clientX, event.clientY, true)
  }

  function onPointerDown(event) {
    if (body.classList.contains('is-dialog-open')) return
    pointerIsDown = true
    pointerHoldStarted = worldClock
    updatePointer(event.clientX, event.clientY, true)
  }

  function onPointerUp() {
    pointerIsDown = false
    pointerHoldStarted = 0
  }

  function onTouchStart(event) {
    if (body.classList.contains('is-dialog-open') || !event.touches.length) return
    const touch = event.touches[0]
    touchStart = { x: touch.clientX, y: touch.clientY, at: performance.now() }
    pointerIsDown = true
    pointerHoldStarted = worldClock
    updatePointer(touch.clientX, touch.clientY, true)
  }

  function onTouchMove(event) {
    if (body.classList.contains('is-dialog-open') || !event.touches.length) return
    const touch = event.touches[0]
    updatePointer(touch.clientX, touch.clientY, true)
  }

  function onTouchEnd(event) {
    if (!touchStart || body.classList.contains('is-dialog-open')) return
    const touch = event.changedTouches[0]
    const deltaY = touchStart.y - touch.clientY
    const deltaX = touchStart.x - touch.clientX
    const duration = performance.now() - touchStart.at
    pointerIsDown = false
    pointerHoldStarted = 0
    if (duration < 850 && Math.abs(deltaY) > 48 && Math.abs(deltaY) > Math.abs(deltaX)) {
      handleIntent(deltaY > 0 ? 1 : -1)
    }
    touchStart = null
  }

  function openDialog(dialog) {
    if (dialog.open) return
    body.classList.add('is-dialog-open')
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
  }

  function closeDialog(dialog) {
    if (!dialog.open) return
    if (typeof dialog.close === 'function') dialog.close()
    else dialog.removeAttribute('open')
    if (!anchorDialog.open && !readerDialog.open) body.classList.remove('is-dialog-open')
  }

  function openAnchor(mode = archiveMode) {
    archiveMode = mode
    renderArchive()
    openDialog(anchorDialog)
    window.setTimeout(() => {
      if (mode === 'search') archiveSearch.focus()
    }, 50)
  }

  function normalizedArticleText(article) {
    return [
      article.title,
      article.shortTitle,
      article.summary,
      article.excerpt,
      article.date,
      article.year,
      article.kind,
      article.status,
      ...(article.themes || []),
    ].join(' ').toLocaleLowerCase('zh-CN')
  }

  function visibleArticles() {
    const query = archiveSearch.value.trim().toLocaleLowerCase('zh-CN')
    let articles = content.articles.slice()
    if (archiveMode === 'time') articles.sort((a, b) => b.date.localeCompare(a.date))
    if (query) articles = articles.filter((article) => normalizedArticleText(article).includes(query))
    return articles
  }

  function renderArchive() {
    const articles = visibleArticles()
    archiveList.replaceChildren()
    articles.forEach((article) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'archive-item'
      button.dataset.articleId = article.id
      const year = document.createElement('span')
      year.textContent = article.year
      const title = document.createElement('strong')
      title.textContent = article.title
      const meta = document.createElement('small')
      const readMark = memory.reads.includes(article.id) ? ' · 已留下痕迹' : ''
      meta.textContent = `${article.kind} · ${article.status}${readMark}`
      button.append(year, title, meta)
      archiveList.append(button)
    })
    archiveCount.textContent = `${articles.length} 篇`
  }

  function openArticle(articleId) {
    const article = content.articles.find((item) => item.id === articleId)
    if (!article) return
    closeDialog(anchorDialog)
    readerMeta.textContent = `${article.date} / ${article.kind} / ${article.minutes} 分钟 / ${article.status}`
    readerTitle.textContent = article.title
    readerSummary.textContent = article.summary
    readerBody.replaceChildren()
    article.paragraphs.forEach((paragraph) => {
      const element = document.createElement('p')
      element.textContent = paragraph
      readerBody.append(element)
    })
    memory.reads = [article.id, ...memory.reads.filter((id) => id !== article.id)].slice(0, 40)
    saveMemory()
    openDialog(readerDialog)
  }

  function applyShotMode() {
    const params = new URLSearchParams(window.location.search)
    const shot = params.get('shot')
    if (!shot) return false

    shotMode = true
    body.classList.add('is-shot-mode')
    pointer.active = true
    const aliases = {
      prologue: 'core',
      'desktop-prologue': 'core',
      'mobile-prologue': 'core',
      approach: 'dive',
      observation: 'storm',
      observe: 'storm',
      reveal: 'explore',
      'desktop-observation': 'storm',
      'mobile-observation': 'storm',
    }
    const target = aliases[shot] || shot
    const allowed = ['formation', 'core', 'core-observed', 'dive', 'surface', 'storm', 'fragment-observed', 'freeze', 'impact', 'explore']
    const next = allowed.includes(target) ? target : 'core'
    const settings = {
      formation: { progress: 0.65, time: 7200, x: 0.5, y: 0.5 },
      core: { progress: 1, time: 10600, x: 0.48, y: 0.46 },
      'core-observed': { progress: 1, time: 11200, x: 0.62, y: 0.46 },
      dive: { progress: 0.35, time: 12400, x: 0.47, y: 0.49 },
      surface: { progress: 0.86, time: 13200, x: 0.55, y: 0.47 },
      storm: { progress: 0.76, time: 16800, x: 0.44, y: 0.42 },
      'fragment-observed': { progress: 0.62, time: 17600, x: 0.5, y: 0.5 },
      freeze: { progress: 0.72, time: 18400, x: 0.5, y: 0.5 },
      impact: { progress: 0.78, time: 19100, x: 0.53, y: 0.58 },
      explore: { progress: 1, time: 20400, x: 0.28, y: 0.75 },
    }[next]
    shotProgress = settings.progress
    shotWorldTime = settings.time
    updatePointer(window.innerWidth * settings.x, window.innerHeight * settings.y, true)
    if (['fragment-observed', 'freeze', 'impact'].includes(next)) {
      world.setObservedFragment(7)
      observedAt = 16800
      frozenAt = 17600
    }
    if (next === 'explore' || next === 'impact') {
      memory.deepCrack = true
      world.setMemory(memory)
      body.classList.add('is-imprint-visible')
      if (next === 'explore') body.classList.add('is-surface-aware')
    }
    setPhase(next)
    return true
  }

  function jumpTo(next) {
    const allowed = ['formation', 'core', 'core-observed', 'dive', 'surface', 'storm', 'fragment-observed', 'freeze', 'impact', 'explore']
    if (!allowed.includes(next)) throw new Error(`Unknown V3 state: ${next}`)
    shotMode = false
    if (['fragment-observed', 'freeze', 'impact'].includes(next) && world.getDiagnostics().observedFragmentId == null) {
      world.setObservedFragment(7)
      observedAt = worldClock
    }
    if (next === 'freeze') frozenAt = worldClock
    setPhase(next)
  }

  function bindEvents() {
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerUp, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        world.resize()
        updatePointer(
          Math.min(pointer.x, window.innerWidth),
          Math.min(pointer.y, window.innerHeight),
          pointer.active,
        )
        renderFrame()
      }, 120)
    })

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        body.classList.add('is-paused')
        cancelAnimationFrame(frameRequest)
        frameRequest = 0
      } else {
        body.classList.remove('is-paused')
        lastFrameAt = performance.now()
        if (!frameRequest) frameRequest = requestAnimationFrame(tick)
      }
    })

    reducedMotionQuery.addEventListener('change', (event) => {
      reducedMotion = event.matches || initialParams.get('motion') === 'reduce'
      if (reducedMotion && ['void', 'point', 'formation'].includes(phase)) setPhase('core')
      renderFrame()
    })

    finePointerQuery.addEventListener('change', (event) => {
      body.classList.toggle('has-fine-pointer', event.matches)
    })

    approachCue.addEventListener('click', requestApproach)
    document.querySelectorAll('[data-open-anchor]').forEach((button) => button.addEventListener('click', () => openAnchor()))
    document.querySelectorAll('[data-close-anchor]').forEach((button) => button.addEventListener('click', () => closeDialog(anchorDialog)))
    document.querySelectorAll('[data-close-reader]').forEach((button) => button.addEventListener('click', () => closeDialog(readerDialog)))
    document.querySelectorAll('[data-clear-memory]').forEach((button) => button.addEventListener('click', clearMemory))
    document.querySelectorAll('[data-return-core]').forEach((button) => button.addEventListener('click', () => {
      closeDialog(anchorDialog)
      setPhase('core')
    }))
    document.querySelector('[data-open-imprint]').addEventListener('click', () => openArticle('agent-architecture'))

    document.querySelectorAll('[data-anchor-view]').forEach((button) => button.addEventListener('click', () => {
      const view = button.dataset.anchorView
      archiveMode = view === 'time' ? 'time' : 'all'
      archiveSearch.value = ''
      renderArchive()
      if (view === 'search') archiveSearch.focus()
      else archiveList.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' })
    }))

    archiveSearch.addEventListener('input', renderArchive)
    archiveList.addEventListener('click', (event) => {
      const item = event.target.closest('[data-article-id]')
      if (item) openArticle(item.dataset.articleId)
    })

    ;[anchorDialog, readerDialog].forEach((dialog) => dialog.addEventListener('close', () => {
      if (!anchorDialog.open && !readerDialog.open) body.classList.remove('is-dialog-open')
    }))

    soundToggle.addEventListener('click', async () => {
      if (audio.enabled) {
        audio.disable()
        soundToggle.setAttribute('aria-pressed', 'false')
        soundOutput.textContent = '关闭'
      } else {
        const enabled = await audio.enable()
        soundToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false')
        soundOutput.textContent = enabled ? '开启' : '不可用'
        if (enabled) audio.setPhase(phase)
      }
    })
  }

  function initialize() {
    try {
      world = window.SelfAwakeWorld.create(canvas, {
        memoryRevision: memory.revision,
      })
      world.setInformation(informationFromContent())
      world.setMemory(memory)
      if (memory.scar) world.setObservationScar(memory.scar.x, memory.scar.y, 1)
      body.classList.add('is-enhanced', 'canvas-active')
      body.classList.toggle('has-fine-pointer', finePointerQuery.matches)
      realityControls.inert = true
      renderArchive()
      bindEvents()

      if (reducedMotion) setPhase('core')
      else setPhase('void')
      applyShotMode()
      lastFrameAt = performance.now()
      frameRequest = requestAnimationFrame(tick)

      window.SelfAwakeV3 = {
        getState() {
          return {
            phase,
            progress: currentProgress(),
            worldClock,
            reducedMotion,
            shotMode,
            memory: { ...memory, reads: memory.reads.slice() },
            renderer: world.getDiagnostics(),
          }
        },
        jumpTo,
        advance: () => handleIntent(1),
        returnToCore: () => setPhase('core'),
        selectFragment: selectCentralFragment,
        clearMemory,
        render: renderFrame,
      }
    } catch (error) {
      console.error('Self-Awake V3 could not initialize its visual world.', error)
      body.classList.remove('is-enhanced', 'canvas-active')
      body.dataset.phase = 'fallback'
    }
  }

  initialize()
})()
