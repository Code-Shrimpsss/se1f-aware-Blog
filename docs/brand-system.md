# Se1fAware brand and UI system

> Version 1.0 · 2026-07-12 · Applies to the Next.js site, public assets and future product surfaces.

## The decision

Se1fAware is a personal interface for turning complex technology into calm, useful and beautifully clear products. Its visual language is **Calm Intelligence in Space**: a bright spatial studio where engineering judgement remains legible, without resorting to terminal-culture or generic portfolio cards.

The existing homepage already establishes the product direction through `Spatial Outfit`, `Spatial Instrument`, `Spatial Mono`, light fields and deliberate depth. This document makes that direction repeatable. It supersedes the older "山中观心" colour direction when the two systems disagree; its quieter reading principles remain valid.

## Logo: Perception Aperture

The logo is an open optical aperture rather than a literal eye. Its outer stroke represents an unfinished field of observation; the inner orbit holds the numeral `1`, preserving the deliberate spelling of **Se1fAware**. A small coral point provides human warmth and orientation.

| Asset | Intended use |
| --- | --- |
| `public/static/brand/se1faware-mark.svg` | Default icon, favicon source, light surfaces |
| `public/static/brand/se1faware-mark-mono.svg` | One-colour print, constrained UI and small reproduction |
| `public/static/brand/se1faware-mark-reverse.svg` | Dark or photographic surfaces |
| `public/static/brand/se1faware-lockup.svg` | Header variants, slide covers and documents |
| `components/Brand/BrandMark.tsx` | The responsive in-product React mark |

### Use rules

- The compact colour mark is permitted in the product navigation; keep all surrounding controls monochrome. Prefer the monochrome asset for constrained UI, printing and tiny reproduction.
- Keep clear space equal to one third of the mark's width on every side.
- Use the mark at no less than 24px; use the lockup at no less than 132px wide. The header mark is 30px.
- Do not add gradients, shadows, rotation, strokes or a containing badge to the mark. Never recolour the coral point independently.
- Use the reverse asset on dark surfaces. Do not invert it through CSS filters.

## Token architecture

`css/design-tokens.css` follows a three-layer contract:

```text
primitive values → semantic intent → component contract → component implementation
```

| Layer | Example | Rule |
| --- | --- | --- |
| Primitive | `--sa-blue-500` | Raw value; never use in a component style. |
| Semantic | `--sa-focus` | Describes why the value exists and changes by theme. |
| Component | `--sa-button-primary-bg` | Component-only contract, mapped to semantic tokens. |

New components should use `--sa-*` tokens. The legacy `--sp-*` names remain while current spatial CSS is migrated incrementally; do not create a third token namespace.

### Palette and emphasis

| Role | Token | Light value | Job |
| --- | --- | --- | --- |
| Canvas | `--sa-bg-canvas` | `#EFF0F4` | Atmospheric page field |
| Reading surface | `--sa-bg-surface` | `#F8F8FA` | Long-form content |
| Primary ink | `--sa-fg-primary` | `#111216` | Headings, strong copy, primary CTA |
| Secondary copy | `--sa-fg-secondary` | `#3F424B` | Supporting prose |
| Cool intelligence | `--sa-accent-cool` | `#668FFF` | Focus, links, spectral light |
| Human point | `--sa-accent-warm` | `#FF8463` | One meaningful callout or status point |
| Living system | `--sa-mint-500` | `#7DDBC7` | Availability / healthy status only |

The coral rule: it should occupy less than 5% of a viewport. Semantic state must never rely on blue/coral/green alone—pair it with an icon or text.

## Typography and layout

- **Interface and display:** `Spatial Outfit`, compact tracking for large headings only.
- **Editorial interruption:** `Spatial Instrument`, italic, one short phrase per major scene; never use it for paragraphs.
- **Metadata:** `Spatial Mono`, 9–12px, compact labels and dates only.
- **Body:** 16–19px, 1.7–1.9 line height, maximum `--sa-content-measure` (72ch). Chinese text may use PingFang SC / Noto Sans SC fallback.
- **Page geometry:** `--sa-page-max` 1200px and responsive gutters; wide media can break beyond the reading measure but must remain inside the page container.

