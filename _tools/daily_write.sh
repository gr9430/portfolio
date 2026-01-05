#!/bin/bash
#
# Daily writing session launcher
# Run from your Jekyll site root directory
#
# Usage:
#   ./_tools/daily_write.sh           # Interactive menu
#   ./_tools/daily_write.sh --batch   # Non-interactive (generate file only)
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_ROOT="$(dirname "$SCRIPT_DIR")"

# Check for batch mode (non-interactive)
if [[ "$1" == "--batch" ]]; then
    python3 "$SCRIPT_DIR/writing_engine.py" \
        --output-dir "$SITE_ROOT/_posts" \
        --corpus-dir "$SCRIPT_DIR/corpus" \
        --min-words 300 \
        --max-words 500
    exit 0
fi

# Interactive mode (default)
python3 "$SCRIPT_DIR/interactive_session.py"
