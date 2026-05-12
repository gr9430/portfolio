---
layout: default
title: Teaching - Glenn S. Ritchey III
---

# Teaching

My teaching begins with a straightforward belief: students are already writers. In my First-Year Composition courses, I help students recognize and sharpen the sophisticated literacies they already possess, applying those skills deliberately in academic contexts.

I design courses around questions of language, identity, and power, treating writing as one literacy among many and emphasizing collaborative, process-based work that builds genuine classroom community.

Please find my teaching statement <a href="{{ site.baseurl }}/teaching/statement/">here</a>.
## Teaching Network

<div id="teaching-graph-container">
  <div id="teaching-graph"></div>
  <div id="teaching-legend">
    <span class="legend-item"><span class="legend-dot ucf-dot"></span> UCF</span>
    <span class="legend-item"><span class="legend-dot statement-dot"></span> Teaching Statement</span>
    <span class="legend-item"><span class="legend-dot course-dot"></span> Course</span>
    <span class="legend-item"><span class="legend-dot lecture-dot"></span> Lecture</span>
    <span class="legend-item"><span class="legend-dot slo-dot"></span> Student Learning Outcome</span>
    <span class="legend-item"><span class="legend-dot material-dot"></span> Teaching Material</span>
    <p class="legend-hint">Click a node to navigate · Drag to explore · Click courses or SLOs to filter</p>
  </div>
</div>

