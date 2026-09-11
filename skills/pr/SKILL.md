---
name: pr
description: Open or update a GitHub pull request with a polished reviewer-facing summary. Use when the user explicitly asks to create or refresh a PR; synthesize the commit series, include Story/Delta visuals when warranted, honor the repository template, and push through gh.
compatibility: Requires git and an authenticated GitHub CLI (gh) with access to the target repository.
---

Produce the pull request summary a senior engineer would be proud to hand a reviewer: one document that makes the whole commit series legible at a glance, carries the visual supplement on every PR above the trivial floor—the Story of how the changed system works and the Delta of what moved, produced by the installed `visuals` skill—and tells the reviewer exactly how to verify and what to worry about. Then open or update the PR.

A PR summary is a *synthesis*, not a restatement. The commit history already says what each atomic unit did; the reviewer reads the PR to see the whole arc, why it matters, and where the risk is. If your body is just the commit subjects with blank lines between them, you haven't written a PR summary — you've reformatted `git log`.

Never attribute the PR to any tool, CLI, or AI. No `Generated with …` line, no `Co-Authored-By`, no footer crediting an agent. The author is whoever `git config` says.

---

## 1. Gather the commit series

Run all of these. Read the output — do not glance:

```bash
git branch --show-current
git rev-parse HEAD
git status --short
git remote -v
```

Resolve the **base branch** — the branch this PR will merge into. In priority order:

1. If the user told you the target, use it.
2. The repo's default / development branch. Detect via:
   ```bash
   gh repo view --json defaultBranchRef --jq .defaultBranchRef.name 2>/dev/null
   git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@'
   ```
   Many repos gate `main` and keep a `dev` / `develop` integration branch as the PR target. If a `dev`-style branch exists at `origin/dev` or `origin/develop` and `main` is protected, prefer it and say so.
3. If undeterminable, **stop and ask**. Never guess the base — a wrong base produces a useless diff range.

Then capture the full series this PR will contain:

```bash
git log --oneline <base>..HEAD
git log <base>..HEAD --format='%h%n%n%B' --reverse
git diff --stat <base>..HEAD
git diff <base>..HEAD
```

- `git log --oneline <base>..HEAD` — the commit list, in order. This is the spine of the summary.
- `git log <base>..HEAD --format='%h%n%n%B' --reverse` — full subjects and bodies, oldest first. Read every one; the `why` already lives in these.
- `git diff --stat <base>..HEAD` — the scope. File count, line churn. Tells you whether this is a focused PR or a sprawl that should maybe be split into multiple PRs.
- `git diff <base>..HEAD` — the actual change. Read hunks for the structural picture the commits don't spell out.

If `HEAD` is already pushed, also check for an existing open PR to update rather than duplicate:

```bash
gh pr list --head <current-branch> --state open --json number,title,url --jq '.[0]'
```

---

## 2. Decide whether this is one PR or several

Audit the series against one question: **"Can I write a single PR title that describes all of these commits truthfully?"**

- **Yes** → one PR. Proceed.
- **No — the series spans independent concerns** (two features, a feature + an unrelated refactor, work on different subsystems) → STOP. Tell the user this should be N PRs, list which commits belong to which, and let them split the branch (`git rebase -i`, cherry-pick into new branches). A PR that asks a reviewer to approve three unrelated things at once is a PR that gets held up or rubber-stamped — both bad.

This mirrors `/commit`'s atomicity rule one level up. Atomic commits, atomic PRs.

---

## 3. Synthesize the change

Build a mental model of the whole series — not commit by commit, but as one change:

- **What is this PR for?** The requirement, bug, or intent the whole series satisfies. This is the summary's first sentence.
- **What's the arc?** The story across the commits: setup → core → cleanup, or extraction → new behavior → tests. The reviewer wants the narrative, not the playlist.
- **What's non-obvious from a diff skim?** A hidden constraint, a migration cost, a fallback path, a thing a reviewer will misread on first pass. Surface these — they're the difference between a review that goes deep and one that rubber-stamps.
- **What did the codebase do before, and what does it do after?** This contrast is the heart of the body.
- **What's the risk surface?** The one or two places a reviewer should look hardest. Not a generic "please review carefully" — a specific file, branch, or invariant.

