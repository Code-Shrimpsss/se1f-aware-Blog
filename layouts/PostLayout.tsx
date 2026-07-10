import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import SectionContainer from '@/components/Layout/SectionContainer'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/Scroll/ScrollTopAndComment'

import ArticleHeader from '@/components/Article/ArticleHeader'
import { LocaleText } from '@/components/Locale/LocaleProvider'

const editUrl = (path) => `${siteMetadata.siteRepo}/blob/main/data/${path}`
const discussUrl = (path) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(`${siteMetadata.siteUrl}/${path}`)}`

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
}

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, wordCount, readingTime, tags } = content
  const basePath = path.split('/')[0]

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article className="page-reveal">
        <div>
          <header className="article-header">
            <ArticleHeader title={title} date={date} wordCount={wordCount} readingTime={readingTime} tags={tags} />
          </header>
          <div className="pb-8 pt-4">
            <div className="xl:col-span-3 xl:row-span-2 xl:pb-0">
              <div className="post-body prose min-w-0 dark:prose-invert">
                {children}
              </div>
              {(prev || next) && (
                <nav
                  className={`post-nav py-8 ${!prev || !next ? 'post-nav-single' : ''}`}
                  aria-label="Article navigation"
                >
                  {prev && (
                    <Link href={`/${prev.path}`} className="post-nav-card post-nav-card-prev">
                      <span className="post-nav-label"><LocaleText zh="上一篇" en="Previous" /></span>
                      <span className="post-nav-title">{prev.title}</span>
                    </Link>
                  )}
                  {next && (
                    <Link href={`/${next.path}`} className="post-nav-card post-nav-card-next">
                      <span className="post-nav-label"><LocaleText zh="下一篇" en="Next" /></span>
                      <span className="post-nav-title">{next.title}</span>
                    </Link>
                  )}
                </nav>
              )}
              {siteMetadata.comments && (
                <div
                  className="pb-6 pt-8 text-center text-gray-700 dark:text-gray-300"
                  id="comment"
                >
                  <Comments slug={slug} />
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
