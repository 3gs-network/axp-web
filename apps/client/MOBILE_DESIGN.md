# AXP Africa — Web App Design System (Mobile-First)

Distilled from [`design-system.json`](./design-system.json) / [`DESIGN.md`](./DESIGN.md) for the app/functional surfaces of this site (dashboards, opportunity search, auth, forms). This is a **responsive web app** — not a native mobile app — so there's no app-shell chrome (no bottom tab bar, no OS status bar). Build mobile-first: base styles target the smallest viewport, then progressively enhance with `min-width` media queries up to the existing desktop breakpoints.

## Identity
"The Trusted Ledger" — navy + gold, quiet confidence, not a real-estate-listing look. Gold is a rare signal, never a fill.

## Breakpoints (mobile-first)
Reuse the site's existing steps rather than inventing new ones — write base (mobile) CSS unscoped, then layer up:
```
base       < 680px   single column, compact type/spacing
sm  680px  ≥ 680px   density increases (larger type, more padding)
md  900px  ≥ 900px   two-column/asymmetric layouts unlock (feature-split, story-grid)
```
Author every component mobile-first: unprefixed rules are the phone/small-viewport layout; `@media (min-width: 680px)` and `@media (min-width: 900px)` add, never override with `!important`.

## Color
```
--navy:        #1A233D   /* primary — headers, primary actions, key text */
--navy-hover:  #263455   /* primary hover/active */
--navy-ink:    #0E172C   /* deepest navy — text on gold, dark panels */
--gold:        #D4A02A   /* accent — one CTA, focus ring, active state, badges */
--gold-hover:  #E2B240
--alabaster:   #F5F3ED   /* warm off-white section/card bg */
--white:       #FFFFFF   /* cards, sheets */
--slate:       #656A76   /* secondary text */
--canvas:      oklch(0.977 0.008 90)   /* app background */
--border:      oklch(0.887 0.015 90)   /* hairline / input border */
--destructive: oklch(0.58 0.18 28)     /* error only */
```
Rule: gold marks exactly one thing per screen (primary highlight, active state, focus ring) — never a background fill or body text color. Navy carries the weight.

## Type
Mobile-first scale — start small, step up at breakpoints rather than relying on desktop `clamp()` ranges verbatim (they were tuned for hero sections, not compact app screens):

| Role | Mobile (base) | ≥900px |
|---|---|---|
| Display (Lora 500) | 26–30px / 1.15 | up to the canonical `headline` clamp token |
| Heading (Poppins 600) | 19–20px | 22–24px |
| Body (Poppins 400) | 15px / 1.6, color slate | 16–17px / 1.75 |
| Label (Poppins 700, uppercase) | 11px, tracking .08em | 11–12px, tracking .18em |

Never mix roles: Lora stays reserved for display/emotional moments (page titles, key numbers); Poppins runs everything functional at every breakpoint.

## Spacing & sizing (8px base)
```
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
```
- Screen gutter: 16px on mobile → 20px at 680px → up to the desktop shell gutter at 900px+
- Section gap: 32px on mobile → 64px at 680px → 112px at 900px+ (the existing desktop `.section` rhythm)
- Min touch target: 44×44px at every breakpoint (mouse users benefit too)
- Sticky primary CTA on forms/flows: full-width on mobile, inline/auto-width once layout has room (≥680px)

## Radius
Use the existing functional/app scale (shadcn-derived), consistent across all breakpoints — this is the same scale already used for cards, dialogs, and inputs on desktop:
```
sm: 8px   md: 10px   lg: 12px   xl: 16px   pill: 999px
```
Cards, sheets, inputs = lg/xl. Buttons = md. Status chips/badges = pill.

## Elevation
- Rest: `0 2px 8px rgba(26,35,61,.05)`
- Raised (modal/dropdown/popover): `0 24px 60px rgba(26,35,61,.09)`
- Overlay (toast, top-level nav dropdown): `0 30px 80px rgba(4,10,25,.28)`
Hover-lift (`translateY(-5px)` + soft shadow) is a pointer-device affordance — gate it behind `@media (hover: hover) and (pointer: fine)` so touch users get a simple pressed state (`scale(0.98)`, ~120ms) instead of a hover that never resolves.

## Layout
- Default to single-column, stacked content on mobile: hero copy, then image/media, then supporting content — no side-by-side splits below 900px.
- The existing asymmetric two-column patterns (`.feature-split` 1.08fr/.92fr, `.story-grid` .8fr/1.2fr) only apply at ≥900px; they already collapse to one column with a tighter ~32-55px gap below that — reuse those breakpoints rather than adding new ones.
- Navigation: sticky header at every size. Below 900px it collapses to the site's existing full-panel alabaster overlay pattern (hamburger trigger, serif display link type) rather than a native tab bar — this is a website nav pattern, not app-shell chrome.
- Forms/tables that don't fit mobile width scroll horizontally inside their own container; the page body itself never scrolls sideways.

## Core components
- **Button**: 44–48px height, radius md, label typography, full-width on mobile forms/primary flows, auto-width once inline space allows (≥680px). Navy fill = primary; gold fill = the one accent action per screen; outline navy = secondary; disabled = 45% opacity, no color change.
- **Input**: 44–48px height, radius lg, 1px border, white bg, gold 2px focus ring (same focus treatment as desktop — one system, not a mobile-only variant).
- **Card**: white on canvas/alabaster, radius xl, rest shadow, 16px padding on mobile → 20–24px at 900px+.
- **Chip/badge**: pill, 1px navy@18%, uppercase label — status/meta only, never a button.
- **Navigation**: sticky top header everywhere; mobile collapses via the existing overlay pattern, not a bottom tab bar.

## Motion
Interactive: 150–250ms ease, same values as desktop. Always respect `prefers-reduced-motion`. Reuse the existing `@/lib/motion` Framer Motion vocabulary instead of inventing mobile-specific easing.

## Don't
- Don't build native-app chrome (bottom tab bars, OS-style app bars, safe-area-inset scaffolding) — this is a responsive website, not an installed app shell.
- Don't reuse desktop `clamp()` hero sizes verbatim on mobile without checking they fit — step the type scale at breakpoints instead.
- Don't apply hover-only affordances (lift, hover-reveal menus) without a touch-equivalent fallback.
- Don't let gold spread past one accent per screen, at any breakpoint.
