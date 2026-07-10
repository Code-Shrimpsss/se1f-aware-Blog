'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import tagData from 'app/tag-data.json'
import { formatLocalDate, useSiteLocale } from '@/components/Locale/LocaleProvider'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const { locale } = useSiteLocale()
  const basePath = pathname.split('/')[1]
  const prevPage = currentPage > 1
  const nextPage = currentPage < totalPages
  const copy = locale === 'zh'
    ? { prev: '上一页', next: '下一页', page: `第 ${currentPage} / ${totalPages} 页` }
    : { prev: 'Previous', next: 'Next', page: `Page ${currentPage} of ${totalPages}` }

  return (
    <nav className="archive-pagination" aria-label="Pagination">
      {prevPage ? (
        <Link href={currentPage === 2 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`} rel="prev">← {copy.prev}</Link>
      ) : <span />}
      <span>{copy.page}</span>
      {nextPage ? <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">{copy.next} →</Link> : <span />}
    </nav>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const { locale } = useSiteLocale()
  const tagCounts = tagData as Record<string, number>
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])
  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts
  const copy = locale === 'zh'
    ? { label: '文章', title: title || '所有文章', intro: '技术、智能体与持续自我重塑。', all: '全部', entries: '篇文章', read: '阅读', words: '字', minutes: '分钟' }
    : { label: 'Writing', title: 'All writing', intro: 'Notes on engineering, agents, and becoming.', all: 'All', entries: 'essays', read: 'Read', words: 'words', minutes: 'min read' }

  return (
    <div className="archive-page page-reveal">
      <header className="archive-header">
        <div>
          <p>{copy.label}</p>
          <h1>{copy.title}</h1>
          <span>{copy.intro}</span>
        </div>
        <strong><b>{posts.length}</b> {copy.entries}</strong>
      </header>

      <nav className="archive-filter" aria-label="Article filters">
        <Link href="/blog" className={pathname.startsWith('/blog') ? 'is-active' : ''}>{copy.all}</Link>
        {sortedTags.slice(0, 6).map((tag) => {
          const active = pathname.split('/tags/')[1] === slug(tag)
          return <Link key={tag} href={`/tags/${slug(tag)}`} className={active ? 'is-active' : ''}>{tag} <span>{tagCounts[tag]}</span></Link>
        })}
      </nav>

      <ol className="archive-list">
        {displayPosts.map((post, index) => {
          const { path, date, title: postTitle, summary, tags, wordCount, readingTime } = post
          return (
            <li key={path}>
              <article className="archive-entry">
                <span className="archive-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="archive-entry-main">
                  <div className="archive-entry-meta">
                    <time dateTime={date}>{formatLocalDate(date, locale)}</time>
                    {wordCount && <span>{wordCount} {copy.words}</span>}
                    {readingTime && <span>{Math.ceil(readingTime)} {copy.minutes}</span>}
                  </div>
                  <h2><Link href={`/${path}`}>{postTitle}</Link></h2>
                  {summary && <p>{summary}</p>}
                  {tags?.length ? <div className="archive-entry-tags">{tags.map((tag) => <Tag key={tag} text={tag} />)}</div> : null}
                </div>
                <Link href={`/${path}`} className="archive-read" aria-label={`${copy.read}: ${postTitle}`}>{copy.read} <span>↗</span></Link>
              </article>
            </li>
          )
        })}
      </ol>
      {pagination && pagination.totalPages > 1 && <Pagination {...pagination} />}
    </div>
  )
}
