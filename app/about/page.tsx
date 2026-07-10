import Image from 'next/image'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: '关于我' })

const disciplines = [
  { name: 'Agent 开发', en: 'Agent Engineering', copy: '设计推理、记忆、RAG 与工具协作链路，让模型进入真实业务，而不只停留在对话框。' },
  { name: '全栈交付', en: 'Product Engineering', copy: '从模糊需求、界面与服务，到数据、部署和上线，维持一条完整、可验证的产品路径。' },
  { name: '前端工程', en: 'Frontend Craft', copy: '关注复杂交互、工程体系、性能与设计系统，把系统能力变成自然可信的使用体验。' },
]

const experience = [
  { date: '2024.06 — NOW', name: 'FastMoss', role: 'Frontend · Full-stack · AI Engineering', copy: '在真实业务中推进产品界面、工程链路与 AI Agent 实践，让新能力进入可交付状态。' },
  { date: '2021 — 2024', name: 'Aimy', role: 'Frontend · Full-stack Engineering', copy: '长期参与远程教育平台建设，在持续迭代中处理产品体验、业务系统与工程维护。' },
  { date: 'SELECTED DELIVERY', name: 'AI 客服助手', role: 'Agent workflow · Tool use', copy: '端到端完成 Agent 链路、工具调用与企业协作落地，关注回答之外的行动和交付。' },
]

const principles = [
  ['01', '先辨认问题', '不急着选框架。先把需求、约束和真正需要改变的行为说清楚。'],
  ['02', '建立完整路径', '把前端、服务、数据、模型与部署看成同一件产品，而不是分散的技术任务。'],
  ['03', '把复杂留在系统里', '让使用者看到的是清楚的选择、稳定的反馈和值得信任的结果。'],
]

const stack = ['React / Next.js', 'TypeScript / Node.js', 'AI Agents / RAG', 'Tool Use / MCP', 'Product Design', 'Full-stack Delivery']

export default function AboutPage() {
  return (
    <div className="about-page">
      <header className="about-intro">
        <div className="about-intro-copy" data-reveal>
          <p className="quiet-label">Vito Wang · Se1fAware</p>
          <h1>不被职位定义，<br />只被解决的<em>问题</em>定义。</h1>
          <p className="about-lede">我是 Agent 开发工程师，也是一名从前端走向全栈的产品工程师。我关心的不只是模型能否回答，而是复杂系统能否真正被人使用、被业务接受，并稳定创造价值。</p>
          <div className="about-contact">
            <Link href={`mailto:${siteMetadata.email}`} data-magnetic>联系我 ↗</Link>
            <Link href={siteMetadata.github} data-magnetic>GitHub ↗</Link>
          </div>
        </div>
        <figure className="about-portrait" data-reveal data-tilt>
          <span className="about-portrait-glow" aria-hidden="true" />
          <Image src={siteMetadata.avatar} alt="Vito Wang" width={420} height={520} priority />
          <figcaption>保持自省，也保持行动。</figcaption>
        </figure>
      </header>

      <section className="about-belief" aria-labelledby="belief-title" data-reveal>
        <p id="belief-title">Working belief</p>
        <blockquote>“复杂留给系统，<br />清晰留给使用者。”</blockquote>
        <div><p>前端训练了我对体验的敏感，全栈能力让我看见完整链路，Agent 工程则让我重新思考人与软件如何协作。</p><p>我擅长在模糊需求与可交付产品之间建立路径：先找到真正的问题，再决定技术应该出现在哪里。</p></div>
      </section>

      <section className="about-disciplines" aria-labelledby="discipline-title">
        <header data-reveal><p className="quiet-label">One product · three structures</p><h2 id="discipline-title">三条能力，指向同一件事</h2></header>
        <div className="discipline-list">
          {disciplines.map((item, index) => <article key={item.en} data-reveal data-tilt><span>{String(index + 1).padStart(2, '0')}</span><div><small>{item.en}</small><h3>{item.name}</h3></div><p>{item.copy}</p></article>)}
        </div>
      </section>

      <section className="about-experience" aria-labelledby="experience-title">
        <header data-reveal><p className="quiet-label">Experience orbit</p><h2 id="experience-title">走过的路，成为能力的形状。</h2></header>
        <div className="about-experience-orbit" data-reveal>
          <i aria-hidden="true" />
          {experience.map((item, index) => <article key={item.name} className={`experience-plane experience-plane-${index + 1}`} data-tilt><time>{item.date}</time><h3>{item.name}</h3><small>{item.role}</small><p>{item.copy}</p></article>)}
        </div>
      </section>

      <section className="about-method" aria-labelledby="method-title">
        <header data-reveal><p className="quiet-label">How I work</p><h2 id="method-title">从不确定，走到可交付。</h2></header>
        <ol>{principles.map(([index, title, copy]) => <li key={index} data-reveal><span>{index}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol>
      </section>

      <section className="about-stack" aria-labelledby="stack-title" data-reveal>
        <div><p className="quiet-label">Working vocabulary</p><h2 id="stack-title">我用这些能力工作</h2></div>
        <ul>{stack.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section className="about-closing" data-reveal>
        <p className="spatial-pill"><span className="spatial-status-dot" />Open to meaningful collaborations</p>
        <h2>如果问题足够真实，<br /><em>我们可以一起把它做清楚。</em></h2>
        <a href={`mailto:${siteMetadata.email}`} className="spatial-button spatial-button-primary" data-magnetic>Start a conversation ↗</a>
      </section>
    </div>
  )
}
