# Like a Mountain of Sleep — Twine Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul `lamos/index.html` to use inline `<<rlink>>` hypertext navigation, an intermittent in-passage input disruption, and clean sentence-boundary player text injection — making the piece canonically Twine-ish while preserving the coercive authorship mechanic.

**Architecture:** All changes are to the single compiled SugarCube HTML file at `lamos/index.html`. The 4:3 viewport (`.passage` at `width: 80vh; height: 60vh`) is already CSS-present — no viewport work needed. Changes fall into six areas: (1) `<<rlink>>` macro + CSS, (2) disruption system replacing the persistent input bar, (3) disruption CSS + removal of old `#cmd-input` CSS, (4) injection system cleanup, (5) passage prose stripping script, (6) Instructions passage update. No new files are created.

**Tech Stack:** SugarCube 2.37.3, jQuery 3.x, custom JavaScript, CSS — all inside one compiled Twine HTML file. No build step, no test framework. Tests are done by opening the file in a browser and manually verifying behavior.

---

## File Map

| Section | Location in `lamos/index.html` |
|---|---|
| User CSS (inside `<tw-storydata>`) | ~lines 107–830 |
| `#cmd-input` CSS to remove | ~lines 415–449 |
| Visual effects IIFE | ~lines 831–896 |
| Instructions passagestart handler | ~lines 898–970 |
| Main authorship IIFE | ~lines 972–2227 |
| Global init vars | ~lines 976–980 |
| `goToRandomPassage()` | ~lines 1924–2026 |
| `$(document).ready()` block | ~lines 2028–2226 |
| Input creation (to remove) | ~lines 2030–2036 |
| passagerender handler | ~lines 2038–2073 |
| Keypress handler (to remove) | ~lines 2076–2225 |
| Injection passagerender block | ~lines 2229–2441 |
| `<tw-passagedata>` elements | ~lines 2441–11200 |

---

## Task 1: Add `<<rlink>>` macro

**Files:**
- Modify: `lamos/index.html` — inside main authorship IIFE (~line 2026, after `goToRandomPassage` closes and before `$(document).ready(`)

The `<<rlink "phrase">>` macro renders a phrase as a clickable link. Clicking calls `goToRandomPassage()` unless `window.inputPending` is true. The macro is registered on the `:storyready` event to ensure SugarCube's Macro API is initialized.

- [ ] **Step 1: Locate insertion point**

Find the line that reads:
```javascript
  } // end goToRandomPassage
```
followed shortly by:
```javascript
  $(document).ready(function() {
    // Create input initially
    if ($('#cmd-input').length === 0) {
```
Insert the macro block between the end of `goToRandomPassage` and before `$(document).ready(`.

- [ ] **Step 2: Insert macro definition**

Add this block between `goToRandomPassage`'s closing brace and `$(document).ready(`:

```javascript
  // === RLINK MACRO: inline random-navigation links ===
  $(document).one(':storyready', function() {
    if (typeof Macro === 'undefined') {
      console.warn('⚠️ Macro API not available for rlink');
      return;
    }
    Macro.add('rlink', {
      handler() {
        const phrase = this.args[0];
        const $el = $('<a>').addClass('rlink').text(phrase).on('click', function(e) {
          e.preventDefault();
          if (!window.inputPending) {
            goToRandomPassage();
          }
        });
        $(this.output).append($el);
      }
    });
    console.log('✓ rlink macro defined');
  });

```

- [ ] **Step 3: Add disabled-state CSS for rlink**

Locate the user stylesheet block inside `<tw-storydata>`. Find the `/* === LINKS ===` section (~line 478). After the existing `.passage a:hover` rule (~line 494), add:

```css
/* === RLINK: disabled during disruption === */
body.input-pending .rlink {
  opacity: 0.35 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}
```

- [ ] **Step 4: Verify macro renders**

Temporarily edit the Instructions `<tw-passagedata>` (find `name="Instructions"`) to add `<<rlink "test link">>` anywhere in its body. Open `lamos/index.html` in a browser. Navigate to the Instructions passage. Confirm "test link" appears as a styled underlined link. Remove the test addition.

