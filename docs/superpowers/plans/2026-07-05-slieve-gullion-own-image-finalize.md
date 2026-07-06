# Own-Image + Vocabulary Finalize — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a student's own uploaded-and-reduced photo persist into `ZineStore.state.images`, and let Activity 3 filter Activity 1's placement palette down to "instructor photos / my photos / both" before finalizing back into Activity 1 to build the page.

**Architecture:** Add a `provenance` tag (`"instructor"` | `"student"`) to every image entry and a top-level `imageSource` state field (`"both"` | `"instructor"` | `"mine"`). Fix the upload path in `reduction.js` to use a persistent data URL (not a revoked object URL) and append a new image entry on save. Filter `canvas.js`'s palette by the new field. Add a toggle + "Finalize" button to Activity 3 that sets the filter and switches back to Activity 1's tab.

**Tech Stack:** Same as the existing pipeline — vanilla ES5-compatible JS, no framework, no build step, no browser storage APIs. Tests follow this codebase's existing convention: plain Node.js scripts (no test framework) in `js/*.test.js`, each mirroring the pure-logic parts of its corresponding module, run via `node js/<name>.test.js` with a hand-rolled `assert(label, condition)` counter and `process.exit(failed > 0 ? 1 : 0)`.

## Global Constraints

- Static files only — no backend, no build step, no `localStorage`/`sessionStorage`.
- Everything lives in `ZineStore`'s in-memory state and round-trips through the existing generic Import/Export JSON mechanism — no special-casing needed for new fields.
- No new tab/stage — Activity 1 remains the single placement canvas.
- Don't change the meaning or behavior of the existing fork/empty vocabulary toggle.
- Follow the existing test convention exactly: pure logic gets a mirrored Node test in `js/*.test.js`; DOM-only wiring is manual-verified (documented as such in each test file's header comment, matching `canvas.test.js`/`reduction.test.js`/`editor.test.js`'s existing pattern).
- Base path for all files: `phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion/`.

---

## File Map

| File | Change |
|---|---|
| `data/grammar.json` | Add `"provenance": "instructor"` to all 13 image entries; add top-level `"imageSource": "both"` |
| `js/store.js` | Add `imageSource: 'both'` to `emptyState()` |
| `js/reduction.js` | Switch upload path to `FileReader.readAsDataURL`; persist student uploads to `ZineStore.state.images` on save |
| `js/reduction.test.js` | Add tests for the new `buildOwnImageEntry()` pure function |
| `js/canvas.js` | Add `visibleImages()` filter; use it in `renderImagePalette()` |
| `js/canvas.test.js` | Add tests for `visibleImages()` |
| `js/editor.js` | Add image-source toggle handlers + Finalize button handler |
| `index.html` | Add image-source toggle markup + Finalize button in `#tab-editor` |
| `css/zine.css` | Extend `.fork-toggle` selectors to cover the new `.image-source-toggle` |

---

## Task 1: Data Model — `grammar.json` + `store.js`

**Files:**
- Modify: `data/grammar.json`
- Modify: `js/store.js`

**Interfaces:**
- Produces: every image entry gains `provenance: "instructor" | "student"`; `ZineStore.state.imageSource` (`"both" | "instructor" | "mine"`, default `"both"`) — read by Task 3's `visibleImages()`, written by Task 4's toggle handlers.

- [ ] **Step 1: Add `provenance: "instructor"` to all 13 seed images**

```bash
cd phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion
sed -i 's/"caption": "",/"caption": "", "provenance": "instructor",/g' data/grammar.json
```

- [ ] **Step 2: Add top-level `imageSource` field to the seed file**

In `data/grammar.json`, the file currently opens:

```json
{
  "meta": {
    "title": "Walking the Hero's Path at Slieve Gullion",
    "author": "",
    "mode": "fork"
  },
  "grammar": {
```

Change to:

```json
{
  "meta": {
    "title": "Walking the Hero's Path at Slieve Gullion",
    "author": "",
    "mode": "fork"
  },
  "imageSource": "both",
  "grammar": {
```

