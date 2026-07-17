---
description: Create an optimal implementation plan. Decompose the target into ordered work items, research genuine uncertainties via sub-agents with hard termination, and produce a plan at the ceiling of what's knowable before writing code.
---

Produce the best implementation plan attainable before writing a single line of code. The plan must be concrete enough that an agent could execute it without asking follow-up questions. Where you lack knowledge, research — but only exactly enough to resolve the gap.

---

## 1. Establish the target

If the user hasn't already stated what they want to build, ask: **"What are we building?"**

Listen for:
- The feature or change, in their words
- Constraints (must / must not)
- What "done" means — the acceptance criteria
- North star — what are they optimizing for?

One question at a time. Stop asking when you have enough to plan.

---

## 2. Ground in what you already know

You ran `/research` (or equivalent exploration). Reference it explicitly:

- Architecture: what modules exist, what boundaries constrain the change
- Domain model: entities, relationships, glossary terms — use the project's language, not yours
- Patterns: how this codebase names things, structures files, handles errors, writes tests
- ADRs: decisions you must not contradict

If `/research` wasn't run, say so and do a fast structural scan before planning. Don't plan blind.

Before planning, read the durable context directly — don't rely on it already being in your window:
```bash
ls <project-root>/Context/Research/*.md <project-root>/Context/Glossary.md <project-root>/Context/ADR/*.md 2>/dev/null
```
Read all `Context/Research/*.md` files (start with `Research.md` — the comprehensive overview — then any topic files), `Context/Glossary.md` (canonical terms — use them in the plan's language), and every `Context/ADR/*.md` (constraints you must not contradict). If any is missing, note it as a gap; don't plan against assumptions.

---

## 3. Decompose

Break the target into ordered work items. For each:

- **What** — the change, specific enough to act on. Not "add auth" — "create `src/auth/middleware.ts` with JWT verification, apply to `/api/*` routes."
- **Why** — which requirement or constraint this satisfies
- **Depends on** — what must exist first
- **Risk** — what could go wrong, and how you'd know

Order items so each one builds on the last. If the order doesn't matter, say so.

---

## 4. Identify genuine uncertainties

After decomposing, audit each work item against one question: **"Can I specify exactly how to build this right now?"**

- **Yes** → specify it. You have the knowledge.
- **No, but the codebase can tell me** → read the relevant files. One round of exploration, then specify.
- **No, and I need external knowledge** → mark it for research.

Only mark an item for research if the uncertainty would materially change the plan. "Which exact library version?" when any recent version works is not a research-worthy uncertainty. "Which library even solves this problem?" is.

---

## 5. Research (only for genuine uncertainties)

For every item marked for research, spawn one sub-agent per question. Each sub-agent gets:

- **The exact question**, phrased as a constraint. Not "tell me about websocket libraries" — "Find a websocket library that: handles reconnection automatically, works with Express middleware, is under 10KB gzipped."
- **A hard termination condition**: the moment the answer is found, stop. Do not read further. Do not explore alternatives "just in case." Do not read changelogs, comparison tables, or community discussions beyond what's needed to confirm the answer fits the constraint.
- **A deliverable**: not raw search results. Not a list of options with pros and cons. A single creative solution — the library, pattern, or approach — with a one-sentence justification.

### Research anti-patterns
- Reading comparison blog posts when the first library found already satisfies all constraints
- Following "see also" links after the answer is found
- Collecting alternatives "to give the user options" — that's what `/grill` is for
- Researching things you could infer from the codebase or your training data

### Research failure
If 3 targeted searches don't yield a clear answer, the sub-agent reports: **"Could not determine."** The planner works around it — flags the gap in the plan and proposes a fallback or spike.

---

## 6. Produce the plan

Synthesize everything into a written plan. Save it to `Context/Plans/<Feature-Name>.md` using PascalCase for the filename. Create `Context/Plans/` if it doesn't exist.

Structure:

```
## Goal
<one sentence>

## Constraints
- <every constraint, verbatim from user or codebase>

## Work items
1. **<title>**
   - What: <specific change>
   - Why: <requirement it satisfies>
   - Depends on: <prerequisite item or "none">
   - Risk: <what breaks + how you'll know>
   - [Researched] <what was learned and the creative solution>

2. ...
```

After each work item, note whether it was: specified from knowledge, inferred from codebase exploration, or researched (cite the finding).

**This file is the single source of truth for the plan.** Other commands will read and update it. Keep it current.
---

## 7. Validate

Before presenting, check:
- Does this plan contradict any ADR?
- Does it violate any pattern the codebase consistently follows?
- Are there gaps — work items where "how" is still fuzzy?
- Does the order hold — can item N actually be done before item N+1?

Flag anything that fails. Don't paper over it.

---

## Workflow

**Before this command:** `/research` — blueprint builds on codebase understanding.

**After this command:**
- If domain terms need sharpening or architectural decisions need ADRs → `/grill`
- If the plan has high-fidelity unknowns (feel, flow, interaction) → `/prototype` for the uncertain items
- If the plan is complete and unambiguous → "Ready to implement. Start with item 1?"

`/blueprint` precedes `/grill`: produce the plan, then grill sharpens it. If `/grill` materially changes scope, terminology, or risk surface, re-run `/blueprint` so the plan file reflects the sharpened design.
When re-running `/blueprint` after `/grill`: do not regenerate the plan from scratch. Read the existing plan file first. Preserve any sections `/grill` added — "Out of Scope," glossary-aligned work item language, and ADR cross-references — and update only what the grilling changed.
If multiple plans exist in `Context/Plans/`, pick the active one — matching the current branch, task, or work item. State which plan you're operating on before proceeding.

