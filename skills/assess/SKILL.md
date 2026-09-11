---
name: assess
description: Review a GitHub pull request at the ceiling of clarity. Use when the user explicitly asks to assess a PR; trace the actual change, produce Story/Delta/Focus visuals, draft findings and a verdict, and never post without approval.
compatibility: Requires git and an authenticated GitHub CLI (gh) with access to the target repository.
---

Produce the PR review a senior engineer would be proud to sign: one document that teaches the reader how the changed system works, shows exactly what moved, says where the risk lives, and states a verdict with reasons. The review is drafted locally and shown in full; nothing reaches GitHub until explicitly approved.

Never attribute the review to any tool, CLI, or AI. The reviewer is whoever GitHub says you are.

Treat the request supplied with this skill invocation as the PR number, URL, or head branch. It may be empty; if so, identify the PR per §1.

---

## 1. Identify the PR

If the arguments name a PR (number, URL, or head branch), use it. If they don't:

```bash
gh pr list --state open --limit 20
```

Show the list and ask which one. Never guess — reviewing the wrong PR wastes everyone's time and posting to it is worse.

`/assess` works on a peer's PR or your own. Note: GitHub does not allow approving or requesting changes on your own PR — a self-assess is a pre-flight quality pass, and its only postable form is a comment.

## 2. Fetch the PR — all of it

```bash
gh pr view <n> --json number,title,body,author,baseRefName,headRefName,isDraft,additions,deletions,changedFiles,url
gh pr view <n> --comments
gh pr diff <n>
```

- The **body** is the author's claim about what the PR does. You will verify it.
- The **comments and existing reviews** are prior art. Do not repeat a point already raised — reference or extend it.
- The **diff** is the ground truth. Read every hunk. If the PR is a draft, note it — the bar for polish findings drops, the bar for direction findings doesn't.

To read files as they exist at the PR head without disturbing the working tree:

```bash
git fetch origin pull/<n>/head
git show FETCH_HEAD:path/to/file.ts
```

Only `gh pr checkout <n>` when you genuinely need deeper exploration (running tests, LSP navigation) — and only if `git status --short` is clean. Say so before switching branches, and switch back after.

**Size honesty:** if the diff is too large to review honestly in one pass, say so before pretending otherwise. Offer to review commit-by-commit, or recommend the author split it — the same atomicity bar `/pr` applies when authoring.

## 3. Understand the change

Do the work the visuals and findings both depend on:

- Read the full diff, then trace the changed flow **end to end in the actual code** at the PR head — entry point to final effect. This trace is what the Story will draw; don't draw what you didn't walk.
- Read the tests the PR touches. Note behavior that changed without a test changing — that gap is a finding.
- If the repo has durable context, use it: `Context/ADR/*.md` — a change that contradicts a settled ADR is a finding with the ADR cited; `Context/Glossary.md` — new code that drifts from canonical terms is a (minor) finding; `Context/Plans/` — if the PR implements a plan, check the work items it claims.
- Compare what the code does against what the PR body says it does. A mismatch is finding #1, whichever direction it runs.

## 4. Produce the visuals

Activate the installed `visuals` skill and follow it in **review mode**. It yields:

- **The Story** — the changed flow end to end as it will work post-merge, `✱` marks on what the PR touched, `⚠` marks on the 1–3 places to look hardest, and the plain-language walkthrough.
- **The Delta** — the compact before/after of the neighborhood that moved.
- **The Focus notes** — one line per `⚠` naming the specific invariant or edge case at risk.

The engine's floor applies here too: a docs-only PR gets no diagrams, and the review says why in one line.

## 5. Draft the review

Assemble this structure. Omit a section only when it's genuinely empty — never write "N/A":

```markdown
## What this PR does
<two to four plain sentences, written for someone who hasn't read the diff.
If this summary contradicts the PR's own description, that mismatch is finding #1.>

## How it works now
<the Story: diagram, legend, walkthrough — from /visuals review mode>

## What changed
<the Delta with its caption>

## Where to look hardest
<one line per ⚠, from the Focus notes>

## Findings
<ordered by severity: correctness > design & ADR conflicts > missing tests > clarity.
Each: `path/to/file.ts:<line>` — what's wrong, why it matters, and a concrete suggestion.
If nothing survives scrutiny: "No blocking findings.">

## Questions
<genuine questions — things you actually don't know, not findings wearing a question mark>

## Verdict
<approve | comment | request changes — with a one-line justification>
```

Rules for findings:

- **Findings target code, never the author.** Neutral phrasing, concrete suggestion attached — a finding without a proposed direction is half a finding.
- **Severity order is the sort order.** The one correctness bug outranks nine naming nits; never bury it.
- **No nit blizzards.** Batch style-level observations into one finding or drop them. If a linter should have caught it, say that once.
- **Questions are not findings.** If you already know the answer is "this is wrong," it's a finding. If you genuinely don't know, it's a question.
- **Verdict discipline.** `request changes` requires at least one correctness- or design-severity finding. `approve` requires zero unresolved correctness findings. Everything else is `comment`.

## 6. Deliver, then post only on approval

1. Show the **full draft** — every section, diagrams inline.
2. Ask what to do with it. Posting and verdict are the user's call, never yours. Do not post, and especially do not approve or request changes, without the user explicitly choosing.
3. On approval, post with a here-doc (Mermaid renders in review bodies):

```bash
gh pr review <n> --comment --body-file - <<'EOF'
<full markdown review>
EOF
```

Substitute `--approve` or `--request-changes` only for the user's explicitly chosen verdict. If posting fails (auth, permissions, ruleset), report the failure verbatim and stop.

---

## Anti-patterns

- **The rubber stamp.** "LGTM, nice work" with no evidence anything was read. If the review could have been written without the diff, it isn't a review.
- **The nit blizzard.** Twenty comma-level comments burying the one transaction-boundary bug. Severity order exists to prevent exactly this.
- **Restating the diff.** "This PR changes `foo.ts` and adds `bar()`" — the Files tab already says that. Findings and the Story say what the diff *means*.
- **Reviewing the intention.** Judging the PR body's description instead of the code. Verify the claim; the mismatch is the finding.
- **Posting without approval.** A review is outward-facing with an audience. The draft is yours; the send button is the user's.
- **Verdict inflation.** Approving with a known correctness hole, or requesting changes over style. The verdict rules in §5 are hard.
- **Repeating prior reviewers.** A point already raised gets a reference, not a duplicate.
- **Tool attribution.** Any `Generated with` / agent credit. None. Ever.

---

## Workflow

**Before this command:** an open PR exists — a peer's, or your own as a pre-flight pass before requesting review. `/pr` produces the artifact `/assess` evaluates; the two share the /visuals engine and the same clarity bar.

**After this command:**
- Findings on your own PR → fix, `/commit`, and let `/pr` refresh the body; re-run `/assess` if the change was structural.
- A finding that exposed a hard-to-reverse decision → `/grill` to capture it as an ADR.
- A concept surfaced during review worth keeping → `/record`.
- Stepping away mid-review-cycle → `/handoff`; resume with `/recall`.