- [ ] **Step 3: Verify the JSON is well-formed and has the new fields**

```bash
python3 -c "
import json
d = json.load(open('data/grammar.json'))
assert d['imageSource'] == 'both'
assert len(d['images']) == 13
assert all(img['provenance'] == 'instructor' for img in d['images'])
print('grammar.json: all assertions passed')
"
```

Expected: `grammar.json: all assertions passed`

- [ ] **Step 4: Add `imageSource: 'both'` to `store.js`'s `emptyState()`**

In `js/store.js`, find:

```js
  function emptyState() {
    return {
      meta: { title: '', author: '', mode: 'fork' },
      grammar: { origin: [], noun_anchor: [], noun_room: [], adjective_state: [], verb_fails: [] },
      images: [],
      pages: [{ id: 'page_001', elements: [] }]
    };
  }
```

Change to:

```js
  function emptyState() {
    return {
      meta: { title: '', author: '', mode: 'fork' },
      imageSource: 'both',
      grammar: { origin: [], noun_anchor: [], noun_room: [], adjective_state: [], verb_fails: [] },
      images: [],
      pages: [{ id: 'page_001', elements: [] }]
    };
  }
```

- [ ] **Step 5: Verify in browser console**

Serve the project (`bundle exec jekyll serve` from the portfolio root) and open the pipeline page. In the browser console:

```js
console.assert(ZineStore.state.imageSource === 'both', 'seed grammar.json loaded with imageSource=both');
console.assert(ZineStore.state.images.every(function(i){ return i.provenance === 'instructor'; }), 'all seed images tagged instructor');
console.log('Task 1: all assertions passed');
```

Expected: no assertion errors, `Task 1: all assertions passed` logged.

- [ ] **Step 6: Commit**

```bash
git add data/grammar.json js/store.js
git commit -m "feat: add provenance and imageSource fields to zine data model"
```

---

## Task 2: Persist Student Uploads — `reduction.js`

**Files:**
- Modify: `js/reduction.js`
- Modify: `js/reduction.test.js`

**Interfaces:**
- Consumes: `ZineStore.state.images`, `ZineStore.update(patch)` (existing)
- Produces: `buildOwnImageEntry(reduction, dataUrl, uniqueSuffix)` → `{ id, src, alt, caption, provenance: 'student', reduction }` — new pure helper, mirrored in `reduction.test.js`
- Fixes: uploaded photos now persist into `ZineStore.state.images` instead of being silently dropped after analysis

**Background:** The upload path currently loads each file via `URL.createObjectURL(file)` and revokes it immediately after analysis (`loadImageAndAnalyse(url, function () { URL.revokeObjectURL(url); })`). A revoked object URL can't be resolved by a fresh `<img>` element later, so persisting it would produce a broken image in Activity 1's palette. This task replaces that with `FileReader.readAsDataURL`, which never expires and is JSON-serializable.

- [ ] **Step 1: Write the failing test for `buildOwnImageEntry`**

Open `js/reduction.test.js`. Find the pure-function definitions section (near `kMeans`, `makeImageData`, `approx` around line 104-165) and add, right after the `approx` function:

```js
function buildOwnImageEntry(reduction, dataUrl, uniqueSuffix) {
  return {
    id: 'img_own_' + Date.now() + '_' + uniqueSuffix,
    src: dataUrl,
    alt: '',
    caption: '',
    provenance: 'student',
    reduction: reduction
  };
}
```

Then find the `// ── Summary ──` block near the end of the file and add, immediately before it:

