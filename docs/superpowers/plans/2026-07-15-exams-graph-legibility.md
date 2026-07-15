# Exams Network Graph Legibility Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the PhD exams Network Graph so nodes and relationships are legible again at current data scale (89 books, 40 transcribed, up to 630 citations per book).

**Architecture:** All changes are within the single file `phd/exams/index.html` (inline `<style>` and `<script>` blocks). No changes to `_data/exams.json` or the Jekyll templating layer. The fix combines five independent behavior changes: (1) decouple the D3 force simulation's coordinate space from the visible container size and auto-fit the view once the layout settles, modeled on the existing homepage graph in `index.md`; (2) remove publisher-sharing from the force layout, node sizing, and neighbor data entirely; (3) replace the dead percentage-based "recommended" threshold with a raw shared-book-count threshold; (4) make node labels hover/click-only instead of always-on, and add click-to-highlight-neighborhood; (5) update the intro/legend copy to match.

**Tech Stack:** D3.js v7 (already loaded via CDN in the page), vanilla JS (IIFE), no build step — Jekyll serves the file as-is.

## Global Constraints

- All edits are in `phd/exams/index.html`. No other file changes.
- Simulation logical coordinate space: `SIM_W = 1800`, `SIM_H = 1600` (constants, replacing the current container-size-based `W()`/`H()`).
- Visible canvas height: `640px` → `900px` (`#exams-canvas` CSS rule).
- Collision force padding: `+8` → `+16` (both occurrences: initial sim setup and `rebuildAndRestart`'s `sim.force('collision', ...)` call; the size-slider's collision update at the bottom of the file gets the same `+16`).
- Recommended-threshold slider: percentage (5–60, step 5, default 30) → raw count (2–10, step 1, default 4).
- Focus-highlight dim opacity: non-neighbor nodes `0.12`, non-adjacent links `0.05` (restored to `1`/`null` respectively on clear).
- No automated test suite exists for this file (client-rendered D3, no build step). Each task's verification is: (a) `bundle exec jekyll build` succeeds with no new errors, (b) a Node.js syntax check on the extracted inline script (Liquid-templated data lines stubbed out), (c) `grep`/`curl` checks confirming the expected strings changed. Final visual confirmation happens in Task 6 against a running `jekyll serve`, and is reported honestly as "not independently visually verified by the agent" if no browser tool is available in that task's execution context.

---

### Task 1: Decoupled simulation coordinate space + auto-fit zoom on settle

**Files:**
- Modify: `phd/exams/index.html` (CSS ~line 111–118, script ~lines 914–932, ~1013–1019, ~1622–1626)

**Interfaces:**
- Produces: `SIM_W`, `SIM_H` constants; a named `zoomBehavior` variable (previously an inline anonymous `d3.zoom()` call); an `sim.on('end', ...)` auto-fit handler.
- Consumes: existing `sim`, `svg`, `g`, `allNodes()`.

- [ ] **Step 1: Increase the visible canvas height**

In the `<style>` block, find:
```css
#exams-canvas {
  position: relative;
  width: 100%;
  height: 640px;
  border: 1px solid rgba(122, 6, 97, 0.2);
  background: #fff;
  overflow: hidden;
}
```
Change `height: 640px;` to `height: 900px;`.

- [ ] **Step 2: Add SIM_W/SIM_H constants and give the SVG a viewBox**

Find:
```js
  const svg = d3.select('#exams-svg');
  const g = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => g.attr('transform', e.transform)));

  function W() { return document.getElementById('exams-canvas').clientWidth; }
  function H() { return document.getElementById('exams-canvas').clientHeight; }
```
Replace with:
```js
  const SIM_W = 1800;
  const SIM_H = 1600;

  const svg = d3.select('#exams-svg').attr('viewBox', `0 0 ${SIM_W} ${SIM_H}`);
  const g = svg.append('g');
  const zoomBehavior = d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => g.attr('transform', e.transform));
  svg.call(zoomBehavior);

  function W() { return SIM_W; }
  function H() { return SIM_H; }
```

- [ ] **Step 3: Bump collision padding to +16 (three call sites)**

