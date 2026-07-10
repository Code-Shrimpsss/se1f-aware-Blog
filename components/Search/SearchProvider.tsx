'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarResults,
  KBarSearch,
  useMatches,
  useRegisterActions,
} from 'kbar'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'

type SearchDocument = {
  title: string
  date: string
  path: string
  summary?: string
  tags?: string[]
  readingTime?: number
  wordCount?: number
}

type SearchConfig = {
  provider?: string
  kbarConfig?: {
    searchDocumentsPath?: string
    defaultActions?: any[]
  }
}

type SearchAction = {
  id: string
  name: string
  section: string
  subtitle: string
  keywords: string
  perform: () => void
}

function SearchResults() {
  const { results } = useMatches()

  if (!results.length) {
    return (
      <div className="search-panel-empty">
        <span>No matching notes.</span>
        <small>Try a title, tag, or a phrase from the summary.</small>
      </div>
    )
  }

  return (
    <KBarResults
      items={results}
      maxHeight={420}
      onRender={({ item, active }) => {
        if (typeof item === 'string') {
          return <div className="search-panel-section">{item}</div>
        }

        return (
          <div className={`search-panel-result ${active ? 'search-panel-result-active' : ''}`}>
            <span className="search-panel-result-mark" aria-hidden="true" />
            <div className="min-w-0">
              <div className="search-panel-result-title">{item.name}</div>
              {item.subtitle && <div className="search-panel-result-meta">{item.subtitle}</div>}
            </div>
            <span className="search-panel-result-arrow" aria-hidden="true">
              -&gt;
            </span>
          </div>
        )
      }}
    />
  )
}

function SearchModal({ actions, isLoading }: { actions: SearchAction[]; isLoading: boolean }) {
  useRegisterActions(actions, [actions])
  const indexedLabel = isLoading
    ? 'Index loading'
    : `${actions.length} ${actions.length === 1 ? 'note' : 'notes'} indexed`

  return (
    <KBarPortal>
      <KBarPositioner className="search-panel-positioner">
        <KBarAnimator className="search-panel-shell">
          <div className="search-panel">
            <div className="search-panel-header">
              <div>
                <div className="section-kicker">Index search</div>
                <p>Find a note</p>
                <small className="search-panel-count" aria-live="polite">
                  {indexedLabel}
                </small>
              </div>
              <kbd>ESC</kbd>
            </div>
            <div className="search-panel-input-row">
              <span aria-hidden="true">⌕</span>
              <KBarSearch
                className="search-panel-input"
                defaultPlaceholder="Search titles, summaries, tags…"
                aria-label="Search articles"
                name="site-search"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="search-panel-results">
              {isLoading ? (
                <div className="search-panel-empty">
                  <span>Loading notes…</span>
                  <small>Index cards are being prepared.</small>
                </div>
              ) : (
                <SearchResults />
              )}
            </div>
          </div>
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  )
}

export default function SearchProvider({
  searchConfig,
  children,
}: {
  searchConfig: SearchConfig
  children: React.ReactNode
}) {
  const router = useRouter()
  const [actions, setActions] = useState<SearchAction[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const kbarConfig = searchConfig?.kbarConfig
  const searchDocumentsPath = kbarConfig?.searchDocumentsPath

  useEffect(() => {
    let cancelled = false

    async function loadSearchIndex() {
      if (!searchDocumentsPath) {
        setDataLoaded(true)
        return
      }

      const url =
        searchDocumentsPath.indexOf('://') > 0 || searchDocumentsPath.indexOf('//') === 0
          ? searchDocumentsPath
          : new URL(searchDocumentsPath, window.location.origin).toString()
      const response = await fetch(url)
      const documents = (await response.json()) as SearchDocument[]

      if (cancelled) return

      setActions(
        documents.map((post) => ({
          id: post.path,
          name: post.title,
          section: 'Notes',
          subtitle: [
            formatDate(post.date, siteMetadata.locale),
            post.tags?.slice(0, 2).join(' / '),
            post.readingTime ? `${post.readingTime} min` : null,
          ]
            .filter(Boolean)
            .join(' · '),
          keywords: [post.summary, post.tags?.join(' '), post.title].filter(Boolean).join(' '),
          perform: () => router.push(`/${post.path}`),
        }))
      )
      setDataLoaded(true)
    }

    loadSearchIndex().catch(() => {
      if (!cancelled) setDataLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [router, searchDocumentsPath])

  if (searchConfig?.provider !== 'kbar') {
    return <>{children}</>
  }

  return (
    <KBarProvider
      actions={kbarConfig?.defaultActions || []}
      options={{ animations: { enterMs: 180, exitMs: 120 } }}
    >
      <SearchModal actions={actions} isLoading={!dataLoaded} />
      {children}
    </KBarProvider>
  )
}
