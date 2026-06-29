# AWG INC Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a normalization script and filterable masonry gallery page for AWG INC archival graphic design work.

**Architecture:** A Python script walks `creative/graphic/awg-inc/early|mid|late/` (top level only), resizes each raster image to max 1200px JPEG, and appends an entry to `_data/awg_images.yml`. A Jekyll page at `creative/graphic/awg-inc/index.html` reads both `awg_images.yml` and `awg_vocab.yml` via Liquid and renders a dark CSS-columns masonry grid with vanilla JS filtering and a lightbox.

**Tech Stack:** Python 3 + Pillow + PyYAML (script); Jekyll Liquid + vanilla JS + CSS columns (gallery); no JS build step.

## Global Constraints

- Script runs from repo root: `python _tools/normalize_awg.py`
- Script is re-run safe: never overwrites existing YAML entries
- Script skips non-raster files (PDFs, etc.) and subdirectories silently
- Normalized images: max 1200px longest side, JPEG quality 85, output to `assets/images/awg-inc/`
- Filenames slugified: lowercase, spaces → hyphens, non-`[a-z0-9-]` stripped, era-prefixed: `early-spit-poster.jpg`
- Gallery page uses `layout: default`; all gallery CSS/JS is scoped inside the page file
- Gallery dark palette: background `#0a0a0a`, text `#e8e8e8` — no site purple (`rgb(122,6,97)`) bleeds in
- Filter logic: AND across categories (era, bands, venues), OR within a category
- No JS framework, no external layout library; CSS columns for masonry
- `bands` and `venues` in image entries are arrays (multi-value)

---

### Task 1: Normalization script

**Files:**
- Create: `_tools/normalize_awg.py`
- Create: `_tools/tests/__init__.py`
- Create: `_tools/tests/test_normalize_awg.py`

**Interfaces:**
- Produces: `assets/images/awg-inc/<era>-<slug>.jpg` files
- Produces: entries appended to `_data/awg_images.yml` with fields `file`, `era`, `bands: []`, `venues: []`, `tags: []`

- [ ] **Step 1: Install test dependency**

```bash
pip install pillow pyyaml pytest
```

Expected: packages install without error.

- [ ] **Step 2: Create test scaffolding**

Create `_tools/tests/__init__.py` (empty file).

Create `_tools/tests/test_normalize_awg.py`:

```python
import sys
from pathlib import Path
import pytest
import yaml
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent.parent))
import normalize_awg


def make_image(path: Path, w: int, h: int) -> None:
    Image.new("RGB", (w, h), color=(100, 100, 100)).save(path)


class TestSlugify:
    def test_lowercases(self):
        assert normalize_awg.slugify("Hello") == "hello"

    def test_spaces_become_hyphens(self):
        assert normalize_awg.slugify("spit poster") == "spit-poster"

    def test_collapses_multiple_spaces(self):
        assert normalize_awg.slugify("cold  dead  stare") == "cold-dead-stare"

    def test_strips_special_chars(self):
        assert normalize_awg.slugify("Untitled-4 copy") == "untitled-4-copy"

    def test_preserves_existing_hyphens(self):
        assert normalize_awg.slugify("FR-MRR-12-20") == "fr-mrr-12-20"

    def test_strips_leading_trailing_hyphens(self):
        assert normalize_awg.slugify("-test-") == "test"

    def test_strips_underscores(self):
        assert normalize_awg.slugify("file_name") == "filename"


class TestNormalizeImage:
    def test_wide_image_resized_to_max_width(self, tmp_path):
        src, dst = tmp_path / "src.png", tmp_path / "out.jpg"
        make_image(src, 2400, 600)
        normalize_awg.normalize_image(src, dst)
        with Image.open(dst) as img:
            assert img.width == 1200
            assert img.height == 300

    def test_tall_image_resized_to_max_height(self, tmp_path):
        src, dst = tmp_path / "src.png", tmp_path / "out.jpg"
        make_image(src, 600, 2400)
        normalize_awg.normalize_image(src, dst)
        with Image.open(dst) as img:
            assert img.width == 300
            assert img.height == 1200

    def test_small_image_not_upscaled(self, tmp_path):
        src, dst = tmp_path / "src.png", tmp_path / "out.jpg"
        make_image(src, 800, 600)
        normalize_awg.normalize_image(src, dst)
        with Image.open(dst) as img:
            assert img.width == 800
            assert img.height == 600

    def test_output_is_jpeg(self, tmp_path):
        src, dst = tmp_path / "src.png", tmp_path / "out.jpg"
        make_image(src, 100, 100)
        normalize_awg.normalize_image(src, dst)
        with Image.open(dst) as img:
            assert img.format == "JPEG"


class TestLoadExistingFiles:
    def test_returns_empty_set_when_no_file(self, tmp_path, monkeypatch):
        monkeypatch.setattr(normalize_awg, "DATA_FILE", tmp_path / "missing.yml")
        assert normalize_awg.load_existing_files() == set()

    def test_returns_filenames_from_yaml(self, tmp_path, monkeypatch):
        f = tmp_path / "awg_images.yml"
        yaml.dump(
            [{"file": "early-test.jpg", "era": "early", "bands": [], "venues": [], "tags": []}],
            f.open("w"),
        )
        monkeypatch.setattr(normalize_awg, "DATA_FILE", f)
        assert normalize_awg.load_existing_files() == {"early-test.jpg"}

    def test_handles_empty_yaml_file(self, tmp_path, monkeypatch):
        f = tmp_path / "awg_images.yml"
        f.write_text("")
        monkeypatch.setattr(normalize_awg, "DATA_FILE", f)
        assert normalize_awg.load_existing_files() == set()


class TestAppendEntry:
    def test_creates_file_with_correct_fields(self, tmp_path, monkeypatch):
        f = tmp_path / "awg_images.yml"
        monkeypatch.setattr(normalize_awg, "DATA_FILE", f)
        normalize_awg.append_entry("early-test.jpg", "early")
        data = yaml.safe_load(f.read_text())
        assert data == [{"file": "early-test.jpg", "era": "early", "bands": [], "venues": [], "tags": []}]

    def test_appends_to_existing_entries(self, tmp_path, monkeypatch):
        f = tmp_path / "awg_images.yml"
        monkeypatch.setattr(normalize_awg, "DATA_FILE", f)
        normalize_awg.append_entry("early-a.jpg", "early")
        normalize_awg.append_entry("mid-b.jpg", "mid")
        data = yaml.safe_load(f.read_text())
        assert len(data) == 2
        assert data[1]["file"] == "mid-b.jpg"


class TestMain:
    def _patch(self, tmp_path, monkeypatch):
        src_base = tmp_path / "creative" / "graphic" / "awg-inc"
        out_dir = tmp_path / "assets" / "images" / "awg-inc"
        data_file = tmp_path / "_data" / "awg_images.yml"
        data_file.parent.mkdir(parents=True)
        monkeypatch.setattr(normalize_awg, "SOURCE_BASE", src_base)
        monkeypatch.setattr(normalize_awg, "OUTPUT_DIR", out_dir)
        monkeypatch.setattr(normalize_awg, "DATA_FILE", data_file)
        return src_base, out_dir, data_file

    def test_processes_images_in_all_eras(self, tmp_path, monkeypatch):
        src_base, out_dir, data_file = self._patch(tmp_path, monkeypatch)
        for era in ["early", "mid", "late"]:
            d = src_base / era
            d.mkdir(parents=True)
            make_image(d / "test.png", 100, 100)
        normalize_awg.main()
        assert len(list(out_dir.glob("*.jpg"))) == 3
        data = yaml.safe_load(data_file.read_text())
        assert len(data) == 3

    def test_skips_subdirectories(self, tmp_path, monkeypatch):
        src_base, out_dir, data_file = self._patch(tmp_path, monkeypatch)
        d = src_base / "early"
        d.mkdir(parents=True)
        sub = d / "subproject"
        sub.mkdir()
        make_image(sub / "image.png", 100, 100)
        normalize_awg.main()
        assert not out_dir.exists() or len(list(out_dir.glob("*.jpg"))) == 0

    def test_skips_non_image_files(self, tmp_path, monkeypatch):
        src_base, out_dir, data_file = self._patch(tmp_path, monkeypatch)
        d = src_base / "early"
        d.mkdir(parents=True)
        (d / "flyer.pdf").write_bytes(b"%PDF-1.4")
        normalize_awg.main()
        assert not out_dir.exists() or len(list(out_dir.glob("*.jpg"))) == 0

    def test_skips_already_processed_entries(self, tmp_path, monkeypatch):
        src_base, out_dir, data_file = self._patch(tmp_path, monkeypatch)
        out_dir.mkdir(parents=True)
        d = src_base / "early"
        d.mkdir(parents=True)
        make_image(d / "test.png", 100, 100)
        yaml.dump(
            [{"file": "early-test.jpg", "era": "early", "bands": [], "venues": [], "tags": []}],
            data_file.open("w"),
        )
        normalize_awg.main()
        data = yaml.safe_load(data_file.read_text())
        assert len(data) == 1  # no duplicate entry
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd /home/user/portfolio && pytest _tools/tests/test_normalize_awg.py -v
```

