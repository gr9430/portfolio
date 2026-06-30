# Slieve Gullion Procedural Zine Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a three-activity static web tool that walks students through a Taroko Gorge remix grammar, client-side image reduction, and vocabulary authoring — all sharing one `grammar.json` file.

**Architecture:** Single `index.html` with tab-switched sections; `window.ZineStore` holds all state in memory; no framework, no build step, no browser storage APIs. Each JS module is a plain `<script>` loaded in order; modules communicate only through `ZineStore`.

**Tech Stack:** Vanilla HTML5/CSS3/JS (ES5-compatible where possible), Canvas API for image processing, Google Fonts (Special Elite), no npm, no bundler.

## Global Constraints

- Static files only — no backend, no build step, no `localStorage`/`sessionStorage`
- Must work via `fetch()` when served AND via manual import when opened as `file://`
- All paths relative; lives at `phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/`
- One shared schema for all stations (see spec `data/grammar.json`)
- Zine aesthetic (Special Elite, `#f5f0e8`, hard frames) for Activities 1 & 3; clinical monospace for Activity 2
- All controls keyboard-operable; visible `:focus-visible`; color never sole signal
- `contourCount` labeled explicitly as a proxy — not OpenCV parity

**Short base path used in this plan:** `slieve-gullion/` = `phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/`

---

## File Map

| File | Responsibility |
|---|---|
| `slieve-gullion/data/grammar.json` | Canonical shared data; Slieve Gullion seed |
| `slieve-gullion/js/store.js` | `window.ZineStore` — in-memory state, load/import/export/subscribe |
| `slieve-gullion/js/tracery.js` | `window.Tracery.expand()` — grammar expander |
| `slieve-gullion/js/canvas.js` | Activity 1 — fragment tray, zine page surface, page nav |
| `slieve-gullion/js/reduction.js` | Activity 2 — image analysis, 3 renders, hex handoff |
| `slieve-gullion/js/editor.js` | Activity 3 — fork/empty, per-category edit, hex→word |
| `slieve-gullion/index.html` | Hub: tab bar, top bar, section shells, script loading, init |
| `slieve-gullion/css/zine.css` | Special Elite aesthetic (Activities 1 & 3, global chrome) |
| `slieve-gullion/css/station.css` | Clinical monospace aesthetic (Activity 2 only) |
| `slieve-gullion/index.md` | Jekyll front-matter entry point |
| `slieve-gullion/images/` | Author drops real photos here (placeholder paths in JSON) |

---

## Task 1: Data Layer — `grammar.json` + `store.js`

**Files:**
- Create: `slieve-gullion/data/grammar.json`
- Create: `slieve-gullion/js/store.js`

**Interfaces:**
- Produces: `window.ZineStore` with members `state`, `dominantHexes`, `load(url)`, `importFile(file)`, `exportJSON()`, `update(patch)`, `subscribe(fn)`, `getSeedGrammar()`

- [ ] **Step 1: Create the directory structure**

```bash
mkdir -p phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/{data,images,js,css}
```

- [ ] **Step 2: Write `data/grammar.json`**

```json
{
  "meta": {
    "title": "Walking the Hero's Path at Slieve Gullion",
    "author": "",
    "mode": "fork"
  },
  "grammar": {
    "origin": [
      "the #noun_anchor# #verb_fails# into the #noun_room#",
      "#adjective_state# #noun_anchor# against the #noun_room#",
      "the #noun_room# holds the #noun_anchor#, #adjective_state#",
      "#verb_fails# into #adjective_state# #noun_room#",
      "the #adjective_state# #noun_room# receives the #noun_anchor#",
      "#noun_anchor#: #adjective_state#, #verb_fails#"
    ],
    "noun_anchor": ["cairn", "summit", "lake", "heather", "basalt", "ridge", "bog", "stone", "passage tomb", "drumlins"],
    "noun_room": ["passage", "chamber", "hillfort", "valley", "crater", "heath", "fen", "hollow", "cirque"],
    "adjective_state": ["ancient", "submerged", "sacred", "eroded", "misted", "calcified", "silted", "windswept", "occluded"],
    "verb_fails": ["yields", "dissolves", "recedes", "surrenders", "subsides", "erodes", "persists", "holds"]
  },
  "images": [
    { "id": "img_001", "src": "images/slieve-gullion-01.jpg", "alt": "", "caption": "", "reduction": { "brightness": null, "blur": null, "dominant": [], "edgeDensity": null, "contourCount": null } },
    { "id": "img_002", "src": "images/slieve-gullion-02.jpg", "alt": "", "caption": "", "reduction": { "brightness": null, "blur": null, "dominant": [], "edgeDensity": null, "contourCount": null } },
    { "id": "img_003", "src": "images/slieve-gullion-03.jpg", "alt": "", "caption": "", "reduction": { "brightness": null, "blur": null, "dominant": [], "edgeDensity": null, "contourCount": null } },
    { "id": "img_004", "src": "images/slieve-gullion-04.jpg", "alt": "", "caption": "", "reduction": { "brightness": null, "blur": null, "dominant": [], "edgeDensity": null, "contourCount": null } },
    { "id": "img_005", "src": "images/slieve-gullion-05.jpg", "alt": "", "caption": "", "reduction": { "brightness": null, "blur": null, "dominant": [], "edgeDensity": null, "contourCount": null } },
    { "id": "img_006", "src": "images/slieve-gullion-06.jpg", "alt": "", "caption": "", "reduction": { "brightness": null, "blur": null, "dominant": [], "edgeDensity": null, "contourCount": null } },
    { "id": "img_007", "src": "images/slieve-gullion-07.jpg", "alt": "", "caption": "", "reduction": { "brightness": null, "blur": null, "dominant": [], "edgeDensity": null, "contourCount": null } },
    { "id": "img_008", "src": "images/slieve-gullion-08.jpg", "alt": "", "caption": "", "reduction": { "brightness": null, "blur": null, "dominant": [], "edgeDensity": null, "contourCount": null } },
    { "id": "img_009", "src": "images/slieve-gullion-09.jpg", "alt": "", "caption": "", "reduction": { "brightness": null, "blur": null, "dominant": [], "edgeDensity": null, "contourCount": null } },
    { "id": "img_010", "src": "images/slieve-gullion-10.jpg", "alt": "", "caption": "", "reduction": { "brightness": null, "blur": null, "dominant": [], "edgeDensity": null, "contourCount": null } },
    { "id": "img_011", "src": "images/slieve-gullion-11.jpg", "alt": "", "caption": "", "reduction": { "brightness": null, "blur": null, "dominant": [], "edgeDensity": null, "contourCount": null } },
    { "id": "img_012", "src": "images/slieve-gullion-12.jpg", "alt": "", "caption": "", "reduction": { "brightness": null, "blur": null, "dominant": [], "edgeDensity": null, "contourCount": null } }
  ],
  "pages": [
    { "id": "page_001", "elements": [] }
  ]
}
```

- [ ] **Step 3: Write `js/store.js`**

```js
window.ZineStore = (function () {
  function emptyState() {
    return {
      meta: { title: '', author: '', mode: 'fork' },
      grammar: { origin: [], noun_anchor: [], noun_room: [], adjective_state: [], verb_fails: [] },
      images: [],
      pages: [{ id: 'page_001', elements: [] }]
    };
  }

  var _state = emptyState();
  var _seedGrammar = null;
  var _dominantHexes = [];
  var _subscribers = [];

  function _notify() {
    _subscribers.forEach(function (fn) { fn(_state); });
  }

  return {
    get state() { return _state; },
    get dominantHexes() { return _dominantHexes; },

    load: function (url) {
      return fetch(url)
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        })
        .then(function (data) {
          _state = data;
          _seedGrammar = JSON.parse(JSON.stringify(data.grammar));
          _notify();
        })
        .catch(function () {
          _state = emptyState();
          _notify();
        });
    },

    importFile: function (file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            _state = JSON.parse(e.target.result);
            _seedGrammar = JSON.parse(JSON.stringify(_state.grammar));
            _dominantHexes = [];
            _notify();
            resolve();
          } catch (err) { reject(err); }
        };
        reader.onerror = function () { reject(reader.error); };
        reader.readAsText(file);
      });
    },

    exportJSON: function () {
      var blob = new Blob([JSON.stringify(_state, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'grammar.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    },

    update: function (patch) {
      Object.assign(_state, patch);
      _notify();
    },

    subscribe: function (fn) {
      _subscribers.push(fn);
    },

    getSeedGrammar: function () {
      return _seedGrammar ? JSON.parse(JSON.stringify(_seedGrammar)) : null;
    },

    saveDominantHexes: function (hexes) {
      _dominantHexes = hexes;
      _notify();
    }
  };
})();
```

