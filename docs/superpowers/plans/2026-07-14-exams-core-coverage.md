# PhD Exams Core Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing PhD exams visualization (`phd/exams/index.html`) to show the user's Core exam selections against the full 55-text department Core reading list, so the user can see how their picks are shaping up against the field.

**Architecture:** Add a `selected` boolean to every book record in `_data/exams.json` (backfilled `true` on the 62 existing entries, `false` on 27 newly-transcribed Core master-list entries that weren't picked). No new files, no new views — the existing Network Graph, Reading List, and Stats Bar in `phd/exams/index.html` get targeted additions: an opt-in "Show Full Field" toggle, a dimmed unselected-book render state, and a Core-scoped stats pill.

**Tech Stack:** Same as the existing page — Jekyll `_data/exams.json` read via Liquid `jsonify`, vanilla JS + D3 v7, no build step.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-14-exams-core-coverage-design.md`.
- Scoped to Core only — Primary/Secondary/Independent Study have no external master list and are untouched by this work.
- `selected` is a boolean on every book. Existing 62 entries: `true`. New unmatched Core master-list entries: `false`.
- Unselected entries get `categories: ["core"]` (not empty) so they participate in the existing Category filter, plus a `subject` from the existing 7-value taxonomy (`media-tech-theory`, `dh-field-methods`, `data-algorithmic-justice`, `postcolonial-visual-theory`, `electronic-literature`, `game-studies`, `critical-making-practice`). No new subjects are introduced.
- Network Graph "Show Full Field" toggle defaults to **off** — the graph's default look is unchanged unless the user opts in.
- Stats bar coverage pill is Core-scoped (`Core: 28 of 55 selected · 2 TBD`), not a whole-list ratio — Primary/Secondary/Independent Study are trivially 100% "selected" by definition.
- No automated JS test runner exists in this repo (no `package.json`). Verification is `bundle exec jekyll build` for syntax/rendering correctness plus manual browser checklists, matching the precedent set by `docs/superpowers/plans/2026-07-01-exams-citation-network.md`.
- The 55-entry master Core list is reproduced in the spec's appendix; 28 of those 55 titles already match existing `core`-category books in `_data/exams.json` (matched by normalized title/author, verified by script during plan-writing). The 27 that don't match are the ones added in Task 2 below.

---

### Task 1: Backfill `selected: true` on all existing book entries

**Files:**
- Modify: `_data/exams.json`

**Interfaces:**
- Produces: every existing book object gains `"selected": true`, consumed by Task 2 (new entries must NOT collide with this field's meaning) and Tasks 3-5 (frontend reads `d.selected`).

- [ ] **Step 1: Run the backfill script**

```bash
cd /home/user/portfolio
python3 << 'PYEOF'
import json

path = '_data/exams.json'
with open(path) as f:
    data = json.load(f)

for book in data['books']:
    book['selected'] = True

with open(path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write('\n')
PYEOF
```

- [ ] **Step 2: Verify every book has `selected: true`**

```bash
python3 -c "
import json
data = json.load(open('_data/exams.json'))
books = data['books']
assert len(books) == 62, 'expected 62 books before Task 2, got ' + str(len(books))
assert all(b.get('selected') is True for b in books), 'not all books got selected=True'
print('OK:', len(books), 'books, all selected=True')
"
```

Expected: `OK: 62 books, all selected=True`

- [ ] **Step 3: Validate the file is still valid JSON consumable by Jekyll**

```bash
cd /home/user/portfolio && bundle exec jekyll build 2>&1 | tail -10
```

Expected: `done in X seconds`, no Liquid or JSON parse errors.

- [ ] **Step 4: Commit**

```bash
git add _data/exams.json
git commit -m "feat: backfill selected=true on all existing exam book entries"
```

---

### Task 2: Add the 27 unselected Core master-list entries

**Files:**
- Modify: `_data/exams.json`

**Interfaces:**
- Consumes: `selected` field convention from Task 1.
- Produces: 27 new book objects with `selected: false`, `categories: ["core"]`, and one of the 7 existing `subject` values — consumed by Tasks 3-5's rendering logic and by the Task 5 stats-pill math (`Core: 28 of 55 selected · 2 TBD`).

- [ ] **Step 1: Run the append script**

```bash
cd /home/user/portfolio
python3 << 'PYEOF'
import json

path = '_data/exams.json'
with open(path) as f:
    data = json.load(f)

new_books = [
  {
    "id": "bailey-misogynoir",
    "title": "Misogynoir Transformed: Black Women's Digital Resistance",
    "author": "Bailey, Moya",
    "year": 2021,
    "field": "Texts & Technology",
    "subject": "data-algorithmic-justice",
    "container": "",
    "type": "Book",
    "publisher": "NYU Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "benjamin-race-tech",
    "title": "Race After Technology: Abolitionist Tools for the New Jim Code",
    "author": "Benjamin, Ruha",
    "year": 2019,
    "field": "Texts & Technology",
    "subject": "data-algorithmic-justice",
    "container": "",
    "type": "Book",
    "publisher": "Polity",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "brock-distributed-blackness",
    "title": "Distributed Blackness: African American Cybercultures",
    "author": "Brock, Jr., André",
    "year": 2020,
    "field": "Texts & Technology",
    "subject": "data-algorithmic-justice",
    "container": "",
    "type": "Book",
    "publisher": "NYU Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "cohen-rosenzweig-digital-history",
    "title": "Digital History: A Guide to Gathering, Preserving, and Presenting the Past on the Web",
    "author": "Cohen, Daniel J. and Roy Rosenzweig",
    "year": 2005,
    "field": "Texts & Technology",
    "subject": "dh-field-methods",
    "container": "",
    "type": "Book",
    "publisher": "University of Pennsylvania Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "crymble-technology-historian",
    "title": "Technology and the Historian: Transformations in the Digital Age",
    "author": "Crymble, Adam",
    "year": 2021,
    "field": "Texts & Technology",
    "subject": "dh-field-methods",
    "container": "",
    "type": "Book",
    "publisher": "University of Illinois Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "dekosnik-rogue-archives",
    "title": "Rogue Archives: Digital Cultural Memory and Media Fandom",
    "author": "De Kosnik, Abigail",
    "year": 2016,
    "field": "Texts & Technology",
    "subject": "dh-field-methods",
    "container": "",
    "type": "Book",
    "publisher": "MIT Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "gonzales-multilingual",
    "title": "Designing Multilingual Experiences in Technical Communication",
    "author": "Gonzales, Laura",
    "year": 2022,
    "field": "Texts & Technology",
    "subject": "dh-field-methods",
    "container": "",
    "type": "Book",
    "publisher": "Utah State University Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "gray-intersectional-tech",
    "title": "Intersectional Tech: Black Users in Digital Gaming",
    "author": "Gray, Kishonna L.",
    "year": 2020,
    "field": "Texts & Technology",
    "subject": "game-studies",
    "container": "",
    "type": "Book",
    "publisher": "LSU Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "headrick-information-age",
    "title": "When Information Came of Age: Technologies of Knowledge in the Age of Reason and Revolution, 1700-1850",
    "author": "Headrick, Daniel R.",
    "year": 2002,
    "field": "Texts & Technology",
    "subject": "dh-field-methods",
    "container": "",
    "type": "Book",
    "publisher": "Oxford University Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "jackson-hashtagactivism",
    "title": "#HashtagActivism: Networks of Race and Gender Justice",
    "author": "Jackson, Sarah J., Moya Bailey, and Brooke Foucault Welles",
    "year": 2020,
    "field": "Texts & Technology",
    "subject": "data-algorithmic-justice",
    "container": "",
    "type": "Book",
    "publisher": "MIT Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "kuhn-structure-scientific-revolutions",
    "title": "The Structure of Scientific Revolutions",
    "author": "Kuhn, Thomas S.",
    "year": 2012,
    "field": "Texts & Technology",
    "subject": "dh-field-methods",
    "container": "",
    "type": "Book",
    "publisher": "University of Chicago Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "lehrer-curating-difficult-knowledge",
    "title": "Curating Difficult Knowledge: Violent Pasts in Public Places",
    "author": "Lehrer, E., C. Milton, and M. Patterson, eds.",
    "year": 2011,
    "field": "Texts & Technology",
    "subject": "postcolonial-visual-theory",
    "container": "",
    "type": "Book",
    "publisher": "Palgrave MacMillan",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "littman-code-to-joy",
    "title": "Code to Joy: Why Everyone Should Learn a Little Programming",
    "author": "Littman, Michael L.",
    "year": 2023,
    "field": "Texts & Technology",
    "subject": "critical-making-practice",
    "container": "",
    "type": "Book",
    "publisher": "MIT Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "losh-wernimont-bodies-of-information",
    "title": "Bodies of Information: Intersectional Feminism and the Digital Humanities",
    "author": "Losh, Elizabeth and Jacqueline Wernimont, eds.",
    "year": 2019,
    "field": "Texts & Technology",
    "subject": "data-algorithmic-justice",
    "container": "",
    "type": "Book",
    "publisher": "Univ Of Minnesota Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "martinez-counterstory",
    "title": "Counterstory: The Rhetoric and Writing of Critical Race Theory",
    "author": "Martinez, Aja Y.",
    "year": 2020,
    "field": "Texts & Technology",
    "subject": "data-algorithmic-justice",
    "container": "",
    "type": "Book",
    "publisher": "National Council of Teachers of English",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "mckinney-information-activism",
    "title": "Information Activism: A Queer History of Lesbian Media Technologies",
    "author": "McKinney, Cait",
    "year": 2020,
    "field": "Texts & Technology",
    "subject": "data-algorithmic-justice",
    "container": "",
    "type": "Book",
    "publisher": "Duke University Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "milligan-history-abundance",
    "title": "History in the Age of Abundance?: How the Web Is Transforming Historical Research",
    "author": "Milligan, Ian",
    "year": 2019,
    "field": "Texts & Technology",
    "subject": "dh-field-methods",
    "container": "",
    "type": "Book",
    "publisher": "McGill-Queen's University Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "miron-indigenous-archival-activism",
    "title": "Indigenous Archival Activism: Mohican Interventions in Public History and Memory",
    "author": "Miron, Rose",
    "year": 2024,
    "field": "Texts & Technology",
    "subject": "postcolonial-visual-theory",
    "container": "",
    "type": "Book",
    "publisher": "Univ Of Minnesota Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "misa-leonardo-internet",
    "title": "Leonardo to the Internet: Technology and Culture from the Renaissance to the Present",
    "author": "Misa, Thomas J.",
    "year": 2022,
    "field": "Texts & Technology",
    "subject": "media-tech-theory",
    "container": "",
    "type": "Book",
    "publisher": "JHU Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "mullaney-your-computer-is-on-fire",
    "title": "Your Computer Is on Fire",
    "author": "Mullaney, Thomas S., Benjamin Peters, Mar Hicks, and Kavita Philip, eds.",
    "year": 2021,
    "field": "Texts & Technology",
    "subject": "media-tech-theory",
    "container": "",
    "type": "Book",
    "publisher": "MIT Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "raign-origins-professional-writing",
    "title": "The Origins of the Art and Practice of Professional Writing: The Written Word as a Tool for Social Justice Then and Now",
    "author": "Raign, Kathryn Rosser",
    "year": 2024,
    "field": "Texts & Technology",
    "subject": "dh-field-methods",
    "container": "",
    "type": "Book",
    "publisher": "State University of New York Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "rose-holloway-interpreting-difficult-history",
    "title": "Interpreting Difficult History at Museums and Historic Sites",
    "author": "Rose, Julia and Jonathan Holloway",
    "year": 2016,
    "field": "Texts & Technology",
    "subject": "postcolonial-visual-theory",
    "container": "",
    "type": "Book",
    "publisher": "Rowman & Littlefield",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "steele-digital-black-feminism",
    "title": "Digital Black Feminism",
    "author": "Steele, Catherine Knight",
    "year": 2021,
    "field": "Texts & Technology",
    "subject": "data-algorithmic-justice",
    "container": "",
    "type": "Book",
    "publisher": "NYU Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "steele-lu-winstead-black-dh",
    "title": "Doing Black Digital Humanities with Radical Intentionality",
    "author": "Steele, Catherine Knight, Jessica H. Lu, and Kevin C. Winstead",
    "year": 2023,
    "field": "Texts & Technology",
    "subject": "data-algorithmic-justice",
    "container": "",
    "type": "Book",
    "publisher": "Routledge",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "tham-design-thinking",
    "title": "Design Thinking in Technical Communication: Solving Problems through Making and Collaboration",
    "author": "Tham, Jason",
    "year": 2021,
    "field": "Texts & Technology",
    "subject": "dh-field-methods",
    "container": "",
    "type": "Book",
    "publisher": "Routledge",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "vee-coding-literacy",
    "title": "Coding Literacy: How Computer Programming Is Changing Writing",
    "author": "Vee, Annette",
    "year": 2017,
    "field": "Texts & Technology",
    "subject": "critical-making-practice",
    "container": "",
    "type": "Book",
    "publisher": "MIT Press",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
  {
    "id": "walton-moore-jones-technical-communication",
    "title": "Technical Communication After the Social Justice Turn: Building Coalitions for Action",
    "author": "Walton, Rebecca, Kristen Moore, and Natasha Jones",
    "year": 2019,
    "field": "Texts & Technology",
    "subject": "dh-field-methods",
    "container": "",
    "type": "Book",
    "publisher": "Routledge",
    "citations": [],
    "categories": ["core"],
    "selected": False
  },
]

assert len(new_books) == 27, 'expected 27 new entries, got ' + str(len(new_books))
existing_ids = set(b['id'] for b in data['books'])
for b in new_books:
    assert b['id'] not in existing_ids, 'id collision: ' + b['id']

data['books'].extend(new_books)

with open(path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write('\n')
PYEOF
```

- [ ] **Step 2: Verify the counts match the design spec's Core coverage math**

```bash
python3 -c "
import json
data = json.load(open('_data/exams.json'))
books = data['books']
assert len(books) == 89, 'expected 89 total books, got ' + str(len(books))

core = [b for b in books if 'core' in b.get('categories', [])]
titled_core = [b for b in core if b.get('title')]
tbd_core = [b for b in core if not b.get('title')]
selected_core = [b for b in titled_core if b.get('selected') is not False]
unselected_core = [b for b in titled_core if b.get('selected') is False]

assert len(core) == 57, 'expected 57 core-tagged books, got ' + str(len(core))
assert len(tbd_core) == 2, 'expected 2 TBD placeholders, got ' + str(len(tbd_core))
assert len(titled_core) == 55, 'expected 55 titled core books, got ' + str(len(titled_core))
assert len(selected_core) == 28, 'expected 28 selected core books, got ' + str(len(selected_core))
assert len(unselected_core) == 27, 'expected 27 unselected core books, got ' + str(len(unselected_core))

VALID_SUBJECTS = {'media-tech-theory','dh-field-methods','data-algorithmic-justice',
                   'postcolonial-visual-theory','electronic-literature','game-studies',
                   'critical-making-practice'}
for b in unselected_core:
    assert b.get('subject') in VALID_SUBJECTS, 'bad subject on ' + b['id'] + ': ' + str(b.get('subject'))
    assert b.get('categories') == ['core'], 'bad categories on ' + b['id']
    assert b.get('citations') == [], 'unselected book should have no citations: ' + b['id']

print('OK: 89 total, 57 core-tagged (55 titled + 2 TBD), 28 selected, 27 unselected, all subjects valid')
"
```

Expected: `OK: 89 total, 57 core-tagged (55 titled + 2 TBD), 28 selected, 27 unselected, all subjects valid`

- [ ] **Step 3: Validate the file still builds**

```bash
cd /home/user/portfolio && bundle exec jekyll build 2>&1 | tail -10
```

Expected: `done in X seconds`, no Liquid or JSON parse errors.

- [ ] **Step 4: Commit**

```bash
git add _data/exams.json
git commit -m "feat: transcribe 27 unselected Core master-list texts"
```

---

### Task 3: Network Graph support for unselected books

**Files:**
- Modify: `phd/exams/index.html`

**Interfaces:**
- Consumes: `d.selected` (boolean, from Task 1/2) on every non-citation node.
- Produces: `showFullField` module-level boolean and its toggle button `#exams-fullfield-toggle`, consumed by Task 4 only insofar as `applyVisibility()`/`nodeVisible()` stay the single source of truth for node visibility (Task 4 doesn't touch the Network Graph).

- [ ] **Step 1: Add CSS for the new toggle button**

In `phd/exams/index.html`, the existing `.exams-filter-btn.reco-type-btn.type-online` / `.active` rules end at line 79 (`.exams-filter-btn.reco-type-btn.type-online.active { background: rgb(6, 97, 122); color: #f8f8ff; }`). Immediately after that line, add:

```css
.exams-filter-btn.fullfield-btn { color: #777; border-color: #999; }
.exams-filter-btn.fullfield-btn.active { background: #777; color: #f8f8ff; }
```

- [ ] **Step 2: Add the toggle button to the controls markup**

Find this block (around line 602-605):

```html
      <div class="exams-filter-group">
        <button class="exams-filter-btn links-btn active" id="exams-links-toggle">Links</button>
        <button class="exams-filter-btn reco-btn active" id="exams-recommended-toggle">Recommended</button>
      </div>
```

Replace with:

```html
      <div class="exams-filter-group">
        <button class="exams-filter-btn links-btn active" id="exams-links-toggle">Links</button>
        <button class="exams-filter-btn reco-btn active" id="exams-recommended-toggle">Recommended</button>
        <button class="exams-filter-btn fullfield-btn" id="exams-fullfield-toggle">Show Full Field</button>
      </div>
```

- [ ] **Step 3: Add a legend line explaining the grey unselected nodes**

Find this line inside `#exams-legend` (around line 651):

```html
      <span><span class="exams-legend-diamond"></span>Recommended: a citation shared by enough of the transcribed books to count as established infrastructure</span>
    </div>
```

Replace with:

```html
      <span><span class="exams-legend-diamond"></span>Recommended: a citation shared by enough of the transcribed books to count as established infrastructure</span>
      <span><span class="exams-legend-dot" style="background: rgba(120,120,120,0.5)"></span>Full Field (toggle): Core reading-list texts I didn't select</span>
    </div>
```

- [ ] **Step 4: Add unselected-node color constants**

Find (around line 717-719):

```js
  const RECOMMENDED_COLOR = 'rgb(163, 122, 8)';
  const RECOMMENDED_FILL = 'rgba(163, 122, 8, 0.22)';
```

Replace with:

```js
  const RECOMMENDED_COLOR = 'rgb(163, 122, 8)';
  const RECOMMENDED_FILL = 'rgba(163, 122, 8, 0.22)';

  const UNSELECTED_FILL = 'rgba(120, 120, 120, 0.14)';
  const UNSELECTED_STROKE = 'rgba(120, 120, 120, 0.45)';
```

- [ ] **Step 5: Give unselected book nodes a distinct fill and suppress their category ring**

Find `redrawNodeSizes()` (around line 944-964):

```js
  function redrawNodeSizes() {
    nodeG.select('circle')
      .attr('r', d => nodeRadius(d.id))
      .attr('fill', d => CATEGORY_FILL[d.categories[0]]);
    nodeG.select('.exams-node-diamond')
      .attr('d', d => diamondPath(nodeRadius(d.id)))
      .attr('fill', RECOMMENDED_FILL)
      .attr('stroke', RECOMMENDED_COLOR);
    nodeG.select('.exams-node-label')
      .attr('y', d => -nodeRadius(d.id) - 5)
      .text(d => d.title.length > 24 ? d.title.slice(0, 24) + '…' : d.title);
    nodeG.select('.exams-node-ring').each(function (d) {
      const r = nodeRadius(d.id);
      const arcGen = d3.arc().innerRadius(r).outerRadius(r + 3);
      d3.select(this).selectAll('path')
        .data(CATEGORY_PIE(d.categories))
        .join('path')
        .attr('d', arcGen)
        .attr('fill', p => CATEGORY_COLOR[p.data]);
    });
  }
```

Replace with:

```js
  function redrawNodeSizes() {
    nodeG.select('circle')
      .attr('r', d => nodeRadius(d.id))
      .attr('fill', d => d.selected === false ? UNSELECTED_FILL : CATEGORY_FILL[d.categories[0]])
      .attr('stroke', d => d.selected === false ? UNSELECTED_STROKE : null);
    nodeG.select('.exams-node-diamond')
      .attr('d', d => diamondPath(nodeRadius(d.id)))
      .attr('fill', RECOMMENDED_FILL)
      .attr('stroke', RECOMMENDED_COLOR);
    nodeG.select('.exams-node-label')
      .attr('y', d => -nodeRadius(d.id) - 5)
      .text(d => d.title.length > 24 ? d.title.slice(0, 24) + '…' : d.title);
    nodeG.select('.exams-node-ring').each(function (d) {
      const r = nodeRadius(d.id);
      const arcGen = d3.arc().innerRadius(r).outerRadius(r + 3);
      d3.select(this).selectAll('path')
        .data(CATEGORY_PIE(d.selected === false ? [] : d.categories))
        .join('path')
        .attr('d', arcGen)
        .attr('fill', p => CATEGORY_COLOR[p.data]);
    });
  }
```

- [ ] **Step 6: Add the `showFullField` state variable**

Find (around line 1005-1008):

```js
  const activeCategories = new Set();
  const activeRecoTypes = new Set();
  let showLinks = true;
  let showRecommended = true;
```

Replace with:

```js
  const activeCategories = new Set();
  const activeRecoTypes = new Set();
  let showLinks = true;
  let showRecommended = true;
  let showFullField = false;
```

- [ ] **Step 7: Hide unselected books from the graph unless the toggle is on**

Find `nodeVisible()` (around line 1014-1022):

```js
  function nodeVisible(d) {
    if (d.nodeType === 'citation') {
      if (!showRecommended) return false;
      if (activeRecoTypes.size > 0 && !activeRecoTypes.has(d.recoType)) return false;
      if (activeCategories.size === 0) return true;
      return d.citedBy.some(id => bookById[id] && categoryMatch(bookById[id].categories));
    }
    return categoryMatch(d.categories);
  }
```

Replace with:

```js
  function nodeVisible(d) {
    if (d.nodeType === 'citation') {
      if (!showRecommended) return false;
      if (activeRecoTypes.size > 0 && !activeRecoTypes.has(d.recoType)) return false;
      if (activeCategories.size === 0) return true;
      return d.citedBy.some(id => bookById[id] && categoryMatch(bookById[id].categories));
    }
    if (d.selected === false && !showFullField) return false;
    return categoryMatch(d.categories);
  }
```

- [ ] **Step 8: Wire up the toggle button's click listener**

Find (around line 1068-1072):

```js
  document.getElementById('exams-recommended-toggle').addEventListener('click', function () {
    showRecommended = !showRecommended;
    this.classList.toggle('active', showRecommended);
    applyVisibility();
  });
```

Replace with:

```js
  document.getElementById('exams-recommended-toggle').addEventListener('click', function () {
    showRecommended = !showRecommended;
    this.classList.toggle('active', showRecommended);
    applyVisibility();
  });

  document.getElementById('exams-fullfield-toggle').addEventListener('click', function () {
    showFullField = !showFullField;
    this.classList.toggle('active', showFullField);
    applyVisibility();
  });
```

- [ ] **Step 9: Reset `showFullField` in the Clear Filters handler**

Find (around line 1122-1127, inside the `exams-clear` click listener):

```js
  document.getElementById('exams-clear').addEventListener('click', () => {
    activeCategories.clear();
    activeRecoTypes.clear();
    showLinks = true;
    showRecommended = true;
    recoThresholdPercent = 30;
```

Replace with:

```js
  document.getElementById('exams-clear').addEventListener('click', () => {
    activeCategories.clear();
    activeRecoTypes.clear();
    showLinks = true;
    showRecommended = true;
    showFullField = false;
    recoThresholdPercent = 30;
```

- [ ] **Step 10: Give the detail panel a distinct badge for unselected books**

Find `openPanel()` (around line 1244-1256):

```js
  function openPanel(d) {
    const panel = document.getElementById('exams-panel');
    panel.classList.add('open');
    const badgesEl = document.getElementById('exams-panel-badges');
    badgesEl.innerHTML = '';
    d.categories.forEach(cat => {
      const pill = document.createElement('span');
      pill.className = 'exams-panel-badge';
      pill.textContent = cat;
      pill.style.background = CATEGORY_COLOR[cat];
      badgesEl.appendChild(pill);
    });
    document.getElementById('exams-panel-title').textContent = d.title;
```

Replace with:

```js
  function openPanel(d) {
    const panel = document.getElementById('exams-panel');
    panel.classList.add('open');
    const badgesEl = document.getElementById('exams-panel-badges');
    badgesEl.innerHTML = '';
    if (d.selected === false) {
      const pill = document.createElement('span');
      pill.className = 'exams-panel-badge';
      pill.textContent = 'core · not selected';
      pill.style.background = '#777';
      badgesEl.appendChild(pill);
    } else {
      d.categories.forEach(cat => {
        const pill = document.createElement('span');
        pill.className = 'exams-panel-badge';
        pill.textContent = cat;
        pill.style.background = CATEGORY_COLOR[cat];
        badgesEl.appendChild(pill);
      });
    }
    document.getElementById('exams-panel-title').textContent = d.title;
```

- [ ] **Step 11: Build the site**

```bash
cd /home/user/portfolio && bundle exec jekyll build 2>&1 | tail -20
```

Expected: `done in X seconds`, no Liquid errors.

- [ ] **Step 12: Serve and manually verify in a browser**

```bash
cd /home/user/portfolio && bundle exec jekyll serve
```

Open `http://localhost:4000/phd/exams/` (Network Graph tab, the default) and verify:

- [ ] The graph looks exactly as it did before this change — no grey nodes visible, "Show Full Field" button present but inactive
- [ ] Clicking "Show Full Field" reveals additional small grey circular nodes with no colored ring, roughly clustered toward the Core third of the layout
- [ ] Clicking "Show Full Field" again hides them
- [ ] With "Show Full Field" on, clicking a grey node opens the detail panel with a single grey "core · not selected" badge, correct title/author/year, and no citation list
- [ ] With "Show Full Field" on, clicking "Clear filters" turns the toggle off and hides the grey nodes again
- [ ] With "Show Full Field" on and the "Core" category filter active, only Core nodes (selected and unselected) show — Primary/Secondary/Independent Study nodes still hide correctly

- [ ] **Step 13: Commit**

```bash
git add phd/exams/index.html
git commit -m "feat: add Show Full Field toggle for unselected Core books in network graph"
```

---

### Task 4: Reading List view support for unselected books

**Files:**
- Modify: `phd/exams/index.html`

**Interfaces:**
- Consumes: `d.selected` (from Task 1/2), `openPanel()`'s unselected-badge branch (from Task 3 Step 10).
- Produces: `.exams-subject-book.unselected` CSS state, consumed only visually (no other task depends on it).

- [ ] **Step 1: Add CSS for the unselected reading-list row state**

Find the end of the `.exams-subject-book.untranscribed` rule block (around line 536-539):

```css
.exams-subject-book.untranscribed .exams-subject-book-title {
  color: #999;
  font-style: italic;
}
```

Immediately after it, add:

```css
.exams-subject-book.unselected .exams-subject-book-title {
  color: #bbb;
}

.exams-subject-book.unselected .exams-subject-book-stat {
  color: #bbb;
}
```

- [ ] **Step 2: Render unselected books with the new state, no category dot, and "not selected" status text**

Find the `sorted.forEach(b => { ... })` loop inside `renderReadingList()` (around line 1349-1390):

```js
      sorted.forEach(b => {
        const populated = (b.citations || []).length > 0;
        const row = document.createElement('div');
        row.className = 'exams-subject-book' + (populated ? '' : ' untranscribed');
        const titleEl = document.createElement('div');
        titleEl.className = 'exams-subject-book-title';
        titleEl.textContent = b.title || '(untitled)';
        row.appendChild(titleEl);
        const metaEl = document.createElement('div');
        metaEl.className = 'exams-subject-book-meta';
        (b.categories || []).forEach(cat => {
          const dot = document.createElement('span');
          dot.className = 'exams-subject-book-catdot';
          dot.style.background = CATEGORY_COLOR[cat] || '#999';
          dot.title = cat;
          metaEl.appendChild(dot);
        });
        const authorEl = document.createElement('span');
        authorEl.textContent = (b.author || '') + (b.year ? ' · ' + b.year : '');
        metaEl.appendChild(authorEl);
        if (populated) {
          const hubCount = (b.citations || []).filter(entry => established.has(citationKey(entry))).length;
          const statEl = document.createElement('span');
          statEl.className = 'exams-subject-book-stat';
          statEl.textContent = (degree[b.id] || 0) + '◗';
          metaEl.appendChild(statEl);
          if (hubCount > 0) {
            const hubEl = document.createElement('span');
            hubEl.className = 'exams-subject-book-hubs';
            hubEl.textContent = '◆' + hubCount;
            metaEl.appendChild(hubEl);
          }
        } else {
          const statEl = document.createElement('span');
          statEl.className = 'exams-subject-book-stat';
          statEl.textContent = 'not yet transcribed';
          metaEl.appendChild(statEl);
        }
        row.appendChild(metaEl);
        if (b.title) row.addEventListener('click', () => openPanel(b));
        col.appendChild(row);
      });
```

Replace with:

```js
      sorted.forEach(b => {
        const populated = (b.citations || []).length > 0;
        const unselected = b.selected === false;
        const row = document.createElement('div');
        row.className = 'exams-subject-book' + (unselected ? ' unselected' : (populated ? '' : ' untranscribed'));
        const titleEl = document.createElement('div');
        titleEl.className = 'exams-subject-book-title';
        titleEl.textContent = b.title || '(untitled)';
        row.appendChild(titleEl);
        const metaEl = document.createElement('div');
        metaEl.className = 'exams-subject-book-meta';
        if (!unselected) {
          (b.categories || []).forEach(cat => {
            const dot = document.createElement('span');
            dot.className = 'exams-subject-book-catdot';
            dot.style.background = CATEGORY_COLOR[cat] || '#999';
            dot.title = cat;
            metaEl.appendChild(dot);
          });
        }
        const authorEl = document.createElement('span');
        authorEl.textContent = (b.author || '') + (b.year ? ' · ' + b.year : '');
        metaEl.appendChild(authorEl);
        if (unselected) {
          const statEl = document.createElement('span');
          statEl.className = 'exams-subject-book-stat';
          statEl.textContent = 'not selected';
          metaEl.appendChild(statEl);
        } else if (populated) {
          const hubCount = (b.citations || []).filter(entry => established.has(citationKey(entry))).length;
          const statEl = document.createElement('span');
          statEl.className = 'exams-subject-book-stat';
          statEl.textContent = (degree[b.id] || 0) + '◗';
          metaEl.appendChild(statEl);
          if (hubCount > 0) {
            const hubEl = document.createElement('span');
            hubEl.className = 'exams-subject-book-hubs';
            hubEl.textContent = '◆' + hubCount;
            metaEl.appendChild(hubEl);
          }
        } else {
          const statEl = document.createElement('span');
          statEl.className = 'exams-subject-book-stat';
          statEl.textContent = 'not yet transcribed';
          metaEl.appendChild(statEl);
        }
        row.appendChild(metaEl);
        if (b.title) row.addEventListener('click', () => openPanel(b));
        col.appendChild(row);
      });
```

- [ ] **Step 3: Build the site**

```bash
cd /home/user/portfolio && bundle exec jekyll build 2>&1 | tail -20
```

Expected: `done in X seconds`, no Liquid errors.

- [ ] **Step 4: Serve and manually verify in a browser**

```bash
cd /home/user/portfolio && bundle exec jekyll serve
```

Open `http://localhost:4000/phd/exams/`, click the "Reading List" tab, and verify:

- [ ] Subject columns that contain unselected Core texts (e.g. "Data & Algorithmic Justice", "DH: Field & Methods") show extra rows in a lighter grey than the existing untranscribed-grey-italic rows, with no colored category dot
- [ ] Those rows' status text reads "not selected" instead of "not yet transcribed" or a hub-count badge
- [ ] Clicking one of those rows opens the detail panel with the grey "core · not selected" badge from Task 3
- [ ] Existing selected/transcribed and selected/untranscribed rows are visually unchanged from before this task

- [ ] **Step 5: Commit**

```bash
git add phd/exams/index.html
git commit -m "feat: render unselected Core books in the Reading List view"
```

---

### Task 5: Core-scoped stats bar pill

**Files:**
- Modify: `phd/exams/index.html`

**Interfaces:**
- Consumes: `books` array with `selected`/`categories` fields (from Task 1/2).

- [ ] **Step 1: Add the Core coverage pill to `renderStatsBar()`**

Find (around line 1398-1413):

```js
  function renderStatsBar() {
    const barEl = document.getElementById('exams-stats-bar');
    if (!barEl) return;
    const sharedSourceCount = Object.keys(citationToBooks).filter(k => citationToBooks[k].length >= 2).length;
    const stats = [
      [books.length, 'books'],
      [populatedBookCount, 'transcribed'],
      [SUBJECT_ORDER.length, 'subjects'],
      [bookEdges.length, 'shared-citation pairs'],
      [sharedSourceCount, 'shared sources']
    ];
    barEl.innerHTML = stats.map(([n, label]) =>
      '<span class="exams-stat-pill"><strong>' + n + '</strong> ' + label + '</span>'
    ).join('');
  }
```

Replace with:

```js
  function renderStatsBar() {
    const barEl = document.getElementById('exams-stats-bar');
    if (!barEl) return;
    const sharedSourceCount = Object.keys(citationToBooks).filter(k => citationToBooks[k].length >= 2).length;
    const stats = [
      [books.length, 'books'],
      [populatedBookCount, 'transcribed'],
      [SUBJECT_ORDER.length, 'subjects'],
      [bookEdges.length, 'shared-citation pairs'],
      [sharedSourceCount, 'shared sources']
    ];
    const coreBooks = books.filter(b => (b.categories || []).includes('core'));
    const coreTitled = coreBooks.filter(b => b.title);
    const coreTbd = coreBooks.length - coreTitled.length;
    const coreSelected = coreTitled.filter(b => b.selected !== false).length;
    const corePillHtml = '<span class="exams-stat-pill">Core: <strong>' + coreSelected +
      '</strong> of <strong>' + coreTitled.length + '</strong> selected · <strong>' + coreTbd + '</strong> TBD</span>';
    barEl.innerHTML = stats.map(([n, label]) =>
      '<span class="exams-stat-pill"><strong>' + n + '</strong> ' + label + '</span>'
    ).join('') + corePillHtml;
  }
```

- [ ] **Step 2: Build the site**

```bash
cd /home/user/portfolio && bundle exec jekyll build 2>&1 | tail -20
```

Expected: `done in X seconds`, no Liquid errors.

- [ ] **Step 3: Verify the pill's numbers in the built output**

```bash
grep -o "Core: <strong>[0-9]*</strong> of <strong>[0-9]*</strong> selected[^<]*<strong>[0-9]*</strong> TBD" _site/phd/exams/index.html
```

Expected: `Core: <strong>28</strong> of <strong>55</strong> selected · <strong>2</strong> TBD`

- [ ] **Step 4: Serve and manually verify in a browser**

```bash
cd /home/user/portfolio && bundle exec jekyll serve
```

Open `http://localhost:4000/phd/exams/` and verify:

- [ ] The stats bar above the view tabs shows a new pill reading "Core: 28 of 55 selected · 2 TBD" alongside the existing books/transcribed/subjects/pairs/sources pills
- [ ] The pill's numbers don't change when switching between Network Graph / Reading List / Citation Matrix tabs, or when adjusting the Recommended Threshold / Min Shared Citations sliders (it's independent of those, unlike the other pills)

- [ ] **Step 5: Commit**

```bash
git add phd/exams/index.html
git commit -m "feat: add Core-scoped selection coverage pill to stats bar"
```
