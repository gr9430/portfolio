# PhD Exams Citation Network — Design Spec
**Date:** 2026-07-01
**Status:** Approved

## Overview

A force-directed network graph visualizing the PhD comprehensive exams reading list (Core, Primary, Secondary) as a page at `phd/exams/`. Books are nodes; edges are auto-derived by finding books that cite the same source. The goal is to surface which texts function as shared intellectual infrastructure across the three exam lists, without requiring any manual edge-drawing — the user fills in each book's citation list and the graph computes connections.

Modeled interaction-wise on the existing Belfast mural network (`phd/interdisciplinary-teaching/visual-analysis/assets/belfast-network.html`): category toggle buttons, force simulation with per-category horizontal clustering, slide-in detail panel on node click, node size scaled by a metric. Modeled data-wise on the AWG gallery pattern (`_data/*.yml` + Liquid `jsonify` into inline JS) rather than Belfast's hardcoded-in-JS approach, since the user will hand-edit the data files repeatedly as their reading list grows.

Visually, this reskins Belfast's dark academic-punk palette to the site's actual light palette from `assets/main.scss`, rather than reusing Belfast's near-black theme.

## File Layout

```
portfolio/
├── _data/
│   ├── exams_vocab.yml   # controlled vocabulary: categories[], fields[] (informational only)
│   └── exams.json        # citations dictionary + books array
└── phd/exams/
    └── index.md           # layout: default; full-bleed graph section
```

## Data Model

### `_data/exams_vocab.yml`

Informational controlled vocabulary — not used to generate filter buttons (those are hardcoded to the three categories, see below). Exists so field names stay consistent and typo-free across book entries.

```yaml
categories:
  - core
  - primary
  - secondary

fields:
  - Electronic Literature
  - Critical Making
  - Visual Culture
  - Distant Viewing
```

### `_data/exams.json`

One file, two top-level keys.

```json
{
  "citations": {
    "foucault1977": "Foucault, Michel. Discipline and Punish. Vintage, 1977.",
    "hayles2008": "Hayles, N. Katherine. Electronic Literature: New Horizons for the Literary. Notre Dame, 2008."
  },
  "books": [
    {
      "id": "hayles-electronic-literature",
      "title": "Electronic Literature: New Horizons for the Literary",
      "author": "N. Katherine Hayles",
      "year": 2008,
      "category": "primary",
      "field": "Electronic Literature",
      "citations": ["foucault1977", "hayles2008"]
    }
  ]
}
```

- `citations` keys are freeform strings (convention: `lastname` + `year`, lowercase, no punctuation) — the user picks the key format; the graph logic treats them as opaque strings.
- `books[].category` must be one of `core` / `primary` / `secondary`.
- `books[].field` is one of the four field labels from `exams_vocab.yml`, shown as descriptive text in the panel — not filterable (three flat categories only, per the approved design).
- `books[].citations` is an array of keys into the `citations` dictionary. A book with no citations yet is a valid, edge-less node.
- The seed file ships with 2–3 placeholder books sharing a placeholder citation key, proving the linking logic works before the user replaces them with real data.

## Page (`phd/exams/index.md`)

### Structure