- [ ] **Step 4: Verify the store works in isolation**

Open browser console on any page and paste `store.js` contents, then run:

```js
// Should log emptyState
console.assert(ZineStore.state.grammar.origin.length === 0, 'fresh state has empty origin');

// subscribe fires
var fired = false;
ZineStore.subscribe(function() { fired = true; });
ZineStore.update({ meta: { title: 'test', author: '', mode: 'fork' } });
console.assert(fired, 'subscriber fires on update');
console.assert(ZineStore.state.meta.title === 'test', 'update merges into state');

console.log('store: all assertions passed');
```

Expected: no assertion errors, final log appears.

- [ ] **Step 5: Commit**

```bash
git add phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/
git commit -m "feat: scaffold slieve-gullion directory, grammar.json seed, ZineStore"
```

---

## Task 2: Grammar Expander — `tracery.js`

**Files:**
- Create: `slieve-gullion/js/tracery.js`

**Interfaces:**
- Consumes: `window.ZineStore.state.grammar` (plain object, symbol → string[])
- Produces: `window.Tracery.expand(grammar, symbol)` → string

- [ ] **Step 1: Write the verification assertions first**

```js
// Paste into console after loading tracery.js to verify behavior
var g = {
  origin: ['the #noun# #verb#'],
  noun: ['stone', 'cairn'],
  verb: ['yields', 'recedes']
};
var result = Tracery.expand(g, 'origin');
console.assert(result !== 'the #noun# #verb#', 'symbols resolved');
console.assert(!result.includes('#'), 'no unresolved # markers');

var missing = Tracery.expand(g, 'nonexistent');
console.assert(missing === '[nonexistent]', 'missing symbol renders as [symbol]');

var circular = { loop: ['#loop#'] };
var safe = Tracery.expand(circular, 'loop');
console.assert(safe === '[loop]', 'depth cap prevents infinite recursion');

console.log('tracery: all assertions passed');
```

- [ ] **Step 2: Write `js/tracery.js`**

```js
window.Tracery = {
  expand: function (grammar, symbol, depth) {
    depth = depth || 0;
    if (depth > 20) return '[' + symbol + ']';
    var options = grammar[symbol];
    if (!options || !options.length) return '[' + symbol + ']';
    var template = options[Math.floor(Math.random() * options.length)];
    var self = this;
    return template.replace(/#([^#]+)#/g, function (_, s) {
      return self.expand(grammar, s, depth + 1);
    });
  }
};
```

- [ ] **Step 3: Run the assertions from Step 1**

Paste `tracery.js` into console, then paste the assertion block. Expected: "tracery: all assertions passed".

- [ ] **Step 4: Verify against the Slieve Gullion grammar**

```js
// Load grammar.json manually and expand
fetch('data/grammar.json')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    for (var i = 0; i < 5; i++) {
      var line = Tracery.expand(data.grammar, 'origin');
      console.log(line);
      console.assert(!line.includes('#'), 'no unresolved markers in line ' + i);
    }
    console.log('grammar seed: all lines resolved');
  });
```

Expected: 5 landscape-poem lines with no `#symbol#` artifacts.

- [ ] **Step 5: Commit**

```bash
git add phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/js/tracery.js
git commit -m "feat: add Tracery expander (ported from sasb-canvas.html)"
```

---

## Task 3: Hub — `index.html` + `css/zine.css` + `css/station.css`

**Files:**
- Create: `slieve-gullion/index.html`
- Create: `slieve-gullion/css/zine.css`
- Create: `slieve-gullion/css/station.css`

**Interfaces:**
- Consumes: `window.ZineStore` (store.js must load first)
- Produces: DOM sections `#tab-canvas`, `#tab-reduce`, `#tab-editor`; top-bar inputs `#meta-title`, `#meta-author`; import/export buttons

- [ ] **Step 1: Write `css/zine.css`**

