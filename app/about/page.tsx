import Image from 'next/image'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: '关于我' })

const disciplines = [
  {
    name: 'Agent 开发',
    en: 'Agent Engineering',
    copy: '设计推理、记忆与工具协作链路，让模型进入真实业务，而不只停留在对话框里。',
  },
  {
    name: '全栈交付',
    en: 'Product Engineering',
    copy: '从需求拆解、界面与服务，到数据、部署和上线，独立推动产品完整落地。',
  },
  {
    name: '前端工程',
    en: 'Frontend Craft',
    copy: '三年前端经验，关注复杂交互、工程体系、性能与长期可维护的设计系统。',
  },
]

const stack = ['React / Next.js', 'TypeScript / Node.js', 'AI Agents / RAG', 'Tool Use / MCP', 'Product Design', 'Full-stack Delivery']

export default function AboutPage() {
  return (
    <div className="about-page page-reveal">
      <header className="about-intro">
        <div className="about-intro-copy">
          <p className="quiet-label">Vito Wang · 广东汕头</p>
          <h1>不被职位定义，<br />只被解决的问题定义。</h1>
          <p className="about-lede">
            我是 Agent 开发工程师，也是一名从前端走向全栈的产品工程师。我关心的不只是模型能否回答，
            而是一个复杂系统能否真正被人使用、被业务接受，并稳定地创造价值。
          </p>
          <div className="about-contact">
            <Link href={`mailto:${siteMetadata.email}`}>联系我</Link>
            <Link href={siteMetadata.github}>GitHub ↗</Link>
          </div>
        </div>
        <figure className="about-portrait">
          <Image src={siteMetadata.avatar} alt="Vito Wang" width={420} height={520} priority />
          <figcaption>保持自省，也保持行动。</figcaption>
        </figure>
      </header>

      <section className="about-belief" aria-labelledby="belief-title">
        <p id="belief-title">我的工作方式</p>
        <blockquote>“复杂留给系统，清晰留给使用者。”</blockquote>
        <div>
          <p>我擅长在模糊需求与可交付产品之间建立路径：先找到真正的问题，再决定技术应该出现在哪里。</p>
          <p>前端训练了我对体验的敏感，全栈能力让我看见完整链路，Agent 工程则让我重新思考人与软件如何协作。</p>
        </div>
      </section>

      <section className="about-disciplines" aria-labelledby="discipline-title">
        <header>
          <p className="quiet-label">What I do</p>
          <h2 id="discipline-title">三条能力，指向同一件事</h2>
        </header>
        <div className="discipline-list">
          {disciplines.map((item, index) => (
            <article key={item.en}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><small>{item.en}</small><h3>{item.name}</h3></div>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-stack" aria-labelledby="stack-title">
        <div>
          <p className="quiet-label">Working vocabulary</p>
          <h2 id="stack-title">我用这些能力工作</h2>
        </div>
        <ul>{stack.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
    </div>
  )
}