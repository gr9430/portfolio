# Exams Network Graph Organic Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the exams graph's per-category X-position clustering with the homepage graph's organic, force-driven layout (category becomes color-only, position is fully driven by link topology + repulsion + collision).

**Architecture:** All changes are within the single file `phd/exams/index.html` (inline `<script>` block). No changes to `_data/exams.json` or the Jekyll templating layer. The fix has two parts: (1) delete the per-category X-targeting force and replace the per-category-X / fixed-Y force pair with a uniform, weak, homepage-style centering force on both axes; (2) raise the default repulsion and collision padding to homepage-equivalent strength so nodes actually spread out rather than clumping.

**Tech Stack:** D3.js v7 (already loaded via CDN in the page), vanilla JS (IIFE), no build step — Jekyll serves the file as-is.

## Global Constraints

- All edits are in `phd/exams/index.html`. No other file changes.
- Category remains color-only: `CATEGORY_COLOR`, `CATEGORY_FILL`, and `CATEGORY_PIE` (the split-ring rendering) are untouched. The category filter (`activeCategories`) is untouched — it controls visibility, not position.
- New x/y centering force: `.force('x', d3.forceX(SIM_W / 2).strength(0.02))`, `.force('y', d3.forceY(SIM_H / 2).strength(0.02))` — replacing the single existing `.force('x', ...)` / `.force('y', ...)` pair. There is only one call site for these two forces in the whole file (confirmed: `rebuildAndRestart()` and the slider handlers never re-set `.force('x', ...)` or `.force('y', ...)`).
- Collision force padding: `+16` → `+28` at all three existing call sites (initial sim setup, `rebuildAndRestart()`, size-slider handler) — the same three the prior legibility fix touched.
- "Repel Force" slider default: `-250` → `-600`, already within the slider's existing `min="-600" max="-50"` range. Three places carry this default: the HTML `value` attribute, and the "Clear filters" reset block's `sim.force('charge', ...)` call plus its `.value`/`textContent` reset.
- No automated test suite exists for this file (client-rendered D3, no build step). Each task's verification is: (a) `bundle exec jekyll build` succeeds with no new errors (the pre-existing `slieve-gullion` destination-conflict warning is unrelated and expected), (b) a Node.js syntax check on the extracted inline script (Liquid-templated data lines stubbed out), (c) `grep` checks confirming the expected strings changed. No browser automation tool is available in any implementer's environment — visual confirmation of the actual layout requires the user, and must be reported honestly as "not independently visually verified" if no browser tool is available.

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

### Task 1: Remove category-to-position mapping, adopt homepage-style uniform centering force

**Files:**
- Modify: `phd/exams/index.html` (script, ~lines 722-729, ~913, ~921-922)

**Interfaces:**
- Consumes: existing `SIM_W`, `SIM_H` constants (already defined from the prior legibility fix), existing `W()`/`H()` helpers.
- Produces: nothing new consumed by later tasks — Task 2 is independent and only touches collision/charge values.

- [ ] **Step 1: Delete `CATEGORY_X_FRACTION` and `categoryXTarget()`**

