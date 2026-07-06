(function () {
  var currentImageId = null;      // id from images[] if project image selected
  var currentReduction = null;    // the computed result
  var currentUploadDataUrl = null; // data: URL for the currently-loaded upload (null when a project image is selected)
  var _queue = [];                // File objects waiting to be processed
  var _queueIdx = 0;
  var _allDominant = [];          // accumulated colors across the queue session

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

  function updateQueueUI() {
    var total = _queue.length;
    var current = _queueIdx + 1;
    var indicator = document.getElementById('queue-indicator');
    var progress  = document.getElementById('queue-progress');
    var btn       = document.getElementById('save-reduction-btn');
    var label     = document.getElementById('queue-label');
    if (total > 1) {
      indicator.hidden = false;
      progress.textContent = 'Image ' + current + ' of ' + total;
      btn.textContent = current < total ? 'Save & continue →' : 'Save & finish';
      label.textContent = '';
    } else {
      indicator.hidden = true;
      btn.textContent = 'Save to project';
      label.textContent = '';
    }
  }

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

    renderResults(W, H, gray, edges, thresh, dominant, currentReduction, img);
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
  function renderResults(W, H, gray, edges, thresh, dominant, measures, img) {
    renderEdgeMap(W, H, edges);
    renderPosterization(W, H, gray, dominant, img);
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

  function renderPosterization(W, H, gray, dominant, img) {
    // Reconstruct original pixel data from gray (we need rgb — draw from loaded img)
    var off = document.createElement('canvas');
    off.width = W; off.height = H;
    var offCtx = off.getContext('2d');
    offCtx.drawImage(img, 0, 0, W, H);
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
    if (!currentReduction) return;
    var images = ZineStore.state.images;
    if (currentImageId) {
      var target = images.find(function(i){ return i.id === currentImageId; });
      if (target) {
        target.reduction = currentReduction;
        ZineStore.update({ images: images.slice() });
      }
      alert('Reduction data saved. Switch to Activity 3 to name the dominant colors.');
      return;
    }

    // Accumulate colors from this image into the session palette
    _allDominant = _allDominant.concat(currentReduction.dominant);
    ZineStore.saveDominantHexes(_allDominant);

    // Persist this upload as a placeable image
    var ownImages = ZineStore.state.images;
    ownImages.push(buildOwnImageEntry(currentReduction, currentUploadDataUrl, _queueIdx));
    ZineStore.update({ images: ownImages.slice() });

    // Advance queue
    if (_queue.length > 1) {
      _queueIdx++;
      if (_queueIdx < _queue.length) {
        processQueue();
        return;
      }
      // All done
      var total = _queue.length;
      _queue = [];
      _queueIdx = 0;
      document.getElementById('queue-indicator').hidden = true;
      document.getElementById('save-reduction-btn').textContent = 'Save to project';
      document.getElementById('queue-label').textContent =
        total + ' images processed — ' + _allDominant.length + ' colors extracted.';
    } else {
      alert('Reduction data saved. Switch to Activity 3 to name the dominant colors.');
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
