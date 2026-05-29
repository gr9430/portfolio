---
layout: default
title: Teaching
---

<div id="teaching-graph-container">
  <div id="teaching-graph"></div>
  <div id="teaching-legend">
    <span class="legend-item"><span class="legend-dot statement-dot"></span> Statement</span>
    <span class="legend-item"><span class="legend-dot course-dot"></span> Course</span>
    <span class="legend-item"><span class="legend-dot material-dot"></span> Material</span>
    <p class="legend-hint">Click a node to navigate · Drag to explore</p>
  </div>
</div>

<div id="teaching-list-container">
  <div class="filter-controls">
    <div class="active-filters">
      <span class="filter-label">Active Filters:</span>
      <div id="active-filter-list">
        <span class="clear-filters-btn" onclick="clearAllFilters()">Show All</span>
      </div>
    </div>
  </div>

  <section class="project-category">
    <h2>Courses</h2>
    <div class="project-grid">

      <div class="project-card" data-tags="composition,pedagogy,first-year-writing">
        <h3><a href="{{ site.baseurl }}/teaching/enc-1101/">ENC 1101 — Composition I</a></h3>
        <p>First-year composition course helping students recognize and develop the literacies they already possess, applying them deliberately in academic contexts. Organized around questions of language, identity, and power.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('composition')">composition</span>
          <span class="tag" onclick="filterByTag('pedagogy')">pedagogy</span>
          <span class="tag" onclick="filterByTag('first-year-writing')">first-year-writing</span>
        </div>
      </div>

      <div class="project-card" data-tags="composition,pedagogy,research-writing">
        <h3><a href="{{ site.baseurl }}/teaching/enc1102/">ENC 1102 — Composition II</a></h3>
        <p>Research-based writing course emphasizing information literacy, source analysis, and academic conversation. Students develop genuine lines of inquiry and place their analysis in dialogue with existing scholarship.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('composition')">composition</span>
          <span class="tag" onclick="filterByTag('pedagogy')">pedagogy</span>
          <span class="tag" onclick="filterByTag('research-writing')">research-writing</span>
        </div>
      </div>

      <div class="project-card" data-tags="phd,pedagogy,teaching,interdisciplinary">
        <h3><a href="{{ site.baseurl }}/teaching/interdisciplinary-teaching/">Interdisciplinary Teaching</a></h3>
        <p>PhD graduate course in the theory and practice of interdisciplinary humanities course design. Covers foundational pedagogy, inclusive course design, assignment development, and AI-aware teaching practices.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('pedagogy')">pedagogy</span>
          <span class="tag" onclick="filterByTag('teaching')">teaching</span>
          <span class="tag" onclick="filterByTag('interdisciplinary')">interdisciplinary</span>
        </div>
      </div>

    </div>
  </section>

  <section class="project-category">
    <h2>Materials</h2>
    <div class="project-grid">

      <div class="project-card" data-tags="composition,pedagogy,teaching">
        <h3><a href="{{ site.baseurl }}/teaching/statement/">Teaching Statement</a></h3>
        <p>My current teaching philosophy, grounded in the belief that students are already writers. Addresses multiliteracies, collaborative process, and writing as one literacy among many.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('composition')">composition</span>
          <span class="tag" onclick="filterByTag('pedagogy')">pedagogy</span>
          <span class="tag" onclick="filterByTag('teaching')">teaching</span>
        </div>
      </div>

      <div class="project-card" data-tags="composition,pedagogy">
        <h3><a href="{{ site.baseurl }}/teaching/syllabi/">Course Syllabi</a></h3>
        <p>Syllabi for ENC 1101 and ENC 1102 across semesters, including learning outcomes, assignment sequences, and course policies.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('composition')">composition</span>
          <span class="tag" onclick="filterByTag('pedagogy')">pedagogy</span>
        </div>
      </div>

      <div class="project-card" data-tags="composition,multimodal,critical-making">
        <h3><a href="{{ site.baseurl }}/teaching/zines/">DIY Zine Library</a></h3>
        <p>A curated library of DIY zines used in composition courses to model alternative publishing, multimodal argument, and grassroots visual culture.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('composition')">composition</span>
          <span class="tag" onclick="filterByTag('multimodal')">multimodal</span>
          <span class="tag" onclick="filterByTag('critical-making')">critical-making</span>
        </div>
      </div>

      <div class="project-card" data-tags="composition,multimodal,critical-making,accessibility">
        <h3><a href="{{ site.baseurl }}/tools/zinemkr/">Ziner</a></h3>
        <p>Accessibility-first web tool for creating zines in the browser. Built for composition pedagogy with WCAG compliance and no-code design interface.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('composition')">composition</span>
          <span class="tag" onclick="filterByTag('multimodal')">multimodal</span>
          <span class="tag" onclick="filterByTag('critical-making')">critical-making</span>
          <span class="tag" onclick="filterByTag('accessibility')">accessibility</span>
        </div>
      </div>

    </div>
  </section>
