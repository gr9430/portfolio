# Exams Graph: Link Book Nodes to Their Own Citation Key — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a book on the reading list is also cited by other transcribed books (e.g. Foucault's *The Order of Things*, cited by `haraway-cyborgs`/`orientalism`/`hayles-posthuman`), route those citations to the real book node instead of promoting a redundant synthetic "recommended" diamond for a work that's already on the list.

**Architecture:** One data change (a `citationKey` field on 35 already-curated book entries, plus 11 additional near-duplicate citation folds the curation surfaced) and one small code change confined entirely to `rebuildCitationGraph()` in `phd/exams/index.html`: a reverse lookup from citation key to book id, and three call sites that consult it. No new edge type, no new rendering layer — linked citations are pushed into the existing `citeEdges` array with their `target` set to a real book id instead of a synthetic `'cite::' + key` id, so degree computation, focus-dimming, visibility toggling, and the gold `.exams-link-cite` styling all handle them automatically.

**Tech Stack:** Python 3 (one-off data migration script, not committed), vanilla JS (existing `phd/exams/index.html` IIFE).

**Design spec:** `docs/superpowers/specs/2026-07-18-exams-graph-book-citation-linking-design.md`

## Global Constraints

- The data-migration Python script in Task 1 is a one-off tool run from the shell — it is NOT committed to the repo. Only the resulting `_data/exams.json` diff is committed.
- All `phd/exams/index.html` edits are within `rebuildCitationGraph()` and the citation-indexing block immediately above it — no other function changes, matching the design's claim that degree/focus/visibility/rendering all handle the new `citeEdges` entries generically with no changes of their own.
- Each citation key links to at most one book — enforced by the curated data below (verified: `_data/exams.json`'s `citationKey` values are pairwise distinct), not by runtime code.
- `citationKey` does not affect `populatedBookCount`, `mainBooks` filtering, or the Reading List's "transcribed" stats — a linked book's own `citations` array is untouched by this plan.
- The syntax-check pipeline (run after the code task):
```bash
sed -n '/^<script>$/,/^<\/script>$/p' phd/exams/index.html | \
  grep -v '^<script>$' | grep -v '^</script>$' | \
  sed '1,2d' | sed '1i const EXAMS_DATA = {}; const EXAMS_VOCAB = {};' \
  > /tmp/exams-script-check.js
node --check /tmp/exams-script-check.js
```
Expect no output (syntax OK).

---

### Task 1: Data — additional citation folds and `citationKey` links

**Files:**
- Create (scratch, not committed): `/tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad/apply_citation_links.py`
- Modify: `/home/user/portfolio/_data/exams.json`

**Interfaces:**
- Consumes: nothing from another task.
- Produces: `citationKey` field on 35 book entries in `_data/exams.json`, consumed at runtime by Task 2's JS code (which reads `b.citationKey`).

- [ ] **Step 1: Write the script**

```python
import json

EXAMS = "/home/user/portfolio/_data/exams.json"

# Additional near-duplicate folds surfaced during citation-key curation -- same
# name-order-style blind spot disclosed in the corpus-wide fold pass (a citation
# in "Lastname, First" style and one in "First Lastname" style extract different
# lastnames, so the automated pass never bucketed them together). All manually
# verified to be the same work (translation/edition variance) before merging.
ADDITIONAL_FOLD_MAP = {
    "baudrillard1981": "baudrillard1994",           # Simulacra and Simulation: French orig -> English trans.
    "bolter2001": "bolterwritingspace1991",          # Writing Space: two editions
    "dignazio2020a": "dignazio2020b",                # Data Feminism: name-format variant
    "dignazio2019": "dignazio2020b",                 # Data Feminism: year variant
    "eubanks2018": "eubanks2017",                    # Automating Inequality: printing variant
    "noble2018": "noble2018a",                       # Algorithms of Oppression: publisher-name variant
    "said1978": "saidorientalism1979",               # Orientalism: two editions
    "kuhn1996": "kuhn2012a",                         # Structure of Scientific Revolutions: two editions
    "hayles2008": "hayles2008b",                     # Electronic Literature (Hayles): formatting variant
    "benjamin2019": "benjamin2019i",                 # Race After Technology: publisher-city variant
    "benjamin2019a": "benjamin2019i",                # Race After Technology: publisher-city variant
}

# Book id -> the book's own citation key, found by matching each of the 89 books'
# (author, title) against the bibliography using a same-lastname candidate search
# (trying both "Lastname, First" and "First Lastname" extraction) followed by
# manual title verification. Two of these (foucault-order, benjamin-reproduction)
# were already found and folded in prior commits this session; included here for
# completeness of the citationKey field addition, which hadn't been applied yet.
CITATION_KEY_LINKS = {
    "foucault-order": "foucaultorderofthings1973",
    "benjamin-reproduction": "benjamin2008",
    "barthes-image-music-text": "barthes1977",
    "baudrillard-simulacra": "baudrillard1994",
    "bolter-space": "bolterwritingspace1991",
    "chun-same": "chun2016",
    "costanza-chock-justice": "costanzachock2020",
    "data-feminism": "dignazio2020b",
    "eubanks-inequality": "eubanks2017",
    "hall-e-d": "hall1980",
    "haraway-cyborgs": "haraway1991",
    "hayles-posthuman": "hayles1999",
    "actor-network": "latour2007",
    "nakamura-digitizing": "nakamura2008",
    "noble": "noble2018a",
    "ong": "ong2002",
    "risam-poco-dh": "risam2019a",
    "orientalism": "saidorientalism1979",
    "new-media": "wardripfruin2003",
    "consalvo": "consalvo2019",
    "drucker-word": "drucker1994",
    "ensslin-literary-gaming": "ensslin2014",
    "twine-revolution": "harvey2014",
    "electronic-literature": "hayles2008b",
    "experimental-games": "jagoda2020",
    "jenkins-game-design": "jenkins2004",
    "hamlet-holodeck": "murray1998",
    "critical-making": "ratto2011",
    "e-lit": "rettberg2019",
    "benjamin-race-tech": "benjamin2019i",
    "cohen-rosenzweig-digital-history": "cohen2005b",
    "gray-intersectional-tech": "gray2020a",
    "jackson-hashtagactivism": "jackson2020",
    "kuhn-structure-scientific-revolutions": "kuhn2012a",
    "losh-wernimont-bodies-of-information": "losh2018a",
}


def key_of(entry):
    return entry if isinstance(entry, str) else entry["key"]


def apply(exams_path):
    with open(exams_path, encoding="utf-8") as f:
        data = json.load(f)
    biblio = data["citations"]
    books = data["books"]

    def resolve(key):
        seen = set()
        while key in ADDITIONAL_FOLD_MAP and key not in seen:
            seen.add(key)
            key = ADDITIONAL_FOLD_MAP[key]
        return key

    changed_books = 0
    for b in books:
        cites = b.get("citations", [])
        if not cites:
            continue
        new_cites = []
        seen_keys = set()
        touched = False
        for entry in cites:
            k = key_of(entry)
            r = resolve(k)
            if r != k:
                touched = True
            if r in seen_keys:
                touched = True
                continue
            seen_keys.add(r)
            if isinstance(entry, str):
                new_cites.append(r)
            else:
                e2 = dict(entry)
                e2["key"] = r
                new_cites.append(e2)
        if touched:
            b["citations"] = new_cites
            changed_books += 1

    referenced = set()
    for b in books:
        for entry in b.get("citations", []):
            referenced.add(key_of(entry))
    dropped = 0
    for k in ADDITIONAL_FOLD_MAP:
        assert k not in referenced, f"{k} still referenced, bug"
        if k in biblio:
            del biblio[k]
            dropped += 1

    book_by_id = {b["id"]: b for b in books}
    linked = 0
    for book_id, ckey in CITATION_KEY_LINKS.items():
        assert book_id in book_by_id, f"unknown book id: {book_id}"
        assert ckey in biblio, f"citation key resolved away or missing: {ckey}"
        book_by_id[book_id]["citationKey"] = ckey
        linked += 1

    with open(exams_path, "w", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False, indent=2))

    print(f"additional fold: {changed_books} books changed, {dropped} bibliography entries dropped")
    print(f"citationKey links added: {linked}")
    print(f"final bibliography size: {len(biblio)}")


if __name__ == "__main__":
    apply(EXAMS)
```

- [ ] **Step 2: Run it**

```bash
python3 /tmp/claude-1000/-home-user-portfolio/d86ecdfd-f031-4f2d-b37c-5570a259e363/scratchpad/apply_citation_links.py
```

Expected: `additional fold: 19 books changed, 11 bibliography entries dropped`, `citationKey links added: 35`, `final bibliography size: 13393`.

- [ ] **Step 3: Verify structural integrity**

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
assert not missing, f'dangling refs: {missing}'
linked = [b for b in books if b.get('citationKey')]
assert len(linked) == 35, f'expected 35 linked books, got {len(linked)}'
ckeys = [b['citationKey'] for b in linked]
assert len(ckeys) == len(set(ckeys)), 'a citation key is linked to more than one book'
for b in linked:
    assert b['citationKey'] in biblio, f\"{b['id']}'s citationKey {b['citationKey']!r} not in bibliography\"
print('all structural checks passed —', len(linked), 'linked books, 0 dangling refs, 0 duplicate links')
"
```
Expected: `all structural checks passed — 35 linked books, 0 dangling refs, 0 duplicate links`.

- [ ] **Step 4: Jekyll build sanity check**

```bash
bundle exec jekyll build
```
Expected: build completes with no new errors (the pre-existing `slieve-gullion` destination-conflict warning is unrelated and expected).

- [ ] **Step 5: Commit**

```bash
git add _data/exams.json
git commit -m "exams data: link 35 book nodes to their own citation key, fold 11 more near-duplicates"
```

---

### Task 2: Code — retarget citations of linked books in `rebuildCitationGraph()`

**Files:**
- Modify: `phd/exams/index.html` (script ~line 791-894)

**Interfaces:**
- Consumes: `citationKey` field on book entries (Task 1).
- Produces: `citationKeyToBookId` lookup — used only within this task's own edits; no other function needs to reference it, since the retargeted edges land in the pre-existing `citeEdges` array that every other function already consumes generically.

- [ ] **Step 1: Add the `citationKeyToBookId` reverse lookup**

Find:
```js
      const type = citationType(entry);
      if (!type) return;
      if (!citationTypeCounts[key]) citationTypeCounts[key] = {};
      citationTypeCounts[key][type] = (citationTypeCounts[key][type] || 0) + 1;
    });
  });

  // A citation's "type" (fiction/academic/online/etc.) is only recorded by
