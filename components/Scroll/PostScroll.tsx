'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  // 🔥common
  // const scaleX = scrollYProgress

  // 🔥lazy
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      // initial={{ opacity: 0 }}
      // whileInView={{ opacity: 1 }}
      className="fixed left-0 right-0 top-0 z-50 h-1.5 origin-left bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.55)]"
      style={{ scaleX }}
    />
  )
}
