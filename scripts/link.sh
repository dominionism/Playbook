#!/usr/bin/env sh
# Link this checkout into the universal skills directory so that edits to
# skills/<name>/ are live in every installed agent without reinstalling.
#
# Run `npx skills add . --global` once before this script. That command
# copies each skill to ~/.agents/skills/<name> (the directory Codex, OpenCode,
# OMP, and Pi read directly) and links the agents that keep their own skill
# directory, such as Claude Code, to those copies. This script replaces each
# copy with a symlink to the checkout; the agent links keep resolving.
#
# Usage:  sh scripts/link.sh [--force]
#
# --force replaces a same-named skill that did not come from this checkout.
# Re-run `npx skills add . --global` at any time to go back to copies.
set -eu

force=0
[ "${1:-}" = "--force" ] && force=1

repo=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)
dest="${AGENTS_SKILLS_DIR:-$HOME/.agents/skills}"
mkdir -p "$dest"

linked=0
kept=0
skipped=0
for src in "$repo"/skills/*/; do
  src=${src%/}
  name=$(basename "$src")
  target="$dest/$name"
  [ -f "$src/SKILL.md" ] || continue

  if [ -L "$target" ]; then
    if [ "$(readlink "$target")" = "$src" ]; then
      kept=$((kept + 1))
      continue
    fi
    rm "$target"
  elif [ -d "$target" ]; then
    if [ "$force" -eq 0 ] && ! cmp -s "$target/SKILL.md" "$src/SKILL.md"; then
      echo "skip  $name: $target holds a different skill; pass --force to replace it" >&2
      skipped=$((skipped + 1))
      continue
    fi
    rm -rf "$target"
  elif [ -e "$target" ]; then
    echo "skip  $name: $target exists and is not a directory" >&2
    skipped=$((skipped + 1))
    continue
  fi

  ln -s "$src" "$target"
  echo "link  $target -> $src"
  linked=$((linked + 1))
done

echo "linked $linked, already linked $kept, skipped $skipped (in $dest)"
[ "$skipped" -eq 0 ]
