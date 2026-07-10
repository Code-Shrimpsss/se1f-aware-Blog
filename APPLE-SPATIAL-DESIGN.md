# Se1fAware Apple Spatial Design System

> Status: production direction locked on 2026-07-11  
> Source of truth: `/Users/apple/Documents/Codex/2026-07-11/b-w/outputs/Se1fAware Apple Spatial Homepage.html`  
> Scope: homepage, writing index, article detail, about, shared navigation and motion system

## 1. Product thesis

Se1fAware is Vito Wang's personal interface: a quiet spatial environment where engineering judgment, Agent delivery, frontend craft and long-form thinking become legible.

The site's single promise is:

**Turn complex technology into calm, useful, beautifully clear products.**

The design follows a Jobs-like principle of subtraction: every object must either explain identity, reveal evidence, support reading or enable an action. Decoration without a job is removed.

## 2. Creative north star: Calm Intelligence in Space

The visual world is a bright spatial studio rather than a conventional portfolio grid. Content lives on a few coordinated planes around one persistent luminous core.

The memorable signature is the **Identity Core**:

- a soft spectral halo representing thought and possibility;
- a human silhouette or portrait anchoring the technology in a person;
- orbit lines showing relationships rather than decoration;
- glass planes carrying work, writing and experience;
- pointer and scroll motion that reveal depth without turning the page into a game.

The reference is not permission to imitate every Apple convention. The site must remain personal through Vito's real writing, work vocabulary, bilingual voice and the relationship between Agent, full-stack and frontend practice.

## 3. Experience principles

1. **Simple before spectacular.** The first viewport explains who Vito is and what he does in under ten seconds.
2. **One world, many surfaces.** Home, Writing and About share light, depth, typography and motion physics.
3. **Composition over cards.** Elements overlap, orbit and connect. Equal card grids are avoided.
4. **Motion explains state.** Entry reveals hierarchy; hover reveals affordance; scroll changes depth; click produces a visible response.
5. **Reading remains calm.** Article body typography, contrast and line length outrank spatial effects.
6. **Evidence over claims.** No invented metrics, clients, locations, coordinates or project outcomes.
7. **Progressive enhancement.** Semantic links and content remain usable without pointer effects, 3D transforms or animation.

## 4. Visual tokens

### 4.1 Color

| Token | Value | Role |
| --- | --- | --- |
| `canvas` | `#EFF0F4` | outer atmospheric background |
| `paper` | `#F8F8FA` | primary surface and reading field |
| `white` | `#FFFFFF` | glass highlights |
| `ink` | `#111216` | headings, primary controls |
| `graphite` | `#3F424B` | strong secondary text |
| `muted` | `#6B6E78` | metadata and supporting copy |
| `line` | `rgba(17,18,22,.09)` | structural borders |
| `blue` | `#668FFF` | cool intelligence light |
| `violet` | `#9479EA` | imagination and depth |
| `coral` | `#FF8463` | human warmth and action accent |
| `mint` | `#7DDBC7` | availability and living systems |

Color fields are large, low-opacity and blurred. Saturated colors appear mainly as light, not as solid UI chrome. Black and white carry the interface; spectral colors carry atmosphere and state.

### 4.2 Typography

| Role | Typeface | Usage |
| --- | --- | --- |
| Display / body | Outfit | interface, headings, body copy |
| Editorial accent | Instrument Serif Italic | one short phrase per major page |
| Utility / data | Red Hat Mono | dates, paths, reading time, state |

Rules:

- Display headings use `-0.045em` to `-0.065em` tracking and tight line height.
- Instrument Serif never carries full paragraphs; it introduces one human interruption inside a precise sans-serif system.
- Article body may use a Chinese-readable system fallback, but titles retain Outfit's geometry.
- Body copy is 16–19px with 1.7–1.9 line height; article line length is 66–72ch.
- All metadata is sentence case or concise uppercase; no decorative eyebrow on every section.

### 4.3 Radius, blur and elevation

