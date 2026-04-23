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
