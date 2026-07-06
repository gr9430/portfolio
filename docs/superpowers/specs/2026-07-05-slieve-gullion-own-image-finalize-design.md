# Slieve Gullion Zine Pipeline — Own-Image & Vocabulary Finalize — Design Spec

**Status:** Approved for planning
**Related:** `docs/superpowers/plans/2026-06-30-slieve-gullion-zine-pipeline.md` (original three-activity pipeline, complete)

## Problem

The pipeline's stated pedagogical goal is that students render their own photograph to extract abstract language (dominant colors), name that language, and fold it into the grammar — then see it come back out as generated text and imagery on their own zine page.

Two gaps currently block the "own images" half of that loop:

1. **Student uploads never persist.** In Activity 2 (`reduction.js`), uploading a personal photo (as opposed to picking one of the instructor's project images) sets `currentImageId = null`. `saveReduction()` only writes computed measures onto an *existing* `ZineStore.state.images` entry (`if (currentImageId) { ... }`) — for an upload, it silently does nothing. The photo and its reduction data live only in transient DOM/canvas state and vanish on tab switch or reload. It can never appear in Activity 1's placement palette.
2. **No student-facing signal that they're done curating and ready to build the page.** Activity 1, 2, and 3 all read/write the same live `ZineStore`, so a student *could* tab back to Activity 1 after editing vocabulary and see it reflected — but nothing in the UI frames that moment or lets them narrow the image palette down to just their own work.

The vocabulary half of the loop already works: `Tracery.expand()` in `canvas.js` reads live from `ZineStore.state.grammar`, which `editor.js` already edits directly (via the raw JSON textarea, per-category add/remove, and fork/empty). No changes are needed there — this spec confirms that rather than re-building it.

## Non-goals

- No new tab/stage. Activity 1 remains the single placement canvas; it just becomes better-equipped.
- No change to the fork/empty vocabulary toggle's behavior or meaning.
- No browser storage APIs (localStorage/sessionStorage) — consistent with the project's existing global constraints. Student images persist only in the in-memory `ZineStore` for the session, same as everything else, and round-trip through the existing Import/Export JSON mechanism.
- No captions/alt-text UI changes — the existing Activity 3 "Project image captions & alt text" panel already iterates `ZineStore.state.images` generically, so newly-added student images appear there automatically.

## Data model changes

### `data/grammar.json` (seed) and `store.js` (`emptyState()`)

Add a `provenance` field to every image entry, and a new top-level `imageSource` field to state:

```json
{
  "meta": { "title": "", "author": "", "mode": "fork" },
  "imageSource": "both",
  "grammar": { ... },
  "images": [
    { "id": "img_001", "src": "images/slieve-gullion-01.jpg", "alt": "...", "caption": "", "provenance": "instructor", "reduction": { ... } }
  ],
  "pages": [ ... ]
}
```

- `imageSource`: `"both" | "instructor" | "mine"`. Default `"both"`. Controls what Activity 1's palette shows; does not delete or hide data anywhere else (Activity 3's image-meta panel still shows all images regardless of this setting).
- `provenance`: `"instructor" | "student"`. All 13 existing seed entries get `"instructor"`. Entries created from a student's own upload get `"student"`.
- Backward compatibility: none needed. This is a single evolving in-development seed file with no external consumers; update it in place.

## Component changes

### `js/reduction.js` — persist student uploads on save

**Prerequisite fix — uploads currently can't be persisted at all.** The upload path loads each queued file via `URL.createObjectURL(file)` and revokes it immediately after analysis: `loadImageAndAnalyse(url, function () { URL.revokeObjectURL(url); })` (called synchronously at the end of `img.onload`). A revoked object URL cannot be resolved by a new `<img>` element later — so even though the *already-loaded* preview keeps displaying it, storing that same URL string on a persisted `images[]` entry would produce a broken image the first time Activity 1 tries to render it in a fresh `<img>` tag.

Fix: replace the object-URL round-trip with `FileReader.readAsDataURL(file)` for the upload path. A data URL is self-contained and never expires, which is what a persisted, JSON-serializable entry needs anyway (consistent with the no-backend/no-storage-API constraint — everything lives in the state object). Retain the resulting string in a new module-level var, e.g. `currentUploadDataUrl`, reset alongside `currentImageId`/`currentReduction` each time `processQueue()` advances to the next file. `analyseImage(img)` keeps working unchanged — it only needs the loaded `Image` object, which loads identically from a data URL as from a blob URL.

Currently, the no-`currentImageId` branch of `saveReduction()` only accumulates dominant colors for the hex-candidates panel and advances the queue — it never touches `ZineStore.state.images`:

```js
// Accumulate colors from this image into the session palette
_allDominant = _allDominant.concat(currentReduction.dominant);
ZineStore.saveDominantHexes(_allDominant);
// (queue advance logic follows; images[] is never touched)
```

New behavior: additionally append a new entry to `ZineStore.state.images` in that same branch, before the queue-advance logic:

```js
var images = ZineStore.state.images;
images.push({
  id: 'img_own_' + Date.now() + '_' + _queueIdx,
  src: currentUploadDataUrl,
  alt: '',
  caption: '',
  provenance: 'student',
  reduction: currentReduction
});
ZineStore.update({ images: images.slice() });
```

