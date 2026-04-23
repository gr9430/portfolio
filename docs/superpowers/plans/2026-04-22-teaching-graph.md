# Teaching Graph & Graph Color Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a D3 force-directed network graph to `teaching/index.md` connecting the Teaching Statement → six ENC 1101 SLOs → individual lectures, and unify both the teaching and projects graphs to use the site's brand palette on a seamless light background.

**Architecture:** Teaching graph data lives in `_data/teaching_graph.yml`; Jekyll reads it at build time and emits the JavaScript graph object into the page. The three-tier node structure (statement → SLO keyword → lecture) mirrors the projects graph pattern but is YAML-driven rather than frontmatter-discovered because lecture files are compiled Twine HTML with no Jekyll frontmatter. Both graphs share a unified color palette derived from the site's existing CSS variables.

**Tech Stack:** Jekyll (Liquid templates, `_data/`), D3 v7 (force simulation, zoom, drag), vanilla JS, SCSS (read-only — colors come from the existing `assets/main.scss` palette).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `_data/teaching_graph.yml` | Create | All teaching graph data: statement, SLOs with short labels, lectures with SLO mappings |
| `teaching/index.md` | Rewrite | Page layout + D3 teaching graph; Syllabi/Zines links remain below graph |
| `projects/index.md` | Modify | Swap colors and background only — no structural changes |

---

## Task 1: Create `_data/teaching_graph.yml`

**Files:**
- Create: `_data/teaching_graph.yml`

- [ ] **Step 1: Write the data file**

```yaml
statement:
  title: "Teaching Statement"
  url: "/teaching/statement/"

slos:
  - id: "writing-processes"
    label: "Writing Processes & Adaptation"
    short: "Writing Processes"
  - id: "multiple-literacies"
    label: "Multiple Literacies & Goal Setting"
    short: "Multiple Literacies"
  - id: "variation-across-contexts"
    label: "Variation across Contexts"
    short: "Variation / Contexts"
  - id: "decision-making"
    label: "Decision Making & Production"
    short: "Decision Making"
  - id: "writing-and-power"
    label: "Writing and Power"
    short: "Writing & Power"
  - id: "revision"
    label: "Revision"
    short: "Revision"

lectures:
  - title: "Discourse Communities"
    url: "/teaching/lectures/s26/discourse-communities.html"
    slos: ["variation-across-contexts", "writing-and-power"]
  - title: "Discourse Communities & Language Negotiation"
    url: "/teaching/lectures/s26/discourse-communities-language-negotiation.html"
    slos: ["writing-and-power", "multiple-literacies", "variation-across-contexts"]
  - title: "Peer Review as Practice"
    url: "/teaching/lectures/s26/peer-review-as-practice.html"
    slos: ["writing-processes", "revision"]
  - title: "Using Your Feedback"
    url: "/teaching/lectures/s26/using-feedback.html"
    slos: ["revision", "writing-processes"]
  - title: "Navigating Genres"
    url: "/teaching/lectures/s26/navigating-genres.html"
    slos: ["variation-across-contexts", "decision-making", "writing-processes"]
  - title: "The Rhetorics of Fashion & Style"
    url: "/teaching/lectures/s26/rhetorics-fashion.html"
    slos: ["multiple-literacies", "variation-across-contexts", "decision-making"]
```

- [ ] **Step 2: Verify Jekyll can read the file**

```bash
bundle exec jekyll build 2>&1 | grep -i error
```

Expected: no errors. If you see `invalid byte sequence` or similar, check the YAML for encoding issues.

- [ ] **Step 3: Commit**

```bash
git add _data/teaching_graph.yml
git commit -m "feat: add teaching graph data file"
```

---

## Task 2: Rewrite `teaching/index.md` with the D3 graph

**Files:**
- Modify: `teaching/index.md`

The graph has three node types. Node labels use `short` for SLOs (full labels are too wide for the graph canvas). Statement and lecture nodes navigate on click; SLO nodes filter on click.

Color constants used throughout:
- Statement: `rgb(122, 6, 97)` (site magenta)
- SLO: `#c45a8a` (lightened magenta)
- Lecture: `rgb(6, 97, 122)` (site teal)
- Links: `rgba(122, 6, 97, 0.2)`
- Labels: `#333333` (default), `rgb(122, 6, 97)` (SLO labels)
- Background: `rgb(248, 248, 255)` (site background)

- [ ] **Step 1: Replace `teaching/index.md` with the following**

