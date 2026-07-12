'use client'

import Link from '../Link'
import SearchButton from '../SearchButton'
import BrandMark from '../Brand/BrandMark'
import LanguageSwitch from '../LanguageSwitch'
import { LocaleText, useSiteLocale } from '../Locale/LocaleProvider'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const Header = () => {
  const pathname = usePathname()
  const { locale } = useSiteLocale()
  const isZh = locale === 'zh'
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
    <header className="spatial-nav" aria-label={isZh ? '网站导航' : 'Site navigation'}>
      <Link href="/" aria-label={isZh ? 'Se1fAware 首页' : 'Se1fAware home'} className="spatial-brand" data-magnetic>
        <span className="spatial-brand-mark" aria-hidden="true"><BrandMark /></span>
        <span translate="no">Se1fAware</span>
      </Link>
      <div className="spatial-nav-actions">
        <nav className="spatial-nav-links" aria-label={isZh ? '主要导航' : 'Primary navigation'}>
          <Link href="/projects" className={pathname === '/projects' ? 'is-active' : ''}><LocaleText zh="作品" en="Work" /></Link>
          <Link href="/blog" className={pathname.startsWith('/blog') || pathname.startsWith('/tags') ? 'is-active' : ''}><LocaleText zh="文章" en="Writing" /></Link>
          <Link href="/about" className={pathname === '/about' ? 'is-active' : ''}><LocaleText zh="关于" en="About" /></Link>
        </nav>
        <div className="spatial-language"><LanguageSwitch /></div>
        <div className="spatial-search"><SearchButton /></div>
        <a className="spatial-contact" href="mailto:se1faware24@gmail.com" data-magnetic><LocaleText zh="联系我" en="Let's talk" /> <span>↗</span></a>
        <button
          ref={menuButtonRef}
          className="spatial-menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="spatial-mobile-menu"
          aria-label={menuOpen ? (isZh ? '关闭导航菜单' : 'Close navigation menu') : (isZh ? '打开导航菜单' : 'Open navigation menu')}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i /><i />
        </button>
      </div>
      <div id="spatial-mobile-menu" className={`spatial-mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label={isZh ? '移动导航' : 'Mobile navigation'}>
          <Link href="/projects"><small>01</small><span><LocaleText zh="作品" en="Work" /></span></Link>
          <Link href="/blog"><small>02</small><span><LocaleText zh="文章" en="Writing" /></span></Link>
          <Link href="/tags"><small>03</small><span><LocaleText zh="主题" en="Topics" /></span></Link>
          <Link href="/about"><small>04</small><span><LocaleText zh="关于" en="About" /></span></Link>
        </nav>
        <div className="spatial-mobile-menu-actions">
          <div onClick={() => setMenuOpen(false)}><SearchButton label={isZh ? '搜索文章' : 'Search writing'} showLabel /></div>
          <a href="mailto:se1faware24@gmail.com"><LocaleText zh="开始对话" en="Start a conversation" /> <span>↗</span></a>
        </div>
        <p>Agent systems · Full-stack craft · Interface engineering</p>
      </div>
    </header>
  )
}

export default Header
