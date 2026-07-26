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
