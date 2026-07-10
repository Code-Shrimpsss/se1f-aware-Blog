import projectsData from '@/data/projectsData'
import Card from '@/components/Card'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Projects' })

export default function Projects() {
  return (
    <div className="page-reveal">
      <section className="project-hero border-b border-dashed border-slate-300 pb-7 pt-6 dark:border-slate-700">
        <div className="section-kicker">Workbench</div>
        <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-950 dark:text-gray-50 sm:text-5xl">
              项目
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              A small shelf for experiments, prototypes, and working notes that became visible.
            </p>
          </div>
          <div className="project-count">
            <span>{projectsData.length}</span>
            <small>items</small>
          </div>
        </div>
      </section>

      <section className="project-grid py-8" aria-label="Projects">
        {projectsData.map((d, index) => (
          <div
            key={d.title}
            className="page-reveal"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <Card title={d.title} description={d.description} imgSrc={d.imgSrc} href={d.href} />
          </div>
        ))}
      </section>
    </div>
  )
}
