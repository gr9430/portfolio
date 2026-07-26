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
