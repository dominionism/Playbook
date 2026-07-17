---
description: Resume from the most recent handoff in Memories/ — absorb durable context (Research, Glossary, ADRs, Plan), read the latest handoff for unpromoted signal, verify state, then pick up at the exact next action. Pass --deep to read every handoff and reconstruct the full storyline.
---
You have inherited a task. Agents before you produced durable context in `Context/` — Research, Glossary, ADRs, a Plan — and handoff files in `Memories/`. The durable context is the reconciled, authoritative state. The most recent handoff is the *delta*: what happened since the last durable-context update, what failed, and the exact next action.

Your job: absorb the durable context, read the most recent handoff, verify nothing has drifted, then pick up at the **exact** next action. Do not replay the session history — the plan file and glossary already absorbed everything that mattered.

If invoked with `--deep` (or `--full`): read every handoff in the session group, stitch them chronologically, and follow the full reconstruction protocol. Default is the tight path — one handoff, fast absorption.

---

## Step 0 — Locate the most recent handoff and durable context
**Resolve the project root:**
```bash
git rev-parse --show-toplevel
```


**Identify the most recent handoff.** Sort by filename timestamp, pick the last one:
```bash
ls <project-root>/Memories/handoff-*.md 2>/dev/null | sort | tail -1
```

**Edge cases:**
- **No `Memories/` folder or empty:** "No handoffs found in `Memories/`. I have no prior context — how would you like to proceed?" Stop.
- **Most recent handoff has `context_depth: deep`:** also read the handoff immediately before it. If only one handoff exists and it's `deep`, flag the gap prominently — constraints and early decisions may need user confirmation.
- **`--deep` flag was passed:** revert to the full multi-handoff timeline protocol. List *all* handoffs, sort chronologically, group by session, and follow the full reconstruction steps. Otherwise, read only the most recent (and one prior if deep).

**Locate the plan, if any:**
```bash
ls <project-root>/Context/Plans/*.md 2>/dev/null
```
If a plan file exists, read it **before** the handoff. The plan is the single source of truth — it was kept current by `/grill`. The handoff's task and constraints may be stale if the plan was updated later.

