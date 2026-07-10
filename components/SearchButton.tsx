'use client'

import { useKBar } from 'kbar'
import siteMetadata from '@/data/siteMetadata'

const SearchButton = ({ label = '搜索', showLabel = false }: { label?: string; showLabel?: boolean }) => {
  const { query } = useKBar()
  if (siteMetadata.search?.provider === 'kbar') {
    return (
      <button aria-label={label} type="button" onClick={() => query.toggle()}>
        <span className="search-trigger" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="search-trigger-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </span>
        {showLabel && <span className="search-trigger-label">{label}</span>}
      </button>
    )
  }

  return null
}

export default SearchButton
