/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: 'Se1fAware · Vito Wang',
  author: 'Vito Wang',
  headerTitle: 'Se1fAware',
  avatar: '/static/images/avatar.jpg',
  authorSignature: '/static/images/signature.png',
  // intro: '终日乾乾，夕惕若厉，无咎。',
  intro: 'Agent 开发工程师 · 全栈工程师 · 前端工程师',
  // description: '一个还在重新学习，重塑思想的开发者',
  description: 'Vito Wang 的个人网站：关于 AI Agent、全栈工程、前端体验与持续自我重塑。',
  language: 'zh-CN',
  theme: 'light', // The Spatial direction is intentionally light-first.
  siteUrl: 'https://se1f-aware-blog.vercel.app',
  siteRepo: 'https://github.com/Code-Shrimpsss/se1f-aware-Blog',
  siteLogo: '/static/favicons/favicon.ico',
  socialBanner: '/opengraph-image',
  email: 'se1faware24@gmail.com',
  github: 'https://github.com/Code-Shrimpsss',
  juejin: 'https://juejin.cn/user/783303009380040',
  // LeetCode: '',
  // twitter: 'https://twitter.com/Twitter',
  // facebook: 'https://facebook.com',
  // youtube: 'https://youtube.com',
  // linkedin: 'https://www.linkedin.com',
  // threads: 'https://www.threads.net',
  // instagram: 'https://www.instagram.com',
  locale: 'zh-CN',
  analytics: {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // supports Plausible, Simple Analytics, Umami, Posthog or Google Analytics.
    umamiAnalytics: {
      // We use an env variable for this site to avoid other users cloning our analytics ID
      umamiWebsiteId: process.env.NEXT_UMAMI_ID, // e.g. 123e4567-e89b-12d3-a456-426614174000
      // You may also need to overwrite the script if you're storing data in the US - ex:
      // src: 'https://us.umami.is/script.js'
      // Remember to add 'us.umami.is' in `next.config.js` as a permitted domain for the CSP
    },
    // plausibleAnalytics: {
    //   plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
    // },
    // simpleAnalytics: {},
    // posthogAnalytics: {
    //   posthogProjectApiKey: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
    // },
    // googleAnalytics: {
    //   googleAnalyticsId: '', // e.g. G-XXXXXXX
    // },
  },
  newsletter: null,
  comments: process.env.NEXT_PUBLIC_GISCUS_ENABLED === 'true' &&
    process.env.NEXT_PUBLIC_GISCUS_REPO &&
    process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID &&
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY &&
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ? {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // Select a provider and use the environment variables associated to it
    // https://vercel.com/docs/environment-variables
    provider: 'giscus', // supported providers: giscus, utterances, disqus
    giscusConfig: {
      // Visit the link below, and follow the steps in the 'configuration' section
      // https://giscus.app/
      repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
      repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
      category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
      // supported options: pathname, url, title
      mapping: 'pathname',
      // Emoji reactions: 1 = enable / 0 = disable
      reactions: '1',
      // Send discussion metadata periodically to the parent window: 1 = enable / 0 = disable
      metadata: '0',
      // theme example: light, dark, dark_dimmed, dark_high_contrast
      // transparent_dark, preferred_color_scheme, custom
      theme: 'light',
      // theme when dark mode
      darkTheme: 'transparent_dark',
      // If the theme option above is set to 'custom`
      // please provide a link below to your custom theme css file.
      // example: https://giscus.app/themes/custom_example.css
      themeURL: '',
      // This corresponds to the `data-lang="en"` in giscus's configurations
      lang: 'zh-CN',
    },
  } : null,
  search: {
    provider: 'kbar', // kbar or algolia
    kbarConfig: {
      searchDocumentsPath: 'search.json', // path to load documents to search
    },
    // provider: 'algolia',
    // algoliaConfig: {
    //   // The application ID provided by Algolia
    //   // appId: 'R2IYF7ETH7',
    //   appId: 'XM8U0F1QTW',
    //   // Public API key: it is safe to commit it
    //   // apiKey: '599cec31baffa4868cae4e79f180729b',
    //   apiKey: '71df414381ca13ee57167030ff599844',
    //   indexName: 'docsearch',
    // },
  },
  button: {
    display: false,
  },
  post: {
    homeMaxDisplay: 5,
  },
}

module.exports = siteMetadata
