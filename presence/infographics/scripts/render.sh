#!/usr/bin/env bash
# Wrapper: presence/infographics/scripts/render.sh boards/<name>.html
# Finds playwright-core in ./node_modules or $NODE_PATH.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
export NODE_PATH="${NODE_PATH:-$REPO/node_modules}"
node "$HERE/render.mjs" "$1" "${2:-$HERE/../out}"