Expected: `ModuleNotFoundError: No module named 'normalize_awg'` or similar — the module doesn't exist yet.

- [ ] **Step 4: Write the implementation**

Create `_tools/normalize_awg.py`:

```python
#!/usr/bin/env python3
"""
Normalize AWG INC era images for web gallery.
Run from repo root: python _tools/normalize_awg.py
Requires: pip install pillow pyyaml
"""
import re
import sys
import yaml
from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).parent.parent
SOURCE_BASE = REPO_ROOT / "creative" / "graphic" / "awg-inc"
OUTPUT_DIR = REPO_ROOT / "assets" / "images" / "awg-inc"
DATA_FILE = REPO_ROOT / "_data" / "awg_images.yml"
ERAS = ["early", "mid", "late"]
ACCEPTED = {".png", ".jpg", ".jpeg", ".jfif", ".webp"}
MAX_DIM = 1200
QUALITY = 85


def slugify(name: str) -> str:
    name = name.lower()
    name = re.sub(r"[^a-z0-9\s-]", "", name)
    name = re.sub(r"\s+", "-", name)
    name = re.sub(r"-{2,}", "-", name)
    return name.strip("-")


def normalize_image(src: Path, dst: Path) -> None:
    with Image.open(src) as img:
        img = img.convert("RGB")
        w, h = img.size
        if max(w, h) > MAX_DIM:
            ratio = MAX_DIM / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
        img.save(dst, "JPEG", quality=QUALITY)


def load_existing_files() -> set:
    if not DATA_FILE.exists():
        return set()
    with open(DATA_FILE) as f:
        data = yaml.safe_load(f) or []
    return {entry["file"] for entry in data}


def append_entry(filename: str, era: str) -> None:
    existing = []
    if DATA_FILE.exists():
        with open(DATA_FILE) as f:
            existing = yaml.safe_load(f) or []
    existing.append({"file": filename, "era": era, "bands": [], "venues": [], "tags": []})
    with open(DATA_FILE, "w") as f:
        yaml.dump(existing, f, default_flow_style=False, allow_unicode=True)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    existing = load_existing_files()

    for era in ERAS:
        era_dir = SOURCE_BASE / era
        if not era_dir.is_dir():
            print(f"Warning: {era_dir} not found, skipping", file=sys.stderr)
            continue
        for src in sorted(era_dir.iterdir()):
            if not src.is_file():
                continue
            if src.suffix.lower() not in ACCEPTED:
                continue
            slug = slugify(src.stem)
            if not slug:
                print(f"Warning: could not slugify '{src.name}', skipping", file=sys.stderr)
                continue
            out_name = f"{era}-{slug}.jpg"
            if out_name in existing:
                print(f"Skip (already in data): {out_name}")
                continue
            dst = OUTPUT_DIR / out_name
            if dst.exists():
                print(f"Skip (output file exists but not in data): {out_name}", file=sys.stderr)
                continue
            try:
                normalize_image(src, dst)
                append_entry(out_name, era)
                existing.add(out_name)
                print(f"OK: {src.name} -> {out_name}")
            except Exception as exc:
                print(f"Error: {src.name}: {exc}", file=sys.stderr)


if __name__ == "__main__":
    main()
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /home/user/portfolio && pytest _tools/tests/test_normalize_awg.py -v
```