```css
/* ── Reset ─────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Global ─────────────────────────────────────────────── */
body {
  background: #e8e8e8;
  font-family: 'Special Elite', serif;
  color: #0a0a0a;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* ── Top bar ─────────────────────────────────────────────── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 2px solid #0a0a0a;
  background: #e8e8e8;
  gap: 12px;
  flex-wrap: wrap;
}

.top-bar__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.meta-title {
  font-family: 'Special Elite', serif;
  font-size: 0.95rem;
  border: none;
  border-bottom: 1px solid #888;
  background: transparent;
  color: #0a0a0a;
  padding: 2px 4px;
  flex: 1;
  min-width: 120px;
}

.meta-author {
  font-family: 'Special Elite', serif;
  font-size: 0.85rem;
  border: none;
  border-bottom: 1px solid #888;
  background: transparent;
  color: #555;
  padding: 2px 4px;
  width: 160px;
}

.meta-title:focus, .meta-author:focus { outline: 2px solid #0a0a0a; outline-offset: 2px; }

.top-bar__sep { color: #888; flex-shrink: 0; }

.top-bar__actions { display: flex; gap: 8px; flex-shrink: 0; }

/* ── Buttons ─────────────────────────────────────────────── */
.btn {
  font-family: 'Special Elite', serif;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 14px;
  border: 1px solid #555;
  background: none;
  color: #555;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.btn:hover { border-color: #0a0a0a; color: #0a0a0a; }
.btn:focus-visible { outline: 2px solid #0a0a0a; outline-offset: 2px; }
.btn--primary { border-color: #0a0a0a; color: #0a0a0a; }
.btn--sm { padding: 4px 10px; font-size: 0.7rem; }

/* ── Tab bar ─────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  border-bottom: 2px solid #0a0a0a;
  background: #e8e8e8;
}

.tab {
  font-family: 'Special Elite', serif;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 10px 20px;
  border: none;
  border-right: 1px solid #aaa;
  background: none;
  color: #888;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.tab:hover { color: #0a0a0a; background: #ddd; }
.tab[aria-selected="true"] { color: #0a0a0a; background: #f5f0e8; border-bottom: 2px solid #f5f0e8; margin-bottom: -2px; }
.tab:focus-visible { outline: 2px solid #0a0a0a; outline-offset: -2px; }

/* ── Main ─────────────────────────────────────────────── */
main { flex: 1; }

/* ── Activity prompt ─────────────────────────────────────── */
.activity-prompt {
  border: 2px solid #0a0a0a;
  padding: 16px 20px;
  margin: 24px;
  background: #f5f0e8;
  position: relative;
  max-width: 780px;
}
.activity-prompt::after {
  content: '';
  position: absolute;
  top: 4px; left: 4px; right: -4px; bottom: -4px;
  border: 1px solid #888;
  z-index: -1;
}
.activity-prompt h2 { font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
.activity-prompt p { font-size: 0.85rem; line-height: 1.7; color: rgba(10,10,10,0.8); }
.activity-prompt p + p { margin-top: 6px; }

/* ── Fragment tray ─────────────────────────────────────── */
.canvas-layout {
  display: grid;
  grid-template-columns: 220px 1fr 180px;
  gap: 16px;
  padding: 0 24px 24px;
  align-items: start;
}

.tray-header, .surface-header, .palette-header {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 8px;
}

.fragment-tray {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 480px;
  overflow-y: auto;
}

.fragment-card {
  font-family: 'Special Elite', serif;
  font-size: 0.8rem;
  line-height: 1.5;
  text-align: left;
  padding: 8px 10px;
  border: 1px solid #aaa;
  background: #f5f0e8;
  color: #0a0a0a;
  cursor: pointer;
  transition: border-color 0.15s;
  width: 100%;
}
.fragment-card:hover { border-color: #0a0a0a; }
.fragment-card:focus-visible { outline: 2px solid #0a0a0a; outline-offset: 2px; }
.fragment-card.selected { border-color: #0a0a0a; background: #ede8de; outline: 2px solid #0a0a0a; }

/* ── Zine surface ─────────────────────────────────────── */
.zine-surface {
  position: relative;
  background: #f5f0e8;
  border: 1px solid #aaa;
  min-height: 480px;
  overflow: hidden;
  cursor: default;
}
.zine-surface.awaiting-placement { cursor: crosshair; border-color: #0a0a0a; }

.placed {
  position: absolute;
  font-family: 'Special Elite', serif;
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(10,10,10,0.85);
  cursor: move;
  user-select: none;
  padding: 2px 4px;
}
.placed:focus-visible { outline: 2px solid #0a0a0a; }
.placed.selected { outline: 2px dashed #0a0a0a; outline-offset: 2px; }
.placed--image img { display: block; max-width: 200px; }

/* ── Image palette ─────────────────────────────────────── */
.image-palette { display: flex; flex-direction: column; gap: 6px; }

.image-thumb {
  border: 1px solid #aaa;
  background: #f5f0e8;
  padding: 3px;
  cursor: pointer;
  width: 100%;
}
.image-thumb:hover { border-color: #0a0a0a; }
.image-thumb:focus-visible { outline: 2px solid #0a0a0a; outline-offset: 2px; }
.image-thumb.selected { border-color: #0a0a0a; outline: 2px solid #0a0a0a; }
.image-thumb img { display: block; width: 100%; height: 80px; object-fit: cover; }

/* ── Canvas controls ─────────────────────────────────────── */
.canvas-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 24px 16px;
  flex-wrap: wrap;
}
.canvas-controls label { font-size: 0.8rem; color: #555; }
.canvas-controls input[type="number"] {
  font-family: 'Special Elite', serif;
  font-size: 0.8rem;
  width: 56px;
  border: 1px solid #aaa;
  background: #f5f0e8;
  padding: 4px 6px;
  color: #0a0a0a;
}
.canvas-controls input[type="number"]:focus-visible { outline: 2px solid #0a0a0a; }

/* ── Free text row ─────────────────────────────────────── */
.free-text-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 24px 16px;
  flex-wrap: wrap;
}
.free-text-row label { font-size: 0.8rem; color: #555; }
.free-text-row input[type="text"] {
  font-family: 'Special Elite', serif;
  font-size: 0.8rem;
  border: 1px solid #aaa;
  background: #f5f0e8;
  padding: 4px 8px;
  color: #0a0a0a;
  flex: 1;
  min-width: 160px;
}
.free-text-row input:focus-visible { outline: 2px solid #0a0a0a; }

/* ── Page nav ─────────────────────────────────────────── */
.page-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 24px 24px;
}
.page-nav button { font-family: 'Special Elite', serif; }
#page-counter { font-size: 0.8rem; color: #555; }

/* ── Editor ─────────────────────────────────────────────── */
.editor-layout { padding: 0 24px 24px; max-width: 780px; }

.editor-meta { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.editor-meta label { font-size: 0.8rem; color: #555; display: block; margin-bottom: 4px; }
.editor-meta input[type="text"] {
  font-family: 'Special Elite', serif;
  font-size: 0.85rem;
  border: 1px solid #aaa;
  background: #f5f0e8;
  padding: 5px 8px;
  color: #0a0a0a;
  width: 260px;
}
.editor-meta input:focus-visible { outline: 2px solid #0a0a0a; }

.fork-toggle { display: flex; gap: 0; margin-bottom: 24px; }
.fork-toggle button {
  font-family: 'Special Elite', serif;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  padding: 8px 16px;
  border: 1px solid #888;
  background: none;
  color: #888;
  cursor: pointer;
}
.fork-toggle button:first-child { border-right: none; }
.fork-toggle button.active { background: #f5f0e8; border-color: #0a0a0a; color: #0a0a0a; }
.fork-toggle button:focus-visible { outline: 2px solid #0a0a0a; outline-offset: 2px; }

.category-block { margin-bottom: 24px; }
.category-block h3 {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0a0a0a;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.category-block .warning {
  font-size: 0.7rem;
  color: #8b4000;
  border: 1px solid #8b4000;
  padding: 2px 6px;
  letter-spacing: 0;
}
.word-list { list-style: none; margin-bottom: 8px; }
.word-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
  font-size: 0.85rem;
  border-bottom: 1px solid #ddd;
}
.word-list li span { flex: 1; }
.word-list .del-btn {
  font-family: 'Special Elite', serif;
  font-size: 0.65rem;
  border: 1px solid #aaa;
  background: none;
  color: #888;
  padding: 2px 6px;
  cursor: pointer;
  letter-spacing: 0.05em;
}
.word-list .del-btn:hover { border-color: #8b0000; color: #8b0000; }
.word-list .del-btn:focus-visible { outline: 2px solid #0a0a0a; }

.add-word-row { display: flex; gap: 8px; align-items: center; }
.add-word-row input[type="text"] {
  font-family: 'Special Elite', serif;
  font-size: 0.8rem;
  border: 1px solid #aaa;
  background: #f5f0e8;
  padding: 4px 8px;
  color: #0a0a0a;
  flex: 1;
}
.add-word-row input:focus-visible { outline: 2px solid #0a0a0a; }

/* ── Hex candidates panel ─────────────────────────────── */
.hex-candidates {
  border: 1px solid #0a0a0a;
  padding: 16px;
  margin-bottom: 24px;
  background: #f5f0e8;
}
.hex-candidates h3 {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.hex-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.hex-swatch {
  width: 28px;
  height: 28px;
  border: 1px solid #888;
  flex-shrink: 0;
}
.hex-label { font-size: 0.75rem; color: #555; width: 90px; flex-shrink: 0; }
.hex-row input[type="text"] {
  font-family: 'Special Elite', serif;
  font-size: 0.8rem;
  border: 1px solid #aaa;
  background: #fff;
  padding: 3px 6px;
  color: #0a0a0a;
  width: 140px;
}
.hex-row input:focus-visible { outline: 2px solid #0a0a0a; }
.hex-row select {
  font-family: 'Special Elite', serif;
  font-size: 0.75rem;
  border: 1px solid #aaa;
  background: #f5f0e8;
  padding: 3px 6px;
  color: #0a0a0a;
}
.hex-row select:focus-visible { outline: 2px solid #0a0a0a; }

/* ── Image metadata panel ─────────────────────────────── */
.images-panel { margin-bottom: 24px; }
.images-panel summary {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 8px 0;
  color: #555;
}
.images-panel summary:focus-visible { outline: 2px solid #0a0a0a; }
.image-meta-item { border-bottom: 1px solid #ddd; padding: 10px 0; }
.image-meta-item .filename { font-size: 0.75rem; color: #888; margin-bottom: 6px; }
.image-meta-item label { font-size: 0.75rem; display: block; margin-bottom: 3px; color: #555; }
.image-meta-item input[type="text"] {
  font-family: 'Special Elite', serif;
  font-size: 0.8rem;
  border: 1px solid #aaa;
  background: #f5f0e8;
  padding: 3px 6px;
  color: #0a0a0a;
  width: 100%;
  margin-bottom: 6px;
}
.image-meta-item input:focus-visible { outline: 2px solid #0a0a0a; }
```

- [ ] **Step 2: Write `css/station.css`**