There are three identical-shaped lines to update — the initial sim setup, `rebuildAndRestart()`, and the size-slider's `input` handler. In each, change `d3.forceCollide(d => nodeRadius(d.id) + 8)` to `d3.forceCollide(d => nodeRadius(d.id) + 16)`.

Initial setup (part of the `d3.forceSimulation(...)` chain):
```js
    .force('collision', d3.forceCollide(d => nodeRadius(d.id) + 8))
```
→
```js
    .force('collision', d3.forceCollide(d => nodeRadius(d.id) + 16))
```

`rebuildAndRestart()`:
```js
    sim.force('collision', d3.forceCollide(d => nodeRadius(d.id) + 8));
```
→
```js
    sim.force('collision', d3.forceCollide(d => nodeRadius(d.id) + 16));
```

Size slider handler:
```js
    sim.force('collision', d3.forceCollide(d => nodeRadius(d.id) + 8));
```
(this is the third, separate occurrence, inside `document.getElementById('exams-size-slider').addEventListener(...)`) →
```js
    sim.force('collision', d3.forceCollide(d => nodeRadius(d.id) + 16));
```

- [ ] **Step 4: Add auto-fit-zoom on simulation settle**

Find the existing tick handler:
```js
  sim.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    citeLink.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nodeG.attr('transform', d => `translate(${d.x},${d.y})`);
  });
```
Immediately after it, add:
```js

  sim.on('end', () => {
    const ns = allNodes().filter(d => typeof d.x === 'number' && typeof d.y === 'number');
    if (!ns.length) return;
    const pad = 60;
    const x0 = Math.min(...ns.map(d => d.x)) - pad;
    const x1 = Math.max(...ns.map(d => d.x)) + pad;
    const y0 = Math.min(...ns.map(d => d.y)) - pad;
    const y1 = Math.max(...ns.map(d => d.y)) + pad;
    const scale = Math.max(0.3, Math.min(SIM_W / (x1 - x0), SIM_H / (y1 - y0), 3));
    const tx = (SIM_W - scale * (x0 + x1)) / 2;
    const ty = (SIM_H - scale * (y0 + y1)) / 2;
    svg.transition().duration(750)
      .call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  });
```

- [ ] **Step 5: Remove the now-pointless resize listener**

`W()`/`H()` now return fixed constants instead of reading the container's rendered pixel size, so the resize handler that used to recenter forces on window resize no longer does anything meaningful (`W()/2` and `H()/2` never change). Find and delete:
```js
  window.addEventListener('resize', () => {
    sim.force('center', d3.forceCenter(W() / 2, H() / 2))
       .force('x', d3.forceX(categoryXTarget).strength(xStrength));
    sim.alpha(0.3).restart();
  });
```
Responsive scaling is now handled entirely by the SVG's `viewBox` plus the existing CSS (`#exams-canvas svg { width: 100%; height: 100%; }`), so nothing needs to happen on resize.

- [ ] **Step 6: Verify**

Run:
```bash
bundle exec jekyll build
```
Expect: build completes with no new errors (the pre-existing `slieve-gullion` destination-conflict warning is unrelated and expected).

Then extract and syntax-check the inline script:
```bash
sed -n '/^<script>$/,/^<\/script>$/p' phd/exams/index.html | \
  grep -v '^<script>$' | grep -v '^</script>$' | \
  sed '1,2d' | sed '1i const EXAMS_DATA = {}; const EXAMS_VOCAB = {};' \
  > /tmp/exams-script-check.js
node --check /tmp/exams-script-check.js
```
This extracts both inline `<script>...</script>` blocks (the small Liquid-templated data block and the big D3 IIFE — the CDN `<script src="...">` tag doesn't match the `^<script>$` delimiter since it has an attribute, so it's skipped automatically), strips the literal `<script>`/`</script>` wrapper lines, deletes the first block's two Liquid-templated lines (`const EXAMS_DATA = {{ ... }};` / `const EXAMS_VOCAB = {{ ... }};`), and inserts plain stub declarations in their place so `node --check` can parse the rest — including every later reference to `EXAMS_DATA`/`EXAMS_VOCAB` throughout the real code — as ordinary JS. This exact command was run against the current file while writing this plan and produces no output (syntax OK); expect the same after each task's edits.

