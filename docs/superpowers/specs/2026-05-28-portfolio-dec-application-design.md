# Portfolio DEC Application: Site Audit + Homepage Rhizome Visualization

**Date:** 2026-05-28
**Context:** Preparing portfolio (glennritchey.net) for GRA application to UCF Libraries' Digital Exploration Center. The DEC role emphasizes digital humanities, data visualization, pedagogy, and instructional experience — all of which are present in the portfolio but need to be fully surfaced and consistently presented.

## Scope

Two coordinated tasks:

1. **Site audit** — Review all project pages (excluding `combat`) for description accuracy, tag consistency, and Jekyll integration. Wire in untracked content. Add missing project cards.
2. **Homepage visualization** — Replace the featured photo (`DSCF0085.JPG`) in `index.md` with a full-merge D3.js rhizomatic network combining all project and teaching nodes, bridged by shared conceptual nodes. No central hub.

---

## Part 1: Site Audit

### Projects to review

| Project | Location | Status | Action |
|---|---|---|---|
| Lost in Translation (SMT) | `projects/smt/` | Modified | Review tags + description |
| Ulster Cycle Network | `projects/ulster-visualization/` | .html deleted, .md untracked | Verify card links to new .md; wire in |
| Words Across Worlds | `projects/henryviii/` | Tracked | Review description + tags |
| Ziner | `tools/zinemkr/` | Modified | Review description; card links to `/tools/zinemkr/` |
| ePortfolio Resources | `projects/demo/` | Tracked | Review description + tags |
| auto-Glenn | `projects/bot/` | Tracked | Review description + tags |
| Shooting a Still Bird (Tracery) | `projects/sasb/` | Tracked | Review |
| Shooting a Still Bird (Bitsy) | `projects/sasb-bitsy/` | Tracked | Review |
| Like a Mountain of Sleep | `projects/lamos/` | Tracked | Review |
| Walk to School ~'07 | `projects/map/` | Tracked | Review |
| Your Oppression: Our Aesthetic | `projects/oppression-aesthetic/` | Tracked | Review |
| Published Interviews | `projects/interviews/` | Has front matter, **no card in projects/index.md** | Add card |
| Interdisciplinary Teaching | `projects/interdisciplinary-teaching/` | Untracked | Add card to projects/index.md; wire in |
| Rudimentary Magits | `projects/rudimentary-magits/` | Raw HTML, no front matter | Add `index.md` with front matter OR exclude from graph |

### For each project, verify:
- `project: true` in front matter (required for graph data)
- `tags` array in front matter matches `data-tags` attribute on the project card in `projects/index.md`
- Description in the project card accurately reflects the actual project page content
- Any linked interactive content (`network.html`, embedded iframe, etc.) resolves correctly

### Teaching content to wire in

`teaching/interdisciplinary-teaching/` is untracked. The nav in `_layouts/default.html` already links to it. The `_data/teaching_graph.yml` already defines `interdisciplinary_teaching` and `interdisciplinary_teaching_components`. However, `teaching/index.md` does not yet include these nodes in its D3 graph script — the graph needs updating to include Interdisciplinary Teaching as a node alongside ENC 1101 and ENC 1102.

### Blog

`blog/index.md` has a commented-out first post (6 Jan). No action required — this appears intentional.

---

## Part 2: Homepage Rhizomatic Visualization

### Concept

Replaces the image on `index.md` with a D3.js force-directed network. **No central node.** The visualization is rhizomatic — consistent with the Deleuzian framework already cited in the SMT and Ulster Cycle projects. Two organic clusters (projects and teaching) are joined by shared conceptual bridge nodes, making the intellectual connections between research and pedagogy visible. Multiple entry points, no hierarchy.

### Data Sources

**Projects cluster** — Liquid template iterates `site.pages` where `project: true`, same mechanism as `projects/index.md`. Each project becomes a node; its `tags` array generates edges to tag nodes.