```css
/* Scoped entirely to #tab-reduce — clinical, monospace aesthetic */
#tab-reduce {
  background: #f0f0f0;
  font-family: 'Courier New', Courier, monospace;
  color: #1a1a1a;
  min-height: calc(100vh - 90px);
  padding-bottom: 32px;
}

#tab-reduce .activity-prompt {
  background: #e4e4e4;
  border-color: #555;
  font-family: 'Courier New', Courier, monospace;
}
#tab-reduce .activity-prompt::after { border-color: #999; }
#tab-reduce .activity-prompt h2 { font-family: 'Courier New', Courier, monospace; }
#tab-reduce .activity-prompt p { font-family: 'Courier New', Courier, monospace; font-size: 0.82rem; }

.reduce-layout { padding: 0 24px 24px; }

.source-toggle { display: flex; gap: 0; margin-bottom: 20px; }
.source-toggle button {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  padding: 7px 16px;
  border: 1px solid #888;
  background: none;
  color: #888;
  cursor: pointer;
}
.source-toggle button:first-child { border-right: none; }
.source-toggle button.active { background: #e4e4e4; border-color: #333; color: #1a1a1a; }
.source-toggle button:focus-visible { outline: 2px solid #333; outline-offset: 2px; }

.source-controls { margin-bottom: 20px; }

.source-controls label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  display: block;
  margin-bottom: 6px;
  color: #555;
}

.source-controls select {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  border: 1px solid #888;
  background: #e4e4e4;
  padding: 5px 8px;
  color: #1a1a1a;
}
.source-controls select:focus-visible { outline: 2px solid #333; }

.upload-zone {
  border: 1px dashed #888;
  padding: 24px;
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  background: #e8e8e8;
  position: relative;
}
.upload-zone:focus-within { outline: 2px solid #333; }
.upload-zone input[type="file"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.preview-img {
  max-width: 300px;
  max-height: 200px;
  border: 1px solid #999;
  display: block;
  margin-bottom: 20px;
}

.reduction-canvases {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.canvas-block { flex: 1; min-width: 180px; }
.canvas-block h4 {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 6px;
}
.canvas-block canvas {
  display: block;
  border: 1px solid #aaa;
  width: 100%;
  height: auto;
}

.measures-table {
  border-collapse: collapse;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  margin-bottom: 20px;
}
.measures-table td { padding: 4px 12px 4px 0; border-bottom: 1px solid #ddd; }
.measures-table td:first-child { color: #555; width: 180px; }
.measures-table .proxy-note { font-size: 0.7rem; color: #888; }

.dominant-swatches {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.swatch-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.swatch-item .swatch {
  width: 40px;
  height: 40px;
  border: 1px solid #888;
  display: block;
}
.swatch-item .swatch-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.65rem;
  color: #444;
  text-align: center;
}

.save-row { margin-top: 8px; }

#tab-reduce .btn {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.04em;
  border-color: #555;
  color: #333;
}
#tab-reduce .btn:hover { border-color: #1a1a1a; color: #1a1a1a; }
#tab-reduce .btn:focus-visible { outline: 2px solid #333; }
```

- [ ] **Step 3: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Procedural Zine Pipeline</title>
  <link href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/zine.css">
  <link rel="stylesheet" href="css/station.css">
</head>
<body>

<header class="top-bar">
  <div class="top-bar__meta">
    <label for="meta-title" class="sr-only">Work title</label>
    <input id="meta-title" class="meta-title" type="text" placeholder="work title" aria-label="Work title">
    <span class="top-bar__sep" aria-hidden="true">—</span>
    <label for="meta-author" class="sr-only">Author name</label>
    <input id="meta-author" class="meta-author" type="text" placeholder="your name" aria-label="Author name">
  </div>
  <div class="top-bar__actions">
    <label class="btn btn--sm" aria-label="Import grammar.json file">
      Import
      <input id="import-file" type="file" accept="application/json" class="sr-only">
    </label>
    <button id="export-btn" class="btn btn--sm">Export</button>
  </div>
</header>

<nav class="tab-bar" role="tablist" aria-label="Pipeline activities">
  <button class="tab" role="tab" aria-selected="true"  aria-controls="tab-canvas" id="btn-canvas">Activity 1 — Generate</button>
  <button class="tab" role="tab" aria-selected="false" aria-controls="tab-reduce" id="btn-reduce">Activity 2 — Reduce</button>
  <button class="tab" role="tab" aria-selected="false" aria-controls="tab-editor" id="btn-editor">Activity 3 — Edit Vocabulary</button>
</nav>

<main>

  <!-- ── Activity 1: Generate ──────────────────────────── -->
  <section id="tab-canvas" role="tabpanel" aria-labelledby="btn-canvas">
    <div class="activity-prompt">
      <h2>Activity 1 — Generate</h2>
      <p>This tool uses a Tracery grammar — a list of templates and word categories — to generate text fragments. The grammar here is a remix of Nick Montfort's <em>Taroko Gorge</em> (2009), the ur-text of procedural landscape poetry, rewritten with vocabulary drawn from Slieve Gullion, an ancient mountain in County Armagh.</p>
      <p>Throw fragments using the control below. Then <strong>curate, don't just consume</strong>: click a fragment to select it, then click anywhere on the page to place it. Add images from the palette and your own free text. The machine supplies raw material; you arrange it into a page.</p>
    </div>

    <div class="canvas-controls">
      <label for="throw-count">Fragments to throw:</label>
      <input id="throw-count" type="number" min="1" max="20" value="6" aria-label="Number of fragments to generate">
      <button id="throw-btn" class="btn btn--primary">Throw fragments</button>
    </div>

    <div class="canvas-layout">
      <div>
        <p class="tray-header" aria-hidden="true">Fragment tray</p>
        <div id="fragment-tray" aria-label="Generated fragment tray" aria-live="polite"></div>
      </div>
      <div>
        <p class="surface-header" aria-hidden="true">Zine page</p>
        <div id="zine-surface" role="region" aria-label="Zine page canvas — click to place selected element"></div>
      </div>
      <div>
        <p class="palette-header" aria-hidden="true">Project images</p>
        <div id="image-palette" aria-label="Project image palette"></div>
      </div>
    </div>

    <div class="free-text-row">
      <label for="free-text-input">Add your own text:</label>
      <input id="free-text-input" type="text" placeholder="type something, then place it on the page">
      <button id="free-text-btn" class="btn">Add text element</button>
    </div>

    <div class="page-nav">
      <button id="prev-page" class="btn btn--sm" aria-label="Previous page">&#8592;</button>
      <span id="page-counter" aria-live="polite">Page 1 of 1</span>
      <button id="next-page" class="btn btn--sm" aria-label="Next page">&#8594;</button>
      <button id="new-page" class="btn btn--sm">New page</button>
    </div>
  </section>

  <!-- ── Activity 2: Reduce ─────────────────────────────── -->
  <section id="tab-reduce" role="tabpanel" aria-labelledby="btn-reduce" hidden>
    <div class="activity-prompt">
      <h2>Activity 2 — Reduce</h2>
      <p>Upload one of your own photographs. The tool will reduce it to five measurements and render it three ways. Each rendering strips something the original had — and that loss is the point.</p>
      <p>Notice what the machine can and cannot recover. The five dominant colors are extracted and offered to you in Activity 3, where you can name them in your own language and add them to the grammar.</p>
    </div>

    <div class="reduce-layout">
      <div class="source-toggle" role="group" aria-label="Image source">
        <button id="src-upload" class="active" aria-pressed="true">Upload image</button>
        <button id="src-project" aria-pressed="false">Project image</button>
      </div>

      <div class="source-controls">
        <div id="upload-controls">
          <div class="upload-zone" role="button" tabindex="0" aria-label="Upload an image file for reduction analysis">
            <span>Click or drag an image file here</span>
            <input id="upload-input" type="file" accept="image/*" aria-label="Upload image file">
          </div>
        </div>
        <div id="project-controls" hidden>
          <label for="project-image-select">Select a project image:</label>
          <select id="project-image-select">
            <option value="">— choose —</option>
          </select>
        </div>
      </div>

      <img id="reduce-preview" class="preview-img" alt="Image preview" hidden>

      <div class="reduction-canvases" id="reduction-canvases" hidden>
        <div class="canvas-block">
          <h4>Edge map</h4>
          <canvas id="canvas-edge" aria-label="Edge map: outlines and boundaries extracted from the image."></canvas>
        </div>
        <div class="canvas-block">
          <h4>Posterization</h4>
          <canvas id="canvas-poster" aria-label="Posterization: image redrawn using only the five dominant extracted colors."></canvas>
        </div>
        <div class="canvas-block">
          <h4>Data rebuild</h4>
          <canvas id="canvas-data" aria-label="Data rebuild: the five measured colors as proportional bars — every color, none of the picture."></canvas>
        </div>
      </div>

      <table class="measures-table" id="measures-table" hidden>
        <caption class="sr-only">Computed reduction measures</caption>
        <tbody>
          <tr><td>Brightness</td><td id="m-brightness">—</td></tr>
          <tr><td>Blur (Laplacian variance)</td><td id="m-blur">—</td></tr>
          <tr><td>Edge density</td><td id="m-edge">—</td></tr>
          <tr>
            <td>Contour count <span class="proxy-note">(proxy)</span></td>
            <td id="m-contour">—</td>
          </tr>
        </tbody>
      </table>

      <div class="dominant-swatches" id="dominant-swatches" hidden aria-label="Dominant colors"></div>

      <div class="save-row" id="save-row" hidden>
        <button id="save-reduction-btn" class="btn btn--primary">Save to project</button>
      </div>
    </div>
  </section>

  <!-- ── Activity 3: Edit Vocabulary ───────────────────── -->
  <section id="tab-editor" role="tabpanel" aria-labelledby="btn-editor" hidden>
    <div class="activity-prompt">
      <h2>Activity 3 — Edit Vocabulary</h2>
      <p>Now author your own version of the grammar. Choose whether to fork the instructor's Slieve Gullion vocabulary or start from an empty skeleton. Either way, the categories and templates stay the same — the words are yours.</p>
      <p>If Activity 2 produced dominant colors from your image, they appear below as candidates. Name each color in your own language, then add it to a category. That is the move: the machine extracted data; you give it meaning. Notice that an empty category makes the generator break visibly — <code>[symbol_name]</code> in the output. That broken syntax is the skeleton showing through.</p>
    </div>

    <div class="editor-layout">
      <div class="editor-meta">
        <div>
          <label for="edit-title">Work title</label>
          <input id="edit-title" type="text" placeholder="your work's title" aria-label="Work title">
        </div>
        <div>
          <label for="edit-author">Your name</label>
          <input id="edit-author" type="text" placeholder="your name" aria-label="Your name">
        </div>
      </div>

      <div class="fork-toggle" role="group" aria-label="Starting vocabulary">
        <button id="fork-btn" class="active" aria-pressed="true">Start from instructor's example</button>
        <button id="empty-btn" aria-pressed="false">Start empty</button>
      </div>

      <div id="hex-candidates-panel"></div>

      <div id="category-blocks"></div>

      <details class="images-panel">
        <summary>Project image captions &amp; alt text</summary>
        <div id="image-meta-list"></div>
      </details>
    </div>
  </section>

