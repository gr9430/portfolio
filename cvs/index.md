---
layout: default
title: CVs - Glenn S. Ritchey III
---

# CVs

Choose your view of my academic and creative work:

## Individual CVs

<div class="cv-navigation">
  <ul>
    <li><a href="{{ site.baseurl }}/academic/" class="animated-link">Academic CV</a></li>
    <li><a href="{{ site.baseurl }}/creative/" class="animated-link">Creative CV</a></li>
  </ul>
</div>

## Blended Timeline

<div class="cv-blend-controls">
  <button id="create-blended-timeline" class="blend-btn">View Complete Chronological Timeline</button>
</div>

<script>
// Blend functionality for the landing page
document.addEventListener('DOMContentLoaded', function() {
  const blendButton = document.getElementById('create-blended-timeline');
  if (blendButton) {
    blendButton.addEventListener('click', function() {
      // Use the same blending function but specify we're coming from the landing page
      renderBlendedView('landing');
    });
  }
});
</script>