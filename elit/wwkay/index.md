---
layout: default
title: "What we know about you"
description: "A surveillance poetry widget that transforms browser tracking data into live, accumulating verse — entirely client-side, no data transmitted"
project: true
tags: [eLit, Generative, Procedural, Creative Works, Personal Works, Surveillance]
---

<div class="contents-dropdown">
  <select id="contents-nav" onchange="navigateToSection(this.value)">
    <option value="">Navigate to section...</option>
    <option value="#introduction">Introduction</option>
    <option value="#output">Output</option>
    <option value="#visitor-map">Visitor Map</option>
    <option value="#about-this-piece">About This Piece</option>
  </select>
</div>

<script>
function navigateToSection(anchor) {
  if (anchor) {
    document.location.hash = anchor;
  }
}
</script>

# What we know about you {#introduction}

*An experimental transparency widget that reveals the surveillance data your browser collects during ordinary web usage.*

This piece transforms the invisible metrics of digital tracking into a live, accumulating poem. As you navigate through this site, a small widget in the bottom-right corner quietly catalogs the data points that websites typically gather: your browser type, screen dimensions, scroll patterns, time spent on each page, and mouse movements.

Unlike traditional tracking systems, this widget **transmits nothing**. All data remains client-side, stored only in your browser's local memory. The poem grows with each page you visit, creating a personalized verse that makes visible the usually hidden mechanics of web surveillance. Click the widget to reveal the full poem of your digital footprint—a code-comment style reflection of what we reveal simply by browsing.

**Instructions:** Simply browse this site. The widget will automatically begin composing your surveillance poem. Click it when you're curious to read what's been gathered about your session.

---
## Output {#output}
<div id="current-poem-display" style="background-color: rgb(248,248,255); border: 1px solid rgb(122, 6, 97); border-radius: 4px; padding: 1.5rem; margin: 2rem 0; font-family: 'Courier New', Courier, 'Monaco', 'Menlo', monospace; font-size: 12px; line-height: 1.4; color: #000000; white-space: pre-wrap;"><h2>What we know about you</h2>
<em id="no-poem-message" style="color: #666; font-family: inherit;">Your surveillance poem will appear here as you browse the site. Try visiting other pages (elit, blog, teaching) and return to see your accumulated digital footprint...</em>
<pre id="poem-content" style="margin: 0; display: none;"></pre>
</div>

<div style="text-align: center; margin: 1rem 0; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
<button id="download-poem-btn" style="background-color: rgb(122, 6, 97); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; font-family: 'Courier New', Courier, 'Monaco', 'Menlo', monospace; font-size: 11px; font-weight: bold; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: background-color 0.2s ease; display: none;" onmouseover="this.style.backgroundColor='rgb(98, 5, 78)'" onmouseout="this.style.backgroundColor='rgb(122, 6, 97)'">DOWNLOAD YOUR POEM WE MADE</button>
<button id="clear-poem-btn" style="background-color: rgb(156, 156, 156); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; font-family: 'Courier New', Courier, 'Monaco', 'Menlo', monospace; font-size: 11px; font-weight: bold; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: background-color 0.2s ease; display: none;" onmouseover="this.style.backgroundColor='rgb(122, 6, 97)'" onmouseout="this.style.backgroundColor='rgb(156, 156, 156)'">CLEAR POEM</button>
</div>

---

## Visitor Map {#visitor-map}

*A collaborative geographic poetry section where visitors can voluntarily add their location to create collective surveillance verse.*

<div id="visitor-map-section" style="background-color: rgb(248,248,255); border: 1px solid rgb(122, 6, 97); border-radius: 4px; padding: 1.5rem; margin: 2rem 0; font-family: 'Courier New', Courier, 'Monaco', 'Menlo', monospace; font-size: 12px; line-height: 1.4; color: #000000;">

<div style="margin-bottom: 1rem;">
<strong style="color: rgb(122, 6, 97);">visitor_map</strong>
</div>

<div id="visitor-map-display" style="white-space: pre-wrap; margin-bottom: 1rem; min-height: 3rem; padding: 0.75rem; border: 1px dashed rgba(122, 6, 97, 0.3); border-radius: 2px; background-color: rgba(248,248,255, 0.5);">
<em style="color: #666; font-style: italic;">// no visitors yet — be the first to add your location</em>
</div>

