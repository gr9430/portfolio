(function () {
  var currentPageIndex = 0;
  var selectedItem = null;  // { type, text?, imageId?, src?, alt? }
  var selectedPlaced = null; // { el, pageElements, idx }

  function init() {
    renderImagePalette();
    renderPage();
    updatePageCounter();
    ZineStore.subscribe(function () {
      renderImagePalette();
      // Re-render page only if pages changed externally (import)
      renderPage();
      updatePageCounter();
    });
    document.getElementById('throw-btn').addEventListener('click', throwFragments);
    document.getElementById('free-text-btn').addEventListener('click', addFreeText);
    document.getElementById('zine-surface').addEventListener('click', onSurfaceClick);
    document.getElementById('prev-page').addEventListener('click', prevPage);
    document.getElementById('next-page').addEventListener('click', nextPage);
    document.getElementById('new-page').addEventListener('click', addNewPage);
    document.addEventListener('keydown', onKeyDown);
  }

  // ── Fragment tray ────────────────────────────────────────
  function throwFragments() {
    var count = parseInt(document.getElementById('throw-count').value, 10) || 6;
    count = Math.min(20, Math.max(1, count));
    var tray = document.getElementById('fragment-tray');
    tray.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var text = Tracery.expand(ZineStore.state.grammar, 'origin');
      tray.appendChild(makeFragmentCard(text));
    }
  }

  function makeFragmentCard(text) {
    var btn = document.createElement('button');
    btn.className = 'fragment-card';
    btn.textContent = text;
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', function () {
      selectItem({ type: 'fragment', text: text }, btn);
    });
    return btn;
  }

  // ── Image palette ────────────────────────────────────────
  function renderImagePalette() {
    var palette = document.getElementById('image-palette');
    palette.innerHTML = '';
    ZineStore.state.images.forEach(function (img) {
      var btn = document.createElement('button');
      btn.className = 'image-thumb';
      btn.setAttribute('aria-label', (img.alt || img.src));
      btn.setAttribute('aria-pressed', 'false');
      var imgEl = document.createElement('img');
      imgEl.src = img.src;
      imgEl.alt = img.alt || '';
      btn.appendChild(imgEl);
      btn.addEventListener('click', function () {
        selectItem({ type: 'image', imageId: img.id, src: img.src, alt: img.alt }, btn);
      });
      palette.appendChild(btn);
    });
  }

  // ── Free text ────────────────────────────────────────────
  function addFreeText() {
    var input = document.getElementById('free-text-input');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    selectItem({ type: 'text', text: text }, null);
  }

  // ── Selection state ──────────────────────────────────────
  function selectItem(item, srcEl) {
    selectedItem = item;
    selectedPlaced = null;
    document.querySelectorAll('.fragment-card, .image-thumb').forEach(function (el) {
      el.classList.remove('selected');
      el.setAttribute('aria-pressed', 'false');
    });
    if (srcEl) {
      srcEl.classList.add('selected');
      srcEl.setAttribute('aria-pressed', 'true');
    }
    document.getElementById('zine-surface').classList.add('awaiting-placement');
  }

  function clearSelection() {
    selectedItem = null;
    selectedPlaced = null;
    document.querySelectorAll('.fragment-card, .image-thumb').forEach(function (el) {
      el.classList.remove('selected');
      el.setAttribute('aria-pressed', 'false');
    });
    document.getElementById('zine-surface').classList.remove('awaiting-placement');
    document.querySelectorAll('.placed').forEach(function (el) { el.classList.remove('selected'); });
  }

  // ── Surface click — place element ────────────────────────
  function onSurfaceClick(e) {
    if (!selectedItem) return;
    var surface = document.getElementById('zine-surface');
    var rect = surface.getBoundingClientRect();
    var x = Math.round(e.clientX - rect.left);
    var y = Math.round(e.clientY - rect.top);
    placeElement(selectedItem, x, y);
    clearSelection();
  }

  function placeElement(item, x, y) {
    var pages = ZineStore.state.pages;
    if (currentPageIndex >= pages.length) currentPageIndex = pages.length - 1;
    var page = pages[currentPageIndex];
    var el;
    if (item.type === 'fragment') {
      el = { type: 'fragment', text: item.text, x: x, y: y };
    } else if (item.type === 'image') {
      el = { type: 'image', imageId: item.imageId, x: x, y: y, w: 200, h: 150 };
    } else {
      el = { type: 'text', text: item.text, x: x, y: y };
    }
    page.elements.push(el);
    ZineStore.update({ pages: pages.slice() });
  }

  // ── Render page ──────────────────────────────────────────
  function renderPage() {
    var surface = document.getElementById('zine-surface');
    surface.innerHTML = '';
    var pages = ZineStore.state.pages;
    if (!pages.length) return;
    if (currentPageIndex >= pages.length) currentPageIndex = pages.length - 1;
    var page = pages[currentPageIndex];
    page.elements.forEach(function (el, idx) {
      surface.appendChild(makePlacedEl(el, page.elements, idx));
    });
  }

  function makePlacedEl(el, elements, idx) {
    var div = document.createElement('div');
    div.className = 'placed placed--' + el.type;
    div.style.left = el.x + 'px';
    div.style.top  = el.y + 'px';
    div.setAttribute('tabindex', '0');

    if (el.type === 'image') {
      var imgData = ZineStore.state.images.find(function (i) { return i.id === el.imageId; });
      if (imgData) {
        var img = document.createElement('img');
        img.src = imgData.src;
        img.alt = imgData.alt || '';
        img.style.width  = el.w + 'px';
        img.style.height = el.h + 'px';
        div.appendChild(img);
        div.setAttribute('aria-label', 'Placed image: ' + (imgData.alt || imgData.src));
      }
    } else {
      div.textContent = el.text;
      div.setAttribute('aria-label', el.text);
    }

    // Click to re-select a placed element
    div.addEventListener('click', function (e) {
      e.stopPropagation();
      selectedItem = null;
      document.getElementById('zine-surface').classList.remove('awaiting-placement');
      document.querySelectorAll('.placed').forEach(function (p) { p.classList.remove('selected'); });
      div.classList.add('selected');
      selectedPlaced = { el: div, elements: elements, idx: idx, data: el };
    });

    // Drag to reposition
    div.addEventListener('mousedown', function (e) {
      e.stopPropagation();
      var startX = e.clientX - el.x;
      var startY = e.clientY - el.y;
      function onMove(e) {
        el.x = e.clientX - startX;
        el.y = e.clientY - startY;
        div.style.left = el.x + 'px';
        div.style.top  = el.y + 'px';
      }
      function onUp() {
        ZineStore.update({ pages: ZineStore.state.pages.slice() });
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    return div;
  }

  // ── Keyboard: arrow-key move + delete ───────────────────
  function onKeyDown(e) {
    if (!selectedPlaced) return;
    var el = selectedPlaced.data;
    var STEP = 4;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (document.activeElement === selectedPlaced.el || document.activeElement.closest('.zine-surface')) {
        selectedPlaced.elements.splice(selectedPlaced.idx, 1);
        ZineStore.update({ pages: ZineStore.state.pages.slice() });
        selectedPlaced = null;
        e.preventDefault();
      }
      return;
    }
    var moved = true;
    if (e.key === 'ArrowLeft')  el.x -= STEP;
    else if (e.key === 'ArrowRight') el.x += STEP;
    else if (e.key === 'ArrowUp')    el.y -= STEP;
    else if (e.key === 'ArrowDown')  el.y += STEP;
    else moved = false;
    if (moved) {
      e.preventDefault();
      selectedPlaced.el.style.left = el.x + 'px';
      selectedPlaced.el.style.top  = el.y + 'px';
    }
  }

  // ── Page navigation ──────────────────────────────────────
  function prevPage() {
    if (currentPageIndex > 0) { currentPageIndex--; renderPage(); updatePageCounter(); }
  }
  function nextPage() {
    if (currentPageIndex < ZineStore.state.pages.length - 1) { currentPageIndex++; renderPage(); updatePageCounter(); }
  }
  function addNewPage() {
    var pages = ZineStore.state.pages.slice();
    var id = 'page_' + String(pages.length + 1).padStart(3, '0');
    pages.push({ id: id, elements: [] });
    currentPageIndex = pages.length - 1;
    ZineStore.update({ pages: pages.slice() });
    updatePageCounter();
  }
  function updatePageCounter() {
    document.getElementById('page-counter').textContent =
      'Page ' + (currentPageIndex + 1) + ' of ' + ZineStore.state.pages.length;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
