#!/usr/bin/env python3
"""
Normalize AWG INC era images for web gallery.
Run from repo root: python _tools/normalize_awg.py
Requires: pip install pillow pyyaml
"""
import re
import sys
import yaml
from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).parent.parent
SOURCE_BASE = REPO_ROOT / "creative" / "graphic" / "awg-inc"
OUTPUT_DIR = REPO_ROOT / "assets" / "images" / "awg-inc"
DATA_FILE = REPO_ROOT / "_data" / "awg_images.yml"
ERAS = ["early", "mid", "late"]
ACCEPTED = {".png", ".jpg", ".jpeg", ".jfif", ".webp"}
MAX_DIM = 1200
QUALITY = 85


def slugify(name: str) -> str:
    name = name.lower()
    name = re.sub(r"[^a-z0-9\s\.-]", "", name)
    name = re.sub(r"\s+", "-", name)
    name = re.sub(r"-{2,}", "-", name)
    return name.strip("-")


def normalize_image(src: Path, dst: Path) -> None:
    with Image.open(src) as img:
        img = img.convert("RGB")
        w, h = img.size
        if max(w, h) > MAX_DIM:
            ratio = MAX_DIM / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
        img.save(dst, "JPEG", quality=QUALITY)


def load_existing_files() -> set:
    if not DATA_FILE.exists():
        return set()
    with open(DATA_FILE) as f:
        data = yaml.safe_load(f) or []
    return {entry["file"] for entry in data}


def append_entry(filename: str, era: str) -> None:
    existing = []
    if DATA_FILE.exists():
        with open(DATA_FILE) as f:
            existing = yaml.safe_load(f) or []
    existing.append({"file": filename, "era": era, "bands": [], "venues": [], "locations": [], "tags": []})
    with open(DATA_FILE, "w") as f:
        yaml.dump(existing, f, default_flow_style=False, allow_unicode=True)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    existing = load_existing_files()

    for era in ERAS:
        era_dir = SOURCE_BASE / era
        if not era_dir.is_dir():
            print(f"Warning: {era_dir} not found, skipping", file=sys.stderr)
            continue
        for src in sorted(era_dir.iterdir()):
            if not src.is_file():
                continue
            if src.suffix.lower() not in ACCEPTED:
                continue
            slug = slugify(src.stem)
            if not slug:
                print(f"Warning: could not slugify '{src.name}', skipping", file=sys.stderr)
                continue
            out_name = f"{era}-{slug}.jpg"
            if out_name in existing:
                print(f"Skip (already in data): {out_name}")
                continue
            dst = OUTPUT_DIR / out_name
            if dst.exists():
                print(f"Skip (output file exists but not in data): {out_name}", file=sys.stderr)
                continue
            try:
                normalize_image(src, dst)
                append_entry(out_name, era)
                existing.add(out_name)
                print(f"OK: {src.name} -> {out_name}")
            except Exception as exc:
                print(f"Error: {src.name}: {exc}", file=sys.stderr)


if __name__ == "__main__":
    main()