Expected: all tests pass with no failures.

- [ ] **Step 6: Run the script on real images**

> **Note:** Before running, manually convert any PDFs in the era folders to JPEG and place the resulting files in the appropriate era folder. The script will skip any remaining `.pdf` files silently.

```bash
cd /home/user/portfolio && python _tools/normalize_awg.py
```

Expected: output lines like `OK: spit poster.png -> early-spit-poster.jpg` for each image. Check that `assets/images/awg-inc/` now contains JPEG files and `_data/awg_images.yml` has one entry per processed image.

- [ ] **Step 7: Spot-check output**

```bash
ls assets/images/awg-inc/ | head -10
python -c "import yaml; d=yaml.safe_load(open('_data/awg_images.yml')); print(len(d), 'entries'); print(d[0])"
```

Expected: file count matches entry count, first entry has `era`, `bands: []`, `venues: []`, `tags: []`.

- [ ] **Step 8: Commit**

```bash
git add _tools/normalize_awg.py _tools/tests/__init__.py _tools/tests/test_normalize_awg.py \
        _data/awg_images.yml assets/images/awg-inc/
git commit -m "feat: add AWG INC normalization script and processed images"
```

---

### Task 2: Data files

**Files:**
- Create: `_data/awg_vocab.yml`
- Create: `assets/images/awg-inc/.gitkeep` (only if Task 1 produced no images yet — skip if directory already has files)

**Interfaces:**
- Produces: `site.data.awg_vocab.bands` and `site.data.awg_vocab.venues` arrays (consumed by Task 3)

- [ ] **Step 1: Create the vocabulary file**

Create `_data/awg_vocab.yml`:

```yaml
bands:
  - placeholder-band-1
  - placeholder-band-2

venues:
  - placeholder-venue-1
  - placeholder-venue-2
```

(These are intentional placeholders. The user will replace them with real band and venue names, and re-tag images in `awg_images.yml` accordingly.)

- [ ] **Step 2: Ensure assets directory is tracked**

