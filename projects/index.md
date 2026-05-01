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
    <span class="legend-item"><span class="legend-dot course-tag-dot"></span> Course</span>
    <p class="legend-hint">Click a tag to filter · Click a project to open · Hover a course tag for description · Drag to explore</p>
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
  .course-tag-dot { background: rgb(170, 110, 0); }
  .legend-hint { margin: 0; font-size: 0.8rem; color: #5a5a56; }
  .node-label {
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    fill: #333333;
    pointer-events: none;
    user-select: none;
  }
  .tag-label { fill: rgb(122, 6, 97); }
  .course-tag-label { fill: rgb(170, 110, 0); }
  circle.project-node { cursor: pointer; }
  circle.project-node:hover { stroke: rgb(122, 6, 97); stroke-width: 2px; }
  circle.tag-node { cursor: pointer; }
  circle.course-tag-node { cursor: pointer; }
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
    {% for p in project_pages %}{ id: {{ p.title | jsonify }}, label: {{ p.title | jsonify }}, url: {{ p.url | jsonify }}, type: "project" }{% unless forloop.last %},{% endunless %}
    {% endfor %}{% if project_pages.size > 0 and all_tag_names.size > 0 %},{% endif %}
    {% for tag in all_tag_names %}{ id: {{ tag | jsonify }}, label: {{ tag | jsonify }}, url: null, type: "tag" }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ],
  links: [
    {% for p in project_pages %}{% for tag in p.tags %}{ source: {{ p.title | jsonify }}, target: {{ tag | jsonify }} }{% unless forloop.last and forloop.parentloop.last %},{% endunless %}
    {% endfor %}{% endfor %}
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

  svg.call(d3.zoom()
    .scaleExtent([0.4, 3])
    .on('zoom', (event) => g.attr('transform', event.transform))
  );

  const simulation = d3.forceSimulation(graphData.nodes)
    .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(130))
    .force('charge', d3.forceManyBody().strength(-450))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(45));

  const courseTagIds = new Set(['playable-texts', 'history', 'critical-making', 'theories']);

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
    .attr('r', d => d.type === 'project' ? 12 : 8)
    .attr('fill', d => d.type === 'project' ? 'rgb(122, 6, 97)' : courseTagIds.has(d.id) ? 'rgb(170, 110, 0)' : 'rgb(6, 97, 122)')
    .attr('class', d => d.type === 'project' ? 'project-node' : courseTagIds.has(d.id) ? 'course-tag-node' : 'tag-node')
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

  node.filter(d => d.type === 'project')
    .on('click', (event, d) => { window.location.href = d.url; });

  const tagDescriptions = {
    'playable-texts': 'Playable Texts and Technology — examines digital games and playable media as sites of cultural meaning-making, experimental design, and critical inquiry.',
    'history': 'Texts and Technology in History — explores how technologies have shaped the nature and production of texts from orality through digital media.',
    'theories': 'Theories of Texts and Technology — core PhD course introducing the theoretical concepts, methods, and questions foundational to the T&T program.',
    'critical-making': 'Critical Making — making as scholarship; humanities research-creation interweaving design, function, and theory across code, software, and hardware.',
  };

  const tooltip = d3.select('#project-graph-container')
    .append('div')
    .style('position', 'absolute')
    .style('display', 'none')
    .style('background', '#fdfdfd')
    .style('border', '1px solid rgb(122, 6, 97)')
    .style('padding', '0.35rem 0.65rem')
    .style('font-size', '0.78rem')
    .style('font-family', "'Courier Prime', monospace")
    .style('color', '#333')
    .style('border-radius', '3px')
    .style('pointer-events', 'none')
    .style('max-width', '220px')
    .style('line-height', '1.4')
    .style('z-index', '10');

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
    })
    .on('mouseover', function(event, d) {
      if (tagDescriptions[d.id]) {
        const rect = document.getElementById('project-graph-container').getBoundingClientRect();
        tooltip
          .style('display', 'block')
          .style('left', (event.clientX - rect.left + 14) + 'px')
          .style('top', (event.clientY - rect.top - 8) + 'px')
          .text(tagDescriptions[d.id]);
      }
    })
    .on('mouseout', function() {
      tooltip.style('display', 'none');
    });

  svg.on('click', () => {
    node.attr('opacity', 1);
    link.attr('opacity', 1);
  });

  const label = g.append('g')
    .selectAll('text')
    .data(graphData.nodes)
    .join('text')
    .attr('class', d => d.type === 'project' ? 'node-label' : courseTagIds.has(d.id) ? 'node-label course-tag-label' : 'node-label tag-label')
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
