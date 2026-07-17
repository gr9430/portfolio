# Exams Graph: Split "Debates in the Digital Humanities 2023" into Chapter Sub-Nodes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single flat `debates-23` book entry (1,055 citations from 27 chapters flattened into one node) with a parent anthology node plus 27 real chapter sub-nodes, connected by a new `partOf` graph edge, without corrupting the existing hub-threshold or aggregate-stats logic.

**Architecture:** Two independent halves. (1) A data migration against `_data/exams.json`: fold ~50 near-duplicate citations added in the prior transcription pass, split the flat citation list across 27 new chapter book entries, empty the parent's own list. (2) A `phd/exams/index.html` code change: tag chapter entries at load time, add a `partOfEdges` array/force/render-layer parallel to the existing `citeEdges` mechanism, fix two side effects (sibling-edge noise between chapters, hub-threshold inflation from one anthology's internal cross-references), and exclude chapters from the three "every book, flattened" aggregate views (Reading List, stats bar, Citation Matrix).

**Tech Stack:** Python 3 (one-off data migration scripts, not committed), D3.js v7 (existing, no new dependency), vanilla JS (existing IIFE in `index.html`).

**Design spec:** `docs/superpowers/specs/2026-07-17-exams-debates23-chapter-split-design.md`

## Global Constraints

- All data-migration Python scripts in Tasks 1–3 are one-off tools run from the shell — they are NOT committed to the repo. Only the resulting `_data/exams.json` diff is committed.
- **Precondition:** Tasks 1–3 depend on `/tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad/debates23_full.txt` — the verbatim, chapter-tagged transcription of all 1,075 raw citation lines from the anthology's 27 chapters, already produced and verified in the prior session. If this file is missing (e.g. scratch was cleared, or this plan is being executed in a different session/environment), Tasks 1–3 cannot run as written and the transcription must be redone from the original source before continuing — do not attempt to reconstruct chapter membership from the flat `debates-23.citations` array already in `_data/exams.json`, since it has no chapter tags.
- All edits to `phd/exams/index.html` are within its single `<script>` block (and one CSS rule + one legend line) — no other file changes for Tasks 4–8.
- No changes to charge, collision, the auto-fit zoom, hover/click labels, click-to-highlight, or the citation-hub (`citeEdges`) mechanism itself — this plan adds a third, parallel edge type, it doesn't touch the existing two.
- The syntax-check pipeline (run after every `index.html` code task):
```bash
sed -n '/^<script>$/,/^<\/script>$/p' phd/exams/index.html | \
  grep -v '^<script>$' | grep -v '^</script>$' | \
  sed '1,2d' | sed '1i const EXAMS_DATA = {}; const EXAMS_VOCAB = {};' \
  > /tmp/exams-script-check.js
node --check /tmp/exams-script-check.js
```
Expect no output (syntax OK).

---

### Task 1: Recover the per-chapter citation-key mapping

**Files:**
- Create (scratch, not committed): `/tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad/recover_chapters.py`
- Reads: `/tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad/debates23_full.txt`, `/home/user/portfolio/_data/exams.json`
- Produces (scratch): `/tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad/chapter_keys.json`

**Interfaces:**
- Consumes: nothing from another task.
- Produces: `chapter_keys.json`, shape `{"1": ["key1", "key2", ...], "2": [...], ..., "27": [...]}` — for Task 3.

- [ ] **Step 1: Write the script**

```python
import json, re

SCRATCH = "/tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad"
EXAMS = "/home/user/portfolio/_data/exams.json"

with open(f"{SCRATCH}/debates23_full.txt", encoding="utf-8") as f:
    lines = [l.rstrip("\n") for l in f]

with open(EXAMS, encoding="utf-8") as f:
    data = json.load(f)
biblio = data["citations"]
text_to_key = {}
for k, v in biblio.items():
    text_to_key.setdefault(v, k)  # first-writer-wins, matches original transcription order

chapter = None
chapter_lines = {}
failures = []
for l in lines:
    s = l.strip()
    if not s:
        continue
    m = re.match(r"^Chapter (\d+)$", s)
    if m:
        chapter = int(m.group(1))
        chapter_lines[chapter] = []
        continue
    if s == "Bibliography":
        continue
    chapter_lines[chapter].append(s)

chapter_keys = {}
total_lines = 0
for ch, raws in chapter_lines.items():
    keys = []
    for raw in raws:
        total_lines += 1
        key = text_to_key.get(raw)
        if key is None:
            failures.append((ch, raw))
        else:
            keys.append(key)
    chapter_keys[ch] = sorted(set(keys))

print("chapters recovered:", len(chapter_keys))
print("total raw lines processed:", total_lines)
print("lookup failures:", len(failures))
for ch, raw in failures[:10]:
    print("  FAIL ch", ch, raw[:80])

with open(f"{SCRATCH}/chapter_keys.json", "w", encoding="utf-8") as f:
    json.dump({str(k): v for k, v in chapter_keys.items()}, f, ensure_ascii=False, indent=2)
```

- [ ] **Step 2: Run it**

```bash
python3 /tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad/recover_chapters.py
```

Expected output: `chapters recovered: 27`, `total raw lines processed: 1075`, `lookup failures: 0`. If `lookup failures` is nonzero, stop — it means `debates23_full.txt` doesn't match the current bibliography state (someone edited `_data/exams.json`'s debates-23-related entries since the transcription pass); do not proceed to Task 2 until failures are 0.

No commit for this task — scratch output only, consumed by Task 3.

---

### Task 2: Compute and apply the near-duplicate citation fold

