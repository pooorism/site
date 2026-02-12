#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
OUT_DIR="$ROOT_DIR/release"
OUT_ZIP="$OUT_DIR/bersad-static-cpanel.zip"

if [[ ! -d "$DIST_DIR" ]]; then
  echo "dist directory not found: $DIST_DIR" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
rm -f "$OUT_ZIP"
(
  cd "$DIST_DIR"
  zip -rq "$OUT_ZIP" .
)

echo "Created: $OUT_ZIP"
