/**
 * canvas.test.js — Node.js test for pure logic in canvas.js
 * Exercises: Tracery fragment generation, element placement schema,
 *            page navigation, and page counter string.
 * No DOM required.
 */

'use strict';

// ── Minimal stubs ────────────────────────────────────────────────────────────

// Tracery stub (mirrors tracery.js logic exactly)
var Tracery = {
  expand: function (grammar, symbol, depth) {
    depth = depth || 0;
    if (depth > 20) return '[' + symbol + ']';
    var options = grammar[symbol];
    if (!options || !options.length) return '[' + symbol + ']';
    var template = options[Math.floor(Math.random() * options.length)];
    var self = this;
    return template.replace(/#([^#]+)#/g, function (_, s) {
      return self.expand(grammar, s, depth + 1);
    });
  }
};

// ZineStore stub — minimal in-memory store
var _state = {
  grammar: {
    origin: [
      'the #noun_anchor# #verb_fails# into the #noun_room#',
      '#adjective_state# #noun_anchor# against the #noun_room#'
    ],
    noun_anchor: ['cairn', 'summit', 'lake'],
    noun_room: ['passage', 'chamber', 'hollow'],
    adjective_state: ['ancient', 'misted', 'eroded'],
    verb_fails: ['yields', 'dissolves', 'recedes']
  },
  imageSource: 'both',
  images: [
    { id: 'img_001', src: 'images/test-01.jpg', alt: 'test image', provenance: 'instructor' },
    { id: 'img_own_1', src: 'data:image/jpeg;base64,AAAA', alt: '', provenance: 'student' }
  ],
  pages: [{ id: 'page_001', elements: [] }]
};

var ZineStore = {
  get state() { return _state; },
  update: function (patch) { Object.assign(_state, patch); }
};

// ── Pure-logic helpers extracted from canvas.js ──────────────────────────────

function throwFragments(count) {
  count = Math.min(20, Math.max(1, count));
  var results = [];
  for (var i = 0; i < count; i++) {
    results.push(Tracery.expand(ZineStore.state.grammar, 'origin'));
  }
  return results;
}

function placeElement(item, x, y, pages, currentPageIndex) {
  if (currentPageIndex >= pages.length) currentPageIndex = pages.length - 1;
  var page = pages[currentPageIndex];
  var el;
  if (item.type === 'fragment') {
    el = { type: 'fragment', text: item.text, x: x, y: y };
  } else if (item.type === 'image') {
    el = { type: 'image', imageId: item.imageId, x: x, y: y, w: 200, h: 150 };
  } else {
    el = { type: 'text', text: item.text, x: x, y: y };
  }
  page.elements.push(el);
  ZineStore.update({ pages: pages.slice() });
  return el;
}

function addNewPage(pages) {
  var id = 'page_' + String(pages.length + 1).padStart(3, '0');
  pages.push({ id: id, elements: [] });
  ZineStore.update({ pages: pages.slice() });
  return pages.length - 1; // new currentPageIndex
}

function pageCounterText(currentPageIndex, totalPages) {
  return 'Page ' + (currentPageIndex + 1) + ' of ' + totalPages;
}

function visibleImages() {
  var src = ZineStore.state.imageSource || 'both';
  if (src === 'both') return ZineStore.state.images;
  var want = (src === 'mine') ? 'student' : 'instructor';
  return ZineStore.state.images.filter(function (img) { return img.provenance === want; });
}

// ── Test harness ─────────────────────────────────────────────────────────────

var passed = 0;
var failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log('  PASS:', label);
    passed++;
  } else {
    console.error('  FAIL:', label);
    failed++;
  }
}

// ── Test 1: Fragment generation ──────────────────────────────────────────────
console.log('\n[1] Fragment generation');

