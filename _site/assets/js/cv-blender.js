/**
 * CV Blender - Simple chronological merge functionality
 * Creates unified timeline view of academic and creative work
 */

let originalContent = null;
let originalTitle = null;

/**
 * Chronological sort function - newest first
 * Handles YYYY and YYYY-MM date formats
 */
function chronologicalSort(entries) {
  return entries.slice().sort((a, b) => {
    // Parse dates in YYYY-MM format, handle missing months
    const dateA = new Date(a.date + (a.date.length === 4 ? '-01' : ''));
    const dateB = new Date(b.date + (b.date.length === 4 ? '-01' : ''));

    // Sort newest first (descending order)
    return dateB - dateA;
  });
}

/**
 * Flatten all entries from JSON structure into single array
 */
function flattenEntries(jsonData) {
  const allEntries = [];

  // Iterate through all categories in the JSON
  for (const category in jsonData) {
    if (Array.isArray(jsonData[category])) {
      allEntries.push(...jsonData[category]);
    }
  }

  return allEntries;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (dateString.length === 4) {
    return dateString; // Just year
  }
  // Convert YYYY-MM to readable format
  const [year, month] = dateString.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

/**
 * Create HTML for a single entry
 */
function createEntryHTML(entry) {
  const typeClass = entry.type;
  const categoryBadge = entry.category.charAt(0).toUpperCase() + entry.category.slice(1);
  const tags = entry.tags.join(', ');
  const detailsLink = entry.url ? `<a href="${entry.url}" class="animated-link">[details]</a>` : '';

  return `
    <div class="blend-entry ${typeClass}" data-type="${entry.type}" data-category="${entry.category}">
      <div class="entry-header">
        <h4 class="entry-title">${entry.title}</h4>
        <div class="entry-meta">
          <time class="entry-date">${formatDate(entry.date)}</time>
          <span class="entry-badge ${entry.type}">${categoryBadge}</span>
        </div>
      </div>
      <p class="entry-description">${entry.description}</p>
      <footer class="entry-footer">
        <span class="entry-tags">${tags}</span>
        ${detailsLink}
      </footer>
    </div>
  `;
}

/**
 * Fetch and merge both CV JSON files
 */
async function fetchAndMergeData() {
  try {
    const [academicResponse, creativeResponse] = await Promise.all([
      fetch('/assets/data/academic-cv.json'),
      fetch('/assets/data/creative-cv.json')
    ]);

    if (!academicResponse.ok || !creativeResponse.ok) {
      throw new Error('Failed to fetch CV data');
    }

    const academicData = await academicResponse.json();
    const creativeData = await creativeResponse.json();

    // Flatten and merge all entries
    const academicEntries = flattenEntries(academicData);
    const creativeEntries = flattenEntries(creativeData);
    const allEntries = [...academicEntries, ...creativeEntries];

    // Sort chronologically (newest first)
    return chronologicalSort(allEntries);

  } catch (error) {
    console.error('Error fetching CV data:', error);
    return [];
  }
}

/**
 * Store original content before blending
 */
function storeOriginalContent() {
  const wrapper = document.querySelector('.wrapper');
  const titleElement = document.querySelector('title');

  if (wrapper && !originalContent) {
    originalContent = wrapper.innerHTML;
    originalTitle = titleElement ? titleElement.textContent : '';
  }
}

/**
 * Restore original page content
 */
function restoreOriginalContent() {
  const wrapper = document.querySelector('.wrapper');
  const titleElement = document.querySelector('title');

  if (wrapper && originalContent) {
    wrapper.innerHTML = originalContent;
    if (titleElement && originalTitle) {
      titleElement.textContent = originalTitle;
    }

    // Re-bind navigation dropdown events
    const contentsNav = document.getElementById('contents-nav');
    if (contentsNav) {
      contentsNav.addEventListener('change', function() {
        if (this.value) {
          document.location.hash = this.value;
        }
      });
    }
  }
}

/**
 * Render blended CV view
 */
async function renderBlendedView(sourceType) {
  storeOriginalContent();

  const entries = await fetchAndMergeData();
  if (entries.length === 0) {
    alert('Error loading CV data. Please try again.');
    return;
  }

  // Update page title
  const titleElement = document.querySelector('title');
  if (titleElement) {
    titleElement.textContent = 'Blended CV - Glenn S. Ritchey III';
  }

  // Create blended content
  const entriesHTML = entries.map(createEntryHTML).join('');
  const totalCount = entries.length;
  const academicCount = entries.filter(e => e.type === 'academic').length;
  const creativeCount = entries.filter(e => e.type === 'creative').length;

  const blendedHTML = `
    <div class="cv-blend-controls">
      <button id="restore-original" class="blend-btn secondary">Back to ${sourceType === 'academic' ? 'Academic CV' : sourceType === 'creative' ? 'Creative CV' : sourceType === 'navigation' ? 'Home' : 'CVs'}</button>
    </div>

    <h1>Blended CV: Complete Timeline</h1>
    <p class="blend-stats">
      Showing ${totalCount} entries: ${academicCount} academic, ${creativeCount} creative
      <br><em>Chronological order (newest first) • Integrated trajectory view</em>
    </p>

    <div class="blend-timeline">
      ${entriesHTML}
    </div>
  `;

  // Replace wrapper content
  const wrapper = document.querySelector('.wrapper');
  if (wrapper) {
    wrapper.innerHTML = blendedHTML;

    // Bind restore button
    const restoreButton = document.getElementById('restore-original');
    if (restoreButton) {
      if (sourceType === 'landing') {
        restoreButton.addEventListener('click', function() {
          window.location.href = '/cvs/';
        });
      } else if (sourceType === 'navigation') {
        restoreButton.addEventListener('click', function() {
          window.location.href = '/';
        });
      } else {
        restoreButton.addEventListener('click', restoreOriginalContent);
      }
    }

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Initialize blend functionality when DOM loads
 */
document.addEventListener('DOMContentLoaded', function() {
  // Academic CV page - blend with creative
  const blendWithCreative = document.getElementById('blend-with-creative');
  if (blendWithCreative) {
    blendWithCreative.addEventListener('click', function() {
      renderBlendedView('academic');
    });
  }

  // Creative CV page - blend with academic
  const blendWithAcademic = document.getElementById('blend-with-academic');
  if (blendWithAcademic) {
    blendWithAcademic.addEventListener('click', function() {
      renderBlendedView('creative');
    });
  }
});