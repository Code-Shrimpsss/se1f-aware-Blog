'use client'

import { useSiteLocale } from './Locale/LocaleProvider'

export default function LanguageSwitch() {
  const { locale, toggleLocale } = useSiteLocale()

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="language-switch-btn"
      aria-label={locale === 'zh' ? 'Switch interface to English' : '将界面切换为中文'}
      title={locale === 'zh' ? 'English' : '中文'}
    >
      <svg className="language-switch-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.25" />
        <path d="M3.95 12h16.1M12 3.75c2.1 2.25 3.18 5 3.18 8.25S14.1 18 12 20.25C9.9 18 8.82 15.25 8.82 12S9.9 6 12 3.75Z" />
      </svg>
    </button>
  )
}
