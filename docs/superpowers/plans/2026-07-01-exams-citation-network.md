# PhD Exams Citation Network Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a force-directed D3 network graph page at `phd/exams/` where books from the Core/Primary/Secondary comprehensive exam reading lists are nodes, and edges are auto-derived whenever two books cite the same source.

**Architecture:** Two hand-edited data files (`_data/exams_vocab.yml`, `_data/exams.json`) are read by Jekyll and embedded into inline JS via Liquid `jsonify`, the same mechanism the AWG gallery page uses (`_data/awg_vocab.yml` + `_data/awg_images.yml` → `{{ ... | jsonify }}`). Client-side JS computes shared-citation edges from the raw book/citation data (no manual edge list) and renders a D3 force simulation styled after the existing Belfast mural network (`phd/interdisciplinary-teaching/visual-analysis/assets/belfast-network.html`), but reskinned to the site's actual light palette from `assets/main.scss` instead of Belfast's dark theme.

**Deviation from spec filename:** the spec (`docs/superpowers/specs/2026-07-01-exams-citation-network-design.md`) names the page `phd/exams/index.md`. This plan builds it as `phd/exams/index.html` instead, matching the AWG gallery precedent — a page whose body is almost entirely raw HTML/CSS/JS (not prose) is safer as `.html`, since Jekyll passes `.html` files straight through Liquid without also running them through the Kramdown Markdown parser, which can mangle inline `<script>`/`<style>` blocks. The AWG plan made the same call and even deleted a pre-existing `index.md` for this exact reason.

**Tech Stack:** Jekyll (Liquid templates) + `_data/` YAML/JSON + D3.js v7 (loaded from the same CDN URL as the Belfast and homepage graphs: `https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js`) + vanilla JS. No JS build step, no new dependencies.

## Global Constraints

