# Exams Network Graph — Split "Debates in the Digital Humanities 2023" into Chapter Sub-Nodes — Design

## Problem

`debates-23` ("Debates in the Digital Humanities 2023") was just transcribed as a single book node carrying all 1,055 citation keys pulled from its 27 independently-authored chapters (see `2026-07-16` session: full-text transcription of the anthology's 27 chapter bibliographies). Treating a 27-essay edited volume as one citation-bag has two problems:

1. **Lost precision.** A specific chapter's citation overlap with another exam book (e.g. the deepfakes chapter sharing sources with a media-theory book) is a meaningful signal; "the whole 500-page anthology shares a citation with X" is not. Flattening 27 distinct essays into one node erases exactly the kind of relationship the graph exists to show.
2. **A known transcription artifact.** The same source is sometimes cited with inconsistent copyediting across the anthology's own chapters (e.g. Ruha Benjamin's *Race After Technology* appears as "Medford, Mass.: Polity" in Ch.1, "Cambridge: Polity" in Ch.11, "Boston: Polity Press" in Ch.9) — the exact-text dedup used during transcription correctly left these as distinct keys (`benjamin2019`, `benjamin2019a`, `benjamin2019b`...) rather than silently guessing they matched, but they should be folded into one canonical entry now that a human is making the call.

## Root cause

The book schema has no notion of "this entry is part of a larger work" beyond a cosmetic `container` string (already used once, on `hall-e-d`, shown only in the detail panel — never wired into the graph). There is no parent/child edge mechanism anywhere in `phd/exams/index.html`; every book is an independent node whose only relationships come from shared citations or (for citation-hub nodes) the existing `citeEdges` spoke mechanism.

## Design decisions

### 1. Fold near-duplicate citations first

Before restructuring, group the ~1,053 newly-added bibliography entries by `(author surname, year, normalized title-prefix)`. Where a group is clearly one source cited inconsistently (not two genuinely different works by the same author in the same year), collapse it to a single canonical key — keeping the fullest/most complete citation text as the canonical value — and repoint every reference at that key. This is scoped to the citations added in the debates-23 transcription pass; the wider ~12,600-entry corpus may have the same problem from earlier transcription sessions, but auditing it is separate, unscoped work.

### 2. Parent node stays a normal book, empties its citations

`debates-23` keeps its `id`, `title`, `author` (editors), `year`, `field`, `subject`, `lcsh`, `categories`, and `selected` status exactly as-is — it remains a first-class circle node with its own detail panel, same as any other book. Two changes: `type` becomes `"Book/Anthology"` (matching the existing ad hoc precedent on the `output` entry, more accurate than plain `"Book"`), and `citations` empties to `[]` — every one of its 1,055 (now folded, so slightly fewer) citation keys moves down to whichever chapter actually cites it.

### 3. Twenty-seven new Chapter entries

One new book entry per chapter:

| Field | Value |
|---|---|
| `id` | `debates23-ch01` … `debates23-ch27` |
| `title` | the chapter's actual title |
| `author` | the chapter's actual author(s) |
| `year` | `2023` |
| `field` | inherited from parent (`"Texts & Technology"`) |
| `subject` | classified individually — see table below |
| `lcsh` | `[]` (parent already carries volume-level subject headings) |
| `container` | `"Debates in the Digital Humanities 2023"` (exact match to the `hall-e-d` convention) |
| `type` | `"Chapter"` (already in `exams_vocab.yml`) |
| `publisher` | `""` (deliberate — keeps chapters out of publisher-count stats; the parent already carries University of Minnesota Press for that) |
| `citations` | that chapter's real, folded bibliography |
| `categories` | `[]` |
| `selected` | `true` — deliberately, even though chapters aren't "selected reading list entries" in spirit. `selected: false` already means something different in this codebase ("Full Field" toggle — a core-list text the user declined to read) and `nodeVisible()` hides any `selected: false` node by default until that toggle is on. Chapters need to be visible in the Network Graph by default, so they can't use that flag; their exclusion from the reading list / stats / matrix is handled separately in §6 via `nodeType`, not via `selected`. |
| `partOf` | `"debates-23"` — new field, the parent-linking key this whole design hangs on |