## Component paradigm

Build components from semantic HTML, a stable anatomy and a deliberately small variant API. Use `class-variance-authority` for variants and `cn()` from `lib/utils.ts` for composition. Visual variants should not change the accessible name, DOM order or keyboard behaviour.

| Family | Anatomy | Variants | Non-negotiable behaviour |
| --- | --- | --- | --- |
| **Button** | leading icon · label · trailing icon | `primary`, `secondary`, `quiet`, `icon`; `sm`, `md`, `lg` | Native `<button>` for actions, minimum 44px hit target, loading is announced with `aria-busy`. |
| **Text link** | label · directional glyph | `default`, `muted`, `nav` | Always underlines or moves the arrow on hover/focus; remains recognizable without hover. |
| **Plane** | eyebrow · title · body · optional action | `flat`, `glass`, `featured`, `interactive` | One semantic job per plane. No equal-size card grids; `interactive` must be one coherent link or button. |
| **Article card** | metadata · title · summary · read action | `lead`, `standard`, `compact` | Title is the primary link; summary clamps only in list contexts. |
| **Chip / tag** | optional icon · label · count | `filter`, `status`, `topic`; selected state | Use buttons for filters, links for routes. Include `aria-pressed` or `aria-current` when selected. |
| **Field** | label · control · helper/error | `text`, `search`, `textarea`, `select` | Visible label, `aria-describedby`, error adjacent to the input; no placeholder-only labels. |
| **Dialog / sheet** | title · description · content · actions | `modal`, `mobile-nav`, `command` | Focus is trapped, Escape closes, focus returns to the trigger, backdrop has a clear visual boundary. |
| **Status** | dot/icon · short text | `success`, `warning`, `danger`, `neutral` | Do not use a coloured dot by itself. |

### State contract

State priority is `disabled → loading → active → focus-visible → hover → default`. All interactive components must share these rules:

- Focus: a 3px `--sa-focus` ring plus a 3px surface separation ring; never remove the browser-visible equivalent.
- Hover: 180–420ms colour, shadow or 2–5px transform. Never animate layout properties.
- Press: transform scale no smaller than `.97`; do not displace adjacent content.
- Disabled: native `disabled` where available, no pointer action, visible reduced emphasis, at least 3:1 contrast.
- Loading: retain the label or provide a screen-reader label; prevent duplicate submits.
- Reduced motion: disable magnetic, parallax, continuous rotation and nonessential reveals.

## Composition patterns

1. **Atmosphere / world / interface.** Colour fields are passive atmosphere; planes or identity objects are the world; controls and prose live in the legible interface layer.
2. **Composition before a grid.** Make selected work and writing asymmetric. Use a grid only for dense utility contexts such as tags or archive lists.
3. **Opaque reading.** Article body always sits on an opaque, stable surface. Glass is navigation, identity summary and transient overlay material—not a long-form background.
4. **One dominant action.** A screen or plane has one primary CTA. Contact is a primary action only at intentional terminal moments.
5. **Mobile is recomposed.** At narrow widths, spatial planes become a vertical reading order rather than a scaled desktop scene.

## Implementation checklist

- Import `css/design-tokens.css` before feature CSS; use `--sa-*` tokens in newly written components.
- Use `BrandMark` for React chrome and the SVG assets for static/export contexts.
- Test at 375px, 768px, 1024px and 1440px; all target sizes must be at least 44 × 44px.
- Maintain WCAG AA text contrast, visible keyboard focus and logical heading order.
- Verify `prefers-reduced-motion`, light mode and dark mode independently.
- Reserve image dimensions, use `next/image` for content media and avoid layout shift.
