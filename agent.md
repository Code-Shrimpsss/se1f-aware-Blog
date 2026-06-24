# Se1fAware-Blog

基于 Next.js 15 (App Router) + Tailwind CSS + Contentlayer 的个人博客，fork 自 [tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog)。

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Next.js 15.1.4 (App Router, React 19, TypeScript) |
| 样式 | Tailwind CSS 3.4 + `tailwindcss-animate` + `@tailwindcss/typography` |
| 内容 | Contentlayer (MDX), `data/blog/` 目录存放文章 |
| 包管理 | Yarn 3.6.1 (PnP) |
| 部署 | Vercel |
| 动画 | framer-motion (页面过渡), GSAP (滚动动画) |
| 搜索 | kbar (本地搜索, 构建时生成 `public/search.json`) |
| 评论 | Giscus |
| 分析 | Vercel Analytics + Umami |
| 主题 | next-themes (dark/light class 切换) |
| 数学 | KaTeX (remark-math + rehype-katex) |
| 代码高亮 | rehype-prism-plus |
| 引用 | rehype-citation (BibTeX, `data/references-data.bib`) |
| 图标 | @iconify/tailwind + @iconify/react, 自定义 SVG 图标在 `components/icons/` |
| 字体 | Jura, Roboto Mono, Noto Sans SC, LXGW WenKai TC |
| 国际化 | next-intl (已安装，**未完成配置**) |

## 项目结构

```
.
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局 (字体、主题、Header/Footer、Analytics)
│   ├── page.tsx                  # 首页 (→ Main.tsx)
│   ├── Main.tsx                  # 首页 UI (用户信息 + 推荐文章列表)
│   ├── blog/
│   │   ├── page.tsx              # 博客列表页
│   │   ├── [...slug]/page.tsx    # 博客详情页 (动态路由)
│   │   └── page/[page]/page.tsx  # 博客分页
│   ├── about/page.tsx            # 关于页
│   ├── projects/page.tsx         # 项目页
│   ├── tags/                     # 标签页
│   ├── api/newsletter/route.ts   # Newsletter API
│   ├── robots.ts / sitemap.ts    # SEO
│   └── theme-providers.tsx       # next-themes Provider
├── components/
│   ├── Layout/                   # Header, Footer, MainContainer, SectionContainer
│   ├── MDX/                      # MDXComponents, TOCInline, TableWrapper
│   ├── Transition/               # framer-motion 页面过渡 (TransitionCurve, FrozenRouter)
│   ├── Scroll/                   # PostScroll, LoadingBar, SkillScroller, duneScroll
│   ├── Theme/                    # ThemeSwitch, ColorModeProvider
│   ├── Multi-Platform/           # MobileNav
│   ├── ui/                       # shadcn/ui 组件 (avatar, context-menu)
│   ├── icons/                    # 自定义 SVG 图标 (fa6-brands, logos, skills)
│   ├── social-icons/             # 社交图标
│   ├── Link.tsx, Card.tsx, Tag.tsx, Image.tsx, Comments.tsx, SearchButton.tsx, LanguageSwitch.tsx
│   └── PageTitle.tsx
├── layouts/                      # 博客文章布局 (PostLayout, PostSimple, PostBanner)
│   ├── AuthorLayout.tsx          # 关于页布局
│   ├── ListLayout.tsx            # 博客列表布局
│   ├── ListLayoutWithTags.tsx    # 带标签的列表布局
│   └── MotionLayout.tsx          # 动画布局
├── data/
│   ├── siteMetadata.js           # 站点元数据 (标题、作者、社交链接、评论/搜索/分析配置)
│   ├── headerNavLinks.ts         # 导航链接
│   ├── projectsData.ts           # 项目数据
│   ├── blog/                     # MDX 博客文章 (Contentlayer 内容源)
│   ├── authors/default.mdx       # 作者信息
│   └── references-data.bib       # BibTeX 引用
├── css/                          # 全局样式 (tailwind.css, prism.css)
├── lib/utils.ts                  # cn() 工具函数 (clsx + tailwind-merge)
├── scripts/
│   ├── postbuild.mjs             # 构建后脚本 (RSS 已注释)
│   └── rss.mjs                   # RSS 生成
├── contentlayer.config.ts        # Contentlayer 配置 (Blog + Authors 文档类型)
├── tailwind.config.js            # Tailwind 配置 (自定义颜色、字体、动画)
├── next.config.js                # Next.js 配置 (CSP、图片、SVG webpack loader)
├── tsconfig.json                 # TypeScript 配置
└── .yarn/                        # Yarn PnP
```

## 关键约定

### 内容创作
- 博客文章放在 `data/blog/` 目录，MDX 格式
- 前置元数据：`title`、`date`、`tags`、`summary`、`images`、`authors`、`draft`、`layout`、`locale`
- 支持三种布局：`PostLayout`（默认）、`PostSimple`、`PostBanner`
- 文章 slug 由文件路径自动生成（去掉 `blog/` 前缀）

### Contentlayer 文档类型
- **Blog**: `data/blog/**/*.mdx`，自动计算 readingTime、slug、path、toc、structuredData、wordCount
- **Authors**: `data/authors/**/*.mdx`，作者信息

### 站点配置
- 所有站点级配置在 `data/siteMetadata.js`
- 环境变量在 `.env`（⚠️ 已提交到 git，含 Giscus ID）
- 搜索索引在构建时自动生成到 `public/search.json`

### 样式
- Tailwind dark mode 使用 `class` 策略
- 自定义字体通过 CSS 变量注入：`--font-jura`、`--font-roboto-mono`、`--font-noto-sans-sc`
- 自定义颜色：`primary`(blue)、`customIndigo`、`customGrey`、`line`、`origin`
- 使用 `cn()` 工具函数合并类名

### 构建
- `yarn dev` 启动开发服务器
- `yarn build` 构建生产版本 + 运行 postbuild.mjs
- `yarn lint` 检查 app/components/layouts/scripts 目录
- Pre-commit hook: lint-staged (eslint --fix + prettier --write)

## 已知问题 / 技术债务

1. **i18n 未完成**: next-intl 已安装，LanguageSwitch 组件已写但被注释掉（Header.tsx:36），没有 messages 目录、没有 i18n 路由配置、没有 NextIntlClientProvider
2. **页面过渡被禁用**: TransitionCurve 在 layout.tsx:114 被注释掉
3. **RSS 未生成**: postbuild.mjs 中 rss() 调用被注释
4. **readingTime 重复定义**: contentlayer.config.ts 第 29 行和第 115-118 行重复定义了 readingTime 计算字段
5. **locale 导入错误**: blog/[...slug]/page.tsx:14 从 `@/data/siteMetadata` 导入 `locale`，但 siteMetadata.js 没有单独导出 `locale`（它是 `siteMetadata.locale` 属性）
6. **Tags/Projects 导航被隐藏**: headerNavLinks.ts 中 Tags 和 Projects 链接被注释
7. **`.env` 已提交**: 包含 Giscus 配置信息
8. **构建脚本 Windows-ism**: `cross-env INIT_CWD=%cd%` 在 Unix 上应使用 `$PWD`