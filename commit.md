---
description: Commit the staged work as one or more atomic, conventional-commit messages. Analyzes the actual diff, splits mixed concerns, and writes a message at the ceiling of clarity — the why and the bird's-eye what the diff cannot show. Prose only; structural visuals belong in the PR summary, not the commit. No tool attribution, ever.
---

Commit the current work with a message a senior engineer would be proud to read six months from now. The diff already shows *what* changed line-by-line; your job is the *why* and the bird's-eye *what* — the clarity the diff cannot provide, in prose. Structural visuals belong in the PR summary (`/pr`), not the commit body.

Never attribute the commit to any tool, CLI, or AI. No `Co-Authored-By` trailer. No `Generated with …` line. The author is whoever `git config` says.

---

## 1. Gather the change

Run all of these. Read the actual output — do not glance:

```bash
git status --short
git diff --staged
git diff
git log --oneline -10
```

- `git status --short` — what's staged, what's unstaged, what's untracked.
- `git diff --staged` — the change you are about to commit, exactly.
- `git diff` — unstaged changes; context, and often the first sign the working set is mixed.
- `git log --oneline -10` — the repo's existing commit style. Match its casing, tense, and scope conventions if a clear one exists. Consistency beats your preference.

Check identity before anything else:

```bash
git config user.name
git config user.email
```

If either is unset or reads like a bot, stop and say so before committing. Do not commit under a surprise identity.

If nothing is staged, do not stage blindly. The unstaged and untracked changes are the candidate set — read them first. If they form a single logical concern, stage exactly those files. If they're mixed, go to step 3 before staging anything.

---

## 2. Analyze — understand the change, don't enumerate it

Read every hunk in `git diff --staged` (or the intended set). Build a mental model of the *semantic* change, not the line count:

- What is this change **for**? Which requirement, bug, or intent does it satisfy?
- What is the **single primary intent**? If you can't state it in one sentence, the set is mixed — go to step 3.
- What did the code do **before**, and what does it do **now**? This contrast is the body.
- What is **non-obvious** — a hidden constraint, a migration cost, a thing a reader will misread on first pass? That becomes a body sentence or a footer note.

Do not narrate the diff. "Changed `foo.ts` to add a null check" is noise — the diff says that. "Guard against `user` being null when the session expires mid-request" is signal.

---

## 3. Determine atomicity

A commit does one thing. Audit the change set against one question: **"Can I write a single subject line that describes all of it truthfully?"**

- **Yes** → one commit. Proceed.
- **No — it spans independent concerns** (a feature + an unrelated refactor; a fix + a dependency bump; two features tangled together) → STOP. Do not jam them into one message. Present the split:

  ```
  This change set mixes concerns. Propose splitting into N commits:
  1. <type>(scope): <subject>  — <files>
  2. ...
  ```

  Stage each group separately, commit, repeat. Order respects dependencies — the thing another commit builds on goes first. If two concerns share files at the hunk level and can't be cleanly split, keep them together and say *why*.

Atomicity is the highest-leverage thing you do here. A clean history is read by commit; a tangled history is read by archaeology.

---

## 4. Choose type and scope

Types (Conventional Commits):

- `feat` — adds, adjusts, or removes a user-facing / API / UI capability
- `fix` — patches a bug in a preceding `feat`
- `refactor` — rewrites or restructures without changing behavior
- `perf` — a refactor whose purpose is performance
- `style` — formatting, whitespace, semicolons; no behavior change
- `test` — adds or corrects tests
- `docs` — documentation only
- `build` — build system, dependencies, project version
- `ci` — CI pipeline
- `ops` — infra, deployment, backup / recovery
- `chore` — misc that fits nowhere above (init, `.gitignore`, tooling)
- `revert` — reverts a prior commit

Rules:

- Pick the **one** type that captures the primary intent. `feat` and `fix` and `refactor` in the same set means it's mixed — go back to step 3.
- **Scope** is optional. Use it only when a noun genuinely narrows the area and the repo already scopes commits (`feat(auth):`, `fix(parser):`). Never use an issue number as a scope. One scope per commit.
- **Breaking change** → append `!` after the type/scope (`feat(api)!: …`) and explain in the footer with `BREAKING CHANGE:`. Only call it breaking if callers or consumers must change — internal-only reshuffles are not breaking.