</main>

<script src="js/store.js"></script>
<script src="js/tracery.js"></script>
<script src="js/canvas.js"></script>
<script src="js/reduction.js"></script>
<script src="js/editor.js"></script>
<script>
  // ── Tab switching ───────────────────────────────────────
  var tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  var panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  function switchTab(target) {
    tabs.forEach(function (t) {
      var active = (t === target);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach(function (p) {
      var show = (p.id === target.getAttribute('aria-controls'));
      p.hidden = !show;
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { switchTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var idx = tabs.indexOf(tab);
      if (e.key === 'ArrowRight') { e.preventDefault(); tabs[(idx + 1) % tabs.length].focus(); switchTab(tabs[(idx + 1) % tabs.length]); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); tabs[(idx - 1 + tabs.length) % tabs.length].focus(); switchTab(tabs[(idx - 1 + tabs.length) % tabs.length]); }
    });
  });

  // ── Top-bar meta inputs ─────────────────────────────────
  document.getElementById('meta-title').addEventListener('input', function (e) {
    ZineStore.update({ meta: Object.assign({}, ZineStore.state.meta, { title: e.target.value }) });
    var editTitle = document.getElementById('edit-title');
    if (editTitle) editTitle.value = e.target.value;
  });
  document.getElementById('meta-author').addEventListener('input', function (e) {
    ZineStore.update({ meta: Object.assign({}, ZineStore.state.meta, { author: e.target.value }) });
    var editAuthor = document.getElementById('edit-author');
    if (editAuthor) editAuthor.value = e.target.value;
  });

  // ── Import / Export ─────────────────────────────────────
  document.getElementById('import-file').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    ZineStore.importFile(file).then(function () {
      document.getElementById('meta-title').value = ZineStore.state.meta.title;
      document.getElementById('meta-author').value = ZineStore.state.meta.author;
    }).catch(function () {
      alert('Could not parse that file. Make sure it is a valid grammar.json export.');
    });
    e.target.value = '';
  });
  document.getElementById('export-btn').addEventListener('click', function () {
    ZineStore.exportJSON();
  });

  // ── Initial load ────────────────────────────────────────
  ZineStore.load('data/grammar.json').then(function () {
    document.getElementById('meta-title').value  = ZineStore.state.meta.title  || '';
    document.getElementById('meta-author').value = ZineStore.state.meta.author || '';
  });
</script>
</body>
</html>
```

- [ ] **Step 4: Serve the project and verify tab switching**

```bash
# From the portfolio root:
bundle exec jekyll serve
# Navigate to: http://localhost:4000/phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/
```

Check:
- Three tabs render; clicking each shows/hides the correct section
- Arrow keys on tab bar switch focus and swap panels
- Top bar title/author inputs are visible
- Import label and Export button are present
- Console shows no errors; `grammar.json` load succeeds (check Network tab — 200)
- The zine aesthetic (Special Elite font, paper tones) applies to Activities 1 & 3
- Activity 2 background is visibly cooler/lighter than 1 & 3

- [ ] **Step 5: Commit**

```bash
git add phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/index.html \
        phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/css/
git commit -m "feat: hub index.html, zine.css, station.css with tab switching"
```

---

## Task 4: Activity 1 — Generate (`canvas.js`)

**Files:**
- Create: `slieve-gullion/js/canvas.js`

**Interfaces:**
- Consumes: `window.ZineStore.state.grammar`, `window.ZineStore.state.images`, `window.ZineStore.state.pages`, `window.Tracery.expand(grammar, symbol)`
- Consumes DOM: `#throw-count`, `#throw-btn`, `#fragment-tray`, `#zine-surface`, `#image-palette`, `#free-text-input`, `#free-text-btn`, `#prev-page`, `#next-page`, `#new-page`, `#page-counter`
- Writes: `ZineStore.update({ pages: [...] })`

- [ ] **Step 1: Write `js/canvas.js`**

```js
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
    renderPage();
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
        renderPage();
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
      ZineStore.update({ pages: ZineStore.state.pages.slice() });
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
    var pages = ZineStore.state.pages;
    var id = 'page_' + String(pages.length + 1).padStart(3, '0');
    pages.push({ id: id, elements: [] });
    currentPageIndex = pages.length - 1;
    ZineStore.update({ pages: pages.slice() });
    renderPage();
    updatePageCounter();
  }
  function updatePageCounter() {
    document.getElementById('page-counter').textContent =
      'Page ' + (currentPageIndex + 1) + ' of ' + ZineStore.state.pages.length;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
```

- [ ] **Step 2: Verify Activity 1 in the browser**

Open the tool in the browser. In Activity 1:
- Click "Throw fragments" — tray populates with 6 Slieve Gullion-flavored lines; none contain `#symbol#` markers
- Click a fragment card — it gains a highlighted border; the page cursor becomes crosshair
- Click the zine page — the fragment appears at the click location as a positioned div
- Click the placed element — it gains a dashed outline; arrow keys move it 4px per press
- Delete key removes the selected placed element
- Add a free text string — it enters selected state; click the page to place it
- Click "New page" — counter reads "Page 2 of 2"; the page is empty
- Click prev arrow — counter reads "Page 1 of 1"; placed elements reappear
- Export: opens a download; inspect the JSON — `pages[0].elements` contains all placed elements with correct `x`, `y`, `type`, `text`/`imageId`

