---
layout: default
title: Glenn S. Ritchey III - Home
---
I make work at the intersection of computational methods and humanistic questions—<a href="/creative/" class="animated-link">Markov chains, cut-up algorithms, constrained generation</a>—with process made visible and accessible as both an aesthetic and a political commitment. My practice includes generative text devices with thermal printers, conceptual sculpture engaging right-to-repair advocacy, data visualizations pairing political data with grassroots visual culture, and independent publishing through small press and zines. I program films, make music, and distribute work through whatever channels resist the black box.

My current projects include <em>Francoism</em>, a narrativized Markov-chain analysis of Jess Franco's filmography forthcoming from Inside the Castle, and <em>Like a Mountain of Sleep</em>, an interactive fiction work accepted to the <a href="https://anastasiasalter.net/ELO2026/cfp.html" class="animated-link">2026 Electronic Literatue Organization conference</a>.

I'm a PhD student in <a href="https://cah.ucf.edu/textstech/who-we-are/" class="animated-link">Texts & Technology at UCF</a>, where my research examines electronic literature, procedural authorship, and visual culture in contested spaces—particularly Belfast and Kashmir.

A central question animates all of it: How do we democratize who gets to make meaning? This operates across my creative work (designing open-source generative systems), my research (examining who controls narrative technologies), and my <a href="/teaching/" class="animated-link">teaching</a> (helping first-year composition students navigate what "writing" means inside and outside algorithmic spaces).

<div id="home-graph-container">
  <div id="home-graph"></div>
  <div id="home-graph-legend">
    <span class="legend-item"><span class="legend-dot hg-project-dot"></span> Project</span>
    <span class="legend-item"><span class="legend-dot hg-course-dot"></span> Course</span>
    <span class="legend-item"><span class="legend-dot hg-tag-dot"></span> Topic</span>
    <p class="legend-hint">Click a project or course to open · Click a topic to highlight connections · Drag to explore</p>
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

const nodes = [];
const links = [];

// Project nodes
{% for p in project_pages %}
nodes.push({ id: {{ p.title | jsonify }}, label: {{ p.title | jsonify }}, url: "{{ site.baseurl }}{{ p.url }}", type: "project" });
{% endfor %}

// Topic nodes (unique tags from project front matter)
{% for tag in all_tag_names %}
nodes.push({ id: {{ tag | jsonify }}, label: {{ tag | jsonify }}, url: null, type: "tag" });
{% endfor %}

// Courses taught
nodes.push(
  { id: "Courses Taught", label: "Courses Taught", url: "{{ site.baseurl }}/teaching/", type: "course" },
  { id: "ENC 1101",       label: "ENC 1101",       url: "{{ site.baseurl }}/teaching/enc-1101/", type: "course" },
  { id: "ENC 1102",       label: "ENC 1102",       url: "{{ site.baseurl }}/teaching/enc1102/", type: "course" }
);

// Project → topic links
{% for p in project_pages %}{% for tag in p.tags %}
links.push({ source: {{ p.title | jsonify }}, target: {{ tag | jsonify }} });
{% endfor %}{% endfor %}

// Course links
links.push(
  { source: "Courses Taught", target: "ENC 1101" },
  { source: "Courses Taught", target: "ENC 1102" },
  { source: "ENC 1101", target: "composition" },
  { source: "ENC 1101", target: "pedagogy" },
  { source: "ENC 1102", target: "composition" },
  { source: "ENC 1102", target: "pedagogy" },
  { source: "ENC 1102", target: "teaching" }
);

const graphData = { nodes, links };
</script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script>
(function() {
  const container = document.getElementById('home-graph');

  function getDimensions() {
    return { width: 1080, height: 900 };
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
    .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-600))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(40))
    .force('x', d3.forceX(W / 2).strength(0.02))
    .force('y', d3.forceY(H / 2).strength(0.02));

  function nodeRadius(d) {
    if (d.type === 'project') return 12;
    if (d.type === 'course' && d.id === 'Courses Taught') return 11;
    if (d.type === 'course') return 9;
    return 8;
  }

  function nodeColor(d) {
    if (d.type === 'project') return 'rgb(122, 6, 97)';
    if (d.type === 'course')  return 'rgb(6, 122, 97)';
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

  // Project and course nodes: navigate on click
  node.filter(d => d.type === 'project' || d.type === 'course')
    .on('click', (e, d) => { window.location.href = d.url; });

  // Topic nodes: highlight connected projects on click
  node.filter(d => d.type === 'tag')
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

  svg.on('click', () => { node.attr('opacity', 1); link.attr('opacity', 1); });

  function isAlwaysLabeled(d) {
    return d.type === 'project' || d.type === 'course';
  }

  const label = g.append('g').selectAll('text').data(graphData.nodes).join('text')
    .attr('class', 'hg-node-label')
    .attr('dy', d => -nodeRadius(d) - 4)
    .attr('text-anchor', 'middle')
    .attr('opacity', d => isAlwaysLabeled(d) ? 1 : 0)
    .text(d => d.label);

  node.on('mouseover.label', (e, d) => label.filter(l => l.id === d.id).attr('opacity', 1))
      .on('mouseout.label',  (e, d) => { if (!isAlwaysLabeled(d)) label.filter(l => l.id === d.id).attr('opacity', 0); });

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
  width: 1080px;
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
.hg-project-dot { background: rgb(122, 6, 97); }
.hg-course-dot  { background: rgb(6, 122, 97); }
.hg-tag-dot     { background: rgb(6, 97, 122); }
</style>