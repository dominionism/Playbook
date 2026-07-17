---
description: Map a codebase or feature for complete understanding. Comprehensive mode maps the full project; specific mode deep-dives a feature, module, or area. The synthesis lives in context — not on disk.
---

Map this codebase so you can work in it with confidence for the rest of this session. Produce understanding, not documentation.

## Mode

- **Comprehensive** (no target given, or user says "full" / "everything"): map the entire project.
- **Specific** (user names a feature, module, file, or area): deep-dive that target and only survey the rest.

If the user provided a target, you are in specific mode. If they didn't, ask: comprehensive or specific? One question only.

---

## Scan

### 1. Structure
Read the top-level directory tree and `package.json` (or equivalent manifest). Identify:
- The stack (framework, runtime, database, key dependencies)
- The build/test/lint commands available
- Whether a monorepo, and if so, which package is relevant

### 2. Existing knowledge
Read these if they exist. Do not create them:
- `README.md` — project purpose and setup
- `Context/Glossary.md` — domain language
- `Context/ADR/` — architectural decisions (read only the ones touching your target in specific mode)
- `.cursor/rules/` or similar — project conventions

### 3. Architecture (comprehensive) or target trace (specific)

**Comprehensive:**
- Identify entry points (CLI, HTTP server, worker, cron — what starts this thing?)
- Map major module boundaries: what directories own what responsibility, and how they import each other
- Trace the primary data path: request → handler → service → store (or equivalent)
- Identify cross-cutting concerns (logging, auth, error handling, config)

**Specific:**
- Locate the target's files. Trace its imports — what does it depend on?
- Trace its dependents — who calls it? Use `lsp references` on its exports.
- Read its tests to understand expected behavior and edge cases.
- Walk one complete execution path through the target end-to-end.

---

## Synthesize
Build a mental model in scratch reasoning first — this is what you'll carry for the current session. Then write it to `Context/Research/Research.md` so future sessions can absorb it without re-researching.

### Mode-specific behavior

- **Comprehensive:** write (or overwrite) the full file. You now understand the entire project — capture everything.
- **Specific:** update only the sections your deep-dive touched. Leave the rest intact. If no `Context/Research/Research.md` exists yet, create a minimal version covering what you explored.
- **Also check for topic files:** after updating `Research.md`, scan `Context/Research/` for any topic files (e.g. `Research/Auth-Middleware-Chain.md`) that overlap with your deep-dive target. If you found something that supersedes or refines a topic file, update or flag it. A deep-dive that contradicts a topic file is a finding — surface it as an open question.

### File format

```md
# Research: {Project Name}

> Last updated: YYYY-MM-DD (comprehensive) | YYYY-MM-DD — {target} deep-dive

## What is this?
{One sentence — the project's purpose}

## Architecture
{3-5 sentences — how the system is organized, primary data path, key boundaries}

## Domain Model
{Important entities and how they relate. Use terms from Context/Glossary.md if it exists.}

## Patterns
{Naming conventions, file structure conventions, testing patterns, error-handling style. Things you'd get wrong if you guessed.}

## Relevant ADRs
{Decisions that constrain what you can change. Only list the ones that exist and matter.}

## Open Questions
{Things you don't know that matter. "I did not trace the payment module — it's imported by billing but I haven't read it."}
```

### Rules for the synthesis
- Keep it tight. Every sentence must be something you will reference later in this session.
- Prefer structural facts over narrative. "Auth lives in `src/auth/`, consumed by every route via middleware" not "The project has an authentication system which..."
- If you don't know something that matters, state it as an open question — don't guess.
- State your confidence boundary explicitly: "I did not trace the payment module — it's imported by billing but I haven't read it."

---

## Workflow

**Before this command:** `/init` (to scaffold `Context/` — run once per project). Otherwise none — `/research` is the entry point when entering a codebase cold.

**After this command:**
- If the user has a task to build → `/blueprint` to plan the implementation, then `/grill` to sharpen the plan's terminology and capture ADRs.
- If a question needs to be seen, not discussed → `/prototype` to build a throwaway answer.

State which is appropriate and why.
