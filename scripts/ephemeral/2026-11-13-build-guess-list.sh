#!/usr/bin/env bash
# 2026-11-13 — Lexer 5.5 (Claude Opus 5.5)
# Purpose: build src/game/data/guesses.txt, the allowed-guess list chosen in
# ADR-0002 (QST-GUESS-VALIDATION → B: "CS answers, any English guess").
# Source: the ENABLE word list (Enhanced North American Benchmark LExicon),
# public domain. We keep only words of exactly five lowercase letters,
# uppercase them, sort, and dedupe. Answers are merged in at runtime by the
# app (src/game/words.ts), so CS terms missing from ENABLE stay typeable.
#
# Usage: scripts/ephemeral/2026-11-13-build-guess-list.sh <download-dir>
#   <download-dir> should be an empty scratch directory (the download is
#   untrusted data and is only ever read as text).
set -euo pipefail

DL_DIR="${1:?usage: $0 <download-dir>}"
URL="https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt"
OUT="src/game/data/guesses.txt"

mkdir -p "$DL_DIR" "$(dirname "$OUT")"
curl -fsSL "$URL" -o "$DL_DIR/enable1.txt"

tr -d '\r' < "$DL_DIR/enable1.txt" \
  | grep -E '^[a-z]{5}$' \
  | tr '[:lower:]' '[:upper:]' \
  | sort -u > "$OUT"

echo "source lines: $(wc -l < "$DL_DIR/enable1.txt")"
echo "five-letter guesses written to $OUT: $(wc -l < "$OUT")"

# OUTCOME (2026-11-13, first run): 172,823 source lines → 8,636 five-letter
# guesses (52 KB on disk). Spot check: CRANE, STACK, QUEUE present; MUTEX,
# TUPLE, LEXER, DEQUE, QUBIT absent, which confirms ADR-0002's call to merge
# the answer list into the allowed guesses at runtime (a unit test guards it).