- [ ] **Step 3: Commit**

```bash
git add phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/js/canvas.js
git commit -m "feat: Activity 1 — fragment tray, zine surface, page navigation (canvas.js)"
```

---

## Task 5: Activity 2 — Reduce (`reduction.js`)

**Files:**
- Create: `slieve-gullion/js/reduction.js`

**Interfaces:**
- Consumes: `window.ZineStore.state.images`, `ZineStore.update(...)`, `ZineStore.saveDominantHexes(hexes)`
- Consumes DOM: `#src-upload`, `#src-project`, `#upload-input`, `#project-image-select`, `#reduce-preview`, `#reduction-canvases`, `#canvas-edge`, `#canvas-poster`, `#canvas-data`, `#measures-table`, `#m-brightness`, `#m-blur`, `#m-edge`, `#m-contour`, `#dominant-swatches`, `#save-reduction-btn`, `#save-row`
- Produces: `ZineStore.state.images[id].reduction` populated; `ZineStore.dominantHexes` set

- [ ] **Step 1: Write `js/reduction.js`**

```js
(function () {
  var currentImageId = null;   // id from images[] if project image selected
  var currentReduction = null; // the computed result

  function init() {
    document.getElementById('src-upload').addEventListener('click', function () { setSourceMode('upload'); });
    document.getElementById('src-project').addEventListener('click', function () { setSourceMode('project'); });
    document.getElementById('upload-input').addEventListener('change', onUpload);
    document.getElementById('project-image-select').addEventListener('change', onProjectSelect);
    document.getElementById('save-reduction-btn').addEventListener('click', saveReduction);
    ZineStore.subscribe(populateProjectSelect);
    populateProjectSelect();
  }

  // ── Source mode toggle ───────────────────────────────────
  function setSourceMode(mode) {
    var isUpload = (mode === 'upload');
    document.getElementById('src-upload').classList.toggle('active', isUpload);
    document.getElementById('src-upload').setAttribute('aria-pressed', isUpload ? 'true' : 'false');
    document.getElementById('src-project').classList.toggle('active', !isUpload);
    document.getElementById('src-project').setAttribute('aria-pressed', isUpload ? 'false' : 'true');
    document.getElementById('upload-controls').hidden  = !isUpload;
    document.getElementById('project-controls').hidden =  isUpload;
  }

  function populateProjectSelect() {
    var sel = document.getElementById('project-image-select');
    var current = sel.value;
    sel.innerHTML = '<option value="">— choose —</option>';
    ZineStore.state.images.forEach(function (img) {
      var opt = document.createElement('option');
      opt.value = img.id;
      opt.textContent = img.src.split('/').pop() + (img.alt ? ' — ' + img.alt : '');
      sel.appendChild(opt);
    });
    sel.value = current;
  }

  // ── Image load ───────────────────────────────────────────
  function onUpload(e) {
    var file = e.target.files[0];
    if (!file) return;
    currentImageId = null;
    var url = URL.createObjectURL(file);
    loadImageAndAnalyse(url, function () { URL.revokeObjectURL(url); });
  }

  function onProjectSelect(e) {
    var id = e.target.value;
    if (!id) return;
    currentImageId = id;
    var imgData = ZineStore.state.images.find(function (i) { return i.id === id; });
    if (!imgData) return;
    loadImageAndAnalyse(imgData.src, null);
  }

  function loadImageAndAnalyse(src, onDone) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      var preview = document.getElementById('reduce-preview');
      preview.src = src;
      preview.hidden = false;
      analyseImage(img);
      if (onDone) onDone();
    };
    img.onerror = function () { alert('Could not load image. If using a project image, make sure the file exists in the images/ folder.'); };
    img.src = src;
  }

  // ── Analysis ─────────────────────────────────────────────
  var SAMPLE_SIZE = 200;

  function analyseImage(img) {
    // Draw to offscreen canvas at reduced size
    var off = document.createElement('canvas');
    var scale = Math.min(SAMPLE_SIZE / img.width, SAMPLE_SIZE / img.height, 1);
    off.width  = Math.round(img.width  * scale);
    off.height = Math.round(img.height * scale);
    var ctx = off.getContext('2d');
    ctx.drawImage(img, 0, 0, off.width, off.height);
    var data = ctx.getImageData(0, 0, off.width, off.height);
    var W = off.width, H = off.height;

    var gray   = toGray(data, W, H);
    var bright = meanBrightness(data);
    var blur   = laplacianVariance(gray, W, H);
    var edges  = sobelEdges(gray, W, H);
    var thresh = threshold(edges);
    var edgeDensity = thresh.filter(function (v) { return v; }).length / (W * H);
    var contours = connectedComponents(thresh, W, H, 8);
    var dominant = kMeans(data, 5, 12);

    currentReduction = {
      brightness:   parseFloat(bright.toFixed(4)),
      blur:         parseFloat(blur.toFixed(4)),
      dominant:     dominant,
      edgeDensity:  parseFloat(edgeDensity.toFixed(4)),
      contourCount: contours
    };

    renderResults(W, H, gray, edges, thresh, dominant, currentReduction);
    ZineStore.saveDominantHexes(dominant);
  }

  // ── Pixel math ───────────────────────────────────────────
  function toGray(imageData, W, H) {
    var d = imageData.data;
    var g = new Float32Array(W * H);
    for (var i = 0; i < W * H; i++) {
      var r = d[i*4], gr = d[i*4+1], b = d[i*4+2];
      g[i] = 0.2126*r + 0.7152*gr + 0.0722*b;
    }
    return g;
  }

  function meanBrightness(imageData) {
    var d = imageData.data;
    var sum = 0, n = d.length / 4;
    for (var i = 0; i < n; i++) {
      sum += (0.2126*d[i*4] + 0.7152*d[i*4+1] + 0.0722*d[i*4+2]) / 255;
    }
    return sum / n;
  }

  function laplacianVariance(gray, W, H) {
    var vals = [];
    for (var y = 1; y < H-1; y++) {
      for (var x = 1; x < W-1; x++) {
        var v = -gray[(y-1)*W+x] - gray[(y+1)*W+x] - gray[y*W+(x-1)] - gray[y*W+(x+1)] + 4*gray[y*W+x];
        vals.push(v);
      }
    }
    var mean = vals.reduce(function(a,b){return a+b;},0) / vals.length;
    var variance = vals.reduce(function(acc,v){return acc+(v-mean)*(v-mean);},0) / vals.length;
    return variance;
  }

  function sobelEdges(gray, W, H) {
    var edges = new Float32Array(W * H);
    for (var y = 1; y < H-1; y++) {
      for (var x = 1; x < W-1; x++) {
        var gx = -gray[(y-1)*W+(x-1)] + gray[(y-1)*W+(x+1)]
                 -2*gray[y*W+(x-1)]   + 2*gray[y*W+(x+1)]
                 -gray[(y+1)*W+(x-1)] + gray[(y+1)*W+(x+1)];
        var gy = -gray[(y-1)*W+(x-1)] - 2*gray[(y-1)*W+x] - gray[(y-1)*W+(x+1)]
                 +gray[(y+1)*W+(x-1)] + 2*gray[(y+1)*W+x] + gray[(y+1)*W+(x+1)];
        edges[y*W+x] = Math.sqrt(gx*gx + gy*gy);
      }
    }
    return edges;
  }

  function threshold(edges) {
    var max = 0;
    for (var i = 0; i < edges.length; i++) if (edges[i] > max) max = edges[i];
    var t = max * 0.2;
    return Array.from(edges).map(function(v){ return v > t ? 1 : 0; });
  }

  function connectedComponents(binary, W, H, minSize) {
    var visited = new Uint8Array(W * H);
    var count = 0;
    for (var start = 0; start < W * H; start++) {
      if (!binary[start] || visited[start]) continue;
      var queue = [start];
      visited[start] = 1;
      var size = 0;
      while (queue.length) {
        var curr = queue.shift();
        size++;
        var cy = Math.floor(curr / W), cx = curr % W;
        var neighbors = [[-1,0],[1,0],[0,-1],[0,1]];
        for (var n = 0; n < neighbors.length; n++) {
          var ny = cy + neighbors[n][0], nx = cx + neighbors[n][1];
          if (ny>=0 && ny<H && nx>=0 && nx<W) {
            var ni = ny*W+nx;
            if (binary[ni] && !visited[ni]) { visited[ni]=1; queue.push(ni); }
          }
        }
      }
      if (size >= minSize) count++;
    }
    return count;
  }

  function kMeans(imageData, k, iterations) {
    var d = imageData.data;
    var n = d.length / 4;
    // Sample up to 2000 pixels for speed
    var step = Math.max(1, Math.floor(n / 2000));
    var pixels = [];
    for (var i = 0; i < n; i += step) {
      pixels.push([d[i*4], d[i*4+1], d[i*4+2]]);
    }
    // Init centroids
    var centroids = [];
    for (var c = 0; c < k; c++) {
      centroids.push(pixels[Math.floor(Math.random() * pixels.length)].slice());
    }
    for (var iter = 0; iter < iterations; iter++) {
      var clusters = [];
      for (var ci = 0; ci < k; ci++) clusters.push([]);
      pixels.forEach(function (px) {
        var best = 0, minD = Infinity;
        centroids.forEach(function (ct, ci) {
          var dist = (px[0]-ct[0])*(px[0]-ct[0]) + (px[1]-ct[1])*(px[1]-ct[1]) + (px[2]-ct[2])*(px[2]-ct[2]);
          if (dist < minD) { minD = dist; best = ci; }
        });
        clusters[best].push(px);
      });
      centroids = centroids.map(function (ct, ci) {
        var cl = clusters[ci];
        if (!cl.length) return ct;
        var sum = [0,0,0];
        cl.forEach(function(px){ sum[0]+=px[0]; sum[1]+=px[1]; sum[2]+=px[2]; });
        return sum.map(function(v){ return Math.round(v/cl.length); });
      });
    }
    // Final assignment for pct
    var counts = new Array(k).fill(0);
    pixels.forEach(function (px) {
      var best = 0, minD = Infinity;
      centroids.forEach(function (ct, ci) {
        var dist = (px[0]-ct[0])*(px[0]-ct[0]) + (px[1]-ct[1])*(px[1]-ct[1]) + (px[2]-ct[2])*(px[2]-ct[2]);
        if (dist < minD) { minD = dist; best = ci; }
      });
      counts[best]++;
    });
    return centroids.map(function (ct, ci) {
      var hex = '#' + ct.map(function(v){ return v.toString(16).padStart(2,'0'); }).join('');
      return { hex: hex, pct: parseFloat((counts[ci]/pixels.length).toFixed(3)) };
    }).sort(function(a,b){ return b.pct - a.pct; });
  }

  // ── Render results ───────────────────────────────────────
  function renderResults(W, H, gray, edges, thresh, dominant, measures) {
    renderEdgeMap(W, H, edges);
    renderPosterization(W, H, gray, dominant);
    renderDataRebuild(dominant);

    document.getElementById('m-brightness').textContent = measures.brightness;
    document.getElementById('m-blur').textContent       = measures.blur;
    document.getElementById('m-edge').textContent       = measures.edgeDensity;
    document.getElementById('m-contour').textContent    = measures.contourCount;

    renderSwatches(dominant);

    document.getElementById('reduction-canvases').hidden = false;
    document.getElementById('measures-table').hidden     = false;
    document.getElementById('dominant-swatches').hidden  = false;
    document.getElementById('save-row').hidden           = false;
  }

  function renderEdgeMap(W, H, edges) {
    var canvas = document.getElementById('canvas-edge');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    var imgData = ctx.createImageData(W, H);
    var max = 0;
    for (var i = 0; i < edges.length; i++) if (edges[i] > max) max = edges[i];
    for (var j = 0; j < W*H; j++) {
      var v = Math.round((edges[j] / (max || 1)) * 255);
      imgData.data[j*4]=v; imgData.data[j*4+1]=v; imgData.data[j*4+2]=v; imgData.data[j*4+3]=255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function renderPosterization(W, H, gray, dominant) {
    // Reconstruct original pixel data from gray (we need rgb — re-draw from preview)
    var preview = document.getElementById('reduce-preview');
    var off = document.createElement('canvas');
    off.width = W; off.height = H;
    var offCtx = off.getContext('2d');
    offCtx.drawImage(preview, 0, 0, W, H);
    var src = offCtx.getImageData(0, 0, W, H);

    var canvas = document.getElementById('canvas-poster');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    var imgData = ctx.createImageData(W, H);

    var centroids = dominant.map(function(d) {
      var hex = d.hex.replace('#','');
      return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
    });

    for (var i = 0; i < W*H; i++) {
      var r = src.data[i*4], g = src.data[i*4+1], b = src.data[i*4+2];
      var best = 0, minD = Infinity;
      centroids.forEach(function(ct, ci) {
        var dist = (r-ct[0])*(r-ct[0])+(g-ct[1])*(g-ct[1])+(b-ct[2])*(b-ct[2]);
        if (dist < minD) { minD = dist; best = ci; }
      });
      imgData.data[i*4]   = centroids[best][0];
      imgData.data[i*4+1] = centroids[best][1];
      imgData.data[i*4+2] = centroids[best][2];
      imgData.data[i*4+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function renderDataRebuild(dominant) {
    var canvas = document.getElementById('canvas-data');
    canvas.width = 200; canvas.height = 120;
    var ctx = canvas.getContext('2d');
    var x = 0;
    dominant.forEach(function(d) {
      var w = Math.round(d.pct * 200);
      ctx.fillStyle = d.hex;
      ctx.fillRect(x, 0, w, 120);
      x += w;
    });
  }

  function renderSwatches(dominant) {
    var container = document.getElementById('dominant-swatches');
    container.innerHTML = '';
    dominant.forEach(function(d) {
      var item = document.createElement('div');
      item.className = 'swatch-item';
      var swatch = document.createElement('span');
      swatch.className = 'swatch';
      swatch.style.background = d.hex;
      swatch.setAttribute('aria-hidden', 'true');
      var label = document.createElement('span');
      label.className = 'swatch-text';
      label.textContent = d.hex + '\n' + Math.round(d.pct * 100) + '%';
      item.appendChild(swatch);
      item.appendChild(label);
      container.appendChild(item);
    });
  }

  // ── Save ─────────────────────────────────────────────────
  function saveReduction() {
    if (!currentReduction) return;
    var images = ZineStore.state.images;
    if (currentImageId) {
      var target = images.find(function(i){ return i.id === currentImageId; });
      if (target) target.reduction = currentReduction;
      ZineStore.update({ images: images.slice() });
    }
    // dominantHexes already set in analyseImage via saveDominantHexes
    alert('Reduction data saved. Switch to Activity 3 to name the dominant colors.');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
```

