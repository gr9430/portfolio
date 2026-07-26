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
