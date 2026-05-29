---
layout: default
title: Glenn S. Ritchey III - Home
---

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

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script>
(function() {
  const container = document.getElementById('home-graph');

  function getDimensions() {
    return { width: 900, height: 900 };
  }

  let { width: W, height: H } = getDimensions();

  const svg = d3.select('#home-graph')
    .append('svg')
    .attr('width', W).attr('height', H)
    .attr('viewBox', `0 0 ${W} ${H}`)
    .style('max-width', '100%').style('height', 'auto');

  const g = svg.append('g');
  const zoom = d3.zoom().scaleExtent([0.05, 3]).on('zoom', e => g.attr('transform', e.transform));
  svg.call(zoom);

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

  simulation.on('end', () => {
    const ns = graphData.nodes, pad = 50;
    const x0 = Math.min(...ns.map(d => d.x)) - pad;
    const x1 = Math.max(...ns.map(d => d.x)) + pad;
    const y0 = Math.min(...ns.map(d => d.y)) - pad;
    const y1 = Math.max(...ns.map(d => d.y)) + pad;
    const s = Math.min(W / (x1 - x0), H / (y1 - y0));
    const tx = (W - s * (x0 + x1)) / 2;
    const ty = (H - s * (y0 + y1)) / 2;
    svg.transition().duration(750)
      .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(s));
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

<style>
#home-graph-container {
  width: 900px;
  max-width: 100vw;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 3rem;
}
#home-graph {
  width: 100%;
  height: 900px;
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
.legend-item { display: flex; align-items: center; gap: 0.4rem; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.legend-hint { margin: 0; font-size: 0.8rem; color: #5a5a56; }
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
</style>

## About

I make poetry, fiction, and physical artifacts with rule-based systems—<a href="/creative/" class="animated-link">Markov chains, cut-up algorithms, constrained generation</a>. These works investigate what happens when we open the black box: treating algorithmic authorship as a transparent, deliberate process rather than corporate "magic." My practice includes generative text devices with thermal printers, conceptual sculpture engaging right-to-repair advocacy, data visualizations pairing political data with grassroots visual culture, and independent publishing through zines and small press.

I'm a PhD student in <a href="https://cah.ucf.edu/textstech/who-we-are/" class="animated-link">Texts & Technology at UCF</a>, where my research examines constraint-based literature and procedural authorship. My scholarly work explores how communities maintain narrative control in contested spaces—particularly through visual culture in Belfast and Kashmir—while my creative practice builds generative tools that make process visible and accessible.

A central question animates both trajectories: How do we democratize who gets to make meaning?

This operates across my creative work (designing open-source generative systems), my research (examining who controls narrative technologies), and my <a href="/teaching/" class="animated-link">teaching</a> (helping first-year composition students navigate what "writing" means inside and outside algorithmic spaces).