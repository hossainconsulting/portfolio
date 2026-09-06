#!/usr/bin/env bash
# Renders presence/assets/og.html to public/og.png at 1200x630 with headless Chromium.
# Usage: presence/scripts/build-og.sh [WxH] [output]
# Examples:
#   presence/scripts/build-og.sh                      # 1200x630 -> public/og.png
#   presence/scripts/build-og.sh 1584x396 banner-linkedin.png
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SIZE="${1:-1200x630}"
OUT="${2:-$HERE/../../public/og.png}"
SRC="$HERE/../assets/og.html"
CHROME="${CHROME:-$(command -v chromium || command -v chromium-browser || command -v google-chrome || ls /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | head -1)}"
[ -x "$CHROME" ] || { echo "no chromium found; set CHROME=/path/to/chrome" >&2; exit 1; }
"$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
  --window-size="${SIZE/x/,}" --screenshot="$OUT" "file://$SRC" 2>/dev/null
echo "wrote $OUT ($SIZE)"
