import 'css/tailwind.css'
import 'css/spatial.css'
import 'pliny/search/algolia.css'

import SearchProvider from '@/components/Search/SearchProvider'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import siteMetadata from '@/data/siteMetadata'
import { ThemeProviders } from './theme-providers'
import { Metadata } from 'next'
import TransitionCurve from '@/components/Transition/TransitionCurve'
import LoadingBar from '@/components/Scroll/loadingScroll'
import { Analytics } from '@vercel/analytics/react'
import SpatialRuntime from '@/components/Spatial/SpatialRuntime'

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteMetadata.language} className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/static/fonts/Outfit-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/static/fonts/Outfit-Bold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" sizes="76x76" href="/static/favicons/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/static/favicons/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/static/favicons/favicon.ico" />
        <link rel="manifest" href="/static/favicons/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#eff0f4" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      </head>
      <body>
        <ThemeProviders>
          <SearchProvider searchConfig={siteMetadata.search}>
            <div className="spatial-site">
              <a className="spatial-skip" href="#main-content">跳至主要内容</a>
              <div className="spatial-atmosphere" aria-hidden="true"><i /><i /><i /></div>
              <div className="spatial-noise" aria-hidden="true" />
              <LoadingBar />
              <Header />
              <main className="spatial-main" id="main-content">
                <TransitionCurve>{children}</TransitionCurve>
              </main>
              <Footer />
              <SpatialRuntime />
              <Analytics />
            </div>
          </SearchProvider>
        </ThemeProviders>
      </body>
    </html>
  )
}
