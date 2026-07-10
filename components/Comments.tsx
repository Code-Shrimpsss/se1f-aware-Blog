'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'
import { useTheme } from 'next-themes'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)
  const { theme } = useTheme()
  const giscusTheme = theme === 'dark' ? 'dark' : 'light'

  if (!siteMetadata.comments) return null

  return (
    <div className="spatial-comments">
      {!loadComments && (
        <button className="comments-load" type="button" onClick={() => setLoadComments(true)}>
          <span>Discussion</span>
          Load comments <i aria-hidden="true">↗</i>
        </button>
      )}
      {loadComments && (
        <CommentsComponent
          commentsConfig={
            siteMetadata.comments.provider === 'giscus'
              ? {
                  ...siteMetadata.comments,
                  giscusConfig: {
                    ...siteMetadata.comments.giscusConfig,
                    theme: giscusTheme,
                  },
                }
              : siteMetadata.comments
          }
          slug={slug}
        />
      )}
    </div>
  )
}