- [ ] **Step 2: Verify Activity 2 in the browser**

Navigate to Activity 2:
- Upload a JPEG photo — preview renders; three canvases appear
- Edge map: grayscale outlines visible; not the original photo
- Posterization: flat color regions; clearly not photographic
- Data rebuild: five vertical color bars; no spatial content at all
- Five measures show non-null numbers
- Five dominant swatches show hex strings + percentage text
- Click "Save to project" — alert appears; switch to Activity 3 — hex candidates panel should be populated
- Test with a project image: select from dropdown — same analysis runs
- Export JSON — find the selected image in `images[]`; `reduction` object is populated with real numbers

- [ ] **Step 3: Commit**

```bash
git add phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/js/reduction.js
git commit -m "feat: Activity 2 — image reduction, 3 renders, k-means dominant colors (reduction.js)"
```

---

## Task 6: Activity 3 — Edit Vocabulary (`editor.js`)

**Files:**
- Create: `slieve-gullion/js/editor.js`

**Interfaces:**
- Consumes: `ZineStore.state.grammar`, `ZineStore.state.images`, `ZineStore.state.meta`, `ZineStore.getSeedGrammar()`, `ZineStore.dominantHexes`
- Consumes DOM: `#edit-title`, `#edit-author`, `#fork-btn`, `#empty-btn`, `#hex-candidates-panel`, `#category-blocks`, `#image-meta-list`
- Writes: `ZineStore.update({ grammar: ..., meta: ... })`

