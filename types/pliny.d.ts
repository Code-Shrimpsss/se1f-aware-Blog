// Ambient module declarations for pliny package.
// Required because TypeScript 6 + Yarn PnP cannot resolve wildcard sub-path exports
// in packages that lack explicit "types" conditions in their exports map.

declare module 'pliny/utils/formatDate' {
  const formatDate: (date: string, locale?: string) => string
  export { formatDate }
}

declare module 'pliny/utils/contentlayer' {
  import { Document, MDX } from 'contentlayer2/core'

  type MDXDocument = Document & { body: MDX }
  type MDXDocumentDate = MDXDocument & { date: string }
  type MDXBlog = MDXDocumentDate & { tags?: string[]; draft?: boolean }
  type MDXAuthor = MDXDocument & { name: string }

  function dateSortDesc(a: string, b: string): 1 | 0 | -1
  function sortPosts<T extends MDXDocumentDate>(allBlogs: T[], dateKey?: string): T[]
  /** @deprecated Use sortPosts instead */
  function sortedBlogPost(allBlogs: MDXDocumentDate[]): MDXDocumentDate[]

  type ConvertUndefined<T> = OrNull<{
    [K in keyof T as undefined extends T[K] ? K : never]-?: T[K]
  }>
  type OrNull<T> = { [K in keyof T]: Exclude<T[K], undefined> | null }
  type PickRequired<T> = { [K in keyof T as undefined extends T[K] ? never : K]: T[K] }
  type ConvertPick<T> = ConvertUndefined<T> & PickRequired<T>

  const pick: <Obj, Keys extends keyof Obj>(
    obj: Obj,
    keys: Keys[]
  ) => ConvertPick<{ [K in Keys]: Obj[K] }>
  const omit: <Obj, Keys extends keyof Obj>(obj: Obj, keys: Keys[]) => Omit<Obj, Keys>

  type CoreContent<T> = Omit<T, 'body' | '_raw' | '_id'>
  function coreContent<T extends MDXDocument>(content: T): CoreContent<T>
  function allCoreContent<T extends MDXDocument>(contents: T[]): CoreContent<T>[]

  export {
    type CoreContent,
    type MDXAuthor,
    type MDXBlog,
    type MDXDocument,
    type MDXDocumentDate,
    allCoreContent,
    coreContent,
    dateSortDesc,
    omit,
    pick,
    sortPosts,
    sortedBlogPost,
  }
}

declare module 'pliny/mdx-components' {
  import { MDXComponents } from 'mdx/types'

  const useMDXComponent: (code: string, globals?: Record<string, unknown>) => React.ComponentType<any>

  interface MDXLayoutRenderer {
    code: string
    components?: MDXComponents
    [key: string]: unknown
  }
  const MDXLayoutRenderer: (props: MDXLayoutRenderer) => JSX.Element

  export { MDXLayoutRenderer, useMDXComponent }
}

declare module 'pliny/search' {
  import { AlgoliaConfig } from 'pliny/search/Algolia'
  import { KBarConfig } from 'pliny/search/KBar'

  type SearchConfig = AlgoliaConfig | KBarConfig

  interface SearchConfigProps {
    searchConfig: SearchConfig
    children: React.ReactNode
  }

  const SearchProvider: (props: SearchConfigProps) => JSX.Element

  export { type SearchConfig, type SearchConfigProps, SearchProvider }
}

declare module 'pliny/search/Algolia' {
  interface AlgoliaConfig {
    provider: 'algolia'
    appId: string
    apiKey: string
    indexName: string
  }
  export type { AlgoliaConfig }
}

declare module 'pliny/search/KBar' {
  interface KBarConfig {
    provider: 'kbar'
    kbarConfig: {
      searchDocumentsPath: string
      defaultActions?: any[]
    }
  }
  export type { KBarConfig }
}

declare module 'pliny/search/AlgoliaButton' {
  import { DetailedHTMLProps, HTMLAttributes } from 'react'
  const AlgoliaButton: (
    props: DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
  ) => JSX.Element
  export { AlgoliaButton }
}

declare module 'pliny/search/KBarButton' {
  import { DetailedHTMLProps, HTMLAttributes } from 'react'
  const KBarButton: (
    props: DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
  ) => JSX.Element
  export { KBarButton }
}

declare module 'pliny/newsletter' {
  import { NextApiRequest, NextApiResponse } from 'next'
  import { NextRequest } from 'next/server'

  interface NewsletterConfig {
    provider: 'buttondown' | 'convertkit' | 'klaviyo' | 'mailchimp' | 'emailoctopus' | 'beehiiv'
  }

  function NewsletterAPI(options: NewsletterConfig): any
  function NewsletterAPI(req: NextRequest, options: NewsletterConfig): any
  function NewsletterAPI(req: NextApiRequest, res: NextApiResponse, options: NewsletterConfig): any

  export { NewsletterAPI, type NewsletterConfig }
}

declare module 'pliny/comments' {
  interface GiscusConfig {
    provider: 'giscus'
    giscusConfig: {
      repo: string
      repositoryId: string
      category: string
      categoryId: string
      mapping: string
      reactions: string
      metadata: string
      theme: string
      darkTheme: string
      themeURL: string
    }
  }

  interface DisqusConfig {
    provider: 'disqus'
    disqusConfig: { shortname: string }
  }

  interface UtterancesConfig {
    provider: 'utterances'
    utterancesConfig: { repo: string }
  }

  type CommentsConfig = GiscusConfig | DisqusConfig | UtterancesConfig

  interface CommentsProps {
    commentsConfig: CommentsConfig
    slug?: string
  }

  const Comments: (props: CommentsProps) => JSX.Element

  export { Comments, type CommentsConfig, type CommentsProps }
}

declare module 'pliny/ui/TOCInline' {
  type TocItem = { value: string; url: string; depth: number }
  type Toc = TocItem[]

  interface TOCInlineProps {
    toc: Toc
    fromHeading?: number
    toHeading?: number
    asDisclosure?: boolean
    exclude?: string | string[]
    collapse?: boolean
    ulClassName?: string
    liClassName?: string
  }

  const TOCInline: (props: TOCInlineProps) => JSX.Element
  export default TOCInline
}

declare module 'pliny/ui/Pre' {
  const Pre: (props: { children: React.ReactNode }) => JSX.Element
  export default Pre
}

declare module 'pliny/ui/NewsletterForm' {
  interface NewsletterFormProps {
    title?: string
    apiUrl?: string
  }
  const NewsletterForm: (props: NewsletterFormProps) => JSX.Element
  export default NewsletterForm
  export type { NewsletterFormProps }
}

declare module 'pliny/ui/BlogNewsletterForm' {
  import { NewsletterFormProps } from 'pliny/ui/NewsletterForm'
  const BlogNewsletterForm: (props: NewsletterFormProps) => JSX.Element
  export default BlogNewsletterForm
}

declare module 'pliny/ui/Bleed' {
  interface BleedProps {
    full?: boolean
    children: React.ReactNode
  }
  const Bleed: (props: BleedProps) => JSX.Element
  export default Bleed
}