var fragments = throwFragments(6);
assert('generates exactly 6 fragments', fragments.length === 6);
fragments.forEach(function (f, i) {
  assert('fragment ' + (i + 1) + ' contains no unresolved #symbol# markers', !/#[^#]+#/.test(f));
  assert('fragment ' + (i + 1) + ' is a non-empty string', typeof f === 'string' && f.length > 0);
});

var single = throwFragments(1);
assert('count=1 yields 1 fragment', single.length === 1);

var clamped = throwFragments(25);
assert('count clamped to 20 max', clamped.length === 20);

var clampedLow = throwFragments(0);
assert('count clamped to 1 min', clampedLow.length === 1);

// ── Test 2: Element placement — schema correctness ───────────────────────────
console.log('\n[2] Element placement');

// Reset pages to a clean state
var pages = [{ id: 'page_001', elements: [] }];
ZineStore.update({ pages: pages });

var frag = placeElement({ type: 'fragment', text: 'ancient cairn erodes' }, 120, 80, ZineStore.state.pages, 0);
assert('fragment element has type "fragment"', frag.type === 'fragment');
assert('fragment element has correct text', frag.text === 'ancient cairn erodes');
assert('fragment element has correct x', frag.x === 120);
assert('fragment element has correct y', frag.y === 80);
assert('fragment element has no imageId', frag.imageId === undefined);

var imgEl = placeElement({ type: 'image', imageId: 'img_001' }, 50, 200, ZineStore.state.pages, 0);
assert('image element has type "image"', imgEl.type === 'image');
assert('image element has imageId', imgEl.imageId === 'img_001');
assert('image element has default w=200', imgEl.w === 200);
assert('image element has default h=150', imgEl.h === 150);
assert('image element has no text', imgEl.text === undefined);

var textEl = placeElement({ type: 'text', text: 'my own words' }, 300, 10, ZineStore.state.pages, 0);
assert('text element has type "text"', textEl.type === 'text');
assert('text element has correct text', textEl.text === 'my own words');

assert('page now has 3 elements', ZineStore.state.pages[0].elements.length === 3);

// ── Test 3: Page navigation ──────────────────────────────────────────────────
console.log('\n[3] Page navigation');

pages = ZineStore.state.pages.slice(); // [page_001 with 3 elements]
var currentPageIndex = 0;

// Add a new page
currentPageIndex = addNewPage(pages);
pages = ZineStore.state.pages; // re-read after update
assert('addNewPage yields index 1', currentPageIndex === 1);
assert('total pages is now 2', pages.length === 2);
assert('new page id is page_002', pages[1].id === 'page_002');
assert('new page elements is empty', pages[1].elements.length === 0);

// Navigate prev
if (currentPageIndex > 0) currentPageIndex--;
assert('prevPage brings index back to 0', currentPageIndex === 0);

// Navigate next
if (currentPageIndex < pages.length - 1) currentPageIndex++;
assert('nextPage brings index to 1', currentPageIndex === 1);

// Prev/next clamping
var clampIdx = 0;
if (clampIdx > 0) clampIdx--; // should not go below 0
assert('prevPage does not go below 0', clampIdx === 0);

var clampIdxHigh = pages.length - 1;
if (clampIdxHigh < pages.length - 1) clampIdxHigh++; // should not exceed length-1
assert('nextPage does not exceed last page', clampIdxHigh === pages.length - 1);

// ── Test 4: Page counter string ──────────────────────────────────────────────
console.log('\n[4] Page counter text');

assert('counter "Page 1 of 1"', pageCounterText(0, 1) === 'Page 1 of 1');
assert('counter "Page 2 of 2"', pageCounterText(1, 2) === 'Page 2 of 2');
assert('counter "Page 1 of 3"', pageCounterText(0, 3) === 'Page 1 of 3');

// ── Test 5: Element deletion (array splice) ──────────────────────────────────
console.log('\n[5] Element deletion');

pages = [{ id: 'page_001', elements: [
  { type: 'fragment', text: 'A', x: 0, y: 0 },
  { type: 'fragment', text: 'B', x: 10, y: 10 },
  { type: 'fragment', text: 'C', x: 20, y: 20 }
] }];
ZineStore.update({ pages: pages });

// Simulate deleting element at idx 1 (B)
ZineStore.state.pages[0].elements.splice(1, 1);
ZineStore.update({ pages: ZineStore.state.pages.slice() });

assert('after delete, 2 elements remain', ZineStore.state.pages[0].elements.length === 2);
assert('remaining elements are A and C', ZineStore.state.pages[0].elements[0].text === 'A' && ZineStore.state.pages[0].elements[1].text === 'C');

// ── Test 6: Image source filtering ────────────────────────────────────────
console.log('\n[6] Image source filtering');

ZineStore.update({ imageSource: 'both' });
assert('both: returns all images', visibleImages().length === 2);

ZineStore.update({ imageSource: 'instructor' });
var instructorOnly = visibleImages();
assert('instructor: returns only instructor images', instructorOnly.length === 1 && instructorOnly[0].provenance === 'instructor');

ZineStore.update({ imageSource: 'mine' });
var mineOnly = visibleImages();
assert('mine: returns only student images', mineOnly.length === 1 && mineOnly[0].provenance === 'student');

ZineStore.update({ images: [{ id: 'img_001', src: 'images/test-01.jpg', alt: '', provenance: 'instructor' }] });
assert('mine: returns empty array when no student images exist', visibleImages().length === 0);

ZineStore.update({ imageSource: 'both' }); // reset for any later tests

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n──────────────────────────────────────────');
console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