Then confirm the specific changes landed:
```bash
grep -n "height: 900px" phd/exams/index.html
grep -n "const SIM_W = 1800" phd/exams/index.html
grep -n "nodeRadius(d.id) + 16" phd/exams/index.html
grep -n "sim.on('end'" phd/exams/index.html
grep -c "nodeRadius(d.id) + 16" phd/exams/index.html   # expect 3
```

- [ ] **Step 7: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: decouple simulation coordinate space, auto-fit zoom on settle"
```

---

### Task 2: Remove publisher-sharing from the graph model

**Files:**
- Modify: `phd/exams/index.html` (script, ~lines 799–932, ~1130–1135)

**Interfaces:**
- Consumes: nothing new from Task 1.
- Produces: `publisherToBooks` remains available (used by the rank-list feature and detail panel — untouched). `publisherEdgeMap`/`publisherEdges` are deleted entirely; later tasks must not reference them.

- [ ] **Step 1: Delete the publisher edge-map construction**

Find:
```js
  const publisherEdgeMap = {};
  Object.keys(publisherToBooks).forEach(pub => {
    const ids = publisherToBooks[pub];
    if (ids.length < 2) return;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const pairKey = [ids[i], ids[j]].sort().join('|||');
        publisherEdgeMap[pairKey] = { source: ids[i], target: ids[j], publisher: pub };
      }
    }
  });
  const publisherEdges = Object.values(publisherEdgeMap);

```
Delete this whole block (including the trailing blank line). Leave the preceding `publisherToBooks` construction untouched.

- [ ] **Step 2: Remove publisher edges from degree/neighbor computation**

Find, inside `recomputeDegree()`:
```js
    addEdges(currentBookEdges());
    addEdges(publisherEdges);
    addEdges(citeEdges);
```
Change to:
```js
    addEdges(currentBookEdges());
    addEdges(citeEdges);
```

- [ ] **Step 3: Remove the publisher force from the initial simulation setup**

Find:
```js
  const sim = d3.forceSimulation(allNodes())
    .force('link', d3.forceLink(currentBookEdges()).id(d => d.id).distance(currentDistance()).strength(0.4))
    .force('linkPublisher', d3.forceLink(publisherEdges).id(d => d.id).distance(currentDistance()).strength(0.4))
    .force('linkCite', d3.forceLink(citeEdges).id(d => d.id).distance(currentDistance()).strength(0.5))
```
Change to:
```js
  const sim = d3.forceSimulation(allNodes())
    .force('link', d3.forceLink(currentBookEdges()).id(d => d.id).distance(currentDistance()).strength(0.4))
    .force('linkCite', d3.forceLink(citeEdges).id(d => d.id).distance(currentDistance()).strength(0.5))
```

- [ ] **Step 4: Remove the publisher force from `rebuildAndRestart()`**

Find:
```js
    sim.force('link', d3.forceLink(currentBookEdges()).id(d => d.id).distance(currentDistance()).strength(0.4));
    sim.force('linkPublisher', d3.forceLink(publisherEdges).id(d => d.id).distance(currentDistance()).strength(0.4));
    sim.force('linkCite', d3.forceLink(citeEdges).id(d => d.id).distance(currentDistance()).strength(0.5));
```
Change to:
```js
    sim.force('link', d3.forceLink(currentBookEdges()).id(d => d.id).distance(currentDistance()).strength(0.4));
    sim.force('linkCite', d3.forceLink(citeEdges).id(d => d.id).distance(currentDistance()).strength(0.5));
```

- [ ] **Step 5: Remove the publisher force from the Link Distance slider handler**

Find:
```js
    sim.force('link', d3.forceLink(bookEdges).id(d => d.id).distance(+this.value).strength(0.4));
    sim.force('linkPublisher', d3.forceLink(publisherEdges).id(d => d.id).distance(+this.value).strength(0.4));
    sim.force('linkCite', d3.forceLink(citeEdges).id(d => d.id).distance(+this.value).strength(0.5));