- [ ] **Step 1: Write `js/editor.js`**

```js
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
    ZineStore.state.images.forEach(function(img) {
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
        img.alt = e.target.value;
        ZineStore.update({ images: ZineStore.state.images.slice() });
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
        img.caption = e.target.value;
        ZineStore.update({ images: ZineStore.state.images.slice() });
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
```

- [ ] **Step 2: Verify Activity 3 in the browser**

Navigate to Activity 3:
- Fork/empty toggle: click "Start empty" → confirm dialog → all category lists clear; generator in Activity 1 now outputs `[noun_anchor]` etc.
- Click "Start from instructor's example" → lists repopulate with Slieve Gullion seed
- Add a word to `noun_anchor` → switch to Activity 1 → throw fragments → new word can appear in output
- Remove a word — list shrinks immediately
- Make `noun_room` empty — warning badge appears next to its heading
- Activity 2: upload an image, save reduction → switch to Activity 3 → "Colors from your reduction" panel appears with five swatches
- Name a color and add it to `adjective_state` → switch to Activity 1 → named color can appear in generated fragments
- Image metadata: expand "Project image captions & alt text" → type an alt text → export JSON → confirm `images[0].alt` is populated

- [ ] **Step 3: Commit**

```bash
git add phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/js/editor.js
git commit -m "feat: Activity 3 — vocabulary editor, fork/empty, hex candidates, image metadata (editor.js)"
```

---

## Task 7: `index.md` + Accessibility Audit + Final Wiring

**Files:**
- Create: `slieve-gullion/index.md`
- No JS changes expected; CSS `:focus-visible` already in place from Task 3

**Interfaces:**
- No new interfaces; final verification of round-trip import/export

- [ ] **Step 1: Write `slieve-gullion/index.md`**

```markdown
---
layout: default
title: "Walking the Hero's Path at Slieve Gullion"
description: "A three-activity procedural zine pipeline: Tracery grammar remix of Taroko Gorge, client-side image reduction, and vocabulary authoring — all sharing one JSON file."
project: true
tags: [Texts and Technology, E-Lit, Generative, Procedural, Critical Making in Texts and Technology, Tracery, Machine Learning, Experimental Literature]
---

# Walking the Hero's Path at Slieve Gullion

A three-activity classroom tool for a course on machine learning and code. Students engage with a Tracery grammar remix of Nick Montfort's *Taroko Gorge* (2009) set at Slieve Gullion, reduce their own photographs to machine-legible data, then author vocabulary into the grammar using what the machine extracted.

[Open the pipeline](/phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/index.html)
```

- [ ] **Step 2: Keyboard accessibility walkthrough**

Open the tool. Navigate using only the keyboard (Tab, Shift+Tab, Enter, Space, Arrow keys):

| Check | Expected |
|---|---|
| Tab to tab bar | Focus visible on active tab |
| Arrow keys on tab bar | Switches to adjacent tab; focus moves |
| Tab into Activity 1, reach "Throw fragments" button | Visible focus ring; Enter activates |
| Tab to a fragment card; Enter to select it | Card shows highlighted border |
| Tab to zine surface; Enter on surface | (Note: surface click requires mouse; arrow-key repositioning of placed elements is the keyboard path) |
| Tab to placed element; arrow keys | Element moves 4px; Delete removes it |
| Tab to image palette thumbnail; Enter | Thumbnail selected |
| Tab to Activity 2; reach upload zone | Focus ring on dashed border; Enter opens file dialog |
| Tab to "Save to project" | Focus visible; Enter saves |
| Tab to Activity 3 fork toggle | Both buttons reachable; Enter activates |
| Tab to add-word inputs | Enter submits add |
| Tab to remove buttons | Enter activates; aria-label reads word name |

Fix any missing `:focus-visible` states found during this walkthrough.

- [ ] **Step 3: Full import/export round-trip test**

```
1. Load the tool in the browser (grammar.json loads via fetch)
2. Activity 1: throw 6 fragments, place 3 on the page, add a free-text element
3. Activity 3: add the word "basaltic" to noun_anchor
4. Click Export → save grammar.json to Desktop
5. Reload the page (state resets to fresh seed)
6. Click Import → select the saved grammar.json
7. Verify:
   - meta-title and meta-author fields repopulate
   - Activity 1: throw fragments — "basaltic" can appear in output
   - Activity 1: the placed elements from step 2 are NOT re-rendered
     (pages[] is in JSON but canvas.js renders page_001; if currentPageIndex=0 elements appear)
   - Activity 3: noun_anchor list includes "basaltic"
8. Export again → open JSON in text editor → confirm pages[], grammar, meta all intact
```

- [ ] **Step 4: Offline file:// test**

Open `index.html` directly from the filesystem (no server). Expected:
- `fetch('data/grammar.json')` fails silently (404 / CORS)
- Tool loads with empty state (blank title, empty category lists)
- Import button: upload the grammar.json from Desktop → all data loads correctly
- Tool is fully functional via import

- [ ] **Step 5: Commit**

```bash
git add phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/index.md
git commit -m "feat: index.md entry point for slieve-gullion zine pipeline"
```

- [ ] **Step 6: Drop your Slieve Gullion images into `images/`**

Name them `slieve-gullion-01.jpg` through however many you have. Update `data/grammar.json` `images[]` entries to match real filenames and fill in `alt` text for each. If you have fewer than 12, remove extra entries; if more, add entries following the same schema.

```bash
git add phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/images/ \
        phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/data/grammar.json
git commit -m "content: add Slieve Gullion photographs and update grammar.json image entries"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Static, no backend, no build step | Global constraints; no npm/build in any task |
| No browser storage APIs | store.js uses no localStorage/sessionStorage |
| JSON import/export everywhere | store.js Task 1; import/export wired in index.html Task 3 |
| One shared schema | grammar.json Task 1; all modules read ZineStore |
| Tracery expander ported | Task 2 |
| Fragment tray + two-click-place | Task 4 canvas.js |
| Image palette + free text | Task 4 canvas.js |
| Multiple pages | Task 4 canvas.js |
| Drag to reposition placed elements | Task 4 canvas.js (mousedown handler) |
| Arrow-key repositioning | Task 4 canvas.js (onKeyDown) |
| 5 reduction measures | Task 5 reduction.js |
| 3 reduction renders | Task 5 reduction.js |
| contourCount labeled as proxy | station.css `.proxy-note`; measures-table HTML |
| Dominant hexes → editor | saveDominantHexes in Task 5; renderHexCandidates in Task 6 |
| Fork/empty toggle with confirmation | Task 6 editor.js applyMode() |
| Per-category add/remove + live validation | Task 6 editor.js |
| Image alt/caption editing | Task 6 editor.js renderImageMeta() |
| Activity prompts in UI | index.html Task 3 |
| Zine aesthetic (Activities 1 & 3) | zine.css Task 3 |
| Clinical aesthetic (Activity 2) | station.css Task 3, scoped to #tab-reduce |
| Keyboard accessibility + focus-visible | zine.css + station.css Task 3; audit Task 7 |
| aria-label on canvases | index.html Task 3 |
| Color never sole signal | dominant swatches show hex + pct text (Tasks 5, 6) |
| Works offline with import | Task 7 offline test |
| Jekyll iframe compatible | Static files, no framework; verified in Task 7 |
| index.md front-matter | Task 7 |
| Real Slieve Gullion images | Task 7 Step 6 |

All spec requirements covered.
