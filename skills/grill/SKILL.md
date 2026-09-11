---
name: grill
description: Challenge an implementation plan against the project's domain language and unresolved decisions. Use when the user explicitly asks to grill a plan; interview one question at a time, sharpen terminology, and update confirmed glossary or ADR decisions.
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing.

If a question can be answered by exploring the codebase, explore the codebase instead.

---

## Domain awareness

During codebase exploration, also look for existing documentation.

- `Context/Plans/` — read the plan file (if multiple, pick the active one — matching your current branch or task). It is the implementation plan being grilled against. If no plan exists, say so and stop: `/grill` requires a plan — there is nothing to grill. Suggest `/blueprint` first.
### File structure

Your project uses this layout:

```
/
├── Context/
│   ├── Glossary.md
│   ├── Research/
│   │   └── Research.md
│   ├── ADR/
│   └── Plans/
│       └── <Feature-Name>.md
└── src/
```

`/init` should have already created `Context/`, `Glossary.md`, `Research/`, `ADR/`, and `Plans/`. If they don't exist (e.g., `/init` wasn't run), create them on-demand — the template format is described below in "Update Glossary.md inline." Never create files before you have content to put in them.

---

## During the session

### Establish scope boundaries

Before you grill the plan, confirm what's out of scope. Unchecked scope creep is the fastest way to a plan that sprawls beyond the current endeavor.

1. **Ask me what's out of scope.** "What are you explicitly *not* building in this round?" Wait for my answer.
2. **Provide your own recommendation.** Based on the plan and codebase, call out anything that looks like it's creeping beyond the current target — features, edge cases, refactors, or polish that don't belong yet. "The plan implies X, but that feels like a separate effort — should we carve it out?"
3. **Reach agreement before proceeding.** Don't move on until we've aligned on the boundaries.
4. **Write it into the plan.** Once agreed, add or update an "## Out of Scope" section in `Context/Plans/<Feature-Name>.md`. Each item: what's excluded and a one-line reason why.

The out-of-scope list is a guardrail for the rest of the grilling session. When a decision or term pulls toward excluded territory, point back to it: "We agreed X is out of scope — this decision would drag it back in. Proceed or renegotiate?"
### Challenge against the glossary

When I use a term that conflicts with the existing language in `Context/Glossary.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

### Sharpen fuzzy language

When I use vague or overloaded terms, propose a precise canonical term. "You're saying 'account' — do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force me to be precise about the boundaries between concepts.

### Cross-reference with code

When I state how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?"

### Update Glossary.md inline

When a term is resolved, update `Context/Glossary.md` right there. Don't batch these up — capture them as they happen. Use this format:

```md
# {Context Name}

{One or two sentence description of what this context is and why it exists.}

## Language

**TermName**:
A one or two sentence definition of what the term IS.
_Avoid_: synonym1, synonym2

**AnotherTerm**:
Definition.
_Avoid_: badname1, badname2
```

Rules for Glossary.md:
- **Be opinionated.** When multiple words exist for the same concept, pick the best one and list the others as aliases to avoid.
- **Keep definitions tight.** One or two sentences max. Define what it IS, not what it does.
- **Only include terms specific to this project's context.** General programming concepts (timeouts, error types, utility patterns) don't belong.
- **Group terms under subheadings** when natural clusters emerge.
- **Write an example dialogue.** A conversation between a dev and a domain expert that demonstrates how the terms interact naturally.

Glossary.md should be totally devoid of implementation details. Do not treat Glossary.md as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR.

When creating an ADR, use this format:

```md
# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

During the session, if a decision changes something in the implementation plan, update `Context/Plans/<Feature-Name>.md` immediately — same discipline as Glossary.md. Update the affected work item's What, Why, or Risk. Don't batch these changes.

ADRs live in `Context/ADR/` with sequential numbering: `0001-Slug.md`, `0002-Slug.md`, etc. Use PascalCase for the slug. An ADR can be a single paragraph. The value is in recording *that* a decision was made and *why* — not in filling out sections.

---

## Workflow

**Before this command:** `/init` (to scaffold Context/ — run once per project), then `/research` (to understand the codebase), then `/blueprint` (to produce the plan you will grill against). `/grill` requires a plan — it grills the plan, not the research.

`/grill` sharpens the plan's terminology against the codebase's domain language. It does not run before `/blueprint` — there is nothing to grill without a plan. If `/blueprint` produced the plan, `/grill` challenges and sharpens it; if both Glossary.md and ADRs are empty after the first grill, the plan's language was already precise.

**During this command:**
- If you hit a question that needs to be seen, not discussed → suggest `/handoff` to `/prototype`. Answer the high-fidelity question with code, then handoff the learnings back.
- If a prototype produced learnings that change the plan → update `Context/Plans/<Feature-Name>.md` with the finding before continuing the grilling session
- If context is running low mid-grill → `/handoff` to checkpoint. Resume with `/recall`.

**What `/grill` changes in the plan, and what it does not.** `/grill` edits the plan in place: the "Out of Scope" section, the What, Why, or Risk of any work item a decision touches, glossary-aligned wording, and ADR cross-references. It does not add, remove, or reorder work items, re-check dependency order, or research new unknowns — those are `/blueprint`'s steps. When a decision calls for any of them, finish the grilling session and re-run `/blueprint`; it reads the existing plan and preserves everything `/grill` added.

**After this command:**
- Re-run `/blueprint` if grilling materially changed the plan's scope, terminology, or risk surface — the plan file should reflect the sharpened design before implementation begins.
- If you want to preserve the session → `/handoff`