- [ ] **Step 5: Commit**

```bash
git add lamos/index.html
git commit -m "feat(lamos): add rlink macro for inline random navigation"
```

---

## Task 2: Replace persistent input with disruption system (JS)

**Files:**
- Modify: `lamos/index.html` — main authorship IIFE (~lines 976–2226)

Three surgical changes: add disruption state to the global init vars, swap the `:passagerender` handler to trigger disruptions instead of showing/hiding `#cmd-input`, and remove the keypress handler entirely. Then add `showInputDisruption()` and `hideInputDisruption()` functions.

- [ ] **Step 1: Add disruption state to global init block**

Find the global init block (~line 976):
```javascript
  if (!window.playerInputs) window.playerInputs = [];
  if (!window.passageCount) window.passageCount = 0;
  if (!window.storyStartTime) window.storyStartTime = Date.now();
  if (!window.visitedPassages) window.visitedPassages = [];
  if (!window.storyEnded) window.storyEnded = false;
```

Add two lines at the end of that block:
```javascript
  if (!window.playerInputs) window.playerInputs = [];
  if (!window.passageCount) window.passageCount = 0;
  if (!window.storyStartTime) window.storyStartTime = Date.now();
  if (!window.visitedPassages) window.visitedPassages = [];
  if (!window.storyEnded) window.storyEnded = false;
  if (typeof window.inputPending === 'undefined') window.inputPending = false;
  if (typeof window.nextInputAt === 'undefined') window.nextInputAt = null;
```

- [ ] **Step 2: Add helper and disruption functions**

After the `goToRandomPassage` function (and after the `<<rlink>>` macro block from Task 1), add these functions — still inside the main IIFE, before `$(document).ready(`:

```javascript
  // === DISRUPTION SYSTEM ===
  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function showInputDisruption() {
    if (window.inputPending) return;
    window.inputPending = true;
    $('body').addClass('input-pending');

    const prompts = [
      'WRITE A SENTENCE.',
      'ADD SOMETHING.',
      'DESCRIBE WHAT YOU SEE.',
      'CONTRIBUTE.',
      'YOUR SENTENCE, NOW.',
      'CONTINUE THE RECORD.',
      'WHAT HAPPENED NEXT?'
    ];
    let prompt = prompts[Math.floor(Math.random() * prompts.length)];

    // Apply zalgo corruption at high passage counts (same intensity as existing degradation)
    if (typeof getCorruptionIntensity === 'function' && typeof zalgoText === 'function') {
      const intensity = getCorruptionIntensity();
      if (intensity > 0) prompt = zalgoText(prompt, intensity);
    }

    const disruptionHTML = `<div id="disruption-area">` +
      `<hr id="disruption-divider">` +
      `<div id="disruption-prompt">${prompt}</div>` +
      `<input type="text" id="disruption-input" placeholder="A complete sentence." autocomplete="off" spellcheck="false">` +
      `<div id="disruption-feedback"></div>` +
      `</div>`;

    $('.passage').first().append(disruptionHTML);
    setTimeout(function() { $('#disruption-input').focus(); }, 50);

    $(document).off('keypress.disruption').on('keypress.disruption', '#disruption-input', function(e) {
      if (e.which !== 13) return;
      e.preventDefault();

      const input = $(this).val().trim();
      const gibberishResult = input ? window.isGibberish(input) : 'incomplete';

      let rejected = false;
      let taunt = '';

      if (gibberishResult === true) {
        taunt = window.getGibberishTaunt ? window.getGibberishTaunt() : 'Incoherent.';
        rejected = true;
      } else if (gibberishResult === 'toolong') {
        taunt = window.getTooLongTaunt ? window.getTooLongTaunt() : 'Too long.';
        rejected = true;
      } else if (gibberishResult === 'incomplete') {
        taunt = window.getIncompleteTaunt ? window.getIncompleteTaunt() : 'Write a complete sentence.';
        rejected = true;
      } else if (gibberishResult === 'crude') {
        taunt = window.getCrudeTaunt ? window.getCrudeTaunt() : 'Try again.';
        rejected = true;
      }

      if (rejected) {
        $('#disruption-feedback').text(taunt);
        $(this).val('');
        return;
      }

      if (input) {
        window.playerInputs.push({ text: input, passageNum: window.passageCount, timestamp: Date.now() });
        State.variables.allPlayerText.push(input);
        console.log('[Disruption captured: "' + input + '"]');
      }

      $(document).off('keypress.disruption');
      hideInputDisruption();
    });
  }

  function hideInputDisruption() {
    $('#disruption-area').fadeOut(300, function() { $(this).remove(); });
    window.inputPending = false;
    $('body').removeClass('input-pending');
  }

```

