# Projects Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a unified `/projects/` section with a D3 network graph index, move all standalone projects there, and update the nav to Blog | eLit | Projects | Teaching.

**Architecture:** Flat `/projects/` directory — no subfolders. Each project page carries `project: true` and a `tags:` list in front matter. The projects index uses Jekyll Liquid to emit inline JSON, which D3 renders as a force-directed graph with project nodes and tag nodes. Nav is hardcoded in `_layouts/default.html`.

**Tech Stack:** Jekyll (Liquid templating), D3 v7 (CDN), Git, Bash

---

## File Map

| Action | Path |
|--------|------|
| Modify | `_layouts/default.html` |
| Move | `presentations/oppression-aesthetic/` → `projects/oppression-aesthetic/` |
| Move | `phd/projects/henryviii/` → `projects/henryviii/` |
| Move | `phd/projects/smt/` → `projects/smt/` |
| Move | `phd/projects/bot/` → `projects/bot/` |
| Move | `tools/combat/` → `projects/combat/` |
| Move | `criticalmaking/map.html` → `projects/map/map.html` |
| Move | `criticalmaking/sasb.html` → `projects/sasb/sasb.html` |
| Move | `criticalmaking/sasb-canvas.html` → `projects/sasb/sasb-canvas.html` |
| Create | `projects/map/index.md` |
| Create | `projects/sasb/index.md` |
| Create | `projects/smt/index.md` |
| Create | `projects/combat/index.md` |
| Add front matter | `projects/oppression-aesthetic/index.html` |
| Add front matter | `projects/henryviii/index.md` |
| Add front matter | `projects/bot/index.md` |
| Create | `projects/index.md` |

---

## Task 1: Update Navigation

**Files:**
- Modify: `_layouts/default.html`

- [ ] **Step 1: Open `_layouts/default.html` and locate the `<ul>` inside `.cv-navigation`**

The current nav block looks like this (lines 10–36):
```html
<div class="cv-navigation">
  <ul>
    <li class="nav-dropdown-container">
      <button class="nav-dropdown-btn animated-link" id="cvs-dropdown-btn" data-link="{{ site.baseurl }}/academic/">
        CVs
        <span class="dropdown-arrow">▼</span>
      </button>
      <div class="nav-dropdown" id="cvs-dropdown">
        <a href="{{ site.baseurl }}/academic/" class="nav-option">Academic</a>
        <a href="{{ site.baseurl }}/creative/" class="nav-option">Creative</a>
        <a href="#" class="nav-option" id="complete-cv-option">Complete</a>
      </div>
    </li>
    <li><a href="{{ site.baseurl }}/elit/" class="animated-link">elit</a></li>
    <li><a href="{{ site.baseurl }}/blog/" class="animated-link">Blog</a></li>
    <li class="nav-dropdown-container">
      <button class="nav-dropdown-btn animated-link" id="teaching-dropdown-btn" data-link="{{ site.baseurl }}/teaching/">
        Teaching
        <span class="dropdown-arrow">▼</span>
      </button>
      <div class="nav-dropdown" id="teaching-dropdown">
        <a href="{{ site.baseurl }}/teaching/statement/" class="nav-option">Statement</a>
        <a href="{{ site.baseurl }}/teaching/syllabi/" class="nav-option">Syllabi</a>
        <a href="{{ site.baseurl }}/teaching/lectures" class="nav-option">Twine</a>
        <a href="{{ site.baseurl }}/teaching/zines/" class="nav-option">Zines</a>
      </div>
    </li>
  </ul>
</div>
```

- [ ] **Step 2: Replace the entire `<ul>` block with the new nav**

```html
<div class="cv-navigation">
  <ul>
    <li><a href="{{ site.baseurl }}/blog/" class="animated-link">Blog</a></li>
    <li><a href="{{ site.baseurl }}/elit/" class="animated-link">eLit</a></li>
    <li><a href="{{ site.baseurl }}/projects/" class="animated-link">Projects</a></li>
    <li class="nav-dropdown-container">
      <button class="nav-dropdown-btn animated-link" id="teaching-dropdown-btn" data-link="{{ site.baseurl }}/teaching/">
        Teaching
        <span class="dropdown-arrow">▼</span>
      </button>
      <div class="nav-dropdown" id="teaching-dropdown">
        <a href="{{ site.baseurl }}/teaching/statement/" class="nav-option">Statement</a>
        <a href="{{ site.baseurl }}/teaching/syllabi/" class="nav-option">Syllabi</a>
        <a href="{{ site.baseurl }}/teaching/lectures" class="nav-option">Twine</a>
        <a href="{{ site.baseurl }}/teaching/zines/" class="nav-option">Zines</a>
      </div>
    </li>
  </ul>
</div>
```