```markdown
---
layout: default
title: Teaching - Glenn S. Ritchey III
---

# Teaching

My teaching begins with a straightforward belief: students are already writers. In my First-Year Composition courses, I help students recognize and sharpen the sophisticated literacies they already possess, applying those skills deliberately in academic contexts.

I design courses around questions of language, identity, and power, treating writing as one literacy among many and emphasizing collaborative, process-based work that builds genuine classroom community.

<div id="teaching-graph-container">
  <div id="teaching-graph"></div>
  <div id="graph-legend">
    <span class="legend-item"><span class="legend-dot statement-dot"></span> Teaching Statement</span>
    <span class="legend-item"><span class="legend-dot slo-dot"></span> Learning Outcome</span>
    <span class="legend-item"><span class="legend-dot lecture-dot"></span> Lecture</span>
    <p class="legend-hint">Click an outcome to filter · Click a node to open · Drag to explore</p>
  </div>
</div>

<style>
  #teaching-graph-container {
    width: 100%;
    position: relative;
  }
  #teaching-graph {
    width: 100%;
    height: 600px;
    background: rgb(248, 248, 255);
    border-radius: 4px;
    overflow: hidden;
  }
  #graph-legend {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    font-size: 0.85rem;
    color: #8a8880;
    flex-wrap: wrap;
  }
  .legend-item { display: flex; align-items: center; gap: 0.4rem; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .statement-dot { background: rgb(122, 6, 97); }
  .slo-dot { background: #c45a8a; }
  .lecture-dot { background: rgb(6, 97, 122); }
  .legend-hint { margin: 0; font-size: 0.8rem; color: #5a5a56; }
  .node-label {
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    fill: #333333;
    pointer-events: none;
    user-select: none;
  }
  .slo-label { fill: rgb(122, 6, 97); }
  circle.statement-node { cursor: pointer; }
  circle.statement-node:hover { stroke: rgb(122, 6, 97); stroke-width: 2px; }
  circle.lecture-node { cursor: pointer; }
  circle.lecture-node:hover { stroke: rgb(6, 97, 122); stroke-width: 2px; }
  circle.slo-node { cursor: pointer; }
  circle.slo-node:hover { stroke: #c45a8a; stroke-width: 2px; }
</style>

<script>
{% assign tg = site.data.teaching_graph %}

const graphData = {
  nodes: [
    { id: {{ tg.statement.title | jsonify }}, label: {{ tg.statement.title | jsonify }}, url: {{ tg.statement.url | jsonify }}, type: "statement" }{% for slo in tg.slos %},
    { id: {{ slo.id | jsonify }}, label: {{ slo.short | jsonify }}, url: null, type: "slo" }{% endfor %}{% for lecture in tg.lectures %},
    { id: {{ lecture.title | jsonify }}, label: {{ lecture.title | jsonify }}, url: {{ lecture.url | jsonify }}, type: "lecture" }{% endfor %}
  ],
  links: [
    {% for slo in tg.slos %}{ source: {{ tg.statement.title | jsonify }}, target: {{ slo.id | jsonify }} }{% unless forloop.last %},{% endunless %}{% endfor %}{% for lecture in tg.lectures %}{% for slo_id in lecture.slos %},{ source: {{ lecture.title | jsonify }}, target: {{ slo_id | jsonify }} }{% endfor %}{% endfor %}
  ]
};
</script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script>
(function() {
  const container = document.getElementById('teaching-graph');
  const W = container.clientWidth || 800;
  const H = 600;

  const svg = d3.select('#teaching-graph')
    .append('svg')
    .attr('width', W)
    .attr('height', H);

  const g = svg.append('g');

  svg.call(d3.zoom()
    .scaleExtent([0.4, 3])
    .on('zoom', (event) => g.attr('transform', event.transform))
  );

  const nodeColors = {
    statement: 'rgb(122, 6, 97)',
    slo: '#c45a8a',
    lecture: 'rgb(6, 97, 122)'
  };

  const nodeRadii = {
    statement: 18,
    slo: 10,
    lecture: 12
  };

  const simulation = d3.forceSimulation(graphData.nodes)
    .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(d => {
      const src = graphData.nodes.find(n => n.id === (d.source.id || d.source));
      return src && src.type === 'statement' ? 130 : 90;
    }))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(35));

  const link = g.append('g')
    .selectAll('line')
    .data(graphData.links)
    .join('line')
    .attr('stroke', 'rgba(122, 6, 97, 0.2)')
    .attr('stroke-width', 1.5);

  const node = g.append('g')
    .selectAll('circle')
    .data(graphData.nodes)
    .join('circle')
    .attr('r', d => nodeRadii[d.type])
    .attr('fill', d => nodeColors[d.type])
    .attr('class', d => `${d.type}-node`)
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

  node.filter(d => d.type === 'statement' || d.type === 'lecture')
    .on('click', (event, d) => { window.location.href = d.url; });

  node.filter(d => d.type === 'slo')
    .on('click', (event, d) => {
      event.stopPropagation();
      const connectedIds = new Set(
        graphData.links
          .filter(l => (l.source.id || l.source) === d.id || (l.target.id || l.target) === d.id)
          .map(l => (l.source.id || l.source) === d.id
            ? (l.target.id || l.target)
            : (l.source.id || l.source))
      );
      node.attr('opacity', n => n.id === d.id || connectedIds.has(n.id) ? 1 : 0.15);
      link.attr('opacity', l =>
        (l.source.id || l.source) === d.id || (l.target.id || l.target) === d.id ? 1 : 0.05
      );
    });

  svg.on('click', () => {
    node.attr('opacity', 1);
    link.attr('opacity', 1);
  });

  const label = g.append('g')
    .selectAll('text')
    .data(graphData.nodes)
    .join('text')
    .attr('class', d => d.type === 'slo' ? 'node-label slo-label' : 'node-label')
    .attr('dy', d => {
      if (d.type === 'statement') return -22;
      if (d.type === 'slo') return -14;
      return -16;
    })
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

## Other Teaching Materials

<div class="cv-navigation">
  <ul>
    <li><a href="{{ site.baseurl }}/teaching/syllabi/" class="animated-link">Course Syllabi</a></li>
    <li><a href="{{ site.baseurl }}/teaching/zines/" class="animated-link">DIY Zine Library</a></li>
  </ul>
</div>
```