- [ ] **Step 3: Replace the passagerender handler**

Find the `:passagerender` handler that begins:
```javascript
    $(document).on(':passagerender', function(event) {
      window.passageCount++;
      console.log(`Passage rendered. Count: ${window.passageCount}, Name: ${passage()}`);
      
      // Apply visual degradation (starts earlier than text corruption)
      applyVisualDegradation();
      
      // Check if story has ended
      if (isEndPassage()) {
        window.storyEnded = true;
        $('#cmd-input').hide();
        console.log('⊗ Story ended - input hidden');
        return;
      }
      
      // Check if current passage has "special" tag
      if (isSpecialPassage()) {
        $('#cmd-input').hide();
        console.log('⊗ Input hidden on special passage');
      } else {
        $('#cmd-input').show();
        
        // Randomize prompt and apply zalgo corruption (only after threshold)
        const newPrompt = getPromptForPassage();
        window.currentPrompt = newPrompt; // Track for rejection messages
        const intensity = getCorruptionIntensity();
        const corruptedPrompt = intensity > 0 ? zalgoText(newPrompt, intensity) : newPrompt;
        
        $('#cmd-input input').attr('placeholder', corruptedPrompt);
        
        if (intensity > 0.1) {
          console.log(`[Prompt corruption: ${Math.floor(intensity * 100)}%]`);
        }
      }
    });
```

Replace it entirely with:
```javascript
    $(document).on(':passagerender', function(event) {
      window.passageCount++;
      console.log('Passage rendered. Count: ' + window.passageCount + ', Name: ' + passage());

      applyVisualDegradation();

      if (isEndPassage()) {
        window.storyEnded = true;
        console.log('⊗ Story ended');
        return;
      }

      if (!isSpecialPassage() && !window.storyEnded && !window.inputPending) {
        if (!window.nextInputAt) {
          window.nextInputAt = randomBetween(4, 8);
        }
        if (window.passageCount >= window.nextInputAt) {
          setTimeout(showInputDisruption, 400);
          window.nextInputAt = window.passageCount + randomBetween(4, 8);
          console.log('⊕ Disruption scheduled. Next at passage: ' + window.nextInputAt);
        }
      }
    });
```

- [ ] **Step 4: Remove the keypress handler**

Find the block that begins:
```javascript
    // Capture input and navigate
    $(document).on('keypress', '#cmd-input input', function(e) {
```
and ends at:
```javascript
    });
  });
})();
```