- [ ] **Step 3: Remove the CVs dropdown JS block from the same file**

Find and delete the entire block from `// CVs nav dropdown` through the closing `}` of the `hideCvsDropdown` mouseleave listener (roughly lines 134–179 in the original). Also remove references to `cvsDropdownBtn`, `cvsDropdown`, and `completeCvOption` variables from the `document.addEventListener('click', ...)` handler at the bottom of the script.

- [ ] **Step 4: Build and verify**

```bash
bundle exec jekyll build 2>&1 | tail -5
```

Expected: `done in X seconds` with no errors. Open `_site/index.html` and confirm the nav shows Blog, eLit, Projects, Teaching — no CVs.

- [ ] **Step 5: Commit**

```bash
git add _layouts/default.html
git commit -m "feat: update nav to Blog | eLit | Projects | Teaching, remove CVs"
```

---

## Task 2: Move oppression-aesthetic

**Files:**
- Move: `presentations/oppression-aesthetic/` → `projects/oppression-aesthetic/`
- Modify: `projects/oppression-aesthetic/index.html` (add/update front matter tags)

- [ ] **Step 1: Move the directory**

```bash
git mv presentations/oppression-aesthetic projects/oppression-aesthetic
```

- [ ] **Step 2: Add `project: true` and tags to front matter**

Open `projects/oppression-aesthetic/index.html`. The current front matter is:
```yaml
---
layout: default
title: "Your Oppression: Our Aesthetic"
description: "A critical examination of album art that aestheticizes human atrocities"
---
```

Replace with:
```yaml
---
layout: default
title: "Your Oppression: Our Aesthetic"
description: "A critical examination of album art that aestheticizes human atrocities"
project: true
tags: [phd, critical-making, reveal]
---
```

- [ ] **Step 3: Build and verify**

```bash
bundle exec jekyll build 2>&1 | tail -5
ls _site/projects/oppression-aesthetic/
```

Expected: `index.html` present in that directory. Confirm `_site/presentations/oppression-aesthetic/` no longer exists.

- [ ] **Step 4: Commit**

```bash
git add projects/oppression-aesthetic presentations/oppression-aesthetic
git commit -m "feat: move oppression-aesthetic to projects, add front matter tags"
```

---

## Task 3: Move henryviii

**Files:**
- Move: `phd/projects/henryviii/` → `projects/henryviii/`
- Modify: `projects/henryviii/index.md` (add Jekyll front matter)

- [ ] **Step 1: Move the directory**

```bash
git mv phd/projects/henryviii projects/henryviii
```

- [ ] **Step 2: Add Jekyll front matter to index.md**

`projects/henryviii/index.md` currently has no front matter — it starts directly with `# Words Across Worlds...`. Add front matter at the top:

```yaml
---
layout: default
title: "Words Across Worlds"
description: "Mapping the Protestant Reformation as a global textual network"
project: true
tags: [phd, twine, collaborative, data-visualization]
---
```

- [ ] **Step 3: Fix the internal Twine link**

The page contains:
```html
<a href ="{{ site.baseurl }}/phd/projects/henryviii/twine.html">here</a>
```

Update to:
```html
<a href="{{ site.baseurl }}/projects/henryviii/twine.html">here</a>
```

- [ ] **Step 4: Build and verify**

```bash
bundle exec jekyll build 2>&1 | tail -5
ls _site/projects/henryviii/
```

Expected: `index.html` and `twine.html` present.

- [ ] **Step 5: Commit**

```bash
git add projects/henryviii phd/projects/henryviii
git commit -m "feat: move henryviii to projects, add front matter and tags"
```

---

## Task 4: Move smt and create index page

**Files:**
- Move: `phd/projects/smt/` → `projects/smt/`
- Create: `projects/smt/index.md`

The smt directory currently contains only `network.html` — a standalone D3 visualization with no Jekyll index.

- [ ] **Step 1: Move the directory**

```bash
git mv phd/projects/smt projects/smt
```

- [ ] **Step 2: Create `projects/smt/index.md`**

