/**
 * reduction.test.js — Node.js test for pure math functions in reduction.js
 * Exercises: meanBrightness, laplacianVariance, sobelEdges, kMeans,
 *            connectedComponents, threshold, toGray
 * No DOM or Canvas API required.
 *
 * Manual-verify items (DOM/Canvas only, untestable in Node):
 *   - renderEdgeMap()       — writes normalized Sobel magnitude to #canvas-edge
 *   - renderPosterization() — re-draws preview img onto #canvas-poster with centroid snap
 *   - renderDataRebuild()   — draws 5 vertical color bars on #canvas-data
 *   - renderSwatches()      — builds .swatch-item divs in #dominant-swatches
 *   - renderResults()       — unhides canvases, table, swatches, save-row
 *   - loadImageAndAnalyse() — creates Image, draws to offscreen canvas, calls analyseImage
 *   - onUpload()            — uses FileReader / createObjectURL (browser File API)
 *   - onProjectSelect()     — reads ZineStore.state.images, calls loadImageAndAnalyse
 */

'use strict';

// ── Polyfills for Node (Float32Array, Uint8Array are global in Node) ─────────

// ── Extracted pure functions (mirrors reduction.js exactly) ──────────────────

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
  var step = Math.max(1, Math.floor(n / 2000));
  var pixels = [];
  for (var i = 0; i < n; i += step) {
    pixels.push([d[i*4], d[i*4+1], d[i*4+2]]);
  }
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

// ── Helpers to build synthetic ImageData-like objects ────────────────────────

function makeImageData(pixels) {
  // pixels: array of [r,g,b,a] per pixel
  var buf = new Uint8ClampedArray(pixels.length * 4);
  pixels.forEach(function(px, i) {
    buf[i*4]   = px[0]; buf[i*4+1] = px[1];
    buf[i*4+2] = px[2]; buf[i*4+3] = px[3] !== undefined ? px[3] : 255;
  });
  return { data: buf };
}

function approx(a, b, tol) {
  return Math.abs(a - b) <= (tol !== undefined ? tol : 0.0001);
}

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

// ── Test harness ─────────────────────────────────────────────────────────────

var passed = 0;
var failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log('  PASS:', label);
    passed++;
  } else {
    console.error('  FAIL:', label);
    failed++;
  }
}

// ── Test 1: meanBrightness ───────────────────────────────────────────────────
console.log('\n[1] meanBrightness');

// All black pixels → 0
var black4 = makeImageData([[0,0,0,255],[0,0,0,255],[0,0,0,255],[0,0,0,255]]);
assert('all-black → brightness 0', meanBrightness(black4) === 0);

// All white pixels → 1
var white4 = makeImageData([[255,255,255,255],[255,255,255,255]]);
assert('all-white → brightness 1', approx(meanBrightness(white4), 1.0, 0.0001));

// Pure red (255,0,0): luminance = 0.2126*255/255 = 0.2126
var redPx = makeImageData([[255,0,0,255]]);
assert('pure red → brightness ~0.2126', approx(meanBrightness(redPx), 0.2126, 0.0001));

// Pure green (0,255,0): luminance = 0.7152
var greenPx = makeImageData([[0,255,0,255]]);
assert('pure green → brightness ~0.7152', approx(meanBrightness(greenPx), 0.7152, 0.0001));

// Pure blue (0,0,255): luminance = 0.0722
var bluePx = makeImageData([[0,0,255,255]]);
assert('pure blue → brightness ~0.0722', approx(meanBrightness(bluePx), 0.0722, 0.0001));

// Mid-grey (128,128,128): luminance ≈ 128/255 ≈ 0.502
var greyPx = makeImageData([[128,128,128,255]]);
var expectedGrey = (0.2126*128 + 0.7152*128 + 0.0722*128) / 255;
assert('mid-grey → correct luminance', approx(meanBrightness(greyPx), expectedGrey, 0.0001));

// ── Test 2: toGray ───────────────────────────────────────────────────────────
console.log('\n[2] toGray');

// 2×1 image: black and white
var bwData = makeImageData([[0,0,0,255],[255,255,255,255]]);
var gBW = toGray(bwData, 2, 1);
assert('toGray black pixel → 0', gBW[0] === 0);
assert('toGray white pixel → 255', approx(gBW[1], 255, 0.01));