```js
// ── Test: buildOwnImageEntry ──────────────────────────────────────────────
console.log('\n[buildOwnImageEntry]');

var fakeReduction = { brightness: 0.5, blur: 12.3, dominant: [{ hex: '#336633', pct: 0.4 }], edgeDensity: 0.2, contourCount: 5 };
var entry = buildOwnImageEntry(fakeReduction, 'data:image/jpeg;base64,AAAA', 0);
assert('entry has provenance "student"', entry.provenance === 'student');
assert('entry id matches img_own_<digits>_0 pattern', /^img_own_\d+_0$/.test(entry.id));
assert('entry src is the passed data URL', entry.src === 'data:image/jpeg;base64,AAAA');
assert('entry alt starts empty', entry.alt === '');
assert('entry caption starts empty', entry.caption === '');
assert('entry carries the passed reduction object', entry.reduction === fakeReduction);

var entry2 = buildOwnImageEntry(fakeReduction, 'data:image/jpeg;base64,BBBB', 1);
assert('a different uniqueSuffix produces a different id', entry2.id !== entry.id);
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion
node js/reduction.test.js
```

Expected: FAIL — `buildOwnImageEntry is not defined` (if you added the test block before the function) or the new assertions simply don't exist yet if you haven't saved the function. Confirm the new block errors out before proceeding.

- [ ] **Step 3: Confirm the function passes the test on its own**

```bash
node js/reduction.test.js
```

Expected: `Results: N passed, 0 failed` (N includes all pre-existing tests plus the 7 new ones). If this already passes because you added both the function and the test in Step 1, that's fine — the point is to confirm the pure logic is correct in isolation before wiring it into the DOM-dependent code in the next steps.

- [ ] **Step 4: Add the same `buildOwnImageEntry` function to `js/reduction.js`**

In `js/reduction.js`, find `saveReduction` (near the end of the file) and add the helper directly above it:

```js
  function buildOwnImageEntry(reduction, dataUrl, uniqueSuffix) {
    return {
      id: 'img_own_' + Date.now() + '_' + uniqueSuffix,
      src: dataUrl,
      alt: '',
      caption: '',
      provenance: 'student',
      reduction: reduction
    };
  }

  // ── Save ─────────────────────────────────────────────────
  function saveReduction() {
```

- [ ] **Step 5: Switch the upload path from object URL to data URL**

In `js/reduction.js`, find the module-level vars at the top:

```js
(function () {
  var currentImageId = null;   // id from images[] if project image selected
  var currentReduction = null; // the computed result
  var _queue = [];             // File objects waiting to be processed
  var _queueIdx = 0;
  var _allDominant = [];       // accumulated colors across the queue session
```

Change to:

```js
(function () {
  var currentImageId = null;      // id from images[] if project image selected
  var currentReduction = null;    // the computed result
  var currentUploadDataUrl = null; // data: URL for the currently-loaded upload (null when a project image is selected)
  var _queue = [];                // File objects waiting to be processed
  var _queueIdx = 0;
  var _allDominant = [];          // accumulated colors across the queue session
```

Find `processQueue()`:

```js
  function processQueue() {
    var file = _queue[_queueIdx];
    var url = URL.createObjectURL(file);
    loadImageAndAnalyse(url, function () { URL.revokeObjectURL(url); });
    updateQueueUI();
  }
```

Change to:

```js
  function processQueue() {
    var file = _queue[_queueIdx];
    var reader = new FileReader();
    reader.onload = function (e) {
      currentUploadDataUrl = e.target.result;
      loadImageAndAnalyse(currentUploadDataUrl);
    };
    reader.readAsDataURL(file);
    updateQueueUI();
  }
```

Find `onProjectSelect()` and `loadImageAndAnalyse()`:

```js
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
```

Change to (drop the now-always-null `onDone` parameter):

```js
  function onProjectSelect(e) {
    var id = e.target.value;
    if (!id) return;
    currentImageId = id;
    currentUploadDataUrl = null;
    var imgData = ZineStore.state.images.find(function (i) { return i.id === id; });
    if (!imgData) return;
    loadImageAndAnalyse(imgData.src);
  }

  function loadImageAndAnalyse(src) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      var preview = document.getElementById('reduce-preview');
      preview.src = src;
      preview.hidden = false;
      analyseImage(img);
    };
    img.onerror = function () { alert('Could not load image. If using a project image, make sure the file exists in the images/ folder.'); };
    img.src = src;
  }
```

Also find `onUpload()` and reset the new var alongside the existing one:

```js
  function onUpload(e) {
    var files = Array.from(e.target.files);
    e.target.value = ''; // allow reselecting the same files next time
    if (!files.length) return;
    _queue = files;
    _queueIdx = 0;
    _allDominant = [];
    currentImageId = null;
    processQueue();
  }
```

Change to:

```js
  function onUpload(e) {
    var files = Array.from(e.target.files);
    e.target.value = ''; // allow reselecting the same files next time
    if (!files.length) return;
    _queue = files;
    _queueIdx = 0;
    _allDominant = [];
    currentImageId = null;
    currentUploadDataUrl = null;
    processQueue();
  }
```

- [ ] **Step 6: Append a new image entry when saving an upload**

In `js/reduction.js`, find `saveReduction()`:

```js
    // Accumulate colors from this image into the session palette
    _allDominant = _allDominant.concat(currentReduction.dominant);
    ZineStore.saveDominantHexes(_allDominant);

    // Advance queue
```

Change to:

```js
    // Accumulate colors from this image into the session palette
    _allDominant = _allDominant.concat(currentReduction.dominant);
    ZineStore.saveDominantHexes(_allDominant);

    // Persist this upload as a placeable image
    var ownImages = ZineStore.state.images;
    ownImages.push(buildOwnImageEntry(currentReduction, currentUploadDataUrl, _queueIdx));
    ZineStore.update({ images: ownImages.slice() });

    // Advance queue
```

- [ ] **Step 7: Run the full reduction test suite**

```bash
node js/reduction.test.js
```

Expected: `Results: N passed, 0 failed` — all pre-existing tests still pass, plus the 7 new `buildOwnImageEntry` assertions.

- [ ] **Step 8: Manual browser verification**

Serve the project, open Activity 2, upload a personal photo (not a project image), click "Save to project", then in the browser console:

```js
var mine = ZineStore.state.images.filter(function (i) { return i.provenance === 'student'; });
console.assert(mine.length === 1, 'one student image persisted');
console.assert(mine[0].src.indexOf('data:image') === 0, 'src is a data URL, not a revoked blob URL');
console.log('Task 2 manual check: all assertions passed');
```

Expected: no assertion errors. Also visually confirm the "Save to project" alert still appears and Activity 3's hex-candidates panel still populates as before (regression check on existing behavior).

- [ ] **Step 9: Regression check — project-image reduction path is unchanged**

Still in Activity 2, switch the source toggle to "Project image", pick one of the 13 instructor photos from the dropdown, let it analyze, click "Save to project". In the browser console:

```js
var projectImg = ZineStore.state.images.find(function (i) { return i.provenance === 'instructor' && i.reduction && i.reduction.brightness !== null; });
console.assert(projectImg, 'a project image now has non-null reduction data');
console.assert(ZineStore.state.images.filter(function (i) { return i.provenance === 'instructor'; }).length === 13, 'no new instructor entries were created — existing entry was updated in place, not duplicated');
console.log('Task 2 regression check: all assertions passed');
```