```markdown
---
layout: default
title: "SMT Celtic Mythology Network"
description: "A network graph mapping Celtic mythology sources in the Shin Megami Tensei game series"
project: true
tags: [phd, data-visualization, collaborative]
---

# SMT Celtic Mythology Network

A force-directed network graph mapping the Celtic mythological sources — Irish, Welsh, Scottish, Arthurian, and more — drawn upon by the *Shin Megami Tensei* game series.

**Project Team:**
- Network design & development: Glenn S. Ritchey III, University of Central Florida

[View the Network Graph](/projects/smt/network.html)
```

> **Note:** Fill in the full project team before publishing if other collaborators were involved.

- [ ] **Step 3: Build and verify**

```bash
bundle exec jekyll build 2>&1 | tail -5
ls _site/projects/smt/
```

Expected: `index.html` and `network.html` both present.

- [ ] **Step 4: Commit**

```bash
git add projects/smt phd/projects/smt
git commit -m "feat: move smt to projects, create index page with tags"
```

---

## Task 5: Move bot

**Files:**
- Move: `phd/projects/bot/` → `projects/bot/`
- Modify: `projects/bot/index.md` (currently empty — add content and front matter)

- [ ] **Step 1: Move the directory**

```bash
git mv phd/projects/bot projects/bot
```

- [ ] **Step 2: Add front matter and stub content to `projects/bot/index.md`**

The file is currently empty. Replace with:

```markdown
---
layout: default
title: "Bot"
description: "A generative text bot project"
project: true
tags: [phd, generative]
---

# Bot

_Project documentation coming soon._
```

> **Note:** Expand description and content when the project documentation is ready.

- [ ] **Step 3: Build and verify**

```bash
bundle exec jekyll build 2>&1 | tail -5
ls _site/projects/bot/
```

Expected: `index.html` present.

- [ ] **Step 4: Commit**

```bash
git add projects/bot phd/projects/bot
git commit -m "feat: move bot to projects, add front matter"
```

---

## Task 6: Move combat and create index page

**Files:**
- Move: `tools/combat/` → `projects/combat/`
- Create: `projects/combat/index.md`

The combat directory contains `combat.py` and `lyrics.md` — source files only, no HTML page.

- [ ] **Step 1: Move the directory**

```bash
git mv tools/combat projects/combat
```

- [ ] **Step 2: Create `projects/combat/index.md`**

```markdown
---
layout: default
title: "Combat"
description: "A generative lyric tool using Python"
project: true
tags: [phd, generative, interactive]
---

# Combat

A Python-based generative text tool for producing song lyrics.

[View source on this page](/projects/combat/combat.py)
```

- [ ] **Step 3: Build and verify**

```bash
bundle exec jekyll build 2>&1 | tail -5
ls _site/projects/combat/
```

Expected: `index.html`, `combat.py`, `lyrics.md` present.

- [ ] **Step 4: Commit**

```bash
git add projects/combat tools/combat
git commit -m "feat: move combat to projects, create index page"
```

---

## Task 7: Create map project page

**Files:**
- Create: `projects/map/` directory
- Move: `criticalmaking/map.html` → `projects/map/map.html`
- Create: `projects/map/index.md`

The map is a standalone Leaflet HTML file with no Jekyll wrapper.

- [ ] **Step 1: Move the file**

```bash
mkdir -p projects/map
git mv criticalmaking/map.html projects/map/map.html
```

- [ ] **Step 2: Create `projects/map/index.md`**

```markdown
---
layout: default
title: "Walk to School"
description: "An annotated map of Glenn's walk to school circa 2007 — a place-based critical making project"
project: true
tags: [phd, critical-making, data-visualization]
---

# Walk to School, ~'07

A place-based critical making project mapping a childhood walk to school — approximately 9.4 miles — with annotations.

[View the Map](/projects/map/map.html)
```

- [ ] **Step 3: Build and verify**

```bash
bundle exec jekyll build 2>&1 | tail -5
ls _site/projects/map/
```

Expected: `index.html` and `map.html` both present. Confirm `_site/criticalmaking/map.html` no longer exists.

- [ ] **Step 4: Commit**

```bash
git add projects/map criticalmaking/map.html
git commit -m "feat: move map to projects, create index page"
```

---

## Task 8: Create sasb project page

**Files:**
- Create: `projects/sasb/` directory
- Move: `criticalmaking/sasb.html` → `projects/sasb/sasb.html`
- Move: `criticalmaking/sasb-canvas.html` → `projects/sasb/sasb-canvas.html`
- Create: `projects/sasb/index.md`