```
Change to:
```js
    sim.force('link', d3.forceLink(bookEdges).id(d => d.id).distance(+this.value).strength(0.4));
    sim.force('linkCite', d3.forceLink(citeEdges).id(d => d.id).distance(+this.value).strength(0.5));
```

- [ ] **Step 6: Verify**

```bash
bundle exec jekyll build
grep -n "publisherEdges\|publisherEdgeMap\|linkPublisher" phd/exams/index.html
```
Expect: build succeeds; the `grep` returns **no matches** (confirms every reference to the removed force/data is gone). `publisherToBooks` should still be present — confirm with:
```bash
grep -c "publisherToBooks" phd/exams/index.html   # expect several matches (rank list + detail panel + this construction)
```

- [ ] **Step 7: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: remove publisher-sharing from force layout and node sizing"
```

---

### Task 3: Hub threshold — percentage → raw shared-book count

**Files:**
- Modify: `phd/exams/index.html` (HTML controls ~lines 623–627, script ~lines 794–797, 819, 839–842, 1112–1116, 1152–1158)

**Interfaces:**
- Produces: `recoThreshold` (replaces `recoThresholdPercent`), default `4`. Later tasks (5) reference this by name when updating legend copy.
- Consumes: `populatedBookCount` (still computed the same way, just no longer used by `establishedKeys()`).

- [ ] **Step 1: Rename and re-default the threshold variable**

Find:
```js
  let recoThresholdPercent = 30;
  let minSharedThreshold = 2;
```
Change to:
```js
  let recoThreshold = 4;
  let minSharedThreshold = 2;
```

- [ ] **Step 2: Simplify `establishedKeys()` to a raw count comparison**

Find:
```js
  function establishedKeys() {
    const threshold = Math.max(2, Math.ceil((recoThresholdPercent / 100) * populatedBookCount));
    return Object.keys(citationToBooks).filter(k => citationToBooks[k].length >= threshold);
  }
```
Change to:
```js
  function establishedKeys() {
    return Object.keys(citationToBooks).filter(k => citationToBooks[k].length >= recoThreshold);
  }
```

- [ ] **Step 3: Rescale the slider markup**

Find, in the HTML controls section:
```html
      <div class="exams-filter-group">
        <span class="exams-filter-label">Recommended Threshold</span>
        <input type="range" id="exams-reco-slider" min="5" max="60" step="5" value="30">
        <span class="exams-force-value" id="exams-reco-value">30%</span>
      </div>
```
Change to:
```html
      <div class="exams-filter-group">
        <span class="exams-filter-label">Min Shared Books</span>
        <input type="range" id="exams-reco-slider" min="2" max="10" step="1" value="4">
        <span class="exams-force-value" id="exams-reco-value">4</span>
      </div>
```

- [ ] **Step 4: Update the slider's `input` handler**

Find:
```js
  document.getElementById('exams-reco-slider').addEventListener('input', function () {
    recoThresholdPercent = +this.value;
    document.getElementById('exams-reco-value').textContent = recoThresholdPercent + '%';
    rebuildAndRestart();
  });
```
Change to:
```js
  document.getElementById('exams-reco-slider').addEventListener('input', function () {
    recoThreshold = +this.value;
    document.getElementById('exams-reco-value').textContent = recoThreshold;
    rebuildAndRestart();
  });
```

- [ ] **Step 5: Update the "Clear filters" reset block**

Find:
```js
    recoThresholdPercent = 30;
    minSharedThreshold = 2;
```
Change to:
```js
    recoThreshold = 4;
    minSharedThreshold = 2;
```

A few lines further down in the same handler, find:
```js
    document.getElementById('exams-reco-slider').value = 30;
    document.getElementById('exams-reco-value').textContent = '30%';
```
Change to:
```js
    document.getElementById('exams-reco-slider').value = 4;
    document.getElementById('exams-reco-value').textContent = '4';
```

- [ ] **Step 6: Verify**

```bash
bundle exec jekyll build
grep -n "recoThresholdPercent" phd/exams/index.html    # expect no matches
grep -n "recoThreshold = 4\|recoThreshold;" phd/exams/index.html
grep -n 'id="exams-reco-slider" min="2" max="10" step="1" value="4"' phd/exams/index.html
```
Expect: build succeeds, `recoThresholdPercent` no longer appears anywhere, the slider markup shows the new range/default.