```
Replace with:
```js
      const type = citationType(entry);
      if (!type) return;
      if (!citationTypeCounts[key]) citationTypeCounts[key] = {};
      citationTypeCounts[key][type] = (citationTypeCounts[key][type] || 0) + 1;
    });
  });

  // Books that are themselves cited by other transcribed books (e.g. Foucault's
  // The Order of Things, cited by haraway-cyborgs/orientalism/hayles-posthuman)
  // carry a `citationKey` pointing at their own bibliography entry. This reverse
  // lookup lets rebuildCitationGraph route citations of that key straight to the
  // real book node instead of promoting a redundant synthetic diamond for a work
  // that's already on the reading list.
  const citationKeyToBookId = {};
  books.forEach(b => { if (b.citationKey) citationKeyToBookId[b.citationKey] = b.id; });

  // A citation's "type" (fiction/academic/online/etc.) is only recorded by
```

- [ ] **Step 2: Exclude linked keys from hub promotion**

Find:
```js
  function establishedKeys() {
    return Object.keys(citationToBooks).filter(k => citationToFamilies[k].size >= recoThreshold);
  }
```
Replace with:
```js
  function establishedKeys() {
    return Object.keys(citationToBooks).filter(k => !citationKeyToBookId[k] && citationToFamilies[k].size >= recoThreshold);
  }
