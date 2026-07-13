(function () {
  'use strict'

  const content = window.SELF_AWAKE_CONTENT
  const canvas = document.querySelector('#core-canvas')
  const journey = document.querySelector('#journey')
  const stage = document.querySelector('#stage')
  const edgeEntry = document.querySelector('#edge-entry')
  const indexDialog = document.querySelector('#index-dialog')
  const readerDialog = document.querySelector('#reader-dialog')
  const layerArrival = document.querySelector('#layer-arrival')
  const spaceStatus = document.querySelector('#space-status')
  const dwellTrigger = document.querySelector('[data-dwell-trigger]')
  const dwellStatus = document.querySelector('#dwell-status')
  const signatureMoment = document.querySelector('.signature-moment')
  const foldSeam = document.querySelector('[data-enter-seam]')
  const reflectionQuestion = document.querySelector('#reflection-question')
  const statePanels = Array.from(document.querySelectorAll('[data-state-panel]'))
  const readCount = document.querySelector('#read-count')
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const coarsePointerQuery = window.matchMedia('(pointer: coarse)')
  const memoryKey = 'self-awake-c2-memory-v1'
  const dwellDuration = 2400
  const layerNames = ['', '观象', '构序', '观心', '见性']

  if (!content || !Array.isArray(content.articles) || !journey || !stage) {
    document.documentElement.classList.add('runtime-failed')
    return
  }

  const state = {
    current: 0,
    visual: 0,
    reduced: reducedMotionQuery.matches,
    coarse: coarsePointerQuery.matches,
    visible: !document.hidden,
    programmaticScrollUntil: 0,
    scrollFrame: 0,
    wheelConsumed: false,
    wheelEndTimer: 0,
    touchStartY: null,
    touchLastY: null,
    layerTimer: 0,
    dwellTimer: 0,
    dwellStartedAt: 0,
    dwellRemaining: dwellDuration,
    dwellActive: false,
    dwellLocked: false,
    frozenBreath: 0,
    signatureReady: false,
    signatureReadyAt: 0,
    seamFocusTimer: 0,
    openingReaderFrom: null,
    readerFromSeam: false,
    preferredRelatedId: null,
    canvas: {
      context: null,
      width: 0,
      height: 0,
      dpr: 1,
      raf: 0,
      formation: 0,
      lastTime: 0,
    },
    memory: loadMemory(),
  }

  function loadMemory() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(memoryKey) || 'null')
      return {
        read: Array.isArray(parsed && parsed.read)
          ? parsed.read.filter((id) => content.articles.some((article) => article.id === id)).slice(-12)
          : [],
        syncSeen: Boolean(parsed && parsed.syncSeen),
      }
    } catch (_error) {
      return { read: [], syncSeen: false }
    }
  }

  function saveMemory() {
    try {
      window.localStorage.setItem(memoryKey, JSON.stringify(state.memory))
    } catch (_error) {
      // Private browsing can reject storage; the experience remains fully usable.
    }
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value))
  }

  function easeOutQuint(value) {
    return 1 - Math.pow(1 - clamp(value, 0, 1), 5)
  }

  function escapeText(value) {
    return String(value == null ? '' : value)
  }

  function isDialogOpen() {
    return Boolean(indexDialog.open || readerDialog.open)
  }

  function exactStateTop(index) {
    const maximum = Math.max(0, journey.offsetHeight - window.innerHeight)
    return maximum * (clamp(index, 0, 4) / 4)
  }

  function setPanelAccess() {
    statePanels.forEach((panel) => {
      const panelState = Number(panel.dataset.statePanel)
      const active = panelState === state.current
      panel.setAttribute('aria-hidden', String(!active))
      panel.inert = !active
    })

    const signatureActive = state.current === 2 && state.signatureReady
    signatureMoment.setAttribute('aria-hidden', String(!signatureActive))
    signatureMoment.inert = !signatureActive
    foldSeam.tabIndex = signatureActive ? 0 : -1

    const isReflection = state.current === 4
    if (isReflection) {
      edgeEntry.setAttribute('aria-hidden', 'true')
      edgeEntry.tabIndex = -1
      signatureMoment.inert = true
      statePanels.forEach((panel) => { panel.inert = true })
    } else {
      edgeEntry.removeAttribute('aria-hidden')
      edgeEntry.tabIndex = 0
    }
  }

  function announceLayer(index) {
    window.clearTimeout(state.layerTimer)
    layerArrival.classList.remove('is-visible')

    if (!layerNames[index]) {
      layerArrival.textContent = ''
      return
    }

    layerArrival.textContent = layerNames[index]
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => layerArrival.classList.add('is-visible'))
    })
    state.layerTimer = window.setTimeout(() => {
      layerArrival.classList.remove('is-visible')
    }, 1200)
  }

  function resetSignature() {
    cancelDwell(true)
    window.clearTimeout(state.seamFocusTimer)
    state.signatureReady = false
    state.signatureReadyAt = 0
    state.dwellRemaining = dwellDuration
    state.dwellLocked = false
    document.body.classList.remove('signature-ready', 'is-entering-seam')
    dwellStatus.textContent = ''
    setPanelAccess()
  }

  function setState(next, options) {
    const settings = Object.assign({ announce: true, scroll: false }, options)
    const index = clamp(Math.round(next), 0, 4)
    const changed = index !== state.current

    if (state.current === 2 && index !== 2) resetSignature()
    state.current = index
    document.body.dataset.state = String(index)
    setPanelAccess()

    if (changed && settings.announce) announceLayer(index)
    if (index === 4) updateReflectionQuestion()

    if (settings.scroll) {
      state.programmaticScrollUntil = performance.now() + (state.reduced ? 80 : 1150)
      window.scrollTo({
        top: exactStateTop(index),
        behavior: state.reduced ? 'auto' : 'smooth',
      })
    }

    if (state.reduced) drawFrame(performance.now(), true)
  }

  function goState(index) {
    if (isDialogOpen() || document.body.classList.contains('is-entering-seam')) return
    setState(index, { scroll: true })
  }

  function updateStateFromScroll() {
    state.scrollFrame = 0
    if (performance.now() < state.programmaticScrollUntil || isDialogOpen()) return
    const maximum = Math.max(1, journey.offsetHeight - window.innerHeight)
    const inferred = clamp(Math.round((window.scrollY / maximum) * 4), 0, 4)
    if (inferred !== state.current) setState(inferred, { announce: true, scroll: false })
  }

  function onScroll() {
    if (!state.scrollFrame) state.scrollFrame = window.requestAnimationFrame(updateStateFromScroll)
  }

  function onWheel(event) {
    if (isDialogOpen() || Math.abs(event.deltaY) < 5) return
    event.preventDefault()
    window.clearTimeout(state.wheelEndTimer)
    state.wheelEndTimer = window.setTimeout(() => { state.wheelConsumed = false }, 230)
    if (state.wheelConsumed) return
    state.wheelConsumed = true
    goState(state.current + (event.deltaY > 0 ? 1 : -1))
  }

  function onKeydown(event) {
    if (isDialogOpen()) return
    const target = event.target
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return

    if (event.key === 'ArrowDown' || event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey)) {
      event.preventDefault()
      goState(state.current + 1)
    } else if (event.key === 'ArrowUp' || event.key === 'PageUp' || (event.key === ' ' && event.shiftKey)) {
      event.preventDefault()
      goState(state.current - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      goState(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      goState(4)
    }
  }

  function onTouchStart(event) {
    if (isDialogOpen() || event.touches.length !== 1) return
    state.touchStartY = event.touches[0].clientY
    state.touchLastY = state.touchStartY
  }

  function onTouchMove(event) {
    if (isDialogOpen() || state.touchStartY == null || event.touches.length !== 1) return
    state.touchLastY = event.touches[0].clientY
    if (Math.abs(state.touchLastY - state.touchStartY) > 8) event.preventDefault()
  }

  function onTouchEnd() {
    if (state.touchStartY == null || state.touchLastY == null || isDialogOpen()) return
    const distance = state.touchStartY - state.touchLastY
    state.touchStartY = null
    state.touchLastY = null
    if (Math.abs(distance) >= 42) goState(state.current + (distance > 0 ? 1 : -1))
  }

  function startDwell(options) {
    const settings = Object.assign({ lock: false }, options)
    if (state.current !== 2 || state.signatureReady || state.dwellActive || !state.visible) return
    state.dwellLocked = state.dwellLocked || settings.lock
    state.dwellActive = true
    state.dwellStartedAt = performance.now()
    state.frozenBreath = Math.sin(state.dwellStartedAt / 930)
    document.body.classList.add('is-dwelling')
    dwellStatus.textContent = ''
    state.dwellTimer = window.setTimeout(completeDwell, state.dwellRemaining)
  }

  function pauseDwell() {
    if (!state.dwellActive) return
    const elapsed = performance.now() - state.dwellStartedAt
    state.dwellRemaining = Math.max(0, state.dwellRemaining - elapsed)
    window.clearTimeout(state.dwellTimer)
    state.dwellTimer = 0
    state.dwellActive = false
    document.body.classList.remove('is-dwelling')
  }

  function resumeDwellIfHeld() {
    const held = state.dwellLocked || dwellTrigger.matches(':hover') || document.activeElement === dwellTrigger
    if (state.current === 2 && held && !state.signatureReady) startDwell({ lock: state.dwellLocked })
  }

  function cancelDwell(resetRemaining) {
    window.clearTimeout(state.dwellTimer)
    state.dwellTimer = 0
    state.dwellActive = false
    document.body.classList.remove('is-dwelling')
    if (resetRemaining) state.dwellRemaining = dwellDuration
  }

  function completeDwell() {
    if (state.current !== 2 || !state.visible) return
    const keyboardHeld = document.activeElement === dwellTrigger
    state.dwellTimer = 0
    state.dwellActive = false
    state.dwellRemaining = 0
    state.signatureReady = true
    state.signatureReadyAt = performance.now()
    document.body.classList.remove('is-dwelling')
    document.body.classList.add('signature-ready')
    state.memory.syncSeen = true
    saveMemory()
    dwellStatus.textContent = '远端年份以同一节律回应。'
    spaceStatus.textContent = '2022 与 2026 的两个表面已经靠近，中间出现一道可进入的裂缝。'
    setPanelAccess()

    if (keyboardHeld || state.dwellLocked) {
      state.seamFocusTimer = window.setTimeout(() => foldSeam.focus(), state.reduced ? 50 : 760)
    }
  }

  function onDwellPointerEnter() {
    if (!state.coarse) startDwell()
  }

  function onDwellPointerLeave() {
    if (state.coarse || state.dwellLocked || document.activeElement === dwellTrigger || state.signatureReady) return
    cancelDwell(true)
  }

  function onDwellFocus() {
    startDwell()
  }

  function onDwellBlur() {
    if (state.coarse || state.dwellLocked || dwellTrigger.matches(':hover') || state.signatureReady) return
    cancelDwell(true)
  }

  function onDwellClick(event) {
    event.preventDefault()
    event.stopPropagation()
    if (state.signatureReady) return

    if (state.coarse) {
      state.dwellLocked = !state.dwellLocked
      if (state.dwellLocked) startDwell({ lock: true })
      else cancelDwell(true)
    } else if (!state.dwellActive) {
      startDwell({ lock: document.activeElement === dwellTrigger })
    }
  }

  function enterSeam() {
    if (!state.signatureReady || state.current !== 2) return
    document.body.classList.add('is-entering-seam')
    signatureMoment.inert = true
    spaceStatus.textContent = '视角正在穿过两个年份之间的裂缝。'
    window.setTimeout(() => {
      document.body.classList.remove('is-entering-seam')
      state.readerFromSeam = true
      openArticle('efficiency-silence', foldSeam, 'unnamed-real')
    }, state.reduced ? 80 : 720)
  }

  function deriveReflectionQuestion() {
    const reads = state.memory.read
    const last = reads[reads.length - 1]
    if (last === 'efficiency-silence') return '效率退场后，你会停在哪里？'
    if (last === 'unnamed-real') return '你是在找答案，还是逃避改变？'
    if (state.memory.syncSeen && reads.length > 1) return '哪些旧问题仍在决定今天？'
    return '你仍愿意为哪一个选择负责？'
  }

  function updateReflectionQuestion() {
    reflectionQuestion.textContent = deriveReflectionQuestion()
  }

  function makeArticleButton(article) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'index-article'
    button.dataset.openArticle = article.id
    if (state.memory.read.includes(article.id)) button.classList.add('is-read')

    const time = document.createElement('time')
    time.dateTime = article.date
    time.textContent = article.year
    const title = document.createElement('strong')
    title.textContent = article.shortTitle || article.title
    const kind = document.createElement('small')
    kind.textContent = article.prototype ? '原型内容' : article.kind
    button.append(time, title, kind)
    return button
  }

  function renderArticleList(container, articles) {
    const fragment = document.createDocumentFragment()
    articles.forEach((article) => fragment.append(makeArticleButton(article)))
    container.replaceChildren(fragment)
  }

  function renderIndex() {
    renderArticleList(document.querySelector('#article-index'), content.articles)
    readCount.textContent = String(state.memory.read.length)
  }

  function searchableText(article) {
    const themeLabels = article.themes.map((themeId) => {
      const theme = content.themes.find((item) => item.id === themeId)
      return theme ? theme.label : themeId
    })
    return [article.title, article.shortTitle, article.year, article.kind, article.status, article.summary, ...themeLabels]
      .join(' ')
      .toLocaleLowerCase('zh-CN')
  }

  function renderSearch(query) {
    const normalized = escapeText(query).trim().toLocaleLowerCase('zh-CN')
    const results = normalized
      ? content.articles.filter((article) => searchableText(article).includes(normalized))
      : content.articles
    renderArticleList(document.querySelector('#search-results'), results)
    document.querySelector('#search-result-count').textContent = `${results.length} 篇`
    document.querySelector('.search-empty').hidden = results.length > 0
  }

  function selectIndexTab(name, focusTab) {
    document.querySelectorAll('[data-index-tab]').forEach((button) => {
      const selected = button.dataset.indexTab === name
      button.setAttribute('aria-selected', String(selected))
      button.tabIndex = selected ? 0 : -1
      if (selected && focusTab) button.focus()
    })
    document.querySelectorAll('[data-index-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.indexPanel !== name
    })
    if (name === 'search') {
      renderSearch(document.querySelector('#index-search').value)
      if (!focusTab) window.setTimeout(() => document.querySelector('#index-search').focus(), 80)
    }
  }

  function openIndex(tabName) {
    if (state.current === 4) return
    state.openingReaderFrom = edgeEntry
    renderIndex()
    selectIndexTab(tabName || 'articles', false)
    edgeEntry.setAttribute('aria-expanded', 'true')
    if (!indexDialog.open) indexDialog.showModal()
  }

  function closeIndex(restoreFocus) {
    if (!indexDialog.open) return
    indexDialog.close()
    edgeEntry.setAttribute('aria-expanded', 'false')
    if (restoreFocus !== false && state.current !== 4) edgeEntry.focus()
  }

  function relatedArticles(article, preferredId) {
    const relatedIds = []
    content.relations.forEach((relation) => {
      if (relation.from === article.id) relatedIds.push({ id: relation.to, label: relation.label })
      if (relation.to === article.id) relatedIds.push({ id: relation.from, label: relation.label })
    })
    const seen = new Set()
    const relations = relatedIds
      .filter((item) => !seen.has(item.id) && seen.add(item.id))
      .map((item) => ({ article: content.articles.find((candidate) => candidate.id === item.id), label: item.label }))
      .filter((item) => item.article)
    if (preferredId) {
      relations.sort((left, right) => Number(right.article.id === preferredId) - Number(left.article.id === preferredId))
    }
    return relations.slice(0, 2)
  }

  function openArticle(id, opener, preferredRelatedId) {
    const article = content.articles.find((item) => item.id === id)
    if (!article) return
    state.openingReaderFrom = opener || document.activeElement
    state.preferredRelatedId = preferredRelatedId || null

    const wasIndexOpen = indexDialog.open
    if (wasIndexOpen) closeIndex(false)

    state.memory.read = state.memory.read.filter((readId) => readId !== id)
    state.memory.read.push(id)
    saveMemory()
    renderIndex()
    updateReflectionQuestion()

    document.querySelector('.reader-meta').textContent = [article.date, article.kind, `${article.minutes} 分钟`, article.status].join(' · ')
    document.querySelector('#reader-title').textContent = article.title
    document.querySelector('.reader-summary').textContent = article.summary

    const body = document.querySelector('.reader-body')
    const paragraphs = document.createDocumentFragment()
    article.paragraphs.forEach((paragraph) => {
      const element = document.createElement('p')
      element.textContent = paragraph
      paragraphs.append(element)
    })
    body.replaceChildren(paragraphs)

    const related = document.querySelector('.reader-related')
    const relatedFragment = document.createDocumentFragment()
    relatedArticles(article, state.preferredRelatedId).forEach((item) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.openArticle = item.article.id
      const relation = document.createElement('span')
      relation.textContent = item.label
      const title = document.createElement('strong')
      title.textContent = item.article.shortTitle || item.article.title
      button.append(relation, title)
      relatedFragment.append(button)
    })
    related.replaceChildren(relatedFragment)

    document.querySelector('.reader-progress').style.setProperty('--reader-progress', '0%')
    if (!readerDialog.open) readerDialog.showModal()
    readerDialog.scrollTop = 0
  }

  function closeReader() {
    if (!readerDialog.open) return
    readerDialog.close()
    const opener = state.openingReaderFrom
    const continueInward = state.readerFromSeam
    state.openingReaderFrom = null
    state.readerFromSeam = false
    state.preferredRelatedId = null
    if (continueInward) setState(3, { announce: true, scroll: true })
    if (opener instanceof HTMLElement && opener.isConnected && !opener.closest('[inert]')) {
      window.setTimeout(() => opener.focus(), 40)
    } else if (state.current !== 4) {
      stage.focus()
    }
  }

  function updateReaderProgress() {
    const maximum = readerDialog.scrollHeight - readerDialog.clientHeight
    const percent = maximum > 0 ? clamp((readerDialog.scrollTop / maximum) * 100, 0, 100) : 100
    document.querySelector('.reader-progress').style.setProperty('--reader-progress', `${percent.toFixed(1)}%`)
  }

  function clearMemory() {
    state.memory = { read: [], syncSeen: false }
    saveMemory()
    renderIndex()
    renderSearch(document.querySelector('#index-search').value)
    updateReflectionQuestion()
  }

  function onDocumentClick(event) {
    const next = event.target.closest('[data-next-state]')
    if (next) {
      goState(state.current + 1)
      return
    }

    const origin = event.target.closest('[data-return-origin]')
    if (origin) {
      goState(0)
      return
    }

    const articleButton = event.target.closest('[data-open-article]')
    if (articleButton && articleButton !== dwellTrigger) {
      openArticle(articleButton.dataset.openArticle, articleButton)
      return
    }

    if (event.target.closest('[data-enter-seam]')) {
      enterSeam()
      return
    }

    if (event.target.closest('[data-close-index]')) {
      closeIndex(true)
      return
    }

    if (event.target.closest('[data-close-reader]')) {
      closeReader()
      return
    }

    const tab = event.target.closest('[data-index-tab]')
    if (tab) {
      selectIndexTab(tab.dataset.indexTab, false)
      return
    }

    if (event.target.closest('[data-clear-memory]')) clearMemory()
  }

  function onDocumentPointerDown(event) {
    if (!state.coarse || !state.dwellLocked || state.signatureReady) return
    if (!event.target.closest('[data-dwell-trigger]')) {
      state.dwellLocked = false
      cancelDwell(true)
    }
  }

  function onVisibilityChange() {
    state.visible = !document.hidden
    if (!state.visible) {
      if (state.canvas.raf) window.cancelAnimationFrame(state.canvas.raf)
      state.canvas.raf = 0
      pauseDwell()
    } else {
      resumeDwellIfHeld()
      startCanvasLoop()
    }
  }

  function onMotionPreferenceChange(event) {
    state.reduced = event.matches
    if (state.reduced && state.canvas.raf) {
      window.cancelAnimationFrame(state.canvas.raf)
      state.canvas.raf = 0
    }
    resizeCanvas()
    startCanvasLoop()
  }

  function onPointerPreferenceChange(event) {
    state.coarse = event.matches
  }

  function setupCanvas() {
    if (!canvas || typeof canvas.getContext !== 'function') return
    const context = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!context) return
    state.canvas.context = context
    document.body.classList.add('canvas-ready')
    resizeCanvas()
    startCanvasLoop()
  }

  function resizeCanvas() {
    const context = state.canvas.context
    if (!context) return
    const width = Math.max(1, window.innerWidth)
    const height = Math.max(1, window.innerHeight)
    const mobile = width <= 760
    const cap = mobile ? 1.35 : 1.75
    const dpr = Math.min(window.devicePixelRatio || 1, cap)
    state.canvas.width = width
    state.canvas.height = height
    state.canvas.dpr = dpr
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (state.reduced) drawFrame(performance.now(), true)
  }

  function boneColor(alpha) {
    return `rgba(236, 232, 222, ${clamp(alpha, 0, 1)})`
  }

  function drawAura(context, cx, cy, radiusX, radiusY, opacity) {
    const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, Math.max(radiusX, radiusY))
    gradient.addColorStop(0, boneColor(0.07 * opacity))
    gradient.addColorStop(0.42, boneColor(0.027 * opacity))
    gradient.addColorStop(1, 'rgba(236, 232, 222, 0)')
    context.save()
    context.scale(1, radiusY / radiusX)
    context.fillStyle = gradient
    context.beginPath()
    context.arc(cx, cy * (radiusX / radiusY), radiusX, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }

  function drawMembrane(context, options) {
    const {
      x, top, height, width, bend, rotation, alpha, fillAlpha, pinch, seed,
    } = options
    const half = width / 2
    context.save()
    context.translate(x, top + height / 2)
    context.rotate(rotation)
    context.beginPath()
    context.moveTo(-half * 0.22, -height / 2)
    context.bezierCurveTo(
      -half * (1.02 + pinch),
      -height * 0.29,
      -half * (0.86 - bend),
      height * 0.29,
      -half * 0.17,
      height / 2,
    )
    context.bezierCurveTo(
      half * (0.9 + bend),
      height * 0.28,
      half * (1.02 - pinch),
      -height * 0.31,
      half * 0.22,
      -height / 2,
    )
    context.closePath()

    const fill = context.createLinearGradient(-half, 0, half, 0)
    fill.addColorStop(0, boneColor(fillAlpha * 0.18))
    fill.addColorStop(0.46 + Math.sin(seed) * 0.08, boneColor(fillAlpha))
    fill.addColorStop(1, boneColor(fillAlpha * 0.08))
    context.fillStyle = fill
    context.fill()
    context.strokeStyle = boneColor(alpha)
    context.lineWidth = 0.72
    context.stroke()
    context.restore()
  }

  function drawFoldedSurfaces(context, cx, cy, coreWidth, coreHeight, progress, time) {
    const eased = easeOutQuint(progress)
    const gap = coreWidth * (0.62 - eased * 0.48)
    const synchronizedBreath = state.reduced ? 0.18 : Math.sin((time - state.signatureReadyAt) / 740) * 0.5 + 0.5
    const pulse = 1 + synchronizedBreath * 0.018
    const surfaceWidth = coreWidth * (0.45 + eased * 0.08) * pulse
    const surfaceHeight = coreHeight * (0.72 + eased * 0.05)

    ;[-1, 1].forEach((side) => {
      context.save()
      context.translate(cx + side * gap, cy)
      context.scale(side, 1)
      context.beginPath()
      context.moveTo(0, -surfaceHeight / 2)
      context.bezierCurveTo(
        surfaceWidth * 0.86,
        -surfaceHeight * 0.33,
        surfaceWidth * 0.92,
        surfaceHeight * 0.32,
        0,
        surfaceHeight / 2,
      )
      context.bezierCurveTo(
        surfaceWidth * 0.24,
        surfaceHeight * 0.18,
        surfaceWidth * 0.25,
        -surfaceHeight * 0.19,
        0,
        -surfaceHeight / 2,
      )
      context.closePath()
      const gradient = context.createLinearGradient(0, 0, surfaceWidth, 0)
      gradient.addColorStop(0, boneColor(0.28 + eased * 0.18))
      gradient.addColorStop(0.18, boneColor(0.08))
      gradient.addColorStop(1, 'rgba(236, 232, 222, 0)')
      context.fillStyle = gradient
      context.fill()
      context.strokeStyle = boneColor(0.2 + eased * 0.18)
      context.lineWidth = 0.8
      context.stroke()
      context.restore()
    })

    context.save()
    const seam = context.createLinearGradient(cx, cy - coreHeight * 0.34, cx, cy + coreHeight * 0.34)
    seam.addColorStop(0, 'rgba(236, 232, 222, 0)')
    seam.addColorStop(0.24, boneColor(0.24 * eased))
    seam.addColorStop(0.55, boneColor(0.58 * eased))
    seam.addColorStop(1, 'rgba(236, 232, 222, 0)')
    context.fillStyle = seam
    context.fillRect(cx - 0.55, cy - coreHeight * 0.35, 1.1, coreHeight * 0.7)
    context.restore()
  }

  function drawResidual(context, cx, cy, time) {
    const opacity = state.reduced ? 0.14 : 0.1 + Math.sin(time / 1800) * 0.025
    const radius = Math.max(12, Math.min(state.canvas.width, state.canvas.height) * 0.025)
    const glow = context.createRadialGradient(cx, cy, 0, cx, cy, radius)
    glow.addColorStop(0, boneColor(opacity))
    glow.addColorStop(0.08, boneColor(opacity * 0.55))
    glow.addColorStop(1, 'rgba(236, 232, 222, 0)')
    context.fillStyle = glow
    context.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
  }

  function drawCore(time) {
    const context = state.canvas.context
    if (!context) return
    const width = state.canvas.width
    const height = state.canvas.height
    const mobile = width <= 760
    const cx = width * 0.5
    const cy = height * (mobile ? 0.4 : 0.46)
    const coreWidth = mobile ? Math.min(width * 0.74, 340) : Math.min(width * 0.4, 570)
    const coreHeight = mobile ? Math.min(height * 0.5, 470) : Math.min(height * 0.67, 690)

    context.clearRect(0, 0, width, height)
    if (state.current === 4 && state.visual > 3.6) {
      drawResidual(context, cx, cy, time)
      return
    }

    const formation = state.reduced ? 1 : easeOutQuint(state.canvas.formation)
    const visual = state.visual
    const observe = clamp(visual, 0, 1)
    const order = clamp(visual - 1, 0, 1)
    const inward = clamp(visual - 2, 0, 1)
    const disappear = clamp(visual - 3, 0, 1)
    const ordinaryBreath = state.reduced ? 0.24 : Math.sin(time / 1120) * 0.5 + 0.5
    const heightBreath = 1 + ordinaryBreath * 0.018 * (1 - inward * 0.55)
    const formationScale = 0.75 + formation * 0.25

    drawAura(context, cx, cy, coreWidth * 0.65, coreHeight * 0.62, formation * (1 - disappear))

    const slices = 15
    for (let index = 0; index < slices; index += 1) {
      const normalized = (index - (slices - 1) / 2) / ((slices - 1) / 2)
      const distance = Math.abs(normalized)
      const side = normalized === 0 ? 0 : Math.sign(normalized)
      const depth = 1 - distance
      const baseX = normalized * coreWidth * 0.31
      const peel = side * Math.pow(distance, 1.45) * coreWidth * 0.085 * observe
      const relationalSpace = side * (0.3 + distance) * coreWidth * 0.055 * order
      const formationOffset = side * (1 - formation) * coreWidth * (0.18 + distance * 0.25)
      const isLocal = normalized < -0.28 && normalized > -0.75
      const isRemote = normalized > 0.32 && normalized < 0.78

      let regionBreath = ordinaryBreath
      if (state.dwellActive && isLocal) regionBreath = state.frozenBreath * 0.5 + 0.5
      if (state.signatureReady && (isLocal || isRemote)) {
        regionBreath = state.reduced ? 0.2 : Math.sin((time - state.signatureReadyAt) / 740) * 0.5 + 0.5
      } else if (isRemote) {
        regionBreath = state.reduced ? 0.42 : Math.sin(time / 1480 + 1.7) * 0.5 + 0.5
      }

      const localPulse = (isLocal || isRemote) ? (regionBreath - 0.5) * coreWidth * 0.006 : 0
      const x = cx + (baseX + peel + relationalSpace + formationOffset + side * localPulse) * formationScale
      const sliceHeight = coreHeight * (0.89 - distance * 0.2) * heightBreath * formationScale
      const sliceWidth = coreWidth * (0.34 - distance * 0.105) * (1 + regionBreath * 0.012)
      const bend = normalized * 0.14 + Math.sin(index * 1.71) * 0.018
      const rotation = normalized * 0.05 * observe + side * distance * 0.055 * order
      const alpha = (0.1 + depth * 0.38) * formation * (1 - disappear * (0.72 + distance * 0.2))
      const fillAlpha = (0.016 + depth * 0.055) * formation * (1 - disappear * 0.78)

      if (inward > 0 && index % 3 === 0) continue
      drawMembrane(context, {
        x,
        top: cy - sliceHeight / 2,
        height: sliceHeight,
        width: sliceWidth,
        bend,
        rotation,
        alpha,
        fillAlpha,
        pinch: distance * 0.08,
        seed: index * 0.77,
      })
    }

    if (inward > 0.02) {
      const voidRadiusX = coreWidth * (0.045 + inward * 0.12)
      const voidRadiusY = coreHeight * (0.12 + inward * 0.13)
      const voidGradient = context.createRadialGradient(cx, cy, 0, cx, cy, voidRadiusY)
      voidGradient.addColorStop(0, `rgba(2, 2, 2, ${0.95 * inward})`)
      voidGradient.addColorStop(0.68, `rgba(2, 2, 2, ${0.74 * inward})`)
      voidGradient.addColorStop(1, 'rgba(2, 2, 2, 0)')
      context.save()
      context.scale(1, voidRadiusY / voidRadiusX)
      context.fillStyle = voidGradient
      context.beginPath()
      context.arc(cx, cy * (voidRadiusX / voidRadiusY), voidRadiusX, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }

    if (state.signatureReady && state.current === 2) {
      const progress = state.reduced ? 1 : clamp((time - state.signatureReadyAt) / 1300, 0, 1)
      drawFoldedSurfaces(context, cx, cy, coreWidth, coreHeight, progress, time)
    }
  }

  function drawFrame(time, force) {
    const context = state.canvas.context
    if (!context) return
    state.canvas.lastTime = time
    if (!state.reduced) {
      state.canvas.formation = clamp(state.canvas.formation + 0.012, 0, 1)
      state.visual += (state.current - state.visual) * 0.055
      if (Math.abs(state.current - state.visual) < 0.001) state.visual = state.current
    } else {
      state.canvas.formation = 1
      state.visual = state.current
    }
    drawCore(time)
    if (!state.reduced && state.visible && !force) state.canvas.raf = window.requestAnimationFrame(drawFrame)
  }

  function startCanvasLoop() {
    if (!state.canvas.context || !state.visible) return
    if (state.canvas.raf) window.cancelAnimationFrame(state.canvas.raf)
    state.canvas.raf = 0
    if (state.reduced) drawFrame(performance.now(), true)
    else state.canvas.raf = window.requestAnimationFrame(drawFrame)
  }

  edgeEntry.addEventListener('click', () => openIndex('articles'))
  dwellTrigger.addEventListener('pointerenter', onDwellPointerEnter)
  dwellTrigger.addEventListener('pointerleave', onDwellPointerLeave)
  dwellTrigger.addEventListener('focus', onDwellFocus)
  dwellTrigger.addEventListener('blur', onDwellBlur)
  dwellTrigger.addEventListener('click', onDwellClick)
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('pointerdown', onDocumentPointerDown)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('resize', resizeCanvas)
  document.addEventListener('visibilitychange', onVisibilityChange)
  readerDialog.addEventListener('scroll', updateReaderProgress, { passive: true })
  indexDialog.addEventListener('click', (event) => {
    if (event.target === indexDialog) closeIndex(true)
  })
  readerDialog.addEventListener('click', (event) => {
    if (event.target === readerDialog) closeReader()
  })
  indexDialog.addEventListener('cancel', () => {
    edgeEntry.setAttribute('aria-expanded', 'false')
  })
  readerDialog.addEventListener('cancel', () => {
    state.openingReaderFrom = null
    if (state.readerFromSeam) setState(3, { announce: true, scroll: true })
    state.readerFromSeam = false
    state.preferredRelatedId = null
  })
  document.querySelector('#index-search').addEventListener('input', (event) => renderSearch(event.target.value))
  document.querySelector('.index-tabs').addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const tabs = Array.from(document.querySelectorAll('[data-index-tab]'))
    const selected = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const next = (selected + direction + tabs.length) % tabs.length
    selectIndexTab(tabs[next].dataset.indexTab, true)
  })

  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', onMotionPreferenceChange)
    coarsePointerQuery.addEventListener('change', onPointerPreferenceChange)
  } else {
    reducedMotionQuery.addListener(onMotionPreferenceChange)
    coarsePointerQuery.addListener(onPointerPreferenceChange)
  }

  renderIndex()
  renderSearch('')
  updateReflectionQuestion()
  const initialMaximum = Math.max(1, journey.offsetHeight - window.innerHeight)
  const initialState = clamp(Math.round((window.scrollY / initialMaximum) * 4), 0, 4)
  setState(initialState, { announce: false, scroll: false })
  setupCanvas()
  document.documentElement.classList.add('runtime-ready')
})()