// Pure red pixel
var redData = makeImageData([[255,0,0,255]]);
var gRed = toGray(redData, 1, 1);
assert('toGray red → 0.2126*255', approx(gRed[0], 0.2126*255, 0.01));

// Output length matches W*H
var pixels3x3 = [];
for (var i = 0; i < 9; i++) pixels3x3.push([100,100,100,255]);
var data3x3 = makeImageData(pixels3x3);
var g3x3 = toGray(data3x3, 3, 3);
assert('toGray output length = W*H', g3x3.length === 9);

// ── Test 3: laplacianVariance ────────────────────────────────────────────────
console.log('\n[3] laplacianVariance');

// Uniform image → all Laplacian values = 0 → variance = 0
var uniformPixels = [];
for (var ui = 0; ui < 25; ui++) uniformPixels.push([150, 150, 150, 255]);
var uniformData = makeImageData(uniformPixels);
var uniformGray = toGray(uniformData, 5, 5);
assert('uniform image → Laplacian variance = 0', laplacianVariance(uniformGray, 5, 5) === 0);

// Sharp edge image: left half dark, right half bright on 5×5
var edgePixels = [];
for (var ey = 0; ey < 5; ey++) {
  for (var ex = 0; ex < 5; ex++) {
    edgePixels.push(ex < 3 ? [0,0,0,255] : [255,255,255,255]);
  }
}
var edgeData = makeImageData(edgePixels);
var edgeGray = toGray(edgeData, 5, 5);
var edgeLapVar = laplacianVariance(edgeGray, 5, 5);
assert('sharp-edge image → Laplacian variance > 0', edgeLapVar > 0);
assert('sharp-edge Laplacian variance > uniform', edgeLapVar > 0);

// ── Test 4: sobelEdges ───────────────────────────────────────────────────────
console.log('\n[4] sobelEdges');

// Uniform image → all Sobel values = 0
var sobelUniformGray = toGray(makeImageData(uniformPixels), 5, 5);
var sobelFlat = sobelEdges(sobelUniformGray, 5, 5);
var allZero = Array.from(sobelFlat).every(function(v){ return v === 0; });
assert('uniform image → all Sobel edges = 0', allZero);

// Vertical edge (left black / right white): centre column should have high response
var sobelEdgePx = [];
for (var sy = 0; sy < 5; sy++) {
  for (var sx = 0; sx < 5; sx++) {
    sobelEdgePx.push(sx < 2 ? [0,0,0,255] : [255,255,255,255]);
  }
}
var sobelEdgeGray = toGray(makeImageData(sobelEdgePx), 5, 5);
var sobelResult = sobelEdges(sobelEdgeGray, 5, 5);
// Interior pixels along the edge boundary should be nonzero
var hasEdge = Array.from(sobelResult).some(function(v){ return v > 0; });
assert('vertical edge image → some Sobel values > 0', hasEdge);

// Border pixels are always 0 (not computed)
assert('sobel border top-left = 0', sobelResult[0] === 0);
assert('sobel border bottom-right = 0', sobelResult[24] === 0);

// Output length matches W*H
assert('sobelEdges output length = W*H', sobelResult.length === 25);

// ── Test 5: threshold ────────────────────────────────────────────────────────
console.log('\n[5] threshold');

// All-zero edges → max=0 → threshold 0 → all pixels below threshold → all 0
var zeroEdges = new Float32Array(9); // 3×3, all zero
var threshZero = threshold(zeroEdges);
assert('all-zero edges → threshold all 0', threshZero.every(function(v){ return v === 0; }));

// Known values: [0, 50, 100, 200] — max=200, t=40; 50,100,200 > 40
var knownEdges = new Float32Array([0, 50, 100, 200]);
var threshKnown = threshold(knownEdges);
assert('threshold: 0 below 20% of max → 0', threshKnown[0] === 0);
assert('threshold: 50 above 20% of 200 → 1', threshKnown[1] === 1);
assert('threshold: 100 above 20% of 200 → 1', threshKnown[2] === 1);
assert('threshold: 200 above 20% of 200 (max > t=40) → 1', threshKnown[3] === 1);

