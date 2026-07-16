# Exams Network Graph Homepage Visual Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining aesthetic and layout gap between the exams graph and the homepage graph it's modeled on: transparent/borderless canvas, flat thin links, matching label font, and a fix for isolated (zero-citation) nodes drifting far from the graph.

**Architecture:** All changes are within the single file `phd/exams/index.html` (inline `<style>` and `<script>` blocks). No changes to `_data/exams.json` or the Jekyll templating layer. Two independent parts: (1) visual parity — canvas background/border/overflow, link styling, label font, and removal of the now-obsolete shared-citation-count link encoding; (2) a degree-based centering-force strength so nodes with zero links (49 of 89 books) get pulled toward the graph instead of drifting to the edges under strong repulsion.

**Tech Stack:** D3.js v7 (already loaded via CDN in the page), vanilla JS (IIFE), no build step — Jekyll serves the file as-is.

## Global Constraints

- All edits are in `phd/exams/index.html`. No other file changes.
- `#exams-canvas`: no border, `background: transparent`, `overflow: visible` (matching homepage's `#home-graph`).
- `.exams-node-label`: `font-family: 'Courier Prime', monospace` (matching homepage's `.hg-node-label`). No other property in this rule changes.
- `.exams-link`: fixed `stroke-width: 1.5; stroke-opacity: 0.2;` (matching the homepage's flat `1.5px` / `0.2` opacity links). The shared-citation-count encoding (`sharedWidthScale`, `sharedOpacityScale`, `updateSharedScales()`) is deleted entirely, along with its two call sites — this was an explicit user choice (flatten, don't just narrow the range).
- `sharedCount` itself (the underlying per-edge data) is NOT touched — it still feeds the Citation Matrix view and the detail-panel "shared ×N" badge, both outside this plan's scope.
- `.exams-link-cite` (citation-hub link styling) is untouched — different visual category, not part of the encoding being removed.
- Centering force: `x`/`y` strength becomes a function `centerStrength(d)` returning `0.15` when `degree[d.id]` is `0` (or missing), `0.02` otherwise — replacing the flat `0.02` on both forces. `degree` is the existing module-level map populated by `recomputeDegree()`, which already runs before both the initial sim construction and every `rebuildAndRestart()` call, so no additional recompute call is needed.
- No changes to charge (`-600`), collision (`+28`), the auto-fit zoom, hover/click labels, click-to-highlight, or any control/slider/legend markup.
- No automated test suite exists for this file (client-rendered D3, no build step). Each task's verification is: (a) `bundle exec jekyll build` succeeds with no new errors (the pre-existing `slieve-gullion` destination-conflict warning is unrelated and expected), (b) a Node.js syntax check on the extracted inline script, (c) `grep` checks confirming the expected strings changed. No browser automation tool is available in any implementer's environment — visual confirmation requires the user, and must be reported honestly as "not independently visually verified" if no browser tool is available.

The syntax-check pipeline (run this after every task's edits — confirmed working against the current file):
```bash
sed -n '/^<script>$/,/^<\/script>$/p' phd/exams/index.html | \
  grep -v '^<script>$' | grep -v '^</script>$' | \
  sed '1,2d' | sed '1i const EXAMS_DATA = {}; const EXAMS_VOCAB = {};' \
  > /tmp/exams-script-check.js
node --check /tmp/exams-script-check.js
```
Expect no output (syntax OK).

---

### Task 1: Visual parity — canvas, links, font, and removal of the shared-count link encoding

**Files:**
- Modify: `phd/exams/index.html` (CSS ~lines 111-137, script ~lines 805-818, ~888, ~973-974, ~1075)

**Interfaces:**
- Consumes: nothing from any prior task.
- Produces: nothing consumed by Task 2 (independent change — different lines, no shared identifiers). `currentBookEdges()` (untouched by this task, only its neighboring `updateSharedScales()` is deleted) continues to be used by Task 2's `centerStrength()` indirectly via `degree`, but there's no direct code dependency between the two tasks.

- [ ] **Step 1: Transparent, borderless, unclipped canvas**

Find:
```css
#exams-canvas {
  position: relative;
  width: 100%;
  height: 900px;
  border: 1px solid rgba(122, 6, 97, 0.2);
  background: #fff;
  overflow: hidden;
}
```
Replace with:
```css
#exams-canvas {
  position: relative;
  width: 100%;
  height: 900px;
  background: transparent;
  overflow: visible;
}
```

- [ ] **Step 2: Match the homepage's label font**

Find:
```css
.exams-node-label {
  font-family: inherit;
  font-size: 9px;
  fill: #555;
  pointer-events: none;
  text-anchor: middle;
  opacity: 0;
  transition: opacity 0.12s ease;
}
```
Replace with:
```css
.exams-node-label {
  font-family: 'Courier Prime', monospace;
  font-size: 9px;
  fill: #555;
  pointer-events: none;
  text-anchor: middle;
  opacity: 0;
  transition: opacity 0.12s ease;
}
```

- [ ] **Step 3: Flatten book-link styling to the homepage's fixed values**

Find:
```css
.exams-link {
  stroke: rgb(122, 6, 97);
}
```
Replace with:
```css
.exams-link {
  stroke: rgb(122, 6, 97);
  stroke-width: 1.5;
  stroke-opacity: 0.2;
}
```

- [ ] **Step 4: Remove the per-edge stroke-width/opacity attrs (now redundant with the CSS fixed values)**

Find, inside `redrawGraph()`:
```js
    link = linkLayer.selectAll('line').data(currentBookEdges()).join('line')
      .attr('class', 'exams-link')
      .attr('stroke-width', d => sharedWidthScale(d.sharedCount))
      .attr('stroke-opacity', d => sharedOpacityScale(d.sharedCount));
```
Replace with:
```js
    link = linkLayer.selectAll('line').data(currentBookEdges()).join('line')
      .attr('class', 'exams-link');
```

- [ ] **Step 5: Delete the now-unused shared-citation-count scales**

Find:
```js
  let sharedWidthScale = d3.scaleLinear().domain([1, 1]).range([1.4, 1.4]);
  let sharedOpacityScale = d3.scaleLinear().domain([1, 1]).range([0.4, 0.4]);

  function currentBookEdges() {
    return bookEdges.filter(e => e.sharedCount >= minSharedThreshold);
  }

  function updateSharedScales(edges) {
    const counts = edges.map(e => e.sharedCount);
    const minC = counts.length ? Math.min(...counts) : 1;
    const maxC = counts.length ? Math.max(...counts) : 1;
    sharedWidthScale = d3.scaleLinear().domain([minC, maxC]).range([1.4, 6]).clamp(true);
    sharedOpacityScale = d3.scaleLinear().domain([minC, maxC]).range([0.35, 0.9]).clamp(true);
  }

```
Replace with:
```js
  function currentBookEdges() {
    return bookEdges.filter(e => e.sharedCount >= minSharedThreshold);
  }

```
(This deletes `sharedWidthScale`, `sharedOpacityScale`, and `updateSharedScales()` entirely, but keeps `currentBookEdges()` — a different, still-needed function — untouched.)

- [ ] **Step 6: Remove the `updateSharedScales()` call at initial setup**

Find:
```js
  updateSharedScales(currentBookEdges());
  recomputeDegree();
```
Replace with:
```js
  recomputeDegree();
```

- [ ] **Step 7: Remove the `updateSharedScales()` call in `rebuildAndRestart()`**

Find:
```js
  function rebuildAndRestart() {
    rebuildCitationGraph();
    updateSharedScales(currentBookEdges());
    recomputeDegree();
```
Replace with:
```js
  function rebuildAndRestart() {
    rebuildCitationGraph();
    recomputeDegree();
```

- [ ] **Step 8: Verify**

```bash
bundle exec jekyll build
```
Expect: build completes with no new errors.

Run the syntax-check pipeline from the Global Constraints section. Expect no output (syntax OK).

Then confirm the specific changes landed:
```bash
grep -n "sharedWidthScale\|sharedOpacityScale\|updateSharedScales" phd/exams/index.html   # expect no matches
grep -c "border: 1px solid rgba(122, 6, 97, 0.2)" phd/exams/index.html   # expect 0
grep -n "background: transparent" phd/exams/index.html
grep -n "overflow: visible" phd/exams/index.html
grep -n "font-family: 'Courier Prime', monospace" phd/exams/index.html
grep -n "stroke-width: 1.5;" phd/exams/index.html
grep -n "stroke-opacity: 0.2;" phd/exams/index.html
grep -n "sharedCount" phd/exams/index.html   # expect several matches still (Citation Matrix + detail panel badge + edge construction — unaffected by this task)
```

- [ ] **Step 9: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: match homepage canvas, link, and label styling"
```

---

### Task 2: Degree-based centering strength for isolated nodes

**Files:**
- Modify: `phd/exams/index.html` (script ~lines 902-914)

**Interfaces:**
- Consumes: existing module-level `degree` map (populated by `recomputeDegree()`, which already runs before this task's `centerStrength()` is ever evaluated — both at initial sim construction and on every `rebuildAndRestart()`).
- Produces: `centerStrength(d)` function. Nothing later in the file depends on this by name.

- [ ] **Step 1: Add a degree-based centering-strength function and use it for both the x and y forces**

Find:
```js
  function currentForce() { return +document.getElementById('exams-force-slider').value; }

  const sim = d3.forceSimulation(allNodes())
    .force('link', d3.forceLink(currentBookEdges()).id(d => d.id).distance(currentDistance()).strength(0.4))
    .force('linkCite', d3.forceLink(citeEdges).id(d => d.id).distance(currentDistance()).strength(0.5))
    .force('charge', d3.forceManyBody().strength(currentForce()))
    .force('center', d3.forceCenter(W() / 2, H() / 2))
    .force('collision', d3.forceCollide(d => nodeRadius(d.id) + 28))
    .force('x', d3.forceX(SIM_W / 2).strength(0.02))
    .force('y', d3.forceY(SIM_H / 2).strength(0.02));
```
Replace with:
```js
  function currentForce() { return +document.getElementById('exams-force-slider').value; }
  function centerStrength(d) { return (degree[d.id] || 0) === 0 ? 0.15 : 0.02; }

  const sim = d3.forceSimulation(allNodes())
    .force('link', d3.forceLink(currentBookEdges()).id(d => d.id).distance(currentDistance()).strength(0.4))
    .force('linkCite', d3.forceLink(citeEdges).id(d => d.id).distance(currentDistance()).strength(0.5))
    .force('charge', d3.forceManyBody().strength(currentForce()))
    .force('center', d3.forceCenter(W() / 2, H() / 2))
    .force('collision', d3.forceCollide(d => nodeRadius(d.id) + 28))
    .force('x', d3.forceX(SIM_W / 2).strength(centerStrength))
    .force('y', d3.forceY(SIM_H / 2).strength(centerStrength));
```

Note: `degree` (declared elsewhere in the file as `let degree = {}`, populated by `recomputeDegree()`) is read by `centerStrength()` at the moment D3 initializes the `x`/`y` forces — this happens once when `const sim = d3.forceSimulation(...)` first runs, and again every time `rebuildAndRestart()` calls `sim.nodes(allNodes())` (d3-force re-initializes every attached force, including `x`/`y`, whenever `.nodes()` is called). `rebuildAndRestart()` already calls `recomputeDegree()` before `sim.nodes(allNodes())`, so `centerStrength()` always sees up-to-date degree values on every rebuild — no extra call site needs to be added or changed for this to work correctly.

- [ ] **Step 2: Verify**

```bash
bundle exec jekyll build
```
Expect: build completes with no new errors.

Run the syntax-check pipeline from the Global Constraints section. Expect no output (syntax OK).

Then confirm the specific changes landed:
```bash
grep -n "function centerStrength" phd/exams/index.html
grep -c "strength(centerStrength)" phd/exams/index.html   # expect 2 (x and y forces)
grep -n "strength(0.02))" phd/exams/index.html   # expect no matches (both replaced)
```

- [ ] **Step 3: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: stronger centering pull for isolated (zero-citation) nodes"
```

---

### Task 3: Manual visual QA

**Files:** none (verification only).

**Interfaces:** consumes the fully assembled result of Tasks 1-2.

- [ ] **Step 1: Build and serve**

```bash
bundle exec jekyll build
```
If a `jekyll serve` process is already running against this working tree, it will pick up the change automatically; otherwise start one.

- [ ] **Step 2: Curl-based structural sanity check**

```bash
curl -s http://127.0.0.1:4000/phd/exams/ | grep -c "exams-node-label"
curl -s http://127.0.0.1:4000/phd/exams/ | grep -o "Courier Prime"
```
Confirms the rendered page includes the updated static scaffolding. The actual D3-rendered SVG content and force-simulation output only exist after client-side JS runs, so this only verifies the page loads with the right static shell — not the rendered graph itself.

- [ ] **Step 3: Visual confirmation**

The core question this plan set out to answer — does the graph now read visually like the homepage graph, and do isolated books stay reasonably close to the rest of the graph — can only be verified by loading the page in a browser. There is no automated way to check this from the command line. If this task is executed by an agent without browser access, it must report that visual verification was **not** performed and ask the user to check:
- The canvas has no visible border or white box background — the graph sits directly on the page, like the homepage graph.
- Links are thin and pale, not bold/saturated — no line should visually dominate over the nodes.
- Node labels (on hover/click) render in the same monospace font as the homepage graph's labels.
- Books with zero citations are visibly closer to the main graph body than before — not scattered far off toward the canvas edges — while still not perfectly overlapping the connected cluster.
- The existing hover/click label behavior, click-to-highlight, and auto-fit zoom (from prior fixes, untouched by this plan) still work correctly.

- [ ] **Step 4: Report**

Summarize what was verified programmatically vs. what needs the user's visual confirmation. Do not claim the graph "looks correct" without either browser access or explicit user confirmation. If the user reports the isolated-node distance is still too large or too clustered, the tunable value is `centerStrength()`'s `0.15` constant (`phd/exams/index.html`, added in Task 2) — raise it for a tighter pull, lower it for a looser one.
