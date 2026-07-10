'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from '@/components/Link'
import { LocaleText } from '@/components/Locale/LocaleProvider'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

type Props = { posts: CoreContent<Blog>[] }

const practices = [
  { code: '01', name: 'Agent Engineering', copy: 'RAG、工具调用与工作流，形成可以进入真实业务的智能能力。' },
  { code: '02', name: 'Full-stack Systems', copy: '连接服务、数据和部署，让产品从问题一直走到可验证的交付。' },
  { code: '03', name: 'Frontend Craft', copy: '把复杂系统压缩成自然、清晰、值得信任的交互表面。' },
]

export default function Home({ posts }: Props) {
  const [palette, setPalette] = useState<'blue' | 'mono' | 'warm' | 'mint'>('blue')
  const featured = posts.slice(0, 5)
  const leadPost = featured[0]

  return (
    <div className="spatial-home" data-palette={palette}>
      <section className="spatial-hero" aria-labelledby="home-title">
        <div className="spatial-hero-copy" data-reveal>
          <p className="spatial-pill"><span className="spatial-pill-orb" />Independent creative technologist</p>
          <h1 id="home-title">
            <span><LocaleText zh="让复杂变得" en="Designing calm," /></span>
            <span><em><LocaleText zh="自然，" en="human" /></em><LocaleText zh="清晰，耐用。" en="intelligence." /></span>
          </h1>
          <p className="spatial-hero-lede">
            <LocaleText
              zh="我是 Vito。把 Agent、全栈系统与前端体验组合成真正能被使用的产品。"
              en="I turn agents, full-stack systems, and frontend craft into products people can trust and use."
            />
          </p>
          <div className="spatial-actions">
            <Link href="#writing" className="spatial-button spatial-button-primary" data-magnetic>Explore my work <span>↗</span></Link>
            <Link href="/about" className="spatial-button spatial-button-secondary" data-magnetic><i>▶</i> My story</Link>
          </div>
        </div>

        <div className="identity-stage" aria-label="Vito 的能力组合空间">
          <div className="identity-world">
            <div className="identity-halo" aria-hidden="true" />
            <div className="identity-orbit identity-orbit-a" aria-hidden="true" />
            <div className="identity-orbit identity-orbit-b" aria-hidden="true" />
            <figure className="identity-portrait" data-reveal>
              <span className="identity-portrait-light" aria-hidden="true" />
              <Image src="/static/images/avatar.jpg" alt="Vito Wang" width={420} height={520} priority />
              <figcaption>Vito Wang · Se1fAware</figcaption>
            </figure>

            <article className="spatial-plane identity-plane-left" data-tilt data-reveal>
              <small>One product · three structures</small>
              <h2>Useful,<br />by design.</h2>
              <strong>03</strong>
              <p>Agent · Full-stack · Frontend</p>
              <div className="identity-bars" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            </article>

            {leadPost && (
              <Link href={`/${leadPost.path}`} className="spatial-plane identity-plane-right" data-tilt data-reveal>
                <small>Latest writing</small>
                <h2>{leadPost.title}</h2>
                <div className="identity-case">
                  <strong>{leadPost.summary || 'A note on technology, craft, and becoming.'}</strong>
                  <span>{leadPost.tags?.slice(0, 3).join(' · ') || 'WRITING'} ↗</span>
                </div>
              </Link>
            )}

            <div className="spatial-palette" aria-label="选择光场颜色">
              {(['blue', 'mono', 'warm', 'mint'] as const).map((item) => (
                <button key={item} className={palette === item ? 'is-active' : ''} data-color={item} onClick={() => setPalette(item)} aria-label={`${item} palette`} aria-pressed={palette === item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="spatial-section practice-section" id="practice" aria-labelledby="practice-title">
        <header className="spatial-section-heading" data-reveal>
          <p className="spatial-mono">01 / PRACTICE</p>
          <h2 id="practice-title">不是三种职位，<br />是同一条<span>交付路径。</span></h2>
          <p>技术选择只有在它让产品更清楚、更可靠、更接近真实问题时才有价值。</p>
        </header>
        <div className="practice-orbit" data-reveal>
          <div className="practice-core"><span>Problem</span><strong>→</strong><span>Product</span></div>
          {practices.map((practice, index) => (
            <article key={practice.name} className={`practice-node practice-node-${index + 1}`} data-tilt>
              <small>{practice.code}</small><h3>{practice.name}</h3><p>{practice.copy}</p>
            </article>
          ))}
          <i className="practice-path" aria-hidden="true" />
        </div>
      </section>

      <section className="spatial-section writing-section" id="writing" aria-labelledby="writing-title">
        <header className="spatial-section-heading writing-heading" data-reveal>
          <p className="spatial-mono">02 / WRITING</p>
          <h2 id="writing-title">Thought,<br /><span>made visible.</span></h2>
          <Link href="/blog" className="spatial-text-link">全部文章 · {posts.length} <span>↗</span></Link>
        </header>
        <div className="writing-constellation">
          {featured.map((post, index) => (
            <Link key={post.path} href={`/${post.path}`} className={`writing-plane writing-plane-${index + 1}`} data-tilt data-reveal>
              <span className="spatial-mono">{String(index + 1).padStart(2, '0')} · {post.tags?.[0] || 'NOTE'}</span>
              <h3>{post.title}</h3>
              <p>{post.summary || 'A note still becoming.'}</p>
              <strong>Read note <i>↗</i></strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="spatial-section proof-section" aria-labelledby="proof-title">
        <header className="spatial-section-heading" data-reveal>
          <p className="spatial-mono">03 / PROOF</p>
          <h2 id="proof-title">Ideas become credible<br /><span>when they ship.</span></h2>
        </header>
        <div className="proof-rail" data-reveal>
          <article><time>2024.06 — NOW</time><h3>FastMoss</h3><p>在真实业务中推进前端、全栈与 AI Agent 工程实践。</p></article>
          <article><time>2021 — 2024</time><h3>Aimy</h3><p>长期参与远程教育平台的全栈与前端工程建设。</p></article>
          <article><time>DELIVERY / 01</time><h3>AI Support Agent</h3><p>端到端完成 Agent 链路、工具调用与企业协作落地。</p></article>
          <span className="proof-light" aria-hidden="true" />
        </div>
      </section>

      <section className="spatial-contact-section" data-reveal>
        <p className="spatial-pill"><span className="spatial-status-dot" />Available for selected collaborations</p>
        <h2>Have a difficult idea?<br /><em>Let’s make it feel simple.</em></h2>
        <a href="mailto:se1faware24@gmail.com" className="spatial-button spatial-button-primary" data-magnetic>Start a conversation <span>↗</span></a>
      </section>
    </div>
  )
}
