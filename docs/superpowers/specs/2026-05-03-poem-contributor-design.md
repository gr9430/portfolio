# Poem Contributor — Design Spec
*2026-05-03*

## Overview

A new page in the Jekyll portfolio site where visitors read a randomly generated poem and contribute a word to its corpus. Each visitor experiences the poem as shaped by whoever contributed before them. Contributions arrive via email; the owner adds approved words to the word arrays, commits, and the next visitor's poem reflects the change. No backend, no external services, no accounts required.

## Poem Structure

The poem structure is fixed, matching the original Python script:

```
A POEM is
a [provocation]
I [contribution]
that [declarative]
```

Each slot draws one word at random from its array on every page load.

## Word Arrays

Three JavaScript arrays hardcoded in the page, ported from the original Python script:

- `provocation` — nouns with political/emotional weight
- `contribution` — verbs in past tense (first person)
- `declarative` — verbs in third person present

The owner edits these arrays directly in the source file to add approved words.

## Contribution Form

A single text input and submit button below the poem. The visitor types one word. On submit, a `mailto:` link fires, opening their email client with:

- **To:** the owner's email address
- **Subject:** `poem contribution`
- **Body:** the submitted word

No slot selection — the owner decides which array the word belongs to upon review. On submit, JS fires `window.location.href` with the `mailto:` string and simultaneously reveals a hidden confirmation element on the page ("your word has been sent"). The email client opening in a new context serves as its own confirmation; the on-page message covers cases where the client opens in the background.

## Moderation

Light and manual. The owner receives an email for each submission, evaluates the word, and either adds it to the appropriate array in the source file and commits, or discards it. There is no automated filtering or approval queue. The accepted risk is occasional inappropriate submissions, manageable by ignoring and not committing them.

## Data Flow

1. Visitor loads the page → JS picks one word from each array → poem renders
2. Visitor submits a word → `mailto:` opens their email client → email sent to owner
3. Owner adds the word to the correct array → commits to the repo → site rebuilds
4. Next visitor loads the page → poem now includes the new word in the pool

## Page Location

`/creative/poem/` — a new page within the existing creative section of the Jekyll site, consistent with existing creative project pages.

## Implementation Notes

- All logic is vanilla JavaScript, inline or in a single script file included on the page
- The `mailto:` form requires no JS for its core function — it can be a plain HTML form with `action="mailto:..."` as a fallback
- Styling follows the existing Jekyll theme; no new CSS framework introduced
- The page needs no Jekyll front matter beyond title and layout
