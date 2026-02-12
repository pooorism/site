#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_ZIP="${ROOT_DIR}/bersad-dist-cpanel.zip"
BUILD_DIR="${ROOT_DIR}/dist_static"

rm -f "$OUT_ZIP"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/admin" "$BUILD_DIR/assets" "$BUILD_DIR/data"

cp "$ROOT_DIR/index.html" "$ROOT_DIR/styles.css" "$ROOT_DIR/app.js" "$ROOT_DIR/.htaccess" "$BUILD_DIR/"
cp -r "$ROOT_DIR/assets/"* "$BUILD_DIR/assets/"
cp -r "$ROOT_DIR/data/"* "$BUILD_DIR/data/"
cp "$ROOT_DIR/admin/index.html" "$ROOT_DIR/admin/admin.css" "$ROOT_DIR/admin/admin.js" "$BUILD_DIR/admin/"

(
  cd "$BUILD_DIR"
  zip -r "$OUT_ZIP" .
)

python - <<'PY'
import os, zipfile
from pathlib import Path
root = Path(os.getcwd())
zip_path = root / 'bersad-dist-cpanel.zip'
manifest = root / 'ZIP_CONTENTS.txt'
with zipfile.ZipFile(zip_path) as z:
    names = z.namelist()
manifest.write_text('\n'.join(names) + '\n', encoding='utf-8')
print(f'ZIP created: {zip_path}')
print(f'Entries: {len(names)}')
print(f'Manifest: {manifest}')
PY

rm -rf "$BUILD_DIR"
