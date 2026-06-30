/**
 * editor.test.js — Node.js test for pure logic in editor.js
 * Tests: fork/empty toggle state, validation warning condition, word add/remove
 *
 * Manual-verify items (DOM/ZineStore-dependent, untestable in Node):
 *   - init()               — subscribes to ZineStore, sets up listeners
 *   - onStoreUpdate()      — syncs DOM inputs on store change
 *   - renderCategories()   — builds DOM category blocks
 *   - renderHexCandidates()— builds DOM hex swatch rows
 *   - renderImageMeta()    — builds DOM image meta items
 *   - applyMode()          — manipulates DOM classes/aria-pressed
 */

'use strict';

var passed = 0;
var failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log('  PASS ' + label);
    passed++;
  } else {
    console.error('  FAIL ' + label);
    failed++;
  }
}

// ── Pure logic extracted from editor.js ─────────────────────────────────────

var CATEGORIES = ['origin', 'noun_anchor', 'noun_room', 'adjective_state', 'verb_fails'];

/**
 * shouldShowWarning — mirrors the validation condition in makeCategoryBlock
 * Returns true if a non-origin category is empty AND origin references it.
 */
function shouldShowWarning(cat, words, originList) {
  if (cat === 'origin') return false;
  if (words.length !== 0) return false;
  var refs = (originList || []).join(' ');
  return refs.indexOf('#' + cat + '#') !== -1;
}

/**
 * applyModeToGrammar — mirrors the grammar mutation in applyMode (pure part)
 * mode 'fork': returns seedGrammar (or current if null)
 * mode 'empty': returns object with all CATEGORIES as []
 */
function applyModeToGrammar(mode, currentGrammar, seedGrammar) {
  if (mode === 'fork') {
    return seedGrammar ? JSON.parse(JSON.stringify(seedGrammar)) : currentGrammar;
  } else {
    var g = {};
    CATEGORIES.forEach(function(cat) { g[cat] = []; });
    return g;
  }
}

/**
 * addWord — mirrors word-add logic in makeCategoryBlock addBtn handler
 */
function addWord(grammar, cat, val) {
  var list = (grammar[cat] || []).slice();
  list.push(val);
  var next = Object.assign({}, grammar);
  next[cat] = list;
  return next;
}

/**
 * removeWord — mirrors word-remove logic in makeWordItem del handler
 */
function removeWord(grammar, cat, idx) {
  var list = (grammar[cat] || []).slice();
  list.splice(idx, 1);
  var next = Object.assign({}, grammar);
  next[cat] = list;
  return next;
}

// ── Tests ────────────────────────────────────────────────────────────────────

console.log('\nfork/empty toggle — grammar state');

(function testForkEmpty() {
  var seed = { origin: ['#noun_anchor# sleeps'], noun_anchor: ['mountain'], noun_room: ['hall'], adjective_state: ['dark'], verb_fails: ['crumbles'] };
  var current = { origin: ['custom'], noun_anchor: ['stone'], noun_room: [], adjective_state: [], verb_fails: [] };

  var forked = applyModeToGrammar('fork', current, seed);
  assert('fork returns seed grammar copy', JSON.stringify(forked) === JSON.stringify(seed));
  assert('fork does not mutate original seed reference', forked !== seed);

  var emptied = applyModeToGrammar('empty', current, seed);
  CATEGORIES.forEach(function(cat) {
    assert('empty clears ' + cat + ' to []', Array.isArray(emptied[cat]) && emptied[cat].length === 0);
  });

  var noSeedFork = applyModeToGrammar('fork', current, null);
  assert('fork with no seed returns current grammar', noSeedFork === current);
})();

console.log('\nvalidation warning condition');

(function testWarning() {
  var originWithRef = ['#noun_anchor# sleeps in the #noun_room#', 'the #adjective_state# mountain'];

  assert('no warning for origin category', shouldShowWarning('origin', [], originWithRef) === false);
  assert('warning when noun_anchor empty and referenced', shouldShowWarning('noun_anchor', [], originWithRef) === true);
  assert('warning when noun_room empty and referenced', shouldShowWarning('noun_room', [], originWithRef) === true);
  assert('warning when adjective_state empty and referenced', shouldShowWarning('adjective_state', [], originWithRef) === true);
  assert('no warning when noun_anchor has words', shouldShowWarning('noun_anchor', ['mountain'], originWithRef) === false);
  assert('no warning for verb_fails (not in origin)', shouldShowWarning('verb_fails', [], originWithRef) === false);

  var originNoRef = ['a plain sentence'];
  assert('no warning when origin does not reference category', shouldShowWarning('noun_anchor', [], originNoRef) === false);

  assert('no warning when origin list is empty', shouldShowWarning('noun_anchor', [], []) === false);
})();

console.log('\nword add/remove');

(function testWordAddRemove() {
  var grammar = { origin: ['#noun_anchor#'], noun_anchor: ['mountain', 'stone'], noun_room: [], adjective_state: [], verb_fails: [] };

  var afterAdd = addWord(grammar, 'noun_anchor', 'river');
  assert('word added to correct category', afterAdd.noun_anchor.length === 3 && afterAdd.noun_anchor[2] === 'river');
  assert('addWord does not mutate original grammar', grammar.noun_anchor.length === 2);
  assert('other categories unchanged after add', afterAdd.noun_room.length === 0);

  var afterRemove = removeWord(afterAdd, 'noun_anchor', 1);
  assert('word removed by index', afterRemove.noun_anchor.length === 2 && afterRemove.noun_anchor.indexOf('stone') === -1);
  assert('removeWord does not mutate source grammar', afterAdd.noun_anchor.length === 3);

  var afterAddEmpty = addWord(grammar, 'noun_room', 'cellar');
  assert('add to empty category creates entry', afterAddEmpty.noun_room.length === 1 && afterAddEmpty.noun_room[0] === 'cellar');

  var afterRemoveFirst = removeWord(grammar, 'noun_anchor', 0);
  assert('remove first item leaves remaining', afterRemoveFirst.noun_anchor.length === 1 && afterRemoveFirst.noun_anchor[0] === 'stone');
})();

// ── Summary ──────────────────────────────────────────────────────────────────

console.log('\n' + (failed === 0 ? 'All ' + passed + ' tests passed.' : passed + ' passed, ' + failed + ' FAILED.') + '\n');
process.exit(failed > 0 ? 1 : 0);
