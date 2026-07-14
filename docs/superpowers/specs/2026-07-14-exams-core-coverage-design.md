# PhD Exams — Core Master List Coverage — Design Spec
**Date:** 2026-07-14
**Status:** Approved

## Overview

Extends the existing PhD comprehensive exams visualization (`phd/exams/`, spec: [2026-07-01-exams-citation-network-design.md](2026-07-01-exams-citation-network-design.md)) to show the user's Core selections in the context of the full department Core reading list, answering "how are my selections shaping up" against the field they're drawn from.

Scoped to **Core only**. Primary, Secondary, and Independent Study categories are self/committee-defined by the student — there is no external master list to compare against for those, and `_data/exams.json` already holds their complete, final lists. Only Core has a department-published pool (55 texts) larger than what the user picked from it (28 selected + 2 still-undecided `core-tbd-*` placeholders, out of 55).

## Data Model

Add one field to every book record in `_data/exams.json`: `selected` (boolean).

- All 62 existing entries get `selected: true`, backfilled explicitly (not left to default) so the data is self-describing.
- New entries transcribed from the Core master list that the user did **not** pick get:
  - `selected: false`
  - `categories: ["core"]` — tagging them as Core (not an empty array) keeps them inside the existing Category filter, so toggling "Core" already shows picks alongside the surrounding field, with no new filter axis needed.
  - `subject`: one of the existing 7 hand-curated subjects (`media-tech-theory`, `dh-field-methods`, `data-algorithmic-justice`, `postcolonial-visual-theory`, `electronic-literature`, `game-studies`, `critical-making-practice`), assigned by manual judgment call per text — the department list carries no subject tags, so this is curation work, not derivation. No new subjects are added as part of this work; a text that doesn't fit falls back to "Uncategorized" same as today.
  - `id`, `title`, `author`, `year`: required, transcribed from the source list.
  - `citations`, `lcsh`, `container`, `publisher`, `field`, `type`: optional, same as today's untranscribed entries — left empty unless the user later transcribes that book's own bibliography.

No changes to citation/publisher network logic. Unselected books simply won't have citation edges unless a future pass transcribes their bibliography; they may still pick up publisher-sharing edges if `publisher` is filled in.

## Reading List View (by-subject columns)

Add a third visual state to book rendering, alongside the two that already exist:

1. **Selected, transcribed** — unchanged: colored category dot, full-weight title, degree/hub stats.
2. **Selected, untranscribed** — unchanged: grey italic title (current behavior for any book with an empty `citations` array).
3. **Unselected** *(new)* — no category dot (nothing to show — not on the user's list), a lighter/smaller treatment distinct from the untranscribed-grey-italic state above, no degree stats. Clicking still opens the detail panel (title/author/year/subject) with no citations list.

No per-subject "N of M selected" count suffixes — those would misleadingly imply a comparable pool exists for every subject, when in fact only whichever subjects happen to contain Core-list texts have any unselected entries at all. The visual contrast between states 1/2 and state 3 within a subject column is sufficient.

## Stats Bar

One new pill, scoped to Core specifically (not a whole-list ratio, since Primary/Secondary/Independent Study are trivially 100% "selected" by definition):

> **Core: 28 of 55 selected · 2 TBD**

("TBD" reflects the two existing `core-tbd-19` / `core-tbd-29` placeholder slots already in the data.)

## Network Graph Toggle

New toggle button, **"Show full field"**, placed alongside the existing Links/Recommended toggles. Default **off** — the graph looks exactly as it does today unless the user opts in.

When on: unselected Core-list nodes render as small grey circles (no category ring, since `selected: false` books contribute no ring segments to draw). Because they carry `categories: ["core"]`, they participate in the existing `categoryXTarget` force and cluster near the Core third of the layout rather than floating centrally. They'll mostly appear edge-less (no citations transcribed) or connected only via shared-publisher edges — still informative as a density/clustering signal even without citation data.

## Out of Scope

- Primary, Secondary, Independent Study coverage — no external master list exists for these; not applicable.
- Transcribing citation bibliographies for newly-added unselected books — optional future work, not required for this feature.
- New subject categories — any unselected text that doesn't fit the existing 7 falls back to "Uncategorized."
- Resolving the two `core-tbd-*` placeholder slots — pre-existing, unrelated to this work.

## Data Entry

The department's Core Ph.D. Candidacy Exam Reading List (2025–2027), as provided by the user, is reproduced below for transcription reference. 30 of these 55 entries are already represented in `_data/exams.json` (matched by title/author against the existing `core` category books); the remaining ~25 need new entries per the schema above, including a manually-assigned `subject`.

<details>
<summary>Core Ph.D. Candidacy Exam Reading List 2025–2027 (55 entries)</summary>

1. Ahmed, Sara. 2019. *What's the Use?: On the Uses of Use.* Illustrated edition. Duke University Press Books.
2. Bailey, Moya. 2021. *Misogynoir Transformed: Black Women's Digital Resistance.* NYU Press.
3. Barthes, Roland. 1978. *Image-Music-Text.* Translated by Stephen Heath. Hill and Wang.
4. Baudrillard, Jean. 1994. *Simulacra and Simulation.* Translated by Sheila Faria Glaser. University of Michigan Press.
5. Benjamin, Ruha. 2019. *Race After Technology: Abolitionist Tools for the New Jim Code.* Polity.
6. Benjamin, Walter. [1936] 2006. "The Work of Art in the Age of Mechanical Reproduction." In *Media and Cultural Studies: KeyWorks*, edited by Meenakshi Gigi Durham and Douglas Kellner, Revised, 18–40. Blackwell.
7. Bogost, Ian. 2010. *Persuasive Games: The Expressive Power of Videogames.* The MIT Press.
8. Bolter, Jay David. 2001. *Writing Space: Computers, Hypertext, and the Remediation of Print.* Routledge.
9. Brock, Jr., André. 2020. *Distributed Blackness: African American Cybercultures.* NYU Press.
10. Chun, Wendy Hui Kyong. 2016. *Updating to Remain the Same: Habitual New Media.* The MIT Press.
11. Cohen, Daniel J., and Roy Rosenzweig. 2005. *Digital History: A Guide to Gathering, Preserving, and Presenting the Past on the Web.* University of Pennsylvania Press.
12. Costanza-Chock, Sasha. 2020. *Design Justice: Community-Led Practices to Build the Worlds We Need.* The MIT Press.
13. Crymble, Adam. 2021. *Technology and the Historian: Transformations in the Digital Age.* University of Illinois Press.
14. D'Ignazio, Catherine, and Lauren F. Klein. 2020. *Data Feminism.* The MIT Press.
15. De Kosnik, Abigail. 2016. *Rogue Archives: Digital Cultural Memory and Media Fandom.* The MIT Press.
16. Drucker, Johanna. 2021. *The Digital Humanities Coursebook.* Routledge.
17. Eubanks, Virginia. 2018. *Automating Inequality: How High-Tech Tools Profile, Police, and Punish the Poor.* St. Martin's Press.
18. Foucault, Michel. 1994. *The Order of Things: An Archaeology of the Human Sciences.* Vintage.
19. Gold, Matthew K., and Lauren F. Klein, eds. 2023. *Debates in the Digital Humanities 2023.* Univ Of Minnesota Press.
20. Gonzales, Laura. 2022. *Designing Multilingual Experiences in Technical Communication.* Utah State University Press.
21. Gray, Kishonna L. 2020. *Intersectional Tech: Black Users in Digital Gaming.* LSU Press.
22. Hall, Stuart. 2006. "Encoding/Decoding." In *Media and Cultural Studies: KeyWorks*, edited by Meenakshi Gigi Durham and Douglas Kellner, Revised, 163–73. Blackwell.
23. Haraway, Donna Jeanne. 1996. *Simians Cyborgs and Women.* London: Free Association Books.
24. Hayles, N. Katherine. 1999. *How We Became Posthuman: Virtual Bodies in Cybernetics, Literature, and Informatics.* University Of Chicago Press.
25. Headrick, Daniel R. 2002. *When Information Came of Age: Technologies of Knowledge in the Age of Reason and Revolution, 1700-1850.* Oxford University Press.
26. Jackson, Sarah J., Moya Bailey, and Brooke Foucault Welles. 2020. *#HashtagActivism: Networks of Race and Gender Justice.* The MIT Press.
27. Klein, Julie Thompson. 2015. *Interdisciplining Digital Humanities.* University of Michigan Press.
28. Kuhn, Thomas S. 2012. *The Structure of Scientific Revolutions.* University of Chicago Press.
29. Latour, Bruno. 2007. *Reassembling the Social: An Introduction to Actor-Network-Theory.* Oxford University Press.
30. Lehrer, E., C. Milton, and M. Patterson, eds. 2011. *Curating Difficult Knowledge: Violent Pasts in Public Places.* Palgrave MacMillan.
31. Littman, Michael L. 2023. *Code to Joy: Why Everyone Should Learn a Little Programming.* The MIT Press.
32. Losh, Elizabeth, and Jacqueline Wernimont, eds. 2019. *Bodies of Information: Intersectional Feminism and the Digital Humanities.* Univ Of Minnesota Press.
33. Manovich, Lev. 2020. *Cultural Analytics.* The MIT Press.
34. Martinez, Aja Y. 2020. *Counterstory: The Rhetoric and Writing of Critical Race Theory.* National Council of Teachers of English.
35. McKinney, Cait. 2020. *Information Activism: A Queer History of Lesbian Media Technologies.* Duke University Press Books.
36. Milligan, Ian. 2019. *History in the Age of Abundance?: How the Web Is Transforming Historical Research.* McGill-Queen's University Press.
37. Miron, Rose. 2024. *Indigenous Archival Activism: Mohican Interventions in Public History and Memory.* Univ Of Minnesota Press.
38. Misa, Thomas J. 2022. *Leonardo to the Internet: Technology and Culture from the Renaissance to the Present.* 3rd ed. JHU Press.
39. Montfort, Nick. 2021. *Exploratory Programming for the Arts and Humanities.* 2nd edition. The MIT Press.
40. Mueller, Derek N. 2017. *Network Sense: Methods for Visualizing a Discipline.* The WAC Clearinghouse; University Press of Colorado.
41. Mullaney, Thomas S., Benjamin Peters, Mar Hicks, and Kavita Philip, eds. 2021. *Your Computer Is on Fire.* The MIT Press.
42. Nakamura, Lisa. 2008. *Digitizing Race: Visual Cultures of the Internet.* University of Minnesota Press.
43. Noble, Safiya Umoja. 2018. *Algorithms of Oppression: How Search Engines Reinforce Racism.* NYU Press.
44. Ong, Walter J. 2002. *Orality and Literacy.* 2 edition. Routledge.
45. Raign, Kathryn Rosser. 2024. *The Origins of the Art and Practice of Professional Writing: The Written Word as a Tool for Social Justice Then and Now.* State University of New York Press.
46. Risam, Roopika. 2018. *New Digital Worlds: Postcolonial Digital Humanities in Theory, Praxis, and Pedagogy.* Northwestern University Press.
47. Rose, Gillian. 2023. *Visual Methodologies: An Introduction to Researching with Visual Materials.* Fifth edition. SAGE Publications Ltd.
48. Rose, Julia, and Jonathan Holloway. 2016. *Interpreting Difficult History at Museums and Historic Sites.* Rowman & Littlefield Publishers.
49. Said, Edward W. 1979. *Orientalism.* Vintage.
50. Steele, Catherine Knight. 2021. *Digital Black Feminism.* NYU Press.
51. Steele, Catherine Knight, Jessica H. Lu, and Kevin C. Winstead. 2023. *Doing Black Digital Humanities with Radical Intentionality.* Routledge.
52. Tham, Jason. 2021. *Design Thinking in Technical Communication: Solving Problems through Making and Collaboration.* Routledge.
53. Vee, Annette. 2017. *Coding Literacy: How Computer Programming Is Changing Writing.* The MIT Press.
54. Walton, Rebecca, Kristen Moore, and Natasha Jones. 2019. *Technical Communication After the Social Justice Turn: Building Coalitions for Action.* Routledge.
55. Wardrip-Fruin, Noah, and Nick Montfort. 2003. *The New Media Reader.* The MIT Press.

</details>

## Verification Plan

1. `bundle exec jekyll build` — confirm no Liquid/JSON errors after `_data/exams.json` changes.
2. Load `phd/exams/` and confirm the default (no-toggle) Network Graph view is visually unchanged from before this work.
3. Toggle "Show full field" on: confirm unselected Core nodes appear as small grey circles clustered in the Core region, with no ring/category color.
4. Switch to Reading List view: confirm unselected Core-list books appear in their assigned subject columns in the new dimmed state, distinct from both normal and untranscribed-grey-italic books.
5. Confirm the stats bar shows the "Core: 28 of 55 selected · 2 TBD" pill (counts to be re-verified against final transcribed data, in case the 30-vs-55 match count changes during transcription).
6. Click an unselected node in both views — confirm the detail panel opens with title/author/year/subject and no citation list, no crash.