**Files:**
- Create (scratch): `/tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad/compute_fold.py`
- Reads: `/home/user/portfolio/_data/exams.json`, `new_entries_preview.json` (scratch, already present — the list of the ~1,053 bibliography keys added in the prior transcription pass; this scopes the fold to those keys only, per the design's "explicitly out of scope: auditing the wider corpus")
- Produces (scratch): `/tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad/fold_map.json`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `fold_map.json`, shape `{"oldKey": "canonicalKey", ...}` — for Task 3.

- [ ] **Step 1: Write the script**

```python
import json, re, unicodedata

SCRATCH = "/tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad"
EXAMS = "/home/user/portfolio/_data/exams.json"

with open(EXAMS, encoding="utf-8") as f:
    data = json.load(f)
biblio = data["citations"]

with open(f"{SCRATCH}/new_entries_preview.json", encoding="utf-8") as f:
    scoped_keys = set(json.load(f).keys())

def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))

def lastname_of(entry):
    head = entry
    for q in ['“', '"', "'", '‘']:
        head = head.lstrip(q)
    surname = re.split(r"[,.]", head, 1)[0].strip()
    surname = strip_accents(surname)
    return re.sub(r"[^A-Za-z]", "", surname).lower()

def year_of(entry):
    m = re.search(r"https?://", entry)
    head = entry[: m.start()] if m else entry
    years = re.findall(r"(?:1[5-9]|20)\d{2}", head) or re.findall(r"(?:1[5-9]|20)\d{2}", entry)
    return years[-1] if years else "nd"

def normalize_title(t):
    t = t.lower()
    t = re.sub(r"[^a-z0-9 ]", "", t)
    return re.sub(r"\s+", " ", t).strip()

def extract_title(entry):
    m = re.search(r"[“‘\"']([^”’\"']+)[”’\"']", entry)
    if m:
        return normalize_title(m.group(1))
    parts = entry.split(". ")
    if len(parts) >= 2:
        return normalize_title(parts[1])
    return ""

groups = {}
for key in scoped_keys:
    entry = biblio[key]
    ln = lastname_of(entry)
    yr = year_of(entry)
    ti = extract_title(entry)
    if not ti or len(ti) < 8:
        continue
    groups.setdefault((ln, yr, ti), []).append(key)

fold_groups = {k: v for k, v in groups.items() if len(v) > 1}
print("candidate merge groups:", len(fold_groups))
print("keys that will be folded away:", sum(len(v) - 1 for v in fold_groups.values()))

fold_map = {}
for (ln, yr, ti), keys in fold_groups.items():
    canonical = max(keys, key=lambda k: len(biblio[k]))
    for k in keys:
        if k != canonical:
            fold_map[k] = canonical

# Manual overrides: "longest text wins" picked a factually wrong publisher for
# these two groups (verified against real-world publication facts, not just
# internal text-length comparison). See design spec §1.
#
# 'Data Feminism' (D'Ignazio & Klein) is an MIT Press book; one chapter's
# citation wrongly lists "Minneapolis: University of Minnesota Press" (a
# mix-up with the Debates series' own usual publisher). Force the MIT Press
# variant to be canonical even though it's the shorter string.
fold_map['dignazio2020'] = 'dignazio2020a'
fold_map.pop('dignazio2020a', None)

# 'Ghost Work' (Gray & Suri) was published by Houghton Mifflin Harcourt; one
# chapter's citation wrongly lists "Harper Business". Force the Houghton
# Mifflin variant to be canonical even though it's marginally shorter.
fold_map['gray2019c'] = 'gray2019a'
fold_map.pop('gray2019a', None)

print("total folded keys (after overrides):", len(fold_map))

with open(f"{SCRATCH}/fold_map.json", "w", encoding="utf-8") as f:
    json.dump(fold_map, f, ensure_ascii=False, indent=2)
```

- [ ] **Step 2: Run it and verify the count**

```bash
python3 /tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad/compute_fold.py
```

Expected: `candidate merge groups: 37`, `keys that will be folded away: 50`, `total folded keys (after overrides): 50`.

If these numbers differ from 37/50/50, something about the underlying bibliography data changed since this plan was written — stop and re-derive the fold groups by hand-reviewing the printed group list (the design spec's fold rationale — merge only on exact-normalized-title match within the same author+year, prefer fullest/most complete text, override only where you can verify the "longer" text is factually wrong) before proceeding.

No commit for this task — scratch output only, consumed by Task 3.

---

### Task 3: Restructure `_data/exams.json` — split debates-23 into 27 chapters

**Files:**
- Create (scratch): `/tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad/apply_chapter_split.py`
- Modify: `/home/user/portfolio/_data/exams.json`

**Interfaces:**
- Consumes: `chapter_keys.json` (Task 1), `fold_map.json` (Task 2).
- Produces: 27 new book entries with `partOf: "debates-23"` in `_data/exams.json`, consumed by Tasks 4–8's JS code (which reads `partOf` at runtime) and by Task 9's manual QA.

- [ ] **Step 1: Write the script**

```python
import json

SCRATCH = "/tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad"
EXAMS = "/home/user/portfolio/_data/exams.json"

CHAPTERS = [
    (1, "Toward a Political Economy of Digital Humanities", "Hannah, Matthew N.", "dh-field-methods"),
    (2, "All the Work You Do Not See: Labor, Digitizers, and the Foundations of Digital Humanities", "Smith, Astrid J. and Bridget Whearty", "dh-field-methods"),
    (3, "Right-to-Left (RTL) Text: Digital Humanists Plus Half a Billion Users", "Ghorbaninejad, Masoud, Nathan P. Gibson, and David Joseph Wrisley", "media-tech-theory"),
    (4, "Relation-Oriented AI: Why Indigenous Protocols Matter for the Digital Humanities", "Brown, Michelle Lee, Hēmi Whaanga, and Jason Edward Lewis", "data-algorithmic-justice"),
    (5, "A U.S. Latinx Digital Humanities Manifesto", "Baeza Ventura, Gabriela, María Eugenia Cotera, Linda García Merchant, Lorena Gauthereau, and Carolina Villarroel", "dh-field-methods"),
    (6, "The Body Is Not (Only) a Metaphor: Rethinking Embodiment in DH", "Bench, Harmony and Kate Elswit", "dh-field-methods"),
    (7, "The Queer Gap in Cultural Analytics", "Chang, Kent K.", "data-algorithmic-justice"),
    (8, "The Feminist Data Manifest-NO: An Introduction and Four Reflections", "Sutherland, Tonia, Marika Cifor, T. L. Cowan, Jas Rault, and Patricia Garcia", "data-algorithmic-justice"),
    (9, "Black Is Not the Absence of Light: Restoring Black Visibility and Liberation to Digital Humanities", "Frazier, Nishani, Christy Hyman, and Hilary N. Green", "dh-field-methods"),
    (10, "Digital Humanities in the Deepfake Era", "Gibson, Abraham", "media-tech-theory"),
    (11, "Operationalizing Surveillance Studies in the Digital Humanities", "Boyles, Christina, Andrew Boyles Petersen, and Arun Jacob", "data-algorithmic-justice"),
    (12, "A Voice Interrupts: Digital Humanities as a Tool to Hear Black Life", "Martin, Alison", "data-algorithmic-justice"),
    (13, "Addressing an Emergency: The “Pragmatic Tilt” Required of Scholarship, Data, and Design by the Climate Crisis", "Guldi, Jo", "dh-field-methods"),
    (14, "Digital Art History as Disciplinary Practice", "Pugh, Emily", "postcolonial-visual-theory"),
    (15, "Building and Sustaining Africana Digital Humanities at HBCUs", "Chapman, Rico Devara", "dh-field-methods"),
    (16, "A Call to Research Action: Transnational Solidarity for Digital Humanists", "Quintanilla, Olivia and Jeanelle Horcasitas", "dh-field-methods"),
    (17, "Game Studies, Endgame?", "Salter, Anastasia and Mel Stanfill", "game-studies"),
    (18, "The Challenges and Possibilities of Social Media Data: New Directions in Literary Studies and the Digital Humanities", "Walsh, Melanie", "data-algorithmic-justice"),
    (19, "Language Is Not a Default Setting: Countering DH’s English Problem", "Dombrowski, Quinn and Patrick J. Burns", "dh-field-methods"),
    (20, "Librarians’ Illegible Labor: Toward a Documentary Practice of Digital Humanities", "Keralis, Spencer D. C., Rafia Mirza, and Maura Seale", "dh-field-methods"),
    (21, "Reframing the Conversation: Digital Humanists, Disabilities, and Accessibility", "Brett, Megan R., Jessica Marie Otis, and Mills Kelly", "dh-field-methods"),
    (22, "From Precedents to Collective Action: Realities and Recommendations for Digital Dissertations in History", "", "dh-field-methods"),
    (23, "Critique Is the Steam: Reorienting Critical Digital Humanities across Disciplines", "Malazita, James", "media-tech-theory"),
    (24, "Being Undisciplined: Black Womanhood in Digital Spaces", "Daut, Marlene L. and Annette K. Joseph-Gabriel", "dh-field-methods"),
    (25, "How This Helps Us Get Free: Telling Black Stories through Technology", "Gallon, Kim and Marisa Parham", "dh-field-methods"),
    (26, "“Blackness” in France: Taking Up Mediatized Space", "Soumahoro, Maboula and Mame-Fatou Niang", "postcolonial-visual-theory"),
    (27, "The Power to Create: Building Alternative (Digital) Worlds", "Jones, Martha S. and Jessica Marie Johnson", "dh-field-methods"),
]

with open(f"{SCRATCH}/chapter_keys.json", encoding="utf-8") as f:
    chapter_keys = json.load(f)

with open(f"{SCRATCH}/fold_map.json", encoding="utf-8") as f:
    fold_map = json.load(f)

def resolve(key):
    seen = set()
    while key in fold_map and key not in seen:
        seen.add(key)
        key = fold_map[key]
    return key

with open(EXAMS, encoding="utf-8") as f:
    data = json.load(f)

biblio = data["citations"]
books = data["books"]

for old, new in fold_map.items():
    assert old in biblio, f"fold source missing from biblio: {old}"
    assert resolve(old) in biblio, f"fold target missing from biblio: {resolve(old)}"

resolved_chapter_keys = {}
for ch_str, keys in chapter_keys.items():
    resolved = sorted({resolve(k) for k in keys})
    resolved_chapter_keys[int(ch_str)] = resolved
    assert resolved, f"chapter {ch_str} ended up with zero citations"

folded_away = set(fold_map.keys())
referenced_elsewhere = set()
for b in books:
    if b["id"] == "debates-23":
        continue
    for entry in b.get("citations", []):
        key = entry if isinstance(entry, str) else entry["key"]
        referenced_elsewhere.add(key)
for keys in resolved_chapter_keys.values():
    referenced_elsewhere.update(keys)

safe_to_drop = folded_away - referenced_elsewhere
unsafe = folded_away & referenced_elsewhere
assert not unsafe, f"fold-away keys still referenced, would corrupt data: {unsafe}"
for k in safe_to_drop:
    del biblio[k]
print(f"dropped {len(safe_to_drop)} folded-away bibliography entries")

parent = next(b for b in books if b["id"] == "debates-23")
parent["type"] = "Book/Anthology"
parent["citations"] = []

new_chapters = []
for num, title, author, subject in CHAPTERS:
    cid = f"debates23-ch{num:02d}"
    new_chapters.append({
        "id": cid,
        "title": title,
        "author": author,
        "year": 2023,
        "field": parent["field"],
        "subject": subject,
        "lcsh": [],
        "container": parent["title"],
        "type": "Chapter",
        "publisher": "",
        "citations": resolved_chapter_keys[num],
        "categories": [],
        "selected": True,
        "partOf": "debates-23",
    })

parent_index = books.index(parent)
books[parent_index + 1:parent_index + 1] = new_chapters

with open(EXAMS, "w", encoding="utf-8") as f:
    f.write(json.dumps(data, ensure_ascii=False, indent=2))

print(f"wrote {EXAMS}")
print(f"books: {len(books)} (was {len(books) - 27})")
print(f"bibliography entries: {len(biblio)}")
```

- [ ] **Step 2: Run it**

```bash
python3 /tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad/apply_chapter_split.py
```

Expected: `dropped 50 folded-away bibliography entries`, `books: 116 (was 89)`, `bibliography entries: 13610`.

- [ ] **Step 3: Verify structural integrity**

```bash
cd /home/user/portfolio
python3 -c "
import json
data = json.load(open('_data/exams.json', encoding='utf-8'))
biblio = set(data['citations'].keys())
books = data['books']
ids = [b['id'] for b in books]
assert len(ids) == len(set(ids)), 'duplicate book ids!'
missing = []
for b in books:
    for entry in b.get('citations', []):
        key = entry if isinstance(entry, str) else entry['key']
        if key not in biblio:
            missing.append((b['id'], key))
assert not missing, f'dangling citation refs: {missing}'
parent = next(b for b in books if b['id'] == 'debates-23')
assert parent['citations'] == [] and parent['type'] == 'Book/Anthology'
chapters = [b for b in books if b.get('partOf') == 'debates-23']
assert len(chapters) == 27
assert all(c['type'] == 'Chapter' and c['publisher'] == '' and c['categories'] == [] and c['selected'] is True for c in chapters)
assert all(c['citations'] for c in chapters), 'a chapter ended up with zero citations'
print('all structural checks passed')
print('books:', len(books), '| bibliography:', len(biblio), '| chapters:', len(chapters))
"
```

Expected: `all structural checks passed`, `books: 116 | bibliography: 13610 | chapters: 27`. If any assertion fails, do not proceed — the JSON is in a bad state and must be fixed before Task 4.

- [ ] **Step 4: Jekyll build sanity check**

```bash
bundle exec jekyll build
```

Expected: build completes with no new errors (the pre-existing `slieve-gullion` destination-conflict warning is unrelated and expected).

- [ ] **Step 5: Commit**

```bash
git add _data/exams.json
git commit -m "exams data: split Debates in the Digital Humanities 2023 into 27 chapter entries, fold near-duplicate citations"
```

---

### Task 4: index.html — CSS, color constants, chapter tagging, `mainBooks`

**Files:**
- Modify: `phd/exams/index.html` (CSS ~line 140-146, script ~line 711-757)

**Interfaces:**
- Consumes: `partOf` field on chapter book entries (Task 3).
- Produces: `CHAPTER_FILL`, `CHAPTER_STROKE` constants; `nodeType: 'chapter'` tag on every book with a `partOf`; `mainBooks` array — all consumed by Tasks 5-8.

- [ ] **Step 1: Add the `.exams-link-partof` CSS rule**

Find:
```css
.exams-link-cite {
  stroke: rgb(163, 122, 8);
  stroke-width: 1.2;
  stroke-opacity: 0.45;
}
```
Replace with:
```css
.exams-link-cite {
  stroke: rgb(163, 122, 8);
  stroke-width: 1.2;
  stroke-opacity: 0.45;
}

.exams-link-partof {
  stroke: rgb(70, 90, 140);
  stroke-width: 2;
  stroke-opacity: 0.5;
}
```

- [ ] **Step 2: Add chapter fill/stroke color constants**

Find:
```js
  const UNSELECTED_FILL = 'rgba(120, 120, 120, 0.14)';
  const UNSELECTED_STROKE = 'rgba(120, 120, 120, 0.45)';
```
Replace with:
```js
  const UNSELECTED_FILL = 'rgba(120, 120, 120, 0.14)';
  const UNSELECTED_STROKE = 'rgba(120, 120, 120, 0.45)';

  // Chapter sub-nodes (books with a `partOf` parent) get their own third
  // color family, distinct from both the category fills and the "unselected
  // field text" gray — that gray already means something else (a core-list
  // text the user declined to read), which doesn't apply to chapters.
  const CHAPTER_FILL = 'rgba(70, 90, 140, 0.18)';
  const CHAPTER_STROKE = 'rgb(70, 90, 140)';
```

- [ ] **Step 3: Tag chapter nodes at load time and add the `mainBooks` array**

Find:
```js
  const books = EXAMS_DATA.books;
  const citations = EXAMS_DATA.citations;
  const bookById = {};
  books.forEach(b => { bookById[b.id] = b; });
```
Replace with:
```js
  const books = EXAMS_DATA.books;
  const citations = EXAMS_DATA.citations;
  const bookById = {};
  books.forEach(b => { bookById[b.id] = b; });

  // Books with a `partOf` value are chapters of a larger anthology (see
  // debates-23's 27 chapter entries). They're tagged nodeType: 'chapter' here
  // (parallel to citation-hub nodes' nodeType: 'citation') so the rest of the
  // code can treat them as a third node kind: still real book-circle nodes
  // with their own detail panel, but excluded from the "every book,
  // flattened" aggregate views below via `mainBooks`.
  books.forEach(b => { if (b.partOf) b.nodeType = 'chapter'; });
  function familyId(id) { const b = bookById[id]; return (b && b.partOf) || id; }
  const mainBooks = books.filter(b => b.nodeType !== 'chapter');
```

- [ ] **Step 4: Syntax check**

```bash
sed -n '/^<script>$/,/^<\/script>$/p' phd/exams/index.html | \
  grep -v '^<script>$' | grep -v '^</script>$' | \
  sed '1,2d' | sed '1i const EXAMS_DATA = {}; const EXAMS_VOCAB = {};' \
  > /tmp/exams-script-check.js
node --check /tmp/exams-script-check.js
```
Expected: no output.

- [ ] **Step 5: Confirm the changes landed**

```bash
grep -n "CHAPTER_FILL\|CHAPTER_STROKE\|exams-link-partof\|nodeType = 'chapter'\|function familyId\|const mainBooks" phd/exams/index.html
```
Expected: one match for each.

- [ ] **Step 6: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: chapter-node color constants, partOf tagging, mainBooks filter"
```

---

### Task 5: index.html — `rebuildCitationGraph()`: partOfEdges, sibling-edge skip, family-based hub threshold

**Files:**
- Modify: `phd/exams/index.html` (script ~line 767-850)

**Interfaces:**
- Consumes: `familyId()` (Task 4).
- Produces: `partOfEdges` array, `citationToFamilies` map — consumed by Tasks 6-7.

- [ ] **Step 1: Build `citationToFamilies` alongside the existing `citationToBooks`**

Find:
```js
  const citationToBooks = {};
  const citationTypeCounts = {};
  books.forEach(b => {
    (b.citations || []).forEach(entry => {
      const key = citationKey(entry);
      if (!citationToBooks[key]) citationToBooks[key] = [];
      citationToBooks[key].push(b.id);
      const type = citationType(entry);
      if (!type) return;
      if (!citationTypeCounts[key]) citationTypeCounts[key] = {};
      citationTypeCounts[key][type] = (citationTypeCounts[key][type] || 0) + 1;
    });
  });
```
Replace with:
```js
  const citationToBooks = {};
  const citationToFamilies = {};
  const citationTypeCounts = {};
  books.forEach(b => {
    (b.citations || []).forEach(entry => {
      const key = citationKey(entry);
      if (!citationToBooks[key]) citationToBooks[key] = [];
      citationToBooks[key].push(b.id);
      // A "family" collapses an anthology's chapters back to one voter for
      // hub-threshold purposes (see rebuildCitationGraph's establishedKeys),
      // so a citation reused across several chapters of the same volume
      // can't alone cross the threshold the way genuinely independent books
      // citing it would. citationToBooks itself is untouched — the hub's
      // spoke list (citedBy) still shows every individual citing chapter.
      if (!citationToFamilies[key]) citationToFamilies[key] = new Set();
      citationToFamilies[key].add(familyId(b.id));
      const type = citationType(entry);
      if (!type) return;
      if (!citationTypeCounts[key]) citationTypeCounts[key] = {};
      citationTypeCounts[key][type] = (citationTypeCounts[key][type] || 0) + 1;
    });
  });
```

- [ ] **Step 2: Switch the hub-promotion threshold to family-based counting**

Find:
```js
  function establishedKeys() {
    return Object.keys(citationToBooks).filter(k => citationToBooks[k].length >= recoThreshold);
  }
```
Replace with:
```js
  function establishedKeys() {
    return Object.keys(citationToBooks).filter(k => citationToFamilies[k].size >= recoThreshold);
  }
```

- [ ] **Step 3: Skip sibling (same-anthology) pairs when building shared-citation edges, and add `partOfEdges`**

Find:
```js
    const bookEdgeMap = {};
    Object.keys(citationToBooks).forEach(key => {
      if (established.has(key)) return;
      const ids = citationToBooks[key];
      if (ids.length < 2) return;
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const pairKey = [ids[i], ids[j]].sort().join('|||');
          if (!bookEdgeMap[pairKey]) {
            bookEdgeMap[pairKey] = { source: ids[i], target: ids[j], sharedCount: 0, sharedKeys: [] };
          }
          bookEdgeMap[pairKey].sharedCount += 1;
          bookEdgeMap[pairKey].sharedKeys.push(key);
        }
      }
    });
    bookEdges = Object.values(bookEdgeMap);

    citeEdges = [];
    citationNodes.forEach(node => {
      node.citedBy.forEach(bookId => { citeEdges.push({ source: node.id, target: bookId }); });
    });
  }
  rebuildCitationGraph();
