---
description: Promote implementation learnings into durable context — update the plan, glossary, ADRs, and research notes with what was actually built vs. what was planned. Run after a meaningful chunk of work is done, before /handoff or /commit.
---

You have just completed a chunk of work. The plan said what you would build; the handoffs captured what happened along the way. Now promote the learnings from ephemeral (handoffs) to durable (Context/) so future sessions don't pay the same discovery cost twice.

This is **not** another grilling session. You are not interviewing the user. You are proposing deltas based on what actually happened, and the user confirms or rejects. Fast, light, one pass.

---

## Step 1 — Gather current state

Read everything that exists:

```bash
ls <project-root>/Context/Plans/*.md 2>/dev/null
ls <project-root>/Context/Glossary.md 2>/dev/null
ls <project-root>/Context/ADR/*.md 2>/dev/null
ls <project-root>/Context/Research/*.md 2>/dev/null
ls <project-root>/Memories/handoff-*.md 2>/dev/null | sort | tail -2
```

- Read the plan file (if multiple, pick the active one — the one matching your current branch or task).
- **No plan file exists:** "No plan found in `Context/Plans/`. I can still promote glossary terms, ADRs, and research notes from the handoff — but I can't audit plan progress. Continue with the other categories?" If the user says no, stop. If yes, skip §2A (plan progress) and proceed.
- Read `Glossary.md`.
- Read every ADR.
- Read `Research/Research.md` and any topic files.
- Read the most recent handoff (if `context_depth: deep`, also read the one before it).
- **No handoffs found:** "No handoffs in `Memories/`. I can still audit the plan, glossary, and ADRs against the current git diff, but I can't reference prior-session decisions or dead ends. Proceed with what's available?" If the user says no, stop. If yes, skip handoff-dependent deltas (dead ends, open questions).

Also run:

```bash
git status --short
git diff --stat HEAD
```

to understand the working state — especially if some changes aren't yet committed or handoff'd.

---

## Step 2 — Identify deltas

Audit what changed since the plan was last updated. The handoff tells you what the prior session did; your own observations this session fill in what the handoff couldn't capture.

### 2A — Plan progress

For each work item in the plan:

- **Done this session** → propose marking it complete. If the implementation deviated from the plan's "What" field, note the deviation under the work item.
- **Was already done** (handoff says so, plan doesn't) → propose marking it complete retroactively.
- **In progress** → leave as-is. Note current status if useful.
- **Not started** → leave as-is unless it was intentionally dropped. If dropped, propose removing it with a one-line reason.
- **New item emerged** (something you built that wasn't in the plan but was necessary) → propose adding it with What/Why/Risk, marked complete.

### 2B — Domain terms

Scan the implementation (diffs, handoffs, your own observations) for:

- Terms the code uses that aren't in `Glossary.md`
- Terms in `Glossary.md` that were used imprecisely or evolved in meaning
- Synonyms or overloaded terms that should be retired via the `_Avoid_:` line

Propose additions or corrections only when the term is **project-specific** and meaningfully distinct from general programming vocabulary. "Connection pool" is not a glossary term. "Session Vault" might be.

### 2C — Architectural decisions

For any decision made during implementation. Apply the ADR bar — all three must be true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **Result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If all three hold, propose a new ADR at `Context/ADR/<next-number>-<Slug>.md`. Use PascalCase for the slug. One paragraph is sufficient:

```md
# {Short title of the decision}

{1-3 sentences: context, what was decided, and why.}
```

If fewer than three, skip. Most implementation decisions are not ADRs.

### 2D — Research notes

For discoveries about the codebase that don't fit in Glossary or ADRs:

- A module boundary or subsystem interaction you didn't trace in the original research
- A pattern that emerged during implementation that future work should follow
- An edge case or constraint that future work must respect
- A subsystem whose behavior is non-obvious from reading its code

**Refinement of the comprehensive overview** → propose updating the relevant section(s) of `Context/Research/Research.md`. Keep it tight — add only what the original research missed.

**Focused deep-dive on a subsystem** → propose creating `Context/Research/<Topic>.md`. Use PascalCase for the filename. Structure it the same way as `Research.md` but scoped to that subsystem:

```md
# Research: {Subsystem}

> Last updated: YYYY-MM-DD — implementation deep-dive

## What is this?
{One sentence — what this subsystem does}

## Architecture
{How it's organized internally, key boundaries}

## Patterns
{Conventions specific to this subsystem}

## Edge cases & constraints
{Things that will bite a future developer}
```

Only create a topic file if it captures something you'd genuinely want a future agent to know before touching that subsystem. If it's obvious from reading the code, skip it.

---

## Step 3 — Propose deltas to the user

Present proposed changes one category at a time, in this order:

1. **Plan updates** (most actionable for the next session)
2. **Glossary additions**
3. **ADRs**
4. **Research notes**

For each proposal, show:
- Which file changes
- The exact content being added or modified
- A one-sentence rationale

Then ask: "Apply? (y/n/edit)"

Batch within a category when multiple changes are uncontroversial: "Three plan updates: mark items 1-2 done, drop item 4. Apply?"

Do not propose cosmetic changes (formatting, wording polish). Only substance.

### Nothing to promote

If nothing meaningfully changed — the plan was followed exactly, no new terms emerged, no decisions crossed the ADR bar, no research gaps were filled — say so explicitly:

> Nothing to promote. The plan was executed as designed.

This is a valid and good outcome. It means your planning was accurate.

---

## Step 4 — Write confirmed changes

Apply only the deltas the user confirmed. After writing:

1. Report what was updated and where: "Updated `Plans/Auth-Migration.md` (marked items 1-3 done), added `Glossary.md` entry for **Session Vault**, no ADRs or research notes needed."
2. If research topic files were created, cross-link them from `Research/Research.md` in the relevant section (e.g., under "Architecture": "See [Auth Middleware Chain](Auth-Middleware-Chain.md) for a detailed trace.").

---

## Rules

- **Do not fabricate.** If the implementation didn't yield a new term, don't invent one. An empty glossary round is a good round — it means the plan's language was precise.
- **ADR bar is high.** Default to "no ADR needed." Only propose one when the decision is genuinely hard to reverse, surprising, and the result of a real trade-off.
- **Research notes are earned.** A topic file must capture something non-obvious. "Module X uses pattern Y" is not a research note if you can see it from the file tree.
- **Plan updates are the priority.** Everything else is nice-to-have. A stale plan is actively harmful — it misdirects the next `/recall` agent.
- **Do not overwrite user-authored content.** If the plan or glossary has sections the user wrote personally, propose changes but flag them as user-authored for extra caution.

---

## Workflow

**Before this command:** implementation work is done or at a natural checkpoint. `/grill` may have already updated the plan and glossary — if so, there will be less to promote. The most recent handoff captures the prior session's events.

**After this command:**
- All durable context is current → `/handoff` to checkpoint, or `/commit` / `/pr` to ship.
- If more implementation remains → continue working, then `/promote` again at the next checkpoint.

`/promote` is the close of the implementation loop. Without it, your Context/ folder is a pre-implementation snapshot that slowly rots. With it, Context/ is a living reflection of the project.