**Teaching cluster** — `site.data.teaching_graph` provides:
- Teaching Statement
- ENC 1101 → SLOs → lectures
- ENC 1102 → SLOs → Summer 26 semester → lectures, AI Policy, Syllabus
- Interdisciplinary Teaching → components
- Course Syllabi, DIY Zine Library

### Bridge Nodes (cross-domain links)

These project tag nodes gain explicit edges into the teaching cluster, creating rhizomatic cross-connections between the two domains:

| Bridge node | Projects side | Teaching side |
|---|---|---|
| `critical-making` | Projects tagged `critical-making` | Interdisciplinary Teaching node |
| `theories` | Projects tagged `theories` | Interdisciplinary Teaching node |
| `pedagogy` | Ziner, ePortfolio Resources, Interviews | Teaching Statement |
| `composition` | Ziner, ePortfolio Resources | ENC 1101, ENC 1102 |
| `teaching` | Interdisciplinary Teaching project | Teaching Statement |

Bridge links are hard-coded in the JS initialization (they span two data sources and cannot be derived automatically).

### Node Types and Visual Vocabulary

Inherits color/size vocabulary from both existing graphs, extended for new types:

| Type | Color | Radius | Examples |
|---|---|---|---|
| `project` | rgb(122, 6, 97) purple | 12 | SMT, Ulster Cycle, Ziner |
| `tag` | rgb(6, 97, 122) teal | 8 | data-visualization, generative |
| `course-tag` (bridge) | rgb(170, 110, 0) amber | 10 | critical-making, theories, pedagogy |
| `course` | rgb(6, 122, 97) green | 12 | ENC 1101, ENC 1102 |
| `grad-course` | rgb(97, 6, 122) violet | 11 | Interdisciplinary Teaching |
| `slo` | rgb(97, 122, 6) olive | 9 | Writing Processes, Revision |
| `lecture` | rgb(6, 97, 122) blue | 8 | Discourse Communities, Day 1 |
| `semester` | rgb(97, 6, 122) purple | 10 | Summer 26 |
| `material` | rgb(122, 97, 6) brown | 7 | AI Policy, Syllabus |
| `statement` | rgb(122, 6, 97) purple | 14 | Teaching Statement |

### Interaction

- **Click project/teaching node with URL** → navigate to page
- **Click tag/bridge node** → highlight connected nodes, fade others
- **Click course node** → filter to show course cluster
- **Hover course-tag (bridge) node** → tooltip with description
- **Drag** → reposition node
- **Scroll/pinch** → zoom via d3.zoom
- **Click background** → reset all highlights/filters

### Legend

Updated to include all node types from both merged domains (inherits from both existing legend designs).

### Physics Parameters

With ~60+ nodes, forces are tuned between the two existing graph configs to prevent both over-compression and drift:

- Link distance: 100
- Charge strength: -300
- Collision radius: 30
- Centering force: x/y strength ~0.01 (prevents complete drift without creating a hierarchical pull)

### Implementation Notes

- All script code lives in `index.md` — no new files
- Liquid template builds project nodes from `site.pages`; teaching nodes built from `site.data.teaching_graph`
- Bridge links are a hard-coded JS array appended to the links array before simulation
- Graph height: 60vh, min 450px, max 700px — slightly taller than the project graph to accommodate additional nodes
- `project: true` front matter is required on all project pages for graph inclusion; wiring in untracked pages (Part 1) feeds directly into this

---

## Out of Scope

- `projects/combat/` — excluded per user request
- AI chapter contribution to *ePortfolios: A Guide for Writers* — still under review, not yet on portfolio
- KLF-1 and KLF-2 lectures (`teaching/lectures/s26/klf-1.html`, `klf-2.html`) exist on disk and in the teaching nav but are absent from `_data/teaching_graph.yml` — adding them is part of the teaching audit but not strictly required for the DEC application scope; defer to a later pass
