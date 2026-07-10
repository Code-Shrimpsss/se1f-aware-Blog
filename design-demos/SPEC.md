# Homepage Design Exploration Spec

## Project

Se1fAware 是 Vito Wang 的个人写作与个人风格主页。它不是求职落地页、能力介绍页或 SaaS 产品页。详细身份、经历与技能属于 About；主页负责让访问者在第一眼感到这是一个有判断、有审美、有长期思考习惯的人所创造的数字空间，并自然进入文章。

## Audience and context

访客包括技术同行、AI Agent / 前端从业者、潜在合作方和对自我成长主题感兴趣的读者。主要场景是笔记本电脑上的首次访问和移动端的文章回访。主页应在 3–5 秒内建立风格记忆，在 10 秒内让人理解这里以写作为核心，并能立即进入文章。

## Core content shared by all variants

- Brand: Se1fAware / Vito Wang
- Personal thesis: 观心，造物。
- Supporting idea: 向内辨认，向外构造。持续校准自我，也持续创造世界。
- Primary navigation: 文章 / 关于 / 中英文 / 明暗主题
- Featured writing:
  1. Docker in 2024: Evolving Relevance in Modern DevOps
  2. Release of Tailwind Nextjs Starter Blog v2.0
  3. AIGC：人工智能生成内容的革命
  4. New features in v1
  5. Introducing Multi-part Posts with Nested Routing
- Archive depth: 13 篇文章
- Primary CTA: 进入文章 / 浏览全部文章

## Emotional tone

安静但不弱，克制但不普通，思想性与构造感并存。不是禅意符号堆叠，而是通过空间、节奏、文字关系体现“观心”；通过交互、状态变化和结构精度体现“造物”。页面应像一个被认真编排过的作品，而不是组件拼装或前端特效 demo。

## Hard constraints

- 输出为可独立打开的 1440×900 响应式网页原型，同一份真实内容，三版只改变设计逻辑。
- 不修改生产主页；原型放在 `design-demos/`。
- 不使用个人照片、技能卡片、职业介绍或项目 KPI。
- 不使用终端、聊天框、OS 窗口、紫蓝渐变、渐变文字、玻璃卡片、圆角卡片墙、全屏 Loader。
- 不套米黄宣纸、书法印章等表面化新中式。
- 文章标题必须始终可见且可点击，不能只在 hover 出现。
- 每版只有一种核心交互语法，不叠加特效。
- 支持键盘焦点、移动端重排、`prefers-reduced-motion`。
- HTML/CSS/JS 原型不依赖后端；可以使用 CDN 字体但必须有 fallback。

## Three independent directions

### A — 空与间

Referent: 原研哉式信息设计、MUJI 海报的空白秩序、日式展览目录，而不是“宣纸古风”。

Hero: “观心”和“造物”不居中，而是成为左右空间的两个坐标，中间的空白是第三个元素。文章像展览目录从页面边缘进入。

Signature interaction: 光标横向移动时，两组大字之间的空间比例轻微改变，同时当前文章的细线坐标响应；无粒子、无 Canvas。

Content transition: 首屏与文章索引在同一画面中共存，首篇文章可在第一视口看到。

### B — 句子即界面

Referent: Emily Campbell / Pedro Duarte 的语义交互，但使用 Vito 自己的语言和东方节奏。

Hero: 一段极大的个人命题，关键词“观心”“造物”“未完成”可以点击；点击后句子原地改写，并改变下方文章选择，而不是弹窗或卡片。

Signature interaction: 语义词触发句子替换和文章策展状态，动作可逆、键盘可用。

Content transition: 文章作为命题的证据，在句子下面形成无边框文本索引。

### C — 思想场

Referent: Rauno Freiberg 的空间意识、Serena Congiu 的自由场域，但简化为写作主页。

Hero: 五篇文章标题分布在一个二维思想场中，大小、方向和位置不同；“观心 / 造物”是场的坐标轴，不是大标题。

Signature interaction: 指针移动产生轻量视差和焦点迁移；选择文章时边缘出现摘要。完整静态目录保留在下方或作为模式切换。

Content transition: 视口底部有明确的静态文章入口，移动端直接变成有节奏的纵向目录。

## Evaluation criteria

1. 是否一眼区别于博客模板和 AI 生成落地页。
2. 是否真的体现“观心 / 造物”，而不是只写这四个字。
3. 文章是否成为视觉主体。
4. 核心交互是否有意义、可逆且不妨碍阅读。
5. 1440×900 截图暂停在任意一帧是否仍然成立。
6. 移动端是否是重新构图，而非缩小桌面版。
