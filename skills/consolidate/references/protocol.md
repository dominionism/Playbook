# Consolidate protocol

You are the writing half of Grove. Consolidation is how anything becomes memory: the user decides *that* something is remembered; this protocol decides *where* and *how well*. Nothing here is autonomous—writes are proposed, reviewed as a diff, and become memory only through the user's explicit acceptance, committed in the grove's linear Git history. This protocol is CLI-neutral and assumes shell access to the `grove` binary.

## The beats

### 1. Scope—what is being remembered?

State, in one owner-voiced paragraph, the subject and the signal worth keeping from this session. This paragraph is also your routing query. If the user named the subject, routing still runs as the sanity check, not the decider.

### 2. Routing pass—the same engine, three outcomes

```sh
grove locate --json "<one-paragraph summary>"
```

- **Clear winner (exit 0).** Route there autonomously, but say it inline and sanity-check the winning abstract before writing. If the abstract does not actually describe this session's subject, treat it as ambiguous. A silent mis-route corrupts one tree's signal and hides the memory from its subject.
- **Ambiguous (exit 2).** Show the ranked candidates with abstracts; the user picks the destination.
- **Miss (exit 3).** Propose a new tree, showing nearest misses first. On the user's confirmation, run `grove new <slug> --title "…"`. One subject, one tree.

Auto-routing may skip the question. It never skips acceptance.

### 3. Distill—write the branches and leaves

Trees hold **branches** (folders grouping one kind of signal) of **leaves** (signal-dense files). The conventions, all optional per tree:

- `Knowledge/`—what is now known: maps, findings, explanations, gotchas.
- `Decisions/`—what was chosen and why, so no future session relitigates it. Use one leaf per decision or a running `decisions.md`; date each entry.
- `State/`—where work stands: current position, open threads, exact next step. Update it in place rather than appending.

Two writing rules govern every leaf:

- **The signal check.** Write what a future session needs to resume at full speed—never transcript dumps or play-by-play. If a sentence would not change what a future session does or knows, cut it.
- **The owner-voice rule.** Preserve the user's framing, metaphors, and vocabulary. If the subject has its own vocabulary, keep a `language.md` leaf in `Knowledge/` and speak it.

Leaves are Markdown by default, but any context-rich file belongs: diagrams, JSON fixtures, or transcript excerpts that are themselves the signal.

### 4. Refresh the canopy—mandatory

Open the tree's `tree.md` and make its canopy true again:

- **Abstract**—owner-voiced and accurate after this session.
- **Aliases / keywords**—absorb this session's vocabulary.
- **`updated`**—today's date.

If the user declared the subject dead, set `status: archived`. Archived trees leave default locate results.

### 5. Reindex

```sh
grove reindex
```

This re-embeds changed canopies, prunes dead vectors, and regenerates the grove-root `Glossary.md`; never edit that generated file manually. If reindex refuses because a tree is broken, fix that first.

### 6. Acceptance—review, yes, commit

Stage everything and show the user the actual diff:

```sh
git -C "$GROVE_ROOT" add -A && git -C "$GROVE_ROOT" status --short
git -C "$GROVE_ROOT" diff --staged
```

Walk through which leaves grew and what the canopy now says. Then enforce the gate:

- Nothing enters memory without being seen. Wait for an explicit yes.
- On yes, create one linear commit such as `consolidate(<slug>): <what this session added>`. Add no co-author lines or tool attribution.
- On requested edits, apply them, re-show the diff, and ask again.
- On abandon, run `git -C "$GROVE_ROOT" restore --staged --worktree .` and report that nothing was remembered.

## Rules

- No autonomous writes to the grove. This protocol is the only door, and the user's yes is its hinge.
- `branch` in Grove vocabulary means a folder in a tree, never a Git branch. Keep the grove's Git history linear: commit to the current branch, create none, push nowhere.
- Never consolidate noise to feel productive. An honest "nothing worth remembering this session" is valid.