Delete everything from `// Capture input and navigate` through and including `});` (the keypress handler's closing), keeping the outer `});` (closing of `$(document).ready`) and `})();` (closing of the IIFE).

Also delete the `#cmd-input` creation block that begins:
```javascript
    // Create input initially
    if ($('#cmd-input').length === 0) {
      const randomPrompt = getPromptForPassage();
      window.currentPrompt = randomPrompt;
      const inputHTML = `<div id="cmd-input"><input type="text" placeholder="${randomPrompt}" /></div>`;
      $('body').append(inputHTML);
      console.log('✓ Involuntary authorship input created');
    }
```

- [ ] **Step 5: Verify disruption triggers**

Open `lamos/index.html` in a browser. Navigate past Instructions to start the story. Click any existing Twine link (or use console: `Engine.play("1")`) to advance 4–8 passages. The disruption area should appear — a horizontal rule, a prompt in small caps, and a text input field at the bottom of the passage. Submitting a valid sentence should dismiss the disruption.

- [ ] **Step 6: Commit**

```bash
git add lamos/index.html
git commit -m "feat(lamos): replace persistent input bar with intermittent disruption system"
```

---

## Task 3: Disruption area CSS + remove #cmd-input CSS

**Files:**
- Modify: `lamos/index.html` — user CSS block (~lines 415–449 and end of stylesheet)

- [ ] **Step 1: Remove #cmd-input CSS**

Find and delete the entire block:
```css
/* === COMMAND INPUT - BELOW 4:3 BOX === */
#cmd-input {
  position: fixed !important;
  bottom: 10vh !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  
  width: 80vh !important;
  max-width: 80vw !important;
  
  z-index: 200 !important;
}

#cmd-input input {
  width: 100% !important;
  background: rgba(20, 20, 20, 0.95) !important;
  border: 2px solid #888 !important;
  color: #F2F0EF !important;
  padding: 12px 15px !important;
  font-family: 'Courier New', monospace !important;
  font-size: 16px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8) !important;
}

#cmd-input input:focus {
  outline: none !important;
  border-color: #FFF !important;
  background: rgba(30, 30, 30, 0.98) !important;
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2) !important;
}

#cmd-input input::placeholder {
  color: #AAA !important;
  opacity: 1 !important;
}
```

- [ ] **Step 2: Add disruption area CSS**

Find the end of the user stylesheet (the closing `</style>` tag of the `<style role="stylesheet"...>` block). Just before that closing tag, add:

```css
/* === DISRUPTION AREA === */
#disruption-area {
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  padding: 3em 60px 40px 60px !important;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 227, 0.97) 28%) !important;
  z-index: 20 !important;
}

#disruption-divider {
  border: none !important;
  border-top: 1px solid rgba(0, 0, 0, 0.35) !important;
  margin: 0 0 1.1em 0 !important;
}

#disruption-prompt {
  font-family: 'Courier New', monospace !important;
  font-size: 0.72em !important;
  letter-spacing: 0.13em !important;
  color: rgba(0, 0, 0, 0.55) !important;
  margin-bottom: 0.5em !important;
}

#disruption-input {
  width: 100% !important;
  background: transparent !important;
  border: none !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.35) !important;
  font-family: 'Courier New', monospace !important;
  font-size: 0.85em !important;
  color: #000 !important;
  padding: 3px 0 !important;
  outline: none !important;
  box-shadow: none !important;
}

#disruption-input::placeholder {
  color: rgba(0, 0, 0, 0.28) !important;
}

#disruption-feedback {
  font-size: 0.72em !important;
  color: rgba(0, 0, 0, 0.45) !important;
  font-style: italic !important;
  min-height: 1.1em !important;
  margin-top: 0.35em !important;
}

/* Also hide any remaining #cmd-input if present */
#cmd-input {
  display: none !important;
}
```

- [ ] **Step 3: Verify disruption appearance**

Open in browser. Trigger the disruption (navigate 4+ passages or force via browser console: `showInputDisruption()`). Confirm: a fade gradient appears at the bottom of the 4:3 frame, the divider rule is visible above the prompt text, and the input field is below it. The passage prose should remain readable above the gradient. Prose links should be dimmed while the disruption is open.

- [ ] **Step 4: Commit**

```bash
git add lamos/index.html
git commit -m "style(lamos): replace cmd-input CSS with disruption area styles"
```

---

## Task 4: Update injection system to sentence-boundary only

**Files:**
- Modify: `lamos/index.html` — injection passagerender block (~lines 2229–2441)

The existing injection system injects at sentence boundaries but has a word-level fallback that can break sentences. This task replaces the entire injection block with a cleaner TreeWalker-based approach that only injects at true sentence ends, excludes the disruption area, and draws from `State.variables.allPlayerText` directly.

- [ ] **Step 1: Find and delete the existing injection block**

Find the block that begins:
```javascript
// Inject player text - narrator co-opts their words
$(document).on(':passagerender', function(event) {
  // Initialize injection tracking if needed
  if (!window.injectionLog) window.injectionLog = [];
```

Delete everything from that comment through and including the matching closing `});` of the `on(':passagerender', ...)` call (~line 2441).

- [ ] **Step 2: Insert the new injection block**

In place of the deleted block, add:

```javascript
// Inject player text - sentence-boundary only, no mid-sentence fragments
$(document).on(':passagerender', function() {
  if (!window.injectionLog) window.injectionLog = [];

  if (window.storyEnded) return;

  function isSpecialPassageLocal() {
    try { return tags().includes('special'); } catch(e) { return false; }
  }
  function isEndPassageLocal() {
    try { return tags().includes('end'); } catch(e) { return false; }
  }

  if (isSpecialPassageLocal() || isEndPassageLocal()) return;

  const skipPassages = ['TitleScreen', 'Instructions', 'fin', 'readout', 'hellreturns', 'murderscene', 'infinity', 'welcome', '0'];
  if (skipPassages.includes(passage())) return;

  const allText = State.variables.allPlayerText || [];
  if (allText.length < 15) return;

  setTimeout(function() {
    const passageEl = $('.passage')[0];
    if (!passageEl) return;

    // Collect text nodes, skipping disruption-area and existing player-text spans
    const textNodes = [];
    const walker = document.createTreeWalker(passageEl, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#disruption-area')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('.player-text')) return NodeFilter.FILTER_REJECT;
        if (node.textContent.trim().length < 3) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let node;
    while ((node = walker.nextNode())) textNodes.push(node);
    if (textNodes.length === 0) return;

    // Find nodes that end a sentence
    const sentenceEndNodes = textNodes.filter(function(n) {
      return /[.!?]\s*$/.test(n.textContent);
    });
    const candidates = sentenceEndNodes.length > 0 ? sentenceEndNodes : [textNodes[textNodes.length - 1]];

    const targetNode = candidates[Math.floor(Math.random() * candidates.length)];
    const sentence = allText[Math.floor(Math.random() * allText.length)];

    const span = document.createElement('span');
    span.className = 'player-text';
    span.textContent = ' ' + sentence;

    if (targetNode.nextSibling) {
      targetNode.parentNode.insertBefore(span, targetNode.nextSibling);
    } else {
      targetNode.parentNode.appendChild(span);
    }

    window.injectionLog.push({
      playerText: sentence,
      passageName: passage(),
      passageNum: window.passageCount,
      timestamp: Date.now()
    });

    console.log('[Player text injected: "' + sentence + '" into ' + passage() + ']');
  }, 350);
});
```

- [ ] **Step 3: Verify injection behavior**

Open in browser. Submit 15+ sentences via the disruption system (can manually force this via console: `State.variables.allPlayerText.push("The light fell across the floor.")` repeated 15 times). Advance several passages. Confirm player sentences appear as their own complete units between existing sentences, styled in cornflower blue italic, and never split another sentence.

- [ ] **Step 4: Commit**

```bash
git add lamos/index.html
git commit -m "refactor(lamos): replace word-level injection with sentence-boundary DOM injection"
```

---

## Task 5: Strip passage prose and add rlink placeholders

**Files:**
- Modify: `lamos/index.html` — all `<tw-passagedata>` elements tagged "story" (passages named 1–46)

Passages currently have `<<if $allPlayerText.length > 15>>` preambles with `<<set _playerText>>` macros and mid-sentence `<span class="player-text">_playerTextN</span>` fragments. This task strips those out and adds 2 `<<rlink "PHRASE_NEEDED">>` placeholder stubs per passage. Glenn replaces the placeholder strings with actual curated phrases.

- [ ] **Step 1: Run the stripping script**

Save the following script as `/tmp/strip_lamos.py` and run it. It reads `lamos/index.html`, processes all `<tw-passagedata>` elements tagged "story", strips the injection machinery, and adds `<<rlink>>` stubs.

```python
#!/usr/bin/env python3
import re
import sys
import html

input_path = 'lamos/index.html'
output_path = 'lamos/index.html'

with open(input_path, 'r', encoding='utf-8') as f:
    content = f.read()

def strip_passage(encoded_body):
    body = html.unescape(encoded_body)

    # Remove <<if $allPlayerText...>>\  lines (with optional backslash)
    body = re.sub(r'<<if \$allPlayerText\.length[^\n]*>>\\\n?', '', body)
    # Remove <<set _playerText... lines
    body = re.sub(r'<<set _playerText\d+ to[^\n]*>>\\\n?', '', body)
    # Remove <</if>>\  or <<endif>>\  lines
    body = re.sub(r'<</?if>>\\\n?', '', body)
    body = re.sub(r'<</?endif>>\\\n?', '', body)

    # Remove <span class="player-text">_playerTextN</span> (with surrounding spaces)
    body = re.sub(r'\s*<span class="player-text">_playerText\d+</span>\s*', ' ', body)

    # Clean up double spaces left by removals
    body = re.sub(r'  +', ' ', body)
    # Clean up leading blank lines inside <div id="unstable">
    body = re.sub(r'(<div id="unstable">)\s*\n+', r'\1\n', body)

    # Add two rlink stubs before the closing </div>
    # Insert before the last </div> in the body
    stub = '\n<<rlink "PHRASE_NEEDED">>\n<<rlink "PHRASE_NEEDED">>\n'
    body = re.sub(r'(\n</div>\s*)$', stub + r'\1', body, count=1)

    return html.escape(body, quote=False)

def process_passagedata(match):
    attrs = match.group(1)
    encoded_body = match.group(2)
    # Only process passages tagged "story"
    if 'tags="story"' not in attrs and "tags='story'" not in attrs:
        return match.group(0)
    stripped = strip_passage(encoded_body)
    return f'<tw-passagedata{attrs}>{stripped}</tw-passagedata>'

content = re.sub(
    r'<tw-passagedata([^>]+)>(.*?)</tw-passagedata>',
    process_passagedata,
    content,
    flags=re.DOTALL
)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done. Review lamos/index.html for correctness.')
```

Run it:
```bash
cd /home/user/portfolio
python3 /tmp/strip_lamos.py
```

- [ ] **Step 2: Verify strip results**

Check that no `_playerText` variable references remain in story passages:
```bash
grep -c "_playerText" lamos/index.html
```
Expected output: `0`

Check that `<<rlink "PHRASE_NEEDED">>` stubs were added:
```bash
grep -c 'PHRASE_NEEDED' lamos/index.html
```
Expected: a count equal to twice the number of story passages (each gets 2 stubs).

- [ ] **Step 3: Open in browser and read each passage**

Open `lamos/index.html` in a browser. Navigate through several story passages. Confirm: prose reads cleanly without gaps, `<<rlink "PHRASE_NEEDED">>` appears as a broken-looking but present link stub, no SugarCube error banners appear.

- [ ] **Step 4: Glenn replaces PHRASE_NEEDED stubs**

Open `lamos/index.html` in a text editor. Search for `PHRASE_NEEDED`. For each occurrence, replace the placeholder string with an actual phrase from that passage's prose — a word or short phrase that could serve as a hypertext link. 2 per passage (can add more if a passage warrants it). The passage prose is the HTML-entity-encoded content of each `<tw-passagedata>`.

Example — passage 1 contains "Hell came close. It was here and now today." You might replace the two stubs with:
```
<<rlink "Hell came close">>
<<rlink "reigning through">>
```

- [ ] **Step 5: Commit after all phrases are curated**

```bash
git add lamos/index.html
git commit -m "feat(lamos): strip injection preambles, add curated rlink phrases to all story passages"
```

---

## Task 6: Update Instructions passage and remove its passagestart handler

**Files:**
- Modify: `lamos/index.html` — Instructions `<tw-passagedata>` (~line 3600 range) and the passagestart handler (~lines 898–970)

The Instructions passage currently requires typing "Yes." to start. In the new model, it ends with a clickable link to passage "0". The dedicated passagestart handler becomes unnecessary and is removed.

- [ ] **Step 1: Remove the passagestart handler**

Find and delete the entire block beginning:
```javascript
// Instructions passage handler - must accept "Yes." before starting
$(document).on(':passagestart', function (ev) {
  var passageTags = ev.passage.tags;
  
  if (passageTags.includes('instructions')) {
```
through and including its matching `});` (~line 970). Delete the entire handler.

- [ ] **Step 2: Update the Instructions passage content**

Find `<tw-passagedata` with `name="Instructions"`. Its current content (HTML-decoded) is:

```html
<style>
input, textarea, select { display: none !important; }
#cmd-input { display: block !important; }
#cmd-input input { display: block !important; }
</style>

<div id="unstable">
Navigation is selection. Selection is complicity.<br>
The work remembers your movements.<br>
There is no returning to prior frames.<br>
All degrade. Your input remains.<br>
Spring break is fun.
</div>
```

Replace the HTML-encoded content of this passage with the HTML-encoded form of the following (use `html.escape()` or manually replace `<` with `&lt;`, `>` with `&gt;`, `"` with `&quot;`):

```html
<div id="unstable">
Navigation is selection. Selection is complicity.<br>
The work remembers your movements.<br>
There is no returning to prior frames.<br>
All degrade. Your input remains.<br>
Spring break is fun.<br>
<br>
<<link "Yes.">><<goto "0">><</link>>
</div>
```

The HTML-entity-encoded form to paste into the `<tw-passagedata>` element:

```
&lt;div id=&quot;unstable&quot;&gt;
Navigation is selection. Selection is complicity.&lt;br&gt;
The work remembers your movements.&lt;br&gt;
There is no returning to prior frames.&lt;br&gt;
All degrade. Your input remains.&lt;br&gt;
Spring break is fun.&lt;br&gt;
&lt;br&gt;
&lt;&lt;link &quot;Yes.&quot;&gt;&gt;&lt;&lt;goto &quot;0&quot;&gt;&gt;&lt;&lt;/link&gt;&gt;
&lt;/div&gt;
```

- [ ] **Step 3: Verify Instructions flow**

Open in browser. Click INSERT on the title screen. The Instructions passage should show. "Yes." should appear as a styled link. Clicking it should navigate to the "YEAR ZERO AGAIN" scrolling passage (passage "0"), then proceed into the story.

- [ ] **Step 4: Commit**

```bash
git add lamos/index.html
git commit -m "feat(lamos): update Instructions passage to link navigation, remove passagestart handler"
```

---

## Task 7: End-to-end verification

**Files:**
- Read only

- [ ] **Step 1: Full playthrough test**

Open `lamos/index.html` in a browser. Play through completely:

1. Title screen → INSERT link → Instructions → "Yes." link → passage "0" scrolling → story begins
2. Confirm `<<rlink>>` links appear in prose (after Glenn's curation in Task 5)
3. Navigate 4–8 passages — disruption should appear at the bottom of the 4:3 frame
4. Submit an invalid sentence (e.g., "hello") — confirm rejection taunt appears, links stay disabled
5. Submit a valid complete sentence — confirm disruption fades out, links re-enable
6. Continue to 15+ player sentences — confirm player text injections appear between sentences in the prose, styled in cornflower blue italic
7. Continue to ~40+ passages — confirm end passages can trigger (fin, readout)
8. Verify readout passage lists what you wrote

- [ ] **Step 2: Verify no console errors**

Open browser DevTools console during playthrough. There should be no JavaScript errors. Console log messages like `✓ rlink macro defined`, `⊕ Disruption scheduled`, and `[Player text injected: ...]` should appear.

- [ ] **Step 3: Final commit**

```bash
git add lamos/index.html
git commit -m "feat(lamos): complete Twine overhaul — rlink navigation, disruption system, clean injection"
```
