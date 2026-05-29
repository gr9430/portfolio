---
layout: default
title: Projects
project: false
---

<div id="project-graph-container">
    <div id="graph-legend">
    <span class="legend-item"><span class="legend-dot project-dot"></span> Project</span>
    <span class="legend-item"><span class="legend-dot tag-dot"></span> Topic</span>
    <span class="legend-item"><span class="legend-dot course-tag-dot"></span> Course</span>
    </div>
    <div id="graph-legend">
    <p class="legend-hint">Click a tag to filter · Click a project to open · Hover a course tag for description · Drag to explore</p>
  </div>
  <div id="project-graph"></div>
</div>

<div id="project-list-container">
  <div class="filter-controls">
    <div class="active-filters">
      <span class="filter-label">Active Filters:</span>
      <div id="active-filter-list">
        <span class="clear-filters-btn" onclick="clearAllFilters()">Show All Projects</span>
      </div>
    </div>
  </div>

  <section class="project-category">
    <div class="project-grid">

      <!-- Celtic Mythology & Network Analysis -->
      <div class="project-card" data-tags="phd,data-visualization,network,history,collaborative" data-updated="2026-05">
        <h3><a href="/projects/smt/">Lost in Translation: Celtic Myth and the Persona Series</a></h3>
        <p>Collaborative digital humanities research examining cultural erasures in video game adaptation of Celtic mythology. Combines interactive D3.js network visualization with team-based critical analysis using Padlet presentations.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('data-visualization')">data-visualization</span>
          <span class="tag" onclick="filterByTag('network')">network</span>
          <span class="tag" onclick="filterByTag('history')">history</span>
          <span class="tag" onclick="filterByTag('collaborative')">collaborative</span>
        </div>
      </div>

      <div class="project-card" data-tags="phd,data-visualization,network,irish-literature,medieval,theories" data-updated="2026-05">
        <h3><a href="/projects/ulster-visualization/">Ulster Cycle Network</a></h3>
        <p>Interactive network visualization of Irish mythology mapping the interconnected narrative structure of the Ulster Cycle stories.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('data-visualization')">data-visualization</span>
          <span class="tag" onclick="filterByTag('network')">network</span>
          <span class="tag" onclick="filterByTag('irish-literature')">irish-literature</span>
          <span class="tag" onclick="filterByTag('theories')">theories</span>
        </div>
      </div>

      <!-- Collaborative Research Tools -->
      <div class="project-card" data-tags="phd,twine,network,archive,constraint,pedagogy,history,collaborative,theories" data-updated="2026-03">
        <h3><a href="/projects/henryviii/">Words Across Worlds</a></h3>
        <p>Collaborative Twine project mapping Protestant Reformation as global textual network, with interactive GUI demonstrating digital research methodologies across disciplines.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('twine')">twine</span>
          <span class="tag" onclick="filterByTag('collaborative')">collaborative</span>
          <span class="tag" onclick="filterByTag('history')">history</span>
          <span class="tag" onclick="filterByTag('theories')">theories</span>
        </div>
      </div>

    </div>
  </section>

  <section class="project-category">
    <h2>Pedagogical Tools</h2>
    <div class="project-grid">
      <!-- Ziner needs proper tag lookup since it's in tools/ not projects/ -->
      <div class="project-card" data-tags="pedagogy,accessibility,multimodal,composition,critical-making" data-updated="2026-01">
        <h3><a href="/tools/zinemkr/">Ziner</a></h3>
        <p>Accessibility-first web application for creating zines with WCAG compliance, multimodal composition support, and no-code design interface for composition pedagogy.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('pedagogy')">pedagogy</span>
          <span class="tag" onclick="filterByTag('accessibility')">accessibility</span>
          <span class="tag" onclick="filterByTag('multimodal')">multimodal</span>
          <span class="tag" onclick="filterByTag('composition')">composition</span>
          <span class="tag" onclick="filterByTag('critical-making')">critical-making</span>
        </div>
      </div>

      <!-- Need to check what tags ePortfolio actually has -->
      <div class="project-card" data-tags="pedagogy,network,data-visualization,composition,critical-making" data-updated="2025-11">
        <h3><a href="/projects/demo/">ePortfolio Resources</a></h3>
        <p>Interactive network tools and glossary interfaces for composition pedagogy and ePortfolio instruction.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('pedagogy')">pedagogy</span>
          <span class="tag" onclick="filterByTag('network')">network</span>
          <span class="tag" onclick="filterByTag('data-visualization')">data-visualization</span>
          <span class="tag" onclick="filterByTag('composition')">composition</span>
          <span class="tag" onclick="filterByTag('critical-making')">critical-making</span>
        </div>
      </div>

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

      <div class="project-card" data-tags="phd,teaching,pedagogy,interdisciplinary" data-updated="2026-05">
        <h3><a href="/teaching/interdisciplinary-teaching/">Interdisciplinary Teaching</a></h3>
        <p>A PhD course in the theory and practice of interdisciplinary course design. Coursework includes a signature assignment, full syllabus development, teaching statement, and final portfolio — all oriented around inclusive and AI-aware humanities pedagogy.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('teaching')">teaching</span>
          <span class="tag" onclick="filterByTag('pedagogy')">pedagogy</span>
          <span class="tag" onclick="filterByTag('interdisciplinary')">interdisciplinary</span>
        </div>
      </div>
    </div>
  </section>

  <section class="project-category">
    <h2>Experimental & Generative Projects</h2>
    <div class="project-grid">
      <div class="project-card" data-tags="phd,generative,procedural,constraint,surveillance,theories" data-updated="2025-10">
        <h3><a href="/projects/bot/">auto-Glenn</a></h3>
        <p>Social media bot using Tracery grammar to generate Foucauldian and OuLiPo-inspired text, exploring automation, agency, and platform studies.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('generative')">generative</span>
          <span class="tag" onclick="filterByTag('constraint')">constraint</span>
          <span class="tag" onclick="filterByTag('theories')">theories</span>
        </div>
      </div>

      <div class="project-card" data-tags="phd,eLit,generative,procedural,constraint,critical-making" data-updated="2025-08">
        <h3><a href="/projects/sasb/">Shooting a Still Bird (Tracery)</a></h3>
        <p>A Tracery-based generative text project building a combinatorial book from a personal corpus, in the Oulipian tradition.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('eLit')">eLit</span>
          <span class="tag" onclick="filterByTag('generative')">generative</span>
          <span class="tag" onclick="filterByTag('procedural')">procedural</span>
          <span class="tag" onclick="filterByTag('constraint')">constraint</span>
        </div>
      </div>

      <div class="project-card" data-tags="phd,eLit,playable-texts,critical-making" data-updated="2025-05">
        <h3><a href="/projects/sasb-bitsy/">Shooting a Still Bird (Bitsy)</a></h3>
        <p>Bitsy game exploring constraint-based design and environmental storytelling with pixel art and minimal interaction mechanics.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('eLit')">eLit</span>
          <span class="tag" onclick="filterByTag('playable-texts')">playable-texts</span>
          <span class="tag" onclick="filterByTag('critical-making')">critical-making</span>
        </div>
      </div>

      <div class="project-card" data-tags="eLit,twine,constraint,place-based,playable-texts" data-updated="2025-06">
        <h3><a href="/projects/lamos/">Like a Mountain of Sleep</a></h3>
        <p>An experimental interactive fiction piece built with SugarCube — a meditation on memory, place, and the weight of dreams.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('eLit')">eLit</span>
          <span class="tag" onclick="filterByTag('twine')">twine</span>
          <span class="tag" onclick="filterByTag('constraint')">constraint</span>
          <span class="tag" onclick="filterByTag('place-based')">place-based</span>
          <span class="tag" onclick="filterByTag('playable-texts')">playable-texts</span>
        </div>
      </div>

      <div class="project-card" data-tags="phd,critical-making,data-visualization,archive,place-based" data-updated="2025-03">
        <h3><a href="/projects/map/">Walk to School, ~'07</a></h3>
        <p>A place-based critical making project mapping a childhood walk to school circa 2007, excavating gentrification and memory through Google Earth's temporal archive.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('critical-making')">critical-making</span>
          <span class="tag" onclick="filterByTag('data-visualization')">data-visualization</span>
          <span class="tag" onclick="filterByTag('archive')">archive</span>
          <span class="tag" onclick="filterByTag('place-based')">place-based</span>
        </div>
      </div>

      <div class="project-card" data-tags="phd,critical-making,visual-culture,design-justice,archive" data-updated="2025-12">
        <h3><a href="/projects/oppression-aesthetic/">Your Oppression: Our Aesthetic</a></h3>
        <p>A critical examination of album art that aestheticizes human atrocities, built using design justice principles and comprehensive accessibility controls.</p>
        <div class="project-tags">
          <span class="tag" onclick="filterByTag('phd')">phd</span>
          <span class="tag" onclick="filterByTag('critical-making')">critical-making</span>
          <span class="tag" onclick="filterByTag('visual-culture')">visual-culture</span>
          <span class="tag" onclick="filterByTag('design-justice')">design-justice</span>
          <span class="tag" onclick="filterByTag('archive')">archive</span>
        </div>
      </div>

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

    </div>
  </section>