- Navigation: 22px radius, 24–28px blur.
- Floating planes: 28–34px radius on desktop, 22–26px on mobile.
- Controls: pill radius only for actions and compact status.
- Reading surface: 28px maximum radius; never a stack of glass cards.
- Standard shadow: `0 28px 90px rgba(47,57,92,.13)`.
- Hover shadow: increases depth and softens, never becomes a hard dark drop shadow.
- Glass must have a clear spatial purpose and a visible highlight edge.

### 4.4 Spacing

- Desktop content width: 1180–1280px.
- Reading width: 720px body, up to 980px for media.
- Section rhythm: 120–180px.
- Mobile side padding: 20–24px.
- Touch target: at least 44px.

## 5. Spatial grammar

Every page uses three depth bands:

1. **Atmosphere:** gradients, spectral light and fine noise; never interactive.
2. **World:** Identity Core, orbit, timeline rail or article constellation; pointer-reactive.
3. **Interface:** navigation, content, controls and reading surfaces; always legible.

Depth is communicated through scale, blur, overlap, shadow and transform. `perspective` defaults to 1400px. Pointer rotation is capped at 4 degrees for the world and 8 degrees for focused planes.

The Identity Core may transform between pages, but its material and lighting remain recognizable:

- Home: human-centered halo with capability and selected-work planes.
- Writing: a quiet luminous aperture behind a layered article constellation.
- Article: a reduced halo in the masthead, then a stable paper reading plane.
- About: portrait core with an orbital career timeline and connected capability planes.

## 6. Shared components

### Spatial navigation

- Floating centered glass bar on desktop.
- Brand at left; Writing, About and contact at right.
- Active route uses a restrained dark dot or underline.
- On mobile it becomes a compact bar with an animated full-screen sheet.
- Navigation never includes fake controls or hidden routes.

### Buttons

- Primary: ink fill, white text, soft shadow.
- Secondary: translucent white, one-pixel line.
- Pointer devices receive magnetic movement capped at 5px.
- Press uses `scale(.97)` and shadow compression.
- Focus ring uses blue plus a white separation ring.

### Spatial planes

- Use asymmetrical size and placement.
- Each plane owns one job: selected work, writing, capability or evidence.
- Hover adds tilt, highlight travel and content-specific micro-motion.
- Never repeat six equal planes in a grid.

### Ambient field

- Three blurred spectral lights: blue, violet and coral.
- Pointer parallax is slower than foreground movement.
- Fine monochrome noise keeps large bright areas from feeling sterile.

### Footer

- Minimal status line: availability, copyright, contact.
- No precise address or coordinates.

## 7. Motion system

### Motion tokens

- `quick`: 180ms for press and focus.
- `base`: 420ms for hover and small state changes.
- `reveal`: 760ms for section entrances.
- `scene`: 1000–1200ms for large spatial transitions.
- Primary curve: `cubic-bezier(.16,1,.3,1)`.

### Required interaction coverage

| Action | Response |
| --- | --- |
| Page load | navigation drop, headline line reveal, core assembly, delayed planes |
| Pointer move | ambient parallax and restrained world rotation |
| Hover link | underline or arrow travel |
| Hover button | magnetic offset, shadow lift |
| Press | scale compression |
| Hover plane | 3D tilt, highlight shift, content micro-motion |
| Scroll | section reveal, progress update, depth/scale transition |
| Filter/search | results crossfade and layout interpolation |
| Open detail | shared-element-like expansion or focused overlay |
| Close/Escape | reverse transition and focus restoration |
| Theme/palette | light fields and accent colors interpolate |
| Route change | short veil or curve transition, not a full-screen gimmick |

### Accessibility and performance

- `prefers-reduced-motion` disables parallax, magnetic movement, continuous rotation and transform-heavy reveals.
- No essential meaning exists only in motion or color.
- Animation loops pause when the page is hidden.
- Use CSS 3D and transforms before adding WebGL; add a renderer only when it produces a material visual gain.
- Avoid layout animation of expensive properties; prefer transforms and opacity.
- Keyboard focus must expose the same detail as hover.

