import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from '../Link'
import MobileNav from '../Multi-Platform/MobileNav'
import ThemeSwitch from '../Theme/ThemeSwitch'
import SearchButton from '../SearchButton'
import LanguageSwitch from '../LanguageSwitch'
import { LocaleText } from '../Locale/LocaleProvider'

const Header = () => {
  return (
    <header className="site-header">
      <Link href="/" aria-label={siteMetadata.headerTitle} className="site-brand">
        <span className="site-brand-mark" aria-hidden="true">
          自
        </span>
        <span className="site-brand-copy">
          <strong>{siteMetadata.headerTitle}</strong>
          <small><LocaleText zh="观心 · 造物" en="Think · Make" /></small>
        </span>
      </Link>
      <div className="site-header-actions">
        <nav className="desktop-nav" aria-label="Main navigation">
        {headerNavLinks
          .filter((link) => link.href !== '/')
          .map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="desktop-nav-link"
            >
              {link.href === '/blog' ? <LocaleText zh="文章" en="Writing" /> : <LocaleText zh="关于" en="About" />}
            </Link>
          ))}
        </nav>
        <SearchButton />
        <ThemeSwitch />
        <LanguageSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