- [ ] **Step 1: Move the files**

```bash
mkdir -p projects/sasb
git mv criticalmaking/sasb.html projects/sasb/sasb.html
git mv criticalmaking/sasb-canvas.html projects/sasb/sasb-canvas.html
```

- [ ] **Step 2: Create `projects/sasb/index.md`**

```markdown
---
layout: default
title: "SASB"
description: "A critical making project"
project: true
tags: [phd, critical-making]
---

# SASB

_Project description coming soon._

[View Project](/projects/sasb/sasb.html)
```

> **Note:** Expand the title and description to match the actual project.

- [ ] **Step 3: Build and verify**

```bash
bundle exec jekyll build 2>&1 | tail -5
ls _site/projects/sasb/
```

Expected: `index.html`, `sasb.html`, `sasb-canvas.html` all present.

- [ ] **Step 4: Commit**

```bash
git add projects/sasb criticalmaking/sasb.html criticalmaking/sasb-canvas.html
git commit -m "feat: move sasb to projects, create index page"
```

---

## Task 9: Remove empty source directories

**Files:**
- Delete: `criticalmaking/` (should be empty after Tasks 7–8, except for remaining assets)
- Delete: `phd/projects/` (empty after Tasks 3–5)

- [ ] **Step 1: Check what remains in criticalmaking/**

```bash
ls criticalmaking/
```

If only `blankpage.jpg` and `selfie.pdf` remain (assets with no project page), move them into the relevant project directory or delete them if unused. If they belong to the sasb project:

```bash
git mv criticalmaking/blankpage.jpg projects/sasb/blankpage.jpg
git mv criticalmaking/selfie.pdf projects/sasb/selfie.pdf
```

- [ ] **Step 2: Check what remains in phd/projects/**

```bash
ls phd/projects/
```

Expected: empty. If empty, remove:

```bash
git rm -r phd/projects/
```

- [ ] **Step 3: Build and verify**

```bash
bundle exec jekyll build 2>&1 | tail -5
```

Expected: no errors. Confirm `_site/criticalmaking/` and `_site/phd/projects/` no longer exist.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove empty criticalmaking and phd/projects directories"
```

---

## Task 10: Build the projects index network graph

**Files:**
- Create: `projects/index.md`

This is the most complex task. The page uses Jekyll Liquid to collect all pages with `project: true`, emits them as inline JSON, then D3 renders a force-directed graph with two node types (projects and tags).

- [ ] **Step 1: Create `projects/index.md`**

```markdown
---
layout: default
title: Projects
project: false
---

<div id="project-graph-container">
  <div id="project-graph"></div>
  <div id="graph-legend">
    <span class="legend-item"><span class="legend-dot project-dot"></span> Project</span>
    <span class="legend-item"><span class="legend-dot tag-dot"></span> Tag</span>
  </div>
</div>

<style>
  #project-graph-container {
    width: 100%;
    position: relative;
  }
  #project-graph {
    width: 100%;
    height: 600px;
    background: #1a1a18;
    border-radius: 4px;
    overflow: hidden;
  }
  #graph-legend {
    margin-top: 0.5rem;
    display: flex;
    gap: 1.5rem;
    font-size: 0.85rem;
    color: #8a8880;
  }
  .legend-item { display: flex; align-items: center; gap: 0.4rem; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .project-dot { background: #e85d3d; }
  .tag-dot { background: #4a90c4; }
  .node-label {
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    fill: #f0ede6;
    pointer-events: none;
    user-select: none;
  }
  .tag-label { fill: #a0c4e8; }
  circle.project-node { cursor: pointer; }
  circle.project-node:hover { stroke: #fff; stroke-width: 2px; }
  circle.tag-node { cursor: pointer; }
</style>

<script>
{% assign project_pages = site.pages | where: "project", true %}
{% assign all_tag_names = "" | split: "" %}
{% for p in project_pages %}
  {% for tag in p.tags %}
    {% unless all_tag_names contains tag %}
      {% assign all_tag_names = all_tag_names | push: tag %}
    {% endunless %}
  {% endfor %}
{% endfor %}

const graphData = {
  nodes: [
    {% for p in project_pages %}
    { id: {{ p.title | jsonify }}, label: {{ p.title | jsonify }}, url: {{ p.url | jsonify }}, type: "project" }{% unless forloop.last %},{% endunless %}
    {% endfor %}
    {% if project_pages.size > 0 %},{% endif %}
    {% for tag in all_tag_names %}
    { id: {{ tag | jsonify }}, label: {{ tag | jsonify }}, url: null, type: "tag" }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ],
  links: [
    {% for p in project_pages %}
      {% for tag in p.tags %}
    { source: {{ p.title | jsonify }}, target: {{ tag | jsonify }} }{% unless forloop.last and forloop.parentloop.last %},{% endunless %}
      {% endfor %}
    {% endfor %}
  ]
};
</script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script>
(function() {
  const container = document.getElementById('project-graph');
  const W = container.clientWidth || 800;
  const H = 600;

  const svg = d3.select('#project-graph')
    .append('svg')
    .attr('width', W)
    .attr('height', H);

  const g = svg.append('g');

  // Zoom
  svg.call(d3.zoom()
    .scaleExtent([0.4, 3])
    .on('zoom', (event) => g.attr('transform', event.transform))
  );

  const simulation = d3.forceSimulation(graphData.nodes)
    .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(90))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(30));

  const link = g.append('g')
    .selectAll('line')
    .data(graphData.links)
    .join('line')
    .attr('stroke', '#3a3a36')
    .attr('stroke-width', 1.5);

  const node = g.append('g')
    .selectAll('circle')
    .data(graphData.nodes)
    .join('circle')
    .attr('r', d => d.type === 'project' ? 12 : 8)
    .attr('fill', d => d.type === 'project' ? '#e85d3d' : '#4a90c4')
    .attr('class', d => d.type === 'project' ? 'project-node' : 'tag-node')
    .call(d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      })
    );

  // Project nodes: click to navigate
  node.filter(d => d.type === 'project')
    .on('click', (event, d) => { window.location.href = d.url; });

  // Tag nodes: click to highlight connected projects
  node.filter(d => d.type === 'tag')
    .on('click', (event, d) => {
      event.stopPropagation();
      const connectedIds = new Set(
        graphData.links
          .filter(l => (l.source.id || l.source) === d.id || (l.target.id || l.target) === d.id)
          .map(l => (l.source.id || l.source) === d.id ? (l.target.id || l.target) : (l.source.id || l.source))
      );
      node.attr('opacity', n => n.id === d.id || connectedIds.has(n.id) ? 1 : 0.2);
      link.attr('opacity', l =>
        (l.source.id || l.source) === d.id || (l.target.id || l.target) === d.id ? 1 : 0.1
      );
    });

  // Click background to reset
  svg.on('click', () => {
    node.attr('opacity', 1);
    link.attr('opacity', 1);
  });

  const label = g.append('g')
    .selectAll('text')
    .data(graphData.nodes)
    .join('text')
    .attr('class', d => d.type === 'tag' ? 'node-label tag-label' : 'node-label')
    .attr('dy', d => d.type === 'project' ? -16 : -12)
    .attr('text-anchor', 'middle')
    .text(d => d.label);

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('cx', d => d.x).attr('cy', d => d.y);
    label.attr('x', d => d.x).attr('y', d => d.y);
  });
})();
</script>
```

- [ ] **Step 2: Build and verify the graph renders**

```bash
bundle exec jekyll build 2>&1 | tail -5
ls _site/projects/
```

Expected: `index.html` present alongside all project subdirectories. Open `_site/projects/index.html` and confirm the inline JSON block contains nodes for all 7 projects and the expected tags.

You can check the generated JSON quickly:
```bash
grep -A 5 "const graphData" _site/projects/index.html | head -20
```

- [ ] **Step 3: Commit**

```bash
git add projects/index.md
git commit -m "feat: add projects index with D3 network graph"
```

---

## Self-Review

**Spec coverage check:**
- [x] Directory restructure — Tasks 2–9
- [x] Nav updated to Blog | eLit | Projects | Teaching — Task 1
- [x] CVs removed from nav — Task 1
- [x] Network graph on projects index — Task 10
- [x] Tags in front matter for all projects — Tasks 2–8
- [x] Group project accreditation (henryviii already has it; smt gets it in Task 4) — Task 4
- [x] criticalmaking items get proper index pages — Tasks 7–8
- [x] combat gets index page — Task 6
- [x] smt gets index page — Task 4

**Gaps noted:**
- The `sasb` and `bot` project descriptions are stubs. This is intentional — content is owner's responsibility; the structure is in place.
- The `criticalmaking/` directory may contain assets (`blankpage.jpg`, `selfie.pdf`) that need manual decision in Task 9 — plan handles this with a conditional check.
