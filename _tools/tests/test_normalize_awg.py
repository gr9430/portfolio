import sys
from pathlib import Path
import pytest
import yaml
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent.parent))
import normalize_awg


def make_image(path: Path, w: int, h: int) -> None:
    Image.new("RGB", (w, h), color=(100, 100, 100)).save(path)


class TestSlugify:
    def test_lowercases(self):
        assert normalize_awg.slugify("Hello") == "hello"

    def test_spaces_become_hyphens(self):
        assert normalize_awg.slugify("spit poster") == "spit-poster"

    def test_collapses_multiple_spaces(self):
        assert normalize_awg.slugify("cold  dead  stare") == "cold-dead-stare"

    def test_strips_special_chars(self):
        assert normalize_awg.slugify("Untitled-4 copy") == "untitled-4-copy"

    def test_preserves_existing_hyphens(self):
        assert normalize_awg.slugify("FR-MRR-12-20") == "fr-mrr-12-20"

    def test_strips_leading_trailing_hyphens(self):
        assert normalize_awg.slugify("-test-") == "test"

    def test_strips_underscores(self):
        assert normalize_awg.slugify("file_name") == "filename"


class TestNormalizeImage:
    def test_wide_image_resized_to_max_width(self, tmp_path):
        src, dst = tmp_path / "src.png", tmp_path / "out.jpg"
        make_image(src, 2400, 600)
        normalize_awg.normalize_image(src, dst)
        with Image.open(dst) as img:
            assert img.width == 1200
            assert img.height == 300

    def test_tall_image_resized_to_max_height(self, tmp_path):
        src, dst = tmp_path / "src.png", tmp_path / "out.jpg"
        make_image(src, 600, 2400)
        normalize_awg.normalize_image(src, dst)
        with Image.open(dst) as img:
            assert img.width == 300
            assert img.height == 1200

    def test_small_image_not_upscaled(self, tmp_path):
        src, dst = tmp_path / "src.png", tmp_path / "out.jpg"
        make_image(src, 800, 600)
        normalize_awg.normalize_image(src, dst)
        with Image.open(dst) as img:
            assert img.width == 800
            assert img.height == 600

    def test_output_is_jpeg(self, tmp_path):
        src, dst = tmp_path / "src.png", tmp_path / "out.jpg"
        make_image(src, 100, 100)
        normalize_awg.normalize_image(src, dst)
        with Image.open(dst) as img:
            assert img.format == "JPEG"


class TestLoadExistingFiles:
    def test_returns_empty_set_when_no_file(self, tmp_path, monkeypatch):
        monkeypatch.setattr(normalize_awg, "DATA_FILE", tmp_path / "missing.yml")
        assert normalize_awg.load_existing_files() == set()

    def test_returns_filenames_from_yaml(self, tmp_path, monkeypatch):
        f = tmp_path / "awg_images.yml"
        yaml.dump(
            [{"file": "early-test.jpg", "era": "early", "bands": [], "venues": [], "tags": []}],
            f.open("w"),
        )
        monkeypatch.setattr(normalize_awg, "DATA_FILE", f)
        assert normalize_awg.load_existing_files() == {"early-test.jpg"}

    def test_handles_empty_yaml_file(self, tmp_path, monkeypatch):
        f = tmp_path / "awg_images.yml"
        f.write_text("")
        monkeypatch.setattr(normalize_awg, "DATA_FILE", f)
        assert normalize_awg.load_existing_files() == set()


class TestAppendEntry:
    def test_creates_file_with_correct_fields(self, tmp_path, monkeypatch):
        f = tmp_path / "awg_images.yml"
        monkeypatch.setattr(normalize_awg, "DATA_FILE", f)
        normalize_awg.append_entry("early-test.jpg", "early")
        data = yaml.safe_load(f.read_text())
        assert data == [{"file": "early-test.jpg", "era": "early", "bands": [], "venues": [], "tags": []}]

    def test_appends_to_existing_entries(self, tmp_path, monkeypatch):
        f = tmp_path / "awg_images.yml"
        monkeypatch.setattr(normalize_awg, "DATA_FILE", f)
        normalize_awg.append_entry("early-a.jpg", "early")
        normalize_awg.append_entry("mid-b.jpg", "mid")
        data = yaml.safe_load(f.read_text())
        assert len(data) == 2
        assert data[1]["file"] == "mid-b.jpg"


class TestMain:
    def _patch(self, tmp_path, monkeypatch):
        src_base = tmp_path / "creative" / "graphic" / "awg-inc"
        out_dir = tmp_path / "assets" / "images" / "awg-inc"
        data_file = tmp_path / "_data" / "awg_images.yml"
        data_file.parent.mkdir(parents=True)
        monkeypatch.setattr(normalize_awg, "SOURCE_BASE", src_base)
        monkeypatch.setattr(normalize_awg, "OUTPUT_DIR", out_dir)
        monkeypatch.setattr(normalize_awg, "DATA_FILE", data_file)
        return src_base, out_dir, data_file

    def test_processes_images_in_all_eras(self, tmp_path, monkeypatch):
        src_base, out_dir, data_file = self._patch(tmp_path, monkeypatch)
        for era in ["early", "mid", "late"]:
            d = src_base / era
            d.mkdir(parents=True)
            make_image(d / "test.png", 100, 100)
        normalize_awg.main()
        assert len(list(out_dir.glob("*.jpg"))) == 3
        data = yaml.safe_load(data_file.read_text())
        assert len(data) == 3

    def test_skips_subdirectories(self, tmp_path, monkeypatch):
        src_base, out_dir, data_file = self._patch(tmp_path, monkeypatch)
        d = src_base / "early"
        d.mkdir(parents=True)
        sub = d / "subproject"
        sub.mkdir()
        make_image(sub / "image.png", 100, 100)
        normalize_awg.main()
        assert not out_dir.exists() or len(list(out_dir.glob("*.jpg"))) == 0

    def test_skips_non_image_files(self, tmp_path, monkeypatch):
        src_base, out_dir, data_file = self._patch(tmp_path, monkeypatch)
        d = src_base / "early"
        d.mkdir(parents=True)
        (d / "flyer.pdf").write_bytes(b"%PDF-1.4")
        normalize_awg.main()
        assert not out_dir.exists() or len(list(out_dir.glob("*.jpg"))) == 0

    def test_skips_already_processed_entries(self, tmp_path, monkeypatch):
        src_base, out_dir, data_file = self._patch(tmp_path, monkeypatch)
        out_dir.mkdir(parents=True)
        d = src_base / "early"
        d.mkdir(parents=True)
        make_image(d / "test.png", 100, 100)
        yaml.dump(
            [{"file": "early-test.jpg", "era": "early", "bands": [], "venues": [], "tags": []}],
            data_file.open("w"),
        )
        normalize_awg.main()
        data = yaml.safe_load(data_file.read_text())
        assert len(data) == 1  # no duplicate entry
