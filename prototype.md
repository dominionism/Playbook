---
description: Build a throwaway prototype to answer a high-fidelity question. Two branches — an interactive terminal app for state/business-logic questions, or several radically different UI variations toggleable from one route. The code is disposable; the answer is what you keep.
---

A prototype is **throwaway code that answers a question.** The question decides the shape.

---

## Pick a branch

Identify which question is being answered — from my prompt, the surrounding code, or by asking me:

- **"Does this logic / state model feel right?"** → Build a tiny interactive terminal app that pushes the state machine through cases that are hard to reason about on paper.
- **"What should this look like?"** → Generate several radically different UI variations on a single route, switchable via a URL search param and a floating bottom bar.

If the question is genuinely ambiguous and I'm not reachable, default to whichever branch better matches the surrounding code (a backend module → logic; a page or component → UI) and state the assumption.

---

## Rules that apply to both

1. **Throwaway from day one, and clearly marked as such.** Locate the prototype code close to where it will actually be used (next to the module or page it's prototyping for) so context is obvious — but name it so a casual reader can see it's a prototype, not production. For throwaway UI routes, obey whatever routing convention the project already uses; don't invent a new top-level structure.

2. **One command to run.** Whatever the project's existing task runner supports — `pnpm <name>`, `python <path>`, `bun <path>`, etc. I must be able to start it without thinking.

3. **No persistence by default.** State lives in memory. Persistence is the thing the prototype is *checking*, not something it should depend on. If the question explicitly involves a database, hit a scratch DB or a local file with a clear "PROTOTYPE — wipe me" name.

4. **Skip the polish.** No tests, no error handling beyond what makes the prototype *runnable*, no abstractions. The point is to learn something fast and then delete it.

5. **Surface the state.** After every action (logic) or on every variant switch (UI), print or render the full relevant state so I can see what changed.

6. **Delete or absorb when done.** When the prototype has answered its question, either delete it or fold the validated decision into the real code — don't leave it rotting in the repo.

---

## Branch A — Logic Prototype

Use when the question is about **business logic, state transitions, or data shape** — the kind of thing that looks reasonable on paper but only feels wrong once you push it through real cases.

### Process

**1. State the question.** One paragraph. Write it at the top of the file or in a README next to the prototype. This makes it verifiable later.

**2. Isolate the logic in a portable module.** Put the actual logic — the bit that's answering the question — behind a small, pure interface. The TUI around it is throwaway; the logic module shouldn't be.

Pick the shape that fits:
- **A pure reducer** — `(state, action) => state`. Good when actions are discrete.
- **A state machine** — explicit states and transitions. Good when "which actions are legal right now" is part of the question.
- **A small set of pure functions** over a plain data type. Good when there's no implicit current state.
- **A class or module with a clear method surface** when the logic owns ongoing internal state.

Keep it pure: no I/O, no terminal code, no `console.log` for control flow. The TUI imports it and calls into it; nothing flows the other direction.

**3. Build the smallest TUI that exposes the state.** Each frame clears the screen and re-renders:

1. **Current state** — pretty-printed, diff-friendly. Use ANSI bold/dim for hierarchy.
2. **Keyboard shortcuts** — `[a] add user  [d] delete user  [q] quit`.

One keystroke → one action → re-render full frame. Loop until quit.

**4. Make it runnable in one command.** Add a script to `package.json` scripts or equivalent. `pnpm run <prototype-name>`.

**5. Hand it over.** Give me the run command. I'll drive it myself — the interesting moments are when I say "wait, that shouldn't be possible."

**6. Capture the answer.** When done, note what was learned (commit message, ADR, or a `NOTES.md` next to the prototype).

### Anti-patterns

- Don't add tests. A prototype that needs tests is no longer a prototype.
- Don't wire it to the real database. Use in-memory unless the question is about persistence.
- Don't generalize. No "what if we wanted to support X later."
- Don't blur the logic and the TUI together. Keep the TUI as a thin shell over a pure module.
- Don't ship the TUI shell into production.

---

## Branch B — UI Prototype

Use when the question is **"what should this look like?"** — generating several options so I can pick one or steal bits from each.

### Process

**1. State the question and pick N.** Default to **3 variants**. Cap at 5. Write the plan in one line at the top of the prototype.

**2. Generate radically different variants.** Each variant must be **structurally different** — different layout, different information hierarchy, different primary affordance. Not just different colours. Three slightly-tweaked card grids isn't a UI prototype.

Hold each variant to:
- The page's purpose and the data it has access to.
- The project's component library / styling system.

**3. Wire them together.** Mount variants on an existing page whenever possible (render them inside the host page, gated by `?variant=`). Only create a new throwaway route if there's genuinely no existing page to host them.

Create a floating bottom bar with:
- **Left arrow** — cycles to previous variant
- **Variant label** — shows current variant key and name
- **Right arrow** — cycles forward
- Keyboard: `←` and `→` arrow keys also cycle (don't intercept when an input is focused)
- Hidden in production builds (`NODE_ENV` check)
- Visually distinct from the page so it's obviously not part of the design

**4. Hand it over.** Surface the URL and the `?variant=` keys. I'll flip through and give feedback — usually "I want the header from B with the sidebar from C."

**5. Capture the answer and clean up.** Write down which variant won and why. Delete the losing variants and the switcher. Don't promote prototype code directly to production — rewrite it properly.

### Anti-patterns

- Variants that differ only in colour or copy. That's a tweak, not a prototype.
- Sharing too much code between variants. A shared `<Header>` is fine; a shared `<Layout>` defeats the point.
- Wiring variants to real mutations. Read-only prototypes are fine. Point at stubs if needed.
- Promoting the prototype directly to production. Rewrite when you fold it in.

---

## Domain awareness

Use terms from `Context/Glossary.md` for variable names, function names, and file names. Respect decisions in `Context/ADR/` that touch the area you're prototyping.

- `Context/Plans/` — read the plan file if one exists. It provides the larger context for the question being prototyped.
---

## Workflow

**Before this command:** `/grill` or `/blueprint` identified a high-fidelity question that can't be answered with words alone. The question requires seeing, touching, or stepping through.

**After this command:**
- The prototype answered the question → `/handoff` to pass the learning back to the parent session (grill or blueprint). The handoff should capture *what was learned*, not the prototype code itself.
- Delete or absorb the prototype code — do not leave it in the repo.
- The parent session resumes with `/recall` on the handoff.