```
Replace with:
```js
    const bookEdgeMap = {};
    Object.keys(citationToBooks).forEach(key => {
      if (established.has(key)) return;
      const ids = citationToBooks[key];
      if (ids.length < 2) return;
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          // Siblings (chapters of the same anthology) constantly cite the
          // same cross-references within their own volume — that relatedness
          // is already shown by the partOf spokes below, so skip it here to
          // avoid a dense, uninformative clique on top of those spokes.
          const familyI = familyId(ids[i]);
          const familyJ = familyId(ids[j]);
          if (familyI === familyJ && familyI !== ids[i]) continue;
          const pairKey = [ids[i], ids[j]].sort().join('|||');
          if (!bookEdgeMap[pairKey]) {
            bookEdgeMap[pairKey] = { source: ids[i], target: ids[j], sharedCount: 0, sharedKeys: [] };
          }
          bookEdgeMap[pairKey].sharedCount += 1;
          bookEdgeMap[pairKey].sharedKeys.push(key);
        }
      }
    });
    bookEdges = Object.values(bookEdgeMap);

    citeEdges = [];
    citationNodes.forEach(node => {
      node.citedBy.forEach(bookId => { citeEdges.push({ source: node.id, target: bookId }); });
    });

    partOfEdges = books
      .filter(b => b.partOf)
      .map(b => ({ source: b.id, target: b.partOf }));
  }
  rebuildCitationGraph();