- [ ] **Step 7: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: hub-promotion threshold, percentage -> raw shared-book count"
```

---

### Task 4: Hover/click-only labels + click-to-highlight-neighborhood

**Files:**
- Modify: `phd/exams/index.html` (CSS ~line 125–131, script ~lines 950–957, 991–1007)

**Interfaces:**
- Consumes: `neighborSets` (already computed by `recomputeDegree()`, now citation-only per Task 2).
- Produces: `focusedNodeId` state variable, `focusNode(d)` / `clearFocus()` functions. No later task depends on these by name, but Task 6's manual QA should exercise this interaction.

- [ ] **Step 1: Make labels hidden by default in CSS**

Find:
```css
.exams-node-label {
  font-family: inherit;
  font-size: 9px;
  fill: #555;
  pointer-events: none;
  text-anchor: middle;
}
```
Change to:
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

- [ ] **Step 2: Add focus state and helper functions**

Find the state variables:
```js
  const activeCategories = new Set();
  const activeRecoTypes = new Set();
  let showLinks = true;
  let showRecommended = true;
  let showFullField = false;
```
Change to:
```js
  const activeCategories = new Set();
  const activeRecoTypes = new Set();
  let showLinks = true;
  let showRecommended = true;
  let showFullField = false;
  let focusedNodeId = null;

  function focusNode(d) {
    focusedNodeId = d.id;
    const neighbors = neighborSets[d.id] || new Set();
    nodeG.select('.exams-node-label').attr('opacity', n => n.id === d.id ? 1 : 0);
    nodeG.style('opacity', n => n.id === d.id || neighbors.has(n.id) ? 1 : 0.12);
    link.style('opacity', l => (l.source.id === d.id || l.target.id === d.id) ? null : 0.05);
    citeLink.style('opacity', l => (l.source.id === d.id || l.target.id === d.id) ? null : 0.05);
  }

  function clearFocus() {
    focusedNodeId = null;
    nodeG.select('.exams-node-label').attr('opacity', 0);
    nodeG.style('opacity', 1);
    link.style('opacity', null);
    citeLink.style('opacity', null);
  }
```
This must be placed **after** `nodeG`, `link`, and `citeLink` are declared (they're declared with `let` earlier in the file, around line 937–939 — `focusNode`/`clearFocus` read the current value of those `let` bindings each time they're called, so declaration order relative to the *values* doesn't matter, only that the names are in scope, which they are anywhere in this IIFE after line ~939).

- [ ] **Step 3: Reveal/hide labels on hover, unless the node is focused**

Find:
```js
  function nodeMouseOver(e, d) {
    const tt = document.getElementById('exams-tooltip');
    tt.style.display = 'block';
    tt.style.left = (e.clientX + 12) + 'px';
    tt.style.top = (e.clientY - 10) + 'px';
    tt.textContent = d.title;
  }
  function nodeMouseOut() { document.getElementById('exams-tooltip').style.display = 'none'; }
```
Change to:
```js
  function nodeMouseOver(e, d) {
    const tt = document.getElementById('exams-tooltip');
    tt.style.display = 'block';
    tt.style.left = (e.clientX + 12) + 'px';
    tt.style.top = (e.clientY - 10) + 'px';
    tt.textContent = d.title;
    d3.select(e.currentTarget).select('.exams-node-label').attr('opacity', 1);
  }
  function nodeMouseOut(e, d) {
    document.getElementById('exams-tooltip').style.display = 'none';
    if (d.id !== focusedNodeId) {
      d3.select(e.currentTarget).select('.exams-node-label').attr('opacity', 0);
    }
  }
```

- [ ] **Step 4: Wire click to focus the node (in addition to opening its panel), and clear focus on background click**

Find, inside `redrawGraph()`:
```js
        const sel = enter.append('g')
          .style('cursor', 'pointer')
          .call(dragBehavior())
          .on('click', (e, d) => d.nodeType === 'citation' ? openCitationPanel(d) : openPanel(d))
          .on('mouseover', nodeMouseOver)
          .on('mouseout', nodeMouseOut);