- `layout: default` — site header/nav stay
- Brief intro prose above the graph (exam list description, three-category legend)
- Full-width graph section below, breaking out of `.wrapper` via negative margins (same technique as the AWG gallery's `#awg-gallery`)
- All CSS scoped to `#exams-graph`; all JS in one `<script>` block, self-contained

### Data Wiring

```html
<script>
const EXAMS_DATA = {{ site.data.exams | jsonify }};
const EXAMS_VOCAB = {{ site.data.exams_vocab | jsonify }};
</script>
```

No runtime `fetch()` — data is baked in at Jekyll build time, same as AWG and the homepage rhizome graph. No apostrophe-escaping concerns here since this lands inside a `<script>` block (JS string parsing), not an HTML attribute — the AWG bug (`data-venues='...'` breaking on an apostrophe) only applies when JSON is embedded inside a quoted HTML attribute.

### Edge Computation (client-side JS, on load)

1. Build a map of `citationKey → [bookIds citing it]` from `EXAMS_DATA.books`.
2. For every citation key with ≥2 citing books, generate all pairwise combinations of those book IDs as candidate edges.
3. Merge duplicate pairs (a pair may share more than one citation) into a single edge object, accumulating `sharedCount` (number of shared keys) and `sharedKeys` (the keys themselves, for panel display).
4. Books with zero shared citations still render as nodes with no edges — visible evidence of a standalone source, not filtered out.

### Visual Encoding

- **Node radius:** scaled by degree (count of distinct books it shares a citation with) via `d3.scaleSqrt`, same scale mechanism as Belfast's contour-count sizing.
- **Node fill:** category color at partial opacity (matches Belfast's `color + "2a"` alpha-suffix trick):
  - `core` → `rgb(122, 6, 97)` (site's existing primary accent)
  - `primary` → `rgb(6, 97, 122)` (site's existing "creative" teal)
  - `secondary` → `rgb(97, 122, 6)` (olive-gold; new, but a channel-rotation of the other two so it reads as part of the same family)
- **Node position:** `d3.forceSimulation` with `forceX` pulling each node toward one of three x-targets by category (left/center/right thirds of viewport width), plus `forceY` toward vertical center, `forceCharge`, `forceCollide`, and `forceLink` — same force set as Belfast, generalized from two categories to three.
- **Edges:** stroke thickness and opacity scale with `sharedCount` (more shared citations = thicker, more opaque line). No dashed baseline "same category" clique edges like Belfast's road-baseline — only genuine shared-citation edges are drawn, since manufacturing a same-category clique isn't meaningful here.

### Interaction

- **Category toggle buttons:** Core / Primary / Secondary, multi-select, hides matching nodes and any edge touching a hidden node — same show/hide mechanics as Belfast's Falls/Shankill toggles, generalized to three.
- **Links toggle:** show/hide all edges independent of category filters.
- **Clear filters button:** resets all toggles to default (all visible), matching the AWG gallery's clear-filters pattern.
- **Click panel:** slide-in panel (Belfast's `#panel` pattern) showing title, author, year, category badge (colored per the palette above), field label, and the full resolved citation list (looked up from `EXAMS_DATA.citations`), with citations that are actually shared with other books visually marked (e.g., a small count badge showing how many other books also cite it).
- **Hover tooltip:** node hover shows title only (Belfast's lightweight tooltip pattern) — shared-citation detail lives in the click panel, not the tooltip, to keep hover cheap.
- No lightbox, no image handling, no shuffle-on-load — those are AWG/gallery-specific and don't apply here.

## Constraints and Decisions

- **No JS build step, no external libraries beyond D3** (loaded from the same CDN URL already used by Belfast and the homepage graph: `https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js`).
- **No book cover images** — text-only panel, per approved design (simpler for manual data entry, no asset folder needed).
- **Three flat categories only** — field labels (Electronic Literature, Critical Making, Visual Culture, Distant Viewing) are descriptive text in the panel, not separate filter groups.
- **Edges are fully auto-derived** — no manual edge list, unlike Belfast's hand-curated `fallsEdges`/`shankillEdges`/`crossEdges` arrays. This is the core requirement driving the whole data model: fill in citations per book, get the network for free.
- **Citation matching is key-based, not text-based** — avoids silent breakage from minor text variations (a typo in a full citation string would silently fail to link two books; a typo in a short key is easier to catch).

## Verification Plan

1. `bundle exec jekyll build` — confirm no Liquid errors.
2. Load `_site/phd/exams/index.html` in a browser (or `bundle exec jekyll serve`).
3. With the seed placeholder data (2–3 books sharing one citation key), confirm: the shared-citation pair renders a visible edge; an unrelated third book with no shared citations renders with no edges; category toggle buttons correctly show/hide nodes and connected edges; clicking a node opens the panel with correct resolved citation text; the "Links" toggle hides/shows all edges; "Clear filters" resets state.
4. Confirm visually that the three category colors match the specified RGB values and that the page inherits the site's monospace font and light background rather than Belfast's dark theme.
