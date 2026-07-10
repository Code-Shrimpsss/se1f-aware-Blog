'use client'

import { ReactNode } from 'react'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { formatLocalDate, useSiteLocale } from '@/components/Locale/LocaleProvider'

interface ArticleHeaderProps {
  title: string
  date: string
  wordCount?: number
  readingTime?: number
  tags?: string[]
  light?: boolean
  children?: ReactNode
}

export default function ArticleHeader({ title, date, wordCount, readingTime, tags, light = false, children }: ArticleHeaderProps) {
  const { locale } = useSiteLocale()
  const copy = locale === 'zh'
    ? { back: '返回文章', words: '字', minutes: '分钟阅读' }
    : { back: 'All writing', words: 'words', minutes: 'min read' }

  return (
    <div className="article-header-inner">
      <Link href="/blog" className={`article-back ${light ? 'article-back-light' : ''}`}>← {copy.back}</Link>
      <h1>{title}</h1>
      <div className="article-meta">
        <time dateTime={date}>{formatLocalDate(date, locale)}</time>
        {wordCount ? <><span aria-hidden="true">·</span><span>{wordCount} {copy.words}</span></> : null}
        {readingTime ? <><span aria-hidden="true">·</span><span>{Math.ceil(readingTime)} {copy.minutes}</span></> : null}
      </div>
      {tags?.length ? <div className="article-tags">{tags.map((tag) => <Tag key={tag} text={tag} />)}</div> : null}
      {children}
    </div>
  )
}