```

- [ ] **Step 4: Declare `partOfEdges` alongside the other edge arrays**

Find:
```js
  let recoThreshold = 4;
  let minSharedThreshold = 2;
  let citationNodes = [];
  let bookEdges = [];
  let citeEdges = [];
```
Replace with:
```js
  let recoThreshold = 4;
  let minSharedThreshold = 2;
  let citationNodes = [];
  let bookEdges = [];
  let citeEdges = [];
  let partOfEdges = [];
```

- [ ] **Step 5: Syntax check** (same command as Task 4 Step 4). Expected: no output.

- [ ] **Step 6: Confirm the changes landed**

```bash
grep -n "citationToFamilies\|partOfEdges\|familyI === familyJ" phd/exams/index.html
```
Expected: several matches (declaration, population in the two loops, the family-based threshold check, and the sibling-skip line).

- [ ] **Step 7: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: partOfEdges, sibling-edge skip, family-based hub threshold"
```

---

### Task 6: index.html — force simulation, render layer, tick handler, chapter fill

**Files:**
- Modify: `phd/exams/index.html` (script ~line 883-1015, ~938-959)

**Interfaces:**
- Consumes: `partOfEdges` (Task 5), `CHAPTER_FILL`/`CHAPTER_STROKE` (Task 4).
- Produces: `partOfLink` selection — consumed by Task 7 (`applyVisibility`, `focusNode`/`clearFocus`).

