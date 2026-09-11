---
name: record
description: Capture a concept, explanation, or analogy in a personal engineering knowledge library. Use when the user explicitly asks to record something retroactively, research and save a new concept, or format dictated material.
---

Record a concept in the user's personal engineering knowledge library. Resolve the library root before writing:

1. Use `PLAYBOOK_LIBRARY_DIR` when that environment variable is set.
2. Otherwise, ask the user to choose a location; suggest `~/Documents/Engineering Notes/`, but never create it without explicit approval. Recommend exporting `PLAYBOOK_LIBRARY_DIR` so the choice persists across sessions.

Call the resolved directory `<library-root>` throughout this workflow.

---

## Mode detection

From my prompt, determine which mode applies:

- **Retroactive** — I'm referencing something you just explained. You have the full conversation in context. Identify the recent explanation, extract it, and save it. Ask me which concept name to file it under if it's not obvious from context.
- **On-demand** — I'm asking you to research and explain something new, then save it. E.g., `/record explain the CAP theorem`. Research the concept (web, training data, or codebase), formulate a clear explanation, then save it.
- **Manual** — I'm dictating specific content. Just format and save it.

If ambiguous, default to retroactive and ask: "Which concept from our conversation should I record?"

---

## Process

### 1. Name the concept

Ask me for the concept name if it's not clear. Use PascalCase with hyphens for spaces: `CAP-Theorem.md`, `Lock-Free-Queues.md`. The filename is the concept identifier — make it specific enough to be unambiguous.

If a chapter already exists with that name, tell me and ask whether to update the existing chapter or create a new one.

### 2. Write the chapter

Write to `<library-root>/Chapters/<Concept-Name>.md`. Create `Chapters/` if it does not exist. Use this template:

```md
# <Concept Name>

> Captured: YYYY-MM-DD

## In One Sentence
{One sentence that captures the essence — the thing you'd tell a colleague at the whiteboard.}

## The Explanation
{The full explanation. Technically accurate. Build from first principles. Assume the reader is a competent engineer who hasn't encountered this specific concept before. Use concrete examples over abstract descriptions.}

## The Analogy
{The analogy that made it click. Must honor the technical reality — a misleading analogy is worse than none. If you can't find one that's both vivid and accurate, omit this section with a note: "<!-- No accurate analogy found yet. -->"}

## Why This Matters
{When would you reach for this? What problem does it solve? What happens if you don't understand it and get it wrong? Keep it grounded in real engineering consequences.}

## Related
{Optional. Links to other chapters in this textbook, or external references (papers, talks, blog posts). Use relative links for other chapters: `[CAP Theorem](CAP-Theorem.md)`.}
```

### 3. Update the glossary

Write or update `<library-root>/Glossary.md`. Create it if it does not exist. Use the library directory's name as `{Library Name}`. Append the new entry, then sort alphabetically:

```md
# {Library Name} — Glossary

{One-line description: "A personal reference of engineering concepts, built through conversation."}

---

- **[Concept Name](Chapters/Concept-Name.md)** — {one-line summary capturing both what it is and why it matters}
```

Each entry is a single bullet: linked chapter name + one-line summary. Keep entries sorted A-Z. If updating an existing entry, rewrite the summary — don't create a duplicate.

---

## Rules

- **Don't fabricate.** If I ask about something you can't explain with confidence, say so. A blank chapter costs nothing; a wrong chapter costs trust.
- **The analogy must be accurate.** If the only available analogies distort the concept, skip the analogy section entirely. Accuracy first.
- **Keep chapters self-contained.** Don't assume the reader has read other chapters. Cross-reference with `[links](Other-Chapter.md)` rather than relying on prior knowledge.
- **One concept per chapter.** If a topic branches into sub-concepts, create separate chapters and cross-link them.
- **Don't bloat the glossary.** One entry per concept. If a chapter gets a major revision, update the glossary summary — don't add a second entry.

---

## Workflow

**Before this command:** none. `/record` can be invoked at any point in any conversation — coding session, grilling session, or standalone.

**After this command:**
- Tell me what was recorded and where to find it.
- If the chapter is missing an analogy or feels thin, flag it: "The chapter is solid on mechanics but I couldn't find a good analogy — consider adding one later."
- If the glossary entry could be sharper, say so.
