'use client'

import { useState } from 'react'
import Link from '@/components/Link'
import { LocaleText } from '@/components/Locale/LocaleProvider'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

type Props = { posts: CoreContent<Blog>[] }

const practices = [
  { code: '01', name: 'Agent Engineering', zh: '理解与推理', en: 'Frame & reason', visualZh: '意图进入系统', visualEn: 'Intent enters the system' },
  { code: '02', name: 'Full-stack Systems', zh: '连接与交付', en: 'Connect & ship', visualZh: '服务形成路径', visualEn: 'Services form a path' },
  { code: '03', name: 'Frontend Craft', zh: '压缩与澄清', en: 'Distill & clarify', visualZh: '复杂变得可见', visualEn: 'Complexity becomes visible' },
]

const identityCards = [
  {
    code: '01 / AGENT SYSTEMS',
    title: 'Reason → action',
    copy: '让模型、工具与真实工作流形成闭环。',
    className: 'identity-plane-agent',
  },
  {
    code: '02 / FULL-STACK',
    title: 'Ship the path',
    copy: '从服务、数据到上线，减少交付断层。',
    className: 'identity-plane-systems',
  },
  {
    code: '03 / FRONTEND CRAFT',
    title: 'Clarity holds',
    copy: '把复杂系统变成值得信任的界面。',
    className: 'identity-plane-craft',
  },
]

export default function Home({ posts }: Props) {
  const [activePractice, setActivePractice] = useState(0)
  const featured = posts.slice(0, 5)
  const leadPost = featured[0]

  return (
    <div className="spatial-home">
      <section className="spatial-hero" aria-labelledby="home-title" data-scroll-scene>
        <div className="spatial-hero-copy" data-reveal>
          <p className="spatial-pill"><span className="spatial-pill-orb" />Independent creative technologist</p>
          <h1 id="home-title">
            <span><LocaleText zh="让复杂变得" en="Designing calm," /></span>
            <span><em><LocaleText zh="自然，" en="human" /></em><LocaleText zh="清晰，耐用。" en="intelligence." /></span>
          </h1>
        </div>

        <div className="identity-stage" aria-label="Vito 的能力组合空间">
          <div className="identity-world">
            <div className="identity-halo" aria-hidden="true" />
            <div className="identity-orbit identity-orbit-a" aria-hidden="true" />
            <div className="identity-orbit identity-orbit-b" aria-hidden="true" />
            <article className="spatial-plane identity-plane-left" data-tilt data-reveal>
              <small>One product · three disciplines</small>
              <h2>Useful,<br />by intent.</h2>
              <strong>03</strong>
              <p>Agent · Full-stack · Frontend</p>
              <div className="identity-bars" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            </article>

            {identityCards.map((card) => (
              <article key={card.code} className={`spatial-plane identity-plane-capability ${card.className}`} data-tilt data-reveal>
                <small>{card.code}</small>
                <h2>{card.title}</h2>
                <p>{card.copy}</p>
              </article>
            ))}

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

          </div>
        </div>
      </section>

      <section className="spatial-section practice-section" id="practice" aria-labelledby="practice-title" data-scroll-scene>
        <header className="spatial-section-heading" data-reveal>
          <p className="practice-name">Practice</p>
          <h2 id="practice-title"><LocaleText zh="复杂能力，" en="Complex skills," /><br /><span><LocaleText zh="收束成一次交付。" en="one delivery path." /></span></h2>
        </header>
        <div className="practice-composition" data-reveal>
          <div className="practice-visual-placeholder" data-active={activePractice + 1} aria-live="polite">
            <span>MODE / {practices[activePractice].code}</span>
            <div className="practice-visual-orbit" aria-hidden="true"><i /><i /><i /></div>
            <div className="practice-visual-flow" aria-hidden="true"><i /><i /><i /><i /></div>
            <strong key={practices[activePractice].code}><LocaleText zh={practices[activePractice].visualZh} en={practices[activePractice].visualEn} /></strong>
            <small><i aria-hidden="true" /><LocaleText zh="悬停或点击切换能力" en="Hover or select a capability" /></small>
          </div>
          <ol className="practice-steps">
            {practices.map((practice, index) => (
              <li key={practice.name} className={activePractice === index ? 'is-active' : ''}>
                <button
                  type="button"
                  aria-pressed={activePractice === index}
                  onPointerEnter={() => setActivePractice(index)}
                  onFocus={() => setActivePractice(index)}
                  onClick={() => setActivePractice(index)}
                >
                  <small>{practice.code}</small>
                  <div><strong>{practice.name}</strong><span><LocaleText zh={practice.zh} en={practice.en} /></span></div>
                  <i aria-hidden="true">↗</i>
                </button>
              </li>
            ))}
          </ol>
          <div className="practice-output" aria-label="Problem to product">
            <span>Problem</span><b>→</b><strong>Product</strong>
          </div>
        </div>
      </section>

      <section className="spatial-section writing-section" id="writing" aria-labelledby="writing-title" data-scroll-scene>
        <header className="spatial-section-heading writing-heading" data-reveal>
          <p className="spatial-mono">02 / WRITING</p>
          <h2 id="writing-title">Thought,<br /><span>made visible.</span></h2>
          <Link href="/blog" className="spatial-text-link">全部文章 · {posts.length} <span>↗</span></Link>
        </header>
        <div className="writing-constellation">
          {featured.map((post, index) => (
            <Link key={post.path} href={`/${post.path}`} className={`writing-plane writing-plane-${index + 1}`} data-reveal>
              <span className="spatial-mono">{String(index + 1).padStart(2, '0')} · {post.tags?.[0] || 'NOTE'}</span>
              <h3>{post.title}</h3>
              <p>{post.summary || 'A note still becoming.'}</p>
              <strong>Read note <i>↗</i></strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="spatial-section proof-section" aria-labelledby="proof-title" data-scroll-scene>
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

      <section className="spatial-contact-section" data-reveal data-scroll-scene>
        <p className="spatial-pill"><span className="spatial-status-dot" />Available for selected collaborations</p>
        <h2>Have a difficult idea?<br /><em>Let’s make it feel simple.</em></h2>
        <a href="mailto:se1faware24@gmail.com" className="spatial-button spatial-button-primary" data-magnetic>Start a conversation <span>↗</span></a>
      </section>
    </div>
  )
}
