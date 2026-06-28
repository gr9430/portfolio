# AWG INC Gallery — Design Spec
**Date:** 2026-06-28
**Status:** Approved

## Overview

A filterable image gallery page for `creative/graphic/awg-inc/` showcasing archival graphic design work (flyers, tour posters, t-shirt designs) produced under the pseudonym "AWG INC" for the DIY punk/metal scene in Orlando and Daytona Beach, FL, roughly 2016–2021. The gallery replaces the existing `index.md` with an `index.html` that preserves the existing prose intro above the gallery. Images are normalized to consistent JPEGs by a Python script; metadata is stored in Jekyll `_data/` YAML files.

## File Layout

```
portfolio/
├── _data/
│   ├── awg_vocab.yml          # controlled vocabulary: bands[], venues[]
│   └── awg_images.yml         # one entry per image, script-generated then hand-filled
├── assets/images/
│   └── awg-inc/               # normalized JPEGs (Jekyll serves automatically)
├── creative/graphic/awg-inc/
│   ├── index.html             # replaces index.md; layout: default
│   └── early/, mid/, late/    # source originals, untouched
└── _tools/
    └── normalize_awg.py       # normalization script
```

## Normalization Script (`_tools/normalize_awg.py`)

- Run from repo root: `python _tools/normalize_awg.py`
- Dependencies: stdlib + Pillow (`pip install pillow`)
- Walks `creative/graphic/awg-inc/early/`, `mid/`, `late/` — **top level only, no recursion**
- Accepts: `.png`, `.jpg`, `.jpeg`, `.jfif`, `.webp` — skips all other extensions silently
- Resize: max **1200px** on longest side, aspect ratio preserved
- Output format: **JPEG at quality 85**
- Output destination: `assets/images/awg-inc/`
- Filename slugification: lowercase, spaces → hyphens, non-alphanumeric chars stripped (except hyphens/dots)
- Data file behavior: **appends** new entries to `_data/awg_images.yml`, skipping filenames already present — safe to re-run
- PDFs are excluded; the user converts those to JPEG manually before running the script

## Data Model

### `_data/awg_vocab.yml`

Controlled vocabulary. Filter UI buttons are generated directly from this file via Liquid. Adding a band or venue later requires only editing this file and re-tagging the relevant images in `awg_images.yml`.

```yaml
bands:
  - placeholder-band-1
  - placeholder-band-2

venues:
  - placeholder-venue-1
  - placeholder-venue-2
```

### `_data/awg_images.yml`

One entry per image. Script generates entries with blank fields; fields are filled in by hand.

```yaml
- file: early-spit-poster.jpg
  era: early              # one of: early, mid, late
  bands: []               # array; values must match awg_vocab.yml bands entries
  venues: []              # array; values must match awg_vocab.yml venues entries
  tags: []                # freeform supplemental tags (not used for filtering)
```

- `bands` and `venues` are multi-value arrays
- Blank arrays mean the image is untagged for that category and will appear unless filtered out by era alone
- `tags` is freeform and reserved for future use; not wired into filter UI

## Gallery Page (`creative/graphic/awg-inc/index.html`)

### Structure

- `layout: default` — renders with the existing site header/footer
- Existing AWG INC prose sits at the top inside the normal `.wrapper` flow
- Below the prose: a full-width dark gallery section using negative margins to break out of `.wrapper` (no layout file changes needed)
- All gallery CSS in a scoped `<style>` block; all JS in a `<script>` block — self-contained

### Filter Controls

- Single toolbar above the grid with three toggle groups: **Period** (early/mid/late, hardcoded), **Band**, **Venue**
- Band and Venue group buttons generated from `site.data.awg_vocab` via Liquid
- Buttons toggle active state; multiple selections per group allowed
- Filter logic: **AND across categories, OR within a category** — an image must match at least one active selection in every active category simultaneously
- A "Clear filters" control resets all groups
- Active button style: inverted (dark text on light background)
- No filter state = all images visible

### Grid

- **CSS columns** (`column-count: 3` desktop / `2` tablet / `1` mobile) for natural staggered/masonry reflow without a JS layout library
- Small gap between columns and items
- Filtered-out images set to `display: none` so CSS columns reflow naturally
- Images are `width: 100%` within their column, `height: auto`, `cursor: pointer`

### Lightbox

- Clicking an image opens a fixed overlay with the full normalized image centered
- Clicking the overlay background or pressing `Escape` closes it
- No caption — the images are self-sufficient
- Overlay: near-black background (`rgba(0,0,0,0.92)`)

### Styling

Scoped to `#awg-gallery`. Does not inherit the global purple accent (`rgb(122, 6, 97)`).

- Gallery background: `#0a0a0a`
- Text: `#e8e8e8`
- Filter button default: `#111` background, `#e8e8e8` text, `1px solid #444` border
- Filter button active: `#e8e8e8` background, `#0a0a0a` text
- Font: inherits site monospace stack

### Data Wiring

Liquid renders `site.data.awg_images` into a JS variable at build time:

```html
<script>
const AWG_IMAGES = {{ site.data.awg_images | jsonify }};
</script>
```

JS reads this array for filtering. No runtime fetch required.

## Constraints and Decisions

- **No JS build step** — vanilla JS only, inline in the page
- **No external layout libraries** — CSS columns for masonry, no Masonry.js or similar
- **No Jekyll collections** — `_data/` YAML is sufficient and lower friction than ~155 stub `.md` files
- **Originals untouched** — the script never modifies source files
- **Re-run safe** — running the normalization script again skips already-processed images
