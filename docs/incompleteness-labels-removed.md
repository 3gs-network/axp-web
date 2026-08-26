# Incompleteness / concept labels removed

Branch: `remove-incomplete-labels` · PR: https://github.com/3gs-network/axp-web/pull/22

Structured list of every file touched and what was removed from it.
"Disabled" UI (forms/buttons) was intentionally left disabled — only the
labels/badges/notes explaining *why* were removed.

## Global (site-wide)

| File | What was removed |
|---|---|
| `components/layout/Footer.tsx` | "Website concept." trimmed from the copyright line |
| `components/shared/OpportunityCard.tsx` + `.css` | "Concept opportunity" badge span; image `alt` text changed from "Illustrative lifestyle image; not the named concept property" to the real headline |
| `components/shared/FAQ.tsx` | "Can I register today? Not yet. This website shows a concept experience only…" FAQ entry deleted (used on HomeReady page) |
| `index.css` | Deleted the shared `.concept-label`, `.prototype-note`, `.opportunity-disclaimer` badge/disclaimer CSS rules |

## Home (`pages/home/sections/`)

| File | What was removed |
|---|---|
| `ImpactPreview.tsx` | "Impact commitments · not reported performance" concept-label |
| `FeaturedOpportunities.tsx` | "Illustrative concept opportunities only. These are not verified listings…" disclaimer paragraph |
| `HomeReadyFeature.tsx` | "HomeReady™ concept" floating badge |
| `PublicPromise.tsx` | "clearly labelled homeownership concepts" → "homeownership opportunities" |
| `VisitorPathways.tsx` | "clearly labelled homeownership concepts" → "homeownership opportunities" |

## Impact (`pages/impact/sections/`)

| File | What was removed |
|---|---|
| `Commitments.tsx` | "Commitments only · no reported metrics" concept-label + "They are not performance claims, reported results or forecasts" sentence |
| `Evidence.tsx` | "Label concept and illustrative content visibly" checklist item |

## Who We Are (`pages/who-we-are/sections/`)

| File | What was removed |
|---|---|
| `Governance.tsx` | "Visible concept and illustrative labels" commitment item; "…honest about what is available today" softened to "…honest" |
| `ArchitectureStack.tsx` | "Review clearly labelled homeownership concepts" → "Review homeownership opportunities" |

## Careers (`pages/careers/sections/Roles.tsx`)

- "No vacancies or application process have been supplied for this private website version." copy sentence removed
- "Programme concept" and "No roles currently supplied" badge spans removed

## Work With AXP (`pages/work-with-axp/sections/ContactBand.tsx`)

- "Prototype state · enquiries are not yet collected or transmitted" note removed

## Contact (`pages/contact/sections/`)

| File | What was removed |
|---|---|
| `Routing.tsx` + `.css` | "This private concept website does not send enquiries…" paragraph; "Prototype state · no personal information is collected…" small note. Email/textarea/Continue button remain `disabled`. |
| `OfficeInfo.tsx` | "Official contact details have not yet been supplied for this private website version." → replaced with real contact info: `info@axplimited.com` / WhatsApp `+234 902 621 1153` |

## HomeReady (`pages/homeready/sections/`)

| File | What was removed |
|---|---|
| `ProductHero.tsx` + `.css` | "Product experience concept · customer registration is not yet connected" note; "Concept preview · illustrative journey" label |
| `NextStepBand.tsx` + `.css` | "Prototype state · no personal information is collected, stored or transmitted" small note |

## Home Ownership Opportunities (`pages/home-ownership-opportunities/`)

| File | What was removed |
|---|---|
| `Index.tsx` | "Concept experience · not a live property database" note |
| `sections/OpportunitySearch.tsx` + `.css` | "Explore concepts" → "Explore opportunities"; `filter-note` paragraph ("Filter interactions demonstrate…"); "Illustrative content only" concept-label; "N opportunity concept(s) to explore" → "N opportunities to explore"; "Curated concepts" → "Curated opportunities"; "No concept matches" → "No matches" empty state |
| `sections/OpportunityGuidance.tsx` + `.css` | "Guidance concept · not a financial or eligibility assessment" note |

## Opportunity Detail (`pages/opportunity-detail/sections/`)

| File | What was removed |
|---|---|
| `DetailHero.tsx` + `.css` | "Illustrative concept opportunity" badge; "Discuss this concept" → "Discuss this opportunity"; "Prototype state · no personal information…no brochure has been supplied" note. "Download brochure" button remains `disabled`. Image alt text simplified. |
| `DetailOverview.tsx` + `.css` | "A concept for a more considered ownership journey" → "A more considered ownership journey"; "This illustrative concept highlights…" → "This opportunity highlights…"; "Partner attribution is intentionally undisclosed…" note removed |
| `LocalityGrid.tsx` + `.css` | "Representative information for this concept only. Specific local details require a verified live opportunity." paragraph removed from every locality card |
| `InterestForm.tsx` + `.css` | "For now, the form below is a disabled prototype…" sentence; "Prototype state…" small note. All inputs/selects/submit button remain `disabled`. |

## Knowledge Centre (`pages/knowledge/sections/`)

| File | What was removed |
|---|---|
| `Portal.tsx` | "All items shown are editorial concepts. No article, report, video or download is currently published or available." disclaimer; "Preview coming soon" → "Preview" (button stays `disabled`) |
| `Downloads.tsx` + `.css` | "These placeholders show the kinds of approved resources AXP may publish. No file has been supplied for download." copy; "Download placeholder · file not yet supplied" sub-text |
| `ReadyIqBand.tsx` + `.css` | "illustrative self-reflection concept" → "self-reflection tool"; "Concept only · not an assessment or finance decision" concept-label; "Illustrative example" tag on the readiness widget |

## Media Centre (`pages/media/sections/`)

| File | What was removed |
|---|---|
| `Feature.tsx` + `.css` | Play button aria-label "Documentary concept not yet available" → "Play" (stays `disabled`); "Featured documentary concept" → "Featured documentary"; "Concept preview · media not yet produced" badge; "Category links are placeholders. No news, film, event, podcast or award content has been supplied for publication." disclaimer; "Content coming after approval" small text on each category card |
| `Downloads.tsx` + `.css` | "Placeholder · approval required" / "Placeholder · content required" / "Placeholder · assets required" sub-text on each row |

## Data left untouched (per scope decision)

- `data/opportunities.ts` — illustrative property listings and the placeholder "upcoming-opportunity" entry
- `data/knowledge.ts` — placeholder article dates (e.g. "Perspective concept", "Research concept")
- Careers page card copy — no fake job listings were invented; badges were removed, cards left otherwise as-is