Chapter 22 ("From Precedents to Collective Action: Realities and Recommendations for Digital Dissertations in History") had no listed byline in the source transcription — `author` is left `""` for that one entry rather than guessed.

Subject classification, calibrated against existing entries (`nakamura-digitizing`, `eubanks-inequality`, `data-feminism` → `data-algorithmic-justice`; `risam-poco-dh`, `interdisciplining-dh` → `dh-field-methods`; `rose-visual`, `orientalism` → `postcolonial-visual-theory`; `hayles-posthuman` → `media-tech-theory`; `consalvo` → `game-studies`) — the load-bearing precedent is that a chapter whose primary subject is *the state of DH as a field/practice* (labor, accessibility, field-building, English-centrism) lands in `dh-field-methods` even when its lens is race, disability, or postcoloniality, the same way `risam-poco-dh` (postcolonial critique of DH) landed there rather than in `postcolonial-visual-theory`:

| Ch | Title | Subject |
|---|---|---|
| 01 | Toward a Political Economy of Digital Humanities | `dh-field-methods` |
| 02 | All the Work You Do Not See: Labor, Digitizers, and the Foundations of DH | `dh-field-methods` |
| 03 | Right-to-Left (RTL) Text: Digital Humanists Plus Half a Billion Users | `media-tech-theory` |
| 04 | Relation-Oriented AI: Why Indigenous Protocols Matter for the DH | `data-algorithmic-justice` |
| 05 | A U.S. Latinx Digital Humanities Manifesto | `dh-field-methods` |
| 06 | The Body Is Not (Only) a Metaphor: Rethinking Embodiment in DH | `dh-field-methods` |
| 07 | The Queer Gap in Cultural Analytics | `data-algorithmic-justice` |
| 08 | The Feminist Data Manifest-NO | `data-algorithmic-justice` |
| 09 | Black Is Not the Absence of Light | `dh-field-methods` |
| 10 | Digital Humanities in the Deepfake Era | `media-tech-theory` |
| 11 | Operationalizing Surveillance Studies in the DH | `data-algorithmic-justice` |
| 12 | A Voice Interrupts: DH as a Tool to Hear Black Life | `data-algorithmic-justice` |
| 13 | Addressing an Emergency (climate crisis) | `dh-field-methods` |
| 14 | Digital Art History as Disciplinary Practice | `postcolonial-visual-theory` |
| 15 | Building and Sustaining Africana DH at HBCUs | `dh-field-methods` |
| 16 | A Call to Research Action: Transnational Solidarity | `dh-field-methods` |
| 17 | Game Studies, Endgame? | `game-studies` |
| 18 | The Challenges and Possibilities of Social Media Data | `data-algorithmic-justice` |
| 19 | Language Is Not a Default Setting | `dh-field-methods` |
| 20 | Librarians' Illegible Labor | `dh-field-methods` |
| 21 | Reframing the Conversation (disability/accessibility) | `dh-field-methods` |
| 22 | From Precedents to Collective Action (digital dissertations) | `dh-field-methods` |
| 23 | Critique Is the Steam (Latour/ANT theory) | `media-tech-theory` |
| 24 | Being Undisciplined: Black Womanhood in Digital Spaces | `dh-field-methods` |
| 25 | How This Helps Us Get Free (Black storytelling & tech) | `dh-field-methods` |
| 26 | "Blackness" in France: Taking Up Mediatized Space | `postcolonial-visual-theory` |
| 27 | The Power to Create: Building Alternative (Digital) Worlds | `dh-field-methods` |

### 4. New edge type: `partOfEdges`

One edge per chapter: `{ source: chapterId, target: "debates-23" }`. Rendered as a new line layer with its own CSS class, `.exams-link-partof`, included in `recomputeDegree()` alongside the existing `currentBookEdges()`/`citeEdges` sources so the parent's node radius grows naturally from having 27 neighbors — no special-case sizing code needed, it falls out of the existing degree-based `rScale`.

