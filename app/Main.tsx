'use client'

import { useState } from 'react'
import Link from '@/components/Link'
import LivingTypeCanvas from '@/components/Home/LivingTypeCanvas'
import { formatLocalDate, LocaleText, useSiteLocale } from '@/components/Locale/LocaleProvider'

export default function Home({ posts }) {
  const { locale } = useSiteLocale()
  const [activePost, setActivePost] = useState(0)
  const featuredPosts = posts.slice(0, 5)
  const active = featuredPosts[activePost]

  return (
    <div className="kinetic-home page-reveal">
      <section className="living-hero" aria-labelledby="living-title">
        <LivingTypeCanvas />
        <div className="living-hero-topline">
          <span>SE1FAWARE / VITO WANG</span>
          <span><LocaleText zh="向内辨认 · 向外构造" en="LOOK WITHIN · MAKE OUTWARD" /></span>
        </div>
        <div className="living-hero-copy">
          <p><LocaleText zh="一种持续校准自我，也持续创造世界的生活方式" en="A practice of refining the self while making the world" /></p>
          <h1 id="living-title" aria-label={locale === 'zh' ? '观心，造物。' : 'Look within. Make outward.'}>
            {locale === 'zh' ? (
              <>
                <span>观心</span><em aria-hidden="true">，</em><span>造物</span><em aria-hidden="true">。</em>
              </>
            ) : (
              <>
                <span>LOOK WITHIN</span><em aria-hidden="true">/</em><span>MAKE OUTWARD</span>
              </>
            )}
          </h1>
        </div>
        <div className="living-hero-footer">
          <Link href="/blog"><LocaleText zh="进入文章" en="Enter writing" /> <span>↘</span></Link>
          <p><LocaleText zh="移动光标，在未说出口之处寻找文字" en="Move slowly. Find language before it is spoken." /></p>
        </div>
      </section>

      <section className="kinetic-index" aria-labelledby="latest-title">
        <header className="kinetic-index-header">
          <p><LocaleText zh="最近写作" en="Recent writing" /></p>
          <h2 id="latest-title"><LocaleText zh="正在发生的思考" en="Thoughts in motion" /></h2>
          <span>{String(featuredPosts.length).padStart(2, '0')} / {String(posts.length).padStart(2, '0')}</span>
        </header>

        <div className="kinetic-index-body">
          <div className="kinetic-list" role="list">
            {featuredPosts.map((post, index) => (
              <article
                key={post.slug}
                className={index === activePost ? 'kinetic-row is-active' : 'kinetic-row'}
                onPointerEnter={() => setActivePost(index)}
                onFocusCapture={() => setActivePost(index)}
                role="listitem"
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                <time dateTime={post.date}>{formatLocalDate(post.date, locale)}</time>
                <Link href={`/blog/${post.slug}`} className="kinetic-arrow" aria-label={post.title}>↗</Link>
              </article>
            ))}
          </div>

          <aside className="kinetic-lens" aria-live="polite">
            <div className="kinetic-lens-number">{String(activePost + 1).padStart(2, '0')}</div>
            <p>{active?.summary || <LocaleText zh="一则仍在生长的笔记。" en="A note still becoming." />}</p>
            <div>
              {active?.tags?.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </aside>
        </div>

        <footer className="kinetic-index-footer">
          <Link href="/blog"><LocaleText zh="浏览全部文章" en="Browse all writing" /> <span>→</span></Link>
          <p>VITO WANG © {new Date().getFullYear()}</p>
        </footer>
      </section>
    </div>
  )
}
