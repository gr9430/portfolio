#!/usr/bin/env python3
"""
Suggest reading-list changes from the PhD exams citation graph.
Run from repo root: python3 _tools/exams_suggestions.py
No external dependencies.
"""


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