Find:
```js
  const CATEGORY_X_FRACTION = { core: 0.125, primary: 0.375, secondary: 0.625, 'independent-study': 0.875 };
  const CATEGORY_PIE = d3.pie().value(1).sort(null);

  function categoryXTarget(d) {
    if (!d.categories || d.categories.length === 0) return W() * 0.5;
    const xs = d.categories.map(c => CATEGORY_X_FRACTION[c]);
    return W() * (xs.reduce((a, b) => a + b, 0) / xs.length);
  }
```
Replace with:
```js
  const CATEGORY_PIE = d3.pie().value(1).sort(null);
```
(This deletes `CATEGORY_X_FRACTION` and `categoryXTarget()` entirely, but keeps `CATEGORY_PIE` — it's used elsewhere for the split-ring rendering on multi-category books and must not be removed.)

- [ ] **Step 2: Delete the now-unused `xStrength()` helper**

Find:
```js
  function currentForce() { return +document.getElementById('exams-force-slider').value; }
  function xStrength(d) { return d.nodeType === 'citation' ? 0.03 : 0.15; }
```
Replace with:
```js
  function currentForce() { return +document.getElementById('exams-force-slider').value; }
```

- [ ] **Step 3: Replace the category-driven x/y forces with uniform weak centering**

Find:
```js
    .force('x', d3.forceX(categoryXTarget).strength(xStrength))
    .force('y', d3.forceY(H() / 2).strength(0.06));
```
Replace with:
```js
    .force('x', d3.forceX(SIM_W / 2).strength(0.02))
    .force('y', d3.forceY(SIM_H / 2).strength(0.02));
```
(This is the same `.force(...)` chain as the initial `d3.forceSimulation(allNodes())` setup — the two lines are the last two `.force()` calls in that chain, immediately after the `collision` force. Confirm by reading a few lines of context above the `Find` block before editing if your editor needs more anchoring — the line directly above starts with `.force('collision', d3.forceCollide(d => nodeRadius(d.id) + 16))`.)

- [ ] **Step 4: Verify**

```bash
bundle exec jekyll build
```
Expect: build completes with no new errors.

Run the syntax-check pipeline from the Global Constraints section. Expect no output (syntax OK).

Then confirm the specific changes landed:
```bash
grep -n "categoryXTarget\|CATEGORY_X_FRACTION\|xStrength" phd/exams/index.html   # expect no matches
grep -n "d3.forceX(SIM_W / 2).strength(0.02)" phd/exams/index.html
grep -n "d3.forceY(SIM_H / 2).strength(0.02)" phd/exams/index.html
grep -n "CATEGORY_PIE" phd/exams/index.html   # expect at least 2 matches (declaration + usage elsewhere)
```

- [ ] **Step 5: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: remove category-to-position mapping, use uniform centering force"
```

---

### Task 2: Match homepage's repulsion and collision intensity

**Files:**
- Modify: `phd/exams/index.html` (script ~line 920, ~1088, ~1173; HTML ~line 637; script reset block ~line 1192-1193)

**Interfaces:**
- Consumes: nothing from Task 1 (independent change — different lines, no shared identifiers).
- Produces: nothing consumed by later tasks (this is the last task in this plan).

- [ ] **Step 1: Bump collision padding at all three call sites**

Site 1 — initial sim setup:
```js
    .force('collision', d3.forceCollide(d => nodeRadius(d.id) + 16))
```
→
```js
    .force('collision', d3.forceCollide(d => nodeRadius(d.id) + 28))
```

Site 2 — `rebuildAndRestart()`:
```js
    sim.force('collision', d3.forceCollide(d => nodeRadius(d.id) + 16));
```
→
```js
    sim.force('collision', d3.forceCollide(d => nodeRadius(d.id) + 28));
```

Site 3 — size-slider handler (inside `document.getElementById('exams-size-slider').addEventListener(...)`):
```js
    sim.force('collision', d3.forceCollide(d => nodeRadius(d.id) + 16));
```
→
```js
    sim.force('collision', d3.forceCollide(d => nodeRadius(d.id) + 28));
```
(These three lines are textually identical in the source — find each by its surrounding context: Site 1 is inside the `d3.forceSimulation(allNodes())` chain; Site 2 is inside `function rebuildAndRestart() {`; Site 3 is inside the `exams-size-slider` `input` event listener, immediately after the `redrawNodeSizes();` call.)

- [ ] **Step 2: Raise the "Repel Force" slider's default value**

Find, in the HTML controls section:
```html
      <div class="exams-filter-group">
        <span class="exams-filter-label">Repel Force</span>
        <input type="range" id="exams-force-slider" min="-600" max="-50" step="10" value="-250">
        <span class="exams-force-value" id="exams-force-value">-250</span>
      </div>
```
Change to:
```html
      <div class="exams-filter-group">
        <span class="exams-filter-label">Repel Force</span>
        <input type="range" id="exams-force-slider" min="-600" max="-50" step="10" value="-600">
        <span class="exams-force-value" id="exams-force-value">-600</span>
      </div>
```
(Only the two `-250` values become `-600` — `min`, `max`, and `step` are unchanged.)

- [ ] **Step 3: Update the "Clear filters" reset block**

Find:
```js
    document.getElementById('exams-force-slider').value = -250;
    document.getElementById('exams-force-value').textContent = -250;
```
Change to:
```js
    document.getElementById('exams-force-slider').value = -600;
    document.getElementById('exams-force-value').textContent = -600;
```

Find, a few lines below in the same handler:
```js
    sim.force('charge', d3.forceManyBody().strength(-250));
```
Change to:
```js
    sim.force('charge', d3.forceManyBody().strength(-600));
```

- [ ] **Step 4: Verify**

```bash
bundle exec jekyll build
```
Expect: build completes with no new errors.

Run the syntax-check pipeline from the Global Constraints section. Expect no output (syntax OK).

Then confirm the specific changes landed:
```bash
grep -c "nodeRadius(d.id) + 28" phd/exams/index.html   # expect 3
grep -n "nodeRadius(d.id) + 16" phd/exams/index.html    # expect no matches
grep -n 'id="exams-force-slider" min="-600" max="-50" step="10" value="-600"' phd/exams/index.html
grep -n "strength(-600)" phd/exams/index.html
grep -n "\-250" phd/exams/index.html   # expect no matches related to this slider (unrelated numbers containing "250" elsewhere in the file, if any, would need manual eyeballing — there should be none)
```

- [ ] **Step 5: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: raise default repulsion and collision padding to homepage-equivalent strength"
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
curl -s http://127.0.0.1:4000/phd/exams/ | grep 'exams-force-slider'
```
Confirms the rendered page includes the updated slider markup (default `-600`). The actual D3-rendered SVG content only exists after client-side JS runs, so this only verifies the page loads with the right static scaffolding — not the rendered graph itself.

- [ ] **Step 3: Visual confirmation**

D3's force simulation output (whether nodes are now organically spread rather than clustered into columns) can only be meaningfully verified by loading the page in a browser — there is no automated way to check this from the command line. If this task is executed by an agent without browser access, it must report that visual verification was **not** performed and ask the user to check:
- Books are no longer visually grouped into four vertical columns by category — position now reflects shared citations and mutual repulsion, not category.
- Category is still visible via node color and the split-ring rendering on multi-category books.
- Nodes are more spread out and legible than before, comparable in feel to the homepage graph at `/`.
- The existing hover/click label behavior, click-to-highlight, and auto-fit zoom (from the prior fix) still work correctly — this task doesn't touch that code, but a regression should still be caught if one somehow occurred.

- [ ] **Step 4: Report**

Summarize what was verified programmatically vs. what needs the user's visual confirmation. Do not claim the graph "looks correct" without either browser access or explicit user confirmation.
