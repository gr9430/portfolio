# DEC Portfolio Audit + Homepage Rhizome Visualization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit every project page for front matter accuracy and tag consistency, wire in all untracked content, and replace the homepage photo with a full-merge D3.js rhizomatic network combining all project and teaching nodes.

**Architecture:** The site is Jekyll + GitHub Pages. Project graph data comes from `site.pages | where: "project", true` using each page's front matter `tags` array. Teaching graph data comes from `_data/teaching_graph.yml`. The homepage visualization merges both data sources in a single Liquid+JS block, with hard-coded bridge links connecting cross-domain nodes. No central hub — rhizomatic structure, multiple entry points.

**Tech Stack:** Jekyll (Liquid templates), D3.js v7, vanilla JS, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-05-28-portfolio-dec-application-design.md`

---

## Task 1: Add project front matter to `projects/rudimentary-magits/index.html`

**Files:**
- Modify: `projects/rudimentary-magits/index.html`

The sketch is a BPM-synced typographic drawing tool generating text from an anarcho-punk/Lovecraftian corpus. The `index.html` currently has no front matter, so Jekyll treats it as a static file and it is invisible to `site.pages`. Adding `render_with_liquid: false` prevents Jekyll from interpreting any JS template-like syntax in the file.

- [ ] **Step 1: Open `projects/rudimentary-magits/index.html` and add front matter at the very top** (before `<!DOCTYPE html>`)

The file currently starts with `<!DOCTYPE html>`. Prepend exactly this block:

```
---
layout: none
render_with_liquid: false
title: "Rudimentary Magits"
description: "A BPM-synced typographic drawing tool generating text from an anarcho-punk and Lovecraftian corpus, built for Critical Making"
project: true
tags: [phd, critical-making, generative, procedural, visual-culture]
---
```

- [ ] **Step 2: Verify the build passes**

```bash
cd /home/user/portfolio && bundle exec jekyll build 2>&1 | tail -20
```

Expected: `done in X seconds` with no errors. If you see a Liquid error (e.g., `Liquid Exception`), the HTML contains a character sequence Jekyll is misreading. In that case, change `render_with_liquid: false` to confirm it is present and spelled correctly in the front matter.

- [ ] **Step 3: Commit**

```bash
git add projects/rudimentary-magits/index.html
git commit -m "feat: add project front matter to rudimentary-magits"
```

---

## Task 2: Add project front matter to `tools/zinemkr/index.html`

**Files:**
- Modify: `tools/zinemkr/index.html`

Ziner is a self-contained HTML app. It currently has no front matter and does not appear in `site.pages`. Using `layout: none` + `render_with_liquid: false` gives Jekyll the metadata without wrapping the app in the site layout or touching its JS.

- [ ] **Step 1: Open `tools/zinemkr/index.html` and add front matter at the very top** (before `<!DOCTYPE html>`)

```
---
layout: none
render_with_liquid: false
title: "Ziner"
description: "Accessibility-first web application for creating zines with WCAG compliance, multimodal composition support, and no-code design interface for composition pedagogy"
project: true
tags: [pedagogy, accessibility, multimodal, composition, critical-making]
---
```

- [ ] **Step 2: Verify the build passes**

```bash
bundle exec jekyll build 2>&1 | tail -20
```

Expected: clean build. If there is a Liquid error mentioning a file in `tools/zinemkr/`, confirm `render_with_liquid: false` is in the front matter.

- [ ] **Step 3: Commit**

```bash
git add tools/zinemkr/index.html
git commit -m "feat: add project front matter to Ziner"
```

---

## Task 3: Create `projects/demo/index.md` for ePortfolio Resources

**Files:**
- Create: `projects/demo/index.md`

The project card in `projects/index.md` links to `/projects/demo/` but there is no index file there — the path currently 404s. This creates the landing page and adds the project to `site.pages`.

- [ ] **Step 1: Create `projects/demo/index.md`**

```markdown
---
layout: default
title: "ePortfolio Resources"
description: "Interactive network tools and glossary interfaces for composition pedagogy and ePortfolio instruction"
project: true
tags: [pedagogy, network, data-visualization, composition, critical-making]
---