<style>
  #teaching-graph-container {
    width: 100%;
    position: relative;
    margin: 2rem 0;
  }
  #teaching-graph {
    width: 100%;
    height: 600px;
    background: rgb(248, 248, 255);
    border-radius: 4px;
    overflow: hidden;
  }
  #teaching-legend {
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
  .ucf-dot { background: #FFC904; }
  .statement-dot { background: rgb(122, 6, 97); }
  .course-dot { background: rgb(6, 122, 97); }
  .lecture-dot { background: rgb(6, 97, 122); }
  .slo-dot { background: rgb(97, 122, 6); }
  .material-dot { background: rgb(122, 97, 6); }
  .legend-hint { margin: 0; font-size: 0.8rem; color: #5a5a56; }
  .node-label {
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    fill: #333333;
    pointer-events: none;
    user-select: none;
  }
  .slo-label { fill: rgb(97, 122, 6); }
  .material-label { fill: rgb(122, 97, 6); }
  circle.clickable-node { cursor: pointer; }
  circle.clickable-node:hover { stroke: #333; stroke-width: 2px; }
</style>

<script>
const teachingData = {
  nodes: [
    // Central UCF node
    { id: "UCF", label: "UCF", url: null, type: "ucf" },

    // Teaching statement
    { id: "{{ site.data.teaching_graph.statement.title }}", label: "{{ site.data.teaching_graph.statement.title }}", url: "{{ site.baseurl }}{{ site.data.teaching_graph.statement.url }}", type: "statement" },

    // Course nodes
    { id: "ENC 1101 at UCF", label: "ENC 1101", url: "{{ site.baseurl }}/teaching/enc-1101/", type: "course" },
    { id: "ENC 1102 at UCF", label: "ENC 1102", url: "{{ site.baseurl }}/teaching/enc1102/", type: "course" },

    // Student Learning Outcomes (ENC 1101)
    {% for slo in site.data.teaching_graph.enc1101_slos %}
    { id: "1101-{{ slo.id }}", label: "{{ slo.short }}", url: null, type: "slo", fullLabel: "{{ slo.label }}", course: "ENC 1101" }{% unless forloop.last %},{% endunless %}
    {% endfor %},

    // Student Learning Outcomes (ENC 1102)
    {% for slo in site.data.teaching_graph.enc1102_slos %}
    { id: "1102-{{ slo.id }}", label: "{{ slo.short }}", url: null, type: "slo", fullLabel: "{{ slo.label }}", course: "ENC 1102" }{% unless forloop.last %},{% endunless %}
    {% endfor %},

    // Lectures (ENC 1101)
    {% for lecture in site.data.teaching_graph.lectures %}
    { id: "{{ lecture.title }}", label: "{{ lecture.title }}", url: "{{ site.baseurl }}{{ lecture.url }}", type: "lecture", slos: [{% for slo_id in lecture.slos %}"{{ slo_id }}"{% unless forloop.last %},{% endunless %}{% endfor %}] }{% unless forloop.last %},{% endunless %}
    {% endfor %},

    // ENC 1102 Materials
    { id: "AI Policy Summer 26", label: "AI Policy Summer 26", url: "{{ site.baseurl }}/teaching/enc1102/summer26/aipolicy/", type: "lecture" },

    // General Teaching Materials
    { id: "Course Syllabi", label: "Course Syllabi", url: "{{ site.baseurl }}/teaching/syllabi/", type: "material" },
    { id: "DIY Zine Library", label: "DIY Zine Library", url: "{{ site.baseurl }}/teaching/zines/", type: "material" }
  ],
  links: [
    // UCF as central hub - connect to main university components
    { source: "UCF", target: "{{ site.data.teaching_graph.statement.title }}" },
    { source: "UCF", target: "ENC 1101 at UCF" },
    { source: "UCF", target: "ENC 1102 at UCF" },
    { source: "UCF", target: "Course Syllabi" },
    { source: "UCF", target: "DIY Zine Library" },

    // Connect ENC 1101 to its SLOs
    {% for slo in site.data.teaching_graph.enc1101_slos %}
    { source: "ENC 1101 at UCF", target: "1101-{{ slo.id }}" }{% unless forloop.last %},{% endunless %}
    {% endfor %},

    // Connect ENC 1102 to its SLOs
    {% for slo in site.data.teaching_graph.enc1102_slos %}
    { source: "ENC 1102 at UCF", target: "1102-{{ slo.id }}" }{% unless forloop.last %},{% endunless %}
    {% endfor %},

    // Connect ENC 1102 to its materials
    { source: "ENC 1102 at UCF", target: "AI Policy Summer 26" },

    // Connect SLOs to their lectures (update with new ENC 1101 SLO IDs)
    {% for lecture in site.data.teaching_graph.lectures %}
      {% for slo_id in lecture.slos %}
    { source: "1101-{{ slo_id }}", target: "{{ lecture.title }}" }{% unless forloop.last and forloop.parentloop.last %},{% endunless %}
      {% endfor %}
    {% endfor %}
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

  const simulation = d3.forceSimulation(teachingData.nodes)
    .force('link', d3.forceLink(teachingData.links).id(d => d.id).distance(90))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(30));

  const link = g.append('g')
    .selectAll('line')
    .data(teachingData.links)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-width', 1.5);

  const node = g.append('g')
    .selectAll('circle')
    .data(teachingData.nodes)
    .join('circle')
    .attr('r', d => {
      if (d.type === 'ucf') return 16;
      if (d.type === 'statement') return 14;
      if (d.type === 'course') return 12;
      if (d.type === 'slo') return 10;
      if (d.type === 'lecture') return 8;
      return 7;
    })
    .attr('fill', d => {
      if (d.type === 'ucf') return '#FFC904';
      if (d.type === 'statement') return 'rgb(122, 6, 97)';
      if (d.type === 'course') return 'rgb(6, 122, 97)';
      if (d.type === 'lecture') return 'rgb(6, 97, 122)';
      if (d.type === 'slo') return 'rgb(97, 122, 6)';
      return 'rgb(122, 97, 6)';
    })
    .attr('class', d => d.url ? 'clickable-node' : 'node')
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

  // Click to navigate for nodes with URLs
  node.filter(d => d.url)
    .on('click', (event, d) => { window.location.href = d.url; });

  // Filter functionality for SLOs
  node.filter(d => d.type === 'slo')
    .on('click', (event, d) => {
      event.stopPropagation();
      const isFiltered = node.attr('data-filtered') === 'true';

      if (isFiltered) {
        // Reset filter
        node.attr('opacity', 1).attr('data-filtered', null);
        link.attr('opacity', 1);
      } else {
        // Find connected lectures
        const connectedLectures = new Set();
        teachingData.nodes.forEach(n => {
          if (n.type === 'lecture' && n.slos && n.slos.includes(d.id)) {
            connectedLectures.add(n.id);
          }
        });

        // Apply filter
        node.attr('opacity', n => {
          if (n.id === d.id || n.type === 'ucf' || n.type === 'statement' || n.id === d.course + ' at UCF' || connectedLectures.has(n.id)) return 1;
          return 0.2;
        }).attr('data-filtered', 'true');

        link.attr('opacity', l => {
          const sourceId = l.source.id || l.source;
          const targetId = l.target.id || l.target;
          // Show links involving the clicked SLO and its course
          if (sourceId === d.id || targetId === d.id) return 1;
          if (sourceId === 'UCF' && (targetId === 'Teaching Statement' || targetId === d.course + ' at UCF')) return 0.7;
          if (sourceId === d.course + ' at UCF' && targetId === d.id) return 1;
          if (sourceId === 'UCF' || targetId === 'UCF') return 0.3;
          return 0.1;
        });
      }
    });

  // Filter functionality for course nodes
  node.filter(d => d.type === 'course')
    .on('click', (event, d) => {
      event.stopPropagation();
      const isFiltered = node.attr('data-filtered') === 'true';

      if (isFiltered) {
        // Reset filter
        node.attr('opacity', 1).attr('data-filtered', null);
        link.attr('opacity', 1);
      } else {
        // Show course-specific content
        if (d.id === 'ENC 1101 at UCF') {
          // Show UCF, teaching statement, ENC 1101, all ENC 1101 SLOs, and all ENC 1101 lectures
          node.attr('opacity', n => {
            if (n.type === 'ucf' || n.type === 'statement' || n.id === 'ENC 1101 at UCF' || (n.type === 'slo' && n.course === 'ENC 1101') || (n.type === 'lecture' && n.slos)) return 1;
            return 0.2;
          }).attr('data-filtered', 'true');

          link.attr('opacity', l => {
            const sourceId = l.source.id || l.source;
            const targetId = l.target.id || l.target;
            // Show all links involving ENC 1101 content
            if (sourceId === 'UCF' && (targetId === 'Teaching Statement' || targetId === 'ENC 1101 at UCF')) return 1;
            if (sourceId === 'ENC 1101 at UCF' || targetId === 'ENC 1101 at UCF') return 1;
            // Show SLO to lecture links for ENC 1101
            const isENC1101Lecture = teachingData.nodes.find(n => n.id === sourceId || n.id === targetId)?.slos;
            if (isENC1101Lecture) return 1;
            return 0.1;
          });
        } else if (d.id === 'ENC 1102 at UCF') {
          // Show UCF, teaching statement, ENC 1102, ENC 1102 SLOs, and ENC 1102 materials
          node.attr('opacity', n => {
            if (n.type === 'ucf' || n.type === 'statement' || n.id === 'ENC 1102 at UCF' || (n.type === 'slo' && n.course === 'ENC 1102') || n.id === 'AI Policy Summer 26') return 1;
            return 0.2;
          }).attr('data-filtered', 'true');

          link.attr('opacity', l => {
            const sourceId = l.source.id || l.source;
            const targetId = l.target.id || l.target;
            // Show links involving ENC 1102
            if (sourceId === 'UCF' && (targetId === 'Teaching Statement' || targetId === 'ENC 1102 at UCF')) return 1;
            if (sourceId === 'ENC 1102 at UCF' || targetId === 'ENC 1102 at UCF') return 1;
            return 0.1;
          });
        }
      }
    });

  svg.on('click', () => {
    node.attr('opacity', 1).attr('data-filtered', null);
    link.attr('opacity', 1);
  });

  const label = g.append('g')
    .selectAll('text')
    .data(teachingData.nodes)
    .join('text')
    .attr('class', d => {
      if (d.type === 'slo') return 'node-label slo-label';
      if (d.type === 'material') return 'node-label material-label';
      return 'node-label';
    })
    .attr('dy', d => {
      if (d.type === 'ucf') return -20;
      if (d.type === 'statement') return -18;
      if (d.type === 'course') return -16;
      if (d.type === 'slo') return -14;
      return -12;
    })
    .attr('text-anchor', 'middle')
    .text(d => d.label);

  // Add tooltip for SLOs to show full label
  node.filter(d => d.type === 'slo')
    .append('title')
    .text(d => d.fullLabel || d.label);

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('cx', d => d.x).attr('cy', d => d.y);
    label.attr('x', d => d.x).attr('y', d => d.y);
  });
})();
</script>