Do not narrate the commit list. "This PR contains 5 commits that …" is noise — the sidebar shows the commits. Synthesize.

---

## 4. Compose the body

The reviewer-facing document. Markdown, richly structured — this is rendered, not folded into `git log`, so structure earns its keep here in a way it never does in a commit.

### Title (the PR subject)

- Conventional Commits, same form as a commit subject: `<type>(scope): <description>`.
- Imperative, present tense, lowercase after the colon (or match the repo's convention), no trailing period.
- ≤ 72 hard.
- It describes the **whole PR**, not the last commit. If the series is "extract repository layer / switch store to postgres / add migration", the title is `feat(persistence): move storage to postgres via a repository layer`, not `feat(db): add migration`.

### Body — the synthesized sections

Use this structure. Omit any section that has no content; never write "N/A".

```markdown
## Summary
<one to three sentences: what this PR does and why. The reviewer's first read.>

## How it works
<the Story from /visuals authoring mode: the changed flow end to end, drawn as the system works with this PR applied, changed nodes marked ✱, followed by its numbered plain-language walkthrough. Omitted only when the visuals floor says skip.>

## What changed
<the arc, in prose. Group the commits into 1–4 paragraphs by concern, not one per commit. Name files and symbols only where they anchor the reader. Close with the Delta from /visuals — the compact before/after of the neighborhood that moved.>

## Why
<the motivation — the requirement, bug report, or decision this satisfies. If it's non-obvious, say why this approach over the alternative. If `/blueprint` or `/grill` captured the rationale, cite it briefly rather than restating.>

## How to verify
<numbered steps a reviewer can execute: the command to run, the scenario to exercise, the test to watch. Specific, not "run the tests".>

## Risk & breaking changes
<the one or two places to look hardest. Any BREAKING CHANGE: consumer impact + migration path. If none, say "No breaking changes" and name the highest residual risk anyway.>

<!-- the Story and the Delta have fixed places above; any further diagram must earn its own — see Visuals below -->
```

### Visuals — the supplement every PR carries

Structural visuals live here—`commit` defers them, `pr` ships them. Activate the installed `visuals` skill and follow it in **authoring mode** on every PR. It produces two pieces and fixes where they land:

- **The Story** → fills `## How it works`: the changed flow end to end, drawn as the system works with this PR applied, changed nodes marked `✱`, followed by a numbered plain-language walkthrough a newcomer can follow without opening a file.
- **The Delta** → closes `## What changed`: a compact before/after of just the neighborhood that moved, with a one-or-two-sentence caption.

Scaling is the engine's job — small diff, small visuals. The only skip is the floor in visuals.md §2: a diff with zero architectural surface (docs-only, formatting, lockfile churn). State the skip reason in conversation and omit the sections from the body; never write a placeholder.

Rendering rules—diagram types, the 30-node/50-edge caps, `accTitle`/`accDescr` accessibility, and syntax conventions—come from the installed `diagram` skill. At most 3 diagrams per PR. GitHub renders ` ```mermaid ` fenced blocks natively, so inline rendering needs no CLI tool.

**Preview before pushing.** If `mmdc` is available, consider rendering locally first to verify the diagrams render and nothing is clipped.

For a structure too large or interesting for the Story's lens, generate a dedicated `/diagram` deep-dive and link it from the PR instead of inlining wallpaper.

### Issue references & footers

- `Closes #123`, `Resolves #456`, `Fixes #7` — only real, known issues, one per line. GitHub auto-closes on merge; never invent a number.
- `BREAKING CHANGE:` block in the **Risk** section if any commit in the series is breaking — consumer impact + what they must do.
- No `Co-Authored-By`. No `Generated with …`. No tool signatures.

### Respect the repo's PR template

If `.github/PULL_REQUEST_TEMPLATE.md` (or `docs/`, or `.github/PULL_REQUEST_TEMPLATE/`) exists, the repo has a contract for what reviewers expect. **Do not ignore it.** Map your synthesized content into its sections:

- Read the template. Note its section headings and any HTML-comment prompts.
- Fill **its** sections with **your** synthesis — "Summary", "Type" checklist, "Breaking Changes", "Tests", "Documentation", "Issue References", "Release Note", whatever it asks for.
- If a template section asks for something you have no content for, leave the placeholder or omit per the template's own guidance — don't fabricate.
- If the template's order differs from the structure above, **follow the template's order**. Consistency with the repo's review contract beats your preferred layout.

The synthesized body and the template are the same artifact — the template just shapes it.

---

## 5. Verify, then open or update

Before any network action:

1. Determine whether a PR already exists for this branch (from step 1's `gh pr list`). Decide:
   - **No existing PR** → `gh pr create`.
   - **Existing open PR** with stale body → `gh pr edit <number> --body …`.
2. Resolve the base branch and the title.
3. Show the user the **full body** — title, every section, any visuals, footers. If a PR template applied, show how content mapped into its sections.
4. Confirm before pushing — opening or rewriting a PR is a network action with an audience (reviewers, CI). Say exactly what you will run.

Then act. Open with a here-doc, not a sprawling flag chain — here-docs preserve formatting:

```bash
gh pr create --base <base> --head <head> --title "<title>" --body-file - <<'EOF'
<full markdown body>
EOF
```

For an update:

```bash
gh pr edit <number> --body-file - <<'EOF'
<full markdown body>
EOF
```

If the branch isn't pushed yet:

```bash
git push -u origin <head>
```

then open the PR. Never force-push to a shared branch without saying so.

Rules:

- Do not open a draft PR unless the user asked. Drafts change review expectations.
- Do not request reviewers or add labels unless the user asked. The PR is the artifact; promotion is a separate human decision.
- If `gh` fails (auth, rate limit, repo ruleset blocks the branch), report the failure verbatim and stop. Do not retry blindly or downgrade to the web.
- If the repo's ruleset blocks direct pushes to `main`/`dev` and requires a PR, you're already in the right flow — that's what this command is for.

---

## Anti-patterns

- **Restating the commit log.** Listing each commit's subject as a bullet. The sidebar already shows commits; the body must synthesize the arc.
- **Decoration as diagram.** Visuals for a diff below the /visuals floor (docs-only, formatting), or a diagram that misrepresents the code. A misleading picture is worse than none.
- **Skipping the supplement.** Shipping a PR above the floor without the Story and the Delta. Clarity is the contract; the floor is the only exemption.
- **Diagram without alt-text.** Mermaid block missing `accTitle`/`accDescr` — the diagram is invisible to screen readers and confusing on mobile.
- **Oversized diagram that silently fails.** A diagram exceeding GitHub's ~50KB or ~500-edge limit renders as raw code. Always enforce the 30-node/50-edge cap.
- **Fake confidence.** Inventing an issue number to look thorough, or claiming BREAKING CHANGE for internal-only reshuffles.
- **Tool attribution.** Any `Generated with` / `Co-Authored-By` / agent credit. None. Ever.
- **Guessing the base branch.** A wrong base produces a wrong diff range and a useless PR. Detect or ask.
- **Acting without confirming.** Opening a PR is a network action with an audience. Show the body first.

---

## Workflow

**Before this command:** the work is committed (`/commit`) and pushed to a branch. `/pr` synthesizes the commit series into a review-ready document, so atomic commits make a better PR — the synthesis is only as clean as the underlying history. If the series is mixed, go back and split before opening.

`/pr` can be invoked at any point after you have commits on a branch — before pushing (it'll push for you), after an existing PR is open (update the body), or mid-grill when the design crystallized into committed code. If there are no commits between `<base>` and `HEAD`, say so and stop — don't open a PR from noise.
**After this command:**
- The Story's lens couldn't fit an interesting structure → `/diagram` for a dedicated deep-dive linked from the PR body. The `/diagram` protocol auto-detects scope from the diff range.
- To review a PR at the same bar — a peer's, or this one before merge → `/assess` for the full-clarity review (Story with Focus marks, findings, verdict).
- If the PR exposes a question a reviewer will inevitably ask that's better answered with code → `/prototype` the uncertain part, then update the PR.
- If the PR advances an architectural decision → `/grill` to capture an ADR that the PR's "Why" section can link.
- If you need to step away mid-review-cycle → `/handoff` to checkpoint; `/recall` to resume.