# ePortfolio Resources

Interactive tools for ePortfolio pedagogy in first-year composition at UCF. Built for ENC 1101 to support students working on networked, multimodal portfolios.

- [Glossary](/projects/demo/eportfolio-glossary.html)
- [Network Visualization](/projects/demo/eportfolio-network.html)
- [Resources](/projects/demo/eportfolio-resources.html)
```

- [ ] **Step 2: Verify the build passes**

```bash
bundle exec jekyll build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add projects/demo/index.md
git commit -m "feat: add ePortfolio Resources project index page"
```

---

## Task 4: Fix tag mismatches and wire in untracked files

**Files:**
- Modify: `projects/ulster-visualization/index.md` (add `theories` tag)
- Modify: `projects/henryviii/index.md` (add `theories` tag)
- Modify: `projects/index.md` (add `procedural` to bot card data-tags)
- Stage (no content change needed): `projects/ulster-visualization/network.html`, `projects/interdisciplinary-teaching/index.md`, `teaching/interdisciplinary-teaching/` directory

**Tag mismatches found during audit:**
- Ulster Cycle card has `theories` in `data-tags` but front matter is missing it
- henryviii card has `theories` in `data-tags` but front matter is missing it
- bot card is missing `procedural` from `data-tags` (front matter has it)

- [ ] **Step 1: Add `theories` to `projects/ulster-visualization/index.md` front matter**

Find the line:
```yaml
tags: [phd, data-visualization, network, irish-literature, medieval]
```

Replace with:
```yaml
tags: [phd, data-visualization, network, irish-literature, medieval, theories]
```

- [ ] **Step 2: Add `theories` to `projects/henryviii/index.md` front matter**

Find the line:
```yaml
tags: [phd, twine, network, archive, constraint, pedagogy, history, collaborative]
```

Replace with:
```yaml
tags: [phd, twine, network, archive, constraint, pedagogy, history, collaborative, theories]
```

- [ ] **Step 3: Add `procedural` to the bot card in `projects/index.md`**

Find the bot project card's data-tags attribute:
```html
data-tags="phd,generative,constraint,surveillance,theories"
```

Replace with:
```html
data-tags="phd,generative,procedural,constraint,surveillance,theories"
```

- [ ] **Step 4: Stage all untracked files**

```bash
git add projects/ulster-visualization/index.md \
        projects/ulster-visualization/network.html \
        projects/interdisciplinary-teaching/index.md \
        teaching/interdisciplinary-teaching/
```

- [ ] **Step 5: Commit everything in this task together**

```bash
git add projects/henryviii/index.md projects/index.md
git commit -m "fix: sync project front matter tags with card data-tags; wire in untracked pages"
```

---

## Task 5: Add missing project cards to `projects/index.md`

**Files:**
- Modify: `projects/index.md`

Three projects have front matter but no card in the project index: `interviews`, `interdisciplinary-teaching`, `rudimentary-magits`.

- [ ] **Step 1: Add the Interviews card to the Pedagogical Tools section**

Inside the `<div class="project-grid">` in the Pedagogical Tools `<section>`, add after the ePortfolio Resources card:

```html
      <div class="project-card" data-tags="phd,pedagogy,multimodal,visual-culture" data-updated="2026-03">
        <h3><a href="/projects/interviews/">Published Interviews</a></h3>
        <p>Produced and published video interviews with non-academic writers for pedagogical use in first-year composition courses at UCF. Models creative process and multimodal public scholarship.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('pedagogy')">pedagogy</span>
          <span class="tag" onclick="filterByTag('multimodal')">multimodal</span>
          <span class="tag" onclick="filterByTag('visual-culture')">visual-culture</span>
        </div>
      </div>