- [ ] **Step 1: Add the `linkPartOf` force**

Find:
```js
  const sim = d3.forceSimulation(allNodes())
    .force('link', d3.forceLink(currentBookEdges()).id(d => d.id).distance(currentDistance()).strength(0.4))
    .force('linkCite', d3.forceLink(citeEdges).id(d => d.id).distance(currentDistance()).strength(0.5))
    .force('charge', d3.forceManyBody().strength(currentForce()))
    .force('center', d3.forceCenter(W() / 2, H() / 2))
    .force('collision', d3.forceCollide(d => nodeRadius(d.id) + 28))
    .force('x', d3.forceX(SIM_W / 2).strength(centerStrength))
    .force('y', d3.forceY(SIM_H / 2).strength(centerStrength));
```
Replace with:
```js
  // partOf spokes are a structural, not content-similarity, relationship —
  // fixed short distance and strong pull (not slider-controlled like the
  // other two link types) so chapters visibly cluster tight around their
  // anthology regardless of the distance/force slider settings.
  const PARTOF_DISTANCE = 60;
  const PARTOF_STRENGTH = 0.8;

  const sim = d3.forceSimulation(allNodes())
    .force('link', d3.forceLink(currentBookEdges()).id(d => d.id).distance(currentDistance()).strength(0.4))
    .force('linkCite', d3.forceLink(citeEdges).id(d => d.id).distance(currentDistance()).strength(0.5))
    .force('linkPartOf', d3.forceLink(partOfEdges).id(d => d.id).distance(PARTOF_DISTANCE).strength(PARTOF_STRENGTH))
    .force('charge', d3.forceManyBody().strength(currentForce()))
    .force('center', d3.forceCenter(W() / 2, H() / 2))
    .force('collision', d3.forceCollide(d => nodeRadius(d.id) + 28))
    .force('x', d3.forceX(SIM_W / 2).strength(centerStrength))
    .force('y', d3.forceY(SIM_H / 2).strength(centerStrength));
```

