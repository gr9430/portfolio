(function () {
  var CATEGORIES = ['origin', 'noun_anchor', 'noun_room', 'adjective_state', 'verb_fails'];
  var _edited = false; // track if user has made edits (for fork/empty destructive warning)

  function init() {
    ZineStore.subscribe(onStoreUpdate);
    document.getElementById('edit-title').addEventListener('input', function(e) {
      ZineStore.update({ meta: Object.assign({}, ZineStore.state.meta, { title: e.target.value }) });
      document.getElementById('meta-title').value = e.target.value;
    });
    document.getElementById('edit-author').addEventListener('input', function(e) {
      ZineStore.update({ meta: Object.assign({}, ZineStore.state.meta, { author: e.target.value }) });
      document.getElementById('meta-author').value = e.target.value;
    });
    document.getElementById('fork-btn').addEventListener('click', function() { applyMode('fork'); });
    document.getElementById('empty-btn').addEventListener('click', function() { applyMode('empty'); });
    render();
  }

  function onStoreUpdate() {
    // Sync top-bar values into editor fields
    document.getElementById('edit-title').value  = ZineStore.state.meta.title  || '';
    document.getElementById('edit-author').value = ZineStore.state.meta.author || '';
    renderHexCandidates();
    renderCategories();
    renderImageMeta();
  }

  // ── Fork / empty toggle ──────────────────────────────────
  function applyMode(mode) {
    if (_edited) {
      if (!confirm('This will replace your current vocabulary — continue?')) return;
    }
    var grammar = ZineStore.state.grammar;
    if (mode === 'fork') {
      var seed = ZineStore.getSeedGrammar();
      if (seed) {
        grammar = seed;
      }
    } else {
      // empty: keep keys, clear arrays
      grammar = {};
      CATEGORIES.forEach(function(cat) { grammar[cat] = []; });
    }
    ZineStore.update({ grammar: grammar, meta: Object.assign({}, ZineStore.state.meta, { mode: mode }) });
    document.getElementById('fork-btn').classList.toggle('active', mode === 'fork');
    document.getElementById('fork-btn').setAttribute('aria-pressed', mode === 'fork' ? 'true' : 'false');
    document.getElementById('empty-btn').classList.toggle('active', mode === 'empty');
    document.getElementById('empty-btn').setAttribute('aria-pressed', mode === 'empty' ? 'true' : 'false');
    _edited = false;
    renderCategories();
  }

  // ── Per-category blocks ──────────────────────────────────
  function renderCategories() {
    var container = document.getElementById('category-blocks');
    container.innerHTML = '';
    var grammar = ZineStore.state.grammar;
    CATEGORIES.forEach(function(cat) {
      container.appendChild(makeCategoryBlock(cat, grammar[cat] || []));
    });
  }

  function makeCategoryBlock(cat, words) {
    var block = document.createElement('div');
    block.className = 'category-block';
    block.id = 'cat-' + cat;

    var heading = document.createElement('h3');
    heading.textContent = cat;

    // Validation: warn if origin references this symbol and it's empty
    if (cat !== 'origin' && words.length === 0) {
      var refs = (ZineStore.state.grammar.origin || []).join(' ');
      if (refs.indexOf('#' + cat + '#') !== -1) {
        var warn = document.createElement('span');
        warn.className = 'warning';
        warn.textContent = 'origin references this — generator will output [' + cat + ']';
        warn.setAttribute('role', 'alert');
        heading.appendChild(warn);
      }
    }
    block.appendChild(heading);

    var list = document.createElement('ul');
    list.className = 'word-list';
    words.forEach(function(word, idx) {
      list.appendChild(makeWordItem(cat, word, idx));
    });
    block.appendChild(list);

    // Add row
    var addRow = document.createElement('div');
    addRow.className = 'add-word-row';
    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'add a word or phrase';
    input.setAttribute('aria-label', 'Add word to ' + cat);
    var addBtn = document.createElement('button');
    addBtn.className = 'btn btn--sm';
    addBtn.textContent = 'Add';
    addBtn.addEventListener('click', function() {
      var val = input.value.trim();
      if (!val) return;
      var grammar = ZineStore.state.grammar;
      var list = (grammar[cat] || []).slice();
      list.push(val);
      grammar = Object.assign({}, grammar);
      grammar[cat] = list;
      ZineStore.update({ grammar: grammar });
      _edited = true;
      input.value = '';
    });
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); addBtn.click(); } });
    addRow.appendChild(input);
    addRow.appendChild(addBtn);
    block.appendChild(addRow);

    return block;
  }

  function makeWordItem(cat, word, idx) {
    var li = document.createElement('li');
    var span = document.createElement('span');
    span.textContent = word;
    var del = document.createElement('button');
    del.className = 'del-btn';
    del.textContent = 'remove';
    del.setAttribute('aria-label', 'Remove "' + word + '" from ' + cat);
    del.addEventListener('click', function() {
      var grammar = ZineStore.state.grammar;
      var list = (grammar[cat] || []).slice();
      list.splice(idx, 1);
      grammar = Object.assign({}, grammar);
      grammar[cat] = list;
      ZineStore.update({ grammar: grammar });
      _edited = true;
    });
    li.appendChild(span);
    li.appendChild(del);
    return li;
  }

  // ── Hex candidates ───────────────────────────────────────
  function renderHexCandidates() {
    var panel = document.getElementById('hex-candidates-panel');
    var hexes = ZineStore.dominantHexes;
    if (!hexes || !hexes.length) { panel.innerHTML = ''; return; }

    panel.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.className = 'hex-candidates';

    var heading = document.createElement('h3');
    heading.textContent = 'Colors from your reduction';
    wrapper.appendChild(heading);

    hexes.forEach(function(d) {
      var row = document.createElement('div');
      row.className = 'hex-row';

      var swatch = document.createElement('span');
      swatch.className = 'hex-swatch';
      swatch.style.background = d.hex;
      swatch.setAttribute('aria-hidden', 'true');

      var label = document.createElement('span');
      label.className = 'hex-label';
      label.textContent = d.hex + ' ' + Math.round(d.pct * 100) + '%';

      var nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = 'name this color';
      nameInput.setAttribute('aria-label', 'Name for color ' + d.hex);

      var catSelect = document.createElement('select');
      catSelect.setAttribute('aria-label', 'Category to add this color to');
      CATEGORIES.forEach(function(cat) {
        var opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
      });

      var addBtn = document.createElement('button');
      addBtn.className = 'btn btn--sm';
      addBtn.textContent = 'Add';
      addBtn.addEventListener('click', function() {
        var name = nameInput.value.trim();
        if (!name) return;
        var cat = catSelect.value;
        var grammar = ZineStore.state.grammar;
        var list = (grammar[cat] || []).slice();
        list.push(name);
        grammar = Object.assign({}, grammar);
        grammar[cat] = list;
        ZineStore.update({ grammar: grammar });
        _edited = true;
        nameInput.value = '';
      });

      row.appendChild(swatch);
      row.appendChild(label);
      row.appendChild(nameInput);
      row.appendChild(catSelect);
      row.appendChild(addBtn);
      wrapper.appendChild(row);
    });

    panel.appendChild(wrapper);
  }

  // ── Image metadata ───────────────────────────────────────
  function renderImageMeta() {
    var list = document.getElementById('image-meta-list');
    list.innerHTML = '';
    ZineStore.state.images.forEach(function(img, idx) {
      var item = document.createElement('div');
      item.className = 'image-meta-item';

      var filename = document.createElement('div');
      filename.className = 'filename';
      filename.textContent = img.src.split('/').pop();
      item.appendChild(filename);

      var altLabel = document.createElement('label');
      altLabel.textContent = 'Alt text';
      altLabel.setAttribute('for', 'alt-' + img.id);
      var altInput = document.createElement('input');
      altInput.type = 'text';
      altInput.id = 'alt-' + img.id;
      altInput.value = img.alt || '';
      altInput.setAttribute('aria-label', 'Alt text for ' + img.src.split('/').pop());
      altInput.addEventListener('input', function(e) {
        var images = ZineStore.state.images.slice();
        images[idx] = Object.assign({}, img, { alt: e.target.value });
        ZineStore.update({ images: images });
      });
      item.appendChild(altLabel);
      item.appendChild(altInput);

      var capLabel = document.createElement('label');
      capLabel.textContent = 'Caption';
      capLabel.setAttribute('for', 'cap-' + img.id);
      var capInput = document.createElement('input');
      capInput.type = 'text';
      capInput.id = 'cap-' + img.id;
      capInput.value = img.caption || '';
      capInput.setAttribute('aria-label', 'Caption for ' + img.src.split('/').pop());
      capInput.addEventListener('input', function(e) {
        var images = ZineStore.state.images.slice();
        images[idx] = Object.assign({}, img, { caption: e.target.value });
        ZineStore.update({ images: images });
      });
      item.appendChild(capLabel);
      item.appendChild(capInput);

      list.appendChild(item);
    });
  }

  function render() {
    document.getElementById('edit-title').value  = ZineStore.state.meta.title  || '';
    document.getElementById('edit-author').value = ZineStore.state.meta.author || '';
    renderHexCandidates();
    renderCategories();
    renderImageMeta();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
