# PhD Exams — Reading List Suggestion Script — Design Spec
**Date:** 2026-07-26
**Status:** Approved

## Overview

A standalone analysis script for the PhD comprehensive exams reading list (`_data/exams.json`, visualized at `phd/exams/`, see [2026-07-01-exams-citation-network-design.md](2026-07-01-exams-citation-network-design.md)). The user is manually transcribing ~170 books' bibliographies and wants a way to spot, from the resulting citation graph, which currently-listed texts look structurally isolated (candidates to reconsider/replace) and which outside sources keep recurring across the corpus without being on the list themselves (candidates to add).

This is phase one of a two-phase plan: validate the scoring logic as a script first, then port it into `phd/exams/index.html` as a live toggle once the thresholds and output are proven useful against the real data. This spec covers phase one only.

## Scope Decisions

- **Fit signal:** connectivity is measured **graph-wide** — across all four exam lists at once, not scoped to a book's own category or subject. The point of the existing visualization is to surface shared infrastructure *across* fields the user is otherwise treating as distinct, so a book that only connects within its own subject silo is exactly the kind of case worth flagging.
- **Add-candidates:** drawn **only** from citation keys already present in `EXAMS_DATA.citations` — i.e., sources some transcribed book already cites. The script has no way to know about a source that has never been mentioned anywhere in the corpus, so it re-ranks/packages an existing signal (the same pool the page's hub-promotion diamonds draw from) rather than inventing new ones.
- **Threshold shape:** the reconsider list uses a **percentile cut** (bottom N% by degree, default 15%), not a fixed absolute number — it self-adjusts as more bibliographies get transcribed, rather than needing hand re-tuning.
- **Delivery:** a script, run manually, printing to stdout. No changes to `phd/exams/index.html` or any data file in this pass.

## Implementation Approach

Python, reimplementing the graph-construction logic already used by `phd/exams/index.html`'s inline JS — deliberately mirroring its variable names and shape (`citationToBooks`, `familyId`, `establishedKeys`) rather than inventing a different structure, so that porting this into the page later (phase two) is a mechanical translation and the two can't quietly disagree on what counts as a hub or an edge. No dependencies beyond the standard library (`json`, `argparse`).

## Data Model (read-only)

Reads `_data/exams.json` as-is. No schema changes. Relevant existing fields used:

- `books[].id`, `.title`, `.author`, `.categories`, `.subject`, `.citations`, `.partOf`, `.citationKey`
- `citations` (the key → citation-string dictionary)

## Algorithm

### Universe

- `mainBooks` = all entries in `books` **excluding** chapter entries (`partOf` is set) — same convention as the page, since a chapter isn't a distinct book on the reading list, it's a subunit of its parent anthology.
- `effectiveCitations(book)` for a `mainBook` = `book.citations` **union** the `citations` of every chapter whose `partOf == book.id`. This matters: anthologies split into chapters (`debates-23`, `mullaney-your-computer-is-on-fire`, `bloomsbury-elit-handbook`, `salter-johnson-critical-making`) always carry an empty `citations` array on the parent by convention — the bibliography lives entirely on the chapters. Without folding it back up, these parent books would be permanently invisible to scoring (never flagged as isolated, but also never credited for the — often extensive — connectivity their chapters actually have), which would silently exclude some of the most heavily-cited texts in the corpus. Folding chapter citations into the parent's effective profile, while still only ever scoring/flagging the parent (chapters themselves are never individually ranked), fixes that.
- `scoredBooks` = `mainBooks` where `effectiveCitations(book)` is **non-empty**. Books with no transcribed bibliography anywhere in their family are excluded from scoring entirely — an empty bibliography means "not evaluated yet," not "doesn't belong," and must never show up in the reconsider list just because it hasn't been transcribed.

### Citation index

Build `citationToBooks`: citation key → list of citing book ids, using each book's **raw** `citations` (chapters included individually) — needed as-is for the family-vote step below.
Build `citationToFamilies`: citation key → set of citing families, via `familyId(book) = book.partOf or book.id` (chapters of the same anthology collapse to one voter). Used for the add-candidates hub threshold, so an anthology can't manufacture a hub by citing something in 20 of its own chapters.
Build `citationKeyToBookId`: reverse lookup from a book's own `citationKey` (when the book is itself already representing a citation entry) to its book id — used to exclude "sources" that are already real books on the list from the add-candidates output.

### Degree (connectivity score)

For every pair of *distinct* `scoredBooks` (this set already excludes chapters, so no sibling-skip guard is needed here the way the page needs one), they share an edge if `effectiveCitations` of the two books intersect. `degree(book)` = count of other `scoredBooks` it shares at least one effective citation with, graph-wide. `weight(book)` = total size of the intersection summed across all its edges — reported alongside degree as tie-break context, not used for ranking.

This is **raw structural degree** (any intersection ≥ 1 counts as an edge) — it does not apply the page's `minSharedThreshold` display filter, since that filter exists to declutter the visual graph, not to define connectivity for analysis.

### Reconsider list

1. Sort `scoredBooks` by `degree` ascending.
2. Flag the bottom `ceil(percentile * len(scoredBooks))` books (default `percentile = 0.15`).
3. For each flagged book, output: title, author, categories, subject, degree, weight.

### Add-candidates list

Port `establishedKeys()` from the page verbatim:

```
established_keys = [
    key for key in citationToFamilies
    if key not in citationKeyToBookId
    and len(citationToFamilies[key]) >= hub_threshold
]
```

(default `hub_threshold = 4`, matching the page's default `recoThreshold`). For each established key not already representing a book on the list, output: resolved citation string, citing-family count, and the titles of the books that cite it (for context on where it'd plug in). Sort by citing-family count descending.

## CLI

```
python3 _tools/exams_suggestions.py [--percentile 0.15] [--hub-threshold 4]
```

- `--percentile`: fraction (0–1) of scored books to flag in the reconsider list. Default `0.15`.
- `--hub-threshold`: minimum distinct citing families for a source to appear in add-candidates. Default `4`.

No other flags. No file output — everything prints to stdout in two labeled sections:

```
=== Reconsider (bottom 15% by connectivity, N of M scored books) ===
<degree> <weight>  <title> — <author>  [<categories>/<subject>]
...

=== Consider adding (cited by >=4 books, not already on the list) ===
<citing-family-count>  <citation string>
    cited by: <title1>, <title2>, ...
...
```

## Out of Scope

- Any change to `phd/exams/index.html`, `_data/exams.json`, or any other data file.
- Subject/LCSH-similarity scoring, or any notion of thematic fit beyond raw shared-citation connectivity.
- Add-candidates sourced from anywhere other than the existing `citations` dictionary (no web search, no external suggestions).
- Porting this logic into the live page — deferred to a follow-up spec once the script's output has been validated against the real data.

## Verification Plan

1. Run `python3 _tools/exams_suggestions.py` against the current `_data/exams.json`; confirm it runs without error and prints both sections.
2. Spot-check a handful of flagged "reconsider" books by hand. For an ordinary (non-anthology) book, this should match what the network graph page shows when you click its node and count distinct connections — the page currently computes degree the same way for these. For an anthology parent (e.g. `debates-23`), the script's degree will *not* match the page today, because the page currently shows the parent node with zero edges of its own (its `citations` array is empty by convention) while the script folds all its chapters' citations up to it — spot-check those instead by manually summing the distinct external books each chapter connects to.
3. Spot-check a handful of "add-candidates" entries: confirm each printed citation key is not already linked to a book via `citationKey`, and that its citing-family count matches manual inspection of `_data/exams.json`.
4. Run with `--percentile 0.05` and `--hub-threshold 10` to confirm the flags shrink as expected; run with `--percentile 0.5` and `--hub-threshold 1` to confirm they grow as expected.
5. Confirm a book with empty effective citations (no citations of its own, and — if it's an anthology parent — none contributed by its chapters either) never appears in the reconsider list.
