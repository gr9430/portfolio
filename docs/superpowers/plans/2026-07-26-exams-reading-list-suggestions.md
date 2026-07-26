# Exams Reading-List Suggestion Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A standalone, read-only script that reads `_data/exams.json` and prints two ranked lists — books whose citation-graph connectivity is in the bottom N% (candidates to reconsider) and outside sources cited by enough transcribed books to count as shared infrastructure but not yet on the reading list (candidates to add).

**Architecture:** Single Python module, `_tools/exams_suggestions.py`, reimplementing (and deliberately mirroring, for a future page-port) the graph-construction logic already used by `phd/exams/index.html`'s inline JS: citation→book index, citation→family index (chapters of a split anthology collapse to one voter), per-book effective-citations profile (a chapter-split anthology's parent inherits the union of its chapters' citations), pairwise degree/weight, percentile-based flagging, and hub-threshold-based add-candidates.

**Tech Stack:** Python 3 standard library only (`json`, `argparse`, `math`, `pathlib`). Tests with `pytest`, following the existing `_tools/tests/test_normalize_awg.py` convention (`sys.path.insert` + bare `import <module>`, one `TestX` class per function under test).

## Global Constraints

- No dependencies beyond the Python standard library (spec: Implementation Approach).
- No changes to `phd/exams/index.html`, `_data/exams.json`, or any other data file (spec: Out of Scope).
- Reads `_data/exams.json` read-only; all output goes to stdout (spec: CLI).
- Default `--percentile` is `0.15`; default `--hub-threshold` is `4` (spec: CLI).
- Chapters (`partOf` set) are never individually scored or flagged; only their parent anthology is, using the union of the parent's own citations and all its chapters' citations (spec: Universe).
- A book is excluded from scoring entirely if its effective citations (own + any chapters') are empty — never flagged as low-fit just because it hasn't been transcribed (spec: Universe).
- Add-candidates are drawn only from keys already in the `citations` dictionary, excluding any key that already belongs to a real book via that book's `citationKey` (spec: Add-candidates list).

---

### Task 1: Core key/family helpers

**Files:**
- Create: `_tools/exams_suggestions.py`
- Create: `_tools/tests/test_exams_suggestions.py`

**Interfaces:**
- Produces: `citation_key(entry: str | dict) -> str`, `family_id(book: dict) -> str`

- [ ] **Step 1: Write the failing tests**

```python
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))
import exams_suggestions as es


class TestCitationKey:
    def test_plain_string_entry(self):
        assert es.citation_key("foucault1977") == "foucault1977"

    def test_tagged_dict_entry(self):
        assert es.citation_key({"key": "croxall2018", "topic": "DH Overview"}) == "croxall2018"


class TestFamilyId:
    def test_book_without_partof_is_its_own_family(self):
        assert es.family_id({"id": "hayles-posthuman"}) == "hayles-posthuman"

    def test_chapter_family_is_its_parent(self):
        assert es.family_id({"id": "debates23-ch01", "partOf": "debates-23"}) == "debates-23"
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'exams_suggestions'` (the file doesn't exist yet).

- [ ] **Step 3: Write the minimal implementation**

```python
#!/usr/bin/env python3
"""
Suggest reading-list changes from the PhD exams citation graph.
Run from repo root: python3 _tools/exams_suggestions.py
No external dependencies.
"""


def citation_key(entry):
    """A book's `citations` array holds either plain string keys or
    {"key": ..., "topic": ...} objects (e.g. Drucker's Coursebook, tagged
    by chapter). Both forms resolve to the same underlying key here."""
    return entry if isinstance(entry, str) else entry["key"]


def family_id(book):
    """Chapters of a split anthology (partOf set) collapse to their
    parent's id for voting/threshold purposes; every other book is its
    own family."""
    return book.get("partOf") or book["id"]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add _tools/exams_suggestions.py _tools/tests/test_exams_suggestions.py
git commit -m "exams_suggestions: add citation_key/family_id helpers"
```

---

### Task 2: Citation index builder

**Files:**
- Modify: `_tools/exams_suggestions.py`
- Modify: `_tools/tests/test_exams_suggestions.py`

**Interfaces:**
- Consumes: `citation_key`, `family_id` (Task 1)
- Produces: `build_citation_index(books: list[dict]) -> tuple[dict[str, list[str]], dict[str, set[str]]]`, `build_citation_key_to_book_id(books: list[dict]) -> dict[str, str]`

- [ ] **Step 1: Write the failing tests**

```python
class TestBuildCitationIndex:
    def test_raw_citing_ids_include_each_chapter_individually(self):
        books = [
            {"id": "p-ch1", "partOf": "p", "citations": ["k6", "k5"]},
            {"id": "p-ch2", "partOf": "p", "citations": ["k6", "k7"]},
            {"id": "d", "citations": ["k6"]},
        ]
        citation_to_books, _ = es.build_citation_index(books)
        assert sorted(citation_to_books["k6"]) == ["d", "p-ch1", "p-ch2"]

    def test_families_collapse_sibling_chapters(self):
        books = [
            {"id": "p-ch1", "partOf": "p", "citations": ["k6"]},
            {"id": "p-ch2", "partOf": "p", "citations": ["k6"]},
            {"id": "d", "citations": ["k6"]},
        ]
        _, citation_to_families = es.build_citation_index(books)
        assert citation_to_families["k6"] == {"p", "d"}

    def test_tagged_entries_resolve_the_same_as_plain_strings(self):
        books = [{"id": "drucker-coursebook", "citations": [{"key": "croxall2018", "topic": "DH Overview"}]}]
        citation_to_books, citation_to_families = es.build_citation_index(books)
        assert citation_to_books["croxall2018"] == ["drucker-coursebook"]
        assert citation_to_families["croxall2018"] == {"drucker-coursebook"}


class TestBuildCitationKeyToBookId:
    def test_maps_own_citation_key_to_book_id(self):
        books = [
            {"id": "hayles-posthuman", "citationKey": "hayles1999"},
            {"id": "no-key-book"},
        ]
        assert es.build_citation_key_to_book_id(books) == {"hayles1999": "hayles-posthuman"}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: FAIL — `AttributeError: module 'exams_suggestions' has no attribute 'build_citation_index'`

- [ ] **Step 3: Write the minimal implementation**

```python
def build_citation_index(books):
    """Returns (citation_to_books, citation_to_families).

    citation_to_books: key -> list of raw citing book ids (chapters
    included individually).
    citation_to_families: key -> set of citing families (chapters of the
    same anthology collapse to one voter), used for the add-candidates
    hub threshold so an anthology can't manufacture a hub by citing
    something in 20 of its own chapters.
    """
    citation_to_books = {}
    citation_to_families = {}
    for book in books:
        for entry in book.get("citations", []):
            key = citation_key(entry)
            citation_to_books.setdefault(key, []).append(book["id"])
            citation_to_families.setdefault(key, set()).add(family_id(book))
    return citation_to_books, citation_to_families


def build_citation_key_to_book_id(books):
    """Reverse lookup from a book's own citationKey (when the book is
    itself already representing a citation entry) to its book id."""
    return {book["citationKey"]: book["id"] for book in books if book.get("citationKey")}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add _tools/exams_suggestions.py _tools/tests/test_exams_suggestions.py
git commit -m "exams_suggestions: add citation index builders"
```

---

### Task 3: Anthology-aware effective citations

**Files:**
- Modify: `_tools/exams_suggestions.py`
- Modify: `_tools/tests/test_exams_suggestions.py`

**Interfaces:**
- Consumes: `citation_key` (Task 1)
- Produces: `main_books(books: list[dict]) -> list[dict]`, `children_by_parent(books: list[dict]) -> dict[str, list[dict]]`, `effective_citations(book: dict, children_map: dict[str, list[dict]]) -> set[str]`, `scored_books(books: list[dict], children_map: dict[str, list[dict]]) -> list[dict]`

- [ ] **Step 1: Write the failing tests**

```python
class TestMainBooks:
    def test_excludes_chapters(self):
        books = [{"id": "p"}, {"id": "p-ch1", "partOf": "p"}]
        assert [b["id"] for b in es.main_books(books)] == ["p"]


class TestChildrenByParent:
    def test_groups_chapters_under_their_parent_id(self):
        books = [
            {"id": "p"},
            {"id": "p-ch1", "partOf": "p"},
            {"id": "p-ch2", "partOf": "p"},
            {"id": "other"},
        ]
        children = es.children_by_parent(books)
        assert sorted(b["id"] for b in children["p"]) == ["p-ch1", "p-ch2"]
        assert "other" not in children


class TestEffectiveCitations:
    def test_plain_book_uses_its_own_citations(self):
        book = {"id": "a", "citations": ["k1", "k2"]}
        assert es.effective_citations(book, {}) == {"k1", "k2"}

    def test_anthology_parent_unions_its_chapters(self):
        parent = {"id": "p", "citations": []}
        children_map = {
            "p": [
                {"id": "p-ch1", "partOf": "p", "citations": ["k5", "k6"]},
                {"id": "p-ch2", "partOf": "p", "citations": ["k6", "k7"]},
            ]
        }
        assert es.effective_citations(parent, children_map) == {"k5", "k6", "k7"}

    def test_untranscribed_book_with_no_children_is_empty(self):
        book = {"id": "c", "citations": []}
        assert es.effective_citations(book, {}) == set()


class TestScoredBooks:
    def test_excludes_untranscribed_and_chapters_but_keeps_transcribed_anthology_parent(self):
        books = [
            {"id": "a", "citations": ["k1"]},
            {"id": "untranscribed", "citations": []},
            {"id": "p", "citations": []},
            {"id": "p-ch1", "partOf": "p", "citations": ["k5"]},
        ]
        children_map = es.children_by_parent(books)
        ids = [b["id"] for b in es.scored_books(books, children_map)]
        assert sorted(ids) == ["a", "p"]
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: FAIL — `AttributeError: module 'exams_suggestions' has no attribute 'main_books'`

- [ ] **Step 3: Write the minimal implementation**

```python
def main_books(books):
    """Every book except chapters of a split anthology (partOf set) —
    a chapter isn't a distinct book on the reading list."""
    return [b for b in books if not b.get("partOf")]


def children_by_parent(books):
    """Maps an anthology parent's id to the list of its chapter books."""
    result = {}
    for book in books:
        parent = book.get("partOf")
        if parent:
            result.setdefault(parent, []).append(book)
    return result


def effective_citations(book, children_map):
    """A book's own citation keys, unioned with its chapters' citation
    keys if it's a split-anthology parent. Anthologies split into
    chapters always carry an empty `citations` array on the parent by
    convention — the bibliography lives entirely on the chapters. Without
    folding it back up here, the parent would be permanently invisible to
    scoring: never flagged as isolated, but also never credited for the
    connectivity its chapters actually have."""
    keys = {citation_key(e) for e in book.get("citations", [])}
    for child in children_map.get(book["id"], []):
        keys.update(citation_key(e) for e in child.get("citations", []))
    return keys


def scored_books(books, children_map):
    """Main (non-chapter) books with a non-empty effective citations
    profile. An empty bibliography means "not evaluated yet," not
    "doesn't belong" — it must never show up as low-fit."""
    return [b for b in main_books(books) if effective_citations(b, children_map)]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: PASS (14 tests)

- [ ] **Step 5: Commit**

```bash
git add _tools/exams_suggestions.py _tools/tests/test_exams_suggestions.py
git commit -m "exams_suggestions: fold anthology chapters into parent's effective citations"
```

---

### Task 4: Degree/weight computation

**Files:**
- Modify: `_tools/exams_suggestions.py`
- Modify: `_tools/tests/test_exams_suggestions.py`

**Interfaces:**
- Consumes: `effective_citations` (Task 3)
- Produces: `compute_degrees(books: list[dict], children_map: dict[str, list[dict]]) -> dict[str, dict]` — returns `{book_id: {"degree": int, "weight": int}}`

- [ ] **Step 1: Write the failing test**

```python
class TestComputeDegrees:
    def test_degree_and_weight_across_a_small_graph(self):
        # a/b share k2 (1 key). c is isolated. p (anthology parent, folded
        # via children_map) and d share k6 (1 key) through p's chapters.
        books = [
            {"id": "a", "citations": ["k1", "k2"]},
            {"id": "b", "citations": ["k2", "k3"]},
            {"id": "c", "citations": ["k4"]},
            {"id": "p", "citations": []},
            {"id": "p-ch1", "partOf": "p", "citations": ["k5", "k6"]},
            {"id": "p-ch2", "partOf": "p", "citations": ["k6", "k7"]},
            {"id": "d", "citations": ["k6"]},
        ]
        children_map = es.children_by_parent(books)
        scored = es.scored_books(books, children_map)
        degrees = es.compute_degrees(scored, children_map)

        assert degrees["a"] == {"degree": 1, "weight": 1}
        assert degrees["b"] == {"degree": 1, "weight": 1}
        assert degrees["c"] == {"degree": 0, "weight": 0}
        assert degrees["p"] == {"degree": 1, "weight": 1}
        assert degrees["d"] == {"degree": 1, "weight": 1}
        # chapters are never individually scored
        assert "p-ch1" not in degrees
        assert "p-ch2" not in degrees

    def test_weight_accumulates_multiple_shared_keys_with_one_neighbor(self):
        books = [
            {"id": "a", "citations": ["k1", "k2", "k3"]},
            {"id": "b", "citations": ["k1", "k2", "k9"]},
        ]
        children_map = {}
        degrees = es.compute_degrees(books, children_map)
        assert degrees["a"] == {"degree": 1, "weight": 2}
        assert degrees["b"] == {"degree": 1, "weight": 2}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: FAIL — `AttributeError: module 'exams_suggestions' has no attribute 'compute_degrees'`

- [ ] **Step 3: Write the minimal implementation**

```python
def compute_degrees(books, children_map):
    """Raw structural degree: any effective-citation overlap >= 1 counts
    as an edge between two distinct scored books, graph-wide (not scoped
    to category or subject). `degree` is the neighbor count; `weight` is
    the total size of all shared-key intersections, reported as
    tie-break context, not used for ranking."""
    profiles = {b["id"]: effective_citations(b, children_map) for b in books}
    ids = list(profiles.keys())
    result = {bid: {"degree": 0, "weight": 0} for bid in ids}
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            shared = profiles[ids[i]] & profiles[ids[j]]
            if not shared:
                continue
            result[ids[i]]["degree"] += 1
            result[ids[j]]["degree"] += 1
            result[ids[i]]["weight"] += len(shared)
            result[ids[j]]["weight"] += len(shared)
    return result
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: PASS (16 tests)

- [ ] **Step 5: Commit**

```bash
git add _tools/exams_suggestions.py _tools/tests/test_exams_suggestions.py
git commit -m "exams_suggestions: compute graph-wide degree and weight per book"
```

---

### Task 5: Reconsider list ranking

**Files:**
- Modify: `_tools/exams_suggestions.py`
- Modify: `_tools/tests/test_exams_suggestions.py`

**Interfaces:**
- Consumes: none new (operates on plain book dicts and the `degrees` dict shape produced by Task 4)
- Produces: `reconsider_list(books: list[dict], degrees: dict[str, dict], percentile: float) -> list[dict]`

- [ ] **Step 1: Write the failing tests**

```python
class TestReconsiderList:
    def test_flags_the_lowest_degree_book_at_a_tight_percentile(self):
        books = [{"id": "a"}, {"id": "b"}, {"id": "c"}, {"id": "d"}, {"id": "e"}]
        degrees = {
            "a": {"degree": 1, "weight": 1},
            "b": {"degree": 1, "weight": 1},
            "c": {"degree": 0, "weight": 0},
            "d": {"degree": 1, "weight": 1},
            "e": {"degree": 1, "weight": 1},
        }
        flagged = es.reconsider_list(books, degrees, percentile=0.2)
        assert [b["id"] for b in flagged] == ["c"]

    def test_widening_percentile_flags_more_books_with_stable_tie_break(self):
        books = [{"id": "a"}, {"id": "b"}, {"id": "c"}, {"id": "d"}, {"id": "e"}]
        degrees = {
            "a": {"degree": 1, "weight": 1},
            "b": {"degree": 1, "weight": 1},
            "c": {"degree": 0, "weight": 0},
            "d": {"degree": 1, "weight": 1},
            "e": {"degree": 1, "weight": 1},
        }
        flagged = es.reconsider_list(books, degrees, percentile=0.4)
        # c (degree 0) first, then the lowest-id degree-1 book as a tie-break
        assert [b["id"] for b in flagged] == ["c", "a"]

    def test_percentile_rounds_up_to_at_least_one_book(self):
        books = [{"id": "a"}, {"id": "b"}]
        degrees = {"a": {"degree": 5, "weight": 5}, "b": {"degree": 9, "weight": 9}}
        flagged = es.reconsider_list(books, degrees, percentile=0.01)
        assert [b["id"] for b in flagged] == ["a"]
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: FAIL — `AttributeError: module 'exams_suggestions' has no attribute 'reconsider_list'`

- [ ] **Step 3: Write the minimal implementation**

Add `import math` to the top of `_tools/exams_suggestions.py`, then:

```python
def reconsider_list(books, degrees, percentile):
    """Bottom `percentile` fraction of `books` by degree (ties broken by
    id for determinism), ascending — worst-connected first. Always flags
    at least one book if `books` is non-empty."""
    ranked = sorted(books, key=lambda b: (degrees[b["id"]]["degree"], b["id"]))
    n_flagged = math.ceil(percentile * len(ranked))
    return ranked[:n_flagged]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: PASS (19 tests)

- [ ] **Step 5: Commit**

```bash
git add _tools/exams_suggestions.py _tools/tests/test_exams_suggestions.py
git commit -m "exams_suggestions: add percentile-based reconsider-list ranking"
```

---

### Task 6: Add-candidates (hub threshold)

**Files:**
- Modify: `_tools/exams_suggestions.py`
- Modify: `_tools/tests/test_exams_suggestions.py`

**Interfaces:**
- Consumes: `citation_to_families` shape from `build_citation_index` (Task 2), `citation_key_to_book_id` shape from `build_citation_key_to_book_id` (Task 2)
- Produces: `established_keys(citation_to_families: dict[str, set[str]], citation_key_to_book_id: dict[str, str], hub_threshold: int) -> list[str]`, `add_candidates(keys: list[str], citation_to_books: dict[str, list[str]], citation_to_families: dict[str, set[str]], citations: dict[str, str], book_by_id: dict[str, dict]) -> list[dict]`

- [ ] **Step 1: Write the failing tests**

```python
class TestEstablishedKeys:
    def test_includes_keys_at_or_above_threshold(self):
        citation_to_families = {"k1": {"a", "b", "c", "d"}, "k2": {"a", "b", "c"}}
        flagged = es.established_keys(citation_to_families, {}, hub_threshold=4)
        assert flagged == ["k1"]

    def test_excludes_keys_already_owned_by_a_real_book(self):
        citation_to_families = {"k1": {"a", "b", "c", "d"}}
        citation_key_to_book_id = {"k1": "some-book-already-on-the-list"}
        assert es.established_keys(citation_to_families, citation_key_to_book_id, hub_threshold=4) == []

    def test_sorted_by_citing_family_count_descending(self):
        citation_to_families = {
            "k1": {"a", "b", "c", "d"},
            "k2": {"a", "b", "c", "d", "e"},
        }
        assert es.established_keys(citation_to_families, {}, hub_threshold=4) == ["k2", "k1"]


class TestAddCandidates:
    def test_resolves_citation_string_family_count_and_citing_titles(self):
        citation_to_books = {"k1": ["a", "b", "c", "d"]}
        citation_to_families = {"k1": {"a", "b", "c", "d"}}
        citations = {"k1": "Foucault, Michel. Discipline and Punish."}
        book_by_id = {
            "a": {"id": "a", "title": "Book A"},
            "b": {"id": "b", "title": "Book B"},
            "c": {"id": "c", "title": "Book C"},
            "d": {"id": "d", "title": "Book D"},
        }
        result = es.add_candidates(["k1"], citation_to_books, citation_to_families, citations, book_by_id)
        assert result == [
            {
                "key": "k1",
                "citation": "Foucault, Michel. Discipline and Punish.",
                "family_count": 4,
                "titles": ["Book A", "Book B", "Book C", "Book D"],
            }
        ]
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: FAIL — `AttributeError: module 'exams_suggestions' has no attribute 'established_keys'`

- [ ] **Step 3: Write the minimal implementation**

```python
def established_keys(citation_to_families, citation_key_to_book_id, hub_threshold):
    """A citation key is a real add-candidate if it isn't already
    representing a book on the list (no citationKey owner) and is cited
    by at least `hub_threshold` distinct families — mirrors the live
    page's establishedKeys() hub-promotion rule verbatim."""
    keys = [
        key
        for key, families in citation_to_families.items()
        if key not in citation_key_to_book_id and len(families) >= hub_threshold
    ]
    keys.sort(key=lambda k: (-len(citation_to_families[k]), k))
    return keys


def add_candidates(keys, citation_to_books, citation_to_families, citations, book_by_id):
    """Resolves each established key to its citation string, citing
    family count, and the titles of the books that cite it."""
    result = []
    for key in keys:
        citing_ids = citation_to_books[key]
        titles = sorted({book_by_id[bid]["title"] for bid in citing_ids if bid in book_by_id})
        result.append(
            {
                "key": key,
                "citation": citations.get(key, key),
                "family_count": len(citation_to_families[key]),
                "titles": titles,
            }
        )
    return result
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: PASS (23 tests)

- [ ] **Step 5: Commit**

```bash
git add _tools/exams_suggestions.py _tools/tests/test_exams_suggestions.py
git commit -m "exams_suggestions: add hub-threshold add-candidates"
```

---

### Task 7: Report formatting, orchestration, and CLI

**Files:**
- Modify: `_tools/exams_suggestions.py`
- Modify: `_tools/tests/test_exams_suggestions.py`

**Interfaces:**
- Consumes: everything from Tasks 1–6
- Produces: `format_report(reconsider: list[dict], degrees: dict[str, dict], add_cands: list[dict], scored_count: int, percentile: float, hub_threshold: int) -> str`, `load_data(path: Path) -> dict`, `orchestrate(data: dict, percentile: float = 0.15, hub_threshold: int = 4) -> str`, `main() -> None` (CLI entry point)

- [ ] **Step 1: Write the failing tests**

```python
import json


class TestFormatReport:
    def test_report_contains_both_section_headers_and_flagged_content(self):
        reconsider = [{"id": "c", "title": "Isolated Book", "author": "Author C", "categories": ["core"], "subject": "game-studies"}]
        degrees = {"c": {"degree": 0, "weight": 0}}
        add_cands = [
            {"key": "k1", "citation": "Foucault, Michel. Discipline and Punish.", "family_count": 4, "titles": ["Book A", "Book B"]}
        ]
        report = es.format_report(reconsider, degrees, add_cands, scored_count=10, percentile=0.15, hub_threshold=4)
        assert "=== Reconsider (bottom 15% by connectivity, 1 of 10 scored books) ===" in report
        assert "Isolated Book" in report
        assert "Author C" in report
        assert "=== Consider adding (cited by >=4 books, not already on the list) ===" in report
        assert "Foucault, Michel. Discipline and Punish." in report
        assert "cited by: Book A, Book B" in report


class TestLoadData:
    def test_reads_json_file(self, tmp_path):
        path = tmp_path / "exams.json"
        path.write_text(json.dumps({"books": [], "citations": {}}), encoding="utf-8")
        assert es.load_data(path) == {"books": [], "citations": {}}


class TestOrchestrate:
    def test_end_to_end_on_a_small_synthetic_dataset(self):
        data = {
            "citations": {"k2": "Shared Source. 2000."},
            "books": [
                {"id": "a", "title": "Book A", "author": "Author A", "categories": ["core"], "subject": "game-studies", "citations": ["k1", "k2"]},
                {"id": "b", "title": "Book B", "author": "Author B", "categories": ["core"], "subject": "game-studies", "citations": ["k2", "k3"]},
                {"id": "c", "title": "Book C", "author": "Author C", "categories": ["primary"], "subject": "electronic-literature", "citations": ["k4"]},
            ],
        }
        report = es.orchestrate(data, percentile=0.4, hub_threshold=2)
        assert "Book C" in report  # degree 0, lowest-connectivity, flagged
        assert "Shared Source. 2000." in report  # k2 cited by a and b, hub_threshold=2

    def test_smoke_test_against_the_real_exams_data(self):
        real_path = Path(__file__).parent.parent.parent / "_data" / "exams.json"
        data = es.load_data(real_path)
        report = es.orchestrate(data)
        assert "=== Reconsider" in report
        assert "=== Consider adding" in report
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: FAIL — `AttributeError: module 'exams_suggestions' has no attribute 'format_report'`

- [ ] **Step 3: Write the minimal implementation**

Add `import argparse` and `from pathlib import Path` to the top of `_tools/exams_suggestions.py`, then:

```python
def format_report(reconsider, degrees, add_cands, scored_count, percentile, hub_threshold):
    lines = []
    lines.append(
        f"=== Reconsider (bottom {percentile:.0%} by connectivity, "
        f"{len(reconsider)} of {scored_count} scored books) ==="
    )
    for book in reconsider:
        d = degrees[book["id"]]
        cats = "/".join(book.get("categories", []))
        subject = book.get("subject", "")
        lines.append(
            f"{d['degree']} {d['weight']}  {book['title']} — {book['author']}  [{cats}/{subject}]"
        )
    lines.append("")
    lines.append(f"=== Consider adding (cited by >={hub_threshold} books, not already on the list) ===")
    for cand in add_cands:
        lines.append(f"{cand['family_count']}  {cand['citation']}")
        lines.append(f"    cited by: {', '.join(cand['titles'])}")
    return "\n".join(lines)


def load_data(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def orchestrate(data, percentile=0.15, hub_threshold=4):
    books = data["books"]
    citations = data["citations"]

    children_map = children_by_parent(books)
    scored = scored_books(books, children_map)
    degrees = compute_degrees(scored, children_map)
    flagged = reconsider_list(scored, degrees, percentile)

    citation_to_books, citation_to_families = build_citation_index(books)
    citation_key_to_book_id = build_citation_key_to_book_id(books)
    keys = established_keys(citation_to_families, citation_key_to_book_id, hub_threshold)
    book_by_id = {b["id"]: b for b in books}
    cands = add_candidates(keys, citation_to_books, citation_to_families, citations, book_by_id)

    return format_report(flagged, degrees, cands, len(scored), percentile, hub_threshold)


def main():
    parser = argparse.ArgumentParser(description="Suggest reading-list changes from the exams citation graph.")
    parser.add_argument("--percentile", type=float, default=0.15, help="Fraction of scored books to flag as low-connectivity (default: 0.15)")
    parser.add_argument("--hub-threshold", type=int, default=4, help="Minimum distinct citing families for an add-candidate (default: 4)")
    parser.add_argument("--data", type=Path, default=Path(__file__).parent.parent / "_data" / "exams.json", help="Path to exams.json")
    args = parser.parse_args()

    data = load_data(args.data)
    print(orchestrate(data, args.percentile, args.hub_threshold))


if __name__ == "__main__":
    main()
```

Also add `import json` at the top of the file if not already present from earlier tasks (it isn't — this is the first task that needs it).

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest _tools/tests/test_exams_suggestions.py -v`
Expected: PASS (28 tests)

- [ ] **Step 5: Run the script against the real data by hand**

Run: `python3 _tools/exams_suggestions.py`
Expected: prints both sections to stdout with no errors. Then run `python3 _tools/exams_suggestions.py --percentile 0.05 --hub-threshold 10` and confirm both lists shrink, and `python3 _tools/exams_suggestions.py --percentile 0.5 --hub-threshold 1` and confirm both lists grow (spec Verification Plan, item 4).

- [ ] **Step 6: Commit**

```bash
git add _tools/exams_suggestions.py _tools/tests/test_exams_suggestions.py
git commit -m "exams_suggestions: add report formatting, orchestration, and CLI entry point"
```

---

## Manual Follow-Up (not automated — spec Verification Plan items 2–3, 5)

After Task 7 is committed, spot-check the real output by hand:

- Pick 2–3 flagged "reconsider" books that are *not* one of the four split anthologies. Open `phd/exams/`, click each node, and count its distinct connections — expect the script's printed degree to be *higher*, not equal: the page excludes hub-promoted and book-owned citation keys from book-to-book edges entirely, and additionally filters displayed edges by a `minSharedThreshold` the script doesn't apply. A large gap is expected, not a bug — see the design spec's Verification Plan item 2 for the full reasoning.
- For a split anthology parent (e.g. `debates-23`) if one appears in the reconsider output, confirm its printed degree by manually summing the distinct external books each of its chapters connects to (the page currently shows the parent node itself with zero edges, so this won't match the page directly — expected, per the design spec).
- Pick 2–3 "add-candidates" entries and confirm by hand in `_data/exams.json` that the citing-family count matches, and that the key isn't already some book's `citationKey`.
- Confirm no book with an empty effective-citations profile (no citations of its own, and, if it's an anthology parent, none from its chapters either) appears in the reconsider output.
