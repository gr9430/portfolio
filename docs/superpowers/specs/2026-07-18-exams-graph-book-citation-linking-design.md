# Exams Network Graph — Link Book Nodes to Their Own Citation Key — Design

## Problem

The graph has two structurally separate ways for a work to appear:

1. As a **book node** — one of the 89 real reading-list entries, drawn from `books`, connected via its own `citations` array (what it cites).
2. As a **citation-hub node** — a diamond promoted from the bibliography dict when enough *other* books cite the same key (gated by `recoThreshold`), with gold spokes (`citeEdges`) to each citing book.

When the same real-world work is *both* — a book you're reading **and** a source other books on your list cite — the graph has no way to know they're the same thing. Michel Foucault's *The Order of Things* is `foucault-order`, a core book on the reading list with an empty `citations` array (never transcribed) — but it's also cited, as an external source, by three other transcribed books (`haraway-cyborgs`, `orientalism`, `hayles-posthuman`). Those three books currently connect to each other (or would, once the citation crosses `minSharedThreshold`), but never to the actual `foucault-order` node sitting right there on the list. Walter Benjamin's *The Work of Art in the Age of Mechanical/Technological Reproduction* (`benjamin-reproduction`) has the identical shape: cited by three other books, never connected to its own node.

This is compounded by (and partially masked as) a citation-fold problem — both Foucault's and Benjamin's citations were themselves split across multiple near-duplicate keys before the fold passes in this session merged them (`2026-07-17`, `2026-07-18` commits). Folding fixed the "these three citations are actually one" problem; it does nothing for "this one citation is actually the same work as one of my 89 books," which is what this design addresses.

## Design decisions

### 1. One new optional field: `citationKey`

A book entry that is also cited by other transcribed books gets `"citationKey": "<bibliography key>"` — e.g. `foucault-order` gets `"citationKey": "foucaultorderofthings1973"`, `benjamin-reproduction` gets `"citationKey": "benjamin2008"`. Most of the 89 books won't have this field; it's added only where a real citation match exists. This is pure data, added by manual curation (see §4) — no schema change beyond the one optional key.

### 2. Graph mechanics: retarget existing `citeEdges`, no new edge type

- Build `citationKeyToBookId`, a reverse lookup from every book's `citationKey` to its own `id`.
- In `rebuildCitationGraph()`, when building `citationNodes` (the diamond hubs) from `establishedKeys()`, skip any key present in `citationKeyToBookId` — it never gets a synthetic diamond, at any `recoThreshold` value, because a real node for it already exists.
- For each linked key, push directly into the **existing** `citeEdges` array — same array used for ordinary citation-hub spokes — but with `target` set to the linked book's real `id` instead of a synthetic `'cite::' + key` id. No threshold gate: every book that cites a linked key gets an edge, even if only one does, because no new node is being promoted — the target already exists and is already visible. This is the load-bearing simplification versus the citation-hub mechanism, and it's exactly what makes this a small change: `citeEdges` is already wired into degree computation, focus-dimming, visibility toggling, and the gold `.exams-link-cite` rendering from the prior `partOf` work, so linked books grow and connect with no new plumbing.
- The pairwise `bookEdges` loop (in the same function) must also skip linked keys, alongside its existing `established` skip — otherwise the same relationship would show twice: once as a direct gold spoke to the linked book, once as a pale line between the citing books.

### 3. No new visual treatment

Linked-citation edges reuse `.exams-link-cite` (gold) with no distinguishing marker from an ordinary citation-hub spoke — conceptually it's the same "this is a citation" relationship, just landing on a real node instead of a synthetic one. No new legend entry.

`citationKey` is unrelated to whether the book's own bibliography has been transcribed. `foucault-order` and `benjamin-reproduction` both keep `citations: []`; they stay out of `populatedBookCount` and the Reading List's "transcribed" stats exactly as today. Linking only changes whether *other* books' citations of them render as edges.

### 4. Curation: generous candidates, manual judgment on every one

For each of the 89 books, gather every bibliography entry whose extracted author lastname matches the book's own `author` field (trying both "Lastname, First" and "First Lastname" extraction, since the corpus mixes both citation styles — see the `2026-07-17` fold's disclosed limitation, which is exactly what hid the Foucault case from the automated pass). This is deliberately *not* filtered by title-string similarity first: Benjamin's case (`benjamin2008`) proves the value of this — its title ("Technological Reproducibility") shares no meaningful substring with the book's own title field ("Mechanical Reproduction"), so any upfront title filter would have hidden it. Instead, title matching happens by human judgment, per book, against a small (typically 0–20 entry) same-author candidate list — cheap to review at 89 books, and tolerant of translation/edition variance the way string-matching can't be.

Two links are already confirmed from this session's investigation and seed the curation pass:
- `foucault-order` → `foucaultorderofthings1973`
- `benjamin-reproduction` → `benjamin2008`

### 5. Safety invariant: each citation key links to at most one book

Enforced by the curation review, not by code. If review turns up a book that plausibly matches two different citation-key variants of what looks like the same title, that's a signal the corpus-wide fold should have already merged those two keys — fold first (as was done for both seed cases), then link the single surviving key.

## Explicitly out of scope

- Exhaustively finding every possible book↔citation link with full confidence. One careful pass, same disclosure posture as the fold passes: the same-author-lastname candidate generation still depends on extracting a lastname at all, which can fail on unusual name formats (organizational authors, single-name authors, etc.) — those would need to be found some other way if they exist.
- Any change to hub-promotion behavior for citations that are *not* linked to a book — `recoThreshold`-gated diamond promotion for genuinely external, not-yet-read sources is untouched.
- Retroactively re-running the whole-corpus fold with a translation-aware matcher. The Benjamin case was fixed by hand once found; systematically finding more translation-title duplicates is a different, unscoped problem.

## Files touched

- `_data/exams.json` — `citationKey` field added to whichever books the curation pass confirms (at least `foucault-order`, `benjamin-reproduction`).
- `phd/exams/index.html` — `rebuildCitationGraph()`: `citationKeyToBookId` lookup, diamond-promotion skip, `citeEdges` retargeting, `bookEdges` pairwise skip. No other function changes — degree, focus, visibility, and rendering all already handle `citeEdges` generically.
