---
name: AXP Africa
description: Making Urban Living Possible — a trust-first guidance platform for homeownership across Africa.
colors:
  deep-ledger-navy: "#1A233D"
  deep-ledger-navy-hover: "#263455"
  ledger-navy-ink: "#0e172c"
  signal-gold: "#D4A02A"
  signal-gold-light: "#e9c66c"
  signal-gold-hover: "#e2b240"
  alabaster-paper: "#F5F3ED"
  paper-white: "#ffffff"
  ledger-slate: "#656a76"
  surface-canvas: "oklch(0.977 0.008 90)"
  surface-border: "oklch(0.887 0.015 90)"
  surface-destructive: "oklch(0.58 0.18 28)"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(3rem, 6.2vw, 6.1rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(2.1rem, 4vw, 4.1rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Poppins, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Poppins, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.18em"
rounded:
  none: "0px"
  sm: "3px"
  lg: "0.6rem"
  xl: "1rem"
  pill: "999px"
spacing:
  section-y: "112px"
  container-max: "1240px"
  container-gutter: "20px"
  grid-gap-lg: "95px"
components:
  button-primary:
    backgroundColor: "{colors.deep-ledger-navy}"
    textColor: "{colors.paper-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "13px 22px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.deep-ledger-navy-hover}"
  button-secondary:
    backgroundColor: "{colors.signal-gold}"
    textColor: "{colors.ledger-navy-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "13px 22px"
    height: "50px"
  button-secondary-hover:
    backgroundColor: "{colors.signal-gold-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.deep-ledger-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "13px 22px"
    height: "50px"
---

# Design System: AXP Africa

## Overview

**Creative North Star: "The Trusted Ledger"**

AXP's interface reads like a well-kept institutional record: navy and gold, hairline rules, generous margins, and information presented with the quiet confidence of something that has already earned trust rather than something straining to earn it. The system is warm and reassuring rather than corporate-cold — it borrows the precision of a ledger or letterhead, not the sterility of one, because the audience is often making the biggest financial decision of their life and needs to feel guided, not processed.

Density stays low and unhurried: sections breathe at 112px of vertical padding, copy blocks cap around 65–75 characters, and every major section opens with a small gold eyebrow label before its heading — a consistent wayfinding device that lets a visitor scan the page's structure at a glance. Serif display type (Lora) carries the emotional register of the big claims and section headings; a clean geometric sans (Poppins) carries everything functional — body copy, labels, navigation, buttons — so warmth and precision never compete for the same word.

Gold is treated as a signal, not a fill: it marks eyebrows, focus rings, the accent button, and the active-nav underline, but it never becomes a background or a body-text color. Confirmed visual rejection: this is explicitly **not** a real-estate-listing aesthetic — no bright multi-photo carousels-as-hero, no urgency badges, no saturated CTA gradients. AXP is "not selling houses," and the interface should never look like it's trying to.

**Key Characteristics:**
- Navy-and-gold institutional palette, used with restraint (gold is rare by design)
- Serif display headlines (Lora) paired with a geometric sans for everything functional (Poppins)
- Small gold uppercase eyebrow labels as a structural, repeated wayfinding device
- Flat, hairline-bordered surfaces with a hover lift + shadow response, plus a faint resting shadow for depth
- Near-square button corners (3px) — precise, not soft — contrasted with fully pill-shaped micro-badges
- A recurring circular gold-ring emblem as the system's one decorative signature, always on dark/navy grounds

## Colors

Two brand colors carry the entire identity; everything else is neutral scaffolding for text, surfaces, and functional UI (forms, dialogs) inherited from the component library.

### Primary
- **Deep Ledger Navy** (`#1A233D`): the dominant surface color — page-hero backgrounds, primary buttons, headline text, the "navy" section variant. This is the color the brand is anchored to; it appears far more than gold.
- **Deep Ledger Navy — Hover** (`#263455`): the only state variant of navy; used solely on primary-button hover.

### Secondary
- **Signal Gold** (`#D4A02A`): the accent. Reserved for eyebrow labels, the gold button variant, focus-visible outlines, active/hover nav underlines, and small decorative rings. **The One Signal Rule.** Gold never fills a large surface or colors body text — it always marks a small, deliberate point of attention.
- **Signal Gold — Light** (`#e9c66c`): gold's on-dark variant, used for eyebrow labels that sit on navy backgrounds (`eyebrow--gold`) so they stay legible against the dark surface.
- **Signal Gold — Hover** (`#e2b240`): gold button hover state.

### Neutral
- **Ledger Navy Ink** (`#0e172c`): the deepest navy, used as text-on-gold (gold-button label color) and the darkest surface tone.
- **Alabaster Paper** (`#F5F3ED`): the warm off-white used for bounded "quiet" section backgrounds (`section--alabaster`) and the mobile nav panel — distinct from, and slightly warmer/more saturated than, the default page canvas.
- **Paper White** (`#ffffff`): true white — cards, the desktop dropdown menu, and text-on-dark contexts.
- **Ledger Slate** (`#656a76`): the secondary body-text color used consistently for section copy, feature copy, and story copy wherever it isn't full navy. Close low-saturation variants (`#4f5564`, `#515665`, `#606574`) appear in navigation and micro-label contexts; treat these as the same family, not distinct tokens.
- **Surface Canvas** (`oklch(0.977 0.008 90)`): the default page/body background driving the shadcn-derived component layer (forms, dialogs, auth screens).
- **Surface Border** (`oklch(0.887 0.015 90)`): the functional-component border/input-stroke color (distinct from the hand-authored hairline navy borders described in Shapes).
- **Surface Destructive** (`oklch(0.58 0.18 28)`): validation/error red, used only inside the shadcn component layer (forms, alerts) — never part of the marketing palette.

Three additional brand tokens exist in `:root` (`--axp-blue #315eaa`, `--axp-green #71997b`, `--axp-orange #c77a35`) but are not currently used anywhere in the app. Treat them as reserved, not invented — don't design against them until they're actually adopted somewhere.

## Typography

**Display Font:** Lora (with Georgia, serif fallback)
**Body Font:** Poppins (with system-ui, -apple-system, "Segoe UI", sans-serif fallback)

**Character:** Lora at weight 500 with tight negative letter-spacing reads as a confident, editorial serif — not decorative or classical, but precise. Poppins carries every functional word (body copy, labels, nav, buttons) with a warm geometric neutrality that keeps the interface feeling contemporary rather than bureaucratic.

### Hierarchy
- **Display** (500, `clamp(3rem, 6.2vw, 6.1rem)`, line-height 1, tracking -0.055em): page-hero `h1`s only — the single largest, most confident statement on a page.
- **Headline** (500, `clamp(2.1rem, 4vw, 4.4rem)`, line-height ~1.08, tracking -0.035em to -0.04em): section `h2`s throughout the site. Minor clamp variance exists between components (2.1–4.1rem vs. 2.3–4.4rem); treat the headline token above as canonical and consolidate new sections onto it rather than inventing another range.
- **Lead** (400, 18–20px, line-height 1.65–1.8): the one enlarged intro paragraph directly under a hero or section headline.
- **Body** (400, 16–17px, line-height 1.75–1.8, `{colors.ledger-slate}`): standard paragraph copy, capped near 65–75ch for readability.
- **Label** (700, 10–12px, tracking 0.04em–0.18em, uppercase): eyebrows, button text, nav links, badges. The single busiest type role in the system — nearly every interactive or wayfinding element resolves to this style.

### Named Rules
**The One-Voice-Per-Job Rule.** Lora is exclusively for emotional/display headlines; Poppins is exclusively for everything functional. Never swap them — a serif button label or a sans-serif hero headline would break the identity immediately.

## Layout

The page is built from a single reusable container (`.shell`): `width: min(100% - 40px, 1240px)`, centered. Section rhythm is generous and consistent — `112px` of vertical padding per section, with alternating background bands (default canvas / `section--navy` / `section--alabaster`) used to segment the page into readable chapters rather than relying on dividers.

Two-column feature layouts are asymmetric, never a plain 50/50 split — `.feature-split` (1.08fr/.92fr, 95px gap) and `.story-grid` (.8fr/1.2fr, 100px gap) both weight one side intentionally, then collapse to a single column with a tighter ~55px gap under 900px. A `.split-heading` pattern (heading left, supporting link/action right, 50px gap) recurs wherever a section needs a heading plus an escape hatch to "see more."

Mobile breakpoints cluster around 900px (layout collapse) and 680px (density/type-size reduction); there's no dedicated tablet tier beyond those two steps.

## Elevation & Depth

Surfaces are engineered to feel calm at rest and responsive to touch. Cards and interactive frames (module cards, opportunity cards, impact frames) sit on a **flat, hairline navy border** (`1px solid rgba(26,35,61,.13)`) at rest, now paired with a faint resting shadow for a touch more depth by default (`--shadow-rest: 0 2px 8px rgba(26,35,61,.05)`), then lift `-5px` and pick up the stronger `--shadow-soft` (`0 24px 60px rgba(26,35,61,.09)`) on hover. `--shadow-deep` (`0 30px 80px rgba(4,10,25,.28)`) is reserved for floating chrome above the page — the desktop nav's overflow dropdown.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 2px 8px rgba(26,35,61,.05)`): the new baseline for cards/frames — barely-there, just enough to lift them off the canvas.
- **Soft** (`box-shadow: 0 24px 60px rgba(26,35,61,.09)`): the hover response for cards, frames, and interactive grid items.
- **Deep** (`box-shadow: 0 30px 80px rgba(4,10,25,.28)`): floating UI above the page content — dropdown menus, overlays.

### Named Rules
**The Hover-Lift Rule.** Depth is a response to interaction, not a resting decoration. A card's shadow always deepens and the card always rises `-5px` on hover — never the reverse, and never a static heavy shadow at rest.

**Sanctioned exception:** the HomeReady module-grid's feature tile (`ModuleGrid.css`, `.module-grid article:hover`) opts out of the lift/shadow response because it already carries its own distinct hover language — a navy fill-sweep plus color inversion (`::after` inset animation). Running both at once competed visually, so the lift is intentionally suppressed there (see the in-code comment). This is the one documented exception to the Hover-Lift Rule; don't generalize it to other cards without the same "already has a richer hover treatment" justification.

## Shapes

Two deliberate, coexisting form languages. The **marketing vocabulary** (buttons, dropdown links, badges) is precise and near-square: `3px` radius on buttons and menu items — enough to soften the corner without reading as "rounded." Small status/label badges (`.concept-label`, `.prototype-note`) break from this with a full `999px` pill, which is reserved specifically for compact meta-badges, never buttons or cards. The **functional vocabulary** (shadcn-derived cards, dialogs, popovers, form controls powering auth and interactive components) uses a rounder base scale (`0.6rem`–`1rem`), which is intentionally a different, more conventional "app UI" register from the sharp-cornered marketing surface.

The signature decorative form is a **large circular gold-ring outline** — a thin gold stroke circle (`border: 1px solid rgba(212,160,42,.22-.28)`) with one or two faint glow rings around it, positioned bleeding off the top-right corner of dark navy hero/feature surfaces. It never appears on light backgrounds and never carries content; it's purely atmospheric.

### Named Rules
**The Square-Precision Rule.** Anything the visitor acts on directly (buttons, menu items) stays close to square (3px). Anything that's a compact status marker goes fully pill-shaped (999px). Nothing sits in between (no 8–12px "medium rounded" buttons) in the marketing vocabulary.

## Components

### Buttons
- **Shape:** near-square, `3px` radius.
- **Primary:** `{colors.deep-ledger-navy}` background, white text, uppercase 12px/700/0.04em label type, `13px 22px` padding, `50px` min-height.
- **Secondary (Gold):** `{colors.signal-gold}` background, `{colors.ledger-navy-ink}` text — the only button variant that inverts to a dark-on-light label.
- **Hover / Focus:** every button lifts `translateY(-2px)` on hover; `focus-visible` gets a `2px solid` gold outline with `3px` offset, applied uniformly across buttons, nav links, and form controls.
- **Outline / Ghost / Glass (secondary variants):** outline uses a navy 1px border on light grounds; ghost-light and glass are dark-background-only variants (`glass` adds `blur(12px)` over 10% white) for buttons placed over photography or navy hero surfaces.
- **Disabled:** `opacity: .45`, `cursor: not-allowed` — no color change, just fade.

### Chips / Badges
- **Style:** `999px` pill, thin `1px` border at ~18% navy opacity, 10px/600 uppercase label, generous letter-spacing.
- **Use:** exclusively for small meta markers — most notably `.prototype-note`, which the site already uses to flag illustrative/placeholder content to visitors. Preserve this pattern; it's doing real work distinguishing confirmed information from concept content.

### Cards / Containers
- **Corner Style:** flat/square in the marketing vocabulary (module cards, opportunity cards) — no radius beyond the hairline border; rounder (`xl`, 1rem) in the shadcn functional layer (dialogs, popovers).
- **Background:** white or canvas, never navy (navy is reserved for full-bleed section bands, not individual cards).
- **Shadow Strategy:** see Elevation & Depth — rest shadow + hairline border, hover lift + soft shadow.
- **Border:** `1px solid rgba(26,35,61,.13)` at rest.
- **Internal Padding:** generous and consistent per component, no dense/compact card variant exists yet.

### Inputs / Fields
- **Style:** square corners (`0px` radius) — the sharpest element in the system — `1px` hairline border, background shifts by context (near-opaque white `rgba(255,255,255,.92)` on dark form panels like the interest form, plain white on light pages).
- **Focus:** same `2px` gold outline, `3px` offset as buttons/links — one consistent focus treatment system-wide.
- **Panels:** forms embedded in dark sections (e.g. Interest Form) sit on a `{colors.ledger-navy-ink}` panel with a translucent white (`rgba(255,255,255,.06)`) inner card and a faint white border, rather than a plain navy fill.

### Navigation
- **Style:** sticky header, translucent alabaster (`rgba(245,243,237,.94)`) with `18px` backdrop blur, thin bottom hairline border.
- **Link state:** small (11px/600) muted-slate label type; a gold `2px` underline slides in from the left on hover/active (`right: 100% → 0`), color shifts from muted slate to full navy at the same time.
- **Overflow menu:** white panel, `--shadow-deep`, `3px`-radius items, alabaster hover fill.
- **Mobile:** full-panel alabaster overlay; links switch to serif display type (19px, weight 500) with dividers — a rare case where the display font appears in a navigational, not headline, role.

### Signature: Circular Gold-Ring Emblem
A large (≈680px), thin gold-stroke circle with one or two soft outer glow rings, bled off the edge of dark navy surfaces (page heroes, the module grid section). It's the system's single recurring piece of "decoration," and it's confined to dark grounds and never used more than once per section.

## Do's and Don'ts

### Do:
- **Do** treat gold as a rare signal — eyebrows, one button variant, focus rings, nav underline, the ring emblem — never a fill or body-text color (**The One Signal Rule**).
- **Do** pair Lora exclusively with display/headline roles and Poppins with everything else; never mix them within the same text role.
- **Do** give interactive surfaces a hairline border + faint rest shadow, then a stronger lift + shadow only on hover (**The Hover-Lift Rule**).
- **Do** open new major sections with a small gold uppercase eyebrow label above the heading — it's the system's primary wayfinding device and visitors will expect it.
- **Do** use the `.prototype-note` pill pattern (or an equivalent) whenever a surface shows illustrative/placeholder content (e.g. example opportunity listings), so visitors aren't misled into treating concept content as confirmed fact — this matters given PRODUCT.md records that current opportunity listings are illustrative.

- **Do** reuse the established `@/lib/motion` Framer Motion vocabulary (`fadeInUp`, `staggerContainer`/`staggerItem`, `springPresets`) for scroll-triggered reveals and load-in cascades instead of inventing new easing/timing values — first used on the home page's `FeaturedOpportunities`, now shared by every HomeReady section. Always pair it with `useReducedMotion()` from `framer-motion` (`initial={reduce ? false : "hidden"}`) so entrances respect `prefers-reduced-motion`.

### Don't:
- **Don't** round marketing buttons or menu items beyond `3px`, and don't leave a badge/chip square — the system has exactly two corner treatments (near-square, full pill), nothing in between.
- **Don't** fill a card, section, or button with gold, and don't set body copy in gold — it must stay a small, deliberate mark.
- **Don't** introduce urgency/hype patterns (countdown badges, saturated gradient CTAs, stacked photo carousels as hero) — confirmed anti-reference: this is explicitly not a real-estate-listing aesthetic.
- **Don't** invent a new headline clamp() range per component; consolidate new section headings onto the canonical `headline` token instead of adding another slightly-different size.
- **Don't** treat the currently-unused `--axp-blue` / `--axp-green` / `--axp-orange` tokens as available accents without an explicit design decision to adopt them.
