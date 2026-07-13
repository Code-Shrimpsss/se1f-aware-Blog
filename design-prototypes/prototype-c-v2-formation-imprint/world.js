(function () {
  'use strict'

  const TAU = Math.PI * 2
  const MOBILE_BREAKPOINT = 760

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value))
  const lerp = (a, b, amount) => a + (b - a) * amount
  const smoothstep = (value) => {
    const t = clamp(value)
    return t * t * (3 - 2 * t)
  }
  const easeInCubic = (value) => value * value * value
  const easeOutQuint = (value) => 1 - Math.pow(1 - value, 5)

  function hashNumber(value) {
    const result = Math.sin(value * 127.1 + 311.7) * 43758.5453123
    return result - Math.floor(result)
  }

  function seededTextHash(text) {
    let seed = 2166136261
    for (let index = 0; index < text.length; index += 1) {
      seed ^= text.charCodeAt(index)
      seed = Math.imul(seed, 16777619)
    }
    return Math.abs(seed >>> 0)
  }

  function rgba(gray, alpha) {
    const channel = Math.round(clamp(gray, 0, 255))
    return `rgba(${channel}, ${channel}, ${Math.max(0, channel - 3)}, ${clamp(alpha)})`
  }

  const CORE_VERTICES = [
    [-0.64, -0.22, 0.02],
    [-0.48, -0.62, -0.1],
    [-0.14, -0.73, 0.15],
    [0.1, -0.57, 0.29],
    [0.43, -0.66, -0.08],
    [0.63, -0.34, 0.18],
    [0.52, -0.06, 0.32],
    [0.7, 0.16, -0.02],
    [0.39, 0.5, 0.22],
    [0.09, 0.46, 0.37],
    [-0.05, 0.71, 0.02],
    [-0.4, 0.54, 0.2],
    [-0.64, 0.24, -0.12],
    [-0.53, 0.02, 0.24],
    [-0.28, -0.3, 0.48],
    [0.02, -0.37, 0.62],
    [0.3, -0.25, 0.46],
    [-0.2, 0.01, 0.65],
    [0.1, 0.02, 0.76],
    [0.36, 0.14, 0.49],
    [-0.3, 0.3, 0.38],
    [0.01, 0.36, 0.57],
    [0.26, 0.31, 0.45],
  ]

  const CORE_FACES = [
    [0, 1, 14], [1, 2, 14], [2, 15, 14], [2, 3, 15],
    [3, 4, 16], [3, 16, 15], [4, 5, 16], [5, 6, 16],
    [6, 19, 16], [6, 7, 19], [7, 8, 19], [8, 22, 19],
    [8, 9, 22], [9, 21, 22], [9, 10, 21], [10, 11, 20],
    [10, 20, 21], [11, 12, 20], [12, 13, 17], [12, 17, 20],
    [13, 0, 14], [13, 14, 17], [14, 15, 18], [14, 18, 17],
    [15, 16, 18], [16, 19, 18], [19, 22, 18], [22, 21, 18],
    [21, 17, 18], [21, 20, 17],
  ]

  const SHELL_PATH = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

  const SUSPENDED_SLICES = [
    { x: 0.47, y: -0.48, w: 0.31, h: 0.055, angle: -0.14, delay: 0.1 },
    { x: -0.5, y: 0.46, w: 0.23, h: 0.045, angle: 0.18, delay: 0.42 },
    { x: 0.51, y: 0.38, w: 0.18, h: 0.036, angle: -0.31, delay: 0.72 },
  ]

  const DEFAULT_INFORMATION = [
    { text: '可靠性本身就是产品', type: 'technical', year: '2026' },
    { text: 'SYSTEM / EVIDENCE / STATE', type: 'technical', year: '2026' },
    { text: 'AIGC 与创造的边界', type: 'observation', year: '2023' },
    { text: '当颠覆者成为标准', type: 'technical', year: '2024' },
    { text: '从答案退回证据', type: 'sediment', year: '2025' },
    { text: '推进并不等于抵达', type: 'inscription', year: '2022' },
    { text: '未被命名之前', type: 'inscription', year: '2026' },
    { text: '标准如何成为边界', type: 'pressure', year: '2024' },
    { text: '同一个未回答的问题', type: 'pressure', year: '2022 → 2026' },
  ]

  class ConsciousnessWorld {
    constructor(canvas, options = {}) {
      this.canvas = canvas
      this.context = canvas.getContext('2d', { alpha: true, desynchronized: true })
      if (!this.context) throw new Error('Canvas 2D context is unavailable')

      this.options = options
      this.width = 1
      this.height = 1
      this.dpr = 1
      this.mobile = false
      this.quality = 'high'
      this.pointer = { x: 0.5, y: 0.5, pressure: 0, active: false }
      this.coreScar = { x: 0.64, y: 0.46, strength: 0 }
      this.information = DEFAULT_INFORMATION.slice()
      this.fragments = []
      this.projectedFragments = []
      this.observedFragmentId = null
      this.deepCrack = false
      this.memoryRevision = Number(options.memoryRevision || 0)
      this.lastBreathIndex = -1
      this.irreversibleRevision = this.memoryRevision
      this.lastFrame = null
      this.performanceSamples = []
      this.surfaceOffset = 0
      this.resize()
    }

    resize() {
      const width = Math.max(320, window.innerWidth || this.canvas.clientWidth || 320)
      const height = Math.max(480, window.innerHeight || this.canvas.clientHeight || 480)
      const mobile = width <= MOBILE_BREAKPOINT
      const deviceMemory = Number(navigator.deviceMemory || 8)
      const cores = Number(navigator.hardwareConcurrency || 8)
      const constrained = deviceMemory <= 4 || cores <= 4
      const dprCap = mobile ? 1.35 : 1.75
      const dpr = Math.min(window.devicePixelRatio || 1, constrained ? Math.min(dprCap, 1.2) : dprCap)

      if (width === this.width && height === this.height && dpr === this.dpr) return

      this.width = width
      this.height = height
      this.mobile = mobile
      this.dpr = dpr
      this.quality = constrained ? 'medium' : mobile ? 'mobile' : 'high'
      this.canvas.width = Math.round(width * dpr)
      this.canvas.height = Math.round(height * dpr)
      this.canvas.style.width = `${width}px`
      this.canvas.style.height = `${height}px`
      this.context.setTransform(dpr, 0, 0, dpr, 0, 0)
      this.context.imageSmoothingEnabled = true
      this.buildFragments()
    }

    setInformation(items) {
      if (!Array.isArray(items) || !items.length) return
      this.information = items
        .filter((item) => item && item.text)
        .map((item, index) => ({
          text: String(item.text),
          type: item.type || ['technical', 'observation', 'sediment', 'pressure', 'inscription'][index % 5],
          year: item.year ? String(item.year) : '',
        }))
      this.buildFragments()
    }

    setPointer(x, y, pressure = 0, active = true) {
      this.pointer.x = clamp(x)
      this.pointer.y = clamp(y)
      this.pointer.pressure = clamp(pressure)
      this.pointer.active = Boolean(active)
    }

    setObservedFragment(id) {
      this.observedFragmentId = id == null ? null : Number(id)
    }

    setObservationScar(x, y, strength = 1) {
      this.coreScar.x = clamp(x)
      this.coreScar.y = clamp(y)
      this.coreScar.strength = clamp(strength)
    }

    setMemory({ revision = 0, deepCrack = false } = {}) {
      this.memoryRevision = Number(revision || 0)
      this.irreversibleRevision = Math.max(this.irreversibleRevision, this.memoryRevision)
      this.deepCrack = Boolean(deepCrack)
    }

    getDiagnostics() {
      const averageFrameMs = this.performanceSamples.length
        ? this.performanceSamples.reduce((total, value) => total + value, 0) / this.performanceSamples.length
        : 0
      return {
        width: this.width,
        height: this.height,
        dpr: this.dpr,
        backingWidth: this.canvas.width,
        backingHeight: this.canvas.height,
        quality: this.quality,
        fragments: this.fragments.length,
        projectedFragments: this.projectedFragments.length,
        observedFragmentId: this.observedFragmentId,
        irreversibleRevision: this.irreversibleRevision,
        deepCrack: this.deepCrack,
        averageFrameMs: Number(averageFrameMs.toFixed(2)),
      }
    }

    getObservedFragment() {
      if (this.observedFragmentId == null) return null
      return this.projectedFragments.find((fragment) => fragment.id === this.observedFragmentId) || null
    }

    pickFragment(clientX, clientY, radius = this.mobile ? 150 : 82) {
      let best = null
      let bestDistance = radius
      for (const fragment of this.projectedFragments) {
        const distance = Math.hypot(fragment.x - clientX, fragment.y - clientY)
        if (distance < bestDistance) {
          best = fragment
          bestDistance = distance
        }
      }
      return best
    }

    buildFragments() {
      const targetCount = this.mobile ? 24 : this.quality === 'medium' ? 38 : 54
      const information = this.information.length ? this.information : DEFAULT_INFORMATION
      this.fragments = Array.from({ length: targetCount }, (_, index) => {
        const item = information[index % information.length]
        const seed = seededTextHash(`${item.text}-${index}`)
        const lane = index % 9
        const startSide = hashNumber(seed + 1) > 0.46 ? 1 : -1
        const cycle = 4.1 + hashNumber(seed + 2) * 4.5
        const impact = index % 7 === 0 || index === 3 || index === 11
        return {
          id: index,
          text: item.text,
          year: item.year,
          type: item.type,
          seed,
          lane,
          startSide,
          cycle,
          phase: hashNumber(seed + 3) * cycle,
          depth: 0.3 + hashNumber(seed + 4) * 0.95,
          angle: (hashNumber(seed + 5) - 0.5) * 0.24,
          size: 0.66 + hashNumber(seed + 6) * 0.92,
          impact,
          impactIndex: index % 6,
        }
      })
    }

    recordFrameCost(startedAt) {
      const cost = performance.now() - startedAt
      this.performanceSamples.push(cost)
      if (this.performanceSamples.length > 120) this.performanceSamples.shift()
    }

    render(frame) {
      const startedAt = performance.now()
      this.resize()
      this.lastFrame = frame
      const ctx = this.context
      const { width, height } = this
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const phase = frame.phase || 'void'
      const progress = clamp(frame.progress || 0)
      const time = Number(frame.time || 0)

      if (phase === 'void') {
        this.drawVoid(0)
      } else if (phase === 'point') {
        this.drawVoid(progress)
      } else if (phase === 'formation') {
        this.drawFormation(progress, time, Boolean(frame.reducedMotion))
      } else if (phase === 'core' || phase === 'core-observed') {
        this.drawCoreWorld(time, 1, phase === 'core-observed' ? 1 : 0)
      } else if (phase === 'dive') {
        this.drawDive(progress, time, Boolean(frame.reducedMotion))
      } else {
        this.drawObservationWorld(frame)
      }

      this.recordFrameCost(startedAt)
    }

    drawVoid(progress) {
      const ctx = this.context
      const cx = this.mobile ? this.width * 0.52 : this.width * 0.58
      const cy = this.mobile ? this.height * 0.4 : this.height * 0.47
      const reveal = smoothstep(progress)

      if (reveal <= 0) return

      ctx.save()
      const pressure = 18 + reveal * Math.min(this.width, this.height) * 0.09
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pressure * 2.4)
      gradient.addColorStop(0, rgba(242, 0.045 * reveal))
      gradient.addColorStop(0.08, rgba(226, 0.012 * reveal))
      gradient.addColorStop(0.5, rgba(48, 0.026 * reveal))
      gradient.addColorStop(1, rgba(0, 0))
      ctx.fillStyle = gradient
      ctx.fillRect(cx - pressure * 2.5, cy - pressure * 2.5, pressure * 5, pressure * 5)

      ctx.translate(cx, cy)
      ctx.rotate(-0.13)
      for (let ring = 0; ring < 5; ring += 1) {
        const radius = pressure * (0.34 + ring * 0.25)
        ctx.beginPath()
        ctx.ellipse(0, 0, radius * (1 + reveal * 0.14), radius * (0.22 + ring * 0.028), 0, 0, TAU)
        ctx.strokeStyle = rgba(106 + ring * 8, reveal * (0.05 - ring * 0.006))
        ctx.lineWidth = 0.7
        ctx.stroke()
      }
      ctx.restore()

      const pointSize = 0.7 + reveal * 1.25
      ctx.fillStyle = rgba(245, reveal * 0.94)
      ctx.fillRect(cx - pointSize / 2, cy - pointSize / 2, pointSize, pointSize)
    }

    drawFormation(progress, time, reducedMotion) {
      const pointProgress = clamp(progress / 0.12)
      this.drawVoid(pointProgress)

      const revealProgress = clamp((progress - 0.08) / 0.78)
      const pulse = reducedMotion ? 0 : time
      this.drawCoreWorld(pulse, revealProgress, 0, true)

      const cuts = [0.1, 0.31, 0.54, 0.72]
      cuts.forEach((start, index) => {
        const local = clamp((progress - start) / 0.15)
        if (local > 0 && local < 1) this.drawDimensionalSlice(index, local)
      })

      const flashWindows = [0.23, 0.42, 0.63]
      const words = ['证据以前', '尚未抵达', '未被命—']
      flashWindows.forEach((windowStart, index) => {
        const local = (progress - windowStart) / 0.055
        if (local > 0 && local < 1) this.drawTransientWord(words[index], index, Math.sin(local * Math.PI))
      })

      if (progress > 0.78) {
        const negation = clamp((progress - 0.78) / 0.14)
        this.drawNegatedVolume(negation)
      }
    }

    coreLayout() {
      if (this.mobile) {
        return {
          cx: this.width * 0.51,
          cy: this.height * 0.4,
          scale: this.width * 0.57,
        }
      }
      return {
        cx: this.width * 0.59,
        cy: this.height * 0.485,
        scale: Math.min(this.width, this.height) * 0.47,
      }
    }

    transformedVertices(cx, cy, scale, time, observedStrength = 0) {
      const breathDuration = 6.8
      const seconds = time / 1000
      const breathIndex = Math.floor(seconds / breathDuration)
      if (breathIndex > this.lastBreathIndex) {
        if (this.lastBreathIndex >= 0) this.irreversibleRevision += 1
        this.lastBreathIndex = breathIndex
      }

      const phase = ((seconds % breathDuration) / breathDuration) * TAU
      const pointerX = (this.pointer.x * this.width - cx) / scale
      const pointerY = (this.pointer.y * this.height - cy) / scale
      const scarX = (this.coreScar.x * this.width - cx) / scale
      const scarY = (this.coreScar.y * this.height - cy) / scale
      const revision = Math.min(26, this.irreversibleRevision)

      return CORE_VERTICES.map((vertex, index) => {
        const [baseX, baseY, z] = vertex
        const distanceFromNode = Math.hypot(baseX + 0.08, baseY + 0.15)
        const arrival = distanceFromNode * 2.2 + hashNumber(index + 9) * 0.3
        const travelling = Math.sin(phase - arrival)
        const pressure = Math.max(-0.32, travelling) * (index < 14 ? 0.018 : 0.01)
        const permanent = revision * 0.00052
        const driftX = Math.sin(index * 2.41 + revision * 0.17) * permanent
        const driftY = Math.cos(index * 1.73 + revision * 0.11) * permanent
        const pointerDistance = Math.hypot(baseX - pointerX, baseY - pointerY)
        const pointerInfluence = this.pointer.active
          ? smoothstep(1 - pointerDistance / 0.42) * this.pointer.pressure * 0.035
          : 0
        const scarDistance = Math.hypot(baseX - scarX, baseY - scarY)
        const observationLock = observedStrength * this.coreScar.strength * smoothstep(1 - scarDistance / 0.5)
        const effectivePressure = pressure * (1 - observationLock * 0.96)
        const normalLength = Math.max(0.1, Math.hypot(baseX, baseY))
        const normalX = baseX / normalLength
        const normalY = baseY / normalLength
        return {
          x: cx + (baseX + normalX * (effectivePressure + pointerInfluence) + driftX) * scale,
          y: cy + (baseY + normalY * (effectivePressure + pointerInfluence) + driftY) * scale,
          z,
          baseX,
          baseY,
          pressure: effectivePressure,
        }
      })
    }

    faceRevealThreshold(faceIndex) {
      const face = CORE_FACES[faceIndex]
      const centroid = face.reduce((result, vertexIndex) => {
        result.x += CORE_VERTICES[vertexIndex][0] / 3
        result.y += CORE_VERTICES[vertexIndex][1] / 3
        return result
      }, { x: 0, y: 0 })
      const pass = faceIndex % 4
      const directional = [
        centroid.x * 0.55 + centroid.y * 0.2,
        -centroid.x * 0.25 + centroid.y * 0.65,
        centroid.x * 0.4 - centroid.y * 0.6,
        -centroid.x * 0.5 - centroid.y * 0.15,
      ][pass]
      return clamp(0.08 + pass * 0.2 + (directional + 0.7) * 0.08, 0.03, 0.93)
    }

    drawCoreWorld(time, reveal = 1, observedStrength = 0, forming = false, customLayout = null) {
      const ctx = this.context
      const layout = customLayout || this.coreLayout()
      const { cx, cy, scale } = layout
      const vertices = this.transformedVertices(cx, cy, scale, time, observedStrength)
      const lightX = lerp(-0.45, 0.72, this.pointer.x)
      const lightY = lerp(-0.7, 0.4, this.pointer.y)

      ctx.save()
      ctx.globalCompositeOperation = 'source-over'

      const shadow = ctx.createRadialGradient(cx, cy, scale * 0.08, cx, cy, scale * 0.92)
      shadow.addColorStop(0, rgba(236, 0.05 * reveal))
      shadow.addColorStop(0.5, rgba(212, 0.022 * reveal))
      shadow.addColorStop(1, rgba(0, 0))
      ctx.fillStyle = shadow
      ctx.fillRect(cx - scale, cy - scale, scale * 2, scale * 2)

      ctx.save()
      ctx.translate(-scale * 0.018, scale * 0.024)
      this.traceShell(vertices)
      ctx.fillStyle = rgba(61, 0.84 * reveal)
      ctx.fill()
      ctx.strokeStyle = rgba(218, 0.16 * reveal)
      ctx.lineWidth = Math.max(0.8, scale * 0.004)
      ctx.stroke()
      ctx.restore()

      const sortedFaces = CORE_FACES.map((face, index) => ({
        face,
        index,
        depth: face.reduce((total, vertexIndex) => total + vertices[vertexIndex].z, 0) / 3,
      })).sort((a, b) => a.depth - b.depth)

      for (const entry of sortedFaces) {
        const threshold = this.faceRevealThreshold(entry.index)
        const localReveal = smoothstep((reveal - threshold + 0.1) / 0.1)
        if (localReveal <= 0) continue

        const points = entry.face.map((vertexIndex) => vertices[vertexIndex])
        const edgeAX = points[1].x - points[0].x
        const edgeAY = points[1].y - points[0].y
        const edgeBX = points[2].x - points[0].x
        const edgeBY = points[2].y - points[0].y
        const pseudoNormal = Math.sign(edgeAX * edgeBY - edgeAY * edgeBX)
        const centroidX = points.reduce((total, point) => total + point.baseX, 0) / 3
        const centroidY = points.reduce((total, point) => total + point.baseY, 0) / 3
        const light = clamp(0.5 + centroidX * lightX * 0.45 + centroidY * lightY * 0.35 + entry.depth * 0.26)
        const timeOffset = entry.index === 4 || entry.index === 17 || entry.index === 26 ? -34 : 0
        const material = 86 + light * 157 + pseudoNormal * 5 + timeOffset
        const alpha = localReveal * (forming ? 0.84 : 0.96)

        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        ctx.lineTo(points[1].x, points[1].y)
        ctx.lineTo(points[2].x, points[2].y)
        ctx.closePath()
        ctx.fillStyle = rgba(material, alpha)
        ctx.fill()
        ctx.strokeStyle = rgba(Math.min(248, material + 22), alpha * 0.28)
        ctx.lineWidth = 0.55
        ctx.stroke()
      }

      this.drawCoreCavity(layout, reveal)
      this.drawCoreTexture(vertices, reveal, observedStrength, layout)
      this.drawCoreCrack(time, reveal, layout)
      this.drawSuspendedSlices(layout, time, reveal)
      this.drawObservedPressure(layout, observedStrength)

      this.traceShell(vertices)
      ctx.strokeStyle = rgba(250, 0.18 * reveal)
      ctx.lineWidth = 0.7
      ctx.stroke()
      ctx.restore()
    }

    drawCoreCavity(layout, reveal) {
      if (reveal < 0.4) return
      const ctx = this.context
      const points = [
        [-0.49, -0.09],
        [-0.32, -0.29],
        [-0.1, -0.22],
        [-0.03, -0.04],
        [-0.17, 0.17],
        [-0.41, 0.25],
        [-0.52, 0.07],
      ].map(([x, y]) => ({ x: layout.cx + x * layout.scale, y: layout.cy + y * layout.scale }))
      const alpha = smoothstep((reveal - 0.4) / 0.2)
      const gradient = ctx.createLinearGradient(
        layout.cx - layout.scale * 0.5,
        layout.cy - layout.scale * 0.25,
        layout.cx - layout.scale * 0.04,
        layout.cy + layout.scale * 0.2,
      )
      gradient.addColorStop(0, rgba(4, 0.94 * alpha))
      gradient.addColorStop(0.58, rgba(26, 0.9 * alpha))
      gradient.addColorStop(1, rgba(112, 0.76 * alpha))
      ctx.beginPath()
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y)
        else ctx.lineTo(point.x, point.y)
      })
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()
      ctx.strokeStyle = rgba(246, 0.28 * alpha)
      ctx.lineWidth = 0.7
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(layout.cx - layout.scale * 0.39, layout.cy - layout.scale * 0.18)
      ctx.lineTo(layout.cx - layout.scale * 0.17, layout.cy - layout.scale * 0.13)
      ctx.lineTo(layout.cx - layout.scale * 0.12, layout.cy + layout.scale * 0.01)
      ctx.lineTo(layout.cx - layout.scale * 0.31, layout.cy + layout.scale * 0.13)
      ctx.strokeStyle = rgba(236, 0.14 * alpha)
      ctx.lineWidth = Math.max(1, layout.scale * 0.008)
      ctx.stroke()
    }

    traceShell(vertices) {
      const ctx = this.context
      ctx.beginPath()
      SHELL_PATH.forEach((index, pathIndex) => {
        const point = vertices[index]
        if (pathIndex === 0) ctx.moveTo(point.x, point.y)
        else ctx.lineTo(point.x, point.y)
      })
      ctx.closePath()
    }

    drawCoreTexture(vertices, reveal, observedStrength, layout) {
      if (reveal < 0.38) return
      const ctx = this.context
      ctx.save()
      this.traceShell(vertices)
      ctx.clip()

      const spacing = this.mobile ? 18 : 13
      const angle = -0.31
      ctx.translate(layout.cx, layout.cy)
      ctx.rotate(angle)
      ctx.translate(-layout.cx, -layout.cy)
      const startX = layout.cx - layout.scale * 0.95
      const endX = layout.cx + layout.scale * 0.95
      const startY = layout.cy - layout.scale * 0.95
      const endY = layout.cy + layout.scale * 0.95

      for (let y = startY; y < endY; y += spacing) {
        const intensity = 0.032 + hashNumber(y * 0.17) * 0.06 + observedStrength * 0.075
        ctx.beginPath()
        ctx.moveTo(startX, y)
        ctx.lineTo(endX, y + Math.sin(y * 0.03) * 2)
        ctx.strokeStyle = rgba(22, intensity * reveal)
        ctx.lineWidth = hashNumber(y) > 0.72 ? 1.2 : 0.55
        ctx.stroke()
      }

      ctx.restore()
    }

    drawCoreCrack(time, reveal, layout) {
      if (reveal < 0.48) return
      const ctx = this.context
      const seconds = time / 1000
      const phase = ((seconds % 6.8) / 6.8) * TAU
      const crackPressure = Math.max(0, Math.sin(phase + 0.7))
      const width = Math.max(2.2, layout.scale * (0.019 - crackPressure * 0.005))
      const points = [
        [0.1, -0.65],
        [0.04, -0.43],
        [0.14, -0.25],
        [-0.02, -0.06],
        [0.09, 0.11],
        [-0.04, 0.3],
        [0.12, 0.57],
      ].map(([x, y], index) => ({
        x: layout.cx + (x + Math.sin(index * 4.7) * 0.013) * layout.scale,
        y: layout.cy + y * layout.scale,
      }))

      ctx.save()
      ctx.globalAlpha = smoothstep((reveal - 0.48) / 0.17)
      ctx.beginPath()
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y)
        else ctx.lineTo(point.x, point.y)
      })
      ctx.strokeStyle = rgba(0, 0.96)
      ctx.lineWidth = width
      ctx.lineCap = 'butt'
      ctx.lineJoin = 'miter'
      ctx.stroke()

      ctx.beginPath()
      points.forEach((point, index) => {
        const offset = index % 2 ? 1.8 : -1.2
        if (index === 0) ctx.moveTo(point.x + offset, point.y)
        else ctx.lineTo(point.x + offset, point.y)
      })
      ctx.strokeStyle = rgba(250, 0.3 + crackPressure * 0.2)
      ctx.lineWidth = 0.75
      ctx.stroke()
      ctx.restore()
    }

    drawSuspendedSlices(layout, time, reveal) {
      if (reveal < 0.24) return
      const ctx = this.context
      const seconds = time / 1000
      SUSPENDED_SLICES.forEach((slice, index) => {
        const localReveal = smoothstep((reveal - (0.22 + index * 0.16)) / 0.12)
        if (localReveal <= 0) return
        const propagation = Math.sin(seconds * 0.92 - slice.delay * 2.4)
        const permanent = Math.min(18, this.irreversibleRevision) * 0.0012 * layout.scale
        const x = layout.cx + slice.x * layout.scale + Math.sin(index * 2.2) * permanent
        const y = layout.cy + slice.y * layout.scale + propagation * layout.scale * 0.008 + Math.cos(index * 1.8) * permanent
        const width = slice.w * layout.scale
        const height = Math.max(3, slice.h * layout.scale)

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(slice.angle)
        const gradient = ctx.createLinearGradient(-width / 2, 0, width / 2, 0)
        gradient.addColorStop(0, rgba(82, 0.58 * localReveal))
        gradient.addColorStop(0.35, rgba(238, 0.92 * localReveal))
        gradient.addColorStop(1, rgba(143, 0.72 * localReveal))
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.moveTo(-width / 2, -height / 2)
        ctx.lineTo(width / 2, -height * 0.34)
        ctx.lineTo(width * 0.43, height / 2)
        ctx.lineTo(-width * 0.55, height * 0.3)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = rgba(248, 0.36 * localReveal)
        ctx.lineWidth = 0.65
        ctx.stroke()
        ctx.restore()
      })
    }

    drawObservedPressure(layout, strength) {
      const effectiveStrength = Math.max(strength * this.coreScar.strength, this.pointer.pressure * 0.45)
      if (effectiveStrength <= 0.03) return
      const ctx = this.context
      const x = strength > 0 ? this.coreScar.x * this.width : this.pointer.x * this.width
      const y = strength > 0 ? this.coreScar.y * this.height : this.pointer.y * this.height
      const radius = layout.scale * (0.1 + effectiveStrength * 0.11)
      ctx.save()
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, rgba(4, 0.16 * effectiveStrength))
      gradient.addColorStop(0.46, rgba(30, 0.06 * effectiveStrength))
      gradient.addColorStop(1, rgba(0, 0))
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, TAU)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(x, y, radius * 0.54, radius * 0.18, -0.31, 0, TAU)
      ctx.strokeStyle = rgba(12, 0.25 * effectiveStrength)
      ctx.lineWidth = 0.7
      ctx.stroke()
      ctx.restore()
    }

    drawDimensionalSlice(index, progress) {
      const ctx = this.context
      const directions = [
        { angle: -0.32, reverse: false, thickness: 0.095 },
        { angle: 0.63, reverse: true, thickness: 0.07 },
        { angle: -0.72, reverse: true, thickness: 0.13 },
        { angle: 0.16, reverse: false, thickness: 0.055 },
      ]
      const slice = directions[index]
      const diagonal = Math.hypot(this.width, this.height)
      const x = (slice.reverse ? 1 - progress : progress) * (diagonal * 1.5) - diagonal * 0.75
      const thickness = diagonal * slice.thickness
      const alpha = Math.sin(progress * Math.PI)

      ctx.save()
      ctx.translate(this.width / 2, this.height / 2)
      ctx.rotate(slice.angle)
      const gradient = ctx.createLinearGradient(x - thickness, 0, x + thickness, 0)
      gradient.addColorStop(0, rgba(240, 0))
      gradient.addColorStop(0.42, rgba(250, alpha * 0.12))
      gradient.addColorStop(0.5, rgba(255, alpha * 0.88))
      gradient.addColorStop(0.53, rgba(239, alpha * 0.32))
      gradient.addColorStop(1, rgba(230, 0))
      ctx.fillStyle = gradient
      ctx.fillRect(x - thickness, -diagonal, thickness * 2, diagonal * 2)
      ctx.fillStyle = rgba(255, alpha * 0.78)
      ctx.fillRect(x, -diagonal, index === 2 ? 2 : 1, diagonal * 2)
      ctx.restore()
    }

    drawTransientWord(text, index, alpha) {
      const ctx = this.context
      const layout = this.coreLayout()
      const positions = [
        [layout.cx - layout.scale * 0.72, layout.cy - layout.scale * 0.21],
        [layout.cx + layout.scale * 0.2, layout.cy - layout.scale * 0.46],
        [layout.cx - layout.scale * 0.11, layout.cy + layout.scale * 0.48],
      ]
      ctx.save()
      ctx.fillStyle = rgba(232, alpha * 0.48)
      ctx.font = `${Math.max(8, layout.scale * 0.027)}px "Red Hat Mono Local", monospace`
      ctx.letterSpacing = '0.08em'
      ctx.translate(positions[index][0], positions[index][1])
      ctx.rotate([-0.21, 0.33, -0.08][index])
      ctx.fillText(text, 0, 0)
      ctx.restore()
    }

    drawNegatedVolume(progress) {
      const ctx = this.context
      const layout = this.coreLayout()
      const alpha = Math.sin(progress * Math.PI)
      ctx.save()
      ctx.translate(layout.cx - layout.scale * 0.18, layout.cy + layout.scale * 0.02)
      ctx.rotate(-0.19)
      ctx.fillStyle = rgba(0, alpha * 0.54)
      ctx.fillRect(-layout.scale * 0.11, -layout.scale * 0.08, layout.scale * 0.25, layout.scale * 0.16)
      ctx.strokeStyle = rgba(236, alpha * 0.2)
      ctx.lineWidth = 0.7
      ctx.strokeRect(-layout.scale * 0.115, -layout.scale * 0.085, layout.scale * 0.26, layout.scale * 0.17)
      ctx.restore()
    }

    drawDive(progress, time, reducedMotion) {
      const ctx = this.context
      const base = this.coreLayout()
      const camera = reducedMotion
        ? progress < 0.5 ? 0 : 1
        : progress < 0.32
          ? easeInCubic(progress / 0.32) * 0.08
          : 0.08 + easeOutQuint((progress - 0.32) / 0.68) * 0.92
      const scale = lerp(base.scale, Math.max(this.width, this.height) * 2.5, camera)
      const cx = lerp(base.cx, this.width * 0.47, camera)
      const cy = lerp(base.cy, this.height * 0.69, camera)

      if (camera < 0.82) {
        this.drawCoreWorld(time, 1, 0, false, { cx, cy, scale })
      }

      if (camera > 0.66) {
        const terrainAlpha = smoothstep((camera - 0.66) / 0.34)
        ctx.save()
        ctx.globalAlpha = terrainAlpha
        this.drawTerrain({ phase: 'surface', progress: 0, time, pointer: this.pointer })
        ctx.restore()
      }
    }

    drawObservationWorld(frame) {
      this.drawTerrain(frame)

      if (frame.phase === 'storm' || frame.phase === 'fragment-observed' || frame.phase === 'freeze' || frame.phase === 'impact') {
        this.drawInformationStorm(frame)
      } else {
        this.projectedFragments = []
      }
    }

    drawTerrain(frame) {
      const ctx = this.context
      const { width, height } = this
      const horizon = this.mobile ? height * 0.16 : height * 0.18
      const rows = this.mobile ? 10 : this.quality === 'medium' ? 12 : 15
      const columns = this.mobile ? 9 : this.quality === 'medium' ? 13 : 17
      const pointerX = this.pointer.x
      const pointerY = this.pointer.y

      const background = ctx.createLinearGradient(0, 0, 0, height)
      background.addColorStop(0, '#050505')
      background.addColorStop(Math.max(0, horizon / height - 0.025), '#0a0a0a')
      background.addColorStop(horizon / height + 0.02, '#777773')
      background.addColorStop(0.47, '#b9b8b2')
      background.addColorStop(1, '#a5a59f')
      ctx.fillStyle = background
      ctx.fillRect(0, 0, width, height)

      this.drawDistantArchitecture(horizon)

      const points = []
      for (let row = 0; row <= rows; row += 1) {
        const v = row / rows
        const perspectiveV = Math.pow(v, 1.56)
        const yBase = horizon + perspectiveV * (height - horizon + 42)
        const spread = lerp(0.18, 1.26, perspectiveV)
        const rowPoints = []
        for (let column = 0; column <= columns; column += 1) {
          const u = column / columns
          const normalizedX = u - 0.5
          const stepped = Math.sin(Math.floor((u + 0.03) * 8) * 2.7 + row * 0.53) * 0.44
          const directional = Math.sin(u * 14 - v * 5.2) * 0.28
          const ridge = (stepped + directional) * (5 + perspectiveV * 29)
          const scarValley = Math.exp(-Math.pow((u - (0.53 + v * 0.045)) / 0.045, 2)) * (8 + perspectiveV * 38)
          const x = width * 0.5 + normalizedX * width * spread + this.surfaceOffset * perspectiveV * 18
          const y = yBase - ridge + scarValley
          rowPoints.push({ x, y, u, v, ridge, scarValley })
        }
        points.push(rowPoints)
      }

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const a = points[row][column]
          const b = points[row][column + 1]
          const c = points[row + 1][column + 1]
          const d = points[row + 1][column]
          const slope = clamp(0.5 + (a.ridge - c.ridge) / 42)
          const incidence = clamp(1 - Math.hypot((a.u + c.u) * 0.5 - pointerX, (a.v + c.v) * 0.5 - pointerY) / 0.74)
          const checker = hashNumber(row * 89 + column * 17)
          const materialBreak = (row + column) % 7 === 0 ? -24 : (column % 6 === 0 ? 13 : 0)
          const gray = 113 + slope * 95 + incidence * 13 + checker * 13 + materialBreak
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.lineTo(c.x, c.y)
          ctx.lineTo(d.x, d.y)
          ctx.closePath()
          ctx.fillStyle = rgba(gray, 0.97)
          ctx.fill()
          ctx.strokeStyle = rgba(gray - 42, 0.105)
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }

      this.drawSurfaceLayers(frame, horizon)
      this.drawDirectionalStrata(horizon)
      this.drawSurfaceCrack(frame)
      this.drawPersistentImprints(frame)
      this.drawTerrainLight()
    }

    drawSurfaceLayers(frame, horizon) {
      const ctx = this.context
      const layers = [
        {
          points: [[-0.04, 0.78], [0.29, 0.46], [0.49, 0.51], [0.28, 0.86]],
          gray: 236,
          alpha: 0.16,
        },
        {
          points: [[0.69, 0.31], [1.05, 0.55], [1.03, 0.73], [0.59, 0.49]],
          gray: 249,
          alpha: 0.12,
        },
        {
          points: [[0.13, 0.35], [0.42, 0.26], [0.53, 0.33], [0.23, 0.48]],
          gray: 42,
          alpha: 0.12,
        },
      ]
      ctx.save()
      layers.forEach((layer, layerIndex) => {
        ctx.beginPath()
        layer.points.forEach(([x, y], pointIndex) => {
          const px = x * this.width
          const py = horizon + y * (this.height - horizon)
          if (pointIndex === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        })
        ctx.closePath()
        ctx.fillStyle = rgba(layer.gray, layer.alpha)
        ctx.fill()
        ctx.strokeStyle = rgba(layerIndex === 2 ? 8 : 248, 0.14)
        ctx.lineWidth = 0.7
        ctx.stroke()
      })

      const sedimentVisibility = ['storm', 'fragment-observed', 'freeze', 'impact', 'explore'].includes(frame.phase) ? 1 : 0.46
      for (let layer = 0; layer < 4; layer += 1) {
        const x = this.width * (0.69 + layer * 0.012)
        const y = this.height * (0.67 + layer * 0.018)
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(-0.29)
        ctx.fillStyle = rgba(247, sedimentVisibility * (0.055 + layer * 0.018))
        ctx.fillRect(-this.width * 0.13, -5, this.width * 0.26, 9)
        ctx.strokeStyle = rgba(13, sedimentVisibility * 0.08)
        ctx.strokeRect(-this.width * 0.13, -5, this.width * 0.26, 9)
        ctx.restore()
      }
      ctx.restore()
    }

    drawDirectionalStrata(horizon) {
      const ctx = this.context
      const count = this.mobile ? 12 : 22
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, horizon, this.width, this.height - horizon)
      ctx.clip()
      for (let index = 0; index < count; index += 1) {
        const seed = hashNumber(index * 43 + 5)
        const startX = lerp(-this.width * 0.25, this.width * 0.96, seed)
        const startY = horizon + Math.pow(hashNumber(index * 67 + 9), 1.35) * (this.height - horizon)
        const length = lerp(this.width * 0.08, this.width * 0.34, hashNumber(index * 19 + 3))
        const angle = -0.48 + hashNumber(index * 31) * 0.18
        ctx.save()
        ctx.translate(startX, startY)
        ctx.rotate(angle)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(length, 0)
        ctx.strokeStyle = rgba(index % 6 === 0 ? 7 : 240, index % 6 === 0 ? 0.16 : 0.07)
        ctx.lineWidth = index % 6 === 0 ? 1.2 : 0.6
        ctx.stroke()
        ctx.restore()
      }
      ctx.restore()
    }

    drawDistantArchitecture(horizon) {
      const ctx = this.context
      const count = this.mobile ? 8 : 14
      ctx.save()
      for (let index = 0; index < count; index += 1) {
        const seed = hashNumber(index + 54)
        const width = lerp(12, 58, seed)
        const height = lerp(12, this.mobile ? 54 : 88, hashNumber(index + 81))
        const x = (index / Math.max(1, count - 1)) * this.width + (seed - 0.5) * 48
        const y = horizon + 9
        ctx.fillStyle = rgba(22 + seed * 72, 0.78)
        ctx.beginPath()
        ctx.moveTo(x - width / 2, y)
        ctx.lineTo(x - width * 0.38, y - height)
        ctx.lineTo(x + width * 0.48, y - height * (0.82 + seed * 0.16))
        ctx.lineTo(x + width / 2, y)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = rgba(238, 0.19)
        ctx.lineWidth = 0.75
        ctx.stroke()
      }
      ctx.restore()
    }

    drawTerrainLight() {
      const ctx = this.context
      const x = this.pointer.x * this.width
      const y = this.pointer.y * this.height
      const radius = Math.min(this.width, this.height) * (this.mobile ? 0.38 : 0.48)
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, rgba(255, 0.075 + this.pointer.pressure * 0.055))
      gradient.addColorStop(0.38, rgba(250, 0.03))
      gradient.addColorStop(1, rgba(0, 0))
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, this.width, this.height)
      ctx.restore()
    }

    surfaceCrackPoints(deepAmount = 0) {
      const points = []
      const startX = this.width * 0.55
      const startY = this.height * 0.15
      const endY = this.height * 1.04
      const segments = this.mobile ? 12 : 17
      for (let index = 0; index <= segments; index += 1) {
        const t = index / segments
        const baseX = lerp(startX, this.width * 0.46, t)
        const zig = (hashNumber(index * 71 + 4) - 0.5) * this.width * (0.018 + t * 0.035)
        const branchPull = deepAmount * Math.sin(t * Math.PI) * this.width * 0.024
        points.push({ x: baseX + zig + branchPull, y: lerp(startY, endY, Math.pow(t, 1.13)) })
      }
      return points
    }

    drawSurfaceCrack(frame) {
      const ctx = this.context
      const phase = frame.phase
      const impactProgress = phase === 'impact' ? smoothstep(frame.progress) : phase === 'explore' || this.deepCrack ? 1 : 0
      const points = this.surfaceCrackPoints(impactProgress)
      const leftEdge = []
      const rightEdge = []
      points.forEach((point, index) => {
        const previous = points[Math.max(0, index - 1)]
        const next = points[Math.min(points.length - 1, index + 1)]
        const tangentX = next.x - previous.x
        const tangentY = next.y - previous.y
        const tangentLength = Math.max(1, Math.hypot(tangentX, tangentY))
        const normalX = -tangentY / tangentLength
        const normalY = tangentX / tangentLength
        const t = index / Math.max(1, points.length - 1)
        const baseWidth = lerp(1.2, this.mobile ? 4.5 : 7.5, Math.pow(t, 1.25))
        const deepWidth = impactProgress * lerp(1.2, this.mobile ? 12 : 20, Math.pow(t, 1.4))
        const width = baseWidth + deepWidth + hashNumber(index * 53) * (1.5 + impactProgress * 3)
        leftEdge.push({ x: point.x + normalX * width, y: point.y + normalY * width })
        rightEdge.push({ x: point.x - normalX * width, y: point.y - normalY * width })
      })

      ctx.save()
      ctx.beginPath()
      leftEdge.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y)
        else ctx.lineTo(point.x, point.y)
      })
      rightEdge.slice().reverse().forEach((point) => ctx.lineTo(point.x, point.y))
      ctx.closePath()
      const canyon = ctx.createLinearGradient(this.width * 0.43, 0, this.width * 0.57, 0)
      canyon.addColorStop(0, rgba(14, 0.96))
      canyon.addColorStop(0.42, rgba(0, 1))
      canyon.addColorStop(0.63, rgba(3, 1))
      canyon.addColorStop(1, rgba(48, 0.96))
      ctx.fillStyle = canyon
      ctx.fill()

      ctx.beginPath()
      leftEdge.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y)
        else ctx.lineTo(point.x, point.y)
      })
      ctx.strokeStyle = rgba(250, 0.31 + impactProgress * 0.2)
      ctx.lineWidth = 0.8
      ctx.stroke()

      ctx.beginPath()
      rightEdge.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y)
        else ctx.lineTo(point.x, point.y)
      })
      ctx.strokeStyle = rgba(5, 0.54)
      ctx.lineWidth = 1.1
      ctx.stroke()

      if (impactProgress > 0.1) {
        const branchProgress = smoothstep((impactProgress - 0.12) / 0.7)
        const origin = points[Math.floor(points.length * 0.56)]
        ctx.beginPath()
        ctx.moveTo(origin.x, origin.y)
        ctx.lineTo(origin.x - this.width * 0.068 * branchProgress, origin.y + this.height * 0.058 * branchProgress)
        ctx.lineTo(origin.x - this.width * 0.115 * branchProgress, origin.y + this.height * 0.14 * branchProgress)
        ctx.lineTo(origin.x - this.width * 0.109 * branchProgress, origin.y + this.height * 0.145 * branchProgress)
        ctx.lineTo(origin.x - this.width * 0.058 * branchProgress, origin.y + this.height * 0.064 * branchProgress)
        ctx.closePath()
        ctx.fillStyle = rgba(4, 0.86 * branchProgress)
        ctx.fill()
        ctx.strokeStyle = rgba(244, 0.17 * branchProgress)
        ctx.lineWidth = 0.7
        ctx.stroke()
      }
      ctx.restore()
    }

    imprintVisibility(frame, index) {
      if (frame.phase === 'surface') return index === 0 ? 0.28 : 0
      if (frame.phase === 'storm') return smoothstep((frame.progress - index * 0.085) / 0.22)
      if (frame.phase === 'fragment-observed' || frame.phase === 'freeze' || frame.phase === 'impact' || frame.phase === 'explore') return 1
      return 0
    }

    drawPersistentImprints(frame) {
      const ctx = this.context
      const imprints = [
        { kind: 'observed', x: 0.43 + this.coreScar.x * 0.34, y: 0.31 + this.coreScar.y * 0.34 },
        { kind: 'technical', x: 0.25, y: 0.64 },
        { kind: 'art', x: 0.78, y: 0.35 },
        { kind: 'pressure', x: 0.38, y: 0.78 },
        { kind: 'sediment', x: 0.69, y: 0.72 },
        { kind: 'inscription', x: 0.59, y: 0.59 },
      ]

      imprints.forEach((imprint, index) => {
        const visibility = this.imprintVisibility(frame, index)
        if (visibility <= 0) return
        const x = imprint.x * this.width
        const y = imprint.y * this.height

        if (imprint.kind === 'observed') {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(-0.2)
          ctx.beginPath()
          ctx.ellipse(0, 0, this.width * 0.065, this.height * 0.018, 0, 0, TAU)
          ctx.strokeStyle = rgba(22, 0.26 * visibility)
          ctx.lineWidth = 0.8
          ctx.stroke()
          for (let line = 0; line < 6; line += 1) {
            ctx.beginPath()
            ctx.moveTo(-this.width * 0.05, -8 + line * 3)
            ctx.lineTo(this.width * 0.045, -6 + line * 3)
            ctx.strokeStyle = rgba(12, (0.025 + line * 0.009) * visibility)
            ctx.stroke()
          }
          ctx.restore()
        } else if (imprint.kind === 'technical') {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(-0.13)
          ctx.fillStyle = rgba(9, 0.5 * visibility)
          ctx.fillRect(-this.width * 0.085, -1, this.width * 0.17, 2)
          ctx.fillRect(this.width * 0.015, -7, 1, 15)
          ctx.strokeStyle = rgba(247, 0.22 * visibility)
          ctx.strokeRect(-this.width * 0.085, -3, this.width * 0.17, 6)
          ctx.restore()
        } else if (imprint.kind === 'art') {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.width * 0.12)
          gradient.addColorStop(0, rgba(255, 0.2 * visibility))
          gradient.addColorStop(0.4, rgba(253, 0.08 * visibility))
          gradient.addColorStop(1, rgba(255, 0))
          ctx.fillStyle = gradient
          ctx.fillRect(x - this.width * 0.14, y - this.width * 0.14, this.width * 0.28, this.width * 0.28)
        } else if (imprint.kind === 'pressure') {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(0.12)
          for (let ring = 0; ring < 5; ring += 1) {
            ctx.beginPath()
            ctx.ellipse(0, 0, this.width * (0.035 + ring * 0.017), this.height * (0.013 + ring * 0.008), 0, 0, TAU)
            ctx.strokeStyle = rgba(18, (0.2 - ring * 0.026) * visibility)
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
          ctx.restore()
        } else if (imprint.kind === 'sediment') {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(-0.28)
          for (let layer = 0; layer < 4; layer += 1) {
            ctx.fillStyle = rgba(245, (0.075 + layer * 0.025) * visibility)
            ctx.fillRect(-this.width * 0.075 + layer * 6, -18 + layer * 8, this.width * 0.15, 7)
          }
          ctx.restore()
        } else {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(-0.095)
          ctx.font = `${this.mobile ? 10 : 12}px "Songti SC", serif`
          ctx.fillStyle = rgba(10, 0.23 * visibility)
          ctx.fillText('推进并不等于抵达', -this.width * 0.068, 0)
          ctx.restore()
        }
      })

      const revealDistance = Math.hypot(this.pointer.x - 0.61, this.pointer.y - 0.61)
      const reveal = smoothstep(1 - revealDistance / 0.25) * (frame.phase === 'explore' ? 1 : 0.25)
      if (reveal > 0.015 || (this.mobile && frame.phase === 'explore')) {
        ctx.save()
        ctx.translate(this.width * 0.61, this.height * 0.61)
        ctx.rotate(-0.08)
        ctx.font = `${this.mobile ? 9 : 11}px "Red Hat Mono Local", monospace`
        ctx.fillStyle = rgba(7, Math.max(this.mobile ? 0.2 : 0, reveal * 0.36))
        ctx.fillText('可靠性本身就是用户正在使用的产品', -this.width * 0.09, 0)
        ctx.restore()
      }
    }

    fragmentPosition(fragment, worldTime) {
      const seconds = worldTime / 1000
      const local = ((seconds + fragment.phase) % fragment.cycle) / fragment.cycle
      const eased = local * local * (3 - 2 * local)
      const laneY = 0.2 + (fragment.lane / 9) * 0.6
      const startX = fragment.startSide > 0 ? 1.2 : -0.2
      const endX = fragment.startSide > 0 ? -0.28 : 1.28
      const arc = Math.sin(local * Math.PI) * (0.08 + fragment.depth * 0.09)
      return {
        x: lerp(startX, endX, eased),
        y: laneY - arc + Math.sin(fragment.seed * 0.0001 + local * TAU) * 0.025,
        local,
      }
    }

    drawInformationStorm(frame) {
      const ctx = this.context
      const phase = frame.phase
      const frozenTime = Number(frame.frozenAt || frame.time || 0)
      const activeTime = phase === 'storm' || phase === 'fragment-observed' ? Number(frame.time || 0) : frozenTime
      const selectedId = this.observedFragmentId == null ? 7 : this.observedFragmentId
      const impactTarget = { x: this.width * 0.53, y: this.height * 0.58 }
      const freezeProgress = phase === 'freeze' ? smoothstep(frame.progress) : phase === 'impact' ? 1 : 0
      const impactProgress = phase === 'impact' ? smoothstep(frame.progress) : 0
      const otherAlpha = phase === 'impact' ? 1 - easeOutQuint(frame.progress) : 1
      this.projectedFragments = []

      const ordered = this.fragments.slice().sort((a, b) => a.depth - b.depth)
      for (const fragment of ordered) {
        const basePosition = this.fragmentPosition(fragment, activeTime)
        let x = basePosition.x * this.width
        let y = basePosition.y * this.height
        let alpha = clamp(0.2 + fragment.depth * 0.6) * otherAlpha
        let scale = lerp(0.62, 1.2, fragment.depth) * fragment.size

        if (fragment.id === selectedId && (phase === 'fragment-observed' || phase === 'freeze' || phase === 'impact')) {
          const observedPosition = this.fragmentPosition(fragment, Number(frame.observedAt || frozenTime || activeTime))
          const startX = observedPosition.x * this.width
          const startY = observedPosition.y * this.height
          const slowProgress = phase === 'freeze' ? freezeProgress : phase === 'impact' ? 1 : 0
          x = lerp(startX, impactTarget.x, slowProgress)
          y = lerp(startY, impactTarget.y, slowProgress * slowProgress)
          alpha = phase === 'impact' ? 1 - impactProgress * 0.25 : 0.92
          scale *= 1.08
        }

        if (phase === 'impact' && fragment.id !== selectedId && otherAlpha < 0.02) continue

        const projected = { id: fragment.id, x, y, text: fragment.text, type: fragment.type }
        this.projectedFragments.push(projected)
        this.drawFragment(fragment, x, y, scale, alpha, fragment.id === selectedId && phase !== 'storm')
      }

      if (phase === 'impact') this.drawImpactCompression(impactTarget.x, impactTarget.y, impactProgress)
    }

    drawFragment(fragment, x, y, scale, alpha, selected) {
      const ctx = this.context
      const baseSize = this.mobile ? 8.5 : 10.5
      const fontSize = Math.max(7, baseSize * scale)
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(fragment.angle)

      if (fragment.type === 'technical') {
        ctx.font = `${fontSize}px "Red Hat Mono Local", monospace`
        ctx.fillStyle = rgba(9, alpha * 0.72)
        ctx.fillText(fragment.text, 0, 0)
        ctx.fillStyle = rgba(250, alpha * 0.18)
        ctx.fillRect(-5, -fontSize, 1, fontSize * 1.3)
      } else if (fragment.type === 'observation') {
        const width = Math.min(this.width * 0.22, fragment.text.length * fontSize * 0.65)
        ctx.fillStyle = rgba(245, alpha * 0.1)
        ctx.fillRect(-7, -fontSize * 1.25, width + 14, fontSize * 1.8)
        ctx.font = `${fontSize}px "Songti SC", serif`
        ctx.fillStyle = rgba(13, alpha * 0.62)
        ctx.fillText(fragment.text, 0, 0)
      } else if (fragment.type === 'sediment') {
        ctx.font = `${fontSize}px "Songti SC", serif`
        for (let layer = 2; layer >= 0; layer -= 1) {
          ctx.fillStyle = rgba(20 + layer * 36, alpha * (0.22 - layer * 0.045))
          ctx.fillText(fragment.text, layer * 2.5, layer * 2)
        }
      } else if (fragment.type === 'pressure') {
        ctx.font = `${fontSize}px "Outfit Local", sans-serif`
        ctx.fillStyle = rgba(5, alpha * 0.66)
        ctx.fillText(fragment.text, 0, 0)
        ctx.beginPath()
        ctx.ellipse(0, 4, Math.min(this.width * 0.12, fragment.text.length * fontSize * 0.36), fontSize * 1.2, 0, 0, TAU)
        ctx.strokeStyle = rgba(16, alpha * 0.15)
        ctx.stroke()
      } else {
        ctx.font = `${fontSize * 1.06}px "Songti SC", serif`
        ctx.fillStyle = rgba(4, alpha * 0.74)
        ctx.fillText(fragment.text, 0, 0)
      }

      if (selected) {
        ctx.fillStyle = rgba(255, 0.32)
        ctx.fillRect(-9, -1, 3, 3)
      }
      ctx.restore()
    }

    drawImpactCompression(x, y, progress) {
      const ctx = this.context
      const radius = (this.mobile ? 74 : 112) * easeOutQuint(progress)
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(x, y, radius, radius * 0.22, -0.1, 0, TAU)
      ctx.strokeStyle = rgba(5, (1 - progress) * 0.55)
      ctx.lineWidth = 1 + progress * 2
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(x, y, radius * 0.55, radius * 0.1, -0.1, 0, TAU)
      ctx.strokeStyle = rgba(255, (1 - progress) * 0.3)
      ctx.lineWidth = 0.7
      ctx.stroke()
      ctx.restore()
    }
  }

  window.SelfAwakeWorld = {
    create(canvas, options) {
      return new ConsciousnessWorld(canvas, options)
    },
  }
})()
