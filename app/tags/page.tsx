import Link from '@/components/Link'
import { slug } from 'github-slugger'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: '标签', description: 'Things I blog about' })

export default async function Page() {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  const totalTaggedPosts = sortedTags.reduce((count, tag) => count + tagCounts[tag], 0)
  const maxCount = Math.max(...sortedTags.map((tag) => tagCounts[tag]), 1)

  return (
    <div className="page-reveal">
      <section className="tag-index-hero border-b border-dashed border-slate-300 pb-7 pt-6 dark:border-slate-700">
        <div className="section-kicker">Index cards</div>
        <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-950 dark:text-gray-50 sm:text-5xl">
              标签
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              A compact map of recurring notes, grouped by the ideas they keep circling back to.
            </p>
          </div>
          <div className="tag-index-count">
            <span>{sortedTags.length}</span>
            <small>tags / {totalTaggedPosts} links</small>
          </div>
        </div>
      </section>

      <section className="tag-cloud py-7" aria-label="Tag index">
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
              className={`tag-cloud-item tag-cloud-item-${weight} page-reveal`}
              style={{ animationDelay: `${index * 28}ms` }}
              aria-label={`View posts tagged ${tag}`}
            >
              <span className="tag-cloud-name">{tag}</span>
              <span className="tag-cloud-count">{count}</span>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
