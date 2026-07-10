---
name: Se1fAware
summary: 山中观心——为阅读与个人能力叙事而生的东方数字空间
colors:
  mist: "#edf2ef"
  cloud: "#f8faf8"
  ink: "#16201c"
  pine: "#315c4d"
  pine-deep: "#21483c"
  cinnabar: "#b44a3b"
  line: "#cbd6d0"
  night: "#0e1512"
  night-surface: "#151f1b"
typography:
  display:
    fontFamily: "LXGW WenKai TC, Noto Serif SC, serif"
    fontSize: "clamp(2.75rem, 7vw, 5.75rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Noto Sans SC, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "Noto Sans SC, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "12px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "24px"
  lg: "48px"
  xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.pine-deep}"
    textColor: "{colors.cloud}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-quiet:
    backgroundColor: "{colors.cloud}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  tag:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.pine-deep}"
    rounded: "{rounded.pill}"
    padding: "6px 10px"
---

# Design System: Se1fAware

## Overview

**Creative North Star: “山中观心”**

界面像雨后山中一间通透、安静的书房：雾青是空气，墨色是文字，朱砂只在最需要被记住的位置出现。数字玻璃不是装饰主题，而是区分导航、身份信息与阅读内容的少量空间材料；正文始终落在稳定、清晰的实体表面上。

系统表达“克制、通透、前沿”，同时拒绝终端代码感、赛博霓虹、模板化宣纸古风和普通 SaaS 卡片墙。中式气韵来自虚实、留白与节奏，不来自符号堆砌。

**Key Characteristics:**
- 雾青、松针绿与深墨构成低疲劳阅读环境。
- 手写感展示字体只负责标题；正文使用高可读无衬线字体。
- 宽松留白与非对称构图承载个人品牌，文章列表保持平静。
- 玻璃仅用于导航和少量身份浮层，绝不覆盖长篇正文。
- 朱砂使用面积严格受限，负责焦点而非装饰。

## Colors

色彩来自山岚、松针、墨与朱砂，整体低色度，但绝不灰败。

### Primary
- **松针深绿**：主要按钮、焦点、链接和当前状态；稳重而不显“科技蓝”。
- **远山雾青**：页面环境色与玻璃反射色，让长时间阅读不刺眼。

### Secondary
- **朱砂**：只用于一个页面中的少数记忆点、活动状态或细小标记。

### Neutral
- **浓墨**：浅色模式正文与标题。
- **云白**：阅读表面与深色模式高优先级文字。
- **夜山**：深色模式环境底色。
- **山石线**：分隔与边界，保持低对比。

**The One Cinnabar Rule.** 朱砂在任何一个视口内不超过约 5%；若首先注意到红色而不是内容，就用多了。

## Typography

**Display Font:** LXGW WenKai TC（Noto Serif SC / serif 回退）  
**Body Font:** Noto Sans SC（system-ui / sans-serif 回退）  
**Label Font:** Noto Sans SC

**Character:** 展示字体有人手书写的呼吸，正文则稳定、中性、适合中英文混排。二者形成“思想有温度，工程有秩序”的对照。

### Hierarchy
- **Display**（400，`clamp(2.75rem, 7vw, 5.75rem)`，1.08）：只用于首页主命题。
- **Headline**（500，`clamp(2rem, 4vw, 3.5rem)`，1.2）：页面标题与章节主标题。
- **Title**（600，1.25–1.75rem，1.4）：文章标题与能力名称。
- **Body**（400，1rem–1.0625rem，1.8–1.9）：正文行宽限制在 68–72ch。
- **Label**（600，0.75rem，0.08em）：短元信息；禁止把所有章节标签都变成大写眉题。

**The Quiet Reading Rule.** 正文永远不用展示字体、全大写或低对比灰色；可读性高于形式。

## Elevation

采用“雾中分层”：环境背景、阅读实体、少量玻璃浮层三层。默认不使用大面积卡片阴影；玻璃通过透明度、轻边界与 18–24px 模糊建立深度，悬浮交互只使用短距离位移与局部色变。

### Shadow Vocabulary
- **玻璃边缘**（`0 1px 0 rgba(255,255,255,.55) inset`）：仅用于玻璃浮层的内侧反光。
- **环境悬浮**（`0 8px 24px rgba(22,32,28,.08)`）：只用于导航、菜单与当前可交互浮层。

**The Glass With Purpose Rule.** 没有空间层级意义的容器禁止使用 `backdrop-filter`；文章正文永远不是玻璃卡片。

## Components

### Buttons
- **Shape:** 克制的全圆角胶囊，仅用于短操作（999px）。
- **Primary:** 松针深绿底、云白字，44px 最小高度。
- **Hover / Focus:** 颜色加深并轻微上移；键盘焦点使用清晰的松针绿外环。
- **Quiet:** 透明或云白表面，用于次级导航，不添加宽阴影。

### Chips
- **Style:** 雾青底、深松针文字；标签服务于分类，不全部大写。
- **State:** 当前项用深松针实体色；其他项仅在 hover 时加深。

### Cards / Containers
- **Corner Style:** 内容容器最高 12px；禁止 24px 以上的“大圆卡”。
- **Background:** 阅读区稳定、不透明；玻璃只用于导航与身份摘要。
- **Shadow Strategy:** 默认无阴影，以留白和细线组织层级。
- **Internal Padding:** 24–48px，移动端收敛到 18–24px。

### Navigation
- 浮动玻璃导航在桌面端保持紧凑；品牌标识与核心路由清晰分离。移动端使用完整模态层，触控目标至少 44px，打开后锁定背景滚动。

### Identity Constellation
- 首页用 Agent Engineering、Full-stack Systems、Frontend Craft 三条相互关联的能力轨道表达“不受单一职位定义”，不是三张同尺寸卡片，也不使用技术 Logo 墙作为主要证明。

## Do's and Don'ts

### Do:
- **Do** 将正文保持在 68–72ch，并使用 1.8 以上行高。
- **Do** 用真实能力、交付结果和文章建立个人可信度。
- **Do** 用留白、虚实与低色度层次表达东方气韵。
- **Do** 为所有动效提供 `prefers-reduced-motion` 降级。
- **Do** 在亮暗主题中都保持 WCAG AA 正文对比度。

### Don't:
- **Don't** 使用终端、代码雨、代码窗口与黑绿霓虹。
- **Don't** 使用赛博朋克、紫蓝渐变或发光边框式“AI 科技感”。
- **Don't** 使用米黄宣纸、书法印章堆叠的模板化“新中式”。
- **Don't** 制作满屏玻璃卡片、同尺寸能力卡片墙或普通 SaaS 落地页。
- **Don't** 为装饰牺牲正文对比度、行宽与阅读节奏。
- **Don't** 使用渐变文字、重复条纹背景、彩色侧边粗线或超过 16px 的卡片圆角。
