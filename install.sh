#!/usr/bin/env bash
# Sync ~/.commands into every CLI that consumes it. Idempotent — re-run
# after adding, renaming, or deleting a command.
#
#   Claude Code : ~/.claude/commands/<name>.md          -> ~/.commands/<name>.md
#   OpenCode    : ~/.config/opencode/command/.commands  -> ~/.commands  (whole dir)
#   Pi          : ~/.pi/agent/extensions/<name>.ts      -> ~/.commands/<name>.pi.ts
#   OMP         : ~/.omp/agent/config.yml extensions list (checked, not edited —
#                 YAML is reported, never rewritten by a script)

set -euo pipefail

SRC="$HOME/.commands"

# --- Claude Code -------------------------------------------------------------
CLAUDE_DIR="$HOME/.claude/commands"
if [ -d "$CLAUDE_DIR" ]; then
  for f in "$SRC"/*.md; do
    name="$(basename "$f")"
    [ -e "$CLAUDE_DIR/$name" ] || ln -s "$f" "$CLAUDE_DIR/$name"
  done
  broken=$(find -L "$CLAUDE_DIR" -type l | wc -l | tr -d ' ')
  echo "claude   : $(ls "$CLAUDE_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ') linked, $broken broken"
else
  echo "claude   : $CLAUDE_DIR not found — skipped"
fi

# --- OpenCode ----------------------------------------------------------------
OC_LINK="$HOME/.config/opencode/command/.commands"
if [ -L "$OC_LINK" ] && [ "$(readlink "$OC_LINK")" = "$SRC" ]; then
  echo "opencode : directory symlink OK"
else
  mkdir -p "$(dirname "$OC_LINK")"
  ln -sfn "$SRC" "$OC_LINK"
  echo "opencode : directory symlink created"
fi

# --- Pi ----------------------------------------------------------------------
PI_DIR="$HOME/.pi/agent/extensions"
if [ -d "$PI_DIR" ]; then
  for f in "$SRC"/*.pi.ts; do
    name="$(basename "$f" .pi.ts).ts"
    target="$PI_DIR/$name"
    if [ ! -L "$target" ] || [ "$(readlink "$target")" != "$f" ]; then
      ln -sfn "$f" "$target"   # replaces stale copies and wrong links
    fi
  done
  for l in "$PI_DIR"/*.ts; do
    if [ -L "$l" ] && [ ! -e "$l" ]; then
      echo "pi       : WARNING dangling link $(basename "$l") — command deleted? remove it"
    fi
  done
  echo "pi       : loaders linked"
else
  echo "pi       : $PI_DIR not found — skipped"
fi

# --- OMP ---------------------------------------------------------------------
OMP_CFG="$HOME/.omp/agent/config.yml"
if [ -f "$OMP_CFG" ]; then
  missing=0
  for f in "$SRC"/*.pi.ts; do
    entry="~/.commands/$(basename "$f")"
    if ! grep -qF -- "- $entry" "$OMP_CFG"; then
      echo "omp      : MISSING from extensions list:  - $entry"
      missing=1
    fi
  done
  [ "$missing" -eq 0 ] && echo "omp      : all loaders listed in config.yml"
else
  echo "omp      : $OMP_CFG not found — skipped"
fi
