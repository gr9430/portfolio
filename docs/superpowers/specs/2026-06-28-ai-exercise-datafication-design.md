# "What the Data Can't Rebuild" — Datafication Activity App Design Spec
**Date:** 2026-06-28
**Status:** Approved

## Overview

A single self-contained `index.html` in-class activity for an undergraduate digital-media course. Students upload a phone photo of a non-human subject (plant, fungus, water, stone, bark, light), the app reduces it to deliberately "unproductive" data points and renders the image *as* those reductions so the loss of meaning is visible. Students copy the auto-generated data-only description into Duck.ai's image generator to try (and fail) to rebuild the original — demonstrating datafication: that a scan treats meaning as given when meaning was never in the measures.

## File Location

- **Tool:** `phd/interdisciplinary-teaching/ai-exercise/index.html` — raw HTML, no Jekyll front matter
- **Course index update:** `phd/interdisciplinary-teaching/index.md` — add one link entry for the new tool

Jekyll serves the file as a static asset at `/phd/interdisciplinary-teaching/ai-exercise/`. No build step required.

## Constraints

- Single file, no dependencies, no npm, no build step
- Canvas API only for all image processing and rendering
- No external network requests (must work offline / `file://`)
- Works embedded in a Jekyll site via `<iframe>`
- No `localStorage`, `sessionStorage`, or `document.cookie` — all state in JS variables
- No external libraries

## Architecture

All JS is inline in a single `<script>` block. Three logical modules (no ES module syntax needed — plain functions grouped by comment headers):

```
SAMPLE_IMAGE constant
  ↓
ImageProcessor — all Canvas API pixel work
  ↓
Renderer — draws the three reduction canvases
  ↓
UI — event wiring, DOM updates, description assembly
```

### `SAMPLE_IMAGE` constant

A clearly-commented base64 data URI. Default: a programmatically generated canvas gradient (organic green/brown tones) converted to PNG data URI at page load. Comment block explicitly tells the instructor how to swap it:

```js
// SAMPLE_IMAGE: Replace this data URI with a base64-encoded photo of a
// non-human subject (plant, fungus, water, stone, bark, light) for best results.
// To encode: open browser console, run:
//   fetch('your-photo.jpg').then(r=>r.blob()).then(b=>{
//     const fr=new FileReader(); fr.onload=e=>console.log(e.target.result); fr.readAsDataURL(b)
//   })
// Then paste the result here.
const SAMPLE_IMAGE = generatePlaceholder(); // replace with 'data:image/jpeg;base64,...'
```

`generatePlaceholder()` draws a 400×400 gradient with organic green/brown/beige tones on a scratch canvas and returns a PNG data URI.

### ImageProcessor module

All pixel work runs on downsampled copies. Two downsample sizes:

- **256px max edge** — used for brightness, Laplacian blur score, Sobel edge density, connected components
- **64px max edge** — used for k-means color clustering

**`downsample(imageElement, maxEdge)`** → off-screen canvas with scaled image drawn into it; returns `ImageData`.

**`brightness(imageData)`** → mean of `(0.2126R + 0.7152G + 0.0722B) / 255` across all pixels → float 0–1.

**`toGrayscale(imageData)`** → `Uint8Array` of luminance values, one per pixel.

**`laplacianBlur(imageData)`** → grayscale the 256px copy; apply 3×3 kernel `[[0,1,0],[1,-4,1],[0,1,0]]` (skip border pixels); compute variance of output magnitudes. Lower = blurrier. Reported as a raw float labeled "relative — higher = sharper."

**`sobel(imageData)`** → apply Gx=`[[-1,0,1],[-2,0,2],[-1,0,1]]` and Gy=`[[1,2,1],[0,0,0],[-1,-2,-1]]` kernels on the grayscale 256px copy. Returns `{ magnitudeMap: Float32Array, density: float }` where `density` = proportion of pixels with magnitude above threshold 30/255.

**`connectedComponents(sobelResult, minSize=10)`** → flood-fill BFS on the binary edge map (pixels above threshold); return count of components with pixel count ≥ `minSize`. Labeled in UI as "≈ N regions (proxy)."

**`kMeans(imageData, k=5, iterations=20)`** → random centroid initialization on the 64px downsample; 20 Lloyd's algorithm iterations; returns array of `{ hex: string, pct: float }` sorted descending by percentage.

### Renderer module

