(() => {
  'use strict'

  const content = window.SELF_AWAKE_CONTENT
  const body = document.body

  if (!content) {
    body.classList.remove('js-forming')
    return
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const storageKey = 'self-awake:breathing-core:v1'
  const sceneElements = Array.from(document.querySelectorAll('[data-scene]'))
  const sceneLinks = Array.from(document.querySelectorAll('[data-scene-link]'))
  const canvas = document.querySelector('#breathing-core')
  const context = canvas && canvas.getContext ? canvas.getContext('2d', { alpha: true }) : null
  const archiveDialog = document.querySelector('#archive-dialog')
  const aboutDialog = document.querySelector('#about-dialog')
  const readerDialog = document.querySelector('#reader-dialog')
  const archiveList = document.querySelector('#archive-list')
  const archiveSearch = document.querySelector('#archive-search')
  const archiveTitle = document.querySelector('#archive-title')
  const searchCount = document.querySelector('#search-count')
  const archiveEmpty = document.querySelector('.archive-empty')
  const readerShell = document.querySelector('.reader-shell')
  const formationLayer = document.querySelector('.formation-layer')
  const formationState = document.querySelector('.formation-state')
  const formationCount = document.querySelector('.formation-count output')
  const sceneOutput = document.querySelector('.current-scene')
  const exitMemory = document.querySelector('.exit-memory')
  const traceCount = document.querySelector('.trace-count')
  const reflectionQuestion = document.querySelector('.reflection-question')
  const nodeResponse = document.querySelector('.node-response')
  const themeLabels = new Map(content.themes.map((theme) => [theme.id, theme.label]))

  const state = {
    scene: 0,
    visualScene: 0,
    archiveMode: 'all',
    reduced: prefersReducedMotion.matches,
    visible: !document.hidden,
    formation: prefersReducedMotion.matches ? 1 : 0,
    pointer: { x: 0, y: 0, targetX: 0, targetY: 0 },
    canvas: { width: 0, height: 0, dpr: 1 },
    memory: readMemory(),
    sync: { order: false, inward: false },
    currentArticle: null,
    dwellStartedAt: 0,
    dwellKey: null,
    dwellRemaining: 0,
    nodeImpulse: 0,
    raf: 0,
    lastFrame: 0,
  }

  state.sync.order = state.memory.relations.includes('aigc-revolution>agent-architecture')
  state.sync.inward = state.memory.relations.includes('efficiency-silence>unnamed-real')

  body.dataset.scene = '0'
  sceneElements[0]?.classList.add('is-active')

  window.addEventListener('error', () => {
    body.classList.remove('js-forming', 'js-ready')
    formationLayer.classList.remove('is-leaving')
  }, { once: true })
  if (!state.reduced) body.classList.add('js-forming')
  if (context) body.classList.add('canvas-active')

  function readMemory() {
    const fallback = { read: [], relations: [], nodeAttempts: 0 }
    try {
      const parsed = JSON.parse(window.localStorage.getItem(storageKey) || 'null')
      if (!parsed || typeof parsed !== 'object') return fallback
      return {
        read: Array.isArray(parsed.read) ? parsed.read.filter((item) => item && typeof item.id === 'string').slice(-40) : [],
        relations: Array.isArray(parsed.relations) ? parsed.relations.filter((item) => typeof item === 'string') : [],
        nodeAttempts: Number.isFinite(parsed.nodeAttempts) ? parsed.nodeAttempts : 0,
      }
    } catch (_error) {
      return fallback
    }
  }

  function saveMemory() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state.memory))
    } catch (_error) {
      // The experience remains complete when storage is unavailable.
    }
  }

  function readIds() {
    return state.memory.read.map((item) => item.id)
  }

  function isRead(id) {
    return readIds().includes(id)
  }

  function rememberArticle(id) {
    state.memory.read = state.memory.read.filter((item) => item.id !== id)
    state.memory.read.push({ id, at: new Date().toISOString() })
    state.memory.read = state.memory.read.slice(-40)
    saveMemory()
    updateMemoryUI()
  }

  function unlockRelation(key) {
    if (!state.memory.relations.includes(key)) state.memory.relations.push(key)
    if (key === 'aigc-revolution>agent-architecture') state.sync.order = true
    if (key === 'efficiency-silence>unnamed-real') state.sync.inward = true
    saveMemory()
    updateSyncPanels()
    renderArchive()
  }

  function updateMemoryUI() {
    traceCount.value = String(new Set(readIds()).size)
    document.querySelectorAll('[data-article-id]').forEach((element) => {
      element.classList.toggle('is-read', isRead(element.dataset.articleId))
    })
    updateReflection()
    if (archiveDialog.open) renderArchive()
  }

  function updateReflection() {
    const path = readIds()
    let index = 0
    if (path.includes('efficiency-silence')) index = 2
    else if (path.includes('evidence-before-answer')) index = 1
    else if (path.length) {
      const signature = path.join('').split('').reduce((sum, character) => sum + character.charCodeAt(0), 0)
      index = signature % content.reflectionQuestions.length
    }
    reflectionQuestion.textContent = content.reflectionQuestions[index]
  }

  function makeSceneArticle(article) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'scene-article'
    button.dataset.articleId = article.id
    button.setAttribute('aria-haspopup', 'dialog')

    const coordinate = document.createElement('span')
    coordinate.className = 'article-coordinate'
    coordinate.textContent = `${article.year} / D${article.depth}`

    const name = document.createElement('span')
    name.className = 'article-name'
    name.append(document.createTextNode(article.shortTitle))
    const status = document.createElement('small')
    status.textContent = article.status
    name.append(status)

    const open = document.createElement('span')
    open.className = 'article-open'
    open.setAttribute('aria-hidden', 'true')
    open.textContent = '↗'

    button.append(coordinate, name, open)
    button.classList.toggle('is-read', isRead(article.id))
    button.addEventListener('click', () => openArticle(article.id))
    return button
  }

  function renderSceneArticles() {
    document.querySelectorAll('[data-layer-articles]').forEach((container) => {
      const articles = content.articles.filter((article) => article.layer === container.dataset.layerArticles)
      container.replaceChildren(...articles.map(makeSceneArticle))
    })
  }

  function articleSearchText(article) {
    const themes = article.themes.map((theme) => themeLabels.get(theme) || theme).join(' ')
    return [article.title, article.shortTitle, article.summary, article.excerpt, article.date, article.year, article.kind, article.status, themes]
      .join(' ')
      .toLocaleLowerCase('zh-CN')
  }

  function makeArchiveItem(article) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'archive-item'
    button.dataset.articleId = article.id
    button.setAttribute('aria-haspopup', 'dialog')

    const meta = document.createElement('span')
    meta.className = 'archive-item-meta'
    meta.textContent = `${article.date}\n${article.kind}`

    const center = document.createElement('span')
    const title = document.createElement('span')
    title.className = 'archive-item-title'
    title.textContent = article.title
    const summary = document.createElement('span')
    summary.className = 'archive-item-summary'
    summary.textContent = article.summary
    const status = document.createElement('span')
    status.className = 'archive-item-status'
    status.textContent = article.status
    center.append(title, summary, status)

    const end = document.createElement('span')
    end.className = 'archive-item-end'
    end.textContent = `${article.status}\n${article.minutes} 分钟`

    button.append(meta, center, end)
    button.classList.toggle('is-read', isRead(article.id))
    button.addEventListener('click', () => openArticle(article.id))
    return button
  }

  function renderArchive() {
    const query = archiveSearch.value.trim().toLocaleLowerCase('zh-CN')
    const path = readIds()
    let articles = content.articles.slice()

    if (state.archiveMode === 'time') {
      articles.sort((left, right) => right.date.localeCompare(left.date))
    }

    if (state.archiveMode === 'traces') {
      articles = path
        .slice()
        .reverse()
        .map((id) => content.articles.find((article) => article.id === id))
        .filter(Boolean)
    }

    if (query) articles = articles.filter((article) => articleSearchText(article).includes(query))

    archiveList.replaceChildren(...articles.map(makeArchiveItem))
    searchCount.value = `${articles.length} 篇`
    archiveEmpty.hidden = articles.length > 0
    archiveEmpty.textContent = state.archiveMode === 'traces' && !path.length
      ? '你还没有留下阅读痕迹。先打开一篇文章，它会被这台浏览器轻轻记住。'
      : '没有找到相应文字。换一个更短的词，或清除输入。'

    const titles = { all: '全部文章', search: '搜索文章', time: '时间中的文章', traces: '我留下的痕迹' }
    archiveTitle.textContent = titles[state.archiveMode] || titles.all
    document.querySelectorAll('[data-archive-mode]').forEach((button) => {
      const selectedMode = state.archiveMode === 'search' ? 'all' : state.archiveMode
      button.setAttribute('aria-pressed', String(button.dataset.archiveMode === selectedMode))
    })
  }

  function setArchiveMode(mode) {
    state.archiveMode = mode
    renderArchive()
  }

  function showDialog(dialog, opener) {
    if (!dialog || dialog.open) return
    dialog.dataset.openerId = opener?.id || ''
    dialog.showModal()
    body.classList.add('is-dialog-open')
  }

  function closeDialog(dialog) {
    if (dialog?.open) dialog.close()
  }

  function openArchive(mode, opener) {
    archiveSearch.value = ''
    setArchiveMode(mode)
    showDialog(archiveDialog, opener)
    if (mode === 'search') window.setTimeout(() => archiveSearch.focus(), 80)
  }

  function relatedFor(articleId) {
    return content.relations
      .filter((relation) => relation.from === articleId || relation.to === articleId)
      .map((relation) => {
        const targetId = relation.from === articleId ? relation.to : relation.from
        return { relation, article: content.articles.find((article) => article.id === targetId) }
      })
      .filter((item) => item.article)
  }

  function openArticle(id) {
    const article = content.articles.find((item) => item.id === id)
    if (!article) return

    if (archiveDialog.open) archiveDialog.close()
    state.currentArticle = article
    rememberArticle(article.id)

    document.querySelector('.reader-meta').textContent = `${article.status} · ${article.kind} · ${article.date} · ${article.minutes} 分钟阅读`
    document.querySelector('#reader-title').textContent = article.title
    document.querySelector('.reader-summary').textContent = article.summary

    const bodyFragment = document.createDocumentFragment()
    article.paragraphs.forEach((paragraph) => {
      const element = document.createElement('p')
      element.textContent = paragraph
      bodyFragment.append(element)
    })
    document.querySelector('.reader-body').replaceChildren(bodyFragment)

    const related = relatedFor(article.id).slice(0, 3)
    const relatedContainer = document.querySelector('.reader-related')
    relatedContainer.replaceChildren()
    related.forEach(({ relation, article: target }) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = `${relation.years} · ${relation.label} → ${target.shortTitle}`
      button.addEventListener('click', () => openArticle(target.id))
      relatedContainer.append(button)
    })

    const exit = related[0]
    document.querySelector('.reader-exit-copy').textContent = exit
      ? `离开时，空间不会复位。它会为「${exit.article.shortTitle}」保留一道由“${exit.relation.label}”形成的出口。`
      : '离开时，这段阅读会成为核心内部一层几乎不可见的余光。'

    if (!readerDialog.open) showDialog(readerDialog)
    readerShell.scrollTop = 0
    readerShell.style.setProperty('--reader-progress', '0%')
    window.setTimeout(() => document.querySelector('[data-close-reader]').focus(), 30)
  }

  function closeReader() {
    if (!readerDialog.open) return
    const article = state.currentArticle
    const related = article ? relatedFor(article.id)[0] : null
    readerDialog.close()
    body.classList.remove('is-dialog-open')
    if (article) {
      const note = related
        ? `「${article.shortTitle}」已留下光痕。与「${related.article.shortTitle}」相关的区域现在略微透光。`
        : `「${article.shortTitle}」已成为核心内部的一道微弱残留。`
      showExitMemory(note)
    }
    updateMemoryUI()
  }

  let exitTimer = 0
  function showExitMemory(message) {
    window.clearTimeout(exitTimer)
    exitMemory.textContent = message
    exitMemory.classList.add('is-visible')
    exitTimer = window.setTimeout(() => exitMemory.classList.remove('is-visible'), 5200)
  }

  function onDialogClosed() {
    if (![archiveDialog, aboutDialog, readerDialog].some((dialog) => dialog.open)) {
      body.classList.remove('is-dialog-open')
    }
  }

  function updateSyncPanels() {
    const panels = {
      order: document.querySelector('[data-sync-panel="order"]'),
      inward: document.querySelector('[data-sync-panel="inward"]'),
    }
    Object.entries(panels).forEach(([key, panel]) => {
      if (!panel) return
      panel.classList.toggle('is-unlocked', state.sync[key])
      const output = panel.querySelector('[data-dwell-output]')
      if (state.sync[key]) output.value = '两处已经进入同一节律 · 痕迹已保存'
      else output.value = key === 'order' ? '两处节律尚未重合 · 2.4s' : '保持停留 · 2.4s'
    })
  }

  let dwellTimer = 0
  let dwellTicker = 0
  function cancelDwell() {
    window.clearTimeout(dwellTimer)
    window.clearInterval(dwellTicker)
    dwellTimer = 0
    dwellTicker = 0
    state.dwellStartedAt = 0
    state.dwellKey = null
    state.dwellRemaining = 0
  }

  function pauseDwell() {
    if (!state.dwellKey || !state.dwellStartedAt) return
    state.dwellRemaining = Math.max(0, state.dwellRemaining - (performance.now() - state.dwellStartedAt))
    window.clearTimeout(dwellTimer)
    window.clearInterval(dwellTicker)
    dwellTimer = 0
    dwellTicker = 0
    state.dwellStartedAt = 0
  }

  function startDwell(sceneIndex, resumedDuration = null) {
    cancelDwell()
    const setup = sceneIndex === 2
      ? { key: 'order', relation: 'aigc-revolution>agent-architecture' }
      : sceneIndex === 3
        ? { key: 'inward', relation: 'efficiency-silence>unnamed-real' }
        : null
    if (!setup) return

    const panel = document.querySelector(`[data-sync-panel="${setup.key}"]`)
    const output = panel?.querySelector('[data-dwell-output]')
    if (state.sync[setup.key]) {
      if (output) output.value = '两处已经进入同一节律 · 痕迹已保存'
      return
    }

    state.dwellKey = setup.key
    state.dwellStartedAt = performance.now()
    const duration = resumedDuration ?? 2400
    state.dwellRemaining = duration

    const updateCountdown = () => {
      const remaining = Math.max(0, duration - (performance.now() - state.dwellStartedAt))
      if (output) output.value = `保持停留 · ${(remaining / 1000).toFixed(1)}s`
    }
    updateCountdown()
    dwellTicker = window.setInterval(updateCountdown, 100)
    dwellTimer = window.setTimeout(() => {
      window.clearInterval(dwellTicker)
      unlockRelation(setup.relation)
      state.dwellKey = null
      state.dwellStartedAt = 0
      state.dwellRemaining = 0
      showExitMemory(setup.key === 'order'
        ? '2023 与 2026 的两处膜片采用了同一节律。它们没有相连，却开始同时发亮。'
        : '2022 与 2026 的问题同时收缩了一次。跨时间的同步已留在此浏览器。')
    }, duration)
  }

  let programmaticScrollUntil = 0
  let programmaticScrollSettler = 0
  function setScene(index, options = {}) {
    const next = Math.max(0, Math.min(sceneElements.length - 1, Number(index)))
    const changed = next !== state.scene
    state.scene = next
    body.dataset.scene = String(next)
    sceneOutput.textContent = content.layers[next]?.index || String(next).padStart(2, '0')

    sceneElements.forEach((scene, sceneIndex) => scene.classList.toggle('is-active', sceneIndex === next))
    sceneLinks.forEach((link, sceneIndex) => {
      if (sceneIndex === next) link.setAttribute('aria-current', 'step')
      else link.removeAttribute('aria-current')
    })

    const breathOutput = document.querySelector('[data-breath-state]')
    if (breathOutput) {
      const periods = ['6.2', '5.8', '6.6', '7.4', '8.4']
      breathOutput.value = `${periods[next]} 秒 / 次`
    }

    if (changed) startDwell(next)
    if (state.reduced && context) {
      state.visualScene = next
      drawFrame(performance.now(), true)
    }
    if (options.scroll) {
      programmaticScrollUntil = performance.now() + (state.reduced ? 40 : 900)
      window.clearTimeout(programmaticScrollSettler)
      sceneElements[next].scrollIntoView({ behavior: state.reduced ? 'auto' : 'smooth', block: 'start' })
      programmaticScrollSettler = window.setTimeout(() => {
        programmaticScrollUntil = 0
        setScene(nearestScene())
      }, state.reduced ? 50 : 920)
    }
  }

  function nearestScene() {
    let closest = 0
    let distance = Infinity
    sceneElements.forEach((scene, index) => {
      const currentDistance = Math.abs(scene.getBoundingClientRect().top)
      if (currentDistance < distance) {
        closest = index
        distance = currentDistance
      }
    })
    return closest
  }

  let scrollFrame = 0
  function onScroll() {
    if (scrollFrame || body.classList.contains('is-dialog-open') || performance.now() < programmaticScrollUntil) return
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0
      setScene(nearestScene())
    })
  }

  let wheelGesture = false
  let wheelGestureEnd = 0
  function onWheel(event) {
    if (body.classList.contains('is-dialog-open') || event.target.closest('dialog')) return
    if (Math.abs(event.deltaY) < 5) return
    event.preventDefault()
    window.clearTimeout(wheelGestureEnd)
    wheelGestureEnd = window.setTimeout(() => { wheelGesture = false }, 190)
    if (wheelGesture) return
    wheelGesture = true
    setScene(state.scene + (event.deltaY > 0 ? 1 : -1), { scroll: true })
  }

  function isTypingTarget(target) {
    return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, button, a, summary, [contenteditable="true"], [role="button"], dialog'))
  }

  function onKeydown(event) {
    if (isTypingTarget(event.target) || body.classList.contains('is-dialog-open')) return
    let destination = null
    if (['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey)) destination = state.scene + 1
    if (['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey)) destination = state.scene - 1
    if (event.key === 'Home') destination = 0
    if (event.key === 'End') destination = sceneElements.length - 1
    if (destination !== null) {
      event.preventDefault()
      setScene(destination, { scroll: true })
    }
  }

  function beginFormation() {
    if (state.reduced) {
      body.classList.remove('js-forming')
      state.formation = 1
      return
    }

    const duration = 2900
    let lastFormationFrame = performance.now()
    let formationElapsed = 0
    const messages = [
      [0, '黑暗仍未发生。'],
      [0.16, '一个节点记住了第一次呼吸。'],
      [0.38, '白色膜片从不同深度响应。'],
      [0.62, '结构正在采用同一节律。'],
      [0.84, '最后一道缝隙拒绝闭合。'],
    ]

    const step = (time) => {
      if (!body.classList.contains('js-forming')) return
      formationElapsed += Math.min(64, Math.max(0, time - lastFormationFrame))
      lastFormationFrame = time
      state.formation = Math.min(1, formationElapsed / duration)
      const current = messages.reduce((found, item) => state.formation >= item[0] ? item : found, messages[0])
      if (formationState.textContent !== current[1]) formationState.textContent = current[1]
      formationCount.value = String(Math.round(state.formation * 100)).padStart(2, '0')
      if (state.formation < 1) window.requestAnimationFrame(step)
      else finishFormation()
    }
    window.requestAnimationFrame(step)
  }

  function finishFormation() {
    state.formation = 1
    formationLayer.classList.add('is-leaving')
    window.setTimeout(() => {
      body.classList.remove('js-forming')
      formationLayer.classList.remove('is-leaving')
    }, 420)
  }

  function resizeCanvas() {
    if (!context) return
    const dprCap = window.innerWidth <= 720 ? 1.35 : 1.75
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    const width = Math.max(1, window.innerWidth)
    const height = Math.max(1, window.innerHeight)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    state.canvas = { width, height, dpr }
    if (state.reduced) drawFrame(performance.now(), true)
  }

  const clamp = (value, minimum = 0, maximum = 1) => Math.max(minimum, Math.min(maximum, value))
  const lerp = (from, to, amount) => from + (to - from) * amount

  function sceneProperties(sceneValue) {
    const compact = state.canvas.width <= 720
    const positions = compact
      ? [0.5, 0.5, 0.5, 0.5, 0.5]
      : [0.69, 0.34, 0.69, 0.34, 0.5]
    const widths = compact
      ? [0.31, 0.32, 0.3, 0.25, 0.055]
      : [0.235, 0.23, 0.225, 0.18, 0.025]
    const heights = compact
      ? [0.32, 0.31, 0.3, 0.25, 0.022]
      : [0.34, 0.33, 0.31, 0.25, 0.018]
    const bands = compact ? [13, 11, 9, 6, 1] : [19, 16, 13, 8, 1]
    const lower = Math.floor(sceneValue)
    const upper = Math.min(4, Math.ceil(sceneValue))
    const mix = sceneValue - lower
    return {
      x: lerp(positions[lower], positions[upper], mix),
      width: lerp(widths[lower], widths[upper], mix),
      height: lerp(heights[lower], heights[upper], mix),
      bands: Math.max(1, Math.round(lerp(bands[lower], bands[upper], mix))),
      opacity: lerp([1, 0.98, 0.92, 0.7, 0.24][lower], [1, 0.98, 0.92, 0.7, 0.24][upper], mix),
    }
  }

  function breathAt(time, sceneValue, phase = 0) {
    const periods = [6.2, 5.8, 6.6, 7.4, 8.4]
    const lower = Math.floor(sceneValue)
    const upper = Math.min(4, Math.ceil(sceneValue))
    const period = lerp(periods[lower], periods[upper], sceneValue - lower)
    if (state.reduced) return 0
    return Math.sin((time / (period * 1000)) * Math.PI * 2 + phase)
  }

  function envelopeAt(unit, phase) {
    const base = Math.pow(Math.max(0, Math.sin(unit * Math.PI)), 0.54)
    return base * (0.91 + Math.sin(unit * 7.1 + phase) * 0.055 + Math.sin(unit * 13.3 - phase) * 0.024)
  }

  function drawRibbon(cx, y, width, height, gap, bend, alpha, leftBreath, rightBreath) {
    const leftWidth = Math.max(1, width * (1 + leftBreath * 0.035))
    const rightWidth = Math.max(1, width * (1 + rightBreath * 0.035))
    const topSkew = bend * 0.46
    const gradient = context.createLinearGradient(cx - width, y, cx + width, y)
    gradient.addColorStop(0, 'rgba(233,231,223,0)')
    gradient.addColorStop(0.2, `rgba(233,231,223,${Math.min(0.72, alpha * 0.64)})`)
    gradient.addColorStop(0.55, `rgba(244,244,239,${Math.min(0.86, alpha * 1.16)})`)
    gradient.addColorStop(1, 'rgba(233,231,223,0)')

    context.fillStyle = gradient
    context.strokeStyle = `rgba(233,231,223,${Math.min(0.52, alpha * 1.68)})`
    context.lineWidth = 0.82

    context.beginPath()
    context.moveTo(cx - leftWidth, y + topSkew)
    context.bezierCurveTo(cx - leftWidth * 0.62, y - height * 0.68, cx - gap * 2.5, y - height * 0.4, cx - gap, y)
    context.bezierCurveTo(cx - gap * 1.5, y + height * 0.38, cx - leftWidth * 0.64, y + height * 0.72, cx - leftWidth, y + topSkew)
    context.closePath()
    context.fill()
    context.stroke()

    context.beginPath()
    context.moveTo(cx + gap, y)
    context.bezierCurveTo(cx + gap * 1.4, y - height * 0.45, cx + rightWidth * 0.6, y - height * 0.66, cx + rightWidth, y - topSkew)
    context.bezierCurveTo(cx + rightWidth * 0.67, y + height * 0.7, cx + gap * 2.6, y + height * 0.36, cx + gap, y)
    context.closePath()
    context.fill()
    context.stroke()
  }

  function traceBoundary(cx, cy, width, height, scale, alpha, phase, crack = true) {
    const points = state.canvas.width <= 720 ? 32 : 48
    const drawSide = (side, start, end) => {
      context.beginPath()
      for (let index = start; index <= end; index += 1) {
        const unit = index / points
        const y = cy - height + unit * height * 2
        const envelope = envelopeAt(unit, phase) * scale
        const centerOffset = Math.sin(unit * 5.2 + phase) * width * 0.055
        const x = cx + centerOffset + side * width * envelope
        if (index === start) context.moveTo(x, y)
        else context.lineTo(x, y)
      }
      context.stroke()
    }

    context.lineWidth = 0.78
    context.strokeStyle = `rgba(233,231,223,${alpha})`
    drawSide(-1, 1, points - 1)
    if (crack) {
      drawSide(1, 1, Math.floor(points * 0.42))
      drawSide(1, Math.floor(points * 0.59), points - 1)
    } else {
      drawSide(1, 1, points - 1)
    }
  }

  function drawResidualTraces(cx, cy, width, height, time, sceneValue) {
    const reads = Math.min(5, new Set(readIds()).size)
    if (!reads || sceneValue >= 3.85) return
    context.save()
    context.globalCompositeOperation = 'screen'
    for (let index = 0; index < reads; index += 1) {
      const offset = (index - (reads - 1) / 2) * height * 0.13
      const drift = state.reduced ? 0 : Math.sin(time / 3700 + index * 1.7) * 4
      context.beginPath()
      context.moveTo(cx - width * (0.6 - index * 0.035), cy + offset + drift)
      context.bezierCurveTo(
        cx - width * 0.18,
        cy + offset - height * 0.09,
        cx + width * 0.22,
        cy + offset + height * 0.08,
        cx + width * (0.52 - index * 0.025),
        cy + offset - drift,
      )
      context.lineWidth = 4.8
      context.strokeStyle = 'rgba(233,231,223,0.018)'
      context.shadowBlur = 13
      context.shadowColor = 'rgba(233,231,223,0.13)'
      context.stroke()
      context.lineWidth = 0.55
      context.strokeStyle = 'rgba(233,231,223,0.095)'
      context.stroke()
    }
    context.restore()
  }

  function drawSynchronizedRegions(cx, cy, width, height, time, sceneIndex) {
    const unlocked = sceneIndex < 2.5 ? state.sync.order : state.sync.inward
    if (!unlocked || sceneIndex < 1.6 || sceneIndex > 3.75) return
    const breath = (breathAt(time, sceneIndex) + 1) * 0.5
    const yA = cy - height * 0.34
    const yB = cy + height * 0.31

    context.save()
    context.globalCompositeOperation = 'screen'
    context.shadowBlur = 22
    context.shadowColor = 'rgba(198,184,155,0.28)'
    context.strokeStyle = `rgba(198,184,155,${0.14 + breath * 0.16})`
    context.lineWidth = 2.2

    ;[
      [cx - width * 0.43, yA, -1],
      [cx + width * 0.4, yB, 1],
    ].forEach(([x, y, direction]) => {
      context.beginPath()
      context.moveTo(x - direction * width * 0.14, y - 2)
      context.quadraticCurveTo(x, y - 7 * breath, x + direction * width * 0.14, y + 2)
      context.stroke()
    })

    context.shadowBlur = 12
    context.lineWidth = 9
    context.strokeStyle = `rgba(198,184,155,${0.012 + breath * 0.018})`
    context.beginPath()
    context.moveTo(cx - width * 0.34, yA)
    context.bezierCurveTo(cx - width * 0.1, cy - height * 0.05, cx + width * 0.08, cy + height * 0.05, cx + width * 0.32, yB)
    context.stroke()
    context.restore()
  }

  function drawDeepNode(cx, cy, time, opacity) {
    const breath = breathAt(time, 4)
    const impulse = Math.max(0, state.nodeImpulse - time)
    const impulseScale = impulse ? Math.sin((420 - impulse) / 70) * (impulse / 420) * 0.14 : 0
    const radius = (state.canvas.width <= 720 ? 10 : 13) * (1 + breath * 0.08 + impulseScale)
    context.save()
    context.translate(cx, cy)
    context.rotate(-0.18)
    context.lineWidth = 0.8
    context.strokeStyle = `rgba(233,231,223,${0.28 + opacity * 0.35})`
    context.shadowBlur = 12
    context.shadowColor = 'rgba(233,231,223,0.18)'
    context.beginPath()
    context.arc(0, 0, radius, Math.PI * 0.18, Math.PI * 1.72)
    context.stroke()
    context.shadowBlur = 0
    context.strokeStyle = 'rgba(233,231,223,0.12)'
    context.beginPath()
    context.arc(0, 0, radius * 1.75, Math.PI * 0.65, Math.PI * 1.25)
    context.stroke()
    context.restore()
  }

  function drawCorpus(time, sceneValue) {
    const { width: viewportWidth, height: viewportHeight } = state.canvas
    if (!viewportWidth || !viewportHeight) return
    const properties = sceneProperties(sceneValue)
    const compact = viewportWidth <= 720
    const pointerX = compact ? 0 : state.pointer.x * viewportWidth * 0.008
    const pointerY = compact ? 0 : state.pointer.y * viewportHeight * 0.006
    const cx = viewportWidth * properties.x + pointerX
    const cy = compact ? viewportHeight * 0.235 + pointerY : viewportHeight * 0.49 + pointerY
    const coreWidth = viewportWidth * properties.width
    const coreHeight = viewportHeight * properties.height
    const sceneIndex = clamp(sceneValue, 0, 4)

    if (sceneValue > 3.72) {
      const fade = clamp((sceneValue - 3.72) / 0.28)
      if (fade > 0.22) drawDeepNode(cx, cy, time, fade)
      if (fade >= 0.99) return
    }

    const formation = state.formation
    const baseBreath = breathAt(time, sceneIndex)
    const leftIndependent = breathAt(time, sceneIndex, 0.4)
    const synced = sceneIndex < 2.5 ? state.sync.order : state.sync.inward
    const rightIndependent = synced ? leftIndependent : breathAt(time * 0.91, sceneIndex, 2.1)
    const fadeForNode = sceneValue > 3.72 ? 1 - clamp((sceneValue - 3.72) / 0.28) : 1

    context.save()
    context.globalAlpha = properties.opacity * fadeForNode
    drawResidualTraces(cx, cy, coreWidth, coreHeight, time, sceneValue)

    const boundaryCount = sceneValue < 1.4 ? 4 : sceneValue < 2.7 ? 3 : 2
    for (let layer = boundaryCount - 1; layer >= 0; layer -= 1) {
      traceBoundary(
        cx,
        cy,
        coreWidth,
        coreHeight,
        0.68 + layer * 0.105 + baseBreath * 0.01,
        (0.3 - layer * 0.048) * formation,
        0.7 + layer * 0.56,
        true,
      )
    }

    const bandCount = properties.bands
    for (let index = 0; index < bandCount; index += 1) {
      const unit = bandCount === 1 ? 0.5 : index / (bandCount - 1)
      const orderedIndex = Math.abs(index - (bandCount - 1) / 2)
      const appearanceThreshold = orderedIndex / Math.max(1, bandCount / 2) * 0.62
      const appearance = clamp((formation - appearanceThreshold) * 4.2)
      if (appearance <= 0) continue
      const envelope = envelopeAt(unit, 0.62)
      const y = cy - coreHeight + unit * coreHeight * 2 + Math.sin(unit * 8.2 + baseBreath * 0.12) * coreHeight * 0.012
      const centerShift = Math.sin(unit * 5.1 + 0.7) * coreWidth * 0.055
      const width = coreWidth * envelope * (0.79 + baseBreath * (0.018 + (1 - Math.abs(unit - 0.5) * 2) * 0.013))
      const height = Math.max(3, (coreHeight * 2 / Math.max(4, bandCount)) * (0.34 + Math.sin(index * 1.93) * 0.06))
      const gap = Math.max(1.5, coreWidth * (0.022 + Math.sin(index * 1.37) * 0.006))
      const bend = Math.sin(index * 1.61 + 0.2) * height * 0.62
      const centerStrength = 1 - Math.abs(unit - 0.5) * 1.55
      const alpha = (0.14 + Math.max(0, centerStrength) * 0.22 + (index % 5 === 0 ? 0.08 : 0)) * appearance
      drawRibbon(cx + centerShift, y, width, height, gap, bend, alpha, leftIndependent, rightIndependent)
    }

    drawSynchronizedRegions(cx, cy, coreWidth, coreHeight, time, sceneIndex)
    context.restore()
  }

  function drawFrame(time, force = false) {
    if (!context || (!state.visible && !force)) return
    const delta = state.lastFrame ? Math.min(40, time - state.lastFrame) : 16
    state.lastFrame = time
    const interpolation = state.reduced ? 1 : 1 - Math.pow(0.001, delta / 1000)
    state.visualScene = lerp(state.visualScene, state.scene, interpolation)
    if (Math.abs(state.visualScene - state.scene) < 0.001) state.visualScene = state.scene
    state.pointer.x = lerp(state.pointer.x, state.pointer.targetX, state.reduced ? 1 : 0.035)
    state.pointer.y = lerp(state.pointer.y, state.pointer.targetY, state.reduced ? 1 : 0.035)

    context.clearRect(0, 0, state.canvas.width, state.canvas.height)
    drawCorpus(time, state.visualScene)
    if (!state.reduced && state.visible) state.raf = window.requestAnimationFrame(drawFrame)
  }

  function startRendering() {
    if (!context) return
    window.cancelAnimationFrame(state.raf)
    if (state.reduced) drawFrame(performance.now(), true)
    else if (state.visible) state.raf = window.requestAnimationFrame(drawFrame)
  }

  function onVisibilityChange() {
    state.visible = !document.hidden
    if (!state.visible) {
      body.classList.add('is-paused')
      pauseDwell()
      window.cancelAnimationFrame(state.raf)
      state.raf = 0
    } else {
      body.classList.remove('is-paused')
      state.lastFrame = 0
      startRendering()
      if (state.dwellKey && state.dwellRemaining > 0) {
        const pausedScene = state.dwellKey === 'order' ? 2 : 3
        const remaining = state.dwellRemaining
        startDwell(pausedScene, remaining)
      }
    }
  }

  function onMotionPreferenceChange(event) {
    state.reduced = event.matches
    if (state.reduced) {
      finishFormation()
      state.visualScene = state.scene
    }
    startRendering()
  }

  renderSceneArticles()
  updateMemoryUI()
  updateSyncPanels()
  renderArchive()

  document.querySelectorAll('[data-open-archive]').forEach((button) => {
    button.addEventListener('click', () => openArchive(button.dataset.openArchive, button))
  })

  document.querySelectorAll('[data-open-about]').forEach((button) => {
    button.addEventListener('click', () => showDialog(aboutDialog, button))
  })

  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => closeDialog(button.closest('dialog')))
  })

  document.querySelectorAll('[data-close-reader]').forEach((button) => button.addEventListener('click', closeReader))

  document.querySelectorAll('[data-archive-mode]').forEach((button) => {
    button.addEventListener('click', () => setArchiveMode(button.dataset.archiveMode))
  })

  document.querySelectorAll('[data-clear-traces]').forEach((button) => {
    button.addEventListener('click', () => {
      state.memory = { read: [], relations: [], nodeAttempts: 0 }
      state.sync = { order: false, inward: false }
      saveMemory()
      updateMemoryUI()
      updateSyncPanels()
      renderArchive()
      showExitMemory('这台浏览器中的阅读痕迹已清除。文章本身没有改变。')
    })
  })

  archiveSearch.addEventListener('input', renderArchive)

  ;[archiveDialog, aboutDialog].forEach((dialog) => {
    dialog.addEventListener('close', onDialogClosed)
  })

  readerDialog.addEventListener('cancel', (event) => {
    event.preventDefault()
    closeReader()
  })
  readerDialog.addEventListener('close', onDialogClosed)

  readerShell.addEventListener('scroll', () => {
    const maximum = readerShell.scrollHeight - readerShell.clientHeight
    const progress = maximum > 0 ? clamp(readerShell.scrollTop / maximum) * 100 : 100
    readerShell.style.setProperty('--reader-progress', `${progress.toFixed(1)}%`)
  }, { passive: true })

  document.querySelectorAll('[data-go-scene]').forEach((control) => {
    control.addEventListener('click', (event) => {
      event.preventDefault()
      setScene(Number(control.dataset.goScene), { scroll: true })
    })
  })

  sceneLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      setScene(Number(link.dataset.sceneLink), { scroll: true })
    })
  })

  document.querySelector('.formation-skip').addEventListener('click', finishFormation)

  document.querySelector('.unopenable-node').addEventListener('click', () => {
    state.memory.nodeAttempts += 1
    saveMemory()
    state.nodeImpulse = performance.now() + 420
    const responses = [
      '节点响应了一次，但仍保留缺口。它不替你打开。',
      '越靠近，可见的部分反而越少。问题仍然属于你。',
      '结构记住了这次靠近，没有把它解释成答案。',
    ]
    nodeResponse.textContent = responses[(state.memory.nodeAttempts - 1) % responses.length]
  })

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', resizeCanvas, { passive: true })
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return
    state.pointer.targetX = clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1)
    state.pointer.targetY = clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1)
  }, { passive: true })
  window.addEventListener('pointerleave', () => {
    state.pointer.targetX = 0
    state.pointer.targetY = 0
  })
  document.addEventListener('visibilitychange', onVisibilityChange)
  prefersReducedMotion.addEventListener?.('change', onMotionPreferenceChange)

  resizeCanvas()
  body.classList.add('js-ready')
  startRendering()
  beginFormation()
})()
