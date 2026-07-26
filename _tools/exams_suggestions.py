#!/usr/bin/env python3
"""
Suggest reading-list changes from the PhD exams citation graph.
Run from repo root: python3 _tools/exams_suggestions.py
No external dependencies.
"""

import math


def citation_key(entry):
    """A book's `citations` array holds either plain string keys or
    {"key": ..., "topic": ...} objects (e.g. Drucker's Coursebook, tagged
    by chapter). Both forms resolve to the same underlying key here."""
    return entry if isinstance(entry, str) else entry["key"]


def family_id(book):
    """Chapters of a split anthology (partOf set) collapse to their
    parent's id for voting/threshold purposes; every other book is its
    own family."""
    return book.get("partOf") or book["id"]


def build_citation_index(books):
    """Returns (citation_to_books, citation_to_families).

    citation_to_books: key -> list of raw citing book ids (chapters
    included individually).
    citation_to_families: key -> set of citing families (chapters of the
    same anthology collapse to one voter), used for the add-candidates
    hub threshold so an anthology can't manufacture a hub by citing
    something in 20 of its own chapters.
    """
    citation_to_books = {}
    citation_to_families = {}
    for book in books:
        for entry in book.get("citations", []):
            key = citation_key(entry)
            citation_to_books.setdefault(key, []).append(book["id"])
            citation_to_families.setdefault(key, set()).add(family_id(book))
    return citation_to_books, citation_to_families


def build_citation_key_to_book_id(books):
    """Reverse lookup from a book's own citationKey (when the book is
    itself already representing a citation entry) to its book id."""
    return {book["citationKey"]: book["id"] for book in books if book.get("citationKey")}


def main_books(books):
    """Every book except chapters of a split anthology (partOf set) —
    a chapter isn't a distinct book on the reading list."""
    return [b for b in books if not b.get("partOf")]


def children_by_parent(books):
    """Maps an anthology parent's id to the list of its chapter books."""
    result = {}
    for book in books:
        parent = book.get("partOf")
        if parent:
            result.setdefault(parent, []).append(book)
    return result


def effective_citations(book, children_map):
    """A book's own citation keys, unioned with its chapters' citation
    keys if it's a split-anthology parent. Anthologies split into
    chapters always carry an empty `citations` array on the parent by
    convention — the bibliography lives entirely on the chapters. Without
    folding it back up here, the parent would be permanently invisible to
    scoring: never flagged as isolated, but also never credited for the
    connectivity its chapters actually have."""
    keys = {citation_key(e) for e in book.get("citations", [])}
    for child in children_map.get(book["id"], []):
        keys.update(citation_key(e) for e in child.get("citations", []))
    return keys


def scored_books(books, children_map):
    """Main (non-chapter) books with a non-empty effective citations
    profile. An empty bibliography means "not evaluated yet," not
    "doesn't belong" — it must never show up as low-fit."""
    return [b for b in main_books(books) if effective_citations(b, children_map)]


def compute_degrees(books, children_map):
    """Raw structural degree: any effective-citation overlap >= 1 counts
    as an edge between two distinct scored books, graph-wide (not scoped
    to category or subject). `degree` is the neighbor count; `weight` is
    the total size of all shared-key intersections, reported as
    tie-break context, not used for ranking."""
    profiles = {b["id"]: effective_citations(b, children_map) for b in books}
    ids = list(profiles.keys())
    result = {bid: {"degree": 0, "weight": 0} for bid in ids}
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            shared = profiles[ids[i]] & profiles[ids[j]]
            if not shared:
                continue
            result[ids[i]]["degree"] += 1
            result[ids[j]]["degree"] += 1
            result[ids[i]]["weight"] += len(shared)
            result[ids[j]]["weight"] += len(shared)
    return result


def reconsider_list(books, degrees, percentile):
    """Bottom `percentile` fraction of `books` by degree (ties broken by
    id for determinism), ascending — worst-connected first. Always flags
    at least one book if `books` is non-empty."""
    ranked = sorted(books, key=lambda b: (degrees[b["id"]]["degree"], b["id"]))
    n_flagged = math.ceil(percentile * len(ranked))
    return ranked[:n_flagged]


def established_keys(citation_to_families, citation_key_to_book_id, hub_threshold):
    """A citation key is a real add-candidate if it isn't already
    representing a book on the list (no citationKey owner) and is cited
    by at least `hub_threshold` distinct families — mirrors the live
    page's establishedKeys() hub-promotion rule verbatim."""
    keys = [
        key
        for key, families in citation_to_families.items()
        if key not in citation_key_to_book_id and len(families) >= hub_threshold
    ]
    keys.sort(key=lambda k: (-len(citation_to_families[k]), k))
    return keys


def add_candidates(keys, citation_to_books, citation_to_families, citations, book_by_id):
    """Resolves each established key to its citation string, citing
    family count, and the titles of the books that cite it."""
    result = []
    for key in keys:
        citing_ids = citation_to_books[key]
        titles = sorted({book_by_id[bid]["title"] for bid in citing_ids if bid in book_by_id})
        result.append(
            {
                "key": key,
                "citation": citations.get(key, key),
                "family_count": len(citation_to_families[key]),
                "titles": titles,
            }
        )
    return result