**`drawEdges(canvas, sobelMagnitudeMap, width, height)`** — white-on-black: normalize magnitudes to 0–255, draw to canvas. `aria-label`: "Sobel edge map — detected boundaries shown as white lines on black."

**`drawPosterized(canvas, originalImage, palette)`** — draw original image at canvas size (max 400px), then read each pixel and replace with the nearest k-means centroid color (Euclidean distance in RGB space). `aria-label`: "Original image remapped to its 5 dominant colors."

**`drawColorBars(canvas, palette)`** — draw vertical bars proportional to each color's percentage across the canvas width, full height. No spatial information. `aria-label`: "Color bars showing the 5 measured dominant colors by percentage — no spatial information."

### UI module

**State variables:** `currentImage`, `currentPalette`, `currentDescription` — all plain JS variables, reset on each new upload.

**Upload zone:** Handles `dragover`, `dragleave`, `drop`, and `change` on hidden `<input type="file">`. Click on zone triggers `input.click()`. Enter/Space on zone also triggers file picker. `FileReader.readAsDataURL` → `new Image()` → pipeline.

**Sample button:** Calls `loadImageFromSrc(SAMPLE_IMAGE)` — same pipeline as upload.

**Pipeline on image load:**
1. Draw original to display canvas (max 600px wide, aspect preserved)
2. `downsample` at 256px → run brightness, laplacian, sobel, connectedComponents
3. `downsample` at 64px → run kMeans
4. Update data points DOM
5. Call all three Renderer functions
6. Assemble and update description textarea
7. Show hidden sections

**Description assembly:**
```
"An image. Mean brightness {brightness}. Dominant colors: {#HEX (pct%), ...}. Edge density {density}. Approximately {N} contour regions."
```
All values rounded to 2 decimal places; percentages rounded to nearest integer.

**Copy button:** `navigator.clipboard.writeText(currentDescription)` with fallback to `textarea.select(); document.execCommand('copy')`. Button label changes to "Copied!" for 1.5s then reverts.

## UI Layout

Single vertical column, `max-width: 800px`, centered, responsive.

1. **Header** — `<h1>` "What the Data Can't Rebuild" + one-line subtitle
2. **Upload zone** — dashed border box + hidden file input + "Load sample image" button
3. **Original** — display canvas, hidden until image loaded
4. **Data points panel** — hidden until image loaded; monospace table/list:
   - Brightness: scalar
   - Blur score: scalar (labeled "relative — higher = sharper")
   - Dominant colors: 5 rows each with inline color swatch + hex + percentage as text
   - Edge density: scalar
   - Contour count: integer (labeled "≈ N regions (proxy)")
5. **Reduction canvases** — hidden until image loaded; side-by-side on wide (≥600px), stacked on narrow; each with caption below
6. **Hand-off panel** — `<textarea readonly>` with description + Copy button + instruction text

## Design System

- **Accents:** magenta `rgb(122,6,97)` (section headers, Copy button), teal `rgb(6,97,122)` (canvas captions, active states)
- **Background:** `#f8f8ff` (ghostwhite, matches site)
- **Text:** `#111`
- **Font:** `'Liberation Mono', 'Courier New', monospace` throughout
- **Borders:** thin rules (`1px solid #ccc`) between sections; hard edges on data elements; soft radius (`4px`) on buttons only
- **No border-radius** on data table, swatches, canvases

## Accessibility

- Upload zone: `role="button"`, `tabindex="0"`, `aria-label="Upload image — drag and drop or click to browse"`, Enter/Space triggers file picker
- Each reduction canvas: `role="img"` + descriptive `aria-label` (see Renderer section)
- Original display canvas: `role="img"` `aria-label="Uploaded image"`
- Color swatches: hex and percentage always present as visible text; `aria-label` on swatch span includes hex and percentage
- Focus states: `outline: 2px solid rgb(122,6,97)` on all interactive elements, never suppressed with `outline: none` without replacement
- Color is never the sole signal — every data point includes text

## Acceptance Criteria

- Upload (or sample) → all five data points compute and display without error on a typical phone JPEG
- All three reduction canvases render and are visibly distinct from the original
- The data-only description reflects actual computed values and is copyable
- Works opened as a local `file://` and inside a sandboxed `<iframe>`; no console errors; no external requests
- Single file, no dependencies
- Large images (e.g. 12MP phone photo) do not hang the tab — downsampling enforced before all processing passes