- [ ] **Step 2: Add the render layer declarations**

Find:
```js
  const linkLayer = g.append('g');
  const citeLinkLayer = g.append('g');
  const nodeLayer = g.append('g');
  let link = linkLayer.selectAll('line');
  let citeLink = citeLinkLayer.selectAll('line');
  let nodeG = nodeLayer.selectAll('g');
```
Replace with:
```js
  const linkLayer = g.append('g');
  const citeLinkLayer = g.append('g');
  const partOfLinkLayer = g.append('g');
  const nodeLayer = g.append('g');
  let link = linkLayer.selectAll('line');
  let citeLink = citeLinkLayer.selectAll('line');
  let partOfLink = partOfLinkLayer.selectAll('line');
  let nodeG = nodeLayer.selectAll('g');
```

- [ ] **Step 3: Join the `partOfLink` selection in `redrawGraph()`**

Find:
```js
    citeLink = citeLinkLayer.selectAll('line').data(citeEdges).join('line')
      .attr('class', 'exams-link-cite');

    nodeG = nodeLayer.selectAll('g').data(allNodes(), d => d.id).join(
```
Replace with:
```js
    citeLink = citeLinkLayer.selectAll('line').data(citeEdges).join('line')
      .attr('class', 'exams-link-cite');

    partOfLink = partOfLinkLayer.selectAll('line').data(partOfEdges).join('line')
      .attr('class', 'exams-link-partof');

    nodeG = nodeLayer.selectAll('g').data(allNodes(), d => d.id).join(
```

- [ ] **Step 4: Move `partOfLink` on every simulation tick**

Find:
```js
  sim.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    citeLink.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nodeG.attr('transform', d => `translate(${d.x},${d.y})`);
  });
```
Replace with:
```js
  sim.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    citeLink.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    partOfLink.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nodeG.attr('transform', d => `translate(${d.x},${d.y})`);
  });
```

- [ ] **Step 5: Give chapter nodes their distinct fill/stroke in `redrawNodeSizes()`**

Find:
```js
  function redrawNodeSizes() {
    nodeG.select('circle')
      .attr('r', d => nodeRadius(d.id))
      .attr('fill', d => d.selected === false ? UNSELECTED_FILL : CATEGORY_FILL[d.categories[0]])
      .attr('stroke', d => d.selected === false ? UNSELECTED_STROKE : null);
```
Replace with:
```js
  function redrawNodeSizes() {
    nodeG.select('circle')
      .attr('r', d => nodeRadius(d.id))
      .attr('fill', d => d.nodeType === 'chapter' ? CHAPTER_FILL : (d.selected === false ? UNSELECTED_FILL : CATEGORY_FILL[d.categories[0]]))
      .attr('stroke', d => d.nodeType === 'chapter' ? CHAPTER_STROKE : (d.selected === false ? UNSELECTED_STROKE : null));
```

- [ ] **Step 6: Syntax check** (same command as Task 4 Step 4). Expected: no output.

- [ ] **Step 7: Confirm the changes landed**

```bash
grep -n "PARTOF_DISTANCE\|PARTOF_STRENGTH\|linkPartOf\|partOfLinkLayer\|let partOfLink\|nodeType === 'chapter'" phd/exams/index.html
```
Expected: matches for each identifier (2+ for `partOfLink` — declaration and reassignment in redrawGraph).

- [ ] **Step 8: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: partOf force, render layer, tick handler, chapter node styling"
```

---

### Task 7: index.html — `recomputeDegree`, `rebuildAndRestart`, `applyVisibility`, focus wiring

**Files:**
- Modify: `phd/exams/index.html` (script ~line 860-878, ~1024-1074)

**Interfaces:**
- Consumes: `partOfLink`, `partOfEdges` (Task 6).
- Produces: nothing new — this task finishes wiring `partOfLink`/`partOfEdges` into the existing degree/visibility/focus machinery so chapters behave like every other edge-bearing node.

- [ ] **Step 1: Include `partOfEdges` in degree computation**

Find:
```js
    addEdges(currentBookEdges());
    addEdges(citeEdges);
    degree = {};
