'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'
import { useTheme } from 'next-themes'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)
  const { theme } = useTheme()
  const giscusTheme = theme === 'dark' ? 'dark' : 'light'

  return (
    <>
      {/* {!loadComments && <button onClick={() => setLoadComments(true)}>Load Comments</button>} */}
      {siteMetadata.comments && (
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
    </>
  )
}
