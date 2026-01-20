---
layout: default
title: "What you and I know about you"
---

# What you and <a href="{{ site.baseurl }}/" style="color: rgb(0, 0, 0); text-decoration: none;">I</a> know about you

*An experimental transparency widget that reveals the surveillance data your browser collects during ordinary web usage.*

This piece transforms the invisible metrics of digital tracking into a live, accumulating poem. As you navigate through this site, a small widget in the bottom-right corner quietly catalogs the data points that websites typically gather: your browser type, screen dimensions, scroll patterns, time spent on each page, and mouse movements.

Unlike traditional tracking systems, this widget **transmits nothing**. All data remains client-side, stored only in your browser's local memory. The poem grows with each page you visit, creating a personalized verse that makes visible the usually hidden mechanics of web surveillance. Click the widget to reveal the full poem of your digital footprint—a code-comment style reflection of what we reveal simply by browsing.

**Instructions:** Simply browse this site. The widget will automatically begin composing your surveillance poem. Click it when you're curious to read what's been gathered about your session.

---

## What you and <a href="{{ site.baseurl }}/" style="color: rgb(0, 0, 0); text-decoration: none;">I</a> know about you

<div id="current-poem-display" style="background-color: rgb(248,248,255); border: 1px solid rgb(122, 6, 97); border-radius: 4px; padding: 1.5rem; margin: 2rem 0; font-family: 'Courier New', Courier, 'Monaco', 'Menlo', monospace; font-size: 12px; line-height: 1.4; color: #000000; white-space: pre-wrap;">
<em id="no-poem-message" style="color: #666; font-family: inherit;">Your surveillance poem will appear here as you browse the site. Try visiting other pages (elit, blog, teaching) and return to see your accumulated digital footprint...</em>
<pre id="poem-content" style="margin: 0; display: none;"></pre>
</div>

<div style="text-align: center; margin: 1rem 0;">
<button id="download-poem-btn" style="background-color: rgb(122, 6, 97); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; font-family: 'Courier New', Courier, 'Monaco', 'Menlo', monospace; font-size: 11px; font-weight: bold; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: background-color 0.2s ease; display: none;" onmouseover="this.style.backgroundColor='rgb(98, 5, 78)'" onmouseout="this.style.backgroundColor='rgb(122, 6, 97)'">DOWNLOAD YOUR POEM WE MADE</button>
</div>

---

<div style="margin-top: 3rem; padding: 1.5rem; background-color: rgb(248,248,255); border: 1px solid rgba(122, 6, 97, 0.2); border-radius: 4px;">
<h3 style="margin-top: 0;">About This Piece</h3>
<p><strong>Concept:</strong> Digital surveillance critique through experimental literature</p>
<p><strong>Technology:</strong> Client-side JavaScript, localStorage, no external requests</p>
<p><strong>Data Policy:</strong> Nothing leaves your browser. Refresh to reset the poem.</p>
<p><strong>Genre:</strong> E-literature, surveillance poetry, transparency art</p>
</div>

<!-- Load the widget on this page -->
<link rel="stylesheet" href="/elit/wwkay/wwkay.css">
<script src="/elit/wwkay/wwkay.js"></script>

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

        return;
      }
    }

    // No poem data found
    poemContainer.style.display = 'none';
    noMessageContainer.style.display = 'block';
    downloadBtn.style.display = 'none';

  } catch (error) {
    console.warn('Could not load poem from localStorage:', error);
    document.getElementById('poem-content').style.display = 'none';
    document.getElementById('no-poem-message').style.display = 'block';
    document.getElementById('download-poem-btn').style.display = 'none';
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

// Display poem when page loads
document.addEventListener('DOMContentLoaded', function() {
  displayCurrentPoem();

  // Add event listener for download button
  const downloadBtn = document.getElementById('download-poem-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadCurrentPoem);
  }
});

// Update poem display every 5 seconds in case user is actively browsing
setInterval(displayCurrentPoem, 5000);
</script>