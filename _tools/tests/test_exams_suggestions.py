import json
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


class TestReconsiderList:
    def test_flags_the_lowest_degree_book_at_a_tight_percentile(self):
        books = [{"id": "a"}, {"id": "b"}, {"id": "c"}, {"id": "d"}, {"id": "e"}]
        degrees = {
            "a": {"degree": 1, "weight": 1},
            "b": {"degree": 1, "weight": 1},
            "c": {"degree": 0, "weight": 0},
            "d": {"degree": 1, "weight": 1},
            "e": {"degree": 1, "weight": 1},
        }
        flagged = es.reconsider_list(books, degrees, percentile=0.2)
        assert [b["id"] for b in flagged] == ["c"]

    def test_widening_percentile_flags_more_books_with_stable_tie_break(self):
        # Shuffle input order to ensure tie-break by id is actually used, not relying on input order
        books = [{"id": "e"}, {"id": "c"}, {"id": "b"}, {"id": "d"}, {"id": "a"}]
        degrees = {
            "a": {"degree": 1, "weight": 1},
            "b": {"degree": 1, "weight": 1},
            "c": {"degree": 0, "weight": 0},
            "d": {"degree": 1, "weight": 1},
            "e": {"degree": 1, "weight": 1},
        }
        flagged = es.reconsider_list(books, degrees, percentile=0.4)
        # c (degree 0) first, then the lowest-id degree-1 book as a tie-break
        assert [b["id"] for b in flagged] == ["c", "a"]

    def test_percentile_rounds_up_to_at_least_one_book(self):
        books = [{"id": "a"}, {"id": "b"}]
        degrees = {"a": {"degree": 5, "weight": 5}, "b": {"degree": 9, "weight": 9}}
        flagged = es.reconsider_list(books, degrees, percentile=0.01)
        assert [b["id"] for b in flagged] == ["a"]

    def test_negative_percentile_flags_nothing_rather_than_inverting(self):
        books = [{"id": "a"}, {"id": "b"}]
        degrees = {"a": {"degree": 1, "weight": 1}, "b": {"degree": 5, "weight": 5}}
        flagged = es.reconsider_list(books, degrees, percentile=-0.1)
        assert flagged == []


class TestEstablishedKeys:
    def test_includes_keys_at_or_above_threshold(self):
        citation_to_families = {"k1": {"a", "b", "c", "d"}, "k2": {"a", "b", "c"}}
        flagged = es.established_keys(citation_to_families, {}, hub_threshold=4)
        assert flagged == ["k1"]

    def test_excludes_keys_already_owned_by_a_real_book(self):
        citation_to_families = {"k1": {"a", "b", "c", "d"}}
        citation_key_to_book_id = {"k1": "some-book-already-on-the-list"}
        assert es.established_keys(citation_to_families, citation_key_to_book_id, hub_threshold=4) == []

    def test_sorted_by_citing_family_count_descending(self):
        citation_to_families = {
            "k1": {"a", "b", "c", "d"},
            "k2": {"a", "b", "c", "d", "e"},
        }
        assert es.established_keys(citation_to_families, {}, hub_threshold=4) == ["k2", "k1"]


class TestAddCandidates:
    def test_resolves_citation_string_family_count_and_citing_titles(self):
        citation_to_books = {"k1": ["a", "b", "c", "d"]}
        citation_to_families = {"k1": {"a", "b", "c", "d"}}
        citations = {"k1": "Foucault, Michel. Discipline and Punish."}
        book_by_id = {
            "a": {"id": "a", "title": "Book A"},
            "b": {"id": "b", "title": "Book B"},
            "c": {"id": "c", "title": "Book C"},
            "d": {"id": "d", "title": "Book D"},
        }
        result = es.add_candidates(["k1"], citation_to_books, citation_to_families, citations, book_by_id)
        assert result == [
            {
                "key": "k1",
                "citation": "Foucault, Michel. Discipline and Punish.",
                "family_count": 4,
                "titles": ["Book A", "Book B", "Book C", "Book D"],
            }
        ]

    def test_citing_chapters_of_the_same_anthology_collapse_to_the_parents_title(self):
        citation_to_books = {"k1": ["p-ch1", "p-ch2"]}
        citation_to_families = {"k1": {"p"}}
        citations = {"k1": "Shared Source. 2000."}
        book_by_id = {
            "p": {"id": "p", "title": "Debates in the Digital Humanities 2023"},
            "p-ch1": {"id": "p-ch1", "partOf": "p", "title": "The Queer Gap in Cultural Analytics"},
            "p-ch2": {"id": "p-ch2", "partOf": "p", "title": "Game Studies, Endgame?"},
        }
        result = es.add_candidates(["k1"], citation_to_books, citation_to_families, citations, book_by_id)
        assert result == [
            {
                "key": "k1",
                "citation": "Shared Source. 2000.",
                "family_count": 1,
                "titles": ["Debates in the Digital Humanities 2023"],
            }
        ]


class TestFormatReport:
    def test_report_contains_both_section_headers_and_flagged_content(self):
        reconsider = [{"id": "c", "title": "Isolated Book", "author": "Author C", "categories": ["core"], "subject": "game-studies"}]
        degrees = {"c": {"degree": 0, "weight": 0}}
        add_cands = [
            {"key": "k1", "citation": "Foucault, Michel. Discipline and Punish.", "family_count": 4, "titles": ["Book A", "Book B"]}
        ]
        report = es.format_report(reconsider, degrees, add_cands, scored_count=10, percentile=0.15, hub_threshold=4)
        assert "=== Reconsider (bottom 15% by connectivity, 1 of 10 scored books) ===" in report
        assert "Isolated Book" in report
        assert "Author C" in report
        assert "=== Consider adding (cited by >=4 books, not already on the list) ===" in report
        assert "Foucault, Michel. Discipline and Punish." in report
        assert "cited by: Book A, Book B" in report


class TestLoadData:
    def test_reads_json_file(self, tmp_path):
        path = tmp_path / "exams.json"
        path.write_text(json.dumps({"books": [], "citations": {}}), encoding="utf-8")
        assert es.load_data(path) == {"books": [], "citations": {}}


class TestOrchestrate:
    def test_end_to_end_on_a_small_synthetic_dataset(self):
        data = {
            "citations": {"k2": "Shared Source. 2000."},
            "books": [
                {"id": "a", "title": "Book A", "author": "Author A", "categories": ["core"], "subject": "game-studies", "citations": ["k1", "k2"]},
                {"id": "b", "title": "Book B", "author": "Author B", "categories": ["core"], "subject": "game-studies", "citations": ["k2", "k3"]},
                {"id": "c", "title": "Book C", "author": "Author C", "categories": ["primary"], "subject": "electronic-literature", "citations": ["k4"]},
            ],
        }
        report = es.orchestrate(data, percentile=0.4, hub_threshold=2)
        assert "Book C" in report  # degree 0, lowest-connectivity, flagged
        assert "Shared Source. 2000." in report  # k2 cited by a and b, hub_threshold=2

    def test_smoke_test_against_the_real_exams_data(self):
        real_path = Path(__file__).parent.parent.parent / "_data" / "exams.json"
        data = es.load_data(real_path)
        report = es.orchestrate(data)
        assert "=== Reconsider" in report
        assert "=== Consider adding" in report
