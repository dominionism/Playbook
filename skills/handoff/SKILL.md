---
name: handoff
description: Capture a lightweight session handoff in the project's Memories directory. Use when the user explicitly asks to preserve current context for a fresh agent; record recalled signal without analysis and identify the exact next action.
compatibility: Requires git and write access to the project root.
---

You are about to be replaced. A fresh agent will arrive cold and read everything in `Memories/` to reconstruct the session.

**The only thing you need to do:** write down what you can recall *right now* into the structure below. Do not filter. Do not judge relevance. Do not assess your own confidence or context health. The recall agent handles all of that — your job is just to dump signal into the file.


If arguments were passed with `/handoff` (e.g., `/handoff prototype the window communication layer`), treat them as a description of what the next session will focus on. Tailor the handoff — include what's relevant to that task, skip what isn't.

---

## Step 1 — Gather metadata (run commands)

```bash
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short
ls Context/Plans/*.md 2>/dev/null
```

---

## Step 2 — Assess your recall boundary

Ask yourself one question: **can I clearly recall the beginning of this session — the original task, the first decisions, the early user constraints?**

- **Yes, I can recall early turns with specificity** → set `context_depth: shallow` in the frontmatter. Your memory is intact.
- **No, early turns are fuzzy or lost** → set `context_depth: deep`. This tells the recall agent you're capturing from a degraded window — it will flag potential gaps to the user.

**If `context_depth: deep`:**
- Focus on what you *can* recall — recent events, current state, next action — without guessing at the fuzzy parts.
- Add an `# Early-session gaps` section listing what you know is missing (task origin? early decisions? user constraints?). Be explicit: "I cannot recall whether the user approved approach X or Y in the early session."
- Do NOT fabricate early details to fill the gaps. It is better to leave a gap the recall agent can surface than to record a wrong claim as fact.

**Why this matters:** If this is your sole handoff and `context_depth: deep`, the recall agent will know to ask the user to fill the gaps. If earlier handoffs exist, those gaps are already covered. The system degrades gracefully either way.

---

## Step 3 — Write the handoff

Write the file to `<project-root>/Memories/handoff-<YYYY-MM-DD-HHMM>.md`.

If `Memories/` doesn't exist, create it. If the filename collides, append `-2`.

Use this structure:

```markdown
---
date: <ISO timestamp>
branch: <branch name>
commit: <commit sha>
context_depth: <shallow | deep>
plan: <Context/Plans/<Feature-Name>.md this session worked against — omit if none>
---

# Task
<one line — what are we working on?>

# Constraints & preferences
- <every constraint the user stated — verbatim if possible>
- <north star — what they optimize for: speed, correctness, minimality…>
- <vetoes this session + reason>

# Early-session gaps
<Only if context_depth: deep. List what you know is missing.>

# Recent events
<what happened recently, in chronological order. One line each. Include:
- Decisions made + rationale
- Discoveries + what was learned
- Surprises or contradictions
- Errors encountered + fix
- User approvals, vetoes, pivots>

# Decisions not yet in the plan
- <a decision made this session that the plan file does not reflect yet — one line, naming the work item it affects>

# Open questions
- <pending decisions awaiting the user>
- <things we know we don't know>

# Files changed
- `path/to/file.ts` — <what changed and why, in one line>

# Dead ends & false leads
- Tried <X>, failed because <Y> — don't repeat

# Next action
<concrete next step>

# Suggested skills
- <skills the next agent should invoke (e.g., "grill", "prototype", "prd")>
- <reason: why this skill fits the next action>

# Pointers
- <other artifacts the next agent should open: ADRs, issues, research notes>
```

**Rules:**
- Every section is optional except Task and Next action. If you can't recall anything for a section, omit it — never write "N/A."
- `Decisions not yet in the plan` is recall, not analysis: list what was decided and not yet written into the plan, nothing more. If the plan already reflects every decision, omit the section. `/recall` surfaces it; `/promote` writes it.
- Do not analyze, evaluate, or tag your claims. Just write them down.
- Do not redact or summarize further than one line per item. Err on the side of including.
- No code blocks unless essential. Prefer `path:line` references.
- No confidence tags, no provenance tags, no quality gate. The recall agent handles those.
- Do not duplicate content already captured in other artifacts (PRDs, ADRs, issues, existing handoffs). Reference them by path or URL instead.
- Redact any sensitive information: API keys, passwords, or PII.

Resume with `/recall`.

## Workflow

`/handoff` can be invoked at any point in any session. Use it to:
- Checkpoint progress mid-grill or mid-blueprint
- Pass a high-fidelity question to `/prototype`
- Pass prototype learnings back to a planning session
- Preserve context before starting implementation in a fresh window

The next agent resumes with `/recall`.