---

## 5. Compose the message

```
<type>(scope)!: <description>

<body>

<footer>
```

### Subject (the description line)

- Imperative, present tense: "add", "prevent", "extract", "drop". Think *this commit will…*.
- Lowercase the first letter after the colon — or match the repo's existing casing if it capitalizes. Pick one; stay consistent across the history.
- No trailing period.
- ≤ 72 characters hard (tooling); aim for ≤ 50 for readability.
- Specific. Not "fix bug" — "prevent empty-cart checkout from charging zero". The subject must be recognizable in `git log --oneline` six months out.

### Body

- One blank line after the subject.
- **Prose only.** No ASCII diagrams, no tables, no visuals — those live in `/pr`. A commit is read from `git log`, folded, and rarely rendered rich; prose is the form git history is made of.
- Answer **why**, then the **bird's-eye what** — the shape of the change the diff won't convey. Contrast with previous behavior.
- Wrap at 72. Paragraphs separated by blank lines.
- Imperative mood throughout.
- Omit the body entirely if the subject already says everything. A body that restates the subject is worse than no body.

### Footer

- One blank line after the body.
- `BREAKING CHANGE: <what changed for consumers and what they must do>` — required if you used `!`.
- Issue refs only if real and known: `Closes #123`, `Refs #456`. Never invent a number.
- No `Co-Authored-By`. No `Generated with …`. No tool signatures. The only trailers are issue refs and breaking-change notes.

---

## 6. Verify, then commit

Before you touch git:

1. Show the **full message** to the user — subject, body, footer. No visual to show; the body is prose.
2. If you split in step 3, show the ordered plan first and confirm; then commit one at a time.
3. State the exact `git commit` you will run.

Then commit. For multi-paragraph bodies, use a here-doc, not a chain of `-m` flags — here-docs preserve blank lines and formatting; `-m` chains mangle them:

```bash
git commit -F- <<'EOF'
<type>(scope): <description>

<body>
EOF
```

Rules:

- Commit only the staged set. Do not `git add` unstaged work as a side effect unless the user asked. Never use `git commit -a`.
- Do not `--amend` a commit that's already been pushed, unless explicitly asked.
- If the commit fails (pre-commit hook, signing), report the failure verbatim and stop. Do not work around hooks with `--no-verify` unless the user says to.

---

## Anti-patterns

- **Narrating the diff.** "Updated `foo.ts`. Changed `bar()`." The diff says that. Say *why*.
- **One mega-commit for mixed work.** "feat: add auth, fix cart bug, bump deps" is three commits pretending to be one. Split (step 3).
- **Vague subject.** "fix: misc fixes", "chore: stuff", "feat: improvements". None survive six months.
- **Decorative body.** Restating the subject, listing changed files, pasting the diff. The body earns its place by adding the diff's missing context.
- **Visuals in the body.** ASCII diagrams, before/after maps, tables. Those belong in `/pr`, not the commit. If the change is structural enough to need a picture, it's structural enough to summarize for review.
- **Fake confidence.** Claiming `BREAKING CHANGE` for internal-only reshuffles, or quoting an issue number you weren't given.
- **Tool attribution.** Any `Co-Authored-By` or `Generated with` line. None. Ever.
- **Committing under a surprise identity.** A bot-shaped `user.name` / `user.email`. Stop and say so first.

---

## Workflow

**Before this command:** none. `/commit` can be invoked at any point in any session — mid-implementation, after a prototype, mid-grill when a decision crystallized into code, or standalone. If `/blueprint` produced the plan you were implementing, its goal is your context — don't restate it in the commit.

_If nothing is staged or modified, say so and stop. Don't manufacture a commit from noise._

**After this command:**
- If more work remains in the sequence → repeat `/commit` for the next atomic set.
- If you're ready to open for review → `/pr` to synthesize the commit series into a polished, reviewer-facing summary with the visuals.
- If a handoff is pending mid-task → `/handoff` to checkpoint before moving on.
- If the commit closed or advanced an architectural decision → `/grill` to capture it as an ADR or glossary entry.