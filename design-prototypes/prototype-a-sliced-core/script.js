(function () {
  'use strict'

  const content = window.SELF_AWAKE_CONTENT
  const body = document.body
  const formation = document.querySelector('[data-formation]')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

  const sceneSections = Array.from(document.querySelectorAll('[data-scene-section]'))
  const sceneButtons = Array.from(document.querySelectorAll('.scene-nav [data-go-scene]'))
  const currentIndexNode = document.querySelector('[data-current-index]')
  const currentNameNode = document.querySelector('[data-current-name]')
  const liveRegion = document.querySelector('[data-live-region]')
  const ordinaryIndex = document.querySelector('#ordinary-index')
  const coreObserver = document.querySelector('[data-core-observer]')

  const libraryDialog = document.querySelector('[data-library]')
  const libraryTitle = document.querySelector('#library-title')
  const libraryContent = document.querySelector('[data-library-content]')
  const libraryTabs = Array.from(document.querySelectorAll('[data-library-view]'))
  const searchForm = document.querySelector('[data-search-form]')
  const searchInput = document.querySelector('#space-search')
  const searchStatus = document.querySelector('[data-search-status]')

  const readerDialog = document.querySelector('[data-reader]')
  const readerMeta = document.querySelector('[data-reader-meta]')
  const readerTitle = document.querySelector('[data-reader-title]')
  const readerSummary = document.querySelector('[data-reader-summary]')
  const readerBody = document.querySelector('[data-reader-body]')
  const readerRelated = document.querySelector('[data-reader-related]')
  const reflectionQuestion = document.querySelector('[data-reflection-question]')
  const privateTrace = document.querySelector('[data-private-trace]')
  const dwellCopy = document.querySelector('[data-dwell-copy]')

  const STORAGE_HISTORY = 'self-awake.sliced-core.history.v1'
  const STORAGE_CONNECTIONS = 'self-awake.sliced-core.connections.v1'
  const DWELL_RELATION = 'efficiency-silence::unnamed-real'
  const DWELL_DURATION = 2400

  let currentScene = 0
  let libraryView = 'articles'
  let wheelLockedUntil = 0
  let scrollFrame = 0
  let pointerFrame = 0
  let pointerX = 0
  let pointerY = 0
  let dwellTimer = 0
  let dwellStartedAt = 0
  let dwellRemaining = DWELL_DURATION
  let isFormationComplete = false
  let history = readStorage(STORAGE_HISTORY, [])
  let revealedConnections = readStorage(STORAGE_CONNECTIONS, [])
  let connectionSeen = revealedConnections.includes(DWELL_RELATION)

  if (!Array.isArray(history)) history = []
  if (!Array.isArray(revealedConnections)) revealedConnections = []

  function readStorage(key, fallback) {
    try {
      const value = window.localStorage.getItem(key)
      return value ? JSON.parse(value) : fallback
    } catch (_error) {
      return fallback
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (_error) {
      // The experience remains complete when local persistence is unavailable.
    }
  }

  function announce(message) {
    if (!liveRegion) return
    liveRegion.textContent = ''
    window.setTimeout(function () {
      liveRegion.textContent = message
    }, 20)
  }

  function showDialog(dialog) {
    if (!dialog) return
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal()
    } else {
      dialog.setAttribute('open', '')
    }
    body.classList.add('dialog-open')
  }

  function closeDialog(dialog) {
    if (!dialog) return
    if (typeof dialog.close === 'function' && dialog.open) dialog.close()
    else dialog.removeAttribute('open')
    if (!libraryDialog.open && !readerDialog.open) body.classList.remove('dialog-open')
  }

  function articleById(id) {
    if (!content || !Array.isArray(content.articles)) return null
    return content.articles.find(function (article) {
      return article.id === id
    }) || null
  }

  function themeLabel(id) {
    if (!content || !Array.isArray(content.themes)) return id
    const theme = content.themes.find(function (item) {
      return item.id === id
    })
    return theme ? theme.label : id
  }

  function historyIds() {
    return history.map(function (entry) {
      return typeof entry === 'string' ? entry : entry.id
    }).filter(Boolean)
  }

  function recordArticle(id) {
    const existing = history.find(function (entry) {
      return (typeof entry === 'string' ? entry : entry.id) === id
    })

    if (existing && typeof existing === 'object') {
      existing.visits = (existing.visits || 1) + 1
      existing.lastReadAt = new Date().toISOString()
    } else if (!existing) {
      history.push({ id: id, visits: 1, lastReadAt: new Date().toISOString() })
    }

    writeStorage(STORAGE_HISTORY, history)
    updateReflection()
    updatePrivateTrace()
  }

  function updateReflection() {
    if (!reflectionQuestion || !content || !content.reflectionQuestions) return
    const ids = historyIds()
    let index = 0

    if (ids.includes('efficiency-silence')) index = 2
    else if (ids.includes('aigc-revolution')) index = 1
    else if (ids.includes('docker-standards')) index = 3
    else if (ids.length) index = Math.min(ids.length - 1, content.reflectionQuestions.length - 1)

    reflectionQuestion.textContent = content.reflectionQuestions[index]
  }

  function updatePrivateTrace() {
    if (!privateTrace) return
    const count = new Set(historyIds()).size
    const relationCount = revealedConnections.length

    if (!count && !relationCount) {
      privateTrace.textContent = '这台浏览器尚未留下阅读痕迹。'
      return
    }

    privateTrace.textContent = '当前浏览器记得 ' + count + ' 个阅读切面，以及 ' + relationCount + ' 道已经显影的连接。'
  }

  function finishFormation() {
    if (isFormationComplete) return
    isFormationComplete = true
    body.classList.remove('is-forming')
    if (formation) formation.classList.add('is-complete')
    announce('思想核心已经形成，最后一道缝隙仍然打开。')
  }

  function startFormation() {
    if (!formation) {
      finishFormation()
      return
    }

    const progressNode = formation.querySelector('[data-formation-progress]')
    const copyNode = formation.querySelector('[data-formation-copy]')
    const duration = reduceMotion.matches ? 900 : 2900
    const phases = [
      [0, '一个意识节点正在寻找它的第一道联系'],
      [23, '文字残片沿不可见的秩序出现'],
      [48, '白色剖片开始确认彼此的位置'],
      [72, '空间正在形成，但拒绝彻底闭合'],
      [91, '保留最后一道缝隙'],
    ]

    body.classList.add('is-forming')
    let visibleElapsed = 0
    let lastTimestamp = 0

    function frame(timestamp) {
      if (isFormationComplete) return
      if (!lastTimestamp) lastTimestamp = timestamp
      if (!document.hidden) visibleElapsed += timestamp - lastTimestamp
      lastTimestamp = timestamp

      const progress = Math.min(100, Math.round((visibleElapsed / duration) * 100))
      if (progressNode) progressNode.textContent = String(progress).padStart(2, '0')

      let copy = phases[0][1]
      phases.forEach(function (phase) {
        if (progress >= phase[0]) copy = phase[1]
      })
      if (copyNode) copyNode.textContent = copy

      if (progress >= 100) {
        window.setTimeout(finishFormation, reduceMotion.matches ? 80 : 330)
      } else {
        window.requestAnimationFrame(frame)
      }
    }

    window.requestAnimationFrame(frame)
  }

  function stopDwell(preserveRemaining) {
    if (!dwellTimer) return
    window.clearTimeout(dwellTimer)
    dwellTimer = 0

    if (preserveRemaining && dwellStartedAt) {
      dwellRemaining = Math.max(120, dwellRemaining - (performance.now() - dwellStartedAt))
    } else if (!preserveRemaining) {
      dwellRemaining = DWELL_DURATION
    }

    dwellStartedAt = 0
    body.classList.remove('is-dwelling')
  }

  function revealTemporalConnection() {
    stopDwell(false)
    connectionSeen = true

    if (!revealedConnections.includes(DWELL_RELATION)) {
      revealedConnections.push(DWELL_RELATION)
      writeStorage(STORAGE_CONNECTIONS, revealedConnections)
    }

    if (currentScene === 3) body.classList.add('connection-visible')
    if (dwellCopy) dwellCopy.textContent = '连接已显影：2022 的停顿抵达 2026 未被命名的问题'
    updatePrivateTrace()
    announce('跨时间连接已经显影。2022 的停顿与 2026 未被命名的问题短暂对齐。')
  }

  function startDwell() {
    if (currentScene !== 3 || document.hidden || connectionSeen || dwellTimer) return
    body.classList.add('is-dwelling')
    dwellStartedAt = performance.now()
    dwellTimer = window.setTimeout(revealTemporalConnection, dwellRemaining)
  }

  function setScene(index, options) {
    const next = Math.max(0, Math.min(sceneSections.length - 1, Number(index) || 0))
    const changed = next !== currentScene
    currentScene = next
    body.dataset.scene = String(next)

    sceneSections.forEach(function (section, sceneIndex) {
      section.classList.toggle('is-current', sceneIndex === next)
      section.setAttribute('aria-current', sceneIndex === next ? 'true' : 'false')
    })

    sceneButtons.forEach(function (button, sceneIndex) {
      const active = sceneIndex === next
      button.classList.toggle('is-active', active)
      if (active) button.setAttribute('aria-current', 'step')
      else button.removeAttribute('aria-current')
    })

    const layer = content && content.layers ? content.layers[next] : null
    if (currentIndexNode) currentIndexNode.textContent = layer ? layer.index : String(next).padStart(2, '0')
    if (currentNameNode) currentNameNode.textContent = layer ? layer.name + ' · ' + layer.verb : '场景 ' + (next + 1)

    if (next === 3) {
      body.classList.toggle('connection-visible', connectionSeen)
      if (connectionSeen && dwellCopy) dwellCopy.textContent = '连接已显影：2022 的停顿抵达 2026 未被命名的问题'
      else startDwell()
    } else {
      stopDwell(false)
      body.classList.remove('connection-visible')
    }

    if (changed && (!options || options.announce !== false)) {
      announce((layer ? layer.index + ' ' + layer.name + '。' + layer.prompt : '场景 ' + (next + 1)))
    }
  }

  function goToScene(index, options) {
    const next = Math.max(0, Math.min(sceneSections.length - 1, Number(index) || 0))
    const section = sceneSections[next]
    if (!section) return

    setScene(next, options)
    section.scrollIntoView({
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
      block: 'start',
    })

    if (options && options.focus) {
      window.setTimeout(function () {
        section.focus({ preventScroll: true })
      }, reduceMotion.matches ? 0 : 620)
    }
  }

  function closestSceneFromScroll() {
    if (!sceneSections.length) return 0
    const viewportTarget = window.innerHeight * 0.48
    let closest = currentScene
    let closestDistance = Number.POSITIVE_INFINITY

    sceneSections.forEach(function (section, index) {
      const rect = section.getBoundingClientRect()
      const distance = Math.abs(rect.top + rect.height * 0.5 - viewportTarget)
      if (distance < closestDistance) {
        closestDistance = distance
        closest = index
      }
    })

    return closest
  }

  function onScroll() {
    if (scrollFrame) return
    scrollFrame = window.requestAnimationFrame(function () {
      scrollFrame = 0
      if (ordinaryIndex && ordinaryIndex.getBoundingClientRect().top < window.innerHeight * 0.4) {
        setScene(sceneSections.length - 1, { announce: false })
        return
      }
      setScene(closestSceneFromScroll(), { announce: false })
    })
  }

  function onWheel(event) {
    if (!isFormationComplete || libraryDialog.open || readerDialog.open || event.ctrlKey) return
    if (Math.abs(event.deltaY) < 14) return
    if (ordinaryIndex && ordinaryIndex.getBoundingClientRect().top < window.innerHeight * 0.7) return

    const direction = event.deltaY > 0 ? 1 : -1
    const next = currentScene + direction
    if (next < 0 || next >= sceneSections.length) return

    event.preventDefault()
    const now = performance.now()
    if (now < wheelLockedUntil) return
    wheelLockedUntil = now + (reduceMotion.matches ? 260 : 860)
    goToScene(next)
  }

  function onKeydown(event) {
    const target = event.target
    const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
    if (isTyping || libraryDialog.open || readerDialog.open) return

    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      if (currentScene < sceneSections.length - 1) {
        event.preventDefault()
        goToScene(currentScene + 1, { focus: true })
      }
    } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      if (currentScene > 0) {
        event.preventDefault()
        goToScene(currentScene - 1, { focus: true })
      }
    } else if (event.key === 'Home') {
      event.preventDefault()
      goToScene(0, { focus: true })
    }
  }

  function onPointerMove(event) {
    if (!finePointer.matches || reduceMotion.matches || document.hidden || !coreObserver) return
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2
    if (pointerFrame) return

    pointerFrame = window.requestAnimationFrame(function () {
      pointerFrame = 0
      coreObserver.style.setProperty('--observer-y', (pointerX * 2.2).toFixed(2) + 'deg')
      coreObserver.style.setProperty('--observer-x', (-pointerY * 1.5).toFixed(2) + 'deg')
    })
  }

  function searchableText(article) {
    return [
      article.title,
      article.shortTitle,
      article.summary,
      article.excerpt,
      article.kind,
      article.status,
    ].concat((article.themes || []).map(themeLabel)).join(' ').toLocaleLowerCase('zh-CN')
  }

  function articleButton(article) {
    const button = document.createElement('button')
    const date = document.createElement('span')
    const detail = document.createElement('div')
    const title = document.createElement('b')
    const summary = document.createElement('small')
    const metadata = document.createElement('em')

    button.type = 'button'
    button.className = 'library-item'
    button.dataset.articleId = article.id
    date.textContent = article.date
    title.textContent = article.title
    summary.textContent = article.summary
    metadata.textContent = article.kind + ' / ' + article.minutes + ' 分钟 / ' + article.status
    detail.append(title, summary, metadata)
    button.append(date, detail)
    return button
  }

  function renderArticles(query) {
    if (!libraryContent || !content) return
    const normalized = (query || '').trim().toLocaleLowerCase('zh-CN')
    const articles = content.articles.filter(function (article) {
      return !normalized || searchableText(article).includes(normalized)
    })
    const list = document.createElement('div')
    list.className = 'library-list'
    articles.forEach(function (article) {
      list.append(articleButton(article))
    })

    libraryContent.replaceChildren(list)
    if (searchStatus) {
      searchStatus.textContent = normalized
        ? '找到 ' + articles.length + ' 个与“' + query.trim() + '”有关的切面。'
        : '共 ' + articles.length + ' 篇；可搜索标题、摘要、类型与主题。'
    }

    if (!articles.length) {
      const empty = document.createElement('p')
      empty.className = 'empty-trace'
      empty.textContent = '没有找到相符的切面。换一个更接近内容的词，例如“证据”“时间”或“选择”。'
      list.append(empty)
    }
  }

  function renderConnections() {
    if (!libraryContent || !content) return
    const readIds = new Set(historyIds())
    const visible = content.relations.filter(function (relation) {
      const key = relation.from + '::' + relation.to
      return revealedConnections.includes(key) || (readIds.has(relation.from) && readIds.has(relation.to))
    })

    if (!visible.length) {
      const empty = document.createElement('div')
      empty.className = 'empty-trace'
      empty.innerHTML = '<p>尚无连接被照亮。</p><p>认真停留在「观心」，或阅读两个具有共同问题的切面，私人连接才会显现。</p>'
      libraryContent.replaceChildren(empty)
      return
    }

    const list = document.createElement('div')
    list.className = 'trace-list'
    visible.forEach(function (relation) {
      const item = document.createElement('div')
      const years = document.createElement('span')
      const copy = document.createElement('div')
      const title = document.createElement('b')
      const detail = document.createElement('p')
      item.className = 'trace-item'
      years.textContent = relation.years || relation.type
      title.textContent = relation.label
      detail.textContent = articleById(relation.from).shortTitle + ' → ' + articleById(relation.to).shortTitle
      copy.append(title, detail)
      item.append(years, copy)
      list.append(item)
    })
    libraryContent.replaceChildren(list)
  }

  function renderTime() {
    if (!libraryContent || !content) return
    const list = document.createElement('div')
    list.className = 'time-list'
    content.articles.slice().sort(function (a, b) {
      return b.date.localeCompare(a.date)
    }).forEach(function (article) {
      const item = document.createElement('div')
      const year = document.createElement('span')
      const copy = document.createElement('div')
      const title = document.createElement('b')
      const summary = document.createElement('p')
      item.className = 'time-item'
      year.textContent = article.date
      title.textContent = article.shortTitle
      summary.textContent = article.kind + ' / ' + article.status
      copy.append(title, summary)
      item.append(year, copy)
      item.tabIndex = 0
      item.setAttribute('role', 'button')
      item.dataset.articleId = article.id
      list.append(item)
    })
    libraryContent.replaceChildren(list)
  }

  function renderAbout() {
    if (!libraryContent || !content) return
    const about = document.createElement('div')
    about.className = 'about-copy'
    const heading = document.createElement('h3')
    const paragraphOne = document.createElement('p')
    const paragraphTwo = document.createElement('p')
    heading.textContent = '一座持续形成的意识建筑'
    paragraphOne.textContent = content.brand.statement + ' 这里不先解释作者的履历，而让写作、经验与判断在它们真实的关系里出现。'
    paragraphTwo.textContent = '首页负责体验意识；文章阅读层负责安静阅读。原型内容均明确标注，尚不被当作作者已经发生过的经历或结论。'
    about.append(heading, paragraphOne, paragraphTwo)
    libraryContent.replaceChildren(about)
  }

  function setLibraryView(view) {
    libraryView = ['articles', 'connections', 'time', 'about'].includes(view) ? view : 'articles'
    libraryTabs.forEach(function (button) {
      button.classList.toggle('is-active', button.dataset.libraryView === libraryView)
    })
    libraryTitle.textContent = {
      articles: '文章索引',
      connections: '已照亮的连接',
      time: '思想时间',
      about: '关于此处',
    }[libraryView]

    searchForm.hidden = libraryView !== 'articles'
    if (libraryView === 'articles') renderArticles(searchInput.value)
    else if (libraryView === 'connections') renderConnections()
    else if (libraryView === 'time') renderTime()
    else renderAbout()
  }

  function openLibrary(view) {
    const shouldFocusSearch = view === 'search'
    setLibraryView(shouldFocusSearch ? 'articles' : view)
    showDialog(libraryDialog)
    window.setTimeout(function () {
      if (shouldFocusSearch) searchInput.focus()
      else {
        const activeTab = libraryTabs.find(function (tab) { return tab.classList.contains('is-active') })
        if (activeTab) activeTab.focus()
      }
    }, 30)
  }

  function openArticle(id) {
    const article = articleById(id)
    if (!article || !readerDialog) return

    closeDialog(libraryDialog)
    readerMeta.textContent = article.date + ' / ' + article.kind + ' / 深度 ' + article.depth + ' / ' + article.minutes + ' 分钟 / ' + article.status
    readerTitle.textContent = article.title
    readerSummary.textContent = article.summary
    readerBody.replaceChildren()
    article.paragraphs.forEach(function (paragraph) {
      const node = document.createElement('p')
      node.textContent = paragraph
      readerBody.append(node)
    })

    const relatedIds = []
    content.relations.forEach(function (relation) {
      if (relation.from === id) relatedIds.push(relation.to)
      else if (relation.to === id) relatedIds.push(relation.from)
    })
    readerRelated.replaceChildren()
    const relatedList = document.createElement('div')
    relatedList.className = 'reader-related'
    Array.from(new Set(relatedIds)).slice(0, 2).forEach(function (relatedId) {
      const relatedArticle = articleById(relatedId)
      if (!relatedArticle) return
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.articleId = relatedArticle.id
      button.textContent = '沿相关切面阅读：' + relatedArticle.shortTitle
      relatedList.append(button)
    })
    if (relatedList.children.length) readerRelated.append(relatedList)

    recordArticle(article.id)
    showDialog(readerDialog)
    readerDialog.scrollTop = 0
    window.setTimeout(function () { readerTitle.focus({ preventScroll: true }) }, 30)
  }

  document.querySelectorAll('[data-go-scene]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault()
      closeDialog(libraryDialog)
      closeDialog(readerDialog)
      goToScene(button.dataset.goScene, { focus: true })
    })
  })

  document.querySelectorAll('[data-open-library]').forEach(function (button) {
    button.addEventListener('click', function () {
      openLibrary(button.dataset.openLibrary)
    })
  })

  document.querySelectorAll('[data-article-id]').forEach(function (element) {
    element.addEventListener('click', function (event) {
      event.preventDefault()
      openArticle(element.dataset.articleId)
    })
  })

  document.querySelector('[data-skip-formation]').addEventListener('click', finishFormation)
  document.querySelector('[data-close-library]').addEventListener('click', function () { closeDialog(libraryDialog) })
  document.querySelector('[data-close-reader]').addEventListener('click', function () { closeDialog(readerDialog) })
  document.querySelector('[data-reader-home]').addEventListener('click', function (event) {
    event.preventDefault()
    closeDialog(readerDialog)
    goToScene(0, { focus: true })
  })

  libraryTabs.forEach(function (button) {
    button.addEventListener('click', function () {
      setLibraryView(button.dataset.libraryView)
    })
  })

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault()
    setLibraryView('articles')
    renderArticles(searchInput.value)
    const firstResult = libraryContent.querySelector('[data-article-id]')
    if (firstResult) firstResult.focus()
  })

  searchInput.addEventListener('input', function () {
    if (libraryView === 'articles') renderArticles(searchInput.value)
  })

  libraryContent.addEventListener('click', function (event) {
    const target = event.target.closest('[data-article-id]')
    if (target) openArticle(target.dataset.articleId)
  })

  libraryContent.addEventListener('keydown', function (event) {
    const target = event.target.closest('[data-article-id]')
    if (target && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      openArticle(target.dataset.articleId)
    }
  })

  readerRelated.addEventListener('click', function (event) {
    const target = event.target.closest('[data-article-id]')
    if (target) openArticle(target.dataset.articleId)
  })

  document.querySelector('[data-clear-history]').addEventListener('click', function (event) {
    history = []
    revealedConnections = []
    connectionSeen = false
    writeStorage(STORAGE_HISTORY, history)
    writeStorage(STORAGE_CONNECTIONS, revealedConnections)
    body.classList.remove('connection-visible')
    updateReflection()
    updatePrivateTrace()
    if (libraryView === 'connections') renderConnections()
    event.currentTarget.textContent = '本地痕迹已清除'
    announce('当前浏览器的阅读痕迹已清除。')
  })

  ;[libraryDialog, readerDialog].forEach(function (dialog) {
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) closeDialog(dialog)
    })
    dialog.addEventListener('close', function () {
      if (!libraryDialog.open && !readerDialog.open) body.classList.remove('dialog-open')
    })
  })

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('pointermove', onPointerMove, { passive: true })

  document.addEventListener('visibilitychange', function () {
    body.classList.toggle('is-paused', document.hidden)
    if (document.hidden) {
      stopDwell(true)
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame)
      pointerFrame = 0
    } else if (currentScene === 3 && !connectionSeen) {
      startDwell()
    }
  })

  reduceMotion.addEventListener('change', function () {
    if (reduceMotion.matches && coreObserver) {
      coreObserver.style.removeProperty('--observer-x')
      coreObserver.style.removeProperty('--observer-y')
    }
  })

  updateReflection()
  updatePrivateTrace()
  setScene(closestSceneFromScroll(), { announce: false })
  if (new URL(window.location.href).searchParams.has('skip-formation')) finishFormation()
  else startFormation()
})()