### 5. Two side effects the new edge type creates, and their fixes

- **Sibling-edge noise.** Without a guard, chapters of the same anthology would also form ordinary pairwise shared-citation edges with each other (they constantly cite the same Gold/Klein cross-references), producing a dense, uninformative clique layered on top of the new spokes. Fix: when building `bookEdgeMap` in `rebuildCitationGraph()`, skip any pair where both books have the same non-null `partOf` value. Sibling relatedness is already shown by the spokes; only cross-anthology relationships need the thin shared-citation lines.
- **Hub-threshold inflation.** `establishedKeys()` promotes a citation to its own diamond hub node once `citationToBooks[key].length >= recoThreshold` (default 4) — one vote per citing book. Splitting one anthology into 27 books means a citation reused across several of its own chapters would alone cross that threshold, misrepresenting internal cross-referencing within one volume as "established infrastructure" across the whole reading list. Fix: the threshold check counts distinct *families* (`familyId(id) = bookById[id].partOf || id`) rather than distinct book ids, so the whole anthology contributes at most one vote toward hub promotion — matching how every other (non-split) book already behaves. The hub's `citedBy` list (which drives the actual `citeEdges` spokes) is untouched and still lists every individual citing chapter.

### 6. Chapters stay out of the three "every book, flattened" views

The Reading List panel, the stats bar, and the Citation Matrix all currently enumerate `books` directly. Chapters should not appear in any of them (structural sub-nodes, not independent reading-list entries — confirmed with user). Introduce `const mainBooks = books.filter(b => b.nodeType !== 'chapter')` and swap it in for:
- `renderReadingList()`'s subject grouping
- `renderStatsBar()`'s `books.length` / `populatedBookCount` / core-pill counts
- `matrixOrder()`'s population

`allNodes()`, `bookEdges`, `citeEdges`, and the Network Graph itself are untouched by this filter — chapters fully participate there, which is the entire point.

To make (6)'s filter and (5)'s family-dedup work, each chapter's in-memory node object needs `nodeType: 'chapter'` set at load time (parallel to the existing `nodeType: 'citation'` tag on citation-hub nodes), derived from the presence of a `partOf` field — not a new JSON field, just a runtime tag assigned once when `books` is loaded.

### 7. Visual styling

A third color family, distinct from the existing magenta (category-core) and gold (citation-hub):

- Chapter node fill/stroke: muted slate-blue, `rgb(70, 90, 140)`.
- `.exams-link-partof`: same slate-blue, `stroke-width: 2; stroke-opacity: 0.5` — bolder than the existing pale shared-citation line (`1.5 / 0.2`), reading as a clearly stronger bond than "these two books happen to share a citation."
- One new legend entry pairing the slate-blue dot and line, placed next to the existing "Recommended" diamond legend line.
- The parent node (`debates-23`) needs no special styling — its size grows naturally from degree once its 27 children link to it.
- Chapter nodes open the normal book detail panel on click (`openPanel`, not `openCitationPanel`) — this requires no new code, since the existing click handler already branches only on `nodeType === 'citation'` and falls through to `openPanel` for everything else, which chapters correctly are.

## Explicitly out of scope

- Auditing the wider ~12,600-entry bibliography corpus for the same near-duplicate-citation problem from earlier transcription sessions.
- Any UI toggle to show/hide chapter nodes independently (they're always visible, same as any other selected book).
- Retroactively splitting any other multi-chapter/edited-volume book already in the corpus (e.g. `new-media`, `bitstreams`'s underlying essays are single-authored so don't apply) — this design covers `debates-23` only.
- Changing how the Citation Matrix or hub-diamond rendering works for non-chapter books.

## Files touched

- `_data/exams.json` — the `debates-23` entry, 27 new chapter entries, folded citation keys.
- `phd/exams/index.html` — new `partOf` handling: `nodeType: 'chapter'` tagging, `partOfEdges` construction + force + render layer, sibling-edge skip in `rebuildCitationGraph()`, family-based hub-threshold counting, `mainBooks` filter in the three list/stat views, new CSS class, new legend entry.