```

- [ ] **Step 2: Add the Interdisciplinary Teaching card to the Pedagogical Tools section**

In the same `<div class="project-grid">` in Pedagogical Tools, add after the Interviews card:

```html
      <div class="project-card" data-tags="phd,teaching,pedagogy,interdisciplinary" data-updated="2026-05">
        <h3><a href="/projects/interdisciplinary-teaching/">Interdisciplinary Teaching</a></h3>
        <p>Graduate coursework in the theory and practice of designing interdisciplinary humanities courses, addressing pedagogical foundations, AI integration, and inclusive course design. Includes signature assignment, syllabus development, and teaching statement.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('teaching')">teaching</span>
          <span class="tag" onclick="filterByTag('pedagogy')">pedagogy</span>
          <span class="tag" onclick="filterByTag('interdisciplinary')">interdisciplinary</span>
        </div>
      </div>
```

- [ ] **Step 3: Add the Rudimentary Magits card to the Experimental & Generative section**

In the `<div class="project-grid">` in Experimental & Generative Projects, add after the Your Oppression card:

```html
      <div class="project-card" data-tags="phd,critical-making,generative,procedural,visual-culture" data-updated="2025-09">
        <h3><a href="/projects/rudimentary-magits/">Rudimentary Magits</a></h3>
        <p>A BPM-synced typographic drawing tool built in p5.js for Critical Making, generating text from a weighted anarcho-punk and Lovecraftian corpus in the browser.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('critical-making')">critical-making</span>
          <span class="tag" onclick="filterByTag('generative')">generative</span>
          <span class="tag" onclick="filterByTag('procedural')">procedural</span>
          <span class="tag" onclick="filterByTag('visual-culture')">visual-culture</span>
        </div>
      </div>
```

- [ ] **Step 4: Commit**

```bash
git add projects/index.md
git commit -m "feat: add project cards for interviews, interdisciplinary-teaching, and rudimentary-magits"
```

---

## Task 6: Add Interdisciplinary Teaching to the teaching graph in `teaching/index.md`

**Files:**
- Modify: `teaching/index.md`

The `_data/teaching_graph.yml` already defines `interdisciplinary_teaching` and `interdisciplinary_teaching_components`, but `teaching/index.md`'s graph script does not yet include those nodes or links.

- [ ] **Step 1: Add the Interdisciplinary Teaching node to the `nodes` array in `teaching/index.md`**

Find this line in the `teachingData` nodes section:
```javascript
    { id: "ENC 1102 at UCF", label: "ENC 1102", url: "{{ site.baseurl }}/teaching/enc1102/", type: "course" },
```

Add immediately after it:

```javascript
    { id: "{{ site.data.teaching_graph.interdisciplinary_teaching.title }}", label: "Interdisciplinary Teaching", url: "{{ site.baseurl }}{{ site.data.teaching_graph.interdisciplinary_teaching.url }}", type: "course" },
    {% for component in site.data.teaching_graph.interdisciplinary_teaching_components %}
    { id: {{ component.title | jsonify }}, label: {{ component.title | jsonify }}, url: "{{ site.baseurl }}{{ component.url }}", type: "material" }{% unless forloop.last %},{% endunless %}
    {% endfor %},
```

- [ ] **Step 2: Add the Interdisciplinary Teaching links to the `links` array in `teaching/index.md`**

Find this line in the `teachingData` links section:
```javascript
    { source: "UCF", target: "ENC 1102 at UCF" },
```

Add immediately after it:

```javascript
    { source: "UCF", target: "{{ site.data.teaching_graph.interdisciplinary_teaching.title }}" },
```

Then find:
```javascript
    { source: "UCF", target: "DIY Zine Library" },
```

Add immediately after it:

```javascript
    {% for component in site.data.teaching_graph.interdisciplinary_teaching_components %}
    { source: "{{ site.data.teaching_graph.interdisciplinary_teaching.title }}", target: {{ component.title | jsonify }} },
    {% endfor %}