</div>

<style>
  #teaching-graph-container {
    width: 1300px;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 3rem;
  }
  #teaching-graph {
    width: 100%;
    height: 900px;
    background: rgb(248, 248, 255);
    border-radius: 4px;
    overflow: hidden;
  }
  #teaching-legend {
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
  .legend-item { display: flex; align-items: center; gap: 0.4rem; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .statement-dot { background: rgb(122, 6, 97); }
  .course-dot    { background: rgb(6, 122, 97); }
  .material-dot  { background: rgb(122, 97, 6); }
  .legend-hint { margin: 0; font-size: 0.8rem; color: #5a5a56; }
  .node-label {
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    fill: #333333;
    pointer-events: none;
    user-select: none;
  }
  .material-label { fill: rgb(122, 97, 6); }
  circle.clickable-node { cursor: pointer; }
  circle.clickable-node:hover { stroke: #333; stroke-width: 2px; }

  #teaching-list-container { width: 100%; }

  .project-category { margin-bottom: 3rem; }
  .project-category h2 {
    color: #7a0661;
    border-bottom: 2px solid #7a0661;
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
    font-family: 'Courier Prime', monospace;
  }
  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  .project-card {
    padding: 1.5rem;
    background: transparent;
    transition: all 0.3s ease;
    position: relative;
    margin-bottom: 1rem;
  }
  .project-card:hover {
    background: #fafafa;
    border-radius: 8px;
    transform: translateY(-2px);
  }
  .project-card.hidden { display: none; }
  .project-card h3 { margin-top: 0; margin-bottom: 1rem; font-size: 1.2rem; }
  .project-card h3 a { text-decoration: none; color: #7a0661; }
  .project-card h3 a:hover { text-decoration: underline; }
  .project-card p { color: #666; line-height: 1.5; margin-bottom: 1rem; }
  .project-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .project-tags .tag {
    background: #e8d9b5;
    color: #7a0661;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-family: 'Courier Prime', monospace;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .project-tags .tag:hover { background: #7a0661; color: white; transform: scale(1.05); }
  .project-tags .tag.active { background: #7a0661; color: white; }

  .filter-controls {
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8f8ff;
    border-radius: 8px;
  }
  .active-filters { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
  .filter-label { font-weight: bold; color: #7a0661; font-family: 'Courier Prime', monospace; }
  .clear-filters-btn {
    background: #7a0661;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    cursor: pointer;
    font-size: 0.8rem;
    font-family: 'Courier Prime', monospace;
    transition: all 0.3s ease;
  }
  .clear-filters-btn:hover { background: #5a0441; }
  .active-filter-tag {
    background: #7a0661;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-family: 'Courier Prime', monospace;
    position: relative;
    cursor: pointer;
  }
  .active-filter-tag:after { content: ' ×'; margin-left: 0.5rem; }
</style>

<script>
const teachingData = {
  nodes: [
    { id: "{{ site.data.teaching_graph.statement.title }}", label: "{{ site.data.teaching_graph.statement.title }}", url: "{{ site.baseurl }}{{ site.data.teaching_graph.statement.url }}", type: "statement" },
    { id: "ENC 1101 at UCF", label: "ENC 1101", url: "{{ site.baseurl }}/teaching/enc-1101/", type: "course" },
    { id: "ENC 1102 at UCF", label: "ENC 1102", url: "{{ site.baseurl }}/teaching/enc1102/", type: "course" },
    { id: "{{ site.data.teaching_graph.interdisciplinary_teaching.title }}", label: "Interdisciplinary Teaching", url: "{{ site.baseurl }}{{ site.data.teaching_graph.interdisciplinary_teaching.url }}", type: "course" },
    {% for component in site.data.teaching_graph.interdisciplinary_teaching_components %}
    { id: {{ component.title | jsonify }}, label: {{ component.title | jsonify }}, url: "{{ site.baseurl }}{{ component.url }}", type: "material" }{% unless forloop.last %},{% endunless %}
    {% endfor %},
    { id: "Course Syllabi", label: "Course Syllabi", url: "{{ site.baseurl }}/teaching/syllabi/", type: "material" },
    { id: "DIY Zine Library", label: "DIY Zine Library", url: "{{ site.baseurl }}/teaching/zines/", type: "material" }
  ],
  links: [
    { source: "{{ site.data.teaching_graph.statement.title }}", target: "ENC 1101 at UCF" },
    { source: "{{ site.data.teaching_graph.statement.title }}", target: "ENC 1102 at UCF" },
    { source: "{{ site.data.teaching_graph.statement.title }}", target: "{{ site.data.teaching_graph.interdisciplinary_teaching.title }}" },
    { source: "{{ site.data.teaching_graph.statement.title }}", target: "Course Syllabi" },
    { source: "{{ site.data.teaching_graph.statement.title }}", target: "DIY Zine Library" },
    { source: "ENC 1101 at UCF", target: "ENC 1102 at UCF" },
    {% for component in site.data.teaching_graph.interdisciplinary_teaching_components %}
    { source: "{{ site.data.teaching_graph.interdisciplinary_teaching.title }}", target: {{ component.title | jsonify }} },
    {% endfor %}
    { source: "ENC 1101 at UCF", target: "Course Syllabi" }
  ]
};
</script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script>
(function() {
  const W = 1300, H = 900;

  const svg = d3.select('#teaching-graph')
    .append('svg').attr('width', W).attr('height', H);

  const g = svg.append('g');

  const zoom = d3.zoom()
    .scaleExtent([0.05, 3])
    .on('zoom', (event) => g.attr('transform', event.transform));
  svg.call(zoom);

  const simulation = d3.forceSimulation(teachingData.nodes)
    .force('link', d3.forceLink(teachingData.links).id(d => d.id).distance(130))
    .force('charge', d3.forceManyBody().strength(-450))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(40));

  const link = g.append('g').selectAll('line').data(teachingData.links).join('line')
    .attr('stroke', '#999').attr('stroke-width', 1.5);

  const node = g.append('g').selectAll('circle').data(teachingData.nodes).join('circle')
    .attr('r', d => {
      if (d.type === 'statement') return 14;
      if (d.type === 'course') return 12;
      return 8;
    })
    .attr('fill', d => {
      if (d.type === 'statement') return 'rgb(122, 6, 97)';
      if (d.type === 'course') return 'rgb(6, 122, 97)';
      return 'rgb(122, 97, 6)';
    })
    .attr('class', d => d.url ? 'clickable-node' : 'node')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
    );

  node.filter(d => d.url)
    .on('click', (event, d) => { window.location.href = d.url; });

  node.filter(d => !d.url)
    .on('click', (event, d) => {
      event.stopPropagation();
      const connected = new Set(
        teachingData.links
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
    return d.type === 'statement' || d.type === 'course';
  }

  const label = g.append('g').selectAll('text').data(teachingData.nodes).join('text')
    .attr('class', d => d.type === 'material' ? 'node-label material-label' : 'node-label')
    .attr('dy', d => {
      if (d.type === 'statement') return -18;
      if (d.type === 'course') return -16;
      return -12;
    })
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
    const ns = teachingData.nodes, pad = 50;
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
})();

// Filtering
let activeFilters = new Set();

function filterByTag(tag) {
  if (activeFilters.has(tag)) { activeFilters.delete(tag); } else { activeFilters.add(tag); }
  updateFilters();
  applyFilters();
}

function clearAllFilters() {
  activeFilters.clear();
  updateFilters();
  applyFilters();
}

function updateFilters() {
  const activeFilterList = document.getElementById('active-filter-list');
  activeFilterList.innerHTML = '';
  if (activeFilters.size === 0) {
    activeFilterList.innerHTML = '<span class="clear-filters-btn" onclick="clearAllFilters()">Show All</span>';
  } else {
    activeFilters.forEach(filter => {
      const el = document.createElement('span');
      el.className = 'active-filter-tag';
      el.textContent = filter;
      el.onclick = () => filterByTag(filter);
      activeFilterList.appendChild(el);
    });
    const clearBtn = document.createElement('span');
    clearBtn.className = 'clear-filters-btn';
    clearBtn.textContent = 'Clear All';
    clearBtn.onclick = clearAllFilters;
    activeFilterList.appendChild(clearBtn);
  }
  document.querySelectorAll('.project-tags .tag').forEach(tagEl => {
    tagEl.classList.toggle('active', activeFilters.has(tagEl.textContent.trim()));
  });
}

function applyFilters() {
  document.querySelectorAll('.project-card').forEach(card => {
    if (activeFilters.size === 0) {
      card.classList.remove('hidden');
    } else {
      const tags = card.getAttribute('data-tags').split(',');
      card.classList.toggle('hidden', !tags.some(t => activeFilters.has(t.trim())));
    }
  });
}

document.addEventListener('DOMContentLoaded', updateFilters);
</script>
