# Teaching Network Graph & Graph Color Unification — Design Spec
**Date:** 2026-04-22

## Overview

Two related changes:

1. **Teaching graph** — a new D3 force-directed network graph on `teaching/index.md` that visualizes the relationship between the Teaching Statement, the six ENC 1101 Student Learning Outcomes (SLOs), and individual lectures.
2. **Graph color unification** — both the teaching graph and the existing projects graph adopt the site's brand palette and light background, replacing the dark-panel aesthetic with a seamless look.

---

## Teaching Graph

### Placement

Replaces the current plain `<ul>` navigation list on `teaching/index.md`. The graph is the primary navigation interface for the teaching section.

### Node Structure (three-tier)

```
Teaching Statement (hub)
        ↓ connects to all six SLOs
  SLO keyword nodes (6 total)
        ↓ each connects to relevant lectures
    Lecture nodes (6 total)
```

The Teaching Statement node links to `/teaching/statement/`. Lecture nodes link to their respective Twine HTML files. SLO nodes are non-navigable; clicking one filters the graph.

### SLO Keyword Nodes

The keyword layer uses the six official ENC 1101 Student Learning Outcomes:

| ID | Display Label |
|---|---|
| `writing-processes` | Writing Processes & Adaptation |
| `multiple-literacies` | Multiple Literacies & Goal Setting |
| `variation-across-contexts` | Variation across Contexts |
| `decision-making` | Decision Making & Production |
| `writing-and-power` | Writing and Power |
| `revision` | Revision |

### Lecture → SLO Mapping

| Lecture | SLOs |
|---|---|
| Discourse Communities | `variation-across-contexts`, `writing-and-power` |
| Discourse Communities & Language Negotiation | `writing-and-power`, `multiple-literacies`, `variation-across-contexts` |
| Peer Review as Practice | `writing-processes`, `revision` |
| Using Your Feedback | `revision`, `writing-processes` |
| Navigating Genres | `variation-across-contexts`, `decision-making`, `writing-processes` |
| The Rhetorics of Fashion & Style | `multiple-literacies`, `variation-across-contexts`, `decision-making` |

The Teaching Statement connects to all six SLOs.

### Data Storage

Defined in `_data/teaching-graph.yml`. Jekyll reads this file and builds the JavaScript graph data object at render time, keeping `teaching/index.md` clean of raw data.

Structure:
```yaml
statement:
  title: "Teaching Statement"
  url: "/teaching/statement/"

slos:
  - id: "writing-processes"
    label: "Writing Processes & Adaptation"
  # ... five more

lectures:
  - title: "Discourse Communities"
    url: "/teaching/lectures/s26/discourse-communities.html"
    slos: ["variation-across-contexts", "writing-and-power"]
  # ... five more
```

### Interactions

| Action | Result |
|---|---|
| Click Teaching Statement | Navigate to `/teaching/statement/` |
| Click a Lecture node | Navigate to that lecture's URL |
| Click an SLO node | Filter graph: fade unconnected nodes/links |
| Click SVG background | Reset all filters, restore full opacity |
| Drag any node | Repositions node in the simulation |
| Scroll/pinch | Zoom (scale 0.4–3× via d3.zoom) |

Legend: *Click an SLO to filter · Click a lecture to open · Drag to explore*

---

## Color Scheme (both graphs)

### Unified palette

| Element | Value | Notes |
|---|---|---|
| Graph background | `rgb(248, 248, 255)` | Matches site background — seamless |
| Links | `rgba(122, 6, 97, 0.2)` | Soft magenta, recedes visually |
| Node labels | `#333333` | Dark, readable on light background |
| SLO / tag labels | `rgb(122, 6, 97)` | Magenta, distinguishes keyword type |

### Teaching graph node colors

| Node type | Fill | Radius |
|---|---|---|
| Teaching Statement | `rgb(122, 6, 97)` — site magenta | 18px |
| SLO keyword | `#c45a8a` — lightened magenta | 10px |
| Lecture | `rgb(6, 97, 122)` — site teal | 12px |

### Projects graph node colors (updated)

| Node type | Old fill | New fill |
|---|---|---|
| Project | `#e85d3d` | `rgb(122, 6, 97)` — site magenta |
| Tag | `#4a90c4` | `rgb(6, 97, 122)` — site teal |

Projects graph background changes from `#1a1a18` to `rgb(248, 248, 255)`. Labels and links update to match the unified palette above.

---

## Files Changed

| File | Change |
|---|---|
| `_data/teaching-graph.yml` | **New** — teaching graph data |
| `teaching/index.md` | **New** — D3 graph replaces plain nav list |
| `projects/index.md` | **Update** — colors and background |

---

## Out of Scope

- No changes to lecture HTML files
- No changes to `teaching/statement/index.md`
- No changes to the site navigation or header
- No new lecture pages — existing six only