```

- [ ] **Step 3: Verify the build passes**

```bash
bundle exec jekyll build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add teaching/index.md
git commit -m "feat: add Interdisciplinary Teaching nodes to teaching graph"
```

---

## Task 7: Build and verify the full audit

- [ ] **Step 1: Run a clean build**

```bash
bundle exec jekyll build 2>&1
```

Expected: no errors or warnings. If you see `Liquid Exception` or `page not found` warnings, check the front matter in the file mentioned in the error.

- [ ] **Step 2: Verify project count**

```bash
grep -r "project: true" /home/user/portfolio/projects/ /home/user/portfolio/tools/zinemkr/ 2>/dev/null | grep -v "_site" | wc -l
```

Expected: 14 (SMT, Ulster Cycle, Words Across Worlds, Ziner, ePortfolio Resources, auto-Glenn, SASB Tracery, SASB Bitsy, LAMOS, Walk to School, Your Oppression, Interviews, Interdisciplinary Teaching, Rudimentary Magits).

- [ ] **Step 3: Verify no untracked project files remain**

```bash
git status --short | grep "^??" | grep -E "projects/|teaching/"
```

Expected: only show `projects/ulster-visualization/` and `teaching/interdisciplinary-teaching/` if not yet staged, or nothing if Tasks 4 and 5 completed cleanly.

---

## Task 8: Build homepage rhizomatic visualization in `index.md`

**Files:**
- Modify: `index.md`

Replace the featured image (`![Featured Image](assets/images/DSCF0085.JPG)`) with a full-merge D3.js force graph. No central hub. Projects cluster and teaching cluster are joined by bridge nodes representing shared conceptual territory.

- [ ] **Step 1: Remove the image line from `index.md`**

Find and delete this line at the top of `index.md` (after the front matter):
```markdown
![Featured Image](assets/images/DSCF0085.JPG)
```

- [ ] **Step 2: Add the graph container HTML immediately before `## About`**

Insert this block where the image line was:

```html
<div id="home-graph-container">
  <div id="home-graph"></div>
  <div id="home-graph-legend">
    <span class="legend-item"><span class="legend-dot hg-project-dot"></span> Project</span>
    <span class="legend-item"><span class="legend-dot hg-bridge-dot"></span> Shared Concept</span>
    <span class="legend-item"><span class="legend-dot hg-tag-dot"></span> Tag</span>
    <span class="legend-item"><span class="legend-dot hg-statement-dot"></span> Statement</span>
    <span class="legend-item"><span class="legend-dot hg-course-dot"></span> Course</span>
    <span class="legend-item"><span class="legend-dot hg-gradcourse-dot"></span> Grad Course</span>
    <span class="legend-item"><span class="legend-dot hg-slo-dot"></span> Learning Outcome</span>
    <span class="legend-item"><span class="legend-dot hg-lecture-dot"></span> Lecture</span>
    <span class="legend-item"><span class="legend-dot hg-semester-dot"></span> Semester</span>
    <span class="legend-item"><span class="legend-dot hg-material-dot"></span> Material</span>
    <p class="legend-hint">Click a node to navigate · Click a tag to filter · Hover a shared concept for description · Drag to explore</p>
  </div>
</div>
```

- [ ] **Step 3: Add the data assembly script immediately after the container HTML**

This block uses Liquid to build project data and then JavaScript to construct the node/link arrays. Paste it as a raw `<script>` block:

```html
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

const bridgeTagIds = new Set([
  'playable-texts', 'history', 'critical-making', 'theories',
  'pedagogy', 'composition', 'teaching', 'interdisciplinary'
]);

const nodes = [];
const links = [];

// Project nodes
{% for p in project_pages %}
nodes.push({ id: {{ p.title | jsonify }}, label: {{ p.title | jsonify }}, url: "{{ site.baseurl }}{{ p.url }}", type: "project" });
{% endfor %}

// Tag nodes (all unique tags from project front matter)
{% for tag in all_tag_names %}
nodes.push({ id: {{ tag | jsonify }}, label: {{ tag | jsonify }}, url: null, type: "tag" });
{% endfor %}

// Teaching: primary nodes
nodes.push(
  { id: "Teaching Statement", label: "Teaching Statement", url: "{{ site.baseurl }}/teaching/statement/", type: "statement" },
  { id: "ENC 1101 at UCF", label: "ENC 1101", url: "{{ site.baseurl }}/teaching/enc-1101/", type: "course" },
  { id: "ENC 1102 at UCF", label: "ENC 1102", url: "{{ site.baseurl }}/teaching/enc1102/", type: "course" },
  { id: "Interdisciplinary Teaching", label: "Interdisciplinary Teaching", url: "{{ site.baseurl }}/teaching/interdisciplinary-teaching/", type: "grad-course" },
  { id: "ENC 1102 — Summer 26", label: "Summer 26", url: "{{ site.baseurl }}/teaching/enc1102/summer26/", type: "semester" },
  { id: "AI Policy Summer 26", label: "AI Policy", url: "{{ site.baseurl }}/teaching/enc1102/summer26/aipolicy/", type: "material" },
  { id: "Syllabus Summer 26", label: "Syllabus", url: "{{ site.baseurl }}/teaching/enc1102/summer26/syllabus/", type: "material" },
  { id: "Course Syllabi", label: "Course Syllabi", url: "{{ site.baseurl }}/teaching/syllabi/", type: "material" },
  { id: "DIY Zine Library", label: "DIY Zine Library", url: "{{ site.baseurl }}/teaching/zines/", type: "material" }
);

// ENC 1101 SLOs
{% for slo in site.data.teaching_graph.enc1101_slos %}
nodes.push({ id: "1101-{{ slo.id }}", label: {{ slo.short | jsonify }}, url: null, type: "slo", fullLabel: {{ slo.label | jsonify }}, course: "ENC 1101" });
{% endfor %}

// ENC 1102 SLOs
{% for slo in site.data.teaching_graph.enc1102_slos %}
nodes.push({ id: "1102-{{ slo.id }}", label: {{ slo.short | jsonify }}, url: null, type: "slo", fullLabel: {{ slo.label | jsonify }}, course: "ENC 1102" });
{% endfor %}

// ENC 1101 lectures
{% for lecture in site.data.teaching_graph.enc1101_lectures %}
nodes.push({ id: {{ lecture.title | jsonify }}, label: {{ lecture.title | jsonify }}, url: "{{ site.baseurl }}{{ lecture.url }}", type: "lecture" });
{% endfor %}

// ENC 1102 lectures
{% for lecture in site.data.teaching_graph.enc1102_lectures %}
nodes.push({ id: {{ lecture.title | jsonify }}, label: {{ lecture.title | jsonify }}, url: "{{ site.baseurl }}{{ lecture.url }}", type: "lecture" });
{% endfor %}

// Interdisciplinary Teaching components
{% for component in site.data.teaching_graph.interdisciplinary_teaching_components %}
nodes.push({ id: {{ component.title | jsonify }}, label: {{ component.title | jsonify }}, url: "{{ site.baseurl }}{{ component.url }}", type: "material" });
{% endfor %}

// Project → tag links
{% for p in project_pages %}{% for tag in p.tags %}
links.push({ source: {{ p.title | jsonify }}, target: {{ tag | jsonify }} });
{% endfor %}{% endfor %}

// Teaching cluster links
links.push(
  { source: "Teaching Statement", target: "ENC 1101 at UCF" },
  { source: "Teaching Statement", target: "ENC 1102 at UCF" },
  { source: "Teaching Statement", target: "Course Syllabi" },
  { source: "Teaching Statement", target: "DIY Zine Library" },
  { source: "Interdisciplinary Teaching", target: "Teaching Statement" },
  { source: "ENC 1102 at UCF", target: "ENC 1102 — Summer 26" },
  { source: "ENC 1102 — Summer 26", target: "AI Policy Summer 26" },
  { source: "ENC 1102 — Summer 26", target: "Syllabus Summer 26" }
);

// ENC 1101: course → SLO → lecture
{% for slo in site.data.teaching_graph.enc1101_slos %}
links.push({ source: "ENC 1101 at UCF", target: "1101-{{ slo.id }}" });
{% endfor %}
{% for lecture in site.data.teaching_graph.enc1101_lectures %}{% for slo_id in lecture.slos %}
links.push({ source: "1101-{{ slo_id }}", target: {{ lecture.title | jsonify }} });
{% endfor %}{% endfor %}

// ENC 1102: course → SLO + semester → lecture
{% for slo in site.data.teaching_graph.enc1102_slos %}
links.push({ source: "ENC 1102 at UCF", target: "1102-{{ slo.id }}" });
{% endfor %}
{% for lecture in site.data.teaching_graph.enc1102_lectures %}
links.push({ source: "ENC 1102 — Summer 26", target: {{ lecture.title | jsonify }} });
{% for slo_id in lecture.slos %}
links.push({ source: "1102-{{ slo_id }}", target: {{ lecture.title | jsonify }} });
{% endfor %}
{% endfor %}

// Interdisciplinary Teaching → components
{% for component in site.data.teaching_graph.interdisciplinary_teaching_components %}
links.push({ source: "Interdisciplinary Teaching", target: {{ component.title | jsonify }} });
{% endfor %}

// Bridge links: cross-domain connections between project tags and teaching nodes
links.push(
  { source: "critical-making",    target: "Interdisciplinary Teaching" },
  { source: "theories",           target: "Interdisciplinary Teaching" },
  { source: "interdisciplinary",  target: "Interdisciplinary Teaching" },
  { source: "pedagogy",           target: "Teaching Statement" },
  { source: "teaching",           target: "Teaching Statement" },
  { source: "composition",        target: "ENC 1101 at UCF" },
  { source: "composition",        target: "ENC 1102 at UCF" }
);

const graphData = { nodes, links };
</script>
```

