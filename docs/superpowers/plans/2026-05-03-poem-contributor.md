# Poem Contributor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/creative/poem/` page to the Jekyll site where visitors read a randomly generated poem and contribute a word via email.

**Architecture:** A single Markdown file with inline HTML and JavaScript, following the same pattern used by other creative pages in this repo. Word arrays are hardcoded in JavaScript. Poem generation runs on page load. Word submission opens the user's email client via a `mailto:` link.

**Tech Stack:** Jekyll (Minima theme), vanilla JavaScript, HTML, `mailto:` protocol. No external services or build tools beyond what already exists.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `creative/poem/index.md` | The entire poem page: word arrays, generation logic, form, confirmation |
| Modify | `creative/index.md` | Add a link to the new poem page |

---

### Task 1: Create the page scaffold

**Files:**
- Create: `creative/poem/index.md`

- [ ] **Step 1: Create the file with front matter and static structure**

Create `creative/poem/index.md` with this exact content:

```markdown
---
layout: default
title: A POEM is
---

<div id="poem-display">
  <p>A POEM is</p>
  <p id="line-provocation"></p>
  <p id="line-contribution"></p>
  <p id="line-declarative"></p>
</div>

<hr>

<div id="contribute-section">
  <label for="word-input">add a word to the poem</label><br><br>
  <input type="text" id="word-input" maxlength="40" placeholder="one word">
  <button id="submit-word">submit</button>
  <p id="confirmation" style="display:none;">your word has been sent.</p>
</div>

<hr>

**Navigation:**
← [Back to Creative CV](/creative/) | [Home](/)

<script>
// word arrays
const provocation = ['wonder','death','frustration','terrorist','war','surveillance','liberator','palehorse','silence','con','situation','banknote','check','statement','livelihood','construct','performance','scream','doubt','robbery','clarification','truth','treason'];
const contribution = ['wrote','typed','etched','fabricated','stole','dreamed','generated','imagined','lied','commissioned','whispered','situated','cashed','cached','performed','rode','crafted','robbed','lived','clarified','told','betrayed','invested'];
const declarative = ['heals','destroys','disrupts','colonizes','maims','dreams','declares','imposes','burns','lies','fights','occupied','frustrates','terrorizes','surveills','liberates','conspires','whispers','silences','lives','constructs','performs','kills'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

document.getElementById('line-provocation').textContent = 'a ' + pick(provocation);
document.getElementById('line-contribution').textContent = 'I ' + pick(contribution);
document.getElementById('line-declarative').textContent = 'that ' + pick(declarative);

document.getElementById('submit-word').addEventListener('click', function () {
  const word = document.getElementById('word-input').value.trim();
  if (!word) return;
  const subject = encodeURIComponent('poem contribution');
  const body = encodeURIComponent(word);
  window.location.href = 'mailto:glenn@limb.fun?subject=' + subject + '&body=' + body;
  document.getElementById('word-input').value = '';
  document.getElementById('confirmation').style.display = 'block';
});
</script>
```

- [ ] **Step 2: Verify the file was created**

```bash
cat creative/poem/index.md
```

Expected: full file contents printed with no errors.

- [ ] **Step 3: Build the Jekyll site locally and open the page**

```bash
bundle exec jekyll serve
```

Open `http://localhost:4000/creative/poem/` in a browser.

Expected:
- Title "A POEM is" appears
- Three lines render below it with a random word each (e.g. "a war", "I wrote", "that heals")
- Reloading the page produces a different combination of words

- [ ] **Step 4: Commit**

```bash
git add creative/poem/index.md
git commit -m "feat: add poem contributor page"
```

---

### Task 2: Test the contribution form

**Files:**
- Modify: `creative/poem/index.md` (no code change — verification only)

- [ ] **Step 1: Test the submit button with a word**

With `bundle exec jekyll serve` running, open `http://localhost:4000/creative/poem/`.

Type a single word into the text input (e.g. `grief`) and click submit.

Expected:
- The default email client opens with a new message pre-addressed to `glenn@limb.fun`, subject `poem contribution`, body `grief`
- The text input clears
- The confirmation text "your word has been sent." appears below the button

- [ ] **Step 2: Test empty submission**

Clear the input field and click submit with it empty.

Expected: nothing happens — no email client opens, no confirmation appears.

- [ ] **Step 3: Commit if any fixes were needed**

If you had to fix the JS in step 1 or 2, commit now:

```bash
git add creative/poem/index.md
git commit -m "fix: poem form submission behavior"
```

If no fixes were needed, skip this step.

---

### Task 3: Link the poem page from the creative index

**Files:**
- Modify: `creative/index.md`

- [ ] **Step 1: Open the creative index**

```bash
cat creative/index.md
```

Locate the **Place-Based Projects** section (or whichever section feels most appropriate for this work).

- [ ] **Step 2: Add a link to the poem page**

In `creative/index.md`, add the following line in an appropriate section (e.g. after the BAKE entry under Place-Based Projects, or as its own section):

```markdown
- A POEM is. Generative web poem; ongoing, [[contribute]](/creative/poem/).
```

- [ ] **Step 3: Verify the link renders**

With `bundle exec jekyll serve` running, open `http://localhost:4000/creative/` and confirm the link appears and navigates correctly to `/creative/poem/`.

- [ ] **Step 4: Commit**

```bash
git add creative/index.md
git commit -m "feat: link poem contributor from creative index"
```

---

### Task 4: Add a word from a received email

*This task documents the ongoing maintenance flow — not a one-time step.*

When you receive an email with a contributed word:

- [ ] **Step 1: Decide which array the word belongs to**

  - `provocation` — a noun (thing, concept, force)
  - `contribution` — a verb in past tense first person ("I ___")
  - `declarative` — a verb in third person present ("that ___")

- [ ] **Step 2: Add the word to the correct array in `creative/poem/index.md`**

Open the file and append the word to the end of the appropriate array. Example — adding `rupture` to `declarative`:

```javascript
const declarative = ['heals','destroys','disrupts','colonizes','maims','dreams','declares','imposes','burns','lies','fights','occupied','frustrates','terrorizes','surveills','liberates','conspires','whispers','silences','lives','constructs','performs','kills','rupture'];
```

- [ ] **Step 3: Commit and push**

```bash
git add creative/poem/index.md
git commit -m "poem: add contributed word"
git push
```

The site rebuilds automatically. The next visitor's poem draws from the updated corpus.
