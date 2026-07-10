import { ReactNode } from 'react'
import Image from '@/components/Image'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import SectionContainer from '@/components/Layout/SectionContainer'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/Scroll/ScrollTopAndComment'
import { LocaleText } from '@/components/Locale/LocaleProvider'
import ArticleHeader from '@/components/Article/ArticleHeader'

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
          <header className="article-header banner-spatial-header">
            <ArticleHeader title={title} date={date} wordCount={wordCount} readingTime={readingTime} tags={tags} />
            <figure className="banner-spatial-visual" data-reveal data-tilt>
              <Image src={displayImage} alt={title} fill className="object-cover" priority />
              <span aria-hidden="true" />
            </figure>
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
