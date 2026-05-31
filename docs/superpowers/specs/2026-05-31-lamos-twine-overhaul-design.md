# Like a Mountain of Sleep — Twine Overhaul Design

**Date:** 2026-05-31  
**Project:** `/home/user/portfolio/lamos/index.html`  
**Scope:** Overhaul navigation, viewport, and player-text injection to foreground Twine hypertext conventions while preserving the coercive authorship mechanic.

---

## Overview

The current piece uses SugarCube but hides all Twine affordances. Navigation is driven exclusively by a persistent text-input bar: the reader types something and presses Enter to advance randomly. This overhaul shifts the primary navigation to clickable inline hyperlinks (canonical Twine), demotes the text-input mechanic to an intermittent in-passage disruption, constrains the reading space to a 4:3 viewport, and cleans up player-text injection so contributions land between sentences rather than mid-sentence.

---

## Section 1: Viewport & Layout

- The story renders inside a centered 4:3 aspect-ratio container.
- On wide screens the container is pillarboxed (black bars left/right). On tall/narrow screens it letterboxes.
- A `max-width` cap prevents the container from becoming unwieldy on ultrawide displays (suggested: `960px` wide, `720px` tall as the max, scaling down proportionally).
- Everything — prose, links, input disruption — lives inside this frame.
- The page surround is black.
- The SugarCube UI bar remains hidden (already the case in current CSS).

---

## Section 2: Navigation — Inline `<<rlink>>` Macro

- Each passage has 2–4 hand-curated phrases marked with a custom SugarCube macro: `<<rlink "phrase">>`.
- The macro renders the phrase as a styled inline link (subtle underline/color consistent with existing aesthetic).
- Clicking any link fires the existing `goToRandomPassage()` logic: same weighted pool (story/special/end), same visited-passage tracking, same degradation system.
- All links in a passage resolve randomly — the destination is never fixed to the phrase label.
- **While the input disruption is visible, all `<<rlink>>` links are disabled** (pointer-events off, visually dimmed). They re-enable when the reader submits valid text and the disruption clears.

### Macro implementation sketch
```javascript
Macro.add('rlink', {
  handler() {
    const phrase = this.args[0];
    const $el = $('<a class="rlink">')
      .text(phrase)
      .on('click', function () {
        if (!window.inputPending) goToRandomPassage();
      });
    $(this.output).append($el);
  }
});
```

---

## Section 3: Input Disruption

- The persistent bottom-of-screen input bar is removed.
- At a random interval (every 4–8 passages, non-deterministic), the input disruption triggers on passage render.
- The disruption appends to the bottom of the current passage's prose inside the 4:3 container, separated by a visible horizontal rule or styled divider.
- The input field and its prompt appear below the divider. The prompt explicitly frames the request as coercive authorship (e.g., "WRITE A SENTENCE." or "ADD SOMETHING.").
- The reader must submit a complete sentence or onomatopoeia (existing gibberish/length validation stays). They cannot advance (links are disabled) until they submit.
- On valid submission: the disruption area animates out, links re-enable, and the submitted text is stored in `$allPlayerText`.
- A global flag `window.inputPending` gates link interactivity.

### Trigger logic
```javascript
// On passagerender, decide whether to show disruption
const MIN_INTERVAL = 4;
const MAX_INTERVAL = 8;
if (!window.nextInputAt) window.nextInputAt = randomBetween(MIN_INTERVAL, MAX_INTERVAL);
if (window.passageCount >= window.nextInputAt && !isSpecialPassage() && !isEndPassage()) {
  showInputDisruption();
  window.nextInputAt = window.passageCount + randomBetween(MIN_INTERVAL, MAX_INTERVAL);
}
```

---

## Section 4: Player Text Injection

- All passage prose is rewritten to be clean: no `<<if $allPlayerText.length > 15>>` preambles, no `<<set _playerText to $allPlayerText.random()>>`, no mid-sentence `<span class="player-text">` gaps.
- At passage render time, if `$allPlayerText.length >= 15`, a post-render widget injects one randomly selected player sentence into the rendered DOM.
- Injection operates on the rendered DOM (not raw passage source) to preserve `<<rlink>>` anchor elements.
- The widget splits the rendered text content at sentence-ending punctuation (`.`, `!`, `?` followed by whitespace or end of node), collects sentence boundary positions, picks one at random (including after the final sentence), and inserts a `<span class="player-text">` containing the player sentence at that position.
- The player sentence reads as its own complete unit — not as a fragment completing someone else's sentence.
- Player text continues to accumulate in the readout/transcript at the end.

### Injection conditions
- Threshold: `$allPlayerText.length >= 15` (unchanged).
- Not injected on special passages (scrolling-text passages), end passages, TitleScreen, or Instructions.
- At most one injection per passage.

---

## Passages Requiring Changes

1. **All numbered story passages (0–46)**: Remove player-text preamble macros; remove inline `<span class="player-text">` gaps; add `<<rlink "phrase">>` markup at 2–4 hand-curated locations. Glenn curates the link phrases.
2. **Custom JS block in compiled HTML** (the inline `<script>` block, currently ~lines 900–2400): Add `<<rlink>>` macro definition; add `showInputDisruption()` / `hideInputDisruption()` functions; add `window.inputPending` flag; update `passagerender` handler for new trigger logic; remove persistent `#cmd-input` creation logic.
3. **StoryCSS / inline `<style>`**: Add 4:3 container styles; add `rlink` link styles; add input disruption styles (divider, input field, disabled-link state).
4. **Instructions passage**: Update copy to reflect new interaction model (links navigate; disruptions ask for sentences).
5. **`fin` passage**: No structural change; readout/transcript flow unchanged.

---

## What Does Not Change

- `goToRandomPassage()` logic (story/special/end weighting, visited tracking).
- Visual degradation system.
- Zalgo/corruption effects on prompts.
- Readout/transcript passage and download mechanic.
- `hellreturns`, `murderscene`, `infinity`, `welcome`, `0` scrolling-text passages.
- Overall passage count and end-state trigger thresholds.
