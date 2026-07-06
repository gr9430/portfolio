(function () {
  var CATEGORIES = ['origin', 'noun_anchor', 'noun_room', 'adjective_state', 'verb_fails'];
  var _edited = false;
  var _updatingFromTextarea = false;
  var _debounceTimer = null;

  // ── Color vocabulary suggestions ─────────────────────────
  var COLOR_VOCAB = [
    { test: function(h,s,l){ return s<0.10&&l<0.20; }, words:['basalt','char','peat','pitch','dark'] },
    { test: function(h,s,l){ return s<0.10&&l>0.80; }, words:['chalk','cloud','pale','ash','white'] },
    { test: function(h,s,l){ return s<0.15; },          words:['slate','shale','stone','haze','grey'] },
    { test: function(h,s,l){ return h<18||h>=340; },    words:['rust','iron','clay','blood','copper'] },
    { test: function(h,s,l){ return h>=18&&h<50; },     words:['gorse','amber','ochre','loam','burn'] },
    { test: function(h,s,l){ return h>=50&&h<80; },     words:['sedge','lichen','fern','bog','pale'] },
    { test: function(h,s,l){ return h>=80&&h<155; },    words:['moss','bracken','oak','verdant','heath'] },
    { test: function(h,s,l){ return h>=155&&h<200; },   words:['lake','pool','reed','rush','tarn'] },
    { test: function(h,s,l){ return h>=200&&h<260; },   words:['mist','sky','slate','cold','distant'] },
    { test: function(h,s,l){ return h>=260&&h<310; },   words:['heather','thistle','dusk','violet','shade'] },
    { test: function(h,s,l){ return h>=310&&h<340; },   words:['foxglove','dawn','briar','rose','pink'] }
  ];

  function hexToHsl(hex) {
    var r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255;
    var max=Math.max(r,g,b), min=Math.min(r,g,b), l=(max+min)/2, s=0, h=0;
    if (max!==min) {
      var d=max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      if      (max===r) h=((g-b)/d+(g<b?6:0))/6;
      else if (max===g) h=((b-r)/d+2)/6;
      else              h=((r-g)/d+4)/6;
    }
    return { h:h*360, s:s, l:l };
  }

  function suggestWords(hex) {
    var hsl = hexToHsl(hex);
    for (var i=0; i<COLOR_VOCAB.length; i++) {
      if (COLOR_VOCAB[i].test(hsl.h, hsl.s, hsl.l)) return COLOR_VOCAB[i].words;
    }
    return ['earth','stone','light','air','shadow'];
  }

  function init() {
    ZineStore.subscribe(onStoreUpdate);

    document.getElementById('edit-title').addEventListener('input', function (e) {
      ZineStore.update({ meta: Object.assign({}, ZineStore.state.meta, { title: e.target.value }) });
      document.getElementById('meta-title').value = e.target.value;
    });
    document.getElementById('edit-author').addEventListener('input', function (e) {
      ZineStore.update({ meta: Object.assign({}, ZineStore.state.meta, { author: e.target.value }) });
      document.getElementById('meta-author').value = e.target.value;
    });

    document.getElementById('fork-btn').addEventListener('click', function () { applyMode('fork'); });
    document.getElementById('empty-btn').addEventListener('click', function () { applyMode('empty'); });

    Array.from(document.querySelectorAll('.image-source-toggle button')).forEach(function (btn) {
      btn.addEventListener('click', function () { setImageSource(btn.getAttribute('data-source')); });
    });
    document.getElementById('finalize-btn').addEventListener('click', finalizeAndReturn);

    document.getElementById('grammar-editor').addEventListener('input', function () {
      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(onTextareaChange, 400);
    });

    document.getElementById('regen-btn').addEventListener('click', renderPreview);

    render();
  }

  function onTextareaChange() {
    var textarea = document.getElementById('grammar-editor');
    var errorEl = document.getElementById('editor-error');
    try {
      var parsed = JSON.parse(textarea.value);
      errorEl.hidden = true;
      errorEl.textContent = '';
      _edited = true;
      _updatingFromTextarea = true;
      ZineStore.update({ grammar: parsed });
      _updatingFromTextarea = false;
      renderPreview();
    } catch (e) {
      errorEl.textContent = 'JSON error: ' + e.message;
      errorEl.hidden = false;
    }
  }

  function onStoreUpdate() {
    document.getElementById('edit-title').value  = ZineStore.state.meta.title  || '';
    document.getElementById('edit-author').value = ZineStore.state.meta.author || '';
    if (!_updatingFromTextarea) {
      syncTextarea();
      renderPreview();
    }
    renderHexCandidates();
    renderImageMeta();
    var currentSource = ZineStore.state.imageSource || 'both';
    Array.from(document.querySelectorAll('.image-source-toggle button')).forEach(function (btn) {
      var active = (btn.getAttribute('data-source') === currentSource);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function syncTextarea() {
    document.getElementById('grammar-editor').value = JSON.stringify(ZineStore.state.grammar, null, 2);
    var errorEl = document.getElementById('editor-error');
    errorEl.hidden = true;
    errorEl.textContent = '';
  }

  function renderPreview() {
    var preview = document.getElementById('live-preview');
    var grammar = ZineStore.state.grammar;
    preview.innerHTML = '';
    for (var i = 0; i < 6; i++) {
      var line = Tracery.expand(grammar, 'origin');
      var div = document.createElement('div');
      div.className = 'preview-line';
      div.textContent = line;
      preview.appendChild(div);
    }
  }

  function applyMode(mode) {
    if (_edited) {
      if (!confirm('This will replace your current vocabulary — continue?')) return;
    }
    var grammar;
    if (mode === 'fork') {
      var seed = ZineStore.getSeedGrammar();
      grammar = seed || ZineStore.state.grammar;
    } else {
      grammar = {};
      CATEGORIES.forEach(function (cat) { grammar[cat] = []; });
    }
    ZineStore.update({ grammar: grammar, meta: Object.assign({}, ZineStore.state.meta, { mode: mode }) });
    document.getElementById('fork-btn').classList.toggle('active', mode === 'fork');
    document.getElementById('fork-btn').setAttribute('aria-pressed', mode === 'fork' ? 'true' : 'false');
    document.getElementById('empty-btn').classList.toggle('active', mode === 'empty');
    document.getElementById('empty-btn').setAttribute('aria-pressed', mode === 'empty' ? 'true' : 'false');
    _edited = false;
  }

  function setImageSource(source) {
    ZineStore.update({ imageSource: source });
    Array.from(document.querySelectorAll('.image-source-toggle button')).forEach(function (btn) {
      var active = (btn.getAttribute('data-source') === source);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function finalizeAndReturn() {
    setImageSource(ZineStore.state.imageSource || 'both');
    document.getElementById('btn-canvas').click();
  }

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

    hexes.forEach(function (d) {
      var block = document.createElement('div');
      block.className = 'hex-block';

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
      catSelect.setAttribute('aria-label', 'Category');
      CATEGORIES.forEach(function (cat) {
        var opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
      });

      var addBtn = document.createElement('button');
      addBtn.className = 'btn btn--sm';
      addBtn.textContent = 'Add';
      addBtn.addEventListener('click', function () {
        var name = nameInput.value.trim();
        if (!name) return;
        var cat = catSelect.value;
        var grammar = Object.assign({}, ZineStore.state.grammar);
        grammar[cat] = (grammar[cat] || []).slice();
        grammar[cat].push(name);
        ZineStore.update({ grammar: grammar });
        _edited = true;
        nameInput.value = '';
      });

      row.appendChild(swatch);
      row.appendChild(label);
      row.appendChild(nameInput);
      row.appendChild(catSelect);
      row.appendChild(addBtn);
      block.appendChild(row);

      // Suggested words based on hue/saturation/lightness
      var words = suggestWords(d.hex);
      var suggRow = document.createElement('div');
      suggRow.className = 'hex-suggestions';
      words.forEach(function (word) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'suggestion-chip';
        chip.textContent = word;
        chip.addEventListener('click', function () { nameInput.value = word; nameInput.focus(); });
        suggRow.appendChild(chip);
      });
      block.appendChild(suggRow);

      wrapper.appendChild(block);
    });

    panel.appendChild(wrapper);
  }

  function renderImageMeta() {
    var list = document.getElementById('image-meta-list');
    list.innerHTML = '';
    ZineStore.state.images.forEach(function (img, idx) {
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
      altInput.addEventListener('change', function (e) {
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
      capInput.addEventListener('change', function (e) {
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
    syncTextarea();
    renderPreview();
    renderHexCandidates();
    renderImageMeta();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
