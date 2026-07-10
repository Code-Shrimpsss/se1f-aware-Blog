'use client'

import { useEffect, useRef } from 'react'

type Glyph = {
  char: string
  x: number
  y: number
  size: number
  alpha: number
  phase: number
}

const glyphs = '观心知行山水风月思无界未完待续此刻之间'

export default function LivingTypeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: -1000, y: -1000, active: false }
    let width = 0
    let height = 0
    let pixelRatio = 1
    let frame = 0
    let visible = true
    let running = false
    let items: Glyph[] = []

    const createGlyphs = () => {
      const count = Math.max(28, Math.min(72, Math.floor((width * height) / 19000)))
      items = Array.from({ length: count }, (_, index) => ({
        char: glyphs[index % glyphs.length],
        x: Math.random() * width,
        y: Math.random() * height,
        size: 12 + Math.random() * 34,
        alpha: 0.035 + Math.random() * 0.11,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      createGlyphs()
    }

    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
      pointer.active = true
    }

    const clearPointer = () => {
      pointer.active = false
    }

    const draw = (time = 0) => {
      if (!running) return
      context.clearRect(0, 0, width, height)
      const dark = document.documentElement.classList.contains('dark')
      context.textAlign = 'center'
      context.textBaseline = 'middle'

      items.forEach((item) => {
        const dx = item.x - pointer.x
        const dy = item.y - pointer.y
        const distance = Math.hypot(dx, dy)
        const radius = 190
        const influence = pointer.active ? Math.max(0, 1 - distance / radius) : 0
        const drift = reduceMotion ? 0 : Math.sin(time * 0.00045 + item.phase) * 4
        const push = influence * 30
        const x = item.x + (distance ? (dx / distance) * push : 0)
        const y = item.y + drift + (distance ? (dy / distance) * push : 0)
        const alpha = item.alpha + influence * 0.22

        context.save()
        context.translate(x, y)
        context.rotate((influence * dx) / 4200)
        context.font = `${Math.round(item.size + influence * 14)}px "LXGW WenKai TC", serif`
        context.fillStyle = dark ? `rgba(210,226,218,${alpha})` : `rgba(31,72,59,${alpha})`
        context.fillText(item.char, 0, 0)
        context.restore()
      })

      if (!reduceMotion) frame = requestAnimationFrame(draw)
    }

    const start = () => {
      if (running || !visible || document.hidden) return
      running = true
      draw(performance.now())
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(frame)
    }

    const handleVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) start()
        else stop()
      },
      { rootMargin: '80px' }
    )

    resize()
    start()
    observer.observe(canvas)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', handleVisibility)
    canvas.addEventListener('pointermove', updatePointer)
    canvas.addEventListener('pointerleave', clearPointer)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
      canvas.removeEventListener('pointermove', updatePointer)
      canvas.removeEventListener('pointerleave', clearPointer)
    }
  }, [])

  return <canvas ref={canvasRef} className="living-type-canvas" aria-hidden="true" />
}
