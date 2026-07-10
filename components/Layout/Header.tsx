'use client'

import Link from '../Link'
import SearchButton from '../SearchButton'
import { usePathname } from 'next/navigation'

const Header = () => {
  const pathname = usePathname()

  return (
    <header className="spatial-nav" aria-label="网站导航">
      <Link href="/" aria-label="Se1fAware 首页" className="spatial-brand" data-magnetic>
        <span className="spatial-brand-mark" aria-hidden="true">S<b>1</b></span>
        <span>Se1fAware</span>
      </Link>
      <div className="spatial-nav-actions">
        <nav className="spatial-nav-links" aria-label="主要导航">
          <Link href="/blog" className={pathname.startsWith('/blog') || pathname.startsWith('/tags') ? 'is-active' : ''}>Writing</Link>
          <Link href="/about" className={pathname === '/about' ? 'is-active' : ''}>About</Link>
        </nav>
        <div className="spatial-search"><SearchButton /></div>
        <a className="spatial-contact" href="mailto:se1faware24@gmail.com" data-magnetic>Let's talk <span>↗</span></a>
      </div>
    </header>
  )
}

export default Header
