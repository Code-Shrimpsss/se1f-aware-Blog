'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Transition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={reduceMotion ? false : { opacity: 0, y: 14, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