If `assets/images/awg-inc/` is empty (Task 1 hasn't run yet or produced no output), create a `.gitkeep`:

```bash
touch assets/images/awg-inc/.gitkeep
```

If the directory already has JPEG files from Task 1, skip this step.

- [ ] **Step 3: Commit**

```bash
git add _data/awg_vocab.yml assets/images/awg-inc/
git commit -m "feat: add AWG INC vocabulary and assets directory"
```

---

### Task 3: Gallery page

**Files:**
- Create: `creative/graphic/awg-inc/index.html`
- Delete: `creative/graphic/awg-inc/index.md`

**Interfaces:**
- Consumes: `site.data.awg_images` (from `_data/awg_images.yml`, Task 1)
- Consumes: `site.data.awg_vocab.bands`, `site.data.awg_vocab.venues` (from `_data/awg_vocab.yml`, Task 2)

- [ ] **Step 1: Delete the existing index.md**

```bash
rm creative/graphic/awg-inc/index.md
```

- [ ] **Step 2: Create the gallery page**

Create `creative/graphic/awg-inc/index.html` with the full content below. The prose is preserved verbatim from the deleted `index.md`.

```html
---
layout: default
title: AWG INC
project: true
tags: [Graphic Art, DIY, Music, Visual Culture, Creative Works]
---

<p>AWG INC was a nom de plume, not a studio: a name I put on work I didn't want attached to my own. For about five years it was the byline on t-shirts, flyers, and tour posters across the DIY punk and metal scenes of Orlando and Daytona Beach, FL: for bands I played in, bands I booked, and dozens of acts I had no stake in beyond the ocassional handshake that happened to leave some crumpled bills in my palm.</p>

<p>The anonymity wasn't incidental: AWG INC's work was meant to be sarcastic and subversive of the design language that already dominated those scenes. This, however, was a poorly kept secret. The AWG work drew instead on Eurotrash cinema and Situationist spirits: the surreality, the luridness, and even the humor of the films that landed just short of the arthouse prestige cut. A flyer for a basement show could borrow its texture from a half-remembered Clifford Brown poster and nobody booking the room would necessarily know or care. That gap was the point as it satisfied my own fixations.</p>

<style>
#awg-gallery {
  margin-left: calc(-50vw + 50%);
  width: 100vw;
  background: #0a0a0a;
  color: #e8e8e8;
  padding: 2rem 1.5rem;
  box-sizing: border-box;
  margin-top: 2rem;
}

.awg-inner {
  max-width: 1080px;
  margin: 0 auto;
}

.awg-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.awg-filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}

.awg-filter-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #555;
  margin-right: 0.25rem;
  white-space: nowrap;
}

.awg-filter-btn {
  background: #111;
  color: #e8e8e8;
  border: 1px solid #444;
  padding: 0.25rem 0.65rem;
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  line-height: 1.4;
}

.awg-filter-btn:hover {
  border-color: #888;
}

.awg-filter-btn.active {
  background: #e8e8e8;
  color: #0a0a0a;
  border-color: #e8e8e8;
}

.awg-clear-btn {
  background: none;
  color: #555;
  border: 1px solid #333;
  padding: 0.25rem 0.65rem;
  font-family: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  margin-left: auto;
  align-self: center;
}

.awg-clear-btn:hover {
  color: #e8e8e8;
  border-color: #666;
}

.awg-grid {
  column-count: 3;
  column-gap: 0.75rem;
}

@media (max-width: 900px) {
  .awg-grid { column-count: 2; }
}

@media (max-width: 500px) {
  .awg-grid { column-count: 1; }
  #awg-gallery { padding: 1.5rem 1rem; }
}

.awg-item {
  break-inside: avoid;
  margin-bottom: 0.75rem;
}

.awg-item img {
  width: 100%;
  height: auto;
  display: block;
  margin: 0;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.1s;
}

.awg-item img:hover {
  opacity: 0.8;
}

#awg-lightbox {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  z-index: 9999;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

#awg-lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  display: block;
  margin: 0;
  cursor: default;
}
</style>

<div id="awg-gallery">
  <div class="awg-inner">

    <div class="awg-filters">
      <div class="awg-filter-group">
        <span class="awg-filter-label">Period</span>
        <button class="awg-filter-btn" data-cat="era" data-val="early">early</button>
        <button class="awg-filter-btn" data-cat="era" data-val="mid">mid</button>
        <button class="awg-filter-btn" data-cat="era" data-val="late">late</button>
      </div>

      {% if site.data.awg_vocab.bands and site.data.awg_vocab.bands.size > 0 %}
      <div class="awg-filter-group">
        <span class="awg-filter-label">Band</span>
        {% for band in site.data.awg_vocab.bands %}
        <button class="awg-filter-btn" data-cat="bands" data-val="{{ band }}">{{ band }}</button>
        {% endfor %}
      </div>
      {% endif %}

      {% if site.data.awg_vocab.venues and site.data.awg_vocab.venues.size > 0 %}
      <div class="awg-filter-group">
        <span class="awg-filter-label">Venue</span>
        {% for venue in site.data.awg_vocab.venues %}
        <button class="awg-filter-btn" data-cat="venues" data-val="{{ venue }}">{{ venue }}</button>
        {% endfor %}
      </div>
      {% endif %}

      <button class="awg-clear-btn" id="awg-clear">Clear filters</button>
    </div>

    <div class="awg-grid">
      {% for img in site.data.awg_images %}
      <div class="awg-item"
           data-era="{{ img.era }}"
           data-bands='{{ img.bands | jsonify }}'
           data-venues='{{ img.venues | jsonify }}'>
        <img src="{{ site.baseurl }}/assets/images/awg-inc/{{ img.file }}"
             alt="{{ img.file | remove: '.jpg' | replace: '-', ' ' }}"
             loading="lazy">
      </div>
      {% endfor %}
    </div>

  </div>
</div>

<div id="awg-lightbox">
  <img id="awg-lightbox-img" src="" alt="">
</div>

<script>
(function () {
  const filterState = { era: new Set(), bands: new Set(), venues: new Set() };

  function applyFilters() {
    document.querySelectorAll('.awg-item').forEach(item => {
      const eraOk = filterState.era.size === 0 || filterState.era.has(item.dataset.era);
      const itemBands = JSON.parse(item.dataset.bands) || [];
      const itemVenues = JSON.parse(item.dataset.venues) || [];
      const bandsOk = filterState.bands.size === 0 || itemBands.some(b => filterState.bands.has(b));
      const venuesOk = filterState.venues.size === 0 || itemVenues.some(v => filterState.venues.has(v));
      item.style.display = (eraOk && bandsOk && venuesOk) ? '' : 'none';
    });
  }

  document.querySelectorAll('.awg-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { cat, val } = btn.dataset;
      if (filterState[cat].has(val)) {
        filterState[cat].delete(val);
        btn.classList.remove('active');
      } else {
        filterState[cat].add(val);
        btn.classList.add('active');
      }
      applyFilters();
    });
  });

  document.getElementById('awg-clear').addEventListener('click', () => {
    Object.values(filterState).forEach(s => s.clear());
    document.querySelectorAll('.awg-filter-btn').forEach(b => b.classList.remove('active'));
    applyFilters();
  });

  const lightbox = document.getElementById('awg-lightbox');
  const lightboxImg = document.getElementById('awg-lightbox-img');

  document.querySelectorAll('.awg-item img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightbox.style.display = 'flex';
    });
  });

  lightbox.addEventListener('click', e => {
    if (e.target !== lightboxImg) lightbox.style.display = 'none';
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') lightbox.style.display = 'none';
  });
}());
</script>
```

- [ ] **Step 3: Start Jekyll and verify manually**

```bash
cd /home/user/portfolio && bundle exec jekyll serve
```

Open `http://localhost:4000/creative/graphic/awg-inc/` in a browser and verify:

- [ ] Dark background section appears below the prose
- [ ] Period buttons (early / mid / late) are visible
- [ ] Band and Venue buttons appear (populated from `awg_vocab.yml`)
- [ ] All normalized images render in a staggered multi-column grid
- [ ] Clicking a Period button highlights it and hides non-matching images
- [ ] Clicking multiple buttons in different groups applies AND logic (both conditions must match)
- [ ] Clicking multiple buttons in the same group applies OR logic (either matches)
- [ ] "Clear filters" button resets all buttons and shows all images
- [ ] Clicking an image opens the dark lightbox overlay with the full image
- [ ] Clicking outside the image in the lightbox closes it
- [ ] Pressing Escape closes the lightbox
- [ ] On a narrow viewport (< 500px), grid collapses to single column

- [ ] **Step 4: Commit**

```bash
git add creative/graphic/awg-inc/index.html
git rm creative/graphic/awg-inc/index.md
git commit -m "feat: add AWG INC filterable masonry gallery page"
```
