# Exams Network Graph — Organic Layout (Homepage Schema) — Design

## Problem

The previous legibility fix (spec: `2026-07-15-exams-graph-legibility-design.md`) fixed the dead hub threshold, publisher-drift clutter, always-on labels, and the cramped coordinate space — but kept category-band clustering (`categoryXTarget`) at the user's explicit earlier request. After seeing the result, that decision didn't hold up: the category system still pulls every node toward a single X coordinate per category (not a band — a point), and with 57 Core-category books alone competing for that one X value, they still stack into a dense, hard-to-read column regardless of how much total canvas space exists. Enlarging the coordinate space and increasing collision padding couldn't fix a problem caused by a force actively fighting collision to compress nodes into a column.

The user's homepage graph (`index.md`) has no type-based position targeting at all: project/course/tag type is expressed only as node color, and position is left entirely to link topology, strong mutual repulsion, and generous collision — producing an organically spread, legible layout. The user asked the exams graph to follow that same schema.

## Root cause

`phd/exams/index.html`:
- `categoryXTarget(d)` (line 725-729) returns a single target X coordinate per category (`CATEGORY_X_FRACTION`, line 722), and `.force('x', d3.forceX(categoryXTarget).strength(xStrength))` (line 921) pulls every node toward it with `xStrength` 0.15 for books (line 913) — a strong, per-node-type convergence force.
- This runs alongside `.force('y', d3.forceY(H() / 2).strength(0.06))` (line 922), a much weaker, uniform Y-centering force — so nodes are tightly bound in X but loosely bound in Y, producing a dense vertical column per category.
- The default charge repulsion (`-250`, the "Repel Force" slider's default, line 637) and collision padding (`+16`, three call sites from the prior fix) are both weaker than the homepage graph's equivalents (`-600` fixed charge, `+28` collision padding) — under-powered to counteract the categoryXTarget convergence even before considering that the convergence force itself is the primary problem.

## Design decision

Adopt the homepage's force-layout schema exactly, per the user's explicit choice (category becomes color-only, fully organic position — no positional hint):

1. **Remove category-to-position mapping entirely.** Delete `categoryXTarget()` and `CATEGORY_X_FRACTION`. Category continues to be expressed as node color and split-ring rendering (`CATEGORY_PIE`, unaffected — purely visual) and as a filter (`activeCategories`, unaffected — visibility only, not position).
2. **Replace the per-category X force and the fixed-Y force with homepage-style uniform weak centering on both axes:** `.force('x', d3.forceX(SIM_W / 2).strength(0.02))` and `.force('y', d3.forceY(SIM_H / 2).strength(0.02))`, at all 1 call site (initial sim setup — there's no separate rebuild-time re-application of `.force('x'/'y', ...)` elsewhere in the file, since `rebuildAndRestart()` doesn't touch those two forces).
3. **Match the homepage's spacing intensity:**
   - Collision padding `+16` → `+28` at all 3 existing call sites (the same three the prior task touched: initial sim setup, `rebuildAndRestart()`, size-slider handler).
   - "Repel Force" slider default `-250` → `-600` (already within the slider's existing `-600`–`-50` range — a default-value change only) at all 3 places the value currently appears: the initial `d3.forceManyBody().strength(currentForce())` reads the slider's HTML `value` attribute, so that attribute changes; the "Clear filters" reset block's `sim.force('charge', ...)` call and its slider `.value`/`textContent` reset.
4. **No changes to:** `SIM_W`/`SIM_H` (1800×1600 — aspect ratio close enough to the homepage's 1080×900 that resizing isn't warranted for this change), the auto-fit zoom, hover/click labels, click-to-highlight, hub threshold, publisher removal, or any copy — all orthogonal and already correct from the prior fix.

## Explicitly out of scope

- No changes to `_data/exams.json`.
- No changes to the Reading List or Citation Matrix views.
- No changes to `SIM_W`/`SIM_H`, node radius scale, link distance default, or any UI control not named above.
- The 49 zero-citation books remain visible as isolated nodes (unchanged from the prior fix) — with category no longer pulling them into position, they'll now be positioned purely by charge/collision against the rest of the graph, same as every other node.

## Files touched

- `phd/exams/index.html` — all changes are within this single file (script only; no CSS or markup changes required).
