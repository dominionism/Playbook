---
description: Shared visual-clarity engine behind /pr and /assess — produces the Story (an end-to-end Mermaid flow of the changed system, narrated in plain language), the Delta (a compact before/after of what moved), and in review mode the Focus (where to look hardest). Defers to /diagram for rendering rules.
---

Make the work legible at a glance. This protocol produces the visual supplements that `/pr` embeds in every pull request and `/assess` embeds in every review. The bar is fixed: a developer who has never opened this repo follows the flow without asking anyone, and a developer who knows it cold still learns exactly where the change lives.

Request from the caller (may be empty — detect the mode per §1): $ARGUMENTS

---

## 1. Detect the mode

Two modes. Decide before drawing anything:

- **Authoring** — producing a PR's visual supplement. Signals: invoked from `/pr`; or standalone on a branch with commits against a base and no PR reference in the arguments.
- **Review** — producing a review's visual supplement. Signals: invoked from `/assess`; or the arguments contain a PR number, URL, or head-branch name.

If both signals are absent and context doesn't settle it, ask one question: "Authoring visuals for the current branch, or review visuals for an existing PR?" Do not guess.

Then resolve the diff range:

- Authoring: `<base>..HEAD` — resolve the base exactly as `/pr` §1 does.
- Review: the PR's diff via `gh pr diff <n>`, its file list via `gh pr view <n> --json files`.

## 2. Check the floor — does this diff earn visuals?

Read the diff stat. If the change has **zero architectural surface** — docs-only, comment-only, formatting, lockfile churn, a rename with no flow change — produce no visuals. Tell the caller in one line why ("skipped: docs-only diff, no flow to draw") and stop. The PR body simply omits the visual sections; never write a placeholder into the artifact.

Everything above the floor gets visuals **scaled to the diff**: a one-function fix gets a small Story and a two-node Delta; a subsystem move gets the full treatment. Never pad.

## 3. Trace before you draw

Diagrams are claims about the code. Earn them:

1. Read the full diff.
2. Identify the flow(s) the change participates in — the complete journey from entry point to final effect (request → handler → service → store; event → worker → side effect; CLI → parser → action).
3. Walk that flow in the **actual code at the changed state**, entry to exit — read every file on the path that the diff touches, skim the ones it merely passes through.
4. Note precisely which nodes and edges of that journey the change adds, removes, or rewires. That set drives the Story's marking and the Delta's frame.

If you cannot trace the flow end to end, say so and draw only what you verified — a smaller true diagram beats a complete guess.

## 4. The Story — how the system works now

One diagram that tells the full story of the relevant architecture: the changed flow **end to end**, drawn in the state the world will be in with this change applied.

**Scope — the zoom-lens rule.** The lens centers on the change:

- Everything the flow passes through appears, so the journey is complete — entry to exit, no gaps.
- Subsystems the flow merely touches collapse into a single boundary node ("Auth", "Billing").
- Detail concentrates where the change lives: the touched module may show its internal steps; nothing else does.
- Aim for 10–20 nodes. Hard caps and syntax come from `/diagram` (`~/.commands/diagram.md`): 30 nodes, 50 edges, `accTitle`/`accDescr` mandatory.

**Marking.** Highlight what the change touched, with a convention that survives light mode, dark mode, and screen readers:

- Changed node labels carry a trailing `✱`: `R["Repository ✱"]`.
- Reinforce for sighted readers with `classDef changed stroke-width:3px;` and `class R changed;`.
- One legend line directly under the diagram: `✱ = changed in this PR`.
- New edges may be drawn thick (`==>`). Removed paths do not appear in the Story — they belong to the Delta.

**The walkthrough — the dumbed-down narration.** Every Story is followed by a numbered walkthrough, one plain sentence per node, in flow order:

> 1. **Router** — every request lands here first; it only decides where things go.
> 2. **Repository ✱** — new in this PR: the one place that talks to the database, so nothing else has to know SQL exists.

Rules for the walkthrough:

- One sentence per node, everyday language. Every technical term is either replaced or explained in the same breath.
- Use the project's canonical names (`Context/Glossary.md`, if it exists) — plain language means no *unexplained* jargon, not wrong names.
- Anchor sparingly: a `path/to/file.ts` after the bold name when knowing the file helps; never line numbers — they rot.
- The test: someone who has never opened this repo reads only the walkthrough and can say what the system does. If a sentence needs the diagram to be intelligible, rewrite the sentence.

## 5. The Delta — what changed, visually

A compact before/after of the changed neighborhood only — the zoomed-in mini companion to the Story.

- Default shape: two subgraphs, Before and After, each ≤ 8 nodes:

  ```mermaid
  ---
  title: "Storage path, before and after"
  accTitle: "Storage path, before and after"
  accDescr: "Before: Service wrote to a file store directly. After: Service goes through a new Repository into PostgreSQL."
  ---
  flowchart LR
      subgraph before["Before"]
        S1[Service] --> F1[(File store)]
      end
      subgraph after["After"]
        S2[Service] --> R2["Repository ✱"] --> P2[(PostgreSQL)]
      end
  ```

- Caption above the diagram, one or two sentences, plain language: what moved and why a reader should care. ("The service used to write files directly; now a repository sits in between, so storage can change without touching business logic.")
- If before and after differ by a single node or edge, one subgraph plus the caption is enough — don't draw twins to show one difference.
- The Delta shows structure that moved. If nothing structural moved (a pure behavior fix inside one function), skip the Delta and say so — the Story's `✱` marking already carries it.

## 6. The Focus — review mode only

Where the reviewer should look hardest. Produced only in review mode, after real analysis of the diff — never decoratively.

- Mark 1–3 nodes on the Story with `⚠` in the label and `classDef focus stroke-width:3px,stroke-dasharray:5;`.
- Extend the legend: `✱ = changed in this PR · ⚠ = review focus`.
- Under the walkthrough, add one line per `⚠`: the concrete reason it deserves scrutiny ("⚠ **Repository** — the transaction boundary moved here; a failure between the two writes is the new risk"). The reason names a specific invariant, edge case, or consequence — "complex logic" is not a reason.

## 7. Assemble for the caller

- **Authoring mode** → hand `/pr` two ready-to-embed pieces:
  - `## How it works` — the Story, its legend, its walkthrough. Placed directly after `## Summary`.
  - The Delta with its caption — closes `## What changed`.
- **Review mode** → hand `/assess` three pieces in its review-body order: the Story (with Focus marks and walkthrough), the Delta, and the per-`⚠` focus notes.
- **Standalone** → present the pieces, state which mode was used and which diff range was read.

Count every diagram: at most 3 per artifact, within `/diagram`'s size caps, each with `accTitle`/`accDescr` and a plain-text lead-in. If a diagram fails a cap, shrink the lens or split — never ship one that renders as raw code.

---

## Anti-patterns

- **Wallpaper.** The whole repo in one diagram with the change lost inside it. The lens centers on the change; the rest collapses into boundary nodes.
- **Drawing the intention.** Diagramming the architecture as designed rather than as the code actually behaves. Trace first (§3); every node and edge corresponds to something you read.
- **Jargon walkthrough.** "The middleware hydrates the DTO via the DI container" explains nothing. Each term earns its place or gets a plain-language clause.
- **Twin diagrams for one difference.** A Before/After pair where seven nodes are identical and one edge moved. Zoom the Delta until the difference is most of the picture.
- **Decorating the trivial.** Visuals for a docs diff because "every PR gets visuals." The floor (§2) exists; skipping with a stated reason is a correct output.
- **Unexplained marks.** A `✱` or `⚠` with no legend, or a `⚠` with no reason line. Every mark is a promise of an explanation.
- **Silent cap overflow.** GitHub renders an oversized diagram as raw text. `/diagram`'s limits are hard.

---

## Workflow

**Before this protocol:** the caller has a diff — `/pr` (authoring mode, every PR above the floor), `/assess` (review mode), or a standalone invocation with a branch or PR reference.

**After this protocol:**
- `/pr` embeds the pieces at their fixed places (§7) and continues its own flow.
- `/assess` embeds the pieces into the review draft, then adds findings and verdict.
- A structure too large or interesting for the lens → a dedicated `/diagram` deep-dive, linked from the PR instead of inlined.
