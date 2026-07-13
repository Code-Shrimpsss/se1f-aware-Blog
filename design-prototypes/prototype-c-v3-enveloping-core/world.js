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
    [-0.7, -0.2, 0.02],
    [-0.51, -0.61, -0.1],
    [-0.12, -0.73, 0.15],
    [0.09, -0.61, 0.29],
    [0.42, -0.53, -0.08],
    [0.63, -0.28, 0.18],
    [0.41, -0.02, 0.32],
    [0.68, 0.18, -0.02],
    [0.37, 0.43, 0.22],
    [0.06, 0.38, 0.37],
    [-0.08, 0.7, 0.02],
    [-0.45, 0.55, 0.2],
    [-0.63, 0.27, -0.12],
    [-0.2, 0.04, 0.24],
    [-0.28, -0.3, 0.48],
    [0.02, -0.37, 0.62],
    [0.31, -0.25, 0.46],
    [-0.12, 0.02, 0.65],
    [0.13, 0.02, 0.76],
    [0.39, 0.13, 0.49],
    [-0.27, 0.32, 0.38],
    [0.01, 0.35, 0.57],
    [0.28, 0.3, 0.45],
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

  const STRUCTURAL_BODIES = [
    {
      x: 0.41,
      y: -0.41,
      angle: -0.16,
      delay: 0.1,
      points: [[-0.29, -0.1], [0.31, -0.16], [0.43, 0.01], [0.18, 0.16], [-0.34, 0.12]],
    },
    {
      x: -0.38,
      y: 0.32,
      angle: 0.18,
      delay: 0.44,
      points: [[-0.16, -0.16], [0.17, -0.12], [0.22, 0.09], [-0.06, 0.18], [-0.2, 0.04]],
    },
    {
      x: 0.1,
      y: 0.49,
      angle: -0.08,
      delay: 0.76,
      points: [[-0.08, -0.05], [0.09, -0.04], [0.1, 0.04], [-0.05, 0.07]],
    },
  ]

  const CRACK_PROFILE = [
    [1.06, 0.08],
    [0.82, 0.2],
    [0.9, 0.34],
    [0.66, 0.43],
    [0.75, 0.57],
    [0.47, 0.67],
    [0.56, 0.79],
    [0.29, 0.91],
    [0.17, 1.08],
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
      this.surfaceMesh = []
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
      this.buildSurfaceMesh()
    }

    buildSurfaceMesh() {
      const columns = this.mobile ? 9 : this.quality === 'medium' ? 11 : 14
      const rows = this.mobile ? 10 : this.quality === 'medium' ? 10 : 12
      const margin = 0.18
      this.surfaceMesh = []
      for (let row = 0; row <= rows; row += 1) {
        const line = []
        for (let column = 0; column <= columns; column += 1) {
          const baseU = -margin + (column / columns) * (1 + margin * 2)
          const baseV = -margin + (row / rows) * (1 + margin * 2)
          const edge = column === 0 || column === columns || row === 0 || row === rows
          const jitterU = edge ? 0 : (hashNumber(row * 131 + column * 47) - 0.5) * 0.032
          const jitterV = edge ? 0 : (hashNumber(row * 59 + column * 97) - 0.5) * 0.028
          line.push({
            u: baseU + jitterU,
            v: baseV + jitterV,
            material: hashNumber(row * 83 + column * 29),
          })
        }
        this.surfaceMesh.push(line)
      }
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
      const targetCount = this.mobile ? 24 : this.quality === 'medium' ? 36 : 46
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

      ctx.restore()

      const pointSize = 0.7 + reveal * 1.25
      ctx.fillStyle = rgba(245, reveal * 0.94)
      ctx.fillRect(cx - pointSize / 2, cy - pointSize / 2, pointSize, pointSize)
    }

    drawFormation(progress, time, reducedMotion) {
      const pointProgress = clamp(progress / 0.12)
      this.drawVoid(pointProgress)

      const revealProgress = clamp((progress - 0.08) / 0.82)
      const pulse = reducedMotion ? 0 : time
      this.drawCoreWorld(pulse, revealProgress, 0, true)

      ;[
        { start: 0.16, duration: 0.23, index: 0 },
        { start: 0.52, duration: 0.24, index: 2 },
      ].forEach((cut) => {
        const local = clamp((progress - cut.start) / cut.duration)
        if (local > 0 && local < 1) this.drawDimensionalSlice(cut.index, local)
      })
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
        cx: this.width * 0.55,
        cy: this.height * 0.48,
        scale: Math.min(this.width, this.height) * 0.49,
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
      const directional = centroid.x * 0.58 + centroid.y * 0.24
      return clamp(0.18 + (directional + 0.75) * 0.42, 0.08, 0.86)
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
      const points = CRACK_PROFILE.map(([u, v], index) => ({
        x: layout.cx + ((u - 0.5) * 0.86 + 0.025 + Math.sin(index * 4.7) * 0.009) * layout.scale,
        y: layout.cy + (v - 0.5) * 1.18 * layout.scale,
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
      if (reveal < 0.5) return
      const ctx = this.context
      const seconds = time / 1000
      STRUCTURAL_BODIES.forEach((body, index) => {
        const localReveal = smoothstep((reveal - (0.62 + index * 0.13)) / 0.14)
        if (localReveal <= 0) return
        const propagation = Math.sin(seconds * 0.92 - body.delay * 2.4)
        const permanent = Math.min(18, this.irreversibleRevision) * 0.0012 * layout.scale
        const x = layout.cx + body.x * layout.scale + Math.sin(index * 2.2) * permanent
        const y = layout.cy + body.y * layout.scale + propagation * layout.scale * 0.007 + Math.cos(index * 1.8) * permanent

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(body.angle)
        const projected = body.points.map(([px, py]) => ({ x: px * layout.scale, y: py * layout.scale }))
        const gradient = ctx.createLinearGradient(-layout.scale * 0.3, 0, layout.scale * 0.35, 0)
        gradient.addColorStop(0, rgba(142, 0.84 * localReveal))
        gradient.addColorStop(0.52, rgba(184, 0.94 * localReveal))
        gradient.addColorStop(1, rgba(159, 0.9 * localReveal))

        ctx.save()
        ctx.translate(layout.scale * 0.014, layout.scale * 0.02)
        ctx.beginPath()
        projected.forEach((point, pointIndex) => {
          if (pointIndex === 0) ctx.moveTo(point.x, point.y)
          else ctx.lineTo(point.x, point.y)
        })
        ctx.closePath()
        ctx.fillStyle = rgba(38, 0.8 * localReveal)
        ctx.fill()
        ctx.restore()

        ctx.beginPath()
        projected.forEach((point, pointIndex) => {
          if (pointIndex === 0) ctx.moveTo(point.x, point.y)
          else ctx.lineTo(point.x, point.y)
        })
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()
        ctx.strokeStyle = rgba(248, 0.36 * localReveal)
        ctx.lineWidth = 0.8
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
      for (let crease = 0; crease < 3; crease += 1) {
        const offset = (crease - 1) * radius * 0.07
        ctx.beginPath()
        ctx.moveTo(x - radius * 0.46, y + offset + radius * 0.08)
        ctx.bezierCurveTo(
          x - radius * 0.15,
          y + offset - radius * 0.12,
          x + radius * 0.18,
          y + offset + radius * 0.09,
          x + radius * 0.43,
          y + offset - radius * 0.05,
        )
        ctx.strokeStyle = rgba(12, (0.18 - crease * 0.035) * effectiveStrength)
        ctx.lineWidth = 0.7
        ctx.stroke()
      }
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
      const plane = ctx.createLinearGradient(x - thickness, 0, x, 0)
      plane.addColorStop(0, rgba(196, 0))
      plane.addColorStop(0.62, rgba(221, alpha * 0.035))
      plane.addColorStop(1, rgba(242, alpha * 0.13))
      ctx.fillStyle = plane
      ctx.fillRect(x - thickness, -diagonal, thickness, diagonal * 2)
      ctx.fillStyle = rgba(252, alpha * 0.56)
      ctx.fillRect(x, -diagonal, index === 2 ? 1.4 : 1, diagonal * 2)
      ctx.restore()
    }

    drawDive(progress, time, reducedMotion) {
      const base = this.coreLayout()
      const expansion = reducedMotion
        ? progress < 0.5 ? 0 : 1
        : progress < 0.32
          ? easeInCubic(progress / 0.32) * 0.08
          : 0.08 + easeOutQuint((progress - 0.32) / 0.68) * 0.92
      const scale = lerp(base.scale, Math.max(this.width, this.height) * 1.26, expansion)
      const cx = lerp(base.cx, this.width * 0.34, expansion)
      const cy = lerp(base.cy, this.height * 0.58, expansion)

      if (expansion < 0.88) {
        this.drawCoreWorld(time, 1, 0, false, { cx, cy, scale })
      }

      if (expansion > 0.3) {
        const surfaceExpansion = smoothstep((expansion - 0.3) / 0.7)
        this.drawWrappedSurface({ phase: 'surface', progress: 0, time }, surfaceExpansion, false)
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
      this.drawWrappedSurface(frame, 1, true)
    }

    sampleSurface(u, v, expansion = 1) {
      const nx = (u - 0.5) * 2
      const ny = (v - 0.5) * 2
      const rotation = -0.14
      const rotatedX = nx * Math.cos(rotation) - ny * Math.sin(rotation)
      const rotatedY = nx * Math.sin(rotation) + ny * Math.cos(rotation)
      const radial = nx * nx * 0.34 + ny * ny * 0.48
      const barrel = 1 + radial * 0.105
      const warpX = Math.sin(v * 7.1 + u * 2.3) * this.width * 0.014
      const warpY = Math.cos(u * 6.4 - v * 2.1) * this.height * 0.012
      const targetX = this.width * 0.52 + rotatedX * this.width * 0.62 * barrel + warpX + this.surfaceOffset * 9
      const targetY = this.height * 0.48 + rotatedY * this.height * 0.64 * barrel + warpY

      const core = this.coreLayout()
      const sourceX = core.cx + ((u - 0.5) * 0.86 + 0.025) * core.scale
      const sourceY = core.cy + (v - 0.5) * 1.18 * core.scale
      const edgeDistance = Math.max(Math.abs(nx), Math.abs(ny))
      const localExpansion = smoothstep((expansion - edgeDistance * 0.075) / 0.925)
      const depth = 0.32 + radial * 0.23 + Math.sin(u * 8.2 + v * 3.4) * 0.045
      return {
        x: lerp(sourceX, targetX, localExpansion),
        y: lerp(sourceY, targetY, localExpansion),
        depth,
        tangentAngle: rotation + Math.sin(v * 4.7 + u) * 0.08,
        normalX: Math.sin(u * 5.3 + v * 2.2) * 0.18,
        normalY: Math.cos(v * 4.1 - u * 2.6) * 0.18,
      }
    }

    drawWrappedSurface(frame, expansion = 1, clearBackground = true) {
      const ctx = this.context
      if (clearBackground) {
        ctx.fillStyle = '#050505'
        ctx.fillRect(0, 0, this.width, this.height)
      }

      const points = this.surfaceMesh.map((row) => row.map((node) => ({
        ...this.sampleSurface(node.u, node.v, expansion),
        u: node.u,
        v: node.v,
        material: node.material,
      })))

      const drawTriangle = (a, b, c, gray, alpha = 0.98) => {
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.lineTo(c.x, c.y)
        ctx.closePath()
        ctx.fillStyle = rgba(gray, alpha)
        ctx.fill()
      }

      for (let row = 0; row < points.length - 1; row += 1) {
        for (let column = 0; column < points[row].length - 1; column += 1) {
          const a = points[row][column]
          const b = points[row][column + 1]
          const c = points[row + 1][column + 1]
          const d = points[row + 1][column]
          const centerX = (a.x + b.x + c.x + d.x) * 0.25 / this.width
          const centerY = (a.y + b.y + c.y + d.y) * 0.25 / this.height
          const incidence = smoothstep(1 - Math.hypot(centerX - this.pointer.x, centerY - this.pointer.y) / 0.52)
          const curvature = (a.depth + b.depth + c.depth + d.depth) * 0.25
          const baseGray = 174 + curvature * 34 + a.material * 6 + incidence * 7
          const alternate = (row + column) % 2 === 0
          if (alternate) {
            drawTriangle(a, b, d, baseGray - 1)
            drawTriangle(b, c, d, baseGray + 1.5)
          } else {
            drawTriangle(a, b, c, baseGray + 1)
            drawTriangle(a, c, d, baseGray - 1.5)
          }
        }
      }

      const curvatureShade = ctx.createRadialGradient(
        this.width * 0.24,
        this.height * 0.16,
        0,
        this.width * 0.24,
        this.height * 0.16,
        Math.max(this.width, this.height) * 1.08,
      )
      curvatureShade.addColorStop(0, rgba(255, 0.015))
      curvatureShade.addColorStop(0.48, rgba(42, 0.045))
      curvatureShade.addColorStop(1, rgba(0, 0.21))
      ctx.save()
      ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = curvatureShade
      ctx.fillRect(0, 0, this.width, this.height)
      ctx.restore()

      this.drawEmbeddedSurfaceLayers(frame, expansion)
      this.drawWrappedStrata(expansion)
      this.drawSurfaceCrack(frame, expansion)
      if (expansion > 0.66) this.drawPersistentImprints(frame)
      if (frame.phase === 'surface' && frame.progress < 0.82) this.drawSurfaceName(frame.progress)
      this.drawTerrainLight()
    }

    drawSurfacePolygon(uvPoints, expansion, fill, stroke = null) {
      const ctx = this.context
      const points = uvPoints.map(([u, v]) => this.sampleSurface(u, v, expansion))
      ctx.beginPath()
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y)
        else ctx.lineTo(point.x, point.y)
      })
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
      if (stroke) {
        ctx.strokeStyle = stroke
        ctx.lineWidth = 0.75
        ctx.stroke()
      }
    }

    drawEmbeddedSurfaceLayers(frame, expansion) {
      const sediment = ['storm', 'fragment-observed', 'freeze', 'impact', 'explore'].includes(frame.phase) ? 1 : 0.55
      this.drawSurfacePolygon(
        [[-0.04, 0.18], [0.2, 0.08], [0.33, 0.27], [0.21, 0.47], [-0.07, 0.39]],
        expansion,
        rgba(9, 0.82),
        rgba(245, 0.13),
      )
      this.drawSurfacePolygon(
        [[0.59, -0.05], [0.93, 0.02], [1.08, 0.26], [0.79, 0.33], [0.57, 0.17]],
        expansion,
        rgba(247, 0.13),
        rgba(249, 0.18),
      )
      this.drawSurfacePolygon(
        [[0.64, 0.63], [1.04, 0.53], [1.13, 0.84], [0.73, 0.96], [0.55, 0.78]],
        expansion,
        rgba(34, 0.1),
        rgba(246, 0.1),
      )

      const ctx = this.context
      for (let layer = 0; layer < 5; layer += 1) {
        const start = this.sampleSurface(0.62 + layer * 0.012, 0.72 + layer * 0.013, expansion)
        const end = this.sampleSurface(0.91 + layer * 0.008, 0.66 + layer * 0.01, expansion)
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.strokeStyle = rgba(249, sediment * (0.045 + layer * 0.017))
        ctx.lineWidth = 4 + layer * 1.4
        ctx.stroke()
      }
    }

    drawWrappedStrata(expansion) {
      const ctx = this.context
      const count = this.mobile ? 11 : 19
      for (let index = 0; index < count; index += 1) {
        const vertical = index % 4 === 0
        const seed = hashNumber(index * 71 + 12)
        ctx.beginPath()
        for (let segment = 0; segment < 7; segment += 1) {
          const t = segment / 6
          const u = vertical
            ? 0.12 + seed * 0.78 + Math.sin(t * 4.2 + seed * 6) * 0.025
            : -0.08 + t * 1.16
          const v = vertical
            ? -0.08 + t * 1.16
            : 0.08 + seed * 0.84 + Math.sin(t * 5.1 + seed * 5) * 0.028
          const point = this.sampleSurface(u, v, expansion)
          if (segment === 0) ctx.moveTo(point.x, point.y)
          else ctx.lineTo(point.x, point.y)
        }
        ctx.strokeStyle = rgba(index % 6 === 0 ? 12 : 246, index % 6 === 0 ? 0.13 : 0.055)
        ctx.lineWidth = index % 6 === 0 ? 1.1 : 0.55
        ctx.stroke()
      }
    }

    drawSurfaceName(progress) {
      const ctx = this.context
      const point = this.sampleSurface(0.74, 0.25, 1)
      const visibility = Math.sin(clamp(progress / 0.82) * Math.PI)
      ctx.save()
      ctx.translate(point.x, point.y)
      ctx.rotate(point.tangentAngle)
      ctx.fillStyle = rgba(10, visibility * 0.13)
      ctx.font = `${this.mobile ? 22 : 34}px "Songti SC", serif`
      ctx.fillText('观象', 0, 0)
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

    surfaceCrackPoints(deepAmount = 0, expansion = 1) {
      return CRACK_PROFILE.map(([u, v], index) => {
        const pressureShift = deepAmount * Math.sin((index / (CRACK_PROFILE.length - 1)) * Math.PI) * 0.012
        return this.sampleSurface(u + pressureShift, v - pressureShift * 0.4, expansion)
      })
    }

    drawSurfaceCrack(frame, expansion = 1) {
      const ctx = this.context
      const phase = frame.phase
      const impactProgress = phase === 'impact' ? smoothstep(frame.progress) : phase === 'explore' || this.deepCrack ? 1 : 0
      const points = this.surfaceCrackPoints(impactProgress, expansion)
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
        const baseWidth = (this.mobile ? 3.2 : 5.2) + Math.sin(index * 1.9) * 1.7
        const deepWidth = impactProgress * (this.mobile ? 9 : 15) * Math.sin(t * Math.PI)
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
      const canyon = ctx.createLinearGradient(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y)
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
        const origin = points[5]
        const branchMid = this.sampleSurface(0.32, 0.62, expansion)
        const branchEnd = this.sampleSurface(0.12, 0.55, expansion)
        ctx.beginPath()
        ctx.moveTo(origin.x, origin.y)
        ctx.lineTo(lerp(origin.x, branchMid.x, branchProgress), lerp(origin.y, branchMid.y, branchProgress))
        ctx.lineTo(lerp(origin.x, branchEnd.x, branchProgress), lerp(origin.y, branchEnd.y, branchProgress))
        ctx.lineTo(lerp(origin.x, branchEnd.x + 5, branchProgress), lerp(origin.y, branchEnd.y + 4, branchProgress))
        ctx.lineTo(lerp(origin.x, branchMid.x + 7, branchProgress), lerp(origin.y, branchMid.y + 5, branchProgress))
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
        { kind: 'observed', u: 0.12 + this.coreScar.x * 0.42, v: 0.18 + this.coreScar.y * 0.38 },
        { kind: 'technical', u: 0.2, v: 0.62 },
        { kind: 'art', u: 0.78, v: 0.27 },
        { kind: 'pressure', u: 0.44, v: 0.8 },
        { kind: 'sediment', u: 0.71, v: 0.69 },
        { kind: 'inscription', u: 0.31, v: 0.7 },
      ]

      imprints.forEach((imprint, index) => {
        const visibility = this.imprintVisibility(frame, index)
        if (visibility <= 0) return
        const surfacePoint = this.sampleSurface(imprint.u, imprint.v, 1)
        const x = surfacePoint.x
        const y = surfacePoint.y

        if (imprint.kind === 'observed') {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(surfacePoint.tangentAngle - 0.1)
          ctx.beginPath()
          ctx.ellipse(0, 0, this.width * 0.065, this.height * 0.018, 0, 0.18, Math.PI * 1.47)
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
          ctx.rotate(surfacePoint.tangentAngle - 0.05)
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
          ctx.rotate(surfacePoint.tangentAngle + 0.12)
          for (let contour = 0; contour < 5; contour += 1) {
            const spread = this.width * (0.034 + contour * 0.016)
            const lift = this.height * (0.008 + contour * 0.006)
            ctx.beginPath()
            ctx.moveTo(-spread, lift * 0.3)
            ctx.bezierCurveTo(-spread * 0.38, -lift, spread * 0.24, lift * 0.8, spread, -lift * 0.15)
            ctx.strokeStyle = rgba(18, (0.2 - contour * 0.026) * visibility)
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
          ctx.restore()
        } else if (imprint.kind === 'sediment') {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(surfacePoint.tangentAngle - 0.16)
          for (let layer = 0; layer < 4; layer += 1) {
            ctx.fillStyle = rgba(245, (0.075 + layer * 0.025) * visibility)
            ctx.fillRect(-this.width * 0.075 + layer * 6, -18 + layer * 8, this.width * 0.15, 7)
          }
          ctx.restore()
        } else {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(surfacePoint.tangentAngle)
          ctx.font = `${this.mobile ? 10 : 12}px "Songti SC", serif`
          ctx.fillStyle = rgba(10, 0.23 * visibility)
          ctx.fillText('推进并不等于抵达', -this.width * 0.068, 0)
          ctx.restore()
        }
      })

      const titlePoint = this.sampleSurface(0.27, 0.68, 1)
      const titleX = titlePoint.x / this.width
      const titleY = titlePoint.y / this.height
      const revealDistance = Math.hypot(this.pointer.x - titleX, this.pointer.y - titleY)
      const reveal = smoothstep(1 - revealDistance / 0.22) * (frame.phase === 'explore' ? 1 : 0.2)
      if (reveal > 0.015 || (this.mobile && frame.phase === 'explore')) {
        ctx.save()
        ctx.translate(titlePoint.x, titlePoint.y)
        ctx.rotate(titlePoint.tangentAngle)
        const titleAlpha = Math.max(this.mobile ? 0.26 : 0, reveal * 0.58)
        ctx.font = `${this.mobile ? 16 : 22}px "Songti SC", serif`
        ctx.fillStyle = rgba(7, titleAlpha)
        ctx.fillText('从能回答，到能交付', -this.width * 0.075, 0)
        ctx.font = `${this.mobile ? 8 : 10}px "Songti SC", serif`
        ctx.fillStyle = rgba(7, titleAlpha * 0.58)
        ctx.fillText('可靠性本身就是用户正在使用的产品', -this.width * 0.075, this.mobile ? 18 : 24)
        ctx.restore()
      }
    }

    fragmentPosition(fragment, worldTime) {
      const seconds = worldTime / 1000
      const local = ((seconds + fragment.phase) % fragment.cycle) / fragment.cycle
      const eased = local * local * (3 - 2 * local)
      const routes = [
        [-0.16, 0.16, 1.14, 0.76],
        [1.16, 0.1, -0.12, 0.84],
        [0.18, -0.16, 0.79, 1.14],
        [0.94, 1.14, 0.13, -0.15],
        [-0.12, 0.9, 1.13, 0.22],
        [1.13, 0.78, 0.08, -0.13],
        [-0.13, 0.46, 1.14, 0.36],
        [0.66, -0.14, 0.22, 1.14],
      ]
      const route = routes[fragment.lane % routes.length]
      const dx = route[2] - route[0]
      const dy = route[3] - route[1]
      const length = Math.max(0.01, Math.hypot(dx, dy))
      const curve = Math.sin(local * Math.PI) * (0.035 + fragment.depth * 0.07)
      return {
        x: lerp(route[0], route[2], eased) + (-dy / length) * curve,
        y: lerp(route[1], route[3], eased) + (dx / length) * curve + Math.sin(fragment.seed * 0.0001 + local * TAU) * 0.016,
        local,
      }
    }

    drawInformationStorm(frame) {
      const ctx = this.context
      const phase = frame.phase
      const frozenTime = Number(frame.frozenAt || frame.time || 0)
      const activeTime = phase === 'storm' || phase === 'fragment-observed' ? Number(frame.time || 0) : frozenTime
      const selectedId = this.observedFragmentId == null ? 7 : this.observedFragmentId
      const impactTarget = this.sampleSurface(0.56, 0.79, 1)
      const freezeProgress = phase === 'freeze' ? smoothstep(frame.progress) : phase === 'impact' ? 1 : 0
      const impactProgress = phase === 'impact' ? smoothstep(frame.progress) : 0
      const otherAlpha = phase === 'impact' ? 1 - easeOutQuint(frame.progress) : 1
      this.projectedFragments = []

      const ordered = this.fragments.slice().sort((a, b) => a.depth - b.depth)
      for (const fragment of ordered) {
        const basePosition = this.fragmentPosition(fragment, activeTime)
        let x = basePosition.x * this.width
        let y = basePosition.y * this.height
        let alpha = clamp(0.1 + fragment.depth * 0.36) * otherAlpha
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
        const width = Math.min(this.width * 0.12, fragment.text.length * fontSize * 0.36)
        ctx.moveTo(-width * 0.08, fontSize * 0.75)
        ctx.bezierCurveTo(width * 0.23, fontSize * 1.4, width * 0.68, fontSize * 0.2, width, fontSize * 0.72)
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
      const depression = ctx.createRadialGradient(x, y, 0, x, y, radius)
      depression.addColorStop(0, rgba(0, (1 - progress * 0.4) * 0.38))
      depression.addColorStop(0.36, rgba(12, (1 - progress) * 0.19))
      depression.addColorStop(1, rgba(0, 0))
      ctx.fillStyle = depression
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
      ctx.beginPath()
      ctx.moveTo(x - radius * 0.72, y + radius * 0.13)
      ctx.bezierCurveTo(
        x - radius * 0.25,
        y - radius * 0.24,
        x + radius * 0.28,
        y + radius * 0.19,
        x + radius * 0.68,
        y - radius * 0.08,
      )
      ctx.strokeStyle = rgba(249, (1 - progress) * 0.24)
      ctx.lineWidth = 0.8
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
