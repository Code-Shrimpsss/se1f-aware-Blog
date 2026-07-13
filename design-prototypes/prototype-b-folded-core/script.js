(function () {
  'use strict'

  const content = window.SELF_AWAKE_CONTENT
  const body = document.body
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const mobileViewport = window.matchMedia('(max-width: 760px)')

  if (!content || !Array.isArray(content.articles)) {
    const formation = document.getElementById('formation')
    if (formation) formation.classList.add('is-complete')
    return
  }

  const articlesById = new Map(content.articles.map((article) => [article.id, article]))
  const themesById = new Map(content.themes.map((theme) => [theme.id, theme.label]))
  const scenes = Array.from(document.querySelectorAll('.scene'))
  const sceneLinks = Array.from(document.querySelectorAll('[data-scene-link]'))
  const sceneRailLinks = Array.from(document.querySelectorAll('.scene-rail [data-scene-link]'))
  const scenePosition = document.getElementById('scene-position')
  const sceneName = document.getElementById('scene-name')
  const foldCaption = document.getElementById('fold-caption')
  const reflectionQuestion = document.querySelector('.reflection-question')
  const archiveDialog = document.getElementById('archive-dialog')
  const readerDialog = document.getElementById('reader-dialog')
  const archiveTabs = Array.from(document.querySelectorAll('[role="tab"][data-panel]'))
  const archivePanels = Array.from(document.querySelectorAll('.archive-panel'))
  const searchInput = document.getElementById('thought-query')
  const searchResults = document.getElementById('search-results')
  const searchCount = document.getElementById('search-count')
  const dwellPanel = document.getElementById('dwell-panel')
  const dwellBar = document.getElementById('dwell-bar')
  const dwellStatus = document.getElementById('dwell-status')
  const storageKey = 'self-awake.prototype-b.trace.v1'
  const formationSessionKey = 'self-awake.prototype-b.formation-seen'

  const state = {
    scene: 0,
    wheelLocked: false,
    wheelAccumulator: 0,
    wheelResetTimer: 0,
    scrollFrame: 0,
    activePanel: 'articles',
    lastTrigger: null,
    dwellTimer: 0,
    dwellStartedAt: 0,
    dwellRemaining: 2400,
    touchStartY: 0,
    touchStartX: 0,
    touchStartScene: 0,
  }

  const safeStorage = {
    get(key, fallback) {
      try {
        const value = window.localStorage.getItem(key)
        return value ? JSON.parse(value) : fallback
      } catch (_error) {
        return fallback
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (_error) {
        // The experience remains complete when local storage is unavailable.
      }
    },
  }

  const safeSession = {
    get(key) {
      try {
        return window.sessionStorage.getItem(key)
      } catch (_error) {
        return null
      }
    },
    set(key, value) {
      try {
        window.sessionStorage.setItem(key, value)
      } catch (_error) {
        // Session memory is an enhancement, not a requirement.
      }
    },
  }

  const initialTrace = safeStorage.get(storageKey, { reads: [], dwell: false })
  const trace = {
    reads: Array.isArray(initialTrace.reads)
      ? initialTrace.reads
          .filter((item) => item && articlesById.has(item.id))
          .map((item) => ({ id: item.id, at: Number.isFinite(Number(item.at)) ? Number(item.at) : Date.now() }))
      : [],
    dwell: Boolean(initialTrace.dwell),
  }

  const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum)
  const pad = (value) => String(value).padStart(2, '0')
  const isDialogOpen = () => archiveDialog.hasAttribute('open') || readerDialog.hasAttribute('open')
  const isTextInput = (element) =>
    element && (element.matches('input, textarea, select, [contenteditable="true"]') || element.closest('dialog'))

  function saveTrace() {
    safeStorage.set(storageKey, trace)
  }

  function showDialog(dialog) {
    if (dialog.hasAttribute('open')) return
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
    body.classList.add('is-locked')
  }

  function closeDialog(dialog) {
    if (!dialog.hasAttribute('open')) return
    if (typeof dialog.close === 'function') dialog.close()
    else {
      dialog.removeAttribute('open')
      dialog.dispatchEvent(new Event('close'))
    }
  }

  /* Formation ----------------------------------------------------------- */
  const formation = document.getElementById('formation')
  const formationProgress = document.getElementById('formation-progress')
  const formationWord = document.getElementById('formation-word')
  const skipFormation = document.getElementById('skip-formation')
  let formationFrame = 0
  let formationElapsed = 0
  let formationPreviousTime = 0
  let formationFinished = false
  const hasFormedThisSession = safeSession.get(formationSessionKey) === 'yes'
  const formationDuration = prefersReducedMotion.matches ? 420 : hasFormedThisSession ? 900 : 2800

  function completeFormation() {
    if (formationFinished) return
    formationFinished = true
    window.cancelAnimationFrame(formationFrame)
    formationProgress.textContent = '100'
    formationWord.textContent = '结构形成，裂缝仍然开放'
    formation.classList.add('is-complete')
    formation.setAttribute('aria-hidden', 'true')
    body.classList.remove('is-forming')
    safeSession.set(formationSessionKey, 'yes')
  }

  function updateFormation(time) {
    if (formationFinished) return
    if (document.hidden) {
      formationPreviousTime = time
      formationFrame = window.requestAnimationFrame(updateFormation)
      return
    }

    if (!formationPreviousTime) formationPreviousTime = time
    formationElapsed += Math.min(time - formationPreviousTime, 50)
    formationPreviousTime = time

    const progress = clamp(formationElapsed / formationDuration, 0, 1)
    formationProgress.textContent = pad(Math.round(progress * 100))

    if (progress < 0.22) formationWord.textContent = '一次尚未命名的活动'
    else if (progress < 0.52) formationWord.textContent = '文字残片寻找彼此'
    else if (progress < 0.82) formationWord.textContent = '内侧与外侧正在确定'
    else formationWord.textContent = '最后一道缝隙没有闭合'

    if (progress >= 1) {
      completeFormation()
      return
    }
    formationFrame = window.requestAnimationFrame(updateFormation)
  }

  skipFormation.addEventListener('click', completeFormation)
  formationFrame = window.requestAnimationFrame(updateFormation)

  /* Scene state --------------------------------------------------------- */
  const captions = [
    ['完整只属于当前视角', '31°14′ / relation fold'],
    ['外侧接触现实', 'surface / observed'],
    ['内外交换，关系获得形状', 'adjacency / exchanged'],
    ['过去与现在共享同一折面', '2022 ≈ 2026'],
    ['观察顺序折回为边界', 'question / unanswered'],
  ]

  function updateReflection() {
    const readIds = trace.reads.map((item) => item.id)
    let questionIndex = 0
    if (trace.dwell) questionIndex = 3
    else if (readIds.includes('efficiency-silence')) questionIndex = 2
    else if (readIds.includes('evidence-before-answer')) questionIndex = 1
    reflectionQuestion.textContent = content.reflectionQuestions[questionIndex]
  }

  function setScene(nextScene) {
    const next = clamp(Number(nextScene) || 0, 0, scenes.length - 1)
    const previous = state.scene
    state.scene = next
    body.dataset.scene = String(next)

    scenes.forEach((section, index) => {
      section.classList.toggle('is-active', index === next)
      section.setAttribute('aria-current', index === next ? 'true' : 'false')
    })

    sceneRailLinks.forEach((link) => {
      const isCurrent = Number(link.dataset.sceneLink) === next
      if (isCurrent) link.setAttribute('aria-current', 'step')
      else link.removeAttribute('aria-current')
    })

    const layer = content.layers[next]
    scenePosition.textContent = `${layer.index} / 04`
    sceneName.textContent = `${layer.name} · ${layer.verb}`
    foldCaption.children[0].textContent = captions[next][0]
    foldCaption.children[1].textContent = captions[next][1]

    if (next === 3) startDwell()
    else if (previous === 3) stopDwell(true)
    if (next === 4) updateReflection()
  }

  function goToScene(nextScene, options) {
    const settings = Object.assign({ focus: false }, options)
    const next = clamp(Number(nextScene) || 0, 0, scenes.length - 1)
    setScene(next)
    scenes[next].scrollIntoView({
      block: 'start',
      behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
    })
    if (settings.focus) {
      window.setTimeout(() => scenes[next].focus({ preventScroll: true }), prefersReducedMotion.matches ? 0 : 520)
    }
  }

  sceneLinks.forEach((control) => {
    control.addEventListener('click', (event) => {
      event.preventDefault()
      goToScene(control.dataset.sceneLink)
    })
  })

  function syncSceneToScroll() {
    state.scrollFrame = 0
    if (isDialogOpen()) return
    const viewportCenter = window.innerHeight * 0.46
    let nearest = state.scene
    let nearestDistance = Infinity
    scenes.forEach((section, index) => {
      const rect = section.getBoundingClientRect()
      const sectionCenter = rect.top + rect.height / 2
      const distance = Math.abs(sectionCenter - viewportCenter)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearest = index
      }
    })
    if (nearest !== state.scene) setScene(nearest)
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!state.scrollFrame) state.scrollFrame = window.requestAnimationFrame(syncSceneToScroll)
    },
    { passive: true },
  )

  window.addEventListener(
    'wheel',
    (event) => {
      if (formationFinished === false) {
        event.preventDefault()
        return
      }
      if (isDialogOpen() || event.ctrlKey) return
      if (event.target.closest('.archive__body, .reader__shell')) return
      event.preventDefault()

      window.clearTimeout(state.wheelResetTimer)
      state.wheelResetTimer = window.setTimeout(() => {
        state.wheelLocked = false
        state.wheelAccumulator = 0
      }, 360)

      if (state.wheelLocked) return
      state.wheelAccumulator += event.deltaY
      if (Math.abs(state.wheelAccumulator) < 24) return

      const direction = state.wheelAccumulator > 0 ? 1 : -1
      state.wheelLocked = true
      goToScene(state.scene + direction)
    },
    { passive: false },
  )

  window.addEventListener(
    'touchstart',
    (event) => {
      if (isDialogOpen() || event.touches.length !== 1) return
      state.touchStartY = event.touches[0].clientY
      state.touchStartX = event.touches[0].clientX
      state.touchStartScene = state.scene
    },
    { passive: true },
  )

  window.addEventListener(
    'touchend',
    (event) => {
      if (isDialogOpen() || !state.touchStartY || event.changedTouches.length !== 1) return
      const deltaY = state.touchStartY - event.changedTouches[0].clientY
      const deltaX = state.touchStartX - event.changedTouches[0].clientX
      state.touchStartY = 0
      state.touchStartX = 0
      if (Math.abs(deltaY) < 44 || Math.abs(deltaY) < Math.abs(deltaX) * 1.2) return
      goToScene(state.touchStartScene + (deltaY > 0 ? 1 : -1))
    },
    { passive: true },
  )

  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || isTextInput(event.target)) return

    if (event.key === '/' && !readerDialog.hasAttribute('open')) {
      event.preventDefault()
      openArchive('search', event.target)
      return
    }

    if (event.key.toLowerCase() === 'i' && !readerDialog.hasAttribute('open')) {
      event.preventDefault()
      openArchive('articles', event.target)
      return
    }

    if (isDialogOpen()) return

    const forward = event.key === 'ArrowDown' || event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey)
    const backward = event.key === 'ArrowUp' || event.key === 'PageUp' || (event.key === ' ' && event.shiftKey)
    if (forward || backward || event.key === 'Home' || event.key === 'End') event.preventDefault()
    if (forward) goToScene(state.scene + 1)
    else if (backward) goToScene(state.scene - 1)
    else if (event.key === 'Home') goToScene(0)
    else if (event.key === 'End') goToScene(scenes.length - 1)
  })

  /* The only pointer response is a two-degree change in observation. */
  window.addEventListener(
    'pointermove',
    (event) => {
      if (prefersReducedMotion.matches || mobileViewport.matches || document.hidden || state.scene === 4) return
      const x = clamp((event.clientX / window.innerWidth - 0.5) * 3.2, -1.6, 1.6)
      const y = clamp((event.clientY / window.innerHeight - 0.5) * -2.8, -1.4, 1.4)
      document.documentElement.style.setProperty('--tilt-y', `${x.toFixed(2)}deg`)
      document.documentElement.style.setProperty('--tilt-x', `${y.toFixed(2)}deg`)
    },
    { passive: true },
  )

  /* Dwell reveals a relation rather than drawing a graph. */
  function startDwell() {
    if (trace.dwell) {
      revealDwell(false)
      return
    }
    if (state.dwellTimer || document.hidden) return

    dwellPanel.classList.add('is-counting')
    dwellPanel.classList.remove('is-revealed')
    dwellStatus.textContent = `在这里停留 ${(state.dwellRemaining / 1000).toFixed(1)} 秒，让两个年份靠近。`
    const completedFraction = 1 - state.dwellRemaining / 2400
    dwellBar.style.animation = 'none'
    dwellBar.style.transition = 'none'
    dwellBar.style.transform = `scaleX(${completedFraction})`
    window.requestAnimationFrame(() => {
      dwellBar.style.transition = `transform ${state.dwellRemaining}ms linear`
      dwellBar.style.transform = 'scaleX(1)'
    })

    state.dwellStartedAt = performance.now()
    state.dwellTimer = window.setTimeout(() => revealDwell(true), state.dwellRemaining)
  }

  function pauseDwell() {
    if (!state.dwellTimer || trace.dwell) return
    const elapsed = performance.now() - state.dwellStartedAt
    state.dwellRemaining = clamp(state.dwellRemaining - elapsed, 0, 2400)
    window.clearTimeout(state.dwellTimer)
    state.dwellTimer = 0
    dwellPanel.classList.remove('is-counting')
    dwellBar.style.transition = 'none'
    dwellBar.style.transform = `scaleX(${1 - state.dwellRemaining / 2400})`
  }

  function stopDwell(reset) {
    if (trace.dwell) return
    pauseDwell()
    if (reset) {
      state.dwellRemaining = 2400
      dwellBar.style.transition = 'none'
      dwellBar.style.transform = 'scaleX(0)'
      dwellStatus.textContent = '在这里停留 2.4 秒，让两个年份靠近。'
    }
  }

  function revealDwell(remember) {
    window.clearTimeout(state.dwellTimer)
    state.dwellTimer = 0
    state.dwellRemaining = 0
    body.classList.add('time-fold-revealed')
    dwellPanel.classList.remove('is-counting')
    dwellPanel.classList.add('is-revealed')
    dwellBar.style.transition = 'none'
    dwellBar.style.transform = 'scaleX(1)'
    dwellStatus.textContent = '2022 与 2026 已在同一折面相邻。'
    if (remember && !trace.dwell) {
      trace.dwell = true
      saveTrace()
      renderPrivateTrace()
      updateReflection()
    }
  }

  /* Archive and reliable search ---------------------------------------- */
  function formatDate(date) {
    return String(date).replaceAll('-', '.')
  }

  function createArticleIndexItem(article) {
    const item = document.createElement('li')
    const link = document.createElement('a')
    const time = document.createElement('time')
    const text = document.createElement('span')
    const status = document.createElement('b')
    const title = document.createElement('strong')
    const summary = document.createElement('em')
    const minutes = document.createElement('small')

    link.href = `#article-${article.id}`
    link.dataset.article = article.id
    time.dateTime = article.date
    time.textContent = formatDate(article.date)
    status.textContent = `${article.status} · ${article.kind}`
    title.textContent = article.title
    summary.textContent = article.summary
    minutes.textContent = `${article.minutes} min ↗`
    text.append(status, title, summary)
    link.append(time, text, minutes)
    item.append(link)
    return item
  }

  function renderArticleIndex() {
    const list = document.getElementById('article-index')
    list.replaceChildren(...content.articles.slice().sort((a, b) => b.date.localeCompare(a.date)).map(createArticleIndexItem))
  }

  function searchableText(article) {
    const themes = article.themes.map((theme) => themesById.get(theme) || theme).join(' ')
    return [article.title, article.shortTitle, article.summary, article.excerpt, article.kind, article.status, article.date, themes]
      .join(' ')
      .toLocaleLowerCase('zh-CN')
  }

  function runSearch() {
    const query = searchInput.value.trim().toLocaleLowerCase('zh-CN')
    if (!query) {
      searchResults.replaceChildren()
      searchCount.textContent = '输入标题、摘要、类型或主题。'
      return
    }
    const matches = content.articles.filter((article) => searchableText(article).includes(query))
    searchResults.replaceChildren(...matches.map(createArticleIndexItem))
    searchCount.textContent = matches.length ? `找到 ${matches.length} 篇相关文字。` : `没有找到“${searchInput.value.trim()}”。可以尝试：证据、时间、选择。`
  }

  function renderTimeline() {
    const timeline = document.getElementById('timeline-list')
    const items = content.articles
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((article) => {
        const item = document.createElement('li')
        const time = document.createElement('time')
        const button = document.createElement('button')
        const meta = document.createElement('span')
        time.dateTime = article.date
        time.textContent = article.year
        button.type = 'button'
        button.dataset.article = article.id
        button.append(document.createTextNode(article.shortTitle))
        meta.textContent = `${article.kind} · ${article.status}`
        button.append(meta)
        item.append(time, button)
        return item
      })
    timeline.replaceChildren(...items)
  }

  function renderPrivateTrace() {
    const container = document.getElementById('private-trace')
    if (!trace.reads.length && !trace.dwell) {
      const empty = document.createElement('div')
      empty.className = 'private-trace__empty'
      empty.innerHTML = '<p>还没有阅读痕迹。<br />打开一篇文字，空间才会记住一条只属于此浏览器的路径。</p>'
      container.replaceChildren(empty)
      return
    }

    const fragment = document.createDocumentFragment()
    if (trace.reads.length) {
      const list = document.createElement('ol')
      list.className = 'private-trace__list'
      trace.reads.forEach((read, index) => {
        const article = articlesById.get(read.id)
        if (!article) return
        const item = document.createElement('li')
        const position = document.createElement('span')
        const button = document.createElement('button')
        const time = document.createElement('time')
        position.textContent = pad(index + 1)
        button.type = 'button'
        button.dataset.article = article.id
        button.textContent = article.shortTitle
        time.dateTime = new Date(read.at).toISOString()
        time.textContent = article.year
        item.append(position, button, time)
        list.append(item)
      })
      fragment.append(list)
    }

    if (trace.dwell) {
      const relation = document.createElement('p')
      relation.className = 'private-trace__relation'
      relation.textContent = '一次认真停留使“效率没有回答的部分”（2022）与“未被命名之前”（2026）共享了同一条折边。'
      fragment.append(relation)
    }
    container.replaceChildren(fragment)
  }

  function selectPanel(panelName, moveFocus) {
    const panel = archivePanels.find((candidate) => candidate.id === `panel-${panelName}`) || archivePanels[0]
    state.activePanel = panel.id.replace('panel-', '')
    archiveTabs.forEach((tab) => {
      const selected = tab.dataset.panel === state.activePanel
      tab.setAttribute('aria-selected', String(selected))
      tab.tabIndex = selected ? 0 : -1
    })
    archivePanels.forEach((candidate) => {
      const selected = candidate === panel
      candidate.hidden = !selected
      candidate.classList.toggle('is-active', selected)
    })
    if (moveFocus) {
      if (state.activePanel === 'search') window.setTimeout(() => searchInput.focus(), 80)
      else window.setTimeout(() => archiveTabs.find((tab) => tab.dataset.panel === state.activePanel).focus(), 80)
    }
  }

  function openArchive(panelName, trigger) {
    state.lastTrigger = trigger instanceof Element ? trigger : document.activeElement
    if (readerDialog.hasAttribute('open')) closeDialog(readerDialog)
    selectPanel(panelName || 'articles', false)
    showDialog(archiveDialog)
    window.setTimeout(() => {
      if (state.activePanel === 'search') searchInput.focus()
      else archiveTabs.find((tab) => tab.dataset.panel === state.activePanel).focus()
    }, 80)
  }

  document.querySelectorAll('[data-open-panel]').forEach((button) => {
    button.addEventListener('click', () => openArchive(button.dataset.openPanel, button))
  })

  archiveTabs.forEach((tab) => {
    tab.addEventListener('click', () => selectPanel(tab.dataset.panel, false))
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      const current = archiveTabs.indexOf(tab)
      const direction = event.key === 'ArrowRight' ? 1 : -1
      const next = (current + direction + archiveTabs.length) % archiveTabs.length
      selectPanel(archiveTabs[next].dataset.panel, true)
    })
  })

  document.getElementById('clear-search').addEventListener('click', () => {
    searchInput.value = ''
    runSearch()
    searchInput.focus()
  })
  searchInput.addEventListener('input', runSearch)

  archiveDialog.addEventListener('click', (event) => {
    if (event.target === archiveDialog) closeDialog(archiveDialog)
  })
  archiveDialog.addEventListener('cancel', (event) => {
    event.preventDefault()
    closeDialog(archiveDialog)
  })
  archiveDialog.addEventListener('close', () => {
    if (!readerDialog.hasAttribute('open')) body.classList.remove('is-locked')
    if (state.lastTrigger && state.lastTrigger.isConnected) state.lastTrigger.focus({ preventScroll: true })
  })
  document.querySelector('[data-close-dialog]').addEventListener('click', () => closeDialog(archiveDialog))

  /* Article reading layer ---------------------------------------------- */
  function rememberArticle(article) {
    const existing = trace.reads.findIndex((item) => item.id === article.id)
    if (existing >= 0) trace.reads.splice(existing, 1)
    trace.reads.push({ id: article.id, at: Date.now() })
    if (trace.reads.length > 12) trace.reads.shift()
    saveTrace()
    renderPrivateTrace()
    updateReflection()
  }

  function relationForArticle(articleId) {
    return content.relations.filter((relation) => relation.from === articleId || relation.to === articleId).slice(0, 2)
  }

  function fillReader(article) {
    document.getElementById('reader-kicker').textContent = `${article.date} / ${article.kind} / ${article.status}`
    document.getElementById('reader-title').textContent = article.title
    document.getElementById('reader-summary').textContent = article.summary

    const meta = document.getElementById('reader-meta')
    const metadata = [
      ['阅读', `${article.minutes} 分钟`],
      ['层级', content.layers.find((layer) => layer.id === article.layer)?.name || article.layer],
      ['深度', `${article.depth} / 5`],
      ['主题', article.themes.map((theme) => themesById.get(theme) || theme).join(' · ')],
    ]
    meta.replaceChildren(
      ...metadata.map(([term, description]) => {
        const group = document.createElement('div')
        const dt = document.createElement('dt')
        const dd = document.createElement('dd')
        dt.textContent = term
        dd.textContent = description
        group.append(dt, dd)
        return group
      }),
    )

    const readerBody = document.getElementById('reader-body')
    readerBody.replaceChildren(
      ...article.paragraphs.map((paragraph) => {
        const element = document.createElement('p')
        element.textContent = paragraph
        return element
      }),
    )

    const related = document.getElementById('reader-related')
    related.replaceChildren(
      ...relationForArticle(article.id).map((relation) => {
        const otherId = relation.from === article.id ? relation.to : relation.from
        const otherArticle = articlesById.get(otherId)
        const button = document.createElement('button')
        const label = document.createElement('span')
        button.type = 'button'
        button.dataset.article = otherId
        label.textContent = `${relation.type} / ${relation.years}`
        button.append(label, document.createTextNode(`${relation.label} → ${otherArticle.shortTitle}`))
        return button
      }),
    )
    document.querySelector('.reader__shell').scrollTop = 0
  }

  function openArticle(articleId, trigger) {
    const article = articlesById.get(articleId)
    if (!article) return
    state.lastTrigger = trigger instanceof Element ? trigger : document.activeElement
    if (archiveDialog.hasAttribute('open')) closeDialog(archiveDialog)
    fillReader(article)
    rememberArticle(article)
    showDialog(readerDialog)
    window.setTimeout(() => document.querySelector('[data-close-reader]').focus(), 60)
  }

  document.addEventListener('click', (event) => {
    const articleControl = event.target.closest('[data-article]')
    if (!articleControl) return
    event.preventDefault()
    openArticle(articleControl.dataset.article, articleControl)
  })

  document.querySelector('[data-close-reader]').addEventListener('click', () => closeDialog(readerDialog))
  document.querySelector('[data-reader-home]').addEventListener('click', (event) => {
    event.preventDefault()
    closeDialog(readerDialog)
    goToScene(0)
  })
  readerDialog.addEventListener('cancel', (event) => {
    event.preventDefault()
    closeDialog(readerDialog)
  })
  readerDialog.addEventListener('close', () => {
    if (!archiveDialog.hasAttribute('open')) body.classList.remove('is-locked')
    if (state.lastTrigger && state.lastTrigger.isConnected) state.lastTrigger.focus({ preventScroll: true })
  })

  /* Visibility is a real pause, including the dwell threshold. */
  document.addEventListener('visibilitychange', () => {
    body.classList.toggle('is-paused', document.hidden)
    if (document.hidden) {
      if (state.scene === 3) pauseDwell()
    } else if (state.scene === 3 && !trace.dwell) {
      startDwell()
    }
  })

  prefersReducedMotion.addEventListener('change', () => {
    if (prefersReducedMotion.matches) {
      document.documentElement.style.setProperty('--tilt-x', '0deg')
      document.documentElement.style.setProperty('--tilt-y', '0deg')
    }
  })

  renderArticleIndex()
  renderTimeline()
  renderPrivateTrace()
  updateReflection()
  if (trace.dwell) revealDwell(false)
  setScene(0)
  body.classList.add('is-enhanced')
  document.getElementById('plain-index').hidden = true

  const initialArticle = window.location.hash.match(/^#article-(.+)$/)
  if (initialArticle && articlesById.has(initialArticle[1])) {
    window.setTimeout(() => openArticle(initialArticle[1], null), formationDuration + 120)
  }
})()
