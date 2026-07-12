'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function SpatialRuntime() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sceneWheelMedia = window.matchMedia('(min-width: 961px)')
    root.classList.add('spatial-ready')

    const revealNodes = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting)),
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
    )
    revealNodes.forEach((node) => observer.observe(node))

    if (reduceMotion) {
      revealNodes.forEach((node) => node.classList.add('is-visible'))
    }

    const onPointerMove = (event: PointerEvent) => {
      root.style.setProperty('--sp-x', ((event.clientX / window.innerWidth - 0.5) * 2).toFixed(3))
      root.style.setProperty('--sp-y', ((event.clientY / window.innerHeight - 0.5) * 2).toFixed(3))

      const magnetic = (event.target as HTMLElement).closest<HTMLElement>('[data-magnetic]')
      if (magnetic) {
        const box = magnetic.getBoundingClientRect()
        magnetic.style.setProperty('--mag-x', `${(event.clientX - box.left - box.width / 2) * 0.1}px`)
        magnetic.style.setProperty('--mag-y', `${(event.clientY - box.top - box.height / 2) * 0.1}px`)
      }

      const tilt = (event.target as HTMLElement).closest<HTMLElement>('[data-tilt]')
      if (tilt) {
        const box = tilt.getBoundingClientRect()
        tilt.style.setProperty('--tilt-x', `${((event.clientY - box.top) / box.height - 0.5) * -8}deg`)
        tilt.style.setProperty('--tilt-y', `${((event.clientX - box.left) / box.width - 0.5) * 10}deg`)
      }
    }

    const onPointerOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-magnetic]')?.contains(event.relatedTarget as Node)) {
        target.closest<HTMLElement>('[data-magnetic]')?.style.removeProperty('--mag-x')
        target.closest<HTMLElement>('[data-magnetic]')?.style.removeProperty('--mag-y')
      }
      if (!target.closest('[data-tilt]')?.contains(event.relatedTarget as Node)) {
        target.closest<HTMLElement>('[data-tilt]')?.style.removeProperty('--tilt-x')
        target.closest<HTMLElement>('[data-tilt]')?.style.removeProperty('--tilt-y')
      }
    }

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      root.style.setProperty('--sp-scroll', Math.min(1, window.scrollY / max).toFixed(3))
    }

    const scenes = [...document.querySelectorAll<HTMLElement>('[data-scroll-scene]')]
    let wheelLocked = false
    let wheelUnlockTimer = 0

    const onSceneWheel = (event: WheelEvent) => {
      if (!sceneWheelMedia.matches || scenes.length < 2 || event.ctrlKey || Math.abs(event.deltaY) < 12) return
      if ((event.target as HTMLElement).closest('[data-wheel-native]')) return
      if (wheelLocked) {
        event.preventDefault()
        return
      }

      const currentIndex = scenes.reduce((closest, scene, index) => {
        const currentDistance = Math.abs(scenes[closest].getBoundingClientRect().top)
        const candidateDistance = Math.abs(scene.getBoundingClientRect().top)
        return candidateDistance < currentDistance ? index : closest
      }, 0)
      const nextIndex = Math.max(0, Math.min(scenes.length - 1, currentIndex + Math.sign(event.deltaY)))

      if (nextIndex === currentIndex) return
      event.preventDefault()

      wheelLocked = true
      scenes[nextIndex].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
      wheelUnlockTimer = window.setTimeout(() => {
        wheelLocked = false
      }, reduceMotion ? 120 : 850)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerout', onPointerOut, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onSceneWheel, { passive: false })
    onScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onSceneWheel)
      window.clearTimeout(wheelUnlockTimer)
    }
  }, [pathname])

  return null
}
