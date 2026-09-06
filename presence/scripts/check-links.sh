#!/usr/bin/env bash
# Curls every URL in presence/profiles.md and prints the HTTP status.
# Usage: presence/scripts/check-links.sh [path/to/profiles.md]
# Note: some platforms (LinkedIn, Instagram, X) return 999/403/redirect-to-login
# for anonymous requests. A 2xx/3xx means the URL is at least routable; a 404
# means the handle is free or the URL is wrong.
set -u
FILE="${1:-$(dirname "$0")/../profiles.md}"
grep -Eo 'https?://[^ )`|<>]+' "$FILE" \
  | sed -E 's/[.,]$//' \
  | grep -vE '`|<' \
  | sort -u \
  | while read -r url; do
      code=$(curl -sS -o /dev/null -m 20 -L -A "Mozilla/5.0 (presence-check)" -w '%{http_code}' "$url" 2>/dev/null || echo ERR)
      printf '%-4s %s\n' "$code" "$url"
    done