- [ ] **Step 2: Build and verify**

```bash
bundle exec jekyll build 2>&1 | grep -i error
```

Expected: no errors. A common failure here is a Liquid syntax error in the `graphData` block — if you see one, check that every `{% %}` tag is closed and that the comma logic in `links` is correct (the SLO loop uses trailing commas via `{% unless forloop.last %}`, and the lecture loop uses leading commas before each `{ source:... }`).

- [ ] **Step 3: Serve and verify visually**

```bash
bundle exec jekyll serve
```

Open `http://localhost:4000/teaching/` in a browser. Verify:
- Graph canvas appears (light background, no dark panel)
- Three node types visible: one large magenta node (Teaching Statement), six mid-sized rosé/pink nodes (SLOs), six teal nodes (lectures)
- Links connect statement to all SLOs, and lectures to their mapped SLOs
- Clicking an SLO node fades unconnected nodes
- Clicking the background resets
- Clicking "Teaching Statement" navigates to `/teaching/statement/`
- Legend dots match node colors
- "Course Syllabi" and "DIY Zine Library" links appear below the graph

- [ ] **Step 4: Commit**

```bash
git add teaching/index.md
git commit -m "feat: add teaching network graph with SLO keyword layer"
```

---

## Task 3: Update `projects/index.md` color palette

**Files:**
- Modify: `projects/index.md`

Six targeted replacements — no structural changes. Every old value → new value is listed explicitly below.

- [ ] **Step 1: Update the CSS block (lines 16–52 of current file)**

Replace the entire `<style>` block inside `projects/index.md` with:

```html
<style>
  #project-graph-container {
    width: 100%;
    position: relative;
  }
  #project-graph {
    width: 100%;
    height: 600px;
    background: rgb(248, 248, 255);
    border-radius: 4px;
    overflow: hidden;
  }
  #graph-legend {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    font-size: 0.85rem;
    color: #8a8880;
    flex-wrap: wrap;
  }
  .legend-item { display: flex; align-items: center; gap: 0.4rem; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .project-dot { background: rgb(122, 6, 97); }
  .tag-dot { background: rgb(6, 97, 122); }
  .legend-hint { margin: 0; font-size: 0.8rem; color: #5a5a56; }
  .node-label {
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    fill: #333333;
    pointer-events: none;
    user-select: none;
  }
  .tag-label { fill: rgb(122, 6, 97); }
  circle.project-node { cursor: pointer; }
  circle.project-node:hover { stroke: rgb(122, 6, 97); stroke-width: 2px; }
  circle.tag-node { cursor: pointer; }
</style>
```

- [ ] **Step 2: Update the JS color values in the D3 rendering block**

Find and replace these two lines in the second `<script>` block:

Old:
```javascript
    .attr('stroke', '#3a3a36')
```
New:
```javascript
    .attr('stroke', 'rgba(122, 6, 97, 0.2)')
```

Old:
```javascript
    .attr('fill', d => d.type === 'project' ? '#e85d3d' : '#4a90c4')
```
New:
```javascript
    .attr('fill', d => d.type === 'project' ? 'rgb(122, 6, 97)' : 'rgb(6, 97, 122)')
```

- [ ] **Step 3: Build and verify**

```bash
bundle exec jekyll build 2>&1 | grep -i error
```

Expected: no errors.

- [ ] **Step 4: Serve and verify visually**

```bash
bundle exec jekyll serve
```

Open `http://localhost:4000/projects/` in a browser. Verify:
- Graph background is light (matches page background, seamless)
- Project nodes are magenta (`rgb(122, 6, 97)`)
- Tag nodes are teal (`rgb(6, 97, 122)`)
- Links are soft magenta (barely visible, recedes)
- Node labels are dark (`#333333`)
- Tag labels are magenta
- Legend dots match node colors
- Clicking a tag still filters; clicking a project still navigates
- Hover states work on project nodes

- [ ] **Step 5: Commit**

```bash
git add projects/index.md
git commit -m "style: unify projects graph with site color palette"
```