- Data files: `_data/exams_vocab.yml` (categories + field labels, informational only) and `_data/exams.json` (citations dictionary + books array) — both hand-edited by the user going forward.
- Citation matching is key-based: two books link if and only if they share a citation key in their `citations` array. No manual edge list.
- Three flat filterable categories: `core`, `primary`, `secondary`. Field labels (Electronic Literature, Critical Making, Visual Culture, Distant Viewing) are descriptive text only, not filters.
- Category colors (from `assets/main.scss`'s existing palette, rotated for the third):
  - `core` → `rgb(122, 6, 97)`
  - `primary` → `rgb(6, 97, 122)`
  - `secondary` → `rgb(97, 122, 6)`
- Page background `#f8f8ff`, monospace font inherited from site (`layout: default`), full-bleed graph section via negative-margin technique (same as `#awg-gallery` in `creative/graphic/awg-inc/index.html`).
- Node radius scaled by degree (count of distinct books sharing ≥1 citation with it) via `d3.scaleSqrt`, range `[10, 34]`.
- Edge stroke width/opacity scaled by `sharedCount` (number of citation keys shared by that specific pair).
- No book cover images, no lightbox, no shuffle-on-load.
- No automated JS test runner exists in this repo (confirmed: no `package.json`, no JS test tooling) — verification is `bundle exec jekyll build` for syntax/rendering correctness plus a manual browser checklist, matching the precedent set by the AWG gallery plan's Task 3.

---

### Task 1: Data files

**Files:**
- Create: `_data/exams_vocab.yml`
- Create: `_data/exams.json`

**Interfaces:**
- Produces: `site.data.exams_vocab.categories`, `site.data.exams_vocab.fields` (arrays, consumed informationally by Task 2)
- Produces: `site.data.exams.citations` (object, key → citation text string) and `site.data.exams.books` (array of `{id, title, author, year, category, field, citations}`), consumed by Task 2 and Task 3

- [ ] **Step 1: Create the vocabulary file**

Create `_data/exams_vocab.yml`:

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

- [ ] **Step 2: Create the citations + books data file with seed placeholder data**

Create `_data/exams.json`. The three seed books are a deliberate test fixture: `placeholder-core-book` and `placeholder-primary-book` share the citation key `placeholder-shared-source` (so they must render as a connected edge), while `placeholder-secondary-book` cites only `placeholder-solo-source` (so it must render as an isolated node with no edges). This proves the edge-computation logic in Task 3 before any real reading-list data is entered.

```json
{
  "citations": {
    "placeholder-shared-source": "Placeholder, A. Shared Source Text. Publisher, 2000.",
    "placeholder-solo-source": "Placeholder, B. Solo Source Text. Publisher, 2001."
  },
  "books": [
    {
      "id": "placeholder-core-book",
      "title": "Placeholder Core Book",
      "author": "Author One",
      "year": 2010,
      "category": "core",
      "field": "",
      "citations": ["placeholder-shared-source"]
    },
    {
      "id": "placeholder-primary-book",
      "title": "Placeholder Primary Book",
      "author": "Author Two",
      "year": 2012,
      "category": "primary",
      "field": "Electronic Literature",
      "citations": ["placeholder-shared-source"]
    },
    {
      "id": "placeholder-secondary-book",
      "title": "Placeholder Secondary Book",
      "author": "Author Three",
      "year": 2015,
      "category": "secondary",
      "field": "Visual Culture",
      "citations": ["placeholder-solo-source"]
    }
  ]
}
```

- [ ] **Step 3: Validate both files parse correctly**

```bash
cd /home/user/portfolio
python3 -c "import yaml; d = yaml.safe_load(open('_data/exams_vocab.yml')); assert d['categories'] == ['core', 'primary', 'secondary']; assert len(d['fields']) == 4; print('vocab OK')"
python3 -c "import json; d = json.load(open('_data/exams.json')); assert len(d['books']) == 3; assert len(d['citations']) == 2; print('exams.json OK')"
```

Expected: `vocab OK` and `exams.json OK` printed, no exceptions.

- [ ] **Step 4: Commit**

```bash
git add _data/exams_vocab.yml _data/exams.json
git commit -m "feat: add exams citation network data files with seed placeholder data"
```

---

### Task 2: Page skeleton, filters, panel markup, and data wiring

**Files:**
- Create: `phd/exams/index.html`

**Interfaces:**
- Consumes: `site.data.exams` and `site.data.exams_vocab` (from Task 1)
- Produces: DOM structure and embedded `EXAMS_DATA` / `EXAMS_VOCAB` JS globals that Task 3's script relies on

- [ ] **Step 1: Create the page with front matter, prose, full-bleed section scaffold, filters, and panel markup**

Create `phd/exams/index.html`:

```html
---
layout: default
title: "Comprehensive Exams — Citation Network"
description: "A force-directed network graph mapping shared citations across the Core, Primary, and Secondary comprehensive exam reading lists"
project: true
tags: [PhD, Texts and Technology, Digital Humanities, Network Analysis, Electronic Literature, Critical Making, Visual Culture, Distant Viewing]
---

<p>My comprehensive exams reading list is organized into three parts: a Core list shared across the whole exam, a Primary list spanning Electronic Literature and Critical Making, and a Secondary list spanning Visual Culture and Distant Viewing. The graph below treats each book as a node and draws a line between any two books that cite the same source — a rough, bibliometric picture of which texts function as shared infrastructure across fields I'm otherwise treating as distinct.</p>

<style>
#exams-graph {
  margin-left: calc(-50vw + 50%);
  width: 100vw;
  background: #f8f8ff;
  color: #111;
  padding: 2rem 1.5rem;
  box-sizing: border-box;
  margin-top: 2rem;
}

.exams-inner {
  max-width: 1080px;
  margin: 0 auto;
}

.exams-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.exams-filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}

.exams-filter-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #555;
  margin-right: 0.25rem;
  white-space: nowrap;
}

.exams-filter-btn {
  background: transparent;
  border: 1px solid #bbb;
  padding: 0.25rem 0.65rem;
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  line-height: 1.4;
}

.exams-filter-btn.cat-core { color: rgb(122, 6, 97); border-color: rgb(122, 6, 97); }
.exams-filter-btn.cat-primary { color: rgb(6, 97, 122); border-color: rgb(6, 97, 122); }
.exams-filter-btn.cat-secondary { color: rgb(97, 122, 6); border-color: rgb(97, 122, 6); }
.exams-filter-btn.links-btn { color: #555; border-color: #999; }

.exams-filter-btn.cat-core.active { background: rgb(122, 6, 97); color: #f8f8ff; }
.exams-filter-btn.cat-primary.active { background: rgb(6, 97, 122); color: #f8f8ff; }
.exams-filter-btn.cat-secondary.active { background: rgb(97, 122, 6); color: #f8f8ff; }
.exams-filter-btn.links-btn.active { background: #555; color: #f8f8ff; }

.exams-clear-btn {
  background: none;
  color: #555;
  border: 1px solid #ccc;
  padding: 0.25rem 0.65rem;
  font-family: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  margin-left: auto;
}

.exams-clear-btn:hover {
  color: #111;
  border-color: #888;
}

#exams-canvas {
  position: relative;
  width: 100%;
  height: 640px;
  border: 1px solid rgba(122, 6, 97, 0.2);
  background: #fff;
  overflow: hidden;
}

#exams-canvas svg {
  width: 100%;
  height: 100%;
}

.exams-node-label {
  font-family: inherit;
  font-size: 9px;
  fill: #555;
  pointer-events: none;
  text-anchor: middle;
}

.exams-link {
  stroke: rgb(122, 6, 97);
}

.exams-tooltip {
  position: fixed;
  z-index: 200;
  background: #111;
  color: #f8f8ff;
  padding: 4px 8px;
  font-size: 11px;
  font-family: inherit;
  pointer-events: none;
  display: none;
}

#exams-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 340px;
  height: 100%;
  background: #fff;
  border-left: 1px solid rgba(122, 6, 97, 0.3);
  transform: translateX(100%);
  transition: transform 0.25s ease;
  overflow-y: auto;
  padding: 1.25rem;
  box-sizing: border-box;
}

#exams-panel.open {
  transform: translateX(0);
}

#exams-panel-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 2px 8px;
}

.exams-panel-badge {
  display: inline-block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 2px 8px;
  color: #fff;
  margin-bottom: 0.5rem;
}

.exams-panel-title {
  font-size: 1rem;
  font-weight: bold;
  margin: 0.25rem 0 0.5rem;
}

.exams-panel-meta {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.exams-panel-citelist {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  font-size: 0.8rem;
}

.exams-panel-citelist li {
  padding: 0.35rem 0;
  border-bottom: 1px solid #eee;
}

.exams-panel-shared-badge {
  display: inline-block;
  background: rgba(122, 6, 97, 0.12);
  color: rgb(122, 6, 97);
  font-size: 0.7rem;
  padding: 0 6px;
  border-radius: 8px;
  margin-left: 6px;
}

#exams-legend {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: #555;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.exams-legend-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  margin-right: 5px;
}

@media (max-width: 700px) {
  #exams-panel { width: 100%; }
}
</style>

<div id="exams-graph">
  <div class="exams-inner">

    <div class="exams-controls">
      <div class="exams-filter-group">
        <span class="exams-filter-label">Category</span>
        <button class="exams-filter-btn cat-core" data-val="core">Core</button>
        <button class="exams-filter-btn cat-primary" data-val="primary">Primary</button>
        <button class="exams-filter-btn cat-secondary" data-val="secondary">Secondary</button>
      </div>
      <div class="exams-filter-group">
        <button class="exams-filter-btn links-btn active" id="exams-links-toggle">Links</button>
      </div>
      <button class="exams-clear-btn" id="exams-clear">Clear filters</button>
    </div>

    <div id="exams-canvas">
      <svg id="exams-svg"></svg>
      <div id="exams-panel">
        <button id="exams-panel-close">✕</button>
        <div class="exams-panel-badge" id="exams-panel-badge"></div>
        <div class="exams-panel-title" id="exams-panel-title"></div>
        <div class="exams-panel-meta" id="exams-panel-meta"></div>
        <div class="exams-panel-meta" id="exams-panel-field"></div>
        <ul class="exams-panel-citelist" id="exams-panel-citelist"></ul>
      </div>
    </div>

    <div id="exams-legend">
      <span><span class="exams-legend-dot" style="background: rgb(122, 6, 97)"></span>Core</span>
      <span><span class="exams-legend-dot" style="background: rgb(6, 97, 122)"></span>Primary</span>
      <span><span class="exams-legend-dot" style="background: rgb(97, 122, 6)"></span>Secondary</span>
      <span>Node size = number of books sharing a citation with this one</span>
    </div>

  </div>
</div>

<div class="exams-tooltip" id="exams-tooltip"></div>

<script>
const EXAMS_DATA = {{ site.data.exams | jsonify }};
const EXAMS_VOCAB = {{ site.data.exams_vocab | jsonify }};
</script>
```

Note: Task 3 appends the D3 rendering `<script>` block immediately after this one — don't add it yet in this step.

- [ ] **Step 2: Build the site**

```bash
cd /home/user/portfolio && bundle exec jekyll build 2>&1 | tail -20
```

Expected: `done in X seconds`, no Liquid errors.

- [ ] **Step 3: Verify data is embedded correctly in the built page**

```bash
grep -o 'const EXAMS_DATA = .*' _site/phd/exams/index.html | head -c 300
echo
grep -o 'const EXAMS_VOCAB = .*' _site/phd/exams/index.html | head -c 200
```

Expected: the first line contains `"placeholder-core-book"` and `"placeholder-shared-source"`; the second line contains `"categories":["core","primary","secondary"]`.

- [ ] **Step 4: Verify filter buttons and panel markup rendered**

```bash
grep -c 'exams-filter-btn' _site/phd/exams/index.html
grep -c 'id="exams-panel"' _site/phd/exams/index.html
```

Expected: both counts are `1` or greater (buttons: 4 total — Core, Primary, Secondary, Links).

- [ ] **Step 5: Commit**

```bash
git add phd/exams/index.html
git commit -m "feat: add exams page skeleton with filters, panel markup, and data wiring"
```

---

### Task 3: D3 force graph, edge computation, and interactivity

**Files:**
- Modify: `phd/exams/index.html` (append the D3 rendering script after the data-wiring script from Task 2)

**Interfaces:**
- Consumes: `EXAMS_DATA` (`{citations, books}`) and `EXAMS_VOCAB` globals from Task 2's inline script
- Consumes DOM elements from Task 2: `#exams-svg`, `#exams-canvas`, `.exams-filter-btn.cat-core/.cat-primary/.cat-secondary`, `#exams-links-toggle`, `#exams-clear`, `#exams-panel`, `#exams-panel-close`, `#exams-panel-badge`, `#exams-panel-title`, `#exams-panel-meta`, `#exams-panel-field`, `#exams-panel-citelist`, `#exams-tooltip`

- [ ] **Step 1: Append the D3 script**

In `phd/exams/index.html`, immediately after the `<script>` block ending in `const EXAMS_VOCAB = {{ site.data.exams_vocab | jsonify }};\n</script>`, add:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script>
(function () {
  const CATEGORY_COLOR = {
    core: 'rgb(122, 6, 97)',
    primary: 'rgb(6, 97, 122)',
    secondary: 'rgb(97, 122, 6)'
  };
  const CATEGORY_X_FRACTION = { core: 0.2, primary: 0.5, secondary: 0.8 };

  const books = EXAMS_DATA.books;
  const citations = EXAMS_DATA.citations;

  const citationToBooks = {};
  books.forEach(b => {
    (b.citations || []).forEach(key => {
      if (!citationToBooks[key]) citationToBooks[key] = [];
      citationToBooks[key].push(b.id);
    });
  });

  const edgeMap = {};
  Object.keys(citationToBooks).forEach(key => {
    const ids = citationToBooks[key];
    if (ids.length < 2) return;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const pairKey = [ids[i], ids[j]].sort().join('|||');
        if (!edgeMap[pairKey]) {
          edgeMap[pairKey] = { source: ids[i], target: ids[j], sharedCount: 0, sharedKeys: [] };
        }
        edgeMap[pairKey].sharedCount += 1;
        edgeMap[pairKey].sharedKeys.push(key);
      }
    }
  });
  const edges = Object.values(edgeMap);

  const degree = {};
  books.forEach(b => { degree[b.id] = 0; });
  edges.forEach(e => {
    degree[e.source] += 1;
    degree[e.target] += 1;
  });

  const maxDegree = Math.max(1, ...Object.values(degree));
  const rScale = d3.scaleSqrt().domain([0, maxDegree]).range([10, 34]);

  const svg = d3.select('#exams-svg');
  const g = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => g.attr('transform', e.transform)));

  function W() { return document.getElementById('exams-canvas').clientWidth; }
  function H() { return document.getElementById('exams-canvas').clientHeight; }

  const sim = d3.forceSimulation(books)
    .force('link', d3.forceLink(edges).id(d => d.id).distance(120).strength(0.4))
    .force('charge', d3.forceManyBody().strength(-260))
    .force('center', d3.forceCenter(W() / 2, H() / 2))
    .force('collision', d3.forceCollide(d => rScale(degree[d.id]) + 8))
    .force('x', d3.forceX(d => W() * CATEGORY_X_FRACTION[d.category]).strength(0.15))
    .force('y', d3.forceY(H() / 2).strength(0.06));

  const link = g.append('g').selectAll('line')
    .data(edges).join('line')
    .attr('class', 'exams-link')
    .attr('stroke-width', d => Math.min(1 + d.sharedCount, 6))
    .attr('stroke-opacity', d => Math.min(0.25 + d.sharedCount * 0.15, 1));

  const nodeG = g.append('g').selectAll('g')
    .data(books).join('g')
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
    )
    .on('click', (e, d) => openPanel(d))
    .on('mouseover', (e, d) => {
      const tt = document.getElementById('exams-tooltip');
      tt.style.display = 'block';
      tt.style.left = (e.clientX + 12) + 'px';
      tt.style.top = (e.clientY - 10) + 'px';
      tt.textContent = d.title;
    })
    .on('mouseout', () => { document.getElementById('exams-tooltip').style.display = 'none'; });

  nodeG.append('circle')
    .attr('r', d => rScale(degree[d.id]))
    .attr('fill', d => CATEGORY_COLOR[d.category] + '33')
    .attr('stroke', d => CATEGORY_COLOR[d.category])
    .attr('stroke-width', 2);

  nodeG.append('text')
    .attr('class', 'exams-node-label')
    .attr('y', d => -rScale(degree[d.id]) - 5)
    .text(d => d.title.length > 24 ? d.title.slice(0, 24) + '…' : d.title);

  sim.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nodeG.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  const activeCategories = new Set();
  let showLinks = true;

  function applyVisibility() {
    nodeG.style('display', d => (activeCategories.size === 0 || activeCategories.has(d.category)) ? null : 'none');
    link.style('display', e => {
      if (!showLinks) return 'none';
      const sOk = activeCategories.size === 0 || activeCategories.has(e.source.category);
      const tOk = activeCategories.size === 0 || activeCategories.has(e.target.category);
      return (sOk && tOk) ? null : 'none';
    });
  }

  document.querySelectorAll('.exams-filter-btn.cat-core, .exams-filter-btn.cat-primary, .exams-filter-btn.cat-secondary')
    .forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (activeCategories.has(val)) {
          activeCategories.delete(val);
          btn.classList.remove('active');
        } else {
          activeCategories.add(val);
          btn.classList.add('active');
        }
        applyVisibility();
      });
    });

  document.getElementById('exams-links-toggle').addEventListener('click', function () {
    showLinks = !showLinks;
    this.classList.toggle('active', showLinks);
    applyVisibility();
  });

  document.getElementById('exams-clear').addEventListener('click', () => {
    activeCategories.clear();
    showLinks = true;
    document.querySelectorAll('.exams-filter-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('exams-links-toggle').classList.add('active');
    applyVisibility();
  });

  function openPanel(d) {
    const panel = document.getElementById('exams-panel');
    panel.classList.add('open');
    const badge = document.getElementById('exams-panel-badge');
    badge.textContent = d.category;
    badge.style.background = CATEGORY_COLOR[d.category];
    document.getElementById('exams-panel-title').textContent = d.title;
    document.getElementById('exams-panel-meta').textContent = d.author + ' (' + d.year + ')';
    document.getElementById('exams-panel-field').textContent = d.field || '';

    const list = document.getElementById('exams-panel-citelist');
    list.innerHTML = '';
    (d.citations || []).forEach(key => {
      const li = document.createElement('li');
      const sharedWith = citationToBooks[key].filter(id => id !== d.id);
      li.textContent = citations[key] || key;
      if (sharedWith.length > 0) {
        const badge2 = document.createElement('span');
        badge2.className = 'exams-panel-shared-badge';
        badge2.textContent = 'shared ×' + sharedWith.length;
        li.appendChild(badge2);
      }
      list.appendChild(li);
    });
  }

  document.getElementById('exams-panel-close').addEventListener('click', () => {
    document.getElementById('exams-panel').classList.remove('open');
  });

  window.addEventListener('resize', () => {
    sim.force('center', d3.forceCenter(W() / 2, H() / 2))
       .force('x', d3.forceX(d => W() * CATEGORY_X_FRACTION[d.category]).strength(0.15));
    sim.alpha(0.3).restart();
  });
}());
</script>
```

- [ ] **Step 2: Build the site**

```bash
cd /home/user/portfolio && bundle exec jekyll build 2>&1 | tail -20
```

Expected: `done in X seconds`, no Liquid errors.

- [ ] **Step 3: Serve and manually verify in a browser**

```bash
cd /home/user/portfolio && bundle exec jekyll serve
```

Open `http://localhost:4000/phd/exams/` and verify:

- [ ] Three nodes render inside the graph canvas (Placeholder Core Book, Placeholder Primary Book, Placeholder Secondary Book)
- [ ] There is a visible line connecting "Placeholder Core Book" and "Placeholder Primary Book" (they share `placeholder-shared-source`)
- [ ] "Placeholder Secondary Book" has no line connecting it to either other node (it cites only `placeholder-solo-source`)
- [ ] The two connected nodes are visibly larger than the isolated node (degree-based sizing)
- [ ] Core/Primary/Secondary nodes render in their assigned colors (`rgb(122,6,97)` / `rgb(6,97,122)` / `rgb(97,122,6)`)
- [ ] Clicking "Core" toggles it active and hides the other two nodes (and any edge touching them)
- [ ] Clicking "Clear filters" restores all nodes and resets the Links toggle to active
- [ ] Clicking the "Links" button hides all edges without hiding nodes; clicking again restores them
- [ ] Clicking a node opens the right-side panel with correct title, author/year, field, and its citation(s) listed; the shared citation shows a "shared ×1" badge on both connected books' panels
- [ ] Clicking the panel's ✕ closes it
- [ ] Dragging a node moves it and the simulation responds (connected edge follows the drag)
- [ ] Hovering a node shows a tooltip with its title near the cursor
- [ ] Resizing the browser window doesn't break the layout (graph recenters)

- [ ] **Step 4: Commit**

```bash
git add phd/exams/index.html
git commit -m "feat: add D3 force graph with auto-derived shared-citation edges to exams page"
```