<div id="visitor-map-input" style="display: flex; gap: 0.75rem; align-items: flex-start; flex-wrap: wrap;">
<input type="text" id="location-input" placeholder="your location (city, region, country)" maxlength="50" style="flex: 1; min-width: 200px; background-color: rgb(248, 248, 255); border: 1px solid rgb(122, 6, 97); color: #000000; padding: 0.5rem; font-family: inherit; font-size: 11px; border-radius: 2px; outline: none;" onfocus="this.style.borderColor='rgb(98, 5, 78)'; this.style.boxShadow='0 0 0 1px rgb(98, 5, 78)'" onblur="this.style.borderColor='rgb(122, 6, 97)'; this.style.boxShadow='none'">
<button id="add-location-btn" style="background-color: rgb(122, 6, 97); color: white; border: none; padding: 0.5rem 1rem; font-family: inherit; font-size: 11px; cursor: pointer; border-radius: 2px; transition: background-color 0.2s ease;" onmouseover="this.style.backgroundColor='rgb(98, 5, 78)'" onmouseout="this.style.backgroundColor='rgb(122, 6, 97)'">add to map</button>
</div>

<div style="margin-top: 0.75rem; font-size: 10px; color: #666; font-style: italic;">
voluntary • stored locally only • no transmission
</div>

</div>

---

## About This Piece {#about-this-piece}

<div style="margin-top: 1rem; padding: 1.5rem; background-color: rgb(248,248,255); border: 1px solid rgba(122, 6, 97, 0.2); border-radius: 4px;">
<p><strong>Concept:</strong> Digital surveillance critique through experimental literature with collaborative geographic poetry</p>
<p><strong>Technology:</strong> Client-side JavaScript, localStorage, no external requests</p>
<p><strong>Data Policy:</strong> Nothing leaves your browser. Visitor map entries are voluntary and stored locally. Refresh to reset both poem and map.</p>
<p><strong>Genre:</strong> E-literature, surveillance poetry, transparency art, collaborative digital verse</p>
<p><strong>Visitor Map:</strong> A voluntary, transparent alternative to IP-based location tracking—users consciously contribute geographic data to create collaborative surveillance poetry</p>
</div>

<script>
// Display current poem from localStorage
function displayCurrentPoem() {
  try {
    const savedPoem = localStorage.getItem('wwkay-poem');
    const poemContainer = document.getElementById('poem-content');
    const noMessageContainer = document.getElementById('no-poem-message');
    const downloadBtn = document.getElementById('download-poem-btn');

    if (savedPoem) {
      const poem = JSON.parse(savedPoem);

      if (poem.length > 0) {
        let poemText = '';

        // Format all saved stanzas
        for (const stanza of poem) {
          poemText += formatStanza(stanza) + '\n\n';
        }

        poemContainer.textContent = poemText.trim();
        poemContainer.style.display = 'block';
        noMessageContainer.style.display = 'none';
        downloadBtn.style.display = 'inline-block';
        document.getElementById('clear-poem-btn').style.display = 'inline-block';

        return;
      }
    }

    // No poem data found
    poemContainer.style.display = 'none';
    noMessageContainer.style.display = 'block';
    downloadBtn.style.display = 'none';
    document.getElementById('clear-poem-btn').style.display = 'none';

  } catch (error) {
    console.warn('Could not load poem from localStorage:', error);
    document.getElementById('poem-content').style.display = 'none';
    document.getElementById('no-poem-message').style.display = 'block';
    document.getElementById('download-poem-btn').style.display = 'none';
    document.getElementById('clear-poem-btn').style.display = 'none';
  }
}