- [ ] **Step 4: Add the D3 visualization script after the data script**

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script>
(function() {
  const container = document.getElementById('home-graph');

  function getDimensions() {
    return {
      width: container.clientWidth || 800,
      height: Math.max(500, Math.min(700, window.innerHeight * 0.7))
    };
  }

  let { width: W, height: H } = getDimensions();

  const svg = d3.select('#home-graph')
    .append('svg')
    .attr('width', W).attr('height', H)
    .attr('viewBox', `0 0 ${W} ${H}`)
    .style('max-width', '100%').style('height', 'auto');

  const g = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => g.attr('transform', e.transform)));

  const simulation = d3.forceSimulation(graphData.nodes)
    .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(30))
    .force('x', d3.forceX(W / 2).strength(0.01))
    .force('y', d3.forceY(H / 2).strength(0.01));

  function nodeRadius(d) {
    if (d.type === 'statement') return 14;
    if (d.type === 'project') return 12;
    if (d.type === 'course') return 12;
    if (d.type === 'grad-course') return 11;
    if (d.type === 'semester') return 10;
    if (bridgeTagIds.has(d.id)) return 10;
    if (d.type === 'slo') return 9;
    if (d.type === 'lecture') return 8;
    if (d.type === 'material') return 7;
    return 8;
  }

  function nodeColor(d) {
    if (d.type === 'project')    return 'rgb(122, 6, 97)';
    if (d.type === 'statement')  return 'rgb(122, 6, 97)';
    if (d.type === 'course')     return 'rgb(6, 122, 97)';
    if (d.type === 'grad-course') return 'rgb(97, 6, 122)';
    if (d.type === 'semester')   return 'rgb(97, 6, 122)';
    if (d.type === 'slo')        return 'rgb(97, 122, 6)';
    if (d.type === 'lecture')    return 'rgb(6, 97, 122)';
    if (d.type === 'material')   return 'rgb(122, 97, 6)';
    if (bridgeTagIds.has(d.id))  return 'rgb(170, 110, 0)';
    return 'rgb(6, 97, 122)';
  }

  const link = g.append('g').selectAll('line').data(graphData.links).join('line')
    .attr('stroke', 'rgba(122, 6, 97, 0.2)').attr('stroke-width', 1.5);

  const node = g.append('g').selectAll('circle').data(graphData.nodes).join('circle')
    .attr('r', nodeRadius)
    .attr('fill', nodeColor)
    .attr('class', d => d.url ? 'hg-clickable-node' : 'hg-node')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
    );

  // Navigate on click for nodes with URLs (but not tags — tags filter instead)
  node.filter(d => d.url && d.type !== 'tag' && !bridgeTagIds.has(d.id))
    .on('click', (e, d) => { window.location.href = d.url; });

  // Tag and bridge nodes: highlight connected nodes on click
  node.filter(d => d.type === 'tag' || bridgeTagIds.has(d.id))
    .on('click', (e, d) => {
      e.stopPropagation();
      const connected = new Set(
        graphData.links
          .filter(l => (l.source.id || l.source) === d.id || (l.target.id || l.target) === d.id)
          .map(l => (l.source.id || l.source) === d.id ? (l.target.id || l.target) : (l.source.id || l.source))
      );
      node.attr('opacity', n => n.id === d.id || connected.has(n.id) ? 1 : 0.15);
      link.attr('opacity', l =>
        (l.source.id || l.source) === d.id || (l.target.id || l.target) === d.id ? 1 : 0.05
      );
    });

  // Tooltip for bridge tags and SLOs
  const bridgeDescriptions = {
    'playable-texts':   'Playable Texts and Technology — examines digital games and playable media as sites of cultural meaning-making, experimental design, and critical inquiry.',
    'history':          'Texts and Technology in History — explores how technologies have shaped the nature and production of texts from orality through digital media.',
    'theories':         'Theories of Texts and Technology — core PhD course introducing the theoretical concepts, methods, and questions foundational to the T&T program.',
    'critical-making':  'Critical Making — making as scholarship; humanities research-creation interweaving design, function, and theory across code, software, and hardware.',
    'pedagogy':         'Pedagogy — shared conceptual territory bridging research projects and first-year composition teaching.',
    'composition':      'Composition — connects writing pedagogy in ENC 1101 and ENC 1102 with tools and projects built for composition contexts.',
    'teaching':         'Teaching — bridges scholarly work on interdisciplinary pedagogy with classroom practice.',
    'interdisciplinary':'Interdisciplinary — connects graduate coursework in interdisciplinary course design with research projects crossing disciplinary boundaries.'
  };

  const tooltip = d3.select('#home-graph-container').append('div')
    .style('position', 'absolute').style('display', 'none')
    .style('background', '#fdfdfd').style('border', '1px solid rgb(122, 6, 97)')
    .style('padding', '0.35rem 0.65rem').style('font-size', '0.78rem')
    .style('font-family', "'Courier Prime', monospace").style('color', '#333')
    .style('border-radius', '3px').style('pointer-events', 'none')
    .style('max-width', '220px').style('line-height', '1.4').style('z-index', '10');

  function showTooltip(event, text) {
    const rect = document.getElementById('home-graph-container').getBoundingClientRect();
    tooltip.style('display', 'block')
      .style('left', (event.clientX - rect.left + 14) + 'px')
      .style('top',  (event.clientY - rect.top - 8) + 'px')
      .text(text);
  }

  node.filter(d => bridgeTagIds.has(d.id))
    .on('mouseover', (e, d) => { if (bridgeDescriptions[d.id]) showTooltip(e, bridgeDescriptions[d.id]); })
    .on('mouseout', () => tooltip.style('display', 'none'));

  node.filter(d => d.type === 'slo')
    .on('mouseover', (e, d) => showTooltip(e, d.fullLabel || d.label))
    .on('mouseout', () => tooltip.style('display', 'none'));

  svg.on('click', () => { node.attr('opacity', 1); link.attr('opacity', 1); });

  const label = g.append('g').selectAll('text').data(graphData.nodes).join('text')
    .attr('class', 'hg-node-label')
    .attr('dy', d => -nodeRadius(d) - 4)
    .attr('text-anchor', 'middle')
    .text(d => d.label);

  simulation.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('cx', d => d.x).attr('cy', d => d.y);
    label.attr('x', d => d.x).attr('y', d => d.y);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const { width: nW, height: nH } = getDimensions();
      if (nW !== W || nH !== H) {
        W = nW; H = nH;
        svg.attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`);
        simulation.force('center', d3.forceCenter(W / 2, H / 2)).alpha(0.3).restart();
      }
    }, 250);
  });
})();
</script>
```

- [ ] **Step 5: Add the CSS for the graph and legend**

Add this `<style>` block anywhere in `index.md` (e.g., after the scripts):

```html
<style>
#home-graph-container {
  width: 120%;
  position: relative;
  left: -10%;
  margin-bottom: 3rem;
}
#home-graph {
  width: 100%;
  height: 70vh;
  min-height: 500px;
  max-height: 700px;
  background: transparent;
  overflow: visible;
}
#home-graph-legend {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: #8a8880;
  flex-wrap: wrap;
  text-align: center;
}
.hg-node-label {
  font-family: 'Courier Prime', monospace;
  font-size: 11px;
  fill: #333333;
  pointer-events: none;
  user-select: none;
}
circle.hg-clickable-node { cursor: pointer; }
circle.hg-clickable-node:hover { stroke: rgb(122, 6, 97); stroke-width: 2px; }
/* Legend dots */
.hg-project-dot   { background: rgb(122, 6, 97); }
.hg-bridge-dot    { background: rgb(170, 110, 0); }
.hg-tag-dot       { background: rgb(6, 97, 122); }
.hg-statement-dot { background: rgb(122, 6, 97); }
.hg-course-dot    { background: rgb(6, 122, 97); }
.hg-gradcourse-dot { background: rgb(97, 6, 122); }
.hg-slo-dot       { background: rgb(97, 122, 6); }
.hg-lecture-dot   { background: rgb(6, 97, 122); }
.hg-semester-dot  { background: rgb(97, 6, 122); }
.hg-material-dot  { background: rgb(122, 97, 6); }
@media (max-width: 768px) {
  #home-graph-container { width: 110%; left: -5%; }
  #home-graph { height: 60vh; min-height: 400px; }
}
@media (max-width: 480px) {
  #home-graph-container { width: 100%; left: 0; }
  #home-graph { height: 50vh; min-height: 350px; }
}
</style>
```

- [ ] **Step 6: Verify the build passes**

```bash
bundle exec jekyll build 2>&1 | tail -20
```

Expected: clean build.

- [ ] **Step 7: Commit**

```bash
git add index.md
git commit -m "feat: replace homepage image with rhizomatic D3 network visualization"
```

---

## Task 9: Serve and visually verify

- [ ] **Step 1: Start the dev server**

```bash
bundle exec jekyll serve --livereload 2>&1 &
```

Open `http://localhost:4000` in a browser.

- [ ] **Step 2: Verify the homepage graph**

Check each of the following:
- Graph renders (nodes and links visible, not blank)
- Both clusters are present: project nodes (purple) and teaching nodes (greens/olive)
- Bridge nodes (amber) are visible — hover one to confirm tooltip appears
- Clicking a project node navigates to its project page
- Clicking a tag node fades unconnected nodes
- Clicking the SVG background resets opacity
- Drag and zoom work

- [ ] **Step 3: Verify the projects page**

Open `http://localhost:4000/projects/`.

- Confirm the project graph (top of page) includes the new projects: Rudimentary Magits, Interviews, Interdisciplinary Teaching
- Confirm all three new cards appear in the correct sections

- [ ] **Step 4: Verify the teaching page**

Open `http://localhost:4000/teaching/`.

- Confirm Interdisciplinary Teaching node appears in the teaching graph

- [ ] **Step 5: Spot-check two project pages for broken links**

Open `/projects/ulster-visualization/` and `/projects/interdisciplinary-teaching/` and confirm they render correctly and that their interactive links work.

- [ ] **Step 6: Final commit if any minor fixes were needed**

```bash
git add -p  # stage only the specific fixes
git commit -m "fix: visual verification corrections"
```
