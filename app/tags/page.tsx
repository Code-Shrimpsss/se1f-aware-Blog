import Link from '@/components/Link'
import { slug } from 'github-slugger'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'
import type { CSSProperties } from 'react'

export const metadata = genPageMetadata({ title: 'Topics', description: '按主题浏览 AI Agent、全栈工程与产品体验文章。' })

export default async function Page() {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  const totalTaggedPosts = sortedTags.reduce((count, tag) => count + tagCounts[tag], 0)
  const maxCount = Math.max(...sortedTags.map((tag) => tagCounts[tag]), 1)

  return (
    <div className="topics-page page-reveal">
      <section className="topics-hero" data-reveal>
        <div><p className="spatial-mono">Knowledge constellation</p><h1>循着主题，<br /><em>找到思考。</em></h1><p>文章不是孤立的页面。它们在 Agent、架构、工具与体验之间相互连接。</p></div>
        <strong><b>{sortedTags.length}</b><span>topics<br />{totalTaggedPosts} connections</span></strong>
      </section>
      <section className="topics-cloud" aria-label="主题索引">
        {tagKeys.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No tags found.</p>
        )}
        {sortedTags.map((tag, index) => {
          const count = tagCounts[tag]
          const weight = count === maxCount ? 'major' : count > 1 ? 'mid' : 'minor'
          return (
            <Link
              key={tag}
              href={`/tags/${slug(tag)}`}
              className={`topic-orb topic-orb-${weight}`}
              style={{ '--topic-index': index } as CSSProperties}
              aria-label={`查看主题 ${tag} 的文章`}
              data-reveal
              data-tilt
            >
              <span>{tag}</span><small>{String(count).padStart(2, '0')}</small>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