```
Replace with:
```js
    addEdges(currentBookEdges());
    addEdges(citeEdges);
    addEdges(partOfEdges);
    degree = {};
```

- [ ] **Step 2: Dim/restore `partOfLink` on node focus, matching `citeLink`**

Find:
```js
  function focusNode(d) {
    focusedNodeId = d.id;
    const neighbors = neighborSets[d.id] || new Set();
    nodeG.select('.exams-node-label').style('opacity', n => n.id === d.id ? 1 : 0);
    nodeG.style('opacity', n => n.id === d.id || neighbors.has(n.id) ? 1 : 0.12);
    link.style('opacity', l => (l.source.id === d.id || l.target.id === d.id) ? null : 0.05);
    citeLink.style('opacity', l => (l.source.id === d.id || l.target.id === d.id) ? null : 0.05);
  }

  function clearFocus() {
    focusedNodeId = null;
    nodeG.select('.exams-node-label').style('opacity', 0);
    nodeG.style('opacity', 1);
    link.style('opacity', null);
    citeLink.style('opacity', null);
  }
```
Replace with:
```js
  function focusNode(d) {
    focusedNodeId = d.id;
    const neighbors = neighborSets[d.id] || new Set();
    nodeG.select('.exams-node-label').style('opacity', n => n.id === d.id ? 1 : 0);
    nodeG.style('opacity', n => n.id === d.id || neighbors.has(n.id) ? 1 : 0.12);
    link.style('opacity', l => (l.source.id === d.id || l.target.id === d.id) ? null : 0.05);
    citeLink.style('opacity', l => (l.source.id === d.id || l.target.id === d.id) ? null : 0.05);
    partOfLink.style('opacity', l => (l.source.id === d.id || l.target.id === d.id) ? null : 0.05);
  }

  function clearFocus() {
    focusedNodeId = null;
    nodeG.select('.exams-node-label').style('opacity', 0);
    nodeG.style('opacity', 1);
    link.style('opacity', null);
    citeLink.style('opacity', null);
    partOfLink.style('opacity', null);
  }
```

- [ ] **Step 3: Hide `partOfLink` edges when either endpoint is hidden**

Find:
```js
  function applyVisibility() {
    nodeG.style('display', d => nodeVisible(d) ? null : 'none');
    link.style('display', d => (showLinks && categoryMatch(d.source.categories) && categoryMatch(d.target.categories)) ? null : 'none');
    citeLink.style('display', d => (nodeVisible(d.source) && nodeVisible(d.target)) ? null : 'none');
  }
```
Replace with:
```js
  function applyVisibility() {
    nodeG.style('display', d => nodeVisible(d) ? null : 'none');
    link.style('display', d => (showLinks && categoryMatch(d.source.categories) && categoryMatch(d.target.categories)) ? null : 'none');
    citeLink.style('display', d => (nodeVisible(d.source) && nodeVisible(d.target)) ? null : 'none');
    partOfLink.style('display', d => (nodeVisible(d.source) && nodeVisible(d.target)) ? null : 'none');
  }
```

- [ ] **Step 4: Rebuild and refresh the `linkPartOf` force on threshold-slider changes**

Find:
```js
  function rebuildAndRestart() {
    rebuildCitationGraph();
    recomputeDegree();
    sim.nodes(allNodes());
    sim.force('link', d3.forceLink(currentBookEdges()).id(d => d.id).distance(currentDistance()).strength(0.4));
    sim.force('linkCite', d3.forceLink(citeEdges).id(d => d.id).distance(currentDistance()).strength(0.5));
    sim.force('collision', d3.forceCollide(d => nodeRadius(d.id) + 28));
    redrawGraph();
    sim.alpha(0.6).restart();
    renderReadingList();
    renderStatsBar();
    if (matrixDrawn) drawMatrix();
  }
```
Replace with:
```js
  function rebuildAndRestart() {
    rebuildCitationGraph();
    recomputeDegree();
    sim.nodes(allNodes());
    sim.force('link', d3.forceLink(currentBookEdges()).id(d => d.id).distance(currentDistance()).strength(0.4));
    sim.force('linkCite', d3.forceLink(citeEdges).id(d => d.id).distance(currentDistance()).strength(0.5));
    sim.force('linkPartOf', d3.forceLink(partOfEdges).id(d => d.id).distance(PARTOF_DISTANCE).strength(PARTOF_STRENGTH));
    sim.force('collision', d3.forceCollide(d => nodeRadius(d.id) + 28));
    redrawGraph();
    sim.alpha(0.6).restart();
    renderReadingList();
    renderStatsBar();
    if (matrixDrawn) drawMatrix();
  }
```

- [ ] **Step 5: Syntax check** (same command as Task 4 Step 4). Expected: no output.

- [ ] **Step 6: Confirm the changes landed**

```bash
grep -c "partOfLink" phd/exams/index.html
```
Expected: `9` (declaration, redrawGraph join, tick handler, focusNode, clearFocus, applyVisibility, rebuildAndRestart's force call, plus the `partOfLinkLayer` line and the `let partOfLink` line already counted from Task 6 — if your count differs, diff against the Find/Replace blocks above rather than trusting this exact number, which is sensitive to exactly how many `partOfLink` substring occurrences exist).

- [ ] **Step 7: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: wire partOf edges into degree, focus, visibility, and rebuild"
```

---

### Task 8: index.html — exclude chapters from Reading List / stats bar / Matrix, add legend entry

**Files:**
- Modify: `phd/exams/index.html` (script ~line 792, ~1369-1391, ~1450-1469, ~1486-1497; HTML ~line 665)

**Interfaces:**
- Consumes: `mainBooks` (Task 4).
- Produces: nothing new — this is the last task that changes behavior; Task 9 is verification only.

