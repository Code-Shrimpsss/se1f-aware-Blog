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
      {locale === 'zh' ? 'EN' : '中'}
    </button>
  )
}
