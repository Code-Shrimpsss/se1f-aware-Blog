import projectsData from '@/data/projectsData'
import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Work', description: 'Vito Wang 的产品工程、AI Agent 与全栈实践。' })

export default function Projects() {
  return (
    <div className="work-page page-reveal">
      <section className="work-hero" data-reveal>
        <div><p className="spatial-mono">Selected practice · 2026</p><h1>把复杂系统，<br /><em>做成清晰体验。</em></h1></div>
        <p>工作横跨 AI Agent、全栈工程与前端体验。这里不陈列虚构数字，只呈现我持续投入的产品问题与工程能力。</p>
      </section>
      <section className="work-orbit" aria-label="项目与实践">
        <i aria-hidden="true" />
        {projectsData.map((d, index) => (
          <Link key={d.title} href={d.href} className={`work-plane work-plane-${index + 1}`} data-reveal data-tilt>
            <span className="work-index">0{index + 1}</span>
            <small>{d.eyebrow}</small>
            <h2>{d.title}</h2>
            <p>{d.description}</p>
            <ul>{d.capabilities.map((item) => <li key={item}>{item}</li>)}</ul>
            <strong>{d.status}<b>↗</b></strong>
          </Link>
        ))}
      </section>
      <section className="work-principle" data-reveal><p className="spatial-mono">How I work</p><blockquote>先找到真正的问题，<br />再让技术退到体验背后。</blockquote><Link href="/about">了解我的方法 <span>↗</span></Link></section>
    </div>
  )
}
