'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from '../Link'
import headerNavLinks from '@/data/headerNavLinks'

const MobileNav = () => {
  const [navShow, setNavShow] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    document.body.style.overflow = navShow ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mounted, navShow])

  const onToggleNav = () => {
    setNavShow((status) => !status)
  }

  const closeNav = () => {
    setNavShow(false)
  }

  const panel = (
    <div className="mobile-nav-panel" role="dialog" aria-modal="true" aria-label="Site menu">
      <div className="mobile-nav-panel-header">
        <div>
          <div className="section-kicker">Menu</div>
          <p className="mobile-nav-panel-title">Open notes</p>
        </div>
        <button className="mobile-nav-close" aria-label="Close menu" onClick={closeNav}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <nav className="mobile-nav-list">
        {headerNavLinks.map((link, index) => (
          <div
            key={link.title}
            className="mobile-nav-item"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <span className="mobile-nav-index">{String(index + 1).padStart(2, '0')}</span>
            <Link href={link.href} className="mobile-nav-link" onClick={closeNav}>
              {link.title}
            </Link>
          </div>
        ))}
      </nav>
      <p className="mobile-nav-note">
        Quiet routes for reading, revisiting, and leaving a cleaner trail through the archive.
      </p>
    </div>
  )

  return (
    <>
      <button
        aria-label="Toggle menu"
        aria-expanded={navShow}
        onClick={onToggleNav}
        className="mobile-nav-trigger sm:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="mobile-nav-trigger-icon"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {mounted && navShow && createPortal(panel, document.body)}
    </>
  )
}

export default MobileNav