```

- [ ] **Step 3: Skip linked keys in the pairwise shared-citation loop**

Find:
```js
    const bookEdgeMap = {};
    Object.keys(citationToBooks).forEach(key => {
      if (established.has(key)) return;
```
Replace with:
```js
    const bookEdgeMap = {};
    Object.keys(citationToBooks).forEach(key => {
      if (established.has(key) || citationKeyToBookId[key]) return;
```

- [ ] **Step 4: Push direct edges to the linked book for every citing book**

Find:
```js
    citeEdges = [];
    citationNodes.forEach(node => {
      node.citedBy.forEach(bookId => { citeEdges.push({ source: node.id, target: bookId }); });
    });

    partOfEdges = books
```
Replace with:
```js
    citeEdges = [];
    citationNodes.forEach(node => {
      node.citedBy.forEach(bookId => { citeEdges.push({ source: node.id, target: bookId }); });
    });
    Object.keys(citationToBooks).forEach(key => {
      const linkedBookId = citationKeyToBookId[key];
      if (!linkedBookId) return;
      citationToBooks[key].forEach(bookId => { citeEdges.push({ source: bookId, target: linkedBookId }); });
    });

    partOfEdges = books
```

- [ ] **Step 5: Syntax check**

```bash
sed -n '/^<script>$/,/^<\/script>$/p' phd/exams/index.html | \
  grep -v '^<script>$' | grep -v '^</script>$' | \
  sed '1,2d' | sed '1i const EXAMS_DATA = {}; const EXAMS_VOCAB = {};' \
  > /tmp/exams-script-check.js
node --check /tmp/exams-script-check.js
```
Expected: no output.

- [ ] **Step 6: Confirm the changes landed**

```bash
grep -n "citationKeyToBookId" phd/exams/index.html
```
Expected: 4 matches (the declaration/population, the `establishedKeys` exclusion, the `bookEdgeMap` skip, and the `citeEdges` retarget).

- [ ] **Step 7: Commit**

```bash
git add phd/exams/index.html
git commit -m "exams graph: route citations of already-listed books to their own node"
```

---

### Task 3: Full verification and manual visual QA

**Files:** none (verification only).

**Interfaces:** consumes the fully assembled result of Tasks 1-2.

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
linked = [b for b in books if b.get('citationKey')]
assert len(linked) == 35
print('OK —', len(books), 'books,', len(linked), 'with a citationKey link, 0 dangling refs')
"
```
Expected: `OK — 116 books, 35 with a citationKey link, 0 dangling refs`.

- [ ] **Step 3: Serve and load in a browser**

If a `jekyll serve` process is already running against this working tree, it picks up the change automatically; otherwise start one (`bundle exec jekyll serve`) and open `http://127.0.0.1:4000/phd/exams/`.

- [ ] **Step 4: Visual confirmation checklist**

This cannot be verified from the command line — report explicitly which of these were checked and which need the user's confirmation:
- `foucault-order` and `benjamin-reproduction` are no longer isolated — each shows gold spokes to the (now three) books that cite it, and its node is visibly larger than a degree-0 node.
- `noble` (Algorithms of Oppression) shows gold spokes to all 13 citing books, including several `debates23-ch*` chapter nodes, and does NOT also appear as a separate gold diamond anywhere in the graph.
- No book that previously had a "Recommended" diamond spoke pointing at it now also has a duplicate pale `.exams-link` line to the same citing books (the `bookEdgeMap` skip in Task 2 Step 3 should have prevented this).
- The Citation Matrix and Reading List are unaffected (this plan touches only `rebuildCitationGraph()`, not `mainBooks`/`matrixOrder`/`renderReadingList`).
- Existing behavior is unchanged: hover/click labels, click-to-highlight neighborhoods, the `partOf` chapter spokes from the prior work, category/subject filtering, the force/distance/reco/min-shared sliders.

- [ ] **Step 5: Report**

Summarize what was verified programmatically (Steps 1-2) vs. what needs the user's visual confirmation (Step 4). Do not claim the graph "looks correct" without either browser access or explicit user confirmation.
