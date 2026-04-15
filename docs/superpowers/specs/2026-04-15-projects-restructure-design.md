# Portfolio Projects Restructure — Design Spec
_2026-04-15_

## Overview

Create a unified `/projects/` section as the canonical home for all standalone and course-based projects. Remove the CVs nav item (redundant with the floating CV button). Add "Projects" to the main nav. Build a D3-powered network graph as the projects index page.

---

## 1. Directory Restructure

All projects move into a flat `/projects/` directory. No subfolders — tags handle organization.

| Source | Destination |
|--------|-------------|
| `/criticalmaking/map.html` | `/projects/map/` |
| `/criticalmaking/sasb.html` + `sasb-canvas.html` | `/projects/sasb/` |
| `/presentations/oppression-aesthetic/` | `/projects/oppression-aesthetic/` |
| `/phd/projects/henryviii/` | `/projects/henryviii/` |
| `/phd/projects/smt/` | `/projects/smt/` |
| `/phd/projects/bot/` | `/projects/bot/` |
| `/tools/combat/` | `/projects/combat/` |

Old source directories are removed after moving. `/presentations/` retains only `texts-tech/`.

The criticalmaking items (`map`, `sasb`) currently exist as raw `.html` files with no Jekyll front matter. Each needs a proper `index.md` (or Jekyll-compatible `index.html`) created with layout and tags.

---

## 2. Projects Index — Network Graph

`/projects/index.md` renders a D3 v7 force-directed network graph (same library as the SMT graph already in the codebase).

### Node types
- **Project nodes** — one per project, labeled with project name, navigates to project page on click
- **Tag nodes** — one per unique tag, visually distinct (different color/shape from project nodes)

### Edges
Each project connects to all of its tags.

### Interaction
- Click a project node → navigate to that project's page
- Click a tag node → highlight connected projects, dim unconnected nodes
- Click background → reset highlight

### Data source
Jekyll generates inline JSON via Liquid, reading `tags` and `title` front matter from all pages with `layout: project` (or a `projects: true` flag). No separate data file to maintain.

### Styling
Dark background consistent with the portfolio's existing thermal/dark aesthetic. Does not replicate the SMT aerial-map look — fits the main site layout instead.

---

## 3. Navigation

Remove `CVs` from the nav (already accessible via the floating CV button). New nav order:

```
Blog | eLit | Projects | Teaching
```

Change made in `_layouts/default.html`. "Projects" is a plain link to `/projects/` — no dropdown, since the network graph handles discovery.

---

## 4. Tag Vocabulary

All projects carry the `phd` tag. Additional tags:

| Tag | Projects |
|-----|---------|
| `phd` | all |
| `critical-making` | map, sasb, oppression-aesthetic |
| `collaborative` | henryviii, smt |
| `generative` | combat, bot |
| `data-visualization` | smt, map |
| `twine` | henryviii |
| `interactive` | combat |
| `reveal` | oppression-aesthetic |

Tags are extensible — new ones added in front matter as projects are created.

---

## 5. Group Project Accreditation

`henryviii` and `smt` include a visible "Project Team" section near the top of their project pages listing all collaborators and roles. `henryviii` already has this — `smt` needs it added. No separate nav placement; accreditation lives on the page itself.

---

## 6. Out of Scope

- Teaching folder cleanup (deferred)
- Moving `/lamos/` (deferred)
- Classroom tools (`cultur`, `proposr`, `confrncr`, `narrativr`, `majr`, `questionr`) — stay in `/tools/`, linked from teaching pages in a future pass
- `/presentations/texts-tech/` — stays in place
