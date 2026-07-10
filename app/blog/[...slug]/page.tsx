import 'css/prism.css'
import 'katex/dist/katex.css'

import PageTitle from '@/components/PageTitle'
import { components } from '@/components/MDX/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allAuthors } from 'contentlayer/generated'
import type { Authors, Blog } from 'contentlayer/generated'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import ScrollProgress from '@/components/Scroll/PostScroll'

const defaultLayout = 'PostLayout'
const layouts = {
    PostSimple,
    PostLayout,
    PostBanner,
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
    let post: Blog | undefined = undefined;
    const result = await params?.then((result) => result)

    if (!result) return;

    const slug = decodeURI(result?.slug?.join('/') ?? "")
    post = allBlogs?.find((p) => p.slug === slug)
    const authorList = post?.authors || ['default']
    const authorDetails = authorList.map((author) => {
        const authorResults = allAuthors.find((p) => p.slug === author)
        return coreContent(authorResults as Authors)
    })

    if (!post) return;

    const publishedAt = new Date(post?.date).toISOString()
    const modifiedAt = new Date(post?.lastmod || post?.date).toISOString()
    const authors = authorDetails.map((author) => author.name)
    let imageList = [siteMetadata.socialBanner]
    if (post.images) {
        imageList = typeof post.images === 'string' ? [post.images] : post.images
    }
    const ogImages = imageList.map((img) => {
        return {
            url: img.includes('http') ? img : siteMetadata.siteUrl + img,
        }
    })

    return {
        title: post.title,
        description: post.summary,
        openGraph: {
            title: post.title,
            description: post.summary,
            siteName: siteMetadata.title,
            locale: 'en_US',
            type: 'article',
            publishedTime: publishedAt,
            modifiedTime: modifiedAt,
            url: './',
            images: ogImages,
            authors: authors.length > 0 ? authors : [siteMetadata.author],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.summary,
            images: imageList,
        },
    }
}

export const generateStaticParams = async () => {
    const paths = allBlogs.map((p) => ({ slug: p.slug.split('/'), locale: p.locale }))
    return paths
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
    const resolved = await params
    const slug = decodeURI(resolved?.slug?.join('/') ?? "")
    // const defaultLocale = 'en_US'
    // Filter out drafts in production
    const sortedCoreContents = allCoreContent(sortPosts(allBlogs))

    // const postIndex = sortedCoreContents.findIndex((p) => {
    //   console.log('slug', slug)
    //   console.log('p.slug---', p.slug === slug)
    //   console.log('p.locale', p.locale)
    //   console.log('locale', locale)
    //   console.log('p.locale---', p.locale === (locale || defaultLocale))
    //   return p.slug === slug && p.locale === (locale || defaultLocale)
    // })

    const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug)

    if (postIndex === -1) {
        return notFound()
    }

    const prev = sortedCoreContents[postIndex + 1]
    const next = sortedCoreContents[postIndex - 1]
    const post = allBlogs.find(
        (p) => p.slug === slug
        // (p) => p.slug === slug && p.locale === (locale || defaultLocale)
    ) as Blog

    const filteredToc =
        post.toc && Array.isArray(post.toc)
            ? post.toc.map((item) => {
                const urlWithoutDashNumber = item.url.replace(/-\d+$/, '')
                return { ...item, url: urlWithoutDashNumber }
            })
            : []

    //   console.log(filteredToc)
    const authorList = post?.authors || ['default']
    const authorDetails = authorList.map((author) => {
        const authorResults = allAuthors.find((p) => p.slug === author)
        return coreContent(authorResults as Authors)
    })
    const mainContent = coreContent(post)
    const jsonLd = post.structuredData
    jsonLd['author'] = authorDetails.map((author) => {
        return {
            '@type': 'Person',
            name: author.name,
        }
    })

    const Layout = layouts[post.layout || defaultLayout]

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ScrollProgress />
            <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
                <MDXLayoutRenderer code={post.body.code} components={components} toc={filteredToc} />
            </Layout>
        </>
    )
}
