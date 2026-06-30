# Design: Procedural Zine Pipeline — Walking the Hero's Path at Slieve Gullion

**Date:** 2026-06-30
**Location in repo:** `phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/`
**Context:** A three-activity classroom tool for a course on machine learning and code. Students engage with an instructor-seeded Tracery grammar (a Taroko Gorge remix set at Slieve Gullion), then reduce their own images to machine-legible data, then author their own vocabulary into the grammar — using what the machine extracted to inform what they write. The tool is self-contained: static HTML/CSS/JS, no backend, no build step, no browser storage APIs.

---

## File Structure

```
phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/
  index.html
  data/
    grammar.json
  images/
    slieve-gullion-01.jpg   (12 placeholder entries; author fills paths)
    ...
    slieve-gullion-12.jpg
  js/
    store.js
    tracery.js
    canvas.js
    editor.js
    reduction.js
  css/
    zine.css
    station.css
```

An `index.md` alongside follows the same front-matter pattern as the SASB project (layout: default, title, description, project: true, tags). The `index.html` is a standalone asset — no Jekyll templating inside it — so it works both as a Jekyll-served page and as a direct file open. When served, `grammar.json` loads via `fetch()`; when opened offline, the user loads it via the import button.

---

## Shared Schema: `data/grammar.json`

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
      "#verb_fails# into #adjective_state# #noun_room#"
    ],
    "noun_anchor": ["cairn", "summit", "lake", "heather", "basalt", "ridge", "bog", "stone"],
    "noun_room": ["passage", "chamber", "hillfort", "valley", "crater", "heath", "fen"],
    "adjective_state": ["ancient", "submerged", "sacred", "eroded", "misted", "calcified", "silted"],
    "verb_fails": ["yields", "dissolves", "recedes", "surrenders", "subsides", "erodes"]
  },
  "images": [
    {
      "id": "img_001",
      "src": "images/slieve-gullion-01.jpg",
      "alt": "",
      "caption": "",
      "reduction": {
        "brightness": null,
        "blur": null,
        "dominant": [],
        "edgeDensity": null,
        "contourCount": null
      }
    }
  ],
  "pages": [
    {
      "id": "page_001",
      "elements": []
    }
  ]
}
```

Twelve `images[]` entries are seeded with placeholder paths `slieve-gullion-01.jpg` through `slieve-gullion-12.jpg`. The author replaces these with real filenames once images are placed in `images/`. `reduction.dominant` is an array of `{ "hex": "#6a5a3c", "pct": 0.38 }` objects, populated by Activity 2.

**Schema ownership:**
- `meta` and `grammar` → written by Activity 3 (editor)
- `images[].reduction` → written by Activity 2 (reduction station)
- `pages` → written by Activity 1 (canvas)

---

## `js/store.js` — Shared In-Memory State

Exposes `window.ZineStore`:

| Member | Description |
|---|---|
| `state` | Live in-memory object matching the full schema |
| `load(url)` | `fetch()` grammar.json; populates `state`; calls `notify()` |
| `importFile(file)` | Reads an uploaded JSON File into `state`; calls `notify()` |
| `exportJSON()` | Triggers a `grammar.json` download of the current `state` |
| `update(patch)` | Shallow-merges `patch` into `state`; callers are responsible for passing the full nested value (e.g. `{ grammar: { ...ZineStore.state.grammar, noun_anchor: newList } }`); calls `notify()` |
| `subscribe(fn)` | Registers a callback invoked on every `notify()` call |
| `notify()` | Calls all registered subscribers |
| `dominantHexes` | Array of `{hex, pct}` objects from the most recently saved reduction; read by Activity 3 |

On page load, `store.js` attempts `fetch('data/grammar.json')`. If fetch fails (offline/file:// context), `state` initializes to an empty skeleton and the import prompt is surfaced. No `localStorage` or `sessionStorage` is used anywhere.

---

## `js/tracery.js` — Grammar Expander

Ported directly from `phd/critical-making/sasb/sasb-canvas.html`. Single exported function on `window.Tracery`:

```js
window.Tracery = {
  expand(grammar, symbol, depth = 0) {
    if (depth > 20) return `[${symbol}]`;
    const options = grammar[symbol];
    if (!options || !options.length) return `[${symbol}]`;
    const template = options[Math.floor(Math.random() * options.length)];
    return template.replace(/#([^#]+)#/g, (_, s) => this.expand(grammar, s, depth + 1));
  }
};
```

Unresolved symbols render as `[symbol_name]` — visible failure rather than silent empty string, which serves the pedagogical goal of making the grammar's structure legible.

---

## `index.html` — Hub and Navigation

Single HTML file. Structure:

```
<header>  persistent top bar
  project title (meta.title, editable)
  import button  |  export button
</header>

<nav>  tab bar
  [Activity 1 — Generate]  [Activity 2 — Reduce]  [Activity 3 — Edit Vocabulary]
</nav>

<main>
  <section id="tab-canvas"   ...>  Activity 1 content  </section>
  <section id="tab-reduce"   ...>  Activity 2 content  </section>
  <section id="tab-editor"   ...>  Activity 3 content  </section>
</main>
```

Tab switching: clicking a tab sets one section to `display: block` and `aria-hidden="false"`; others to `display: none` and `aria-hidden="true"`. Active tab gets a visible focus/active state. All tabs keyboard-operable via Tab + Enter/Space. ZineStore state persists in memory across tab switches — no re-fetch needed.

Both `zine.css` and `station.css` are loaded in `<head>`. `zine.css` governs Activity 1 and Activity 3 (Special Elite, `#f5f0e8` paper, hard-edged frames). `station.css` governs Activity 2 (monospace, neutral chrome, clinical spacing). The aesthetic contrast is intentional — the warm authored surface vs. the cold machine instrument.

---

## Activity 1 — Generate (`js/canvas.js`, `zine.css`)

**Activity prompt (visible in UI):** Brief explanation of Tracery grammar, the Slieve Gullion remix context (Montfort's Taroko Gorge), and the instruction to curate rather than consume — the machine offers fragments; the student arranges them.

### Fragment tray
- Number input (1–20) + "Throw fragments" button → calls `Tracery.expand(ZineStore.state.grammar, 'origin')` N times, renders results as cards in the tray.
- Clicking a tray card selects it (highlighted border, `aria-pressed="true"`).

### Zine page surface
- A `position: relative` framed container with paper aesthetic.
- Clicking the page while a tray card is selected places it as a `position: absolute` div at the click coordinates (recorded as `x`, `y` in `pages[current].elements`). Element `type: "fragment"`.
- Image palette: thumbnails from `ZineStore.state.images[]`. Click-to-select, click-page-to-place. Element `type: "image"`, records `imageId`, `x`, `y`, `w`, `h`.
- Free-text input: student types text + clicks "Add text element". Text element enters selected state; click page to place. Element `type: "text"`.
- Clicking an already-placed element re-selects it for repositioning (drag or arrow keys) or deletion (Delete/Backspace).
- All placed elements write into `ZineStore.update({ pages: [...] })`.

### Page navigation
- Prev/next arrows + page counter ("Page 2 of 3").
- "New page" button appends a new `{ id, elements: [] }` entry to `pages[]`.

---

## Activity 2 — Reduce (`js/reduction.js`, `station.css`)

**Activity prompt (visible in UI):** Explains that the machine will reduce the student's image to five measurements and three representations. What fails to survive reduction is as significant as what does. Names the three render modes explicitly.

### Image source
- Toggle: "Upload image" (file input, `accept="image/*"`) or "Select project image" (dropdown of `images[]` by `id`).
- On load: image renders in a preview at reduced size.

### Computation (via Canvas API, client-side only)
All computation runs on a downsampled copy (max 200×200) drawn to an offscreen `<canvas>`.

| Measure | Method |
|---|---|
| `brightness` | Mean relative luminance: `0.2126R + 0.7152G + 0.0722B`, normalized 0–1 |
| `blur` | Variance of the Laplacian over grayscale pixel values |
| `dominant` | Simple k-means (k=5) on downsampled pixels → top 5 `{hex, pct}` |
| `edgeDensity` | Sobel magnitude thresholded; proportion of edge pixels, 0–1 |
| `contourCount` | Connected-component count on binary edge map, min-size filtered; **labeled explicitly as a proxy**, not OpenCV parity |

### Three reduction renders (each a labeled `<canvas>`)
1. **Edge map** — Sobel magnitude rendered as grayscale. `aria-label="Edge map: outlines and boundaries extracted from the image."`
2. **Posterization** — image redrawn using only the 5 dominant colors, pixels snapped to nearest centroid. `aria-label="Posterization: image redrawn using only the five dominant extracted colors."`
3. **Data rebuild** — vertical bars of the 5 dominant colors sized by `pct`, left to right. No spatial information. `aria-label="Data rebuild: the five measured colors as proportional bars — every color, none of the picture."`

### Results and handoff
- All five measures displayed as labeled numbers below the canvases.
- Five dominant swatches: each shows the color, its hex string, and its percentage as visible text (color is never the sole signal).
- "Save to project" button: writes the `reduction` object into `ZineStore.state.images[id].reduction` and stores the dominant hexes in `ZineStore.dominantHexes`. Calls `notify()`.

---

## Activity 3 — Edit Vocabulary (`js/editor.js`, `zine.css`)

**Activity prompt (visible in UI):** Explains the fork/empty choice. Names the hex-to-word move explicitly: "The machine gave you colors; you give them names." Notes that the broken syntax (unresolved `[symbol]` in the generator) is the system's skeleton made visible, not a failure to hide.

### Author and title fields
- Text input → `meta.author`; text input → `meta.title`. Both write via `ZineStore.update()` on change.

### Fork / empty toggle
- "Start from the instructor's example" (sets `meta.mode: "fork"`, loads seed vocabulary into all lists) or "Start empty" (sets `meta.mode: "empty"`, clears all lists, keeps category keys).
- If any category list has been edited since page load, toggling prompts a confirmation ("This will replace your current vocabulary — continue?") before applying. Non-destructive unless confirmed.

### Per-category editing
For each of the five grammar categories (`origin`, `noun_anchor`, `noun_room`, `adjective_state`, `verb_fails`):
- Category label as heading.
- Current entries as a list; each entry has an inline delete button.
- An "Add" text input + button appends to the list.
- All edits call `ZineStore.update({ grammar: ... })` and `notify()` — Activity 1's generator reflects changes immediately on next throw.

### Validation
If `origin` contains a template referencing `#symbol#` and that symbol's list is empty, a visible warning appears next to the category: "Origin references this symbol — generator will output [symbol_name] until words are added." Non-blocking; legible.

### Image alt and caption editing
A collapsible "Project images" panel lists each entry in `images[]` with:
- A read-only filename label.
- An `alt` text input (writes to `images[id].alt`).
- A `caption` text input (writes to `images[id].caption`).
This is the only place in the tool where image metadata is authored; the image palette in Activity 1 uses these values.

### Dominant hex candidates panel
If `ZineStore.dominantHexes` is populated (Activity 2 has been run and saved):
- "Colors from your reduction" panel shows the five swatches with hex + percentage text.
- Each swatch has a "Name this color" text input and an "Add to [category]" dropdown.
- "Add" button appends the named color string to the selected category list and calls `notify()`.
- This is a first-class, visually prominent affordance — the explicit bridge between the machine's reduction and the student's vocabulary.

---

## Accessibility

- All controls keyboard-operable; visible `:focus-visible` outlines on all interactive elements.
- Tab switching via keyboard (Tab to reach tab bar, arrow keys or Enter to switch).
- `aria-hidden` managed on hidden sections; `aria-pressed` on selected tray cards.
- All three reduction `<canvas>` elements have `aria-label` describing content.
- Upload zone has `aria-label="Upload an image file for reduction analysis"`.
- `<img>` elements in the image palette use `alt` from `images[].alt`; students are prompted to fill these in the editor.
- Color swatches in Activity 2 display hex string and percentage as visible text — color is never the sole signal.
- Canvas drag-and-drop has click-to-place keyboard equivalent throughout (two-click: select in tray, click on page).

---

## Acceptance Criteria

- A served instance loads `grammar.json`, generates coherent Taroko Gorge-style fragments from the Slieve Gullion seed, and lets a student arrange a page and export JSON that re-imports cleanly.
- Activity 2 computes all five measures on a typical phone JPEG, renders all three reductions visibly distinct from the original, and writes valid `reduction` data.
- Dominant hexes from a reduced image can be named and added to a grammar category, then appear in generated fragments on the next throw.
- Activity 3's fork/empty toggle produces, respectively, a working seeded grammar and a cleared skeleton; edits change generator output live.
- Everything runs as static files with no backend, no build step, and no console errors; works inside a Jekyll iframe and via direct file open (with import for the offline case).
- The aesthetic contrast between Activities 1 & 3 (warm, typewriter) and Activity 2 (cold, clinical) is visually clear.