- [ ] **Step 1: `populatedBookCount` counts only `mainBooks`**

Find:
```js
  const populatedBookCount = books.filter(b => (b.citations || []).length > 0).length;
```
Replace with:
```js
  const populatedBookCount = mainBooks.filter(b => (b.citations || []).length > 0).length;
```

- [ ] **Step 2: Reading List groups only `mainBooks`**

Find:
```js
  function renderReadingList() {
    const gridEl = document.getElementById('exams-subject-grid');
    if (!gridEl) return;
    const established = new Set(establishedKeys());
    const groups = {};
    books.forEach(b => {
```
Replace with:
```js
  function renderReadingList() {
    const gridEl = document.getElementById('exams-subject-grid');
    if (!gridEl) return;
    const established = new Set(establishedKeys());
    const groups = {};
    mainBooks.forEach(b => {
```

- [ ] **Step 3: Stats bar counts only `mainBooks`**

Find:
```js
    const stats = [
      [books.length, 'books'],
      [populatedBookCount, 'transcribed'],
      [SUBJECT_ORDER.length, 'subjects'],
      [bookEdges.length, 'shared-citation pairs'],
      [sharedSourceCount, 'shared sources']
    ];
    const coreBooks = books.filter(b => (b.categories || []).includes('core'));
```
Replace with:
```js
    const stats = [
      [mainBooks.length, 'books'],
      [populatedBookCount, 'transcribed'],
      [SUBJECT_ORDER.length, 'subjects'],
      [bookEdges.length, 'shared-citation pairs'],
      [sharedSourceCount, 'shared sources']
    ];
    const coreBooks = mainBooks.filter(b => (b.categories || []).includes('core'));
```

- [ ] **Step 4: Citation Matrix populates only `mainBooks`**

Find:
```js
  function matrixOrder() {
    const populated = books.filter(b => (b.citations || []).length > 0);
```
Replace with:
```js
  function matrixOrder() {
    const populated = mainBooks.filter(b => (b.citations || []).length > 0);
```

- [ ] **Step 5: Add the legend entry**

Find:
```js
      <span><span class="exams-legend-diamond"></span>Recommended: a citation shared by enough of the transcribed books to count as established infrastructure</span>
```
Replace with:
```js
      <span><span class="exams-legend-diamond"></span>Recommended: a citation shared by enough of the transcribed books to count as established infrastructure</span>
      <span><span class="exams-legend-dot" style="background: rgb(70, 90, 140)"></span>Anthology chapter: one essay of a multi-chapter volume (see spokes to its parent)</span>
```

Note: this line is inside `phd/exams/index.html`'s HTML body (`#exams-legend`), not the `<script>` block — the syntax-check pipeline in Step 7 won't cover it. Visually confirm it renders in Task 9.

- [ ] **Step 6: Syntax check** (same command as Task 4 Step 4). Expected: no output.

- [ ] **Step 7: Confirm the changes landed**

```bash
grep -n "mainBooks.forEach\|mainBooks.filter\|mainBooks.length\|Anthology chapter" phd/exams/index.html
```
Expected: 4 matches (renderReadingList, populatedBookCount + matrixOrder's two `mainBooks.filter` — so actually 2 `.filter` matches — plus `mainBooks.length`, plus the legend line: 5 total matches from this grep, spot-check the count against the actual file rather than trusting this number blindly).

- [ ] **Step 8: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: exclude chapters from reading list, stats bar, and matrix; add legend entry"
```

---

### Task 9: Full verification and manual visual QA

**Files:** none (verification only).

**Interfaces:** consumes the fully assembled result of Tasks 1-8.

- [ ] **Step 1: Full jekyll build**

```bash
bundle exec jekyll build
```
Expected: build completes with no new errors.

- [ ] **Step 2: Final structural re-check against the live file**

```bash
cd /home/user/portfolio
python3 -c "
import json
data = json.load(open('_data/exams.json', encoding='utf-8'))
biblio = set(data['citations'].keys())
books = data['books']
missing = [(b['id'], (e if isinstance(e, str) else e['key']))
           for b in books for e in b.get('citations', [])
           if (e if isinstance(e, str) else e['key']) not in biblio]
assert not missing, missing
chapters = [b for b in books if b.get('partOf') == 'debates-23']
assert len(chapters) == 27
parent = next(b for b in books if b['id'] == 'debates-23')
assert parent['citations'] == []
print('OK —', len(books), 'books,', len(chapters), 'chapters, 0 dangling refs')
"
```
Expected: `OK — 116 books, 27 chapters, 0 dangling refs`.

- [ ] **Step 3: Serve and load in a browser**

If a `jekyll serve` process is already running against this working tree, it picks up the change automatically; otherwise start one (`bundle exec jekyll serve`) and open `http://127.0.0.1:4000/phd/exams/`.

- [ ] **Step 4: Visual confirmation checklist**

This cannot be verified from the command line — report explicitly which of these were checked and which need the user's confirmation:
- The 27 `debates-23` chapter nodes render as small slate-blue circles, visibly clustered tight around a single larger node (the anthology itself, colored normally per its category).
- Hovering/clicking a chapter node opens the normal book detail panel (title, author, "Container: Debates in the Digital Humanities 2023", citation list) — not the citation-hub panel.
- The Reading List tab does NOT show any of the 27 chapters as separate rows.
- The stats bar's book/transcribed counts read 89, not 116 (chapters excluded).
- The Citation Matrix is still 89×89, not 116×116.
- Existing behavior is unchanged: hover/click labels, click-to-highlight neighborhoods, auto-fit zoom, the citation-hub diamonds and their gold spokes, category/subject filtering, the force/distance/reco/min-shared sliders.
- The new legend line (slate-blue dot, "Anthology chapter...") is visible and correctly styled.

- [ ] **Step 5: Report**

Summarize what was verified programmatically (Steps 1-2) vs. what needs the user's visual confirmation (Step 4). Do not claim the graph "looks correct" without either browser access or explicit user confirmation.