```
Change to:
```js
        const sel = enter.append('g')
          .style('cursor', 'pointer')
          .call(dragBehavior())
          .on('click', (e, d) => {
            e.stopPropagation();
            focusNode(d);
            d.nodeType === 'citation' ? openCitationPanel(d) : openPanel(d);
          })
          .on('mouseover', nodeMouseOver)
          .on('mouseout', nodeMouseOut);
```

Then, near where `svg`/`zoomBehavior` are set up (after Task 1's Step 2), add a background-click handler. Find:
```js
  const zoomBehavior = d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => g.attr('transform', e.transform));
  svg.call(zoomBehavior);
```
Change to:
```js
  const zoomBehavior = d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => g.attr('transform', e.transform));
  svg.call(zoomBehavior);
  svg.on('click', () => { if (focusedNodeId) clearFocus(); });
```

Note: `focusNode`/`clearFocus` are defined later in the file (Step 2, near the filter state) but called from inside this `redrawGraph()`/click-handler code, which runs later still (`redrawGraph()` isn't invoked until after all these function declarations have executed). Because `focusNode`/`clearFocus` are `function` declarations (not `const`/arrow functions), they're hoisted within the IIFE and callable from anywhere in it regardless of textual order — no reordering needed.

Known accepted limitation (do not try to fix): if a node is focused and the user then changes a filter/slider that triggers `rebuildAndRestart()` → `redrawGraph()`, the DOM is rejoined and the focus-dim state is not reapplied (the graph returns to full opacity, no label shown). This is acceptable — changing the graph's filters is a reasonable point to drop the current focus.

- [ ] **Step 5: Verify**

```bash
bundle exec jekyll build
grep -n "opacity: 0;" phd/exams/index.html | grep -A1 -B1 exams-node-label
grep -n "function focusNode\|function clearFocus" phd/exams/index.html
grep -n "focusNode(d);" phd/exams/index.html
grep -n "svg.on('click'" phd/exams/index.html
```
Run the same Node.js syntax check as Task 1 Step 6.

- [ ] **Step 6: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: hover/click-only labels, click-to-highlight neighborhood"
```

---

### Task 5: Copy and legend updates

**Files:**
- Modify: `phd/exams/index.html` (intro paragraph line 9, legend markup ~lines 655–664)

**Interfaces:**
- Consumes: nothing (pure text/markup edit); should run after Tasks 2–4 so the copy accurately describes the shipped behavior.

- [ ] **Step 1: Update the intro paragraph**

Find:
```html
<p>My comprehensive exams reading list is organized into four parts: a Core list shared across the whole exam, a Primary list spanning Electronic Literature and Critical Making, a Secondary list spanning Visual Culture and Distant Viewing, and an Independent Study list for additional self-directed reading. Some texts belong to more than one part at once — those nodes show a split ring, one color band per category they belong to. The graph below treats each book as a node and draws a line between any two books that cite the same source. Books that share a publisher aren't linked with a line, but drift toward each other in the layout. A citation shared by enough of the transcribed books gets promoted to its own diamond-shaped node — a rough, bibliometric picture of which texts, presses, and outside sources function as shared infrastructure across fields I'm otherwise treating as distinct.</p>
```
Change to:
```html
<p>My comprehensive exams reading list is organized into four parts: a Core list shared across the whole exam, a Primary list spanning Electronic Literature and Critical Making, a Secondary list spanning Visual Culture and Distant Viewing, and an Independent Study list for additional self-directed reading. Some texts belong to more than one part at once — those nodes show a split ring, one color band per category they belong to. The graph below treats each book as a node and draws a line between any two books that cite the same source. A citation shared by enough of the transcribed books gets promoted to its own diamond-shaped node — a rough, bibliometric picture of which texts, presses, and outside sources function as shared infrastructure across fields I'm otherwise treating as distinct. Node titles are hidden until you hover or click; clicking a node also dims everything except its direct connections, so you can trace one book's or source's relationships without the rest of the graph in the way.</p>
```

- [ ] **Step 2: Update the legend**