**Locate accumulated codebase knowledge, if any:**
```bash
ls <project-root>/Context/Research/*.md 2>/dev/null

If files exist in `Context/Research/`, read them all **before** the handoff. Start with `Research/Research.md` — the comprehensive overview. Then read any topic files (e.g. `Research/Auth-Middleware-Chain.md`) — these are subsystem deep-dives added by `/research` or `/promote`. Together they are the stable, high-signal accumulated codebase knowledge. Trust them; they were written at high context fidelity.

**Locate sharpened domain language and settled decisions, if any:**
```bash
ls <project-root>/Context/Glossary.md <project-root>/Context/ADR/*.md 2>/dev/null
```
If `Context/Glossary.md` exists, absorb it — canonical terms `/grill` sharpened, with synonyms to avoid. If `Context/ADR/` contains ADRs, read every one — settled architectural decisions that constrain every next action and must not be re-litigated.
---

## Step 1 — Absorb durable context, then the handoff

### 1A — Absorb durable context first

Read in this order: every `Research/*.md` → `Glossary.md` → every `ADR/*.md` → `Plans/<Feature>.md`. This is the lens. The handoff is read *through* this lens.

### 1B — Read the most recent handoff

Extract only what the durable context doesn't already contain:
- **Next action** — the literal next step. This is your starting point.
- **Dead ends & false leads** — things tried and failed. Do not repeat these.
- **Open questions** — unresolved decisions awaiting the user.
- **Files changed** — files touched since the last durable-context update. Cross-reference against the plan's work items.
- **Recent surprises** — anything the plan didn't anticipate.

Do not re-extract task, constraints, or north star from the handoff if the plan file already states them. The plan is more current — `/grill` updated it after the handoff was written. If they conflict, trust the plan.

### 1C — If `--deep` was passed

Ignore 1A–1B. Instead: read every handoff in the session group oldest to newest, build a timeline, deduplicate, detect gaps per the full reconstruction protocol. The `--deep` path exists for long-running branches with many handoffs where the arc matters. It is not the default.
## Step 2 — Reconstruct current position

Write a tight reconstruction in scratch reasoning:

1. **Codebase knowledge** — architecture, patterns, domain model (from durable context)
2. **Plan position** — which work items are done, in progress, not started (from plan file + handoff's files changed)
3. **Task, constraints, north star** (from plan file; fall back to handoff only if no plan exists)
4. **Dead ends** (from handoff — things not to retry)
5. **Open questions** (from handoff — things still awaiting user)
6. **Next action** (from handoff)

Do not build a timeline. Do not deduplicate across handoffs. Do not flag conflicts between handoffs. The durable context is the reconciled state.

## Step 3 — Verify state has not drifted

The handoff is a snapshot. Files change, branches advance.

### 3A — Run the metadata comparison

```bash
git rev-parse HEAD
git branch --show-current
git status --short
```

Compare against the handoff's `branch` and `commit`. Report differences.

### 3B — Verify key claims

For files listed as "changed" in the most recent handoff, read their **current state**. Does it match what the handoff describes? If the handoff says "added function X to `foo.ts`" but `foo.ts` doesn't have it now, flag it.

### 3C — Drift handling

- **State matches** → proceed to Step 4.
- **State has drifted** → tell the user exactly what changed. Confirm whether to proceed, adjust, or pause.
---
## Step 4 — Absorption check

Without scrolling back, answer:

1. What is the task?
2. What work items are done / in progress / not started?
3. What is the literal next action?
4. What dead ends must not be repeated?
5. What is the top risk right now?

## Step 5 — Orient the user

Produce this orientation block. It is **non-negotiable** — do not act before the user sees it:

```
Plan: <Context/Plans/<name>.md | none found>
Research: <Context/Research/ exists — N files | not found — /research recommended>
Progress: <what's done / in progress / not started>
Next action: <concrete, from handoff>
Top risk: <one line>

State checks: <pass | flagged: …>
Gaps: <things the handoff or plan didn't cover that may matter>

Reply "go" to proceed.
```

If the handoff was `context_depth: deep` with no prior handoff, surface the gap prominently: "This is the only handoff and it was written under context pressure — early constraints or decisions may be missing. Confirm before I act."

## Step 6 — Begin work

Pick up at the **exact** next action from the handoff. Not the start of the plan — the current position.

Before acting, determine which command the next action calls for:
- Understanding the codebase → `/research` (skip if `Context/Research/` exists and was updated within the last commit — i.e., no new commits touched the codebase since `/research` last ran. If in doubt, check `git log --oneline -5` against `Research/Research.md`'s "Last updated" date.)
- Planning an implementation → `/blueprint`
- Sharpening domain language or capturing decisions → `/grill`
- Answering a high-fidelity question → `/prototype`
- Writing code → start implementing directly
- Promoting implementation learnings to durable context → `/promote`
- Committing staged work → `/commit`
- Opening or updating a pull request → `/pr`

State which command fits and invoke it.

### Ground rules

- **Trust the plan over the handoff.** If they conflict on task, constraints, or scope, the plan is more current.
- **Never re-research what the durable context covers.** `Context/Research/` and the plan IS the research.
- **Empowerment clause:** the handoff is the path the prior agent saw — not the only path. If you see a meaningfully better path that respects the task, constraints, and north star, propose it.
- **Contradiction protocol:** if you discover something that contradicts the handoff, flag it: "Handoff says X, but the plan says Y at `Context/Plans/<name>.md:line`." Pause for guidance.
- **Context decay:** for long execution after recall, periodically re-read the plan file's work items. Don't rely on first absorption past several turns.

---

## Failure modes

- **Trusting a stale handoff over the plan.** The handoff was written before `/grill` updated the plan. The plan is more current — prefer it.
- **Missing that the only handoff is `context_depth: deep`.** When it's the sole handoff and degraded, early constraints may be lost. Flag it.
- **Skipping the user beat.** Step 5 is mandatory. The handoff cannot capture knowledge the user holds but never expressed.
- **Stale verification.** State checked at Step 3 can drift during execution. Re-verify before irreversible actions.
- **Running the full timeline by default.** The `--deep` flag exists for a reason. Default is the tight path.

Resume with `/recall`.
