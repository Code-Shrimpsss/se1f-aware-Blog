# Se1fAware

Vito Wang 的个人网站，记录 AI Agent、全栈工程、前端体验与持续自我重塑。

当前版本采用 Apple Spatial 视觉方向：明亮空间、层叠材质、克制的三维动效与以内容为中心的排版。网站基于 Next.js、TypeScript、Tailwind CSS、Contentlayer 与 MDX 构建。

## 本地运行

要求 Node.js 20+，并使用 Yarn 安装依赖。

```bash
yarn install
yarn dev
```

开发服务器默认运行在 [http://localhost:3000](http://localhost:3000)。

发布前检查：

```bash
yarn lint
yarn build
```

## 内容创作

文章位于 `data/blog`，使用 MDX。新文章至少需要以下 frontmatter：

```yaml
---
title: '文章标题'
date: '2026-07-11'
lastmod: '2026-07-11'
tags: ['AI Agent', 'Engineering']
draft: false
summary: '用于列表与搜索结果的摘要。'
layout: PostLayout
locale: 'zh_CN'
---
```

设置 `draft: true` 可以保留源文件，但不在生产文章列表、静态路由和站点地图中发布。作者资料位于 `data/authors/default.mdx`，站点元数据位于 `data/siteMetadata.js`。

## 视觉系统

- 设计规范：`APPLE-SPATIAL-DESIGN.md`
- 主要样式：`css/spatial.css`
- 页面动效运行时：`components/Spatial/SpatialRuntime.tsx`
- 社交分享图：`app/opengraph-image.tsx`
- 本地字体：Outfit、Instrument Serif Italic、Red Hat Mono

字体文件随站点托管，不依赖第三方字体服务。

## 可选环境变量

评论使用 Giscus，只有以下变量全部存在时才会显示评论入口：

```text
NEXT_PUBLIC_GISCUS_ENABLED=true
NEXT_PUBLIC_GISCUS_REPO
NEXT_PUBLIC_GISCUS_REPOSITORY_ID
NEXT_PUBLIC_GISCUS_CATEGORY
NEXT_PUBLIC_GISCUS_CATEGORY_ID
```

未配置时评论功能会安全隐藏。可选的 Umami 统计使用：

```text
NEXT_UMAMI_ID
```

## 部署

项目适合直接部署到 Vercel：

1. 将仓库导入 Vercel。
2. 使用仓库中的 Yarn lockfile 安装依赖。
3. 构建命令使用 `yarn build`。
4. 如需评论或统计，在项目设置中添加相应环境变量。
5. 部署后检查首页、Work、Writing、Topics、About、搜索与文章详情页。

站点 URL、仓库地址、社交链接和 SEO 图片统一在 `data/siteMetadata.js` 中维护。

## License

[MIT](LICENSE)
