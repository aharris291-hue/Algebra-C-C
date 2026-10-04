#!/usr/bin/env bash
# Copy the working tree (without node_modules/build output) to the shared project folder.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="/mnt/project-files/algebra-cc-app"
mkdir -p "$DEST"
cd "$SRC"
tar --exclude=./node_modules --exclude=./dist --exclude=./release --exclude=./.tmp --exclude=./test-results --exclude=./playwright-report -cf - . | (cd "$DEST" && tar -xf -)
echo "synced to $DEST"
