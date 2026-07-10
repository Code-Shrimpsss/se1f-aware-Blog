# Four-Act 3D Personal Homepage — Shared Spec

## Goal

为 Se1fAware / Vito Wang 构建三版独立的四幕个人品牌主页高保真原型。它既是写作网站，也是个人营销主页，需要展示人物世界观、文章、Agent/全栈/前端能力、真实经历与联系入口。三版使用同一信息架构和真实内容，只改变空间隐喻与 3D 艺术语言。

## Shared identity

- Brand: Se1fAware / Vito Wang
- Thesis: 观心，造物。
- Interpretation: 向内辨认，向外构造。持续校准自我，也持续创造世界。
- Identity: Agent 开发工程师 / 全栈工程师 / 前端工程师
- Location: 广东汕头
- Experience: 三年前端经验、两年全栈背景；FastMoss 2024.06+；Aimy 2021–2024
- Work proof:
  - 端到端 AI 客服助手：从 Agent 链路、工具调用到企业协作落地
  - 远程教育平台：长期全栈与前端工程实践
  - Agent 工程：RAG、工具调用、工作流、企业项目交付
- Core stack: React / Next.js / TypeScript / Node.js / AI Agents / RAG / Tool Use
- Email: se1faware24@gmail.com
- Writing samples:
  1. Docker in 2024: Evolving Relevance in Modern DevOps
  2. Release of Tailwind Nextjs Starter Blog v2.0
  3. AIGC：人工智能生成内容的革命
  4. New features in v1
  5. Introducing Multi-part Posts with Nested Routing
- Archive count: 13 篇

## Required four scenes

### Scene 1 — 世界观

- 观心 / 造物为主命题。
- 不只是两个字：必须有额外的坐标、轨迹、微型标签、空间物体或时间信号，形成完整首屏。
- 一个核心 3D/空间对象或环境代表“内在觉察 → 外在创造”。

### Scene 2 — 写作 / 思想场

- 文章是视觉主体，不是圆角卡片。
- 保留四象限或空间索引感。
- 五篇文章始终是可见、可点击、键盘可达的真实 HTML。
- hover/focus 必须带来有意义的预览、场景聚焦或空间变化。

### Scene 3 — 人物与能力

- 展示 Agent / 全栈 / 前端三种身份及其关系。
- 不做三张同尺寸技能卡。
- 用 3D 结构、层级、轨道、院落或仪器系统表达它们如何共同完成产品。
- 必须出现人物简述与核心技术栈，但避免简历墙。

### Scene 4 — 经历 / 交付 / 联系

- 展示 FastMoss、Aimy、AI 客服助手、远程教育平台等可信证明。
- 结尾有明确联系入口和返回文章。
- 不编造 KPI 或客户数据。

## Interaction contract

- 桌面端滚轮/触控板一次意图切换到下一幕；不得连续跳过多幕。
- 仍保留原生滚动和可访问 URL 锚点；不要用不可恢复的 scroll hijack。
- 右下角固定返回顶部按钮：第一幕隐藏，其余幕显示；键盘可达，有明确标签。
- 顶部显示当前场景进度或章节状态。
- 3D/Canvas 对象随场景发生真正的空间或形态变化，而非只换颜色。
- 鼠标移动只做克制视差，不提供无边界 orbit controls。
- 所有关键内容独立于 Canvas，脚本失效仍可阅读。

## Technical requirements

- 每版一个 self-contained HTML，放在 `design-demos/`：
  - `four-act-a-core.html`
  - `four-act-b-garden.html`
  - `four-act-c-instrument.html`
- 目标桌面 1440×900，移动端 390×844。
- 允许 Three.js CDN 或原生 Canvas/CSS 3D；必须提供无 WebGL 静态 fallback。
- DPR ≤ 1.75；移动端降低几何量；离屏或后台停止渲染。
- `prefers-reduced-motion` 禁用场景运动但保留完整构图。
- 无全屏 loader、无自动音频、无终端、无聊天框、无 OS 窗口、无玻璃卡片墙、无渐变文字。
- 颜色保持墨、雾灰、松针绿、少量朱砂；三版可以改变明暗关系但不能落入通用霓虹科技风。
- 每版只有一套统一空间语法，四幕之间必须像同一个世界。

## Direction A — 造物核

Spatial referent: 一枚介于星盘、种子、陀螺仪与机械心脏之间的 3D 核心物体贯穿四幕。

- Scene 1: 核心缓慢呼吸，内部/外部双层壳体对应观心与造物。
- Scene 2: 核心展开为文章轨道，标题围绕它成为思想坐标。
- Scene 3: 核心拆解成 Agent / Full-stack / Frontend 三层协作结构。
- Scene 4: 核心重新闭合，经历节点沉淀在表面，最终对准联系入口。
- Tone: 有机、精密、安静，拒绝科幻霓虹球。

## Direction B — 数字园林

Spatial referent: 不是古风山水插画，而是抽象的当代数字园林：门、石、廊、庭、雾与空白构成四个院落。

- Scene 1: 穿过“观心之门”，远处“造物之庭”可见。
- Scene 2: 文章分布在四象限庭院，像路径与景点。
- Scene 3: 三座抽象构筑物代表 Agent / Full-stack / Frontend，廊道体现协作关系。
- Scene 4: 经历成为庭院铭牌与路径刻度，出口是联系入口。
- Tone: 东方空间意识、当代建筑、非宣纸非印章。

## Direction C — 思维仪器

Spatial referent: 一台为 Vito 定制的精密思维仪器，结合测量盘、层析扫描、信号轨道、物理旋钮与信息标注。

- Scene 1: 仪器校准“观心 / 造物”两条轴。
- Scene 2: 文章成为四象限数据点，选择时仪器重新测量并显示摘要。
- Scene 3: 仪器切换三种内部模式，结构真正重组为 Agent / Full-stack / Frontend。
- Scene 4: 时间轴记录经历与交付，最终指针停在联系坐标。
- Tone: 理性、精确、工业设计感，但不是 Dashboard 或终端。

## Verification

- 三个文件存在且独立运行。
- 每版恰好四幕，滚轮逐幕切换。
- 回顶按钮在 2–4 幕显示并有效。
- Canvas/WebGL 非零尺寸、无控制台错误。
- 1440×900 和 390×844 无横向溢出。
- 五篇文章可见、可聚焦。
- reduced-motion 与无 WebGL fallback 有完整内容。
