import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import Image from 'next/image'

const capabilities = [
  {
    title: 'Agent Engineering',
    chinese: '智能体工程',
    description: '从推理链路、工具调用到企业协作，把 AI 从一次回答变成可持续工作的系统。',
    proof: 'Agents · RAG · Tool use · Workflow',
  },
  {
    title: 'Full-stack Systems',
    chinese: '全栈交付',
    description: '理解产品目标，也能打通前后端、数据与部署，把复杂想法收束成稳定可用的产品。',
    proof: 'Next.js · Node.js · API · Delivery',
  },
  {
    title: 'Frontend Craft',
    chinese: '前端体验',
    description: '以三年前端工程经验为底座，在性能、交互与视觉之间寻找精确平衡。',
    proof: 'React · TypeScript · Design systems',
  },
]

export default function Home({ posts }) {
  return (
    <div className="home-page page-reveal">
      <Hero />
      <CapabilityField />
      <ReadingShelf posts={posts} />
    </div>
  )
}

function Hero() {
  return (
    <section className="brand-hero" aria-labelledby="home-title">
      <div className="brand-hero-copy">
        <p className="brand-overline">
          <span>Vito Wang</span>
          <span aria-hidden="true">·</span>
          <span>Agent / Full-stack / Frontend</span>
        </p>
        <h1 id="home-title">
          <span>在技术的边界之外，</span>
          <span className="brand-hero-emphasis">持续成为自己。</span>
        </h1>
        <p className="brand-hero-lede">
          我设计智能体，也构建完整产品。这里记录工程实践、认知迭代，以及一个开发者如何在快速变化的世界里保持清醒。
        </p>
        <div className="brand-hero-actions">
          <Link href="/blog" className="button-primary">
            开始阅读 <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/about" className="button-quiet">
            认识我
          </Link>
        </div>
      </div>

      <aside className="home-portrait" aria-label="个人简介">
        <div className="home-portrait-image">
          <Image
            src={siteMetadata.avatar}
            alt={siteMetadata.author}
            width={152}
            height={152}
            className="home-avatar"
            priority
          />
        </div>
        <p><span>Vito Wang</span> 为真实业务构建 AI Agent，也写关于工程与自我重塑的文章。</p>
      </aside>
    </section>
  )
}

function CapabilityField() {
  return (
    <section className="capability-field" aria-labelledby="capability-title">
      <header className="section-heading">
        <p>能力不是标签，而是解决问题的路径。</p>
        <h2 id="capability-title">不受单一职位定义</h2>
      </header>
      <div className="capability-paths">
        {capabilities.map((capability, index) => (
          <article className="capability-path" key={capability.title}>
            <div className="capability-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="capability-title">
              <span>{capability.chinese}</span>
              <h3>{capability.title}</h3>
            </div>
            <p>{capability.description}</p>
            <small>{capability.proof}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

function ReadingShelf({ posts }) {
  const visiblePosts = posts.slice(0, siteMetadata.post.homeMaxDisplay)

  return (
    <section className="reading-shelf" aria-labelledby="reading-title">
      <header className="section-heading reading-heading">
        <div>
          <p>写作是我整理世界的方式。</p>
          <h2 id="reading-title">近来所思</h2>
        </div>
        <Link href="/blog" className="text-link">
          查看全部文章 <span aria-hidden="true">→</span>
        </Link>
      </header>

      {visiblePosts.length ? (
        <ol className="home-posts">
          {visiblePosts.map((post, index) => {
            const { slug, date, title, summary, wordCount, readingTime } = post
            return (
              <li key={slug}>
                <article className="home-post">
                  <span className="home-post-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="home-post-main">
                    <h3>
                      <Link href={`/blog/${slug}`}>{title}</Link>
                    </h3>
                    {summary && <p>{summary}</p>}
                  </div>
                  <div className="home-post-meta">
                    <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                    {wordCount && <span>{wordCount} 字</span>}
                    {readingTime && <span>约 {Math.ceil(readingTime)} 分钟</span>}
                  </div>
                </article>
              </li>
            )
          })}
        </ol>
      ) : (
        <div className="reading-empty">
          <p>新的思考正在沉淀。</p>
          <span>过些时候再来，或通过 RSS 订阅更新。</span>
        </div>
      )}
    </section>
  )
}