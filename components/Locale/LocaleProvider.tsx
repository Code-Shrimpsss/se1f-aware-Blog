'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Locale = 'zh' | 'en'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh')

  useEffect(() => {
    const saved = window.localStorage.getItem('site-locale')
    if (saved === 'zh' || saved === 'en') {
      setLocaleState(saved)
      document.documentElement.lang = saved === 'zh' ? 'zh-CN' : 'en'
    }
  }, [])

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale)
    window.localStorage.setItem('site-locale', nextLocale)
    document.documentElement.lang = nextLocale === 'zh' ? 'zh-CN' : 'en'
  }

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale: () => setLocale(locale === 'zh' ? 'en' : 'zh') }),
    [locale]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useSiteLocale() {
  const context = useContext(LocaleContext)
  if (!context) throw new Error('useSiteLocale must be used within LocaleProvider')
  return context
}

export function LocaleText({ zh, en }: { zh: React.ReactNode; en: React.ReactNode }) {
  const { locale } = useSiteLocale()
  return <>{locale === 'zh' ? zh : en}</>
}

export function formatLocalDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: locale === 'zh' ? 'numeric' : 'short',
    day: 'numeric',
  }).format(new Date(date))
}
