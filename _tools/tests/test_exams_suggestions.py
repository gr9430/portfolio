import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))
import exams_suggestions as es


class TestCitationKey:
    def test_plain_string_entry(self):
        assert es.citation_key("foucault1977") == "foucault1977"

    def test_tagged_dict_entry(self):
        assert es.citation_key({"key": "croxall2018", "topic": "DH Overview"}) == "croxall2018"


class TestFamilyId:
    def test_book_without_partof_is_its_own_family(self):
        assert es.family_id({"id": "hayles-posthuman"}) == "hayles-posthuman"

    def test_chapter_family_is_its_parent(self):
        assert es.family_id({"id": "debates23-ch01", "partOf": "debates-23"}) == "debates-23"


class TestBuildCitationIndex:
    def test_raw_citing_ids_include_each_chapter_individually(self):
        books = [
            {"id": "p-ch1", "partOf": "p", "citations": ["k6", "k5"]},
            {"id": "p-ch2", "partOf": "p", "citations": ["k6", "k7"]},
            {"id": "d", "citations": ["k6"]},
        ]
        citation_to_books, _ = es.build_citation_index(books)
        assert sorted(citation_to_books["k6"]) == ["d", "p-ch1", "p-ch2"]

    def test_families_collapse_sibling_chapters(self):
        books = [
            {"id": "p-ch1", "partOf": "p", "citations": ["k6"]},
            {"id": "p-ch2", "partOf": "p", "citations": ["k6"]},
            {"id": "d", "citations": ["k6"]},
        ]
        _, citation_to_families = es.build_citation_index(books)
        assert citation_to_families["k6"] == {"p", "d"}

    def test_tagged_entries_resolve_the_same_as_plain_strings(self):
        books = [{"id": "drucker-coursebook", "citations": [{"key": "croxall2018", "topic": "DH Overview"}]}]
        citation_to_books, citation_to_families = es.build_citation_index(books)
        assert citation_to_books["croxall2018"] == ["drucker-coursebook"]
        assert citation_to_families["croxall2018"] == {"drucker-coursebook"}


class TestBuildCitationKeyToBookId:
    def test_maps_own_citation_key_to_book_id(self):
        books = [
            {"id": "hayles-posthuman", "citationKey": "hayles1999"},
            {"id": "no-key-book"},
        ]
        assert es.build_citation_key_to_book_id(books) == {"hayles1999": "hayles-posthuman"}


class TestMainBooks:
    def test_excludes_chapters(self):
        books = [{"id": "p"}, {"id": "p-ch1", "partOf": "p"}]
        assert [b["id"] for b in es.main_books(books)] == ["p"]


class TestChildrenByParent:
    def test_groups_chapters_under_their_parent_id(self):
        books = [
            {"id": "p"},
            {"id": "p-ch1", "partOf": "p"},
            {"id": "p-ch2", "partOf": "p"},
            {"id": "other"},
        ]
        children = es.children_by_parent(books)
        assert sorted(b["id"] for b in children["p"]) == ["p-ch1", "p-ch2"]
        assert "other" not in children


class TestEffectiveCitations:
    def test_plain_book_uses_its_own_citations(self):
        book = {"id": "a", "citations": ["k1", "k2"]}
        assert es.effective_citations(book, {}) == {"k1", "k2"}

    def test_anthology_parent_unions_its_chapters(self):
        parent = {"id": "p", "citations": []}
        children_map = {
            "p": [
                {"id": "p-ch1", "partOf": "p", "citations": ["k5", "k6"]},
                {"id": "p-ch2", "partOf": "p", "citations": ["k6", "k7"]},
            ]
        }
        assert es.effective_citations(parent, children_map) == {"k5", "k6", "k7"}

    def test_untranscribed_book_with_no_children_is_empty(self):
        book = {"id": "c", "citations": []}
        assert es.effective_citations(book, {}) == set()


class TestScoredBooks:
    def test_excludes_untranscribed_and_chapters_but_keeps_transcribed_anthology_parent(self):
        books = [
            {"id": "a", "citations": ["k1"]},
            {"id": "untranscribed", "citations": []},
            {"id": "p", "citations": []},
            {"id": "p-ch1", "partOf": "p", "citations": ["k5"]},
        ]
        children_map = es.children_by_parent(books)
        ids = [b["id"] for b in es.scored_books(books, children_map)]
        assert sorted(ids) == ["a", "p"]


class TestComputeDegrees:
    def test_degree_and_weight_across_a_small_graph(self):
        # a/b share k2 (1 key). c is isolated. p (anthology parent, folded
        # via children_map) and d share k6 (1 key) through p's chapters.
        books = [
            {"id": "a", "citations": ["k1", "k2"]},
            {"id": "b", "citations": ["k2", "k3"]},
            {"id": "c", "citations": ["k4"]},
            {"id": "p", "citations": []},
            {"id": "p-ch1", "partOf": "p", "citations": ["k5", "k6"]},
            {"id": "p-ch2", "partOf": "p", "citations": ["k6", "k7"]},
            {"id": "d", "citations": ["k6"]},
        ]
        children_map = es.children_by_parent(books)
        scored = es.scored_books(books, children_map)
        degrees = es.compute_degrees(scored, children_map)

        assert degrees["a"] == {"degree": 1, "weight": 1}
        assert degrees["b"] == {"degree": 1, "weight": 1}
        assert degrees["c"] == {"degree": 0, "weight": 0}
        assert degrees["p"] == {"degree": 1, "weight": 1}
        assert degrees["d"] == {"degree": 1, "weight": 1}
        # chapters are never individually scored
        assert "p-ch1" not in degrees
        assert "p-ch2" not in degrees

    def test_weight_accumulates_multiple_shared_keys_with_one_neighbor(self):
        books = [
            {"id": "a", "citations": ["k1", "k2", "k3"]},
            {"id": "b", "citations": ["k1", "k2", "k9"]},
        ]
        children_map = {}
        degrees = es.compute_degrees(books, children_map)
        assert degrees["a"] == {"degree": 1, "weight": 2}
        assert degrees["b"] == {"degree": 1, "weight": 2}
