'use client'

import Link from '../Link'
import SearchButton from '../SearchButton'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const Header = () => {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="spatial-nav" aria-label="网站导航">
      <Link href="/" aria-label="Se1fAware 首页" className="spatial-brand" data-magnetic>
        <span className="spatial-brand-mark" aria-hidden="true">S<b>1</b></span>
        <span translate="no">Se1fAware</span>
      </Link>
      <div className="spatial-nav-actions">
        <nav className="spatial-nav-links" aria-label="主要导航">
          <Link href="/projects" className={pathname === '/projects' ? 'is-active' : ''}>Work</Link>
          <Link href="/blog" className={pathname.startsWith('/blog') || pathname.startsWith('/tags') ? 'is-active' : ''}>Writing</Link>
          <Link href="/about" className={pathname === '/about' ? 'is-active' : ''}>About</Link>
        </nav>
        <div className="spatial-search"><SearchButton /></div>
        <a className="spatial-contact" href="mailto:se1faware24@gmail.com" data-magnetic>Let's talk <span>↗</span></a>
        <button
          ref={menuButtonRef}
          className="spatial-menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="spatial-mobile-menu"
          aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i /><i />
        </button>
      </div>
      <div id="spatial-mobile-menu" className={`spatial-mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label="移动导航">
          <Link href="/projects"><small>01</small><span>Work</span></Link>
          <Link href="/blog"><small>02</small><span>Writing</span></Link>
          <Link href="/tags"><small>03</small><span>Topics</span></Link>
          <Link href="/about"><small>04</small><span>About</span></Link>
        </nav>
        <div className="spatial-mobile-menu-actions">
          <div onClick={() => setMenuOpen(false)}><SearchButton label="搜索文章" showLabel /></div>
          <a href="mailto:se1faware24@gmail.com">开始对话 <span>↗</span></a>
        </div>
        <p>Agent systems · Full-stack craft · Interface engineering</p>
      </div>
    </header>
  )
}

export default Header