</div>

<style>

  /* Project List Styles */
  .project-category {
    margin-bottom: 3rem;
  }

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

  .project-card.hidden {
    display: none;
  }

  /* Filter Controls */
  .filter-controls {
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8f8ff;
    border-radius: 8px;
  }

  .active-filters {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .filter-label {
    font-weight: bold;
    color: #7a0661;
    font-family: 'Courier Prime', monospace;
  }

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

  .clear-filters-btn:hover {
    background: #5a0441;
  }

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

  .active-filter-tag:after {
    content: ' ×';
    margin-left: 0.5rem;
  }

  .project-card h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .project-card h3 a {
    text-decoration: none;
    color: #7a0661;
  }

  .project-card h3 a:hover {
    text-decoration: underline;
  }

  .project-card p {
    color: #666;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

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

  .project-tags .tag:hover {
    background: #7a0661;
    color: white;
    transform: scale(1.05);
  }

  .project-tags .tag.active {
    background: #7a0661;
    color: white;
  }

  /* Graph Container Styles */
  #project-graph-container {
    width: 1300px;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 3rem;
  }
  #project-graph {
    width: 100%;
    height: 900px;
    background: transparent;
    overflow: visible;
  }

  /* Responsive adjustments for smaller screens */
  @media (max-width: 768px) {
    #project-graph-container {
      width: 110%;
      left: -5%;
    }
  }


  /* Project List Container */
  #project-list-container {
    width: 100%;
  }
  #graph-legend {
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

  function getContainerDimensions() {
    return { width: 1300, height: 900 };
  }

  let { width: W, height: H } = getContainerDimensions();

  const svg = d3.select('#project-graph')
    .append('svg')
    .attr('width', W)
    .attr('height', H)
    .attr('viewBox', `0 0 ${W} ${H}`)
    .style('max-width', '100%')
    .style('height', 'auto');

  const g = svg.append('g');

  const zoom = d3.zoom()
    .scaleExtent([0.05, 3])
    .on('zoom', (event) => g.attr('transform', event.transform));
  svg.call(zoom);

  const simulation = d3.forceSimulation(graphData.nodes)
    .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-600))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(40))
    .force('x', d3.forceX(W / 2).strength(0.02))
    .force('y', d3.forceY(H / 2).strength(0.05));

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

  function isAlwaysLabeled(d) {
    return d.type === 'project' || courseTagIds.has(d.id);
  }

  const label = g.append('g')
    .selectAll('text')
    .data(graphData.nodes)
    .join('text')
    .attr('class', d => d.type === 'project' ? 'node-label' : courseTagIds.has(d.id) ? 'node-label course-tag-label' : 'node-label tag-label')
    .attr('dy', d => d.type === 'project' ? -16 : -12)
    .attr('text-anchor', 'middle')
    .attr('opacity', d => isAlwaysLabeled(d) ? 1 : 0)
    .text(d => d.label);

  node.on('mouseover.label', (e, d) => label.filter(l => l.id === d.id).attr('opacity', 1))
      .on('mouseout.label',  (e, d) => { if (!isAlwaysLabeled(d)) label.filter(l => l.id === d.id).attr('opacity', 0); });

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
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

  // Handle window resize to make visualization responsive
  function handleResize() {
    const { width: newW, height: newH } = getContainerDimensions();

    if (newW !== W || newH !== H) {
      W = newW;
      H = newH;

      svg.attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`);
      simulation.force('center', d3.forceCenter(W / 2, H / 2));
      simulation.alpha(0.3).restart();
    }
  }

  // Throttled resize listener
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 250);
  });
})();

// Project Filtering Functionality
let activeFilters = new Set();

function filterByTag(tag) {
  if (activeFilters.has(tag)) {
    activeFilters.delete(tag);
  } else {
    activeFilters.add(tag);
  }

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

  // Clear current filters display
  activeFilterList.innerHTML = '';

  if (activeFilters.size === 0) {
    activeFilterList.innerHTML = '<span class="clear-filters-btn" onclick="clearAllFilters()">Show All Projects</span>';
  } else {
    // Add each active filter as removable tag
    activeFilters.forEach(filter => {
      const filterTag = document.createElement('span');
      filterTag.className = 'active-filter-tag';
      filterTag.textContent = filter;
      filterTag.onclick = () => filterByTag(filter);
      activeFilterList.appendChild(filterTag);
    });

    // Add clear all button
    const clearBtn = document.createElement('span');
    clearBtn.className = 'clear-filters-btn';
    clearBtn.textContent = 'Clear All';
    clearBtn.onclick = clearAllFilters;
    activeFilterList.appendChild(clearBtn);
  }

  // Update tag visual states
  document.querySelectorAll('.project-tags .tag').forEach(tagEl => {
    if (activeFilters.has(tagEl.textContent.trim())) {
      tagEl.classList.add('active');
    } else {
      tagEl.classList.remove('active');
    }
  });
}

function applyFilters() {
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    if (activeFilters.size === 0) {
      // Show all projects when no filters active
      card.classList.remove('hidden');
    } else {
      // Check if project has any of the active filter tags
      const projectTags = card.getAttribute('data-tags').split(',');
      const hasMatchingTag = projectTags.some(tag => activeFilters.has(tag.trim()));

      if (hasMatchingTag) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    }
  });
}

// Initialize filters when page loads
document.addEventListener('DOMContentLoaded', function() {
  updateFilters();
});
</script>