Find:
```html
    <div id="exams-legend">
      <span><span class="exams-legend-dot" style="background: rgb(122, 6, 97)"></span>Core</span>
      <span><span class="exams-legend-dot" style="background: rgb(6, 97, 122)"></span>Primary</span>
      <span><span class="exams-legend-dot" style="background: rgb(97, 122, 6)"></span>Secondary</span>
      <span><span class="exams-legend-dot" style="background: rgb(122, 60, 6)"></span>Independent Study</span>
      <span>Node size = number of books connected to this one (shared citation or publisher)</span>
      <button class="exams-legend-btn" id="exams-publisher-rank-toggle" type="button" aria-expanded="false">Rank publishers by book count ▾</button>
      <span><span class="exams-legend-diamond"></span>Recommended: a citation shared by enough of the transcribed books to count as established infrastructure</span>
      <span><span class="exams-legend-dot" style="background: rgba(120,120,120,0.5)"></span>Full Field (toggle): Core reading-list texts I didn't select</span>
    </div>
```
Change to:
```html
    <div id="exams-legend">
      <span><span class="exams-legend-dot" style="background: rgb(122, 6, 97)"></span>Core</span>
      <span><span class="exams-legend-dot" style="background: rgb(6, 97, 122)"></span>Primary</span>
      <span><span class="exams-legend-dot" style="background: rgb(97, 122, 6)"></span>Secondary</span>
      <span><span class="exams-legend-dot" style="background: rgb(122, 60, 6)"></span>Independent Study</span>
      <span>Node size = number of books connected to this one by shared citations</span>
      <button class="exams-legend-btn" id="exams-publisher-rank-toggle" type="button" aria-expanded="false">Rank publishers by book count ▾</button>
      <span><span class="exams-legend-diamond"></span>Recommended: a citation shared by enough of the transcribed books to count as established infrastructure</span>
      <span><span class="exams-legend-dot" style="background: rgba(120,120,120,0.5)"></span>Full Field (toggle): Core reading-list texts I didn't select</span>
    </div>
```
(Only the "Node size" line's text changes — "shared citation or publisher" → "shared citations".)

- [ ] **Step 3: Verify**

```bash
bundle exec jekyll build
grep -n "drift toward each other" phd/exams/index.html   # expect no matches
grep -n "hover or click" phd/exams/index.html
grep -n "shared citation or publisher" phd/exams/index.html   # expect no matches
grep -n "connected to this one by shared citations" phd/exams/index.html
```

- [ ] **Step 4: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: update intro and legend copy for new interaction model"
```

---

### Task 6: Manual visual QA

**Files:** none (verification only).

**Interfaces:** consumes the fully assembled result of Tasks 1–5.

- [ ] **Step 1: Build and serve**

```bash
bundle exec jekyll build
```
If a `jekyll serve` process is already running against this working tree, it will pick up the change automatically; otherwise start one.

- [ ] **Step 2: Curl-based structural sanity check**

```bash
curl -s http://127.0.0.1:4000/phd/exams/ | grep -c "exams-node-label"
curl -s http://127.0.0.1:4000/phd/exams/ | grep "exams-reco-slider"
```
Confirms the rendered page includes the updated slider markup and the label class is still present in the static shell (the actual D3-rendered SVG content only exists after client-side JS runs, so this only verifies the page loads with the right static scaffolding — not the rendered graph itself).

- [ ] **Step 3: Visual confirmation**

D3's force simulation and the interactions added in this plan (auto-fit zoom, hover/click labels, click-to-highlight, node spacing) can only be meaningfully verified by loading the page in a browser and interacting with it — there is no automated way to check this from the command line. If this task is executed by an agent without browser access, it must report that visual verification was **not** performed and ask the user to check:
- Nodes no longer overlap heavily within a category band.
- No labels are visible until hovering or clicking a node.
- Clicking a node dims unrelated nodes/links and reveals that node's label; clicking empty canvas space clears it.
- The graph auto-frames itself (no need to manually zoom out to see the whole thing) shortly after the page loads or after changing a slider.
- No console errors on page load (open browser dev tools).

- [ ] **Step 4: Report**

Summarize what was verified programmatically vs. what needs the user's visual confirmation. Do not claim the graph "looks correct" without either browser access or explicit user confirmation.
