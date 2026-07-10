import { ReactNode } from 'react'
import Image from '@/components/Image'
import Bleed from 'pliny/ui/Bleed'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import SectionContainer from '@/components/Layout/SectionContainer'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/Scroll/ScrollTopAndComment'
import { formatDate } from 'pliny/utils/formatDate'
import Tag from '@/components/Tag'
import { LocaleText } from '@/components/Locale/LocaleProvider'

interface LayoutProps {
  content: CoreContent<Blog>
  children: ReactNode
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
}

export default function PostMinimal({ content, next, prev, children }: LayoutProps) {
  const { slug, title, images, date, wordCount, readingTime, tags } = content
  const displayImage =
    images && images.length > 0 ? images[0] : 'https://picsum.photos/seed/picsum/800/400'

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article className="page-reveal">
        <div>
          <header className="banner-post-hero mt-6">
            <Bleed>
              <div className="banner-post-frame">
                <Image
                  src={displayImage}
                  alt={title}
                  fill
                  className="banner-post-image object-cover"
                  priority
                />
                <div className="banner-post-overlay" />
                <div className="banner-post-content">
                  <Link href="/blog" className="article-back article-back-light">← <LocaleText zh="返回文章" en="All writing" /></Link>
                  <h1>{title}</h1>
                  <div className="meta-line">
                    <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                    <span className="meta-dot" />
                    <span>{wordCount} 字</span>
                    <span className="meta-dot" />
                    <span>{readingTime} 分钟</span>
                  </div>
                  {tags && tags.length > 0 && (
                    <div className="banner-post-tags">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Bleed>
          </header>
          <div className="pb-8 pt-4">
            <div className="post-body prose min-w-0 dark:prose-invert">
              {children}
            </div>
            {siteMetadata.comments && (
              <div className="pb-6 pt-6 text-center text-gray-700 dark:text-gray-300" id="comment">
                <Comments slug={slug} />
              </div>
            )}
            {(prev || next) && (
              <footer>
                <nav
                  className={`post-nav py-8 ${!prev || !next ? 'post-nav-single' : ''}`}
                  aria-label="Article navigation"
                >
                  {prev && prev.path && (
                    <Link
                      href={`/${prev.path}`}
                      className="post-nav-card post-nav-card-prev"
                      aria-label={`Previous post: ${prev.title}`}
                    >
                      <span className="post-nav-label"><LocaleText zh="上一篇" en="Previous" /></span>
                      <span className="post-nav-title">{prev.title}</span>
                    </Link>
                  )}
                  {next && next.path && (
                    <Link
                      href={`/${next.path}`}
                      className="post-nav-card post-nav-card-next"
                      aria-label={`Next post: ${next.title}`}
                    >
                      <span className="post-nav-label"><LocaleText zh="下一篇" en="Next" /></span>
                      <span className="post-nav-title">{next.title}</span>
                    </Link>
                  )}
                </nav>
              </footer>
            )}
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