Expected: no assertion errors — confirms the pre-existing `currentImageId` branch of `saveReduction()` (updating an existing project image's `reduction` field in place) still behaves exactly as before this task's changes.

- [ ] **Step 10: Commit**

```bash
git add js/reduction.js js/reduction.test.js
git commit -m "feat: persist student photo uploads into ZineStore via data URL"
```

---

## Task 3: Palette Filtering — `canvas.js`

**Files:**
- Modify: `js/canvas.js`
- Modify: `js/canvas.test.js`

**Interfaces:**
- Consumes: `ZineStore.state.images` (each with `provenance`), `ZineStore.state.imageSource`
- Produces: `visibleImages()` → filtered array, used by `renderImagePalette()`

- [ ] **Step 1: Write the failing test for `visibleImages`**

In `js/canvas.test.js`, update the stub `_state.images` to include provenance and an `imageSource` field, and add more sample images. Find:

```js
var _state = {
  grammar: {
    origin: [
      'the #noun_anchor# #verb_fails# into the #noun_room#',
      '#adjective_state# #noun_anchor# against the #noun_room#'
    ],
    noun_anchor: ['cairn', 'summit', 'lake'],
    noun_room: ['passage', 'chamber', 'hollow'],
    adjective_state: ['ancient', 'misted', 'eroded'],
    verb_fails: ['yields', 'dissolves', 'recedes']
  },
  images: [
    { id: 'img_001', src: 'images/test-01.jpg', alt: 'test image' }
  ],
  pages: [{ id: 'page_001', elements: [] }]
};
```

Change to:

```js
var _state = {
  grammar: {
    origin: [
      'the #noun_anchor# #verb_fails# into the #noun_room#',
      '#adjective_state# #noun_anchor# against the #noun_room#'
    ],
    noun_anchor: ['cairn', 'summit', 'lake'],
    noun_room: ['passage', 'chamber', 'hollow'],
    adjective_state: ['ancient', 'misted', 'eroded'],
    verb_fails: ['yields', 'dissolves', 'recedes']
  },
  imageSource: 'both',
  images: [
    { id: 'img_001', src: 'images/test-01.jpg', alt: 'test image', provenance: 'instructor' },
    { id: 'img_own_1', src: 'data:image/jpeg;base64,AAAA', alt: '', provenance: 'student' }
  ],
  pages: [{ id: 'page_001', elements: [] }]
};
```

Add the pure function mirror after `pageCounterText`:

```js
function visibleImages() {
  var src = ZineStore.state.imageSource || 'both';
  if (src === 'both') return ZineStore.state.images;
  var want = (src === 'mine') ? 'student' : 'instructor';
  return ZineStore.state.images.filter(function (img) { return img.provenance === want; });
}
```

Add a new test section immediately before the `// ── Summary ──` block:

```js
// ── Test 6: Image source filtering ────────────────────────────────────────
console.log('\n[6] Image source filtering');

ZineStore.update({ imageSource: 'both' });
assert('both: returns all images', visibleImages().length === 2);

ZineStore.update({ imageSource: 'instructor' });
var instructorOnly = visibleImages();
assert('instructor: returns only instructor images', instructorOnly.length === 1 && instructorOnly[0].provenance === 'instructor');

ZineStore.update({ imageSource: 'mine' });
var mineOnly = visibleImages();
assert('mine: returns only student images', mineOnly.length === 1 && mineOnly[0].provenance === 'student');

ZineStore.update({ images: [{ id: 'img_001', src: 'images/test-01.jpg', alt: '', provenance: 'instructor' }] });
assert('mine: returns empty array when no student images exist', visibleImages().length === 0);

ZineStore.update({ imageSource: 'both' }); // reset for any later tests
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd phd/interdisciplinary-teaching/machine-learning-and-code/slieve-gullion
node js/canvas.test.js
```

Expected: FAIL — `visibleImages is not defined` if the function wasn't added yet, or assertion failures if added incorrectly.

- [ ] **Step 3: Run again to confirm it passes**

```bash
node js/canvas.test.js
```

Expected: `Results: N passed, 0 failed`.

- [ ] **Step 4: Add `visibleImages()` to `js/canvas.js` and use it in the palette renderer**

Find:

```js
  // ── Image palette ────────────────────────────────────────
  function renderImagePalette() {
    var palette = document.getElementById('image-palette');
    palette.innerHTML = '';
    ZineStore.state.images.forEach(function (img) {
```

Change to:

```js
  // ── Image palette ────────────────────────────────────────
  function visibleImages() {
    var src = ZineStore.state.imageSource || 'both';
    if (src === 'both') return ZineStore.state.images;
    var want = (src === 'mine') ? 'student' : 'instructor';
    return ZineStore.state.images.filter(function (img) { return img.provenance === want; });
  }

  function renderImagePalette() {
    var palette = document.getElementById('image-palette');
    palette.innerHTML = '';
    visibleImages().forEach(function (img) {
```

(The rest of `renderImagePalette()`'s `forEach` body is unchanged — only the source array changes.)

- [ ] **Step 5: Run the full canvas test suite**

```bash
node js/canvas.test.js
```

Expected: `Results: N passed, 0 failed` — all pre-existing tests plus the 4 new filtering assertions.

- [ ] **Step 6: Commit**

```bash
git add js/canvas.js js/canvas.test.js
git commit -m "feat: filter Activity 1 image palette by imageSource"
```

---

## Task 4: Image-Source Toggle + Finalize — `editor.js` + `index.html` + `zine.css`

**Files:**
- Modify: `index.html`
- Modify: `css/zine.css`
- Modify: `js/editor.js`

**Interfaces:**
- Consumes: `ZineStore.state.imageSource`, `ZineStore.update(patch)`, existing tab-switch wiring (`#btn-canvas` click handler already defined in `index.html`'s inline script)
- Produces: DOM `#image-source-toggle` (3 buttons), `#finalize-btn`; writes `ZineStore.state.imageSource`

- [ ] **Step 1: Add the toggle + Finalize button markup to `index.html`**

Find (inside `#tab-editor`, in `.editor-chrome`):

```html
      <div class="fork-toggle" role="group" aria-label="Starting vocabulary">
        <button id="fork-btn" class="active" aria-pressed="true">Instructor vocabulary</button>
        <button id="empty-btn" aria-pressed="false">Start empty</button>
      </div>
    </div>
  </div>
```

Change to:

```html
      <div class="fork-toggle" role="group" aria-label="Starting vocabulary">
        <button id="fork-btn" class="active" aria-pressed="true">Instructor vocabulary</button>
        <button id="empty-btn" aria-pressed="false">Start empty</button>
      </div>
    </div>
    <div class="editor-meta-row">
      <div class="image-source-toggle" role="group" aria-label="Which images show in the Generate palette">
        <button id="source-instructor-btn" data-source="instructor" aria-pressed="false">Instructor photos</button>
        <button id="source-mine-btn" data-source="mine" aria-pressed="false">My photos</button>
        <button id="source-both-btn" data-source="both" class="active" aria-pressed="true">Both</button>
      </div>
      <button id="finalize-btn" class="btn btn--primary">Finalize &rarr; Return to Generate</button>
    </div>
  </div>
```

- [ ] **Step 2: Extend the toggle CSS to cover the new button group**

In `css/zine.css`, find:

```css
.fork-toggle { display: flex; }
.fork-toggle button {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  padding: 5px 12px;
  border: 1px solid #bbb;
  background: none;
  color: #666;
  cursor: pointer;
  font-family: ui-monospace, Menlo, 'Courier New', monospace;
}
.fork-toggle button:first-child { border-right: none; }
.fork-toggle button.active { background: #000; border-color: #000; color: #fff; }
.fork-toggle button:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
```

Change to (generalizing `:first-child` to `:not(:last-child)` so a 3-button group doesn't get a doubled border between its middle and last buttons):

```css
.fork-toggle, .image-source-toggle { display: flex; }
.fork-toggle button, .image-source-toggle button {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  padding: 5px 12px;
  border: 1px solid #bbb;
  background: none;
  color: #666;
  cursor: pointer;
  font-family: ui-monospace, Menlo, 'Courier New', monospace;
}
.fork-toggle button:not(:last-child), .image-source-toggle button:not(:last-child) { border-right: none; }
.fork-toggle button.active, .image-source-toggle button.active { background: #000; border-color: #000; color: #fff; }
.fork-toggle button:focus-visible, .image-source-toggle button:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
```

- [ ] **Step 3: Wire up the toggle and Finalize button in `editor.js`**

Find `init()`:

```js
    document.getElementById('fork-btn').addEventListener('click', function () { applyMode('fork'); });
    document.getElementById('empty-btn').addEventListener('click', function () { applyMode('empty'); });
```

Add directly below it:

```js
    Array.from(document.querySelectorAll('.image-source-toggle button')).forEach(function (btn) {
      btn.addEventListener('click', function () { setImageSource(btn.getAttribute('data-source')); });
    });
    document.getElementById('finalize-btn').addEventListener('click', finalizeAndReturn);
```

Add the two new handler functions near `applyMode` (after it):

```js
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
```

- [ ] **Step 4: Sync toggle button state on store updates**

Find `onStoreUpdate()`:

```js
  function onStoreUpdate() {
    document.getElementById('edit-title').value  = ZineStore.state.meta.title  || '';
    document.getElementById('edit-author').value = ZineStore.state.meta.author || '';
    if (!_updatingFromTextarea) {
      syncTextarea();
      renderPreview();
    }
    renderHexCandidates();
    renderImageMeta();
  }
```

Change to (so importing a `grammar.json` with a saved `imageSource` reflects correctly in the toggle):

```js
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
```

- [ ] **Step 5: Manual browser verification**

Serve the project, open Activity 3, and in the browser console:

```js
console.assert(document.querySelector('.image-source-toggle button.active').getAttribute('data-source') === 'both', 'both is active by default');
document.getElementById('source-mine-btn').click();
console.assert(ZineStore.state.imageSource === 'mine', 'clicking My photos sets imageSource to mine');
console.assert(document.getElementById('source-mine-btn').classList.contains('active'), 'My photos button shows active');
console.assert(!document.getElementById('source-both-btn').classList.contains('active'), 'Both button no longer active');
document.getElementById('finalize-btn').click();
console.assert(document.getElementById('btn-canvas').getAttribute('aria-selected') === 'true', 'Finalize switched to Activity 1');
console.log('Task 4 manual check: all assertions passed');
```

Expected: no assertion errors, and visually the page should now show Activity 1 with the palette filtered to student photos only (per Task 3).

- [ ] **Step 6: Commit**

```bash
git add index.html css/zine.css js/editor.js
git commit -m "feat: add image-source toggle and Finalize action to Activity 3"
```

---

## Task 5: End-to-End Walkthrough

**Files:** none (verification only)

- [ ] **Step 1: Full manual walkthrough**

Serve the project fresh (`bundle exec jekyll serve` from the portfolio root, reload the page to reset state) and walk through:

1. Activity 2: upload a personal photo, wait for analysis, click "Save to project". Confirm the alert still appears.
2. Activity 2: upload a *second*, different personal photo, save it too.
3. Activity 3: confirm both photos' filenames-as-alt-placeholders appear in the "Image alt text & captions" panel (existing behavior, now exercising 2 extra entries).
4. Activity 3: name one of the dominant colors from the hex-candidates panel and add it to `noun_anchor` (existing behavior — confirm it still works with the new fields present).
5. Activity 3: click "My photos" in the new toggle, then click "Finalize → Return to Generate". Confirm the tab switches to Activity 1.
6. Activity 1: confirm the image palette shows exactly the 2 personal photos (not the 13 instructor photos).
7. Activity 1: throw fragments, confirm the newly-added color word can appear in generated text.
8. Activity 1: place one of the personal photos and a fragment on the page.
9. Click Export, open the downloaded `grammar.json` in a text editor, confirm: both student image entries are present with `provenance: "student"` and full `src` data URLs; `imageSource: "mine"` is present at the top level; the placed page elements reference the student image's `id`.
10. Reload the page (fresh seed state), click Import, select the exported file, confirm the same state (including the filtered palette) comes back.

- [ ] **Step 2: Update the original pipeline plan's self-review table (optional but recommended)**

If useful for future reference, add a row to the Self-Review table in `docs/superpowers/plans/2026-06-30-slieve-gullion-zine-pipeline.md` noting that own-image placement is covered by this plan — not required for functionality, purely documentation upkeep.

- [ ] **Step 3: Final commit**

```bash
git add -A
git status
```

Review the output — confirm only the intended files from Tasks 1-4 (plus any doc note from Step 2) are staged, then:

```bash
git commit -m "test: verify end-to-end own-image and finalize walkthrough"
```

(Skip this commit if Step 1's walkthrough is the only outcome and nothing changed on disk — there's nothing to commit in that case.)
