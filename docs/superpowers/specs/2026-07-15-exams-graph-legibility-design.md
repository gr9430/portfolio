# Exams Network Graph Legibility Fix — Design

## Problem

The PhD exams Network Graph (`phd/exams/index.html`) has become unreadable as the underlying data has grown from a handful of transcribed books to 89 books (40 with citations transcribed, up to 630 citations on a single book) and 12,000+ distinct citation dictionary entries. Nodes overlap on top of each other, always-on text labels collide into an unreadable smear, and lines cross so densely that individual relationships can't be traced.

## Root causes

1. **Hub-promotion threshold is dead code at this scale.** `establishedKeys()` promotes a citation to its own diamond-shaped hub node when it's shared by `ceil(30% × populatedBookCount)` books. With `populatedBookCount` now 40, that threshold is 12+ shared books — but the most any citation is actually shared is 8. The condition never fires, so every shared citation instead draws a direct line between *every pair* of citing books (a citation shared by 7 books produces 21 crossing lines instead of 1 hub + 7 spokes).
2. **Labels are always-on for every node**, positioned just above each circle, truncated to 24 characters. With 89+ nodes this is the single biggest source of visual clutter — text collides far more than the circles themselves.
3. **The simulation's coordinate space is tied to the rendered container size** (`W()`/`H()` read `#exams-canvas`'s actual pixel dimensions, a fixed 640px-tall box). 57 Core-category books alone, pulled toward one narrow horizontal band by the category-clustering force, works out to ~11px of average vertical space per node — less than even the smallest node's diameter. No amount of collision-force tuning can resolve this within the existing box; there simply isn't room.
4. **Publisher-sharing drifts books together with no visual explanation on the canvas itself** (no line is drawn, only a positional pull), adding an invisible force fighting for space alongside everything else, for a relationship that's secondary to the graph's main subject (shared citations).
5. **No way to isolate a node's neighborhood.** `neighborSets` (per-node connection lists) is already computed for node sizing but never used to let a viewer focus on one node's relationships and quiet everything else — which is the fastest way to make a dense graph legible on demand.

## Design decisions

### 1. Hub threshold: percentage → raw shared-book count
Replace `establishedKeys()`'s percentage-of-populated-books math with a raw count comparison, matching the pattern the existing "Min Shared Citations" slider already uses successfully. Rescale the "Recommended Threshold" slider from 5–60% (step 5) to a raw count, range 2–10 (step 1), default **4** (~39 hub nodes at current data — roughly on par with the book-node count, so hubs don't overwhelm the graph either). This is a count, not a percentage, so it'll still need occasional bumping as more books get transcribed and shared-citation counts climb — but far less often, since raw counts grow much slower than the percentage's denominator did.

Distribution at time of writing, for reference:
| min shared books | citations promoted to hubs |
|---|---|
| ≥2 | 493 |
| ≥3 | 107 |
| ≥4 | 39 |
| ≥5 | 15 |
| ≥6 | 6 |

### 2. Labels: always-on → hover/click-only
Every node (book or hub) starts with no visible label. Hovering or clicking a node reveals its title (reusing the existing tooltip-on-hover and detail-panel-on-click mechanisms already in place). Circles/diamonds remain colored by category and sized by connection count, so the graph still reads as a shape/color/cluster pattern at a glance — titles come from interacting with it.

### 3. Layout engine: homepage-style decoupled canvas + auto-fit zoom
Adopt the pattern already proven on the homepage graph (`index.md`):
- The simulation runs in a large, fixed logical coordinate space (e.g. on the order of 1600×1400, tuned during implementation to what the category-band layout actually needs) independent of `#exams-canvas`'s rendered pixel size. The SVG uses a `viewBox` so it scales visually to fit its container, but the force layout itself always has real room to resolve overlaps.
- On `simulation.on('end', ...)`, compute the bounding box of all node positions and animate the existing zoom behavior to frame the whole graph with padding, the same way the homepage graph does. This replaces manually sizing the visible container to match the data.
- Collision force padding/strength increased so circles keep a visible gap rather than just barely not touching (homepage uses `nodeRadius(d) + 28`; exams currently uses `+ 8` — tune during implementation, doesn't need to match exactly).

Category-band clustering (Core/Primary/Secondary/Independent Study as four columns via `categoryXTarget`) is **kept as-is** — it's a meaningful organizing structure for this dataset and is orthogonal to the overlap problem, which is about available room and force strength, not the banding itself.

### 4. Remove publisher-sharing from the graph model
Publisher-sharing currently contributes to three things; all three are removed:
- `publisherEdges` fed into `d3.forceLink` (the positional drift) — **removed**.
- `publisherEdges` folded into `recomputeDegree()`'s `neighborSets`, which drives node radius — **removed**; node size reflects citation-sharing only.
- (Implicitly, once neighborhood-highlight is added per #5) publisher relationships would not appear in the "connected nodes" highlight — **confirmed out of scope for highlighting**.

Kept as-is (informational only, not part of the force layout): the "Rank publishers by book count" toggle list, and each book's detail-panel "Publisher: X (shared with N books)" line.

### 5. Click-to-highlight-neighborhood
Clicking a node dims every node and link except that node and its direct connections (opacity drop, not removal — same interaction pattern as the homepage graph's topic-node click handler). Clicking empty canvas space, or the already-highlighted node again, restores full opacity. This uses the `neighborSets` data structure that already exists in the codebase for node sizing.

Note: the existing click behavior on book nodes opens the detail panel; hub nodes open the citation panel. Highlighting needs to compose with that (e.g., both things happen on click — panel opens *and* neighborhood highlights), not replace it.

### 6. Text updates
- Intro paragraph (`phd/exams/index.html` line 9): remove the "Books that share a publisher aren't linked with a line, but drift toward each other in the layout" sentence; add a short note that hovering/clicking a node reveals its title.
- Legend "Node size" line: remove "or publisher" (becomes "shared citation" only).

## Explicitly out of scope

- The Reading List and Citation Matrix views are untouched.
- The 49 books with zero transcribed citations still render as isolated nodes in their category band — this was raised and deliberately deferred; it's a separate question about what the graph represents, not part of this legibility fix.
- No changes to the underlying `_data/exams.json` data model.

## Files touched

- `phd/exams/index.html` — all changes are within this single file (script, styles, and the intro/legend markup near the top).
