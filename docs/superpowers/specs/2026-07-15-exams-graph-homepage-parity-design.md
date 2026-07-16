# Exams Network Graph — Homepage Visual Parity — Design

## Problem

The prior organic-layout fix (spec: `2026-07-15-exams-graph-organic-layout-design.md`) adopted the homepage's force parameters (charge, collision, uniform centering) but the result still doesn't read as the homepage's aesthetic, and unconnected nodes drift far from the graph. Direct code comparison against `index.md` (the homepage graph) turned up four concrete divergences beyond force tuning.

## Root causes

1. **Boxed canvas vs. integrated canvas.** `#exams-canvas` (`phd/exams/index.html:111-117`) has a white background and a `1px solid` border, rendering as a bordered card. The homepage's `#home-graph` has `background: transparent; overflow: visible;` and no border — it sits directly on the page.
2. **Bold/opaque links vs. thin/pale links.** Exams book-links scale stroke-width `1.4–6px` and opacity `0.35–0.9` by shared-citation count (`sharedWidthScale`/`sharedOpacityScale`, lines 805-817, applied at lines 973-974). The homepage's links are a flat `1.5px` at `rgba(122, 6, 97, 0.2)` — much less visually dominant.
3. **Font mismatch.** `.exams-node-label` (line 126) uses `font-family: inherit`. The homepage's `.hg-node-label` explicitly sets `'Courier Prime', monospace`.
4. **Isolated-node drift.** 49 of 89 books have zero transcribed citations — no link force acts on them at all. With only a weak `0.02`-strength uniform centering force (from the prior fix) against `-600` charge repulsion from every other node, they settle far from the connected mass. The homepage has no equivalent — effectively every node there has at least one link pulling it toward the graph.

## Design decisions

### 1. Canvas: match homepage exactly
`#exams-canvas`: remove the border, change `background: #fff` → `background: transparent`, change `overflow: hidden` → `overflow: visible`.

### 2. Links: flatten to homepage's fixed style
Per explicit user choice, drop the shared-citation-count visual encoding entirely rather than just narrowing its range. `.exams-link` gets a fixed `stroke-width: 1.5; stroke-opacity: 0.2;` in CSS (matching the homepage's `1.5px` / `0.2` opacity exactly; color stays the existing `rgb(122, 6, 97)`). The per-edge `.attr('stroke-width', ...)` / `.attr('stroke-opacity', ...)` calls (lines 973-974) are removed, and the now-unused `sharedWidthScale`, `sharedOpacityScale`, and `updateSharedScales()` are deleted along with their two call sites (lines 888, 1075). The underlying `sharedCount` data on each edge is untouched — it still feeds the Citation Matrix view and the detail-panel "shared ×N" badge, both unrelated to this graph's link rendering.

`.exams-link-cite` (the citation-hub link style — a different color/semantic, not part of the shared-count encoding) is untouched.

### 3. Labels: match homepage's font
`.exams-node-label`'s `font-family: inherit` → `'Courier Prime', monospace`, matching `.hg-node-label` exactly. The floating tooltip (`.exams-tooltip`) is a different UI element with no homepage equivalent and is not changed.

### 4. Isolated nodes: degree-based centering strength
Replace the uniform `0.02` centering strength (both `x` and `y` forces) with a function that gives degree-0 nodes a firmer pull: `0.15` for nodes with `degree[d.id] === 0`, `0.02` otherwise (unchanged for every connected node). `0.15` reuses the exact magnitude the old (now-removed) category-clustering force used for books, a known-working value for "converge firmly without fully pinning" in this codebase. `degree` is the existing module-level map populated by `recomputeDegree()`; since `rebuildAndRestart()` already calls `recomputeDegree()` before `sim.nodes(allNodes())`, and `d3-force`'s `simulation.nodes()` re-initializes every currently-attached force (including `x`/`y`) against the new node array, the strength function is automatically re-evaluated with fresh degree values on every filter/slider-triggered rebuild — no additional call site needs to change.

## Explicitly out of scope

- No changes to `_data/exams.json`.
- No changes to node radius/color, the hub-diamond rendering, hover/click labels, click-to-highlight, the auto-fit zoom (already matches homepage per the prior fix), or any control/slider/legend markup.
- `.exams-link-cite` styling (citation-hub links) is untouched — it's a distinct visual category, not part of the shared-citation-count encoding being flattened.
- No change to charge (`-600`) or collision (`+28`) — those already match the homepage per the prior fix.

## Files touched

- `phd/exams/index.html` — all changes are within this single file (CSS and script only).