- `_queueIdx` is appended to the id alongside `Date.now()` to guarantee uniqueness even when a batch queue advances across saves within the same millisecond.
- This is additive to the existing dominant-color accumulation, not a replacement — both the hex-candidates flow (existing) and the new image-palette entry (new) happen from the same save action.
- Every save-while-uploaded appends a new entry — repeatable, so a student can accumulate several personal photos by uploading, reducing, and saving multiple times across a session, including within a single multi-file batch queue.
- Matches the existing code's own pattern of mutating `ZineStore.state.images` in place before calling `.slice()` on the update — not introducing a new mutation style, just extending the existing one.

### `js/editor.js` — image-source toggle + Finalize action

New UI block in the Activity 3 editor layout (`index.html`, `#tab-editor`), styled like the existing `.fork-toggle`:

```html
<div class="image-source-toggle" role="group" aria-label="Which images show in the Generate palette">
  <button data-source="instructor" aria-pressed="false">Instructor photos</button>
  <button data-source="mine" aria-pressed="false">My photos</button>
  <button data-source="both" aria-pressed="true" class="active">Both</button>
</div>
<button id="finalize-btn" class="btn btn--primary">Finalize → Return to Generate</button>
```

Behavior:
- Clicking a toggle button writes `ZineStore.update({ imageSource: <value> })` immediately (same pattern as the existing fork/empty toggle) and updates `aria-pressed`/`.active` state.
- Clicking `#finalize-btn` does two things: (1) ensures the currently-selected toggle value is applied (it already is, live — this is a no-op re-affirmation, not a separate commit step), and (2) switches the active tab back to Activity 1 by calling `document.getElementById('btn-canvas').click()`, reusing the existing tab-switch wiring in `index.html`'s inline script rather than introducing a new cross-module API.
- Fully repeatable and non-destructive: no images or vocabulary are ever deleted by this action, only the palette filter and current tab. A student can bounce back to Activity 2/3, change their mind, and click Finalize again.

### `js/canvas.js` — palette filtering

`renderImagePalette()` gains a filter step before iterating:

```js
function visibleImages() {
  var src = ZineStore.state.imageSource || 'both';
  if (src === 'both') return ZineStore.state.images;
  var want = (src === 'mine') ? 'student' : 'instructor';
  return ZineStore.state.images.filter(function (img) { return img.provenance === want; });
}
```

`renderImagePalette()` calls `visibleImages()` instead of `ZineStore.state.images` directly. No other part of `canvas.js` needs to change — placed elements already reference images by `id` and resolve against the full `ZineStore.state.images` list regardless of current palette filtering, so switching the filter never orphans an already-placed image.

## Data flow summary

1. Student uploads a personal photo in Activity 2 → analyzes it → clicks "Save to project" → new `img_own_<ts>` entry appended to `ZineStore.state.images` with `provenance: "student"`.
2. Student names extracted dominant colors and adds them to vocabulary categories in Activity 3 (existing, unchanged) → `ZineStore.state.grammar` updated live (existing, unchanged).
3. Student picks an image-source filter in Activity 3, clicks Finalize → `ZineStore.state.imageSource` set, tab switches to Activity 1.
4. In Activity 1, `renderImagePalette()` shows only the filtered image set; "Throw fragments" already pulls from the live (student-edited) grammar. Student places their photo and their words on the page.
5. Student can return to Activity 2/3 at any time, upload another photo, edit more vocabulary, and re-Finalize — no lock-in, no destructive step.

## Edge cases

- **"My photos" selected with zero student uploads so far:** palette renders empty. This is expected and self-explanatory (an empty palette next to a "My photos" label nudges the student back to Activity 2) — no special empty-state messaging needed beyond what's already visually obvious.
- **Export/Import round-trip:** `ZineStore.exportJSON()`/`importFile()` already serialize/parse the whole state object generically — `provenance` and `imageSource` fields flow through with no code change required there.
- **Large data URIs:** student photos stored as base64 `src` values will bloat the exported JSON. This is an accepted tradeoff already implicit in the project's "one shared JSON file, no backend" architecture (same tradeoff the instructor's own `alt` text and grammar authoring already live with) — not something this feature needs to solve.

## Testing approach

Follow the existing project convention (manual browser-console assertion snippets embedded in the implementation plan, matching the style already used for `store.js`, `tracery.js`, and referenced by the existing `*.test.js` files):

- `reduction.js`: assert that saving a reduction with no `currentImageId` appends a new `images` entry with `provenance: 'student'` and the expected `reduction` shape, and that saving with a `currentImageId` set still updates the existing entry in place (regression check on current behavior).
- `canvas.js`: assert `visibleImages()` returns the full list for `'both'`, only `provenance: 'instructor'` entries for `'instructor'`, and only `provenance: 'student'` entries for `'mine'`, including the zero-results case.
- `editor.js`: assert clicking each image-source toggle button updates `ZineStore.state.imageSource` and `aria-pressed` correctly, and that clicking Finalize switches `aria-selected` on the tab bar to Activity 1.
- Manual walkthrough (added as a step in the implementation plan): upload two different personal photos across two Activity 2 sessions, confirm both appear under "My photos" in Activity 1, confirm instructor photos disappear under "My photos" and reappear under "Both".