// Output is an array (not Float32Array)
assert('threshold returns plain array', Array.isArray(threshKnown));

// ── Test 6: connectedComponents ──────────────────────────────────────────────
console.log('\n[6] connectedComponents');

// All-zero binary → 0 components
var emptyBinary = new Array(25).fill(0);
assert('all-zero binary → 0 components', connectedComponents(emptyBinary, 5, 5, 1) === 0);

// All-one binary 5×5 → 1 component of size 25 (>= minSize=8)
var fullBinary = new Array(25).fill(1);
assert('all-one 5×5 binary → 1 component (size 25 >= 8)', connectedComponents(fullBinary, 5, 5, 8) === 1);

// Two disconnected 3-pixel L-shapes on a 5×5 grid, minSize=3
// Shape A: indices 0,1,2 (top row first 3 pixels) — size 3
// Shape B: indices 22,23,24 (bottom row last 3 pixels) — size 3
var twoBinary = new Array(25).fill(0);
twoBinary[0]=1; twoBinary[1]=1; twoBinary[2]=1;
twoBinary[22]=1; twoBinary[23]=1; twoBinary[24]=1;
assert('two disconnected 3-blobs, minSize=3 → 2 components', connectedComponents(twoBinary, 5, 5, 3) === 2);

// Same two blobs but minSize=4 → 0 components (both too small)
assert('same two 3-blobs, minSize=4 → 0 components', connectedComponents(twoBinary, 5, 5, 4) === 0);

// Single pixel: size 1, minSize=1 → 1; minSize=2 → 0
var singleBinary = new Array(9).fill(0);
singleBinary[4] = 1; // centre of 3×3
assert('single pixel, minSize=1 → 1 component', connectedComponents(singleBinary, 3, 3, 1) === 1);
assert('single pixel, minSize=2 → 0 components', connectedComponents(singleBinary, 3, 3, 2) === 0);

// ── Test 7: kMeans ───────────────────────────────────────────────────────────
console.log('\n[7] kMeans');

// Two distinct pure-color clusters (red and blue), 100 pixels each
var kmPixels = [];
for (var ki = 0; ki < 100; ki++) kmPixels.push([255, 0, 0, 255]); // red
for (var kj = 0; kj < 100; kj++) kmPixels.push([0, 0, 255, 255]); // blue
// Pad to 5 distinct groups (add green, white, black) for k=5
for (var kk = 0; kk < 100; kk++) kmPixels.push([0, 255, 0, 255]);
for (var kl = 0; kl < 100; kl++) kmPixels.push([255, 255, 255, 255]);
for (var km = 0; km < 100; km++) kmPixels.push([0, 0, 0, 255]);
var kmData = makeImageData(kmPixels);

var result = kMeans(kmData, 5, 20);
assert('kMeans returns array of length k=5', result.length === 5);
assert('kMeans: each item has hex property', result.every(function(d){ return typeof d.hex === 'string' && d.hex[0] === '#' && d.hex.length === 7; }));
assert('kMeans: each item has pct property (number)', result.every(function(d){ return typeof d.pct === 'number'; }));
assert('kMeans: pct values sum to ~1', approx(result.reduce(function(s,d){ return s+d.pct; }, 0), 1.0, 0.02));
assert('kMeans: sorted descending by pct', result.every(function(d,i){ return i === 0 || result[i-1].pct >= d.pct; }));
assert('kMeans: all pct values >= 0', result.every(function(d){ return d.pct >= 0; }));

// Single-color image → all pixels should converge to one centroid with pct=1
var singleColorPx = [];
for (var sc = 0; sc < 200; sc++) singleColorPx.push([128, 64, 32, 255]);
var singleColorResult = kMeans(makeImageData(singleColorPx), 5, 12);
assert('single-color image: largest cluster pct ~ 1.0', singleColorResult[0].pct >= 0.98);

// Determinism sanity: hex format correct
result.forEach(function(d, i) {
  assert('kMeans result[' + i + '] hex is valid 7-char #rrggbb', /^#[0-9a-f]{6}$/.test(d.hex));
});

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

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n──────────────────────────────────────────');
console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