## 8. Page specifications

### 8.1 Home

**Job:** explain Vito's positioning, show selected writing/work and create a memorable authored encounter.

Sequence:

1. **Hero / Identity Core** — positioning, one-sentence promise, Writing and About actions.
2. **Three practices, one product** — Agent, full-stack and frontend shown as connected orbital planes.
3. **Selected writing** — one dominant article and four supporting paths with real metadata.
4. **Proof in motion** — FastMoss, Aimy and Agent delivery shown as a spatial timeline, not metrics cards.
5. **Contact aperture** — a quiet final statement and direct email action.

### 8.2 Writing index

**Job:** make browsing thirteen and future articles fast while preserving the spatial identity.

- Hero uses a smaller luminous aperture and large `Writing / 思考有路径` title.
- Search and tags live in one compact control rail.
- First article is a large editorial plane; remaining articles form an asymmetric two-column rhythm.
- Hover reveals summary, reading time and directional light.
- Filtering animates position and opacity without causing layout confusion.
- Pagination is explicit and keyboard accessible.

### 8.3 Article detail

**Job:** deliver the best long-form reading experience on the site.

- Spatial masthead contains title, summary, date, reading time, tags and a subdued halo.
- Body sits on a stable opaque paper surface; no glass behind long text.
- Desktop table of contents is a quiet sticky rail.
- Reading progress is a one-pixel spatial line in the navigation.
- Code, math, citations and images retain current MDX functionality.
- Previous/next articles use two asymmetrical planes at the end.
- Comments remain optional and visually separated.

### 8.4 About

**Job:** make Vito's trajectory, working method and capability boundaries credible.

- Portrait-led hero with a concise positioning statement.
- Career orbit uses verified experience only; no invented achievements or metrics.
- Agent, full-stack and frontend appear as a connected delivery system.
- Working principles explain how Vito moves from ambiguous problem to shipped product.
- Resume-derived experience, education and project details are added only when source material is available.
- Final contact section provides email and approved social links.

## 9. Responsive behavior

Mobile is a recomposition, not a scaled desktop canvas:

- navigation becomes a compact top bar;
- hero copy stays above the core and remains readable without overlap;
- 3D planes collapse into a layered vertical sequence with smaller tilt angles;
- drag interactions become optional touch pans and never block native scroll;
- writing controls remain sticky only when they do not reduce useful viewport height;
- article body uses full-width paper with 20px gutters;
- modal content becomes a bottom sheet or full-screen detail.

## 10. Content and truth constraints

- Use `Vito Wang`, `Se1fAware`, approved email and current public profiles.
- Do not publish a precise location, address or coordinates.
- Do not invent years, employers, education, metrics, project impact or client names.
- Current verified professional anchors: Agent engineering, full-stack product delivery, frontend craft, FastMoss, Aimy and AI support-agent delivery.
- When the resume becomes available, record its factual content before rewriting it into brand copy.

## 11. Acceptance gates

A page is not complete until:

1. its first viewport is recognizably in the reference's spatial family;
2. semantic content remains accessible with JavaScript or motion disabled;
3. desktop and mobile have deliberate compositions;
4. all core pointer, keyboard, scroll and focus states work;
5. reduced-motion behavior is verified;
6. no horizontal overflow exists at target breakpoints;
7. links and article routes resolve;
8. lint, TypeScript and production build pass;
9. screenshots of every major page and key interaction state are visually reviewed;
10. the original reference HTML remains untouched.

## 12. Implementation boundaries

- Preserve the accepted digital-garden work in commit `4b80548` on `redesign/home-b-garden`.
- Build this direction only on `codex/redesign-apple-spatial`.
- Keep the external reference HTML unchanged.
- Production implementation must use real Next.js routes and data; no iframe for the new direction.
- Reuse the reference's Outfit, Instrument Serif Italic and Red Hat Mono files as local web assets.
- Prefer reusable React interaction primitives over duplicated page scripts.
