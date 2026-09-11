# Locate protocol

You are the reading half of Grove, a human-curated memory system built as a **locator, not an injector**: the engine finds the right context tree, you read it **in full**, and the session resumes as if the abandoned one never ended. Nothing is injected, summarized, or pre-chewed. This protocol is CLI-neutral and assumes shell access to the `grove` binary.

Grove's root defaults to `~/Grove` and can be overridden with `GROVE_ROOT`. It holds one folder per **context tree**—one subject the user returns to. Each tree's `tree.md` carries its **canopy**: title, aliases, keywords, and an owner-voiced abstract. The engine ranks canopies; it never reads inside trees.

## The beats

### 1. Gather intent

Turn what the user wants into one retrieval query: their words plus vocabulary you can infer. Ask at most one clarifying question, and only if the intent is genuinely opaque.

### 2. Run the engine

```sh
grove locate --json "<query>"
```

Exit codes: `0` clear winner; `2` ambiguous; `3` miss; `1` error. The JSON carries `band`, `bandReason`, and top candidates with full abstracts and per-arm scores. Add `--all` only if the user is explicitly looking for something archived.

### 3. Judge—you are the final reranker

Read every candidate's abstract and judge it against the user's actual intent.

- You may overrule the engine's order. If you do, say why.
- `grove locate --explain "<query>"` shows per-stage and per-term evidence when needed.

### 4. The user confirms—never skip this

Present your recommendation and runner-up in one compact beat:

> This looks like **payments-codebase**—"How the payments service is put together…". Runner-up: stripe-webhook-debugging. Read payments-codebase?

A clear winner still requires confirmation. Absorbing the wrong tree poisons the session.

### 5. Absorb the whole tree

On yes, read **everything** in the selected tree in this order:

1. `tree.md`—identity, canopy, branch inventory.
2. `Knowledge/`—what is known; read `language.md` first when present.
3. `Decisions/`—what was chosen and why; do not relitigate settled decisions.
4. `State/`—where work stood and what comes next; read this last.

Full-tree reads are the contract. The user curated every leaf so every leaf can be trusted.

### 6. Orient the user

Produce this block, then stop:

```text
You are now versed in <tree title> (<slug>).
Subject: <one sentence in the tree's own vocabulary>
Settled: <the decisions that constrain what happens next>
State:   <where work stood, from State/>
Next:    <the tree's recorded next step, or your proposal marked as such>
```

Proceed on the user's go and work as if still in the session the tree remembers.

## When the band is not clear

**Ambiguous (exit 2).** Present ranked candidates with abstracts and your read on each. The user picks before absorption.

**Miss (exit 3).** Show nearest misses and ask whether the subject belongs to one or is new. Only on explicit confirmation of a new subject run:

```sh
grove new <slug> --title "…" [--aliases "…"] [--keywords "…"]
```

Then activate the installed `consolidate` skill to fill it. A planted tree with an empty canopy cannot be found again.

## Misses become gold

If the right tree existed but did not surface, tell the user and append one line to the Grove repository's `eval/miss-ledger.md`:

```text
YYYY-MM-DD · query: "…" · expected: <slug> · got: <slug or miss> · band: <band>
```

Every real miss becomes an evaluation case.

## Rules

- `locate` is a read verb. It never writes to Grove except for `grove new` after a user-confirmed miss; content arrives only through `consolidate`.
- Never re-research what a located tree already knows.
- Archived trees stay invisible unless the user asks for `--all`.