// Download current poem
function downloadCurrentPoem() {
  try {
    const savedPoem = localStorage.getItem('wwkay-poem');
    if (!savedPoem) {
      alert('No poem data to download. Browse the site to generate your surveillance poem first.');
      return;
    }

    const poem = JSON.parse(savedPoem);
    if (poem.length === 0) {
      alert('No poem data to download. Browse the site to generate your surveillance poem first.');
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
    const filename = `wwkay-${timestamp}.txt`;

    let poemContent = 'WHAT YOU AND I KNOW ABOUT YOU\n';
    poemContent += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Add all stanzas
    for (const stanza of poem) {
      poemContent += formatStanza(stanza) + '\n\n';
    }

    // Add visitor map if any locations exist
    const visitorMap = loadVisitorMap();
    if (visitorMap.length > 0) {
      poemContent += `// visitor_map — ${visitorMap.length} location${visitorMap.length === 1 ? '' : 's'} recorded\n`;
      for (const entry of visitorMap) {
        const cleanLocation = entry.location.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
        poemContent += `from_${cleanLocation}: ${entry.identifier}\n`;
      }
      poemContent += '\n';
    }

    poemContent += '---\n';
    poemContent += 'This poem was generated client-side and reflects data your browser\n';
    poemContent += 'reveals during normal web usage. No data was transmitted.\n\n';
    poemContent += 'Privacy resources: privacyguides.org';

    const blob = new Blob([poemContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error downloading poem:', error);
    alert('Error downloading poem. Please try again.');
  }
}

function formatStanza(stanza) {
  let formatted = `// ${stanza.pageName} — ${stanza.data.sessionTime}\n`;

  for (const [key, value] of Object.entries(stanza.data)) {
    if (key !== 'sessionTime') {
      formatted += `${key}: ${value}\n`;
    }
  }

  return formatted.trim();
}

// Visitor Map Functions
function loadVisitorMap() {
  try {
    const saved = localStorage.getItem('wwkay-visitor-map');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.warn('Could not load visitor map from localStorage:', e);
    return [];
  }
}

function saveVisitorMap(visitorMap) {
  try {
    localStorage.setItem('wwkay-visitor-map', JSON.stringify(visitorMap));
  } catch (e) {
    console.warn('Could not save visitor map to localStorage:', e);
  }
}

function addVisitorLocation(location) {
  let visitorMap = loadVisitorMap();

  // Generate anonymous identifier
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  const identifier = `visitor_${randomSuffix}`;

  // Add new location entry
  visitorMap.push({
    location: location,
    identifier: identifier,
    timestamp: timestamp
  });

  // Keep only last 50 entries to prevent localStorage bloat
  if (visitorMap.length > 50) {
    visitorMap = visitorMap.slice(-50);
  }

  saveVisitorMap(visitorMap);
  displayVisitorMap();
}

function displayVisitorMap() {
  const mapDisplay = document.getElementById('visitor-map-display');
  if (!mapDisplay) return;

  const visitorMap = loadVisitorMap();

  if (visitorMap.length === 0) {
    mapDisplay.innerHTML = '<em style="color: #666; font-style: italic;">// no visitors yet — be the first to add your location</em>';
    return;
  }

  // Format as poetry
  let mapText = `// visitor_map — ${visitorMap.length} location${visitorMap.length === 1 ? '' : 's'} recorded\n`;

  for (const entry of visitorMap) {
    const cleanLocation = entry.location.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
    mapText += `from_${cleanLocation}: ${entry.identifier}\n`;
  }

  mapDisplay.textContent = mapText;
}

function submitLocation() {
  const input = document.getElementById('location-input');
  const location = input.value.trim();

  if (!location) {
    alert('Please enter a location');
    return;
  }

  addVisitorLocation(location);
  input.value = '';

  // Provide user feedback
  const button = document.getElementById('add-location-btn');
  const originalText = button.textContent;
  button.textContent = 'added!';
  button.style.backgroundColor = 'rgb(0, 128, 0)';

  setTimeout(() => {
    button.textContent = originalText;
    button.style.backgroundColor = 'rgb(122, 6, 97)';
  }, 1500);
}

// Clear Poem Functions
function clearPoem() {
  if (confirm('Are you sure you want to clear your surveillance poem and visitor map data?')) {
    // Clear localStorage data
    localStorage.removeItem('wwkay-poem');
    localStorage.removeItem('wwkay-visitor-map');

    // Update displays
    displayCurrentPoem();
    displayVisitorMap();

    // Show privacy guidance popup
    showPrivacyGuidance();
  }
}

function showPrivacyGuidance() {
  const privacyMessage = `Your surveillance poem has been cleared!

For enhanced privacy, consider also:

• Clear browser cache and cookies
• Clear browsing history and download history
• Clear stored passwords and autofill data
• Clear site data and permissions
• Use private/incognito browsing
• Consider privacy-focused browsers (Firefox, Brave)
• Use tracking protection and ad blockers

Remember: This demonstration only shows client-side data collection. Real tracking often involves server-side analytics, cross-site tracking, and data brokers that require additional privacy measures.

Stay vigilant about your digital privacy!`;

  alert(privacyMessage);
}

// Display poem when page loads
document.addEventListener('DOMContentLoaded', function() {
  displayCurrentPoem();
  displayVisitorMap();

  // Add event listener for download button
  const downloadBtn = document.getElementById('download-poem-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadCurrentPoem);
  }

  // Add event listener for clear button
  const clearBtn = document.getElementById('clear-poem-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearPoem);
  }

  // Add event listeners for visitor map
  const addLocationBtn = document.getElementById('add-location-btn');
  const locationInput = document.getElementById('location-input');

  if (addLocationBtn) {
    addLocationBtn.addEventListener('click', submitLocation);
  }

  if (locationInput) {
    locationInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        submitLocation();
      }
    });
  }
});

// Update poem display every 5 seconds in case user is actively browsing
setInterval(displayCurrentPoem, 5000);

// Update visitor map display every 10 seconds in case others are adding locations
setInterval(displayVisitorMap, 10000);
</script>