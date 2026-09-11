---
name: init
description: Bootstrap the project's Context and Memories directories with non-destructive templates. Use when the user explicitly asks to initialize Playbook's project-memory structure; create missing paths and never overwrite existing content.
compatibility: Requires git and write access to the project root.
---

Bootstrap this project's documentation structure. Run this once at the start of a project. All other commands expect this structure to exist — `/init` creates it so they don't have to.

---

## Process

1. **Resolve the project root:**
   ```bash
   git rev-parse --show-toplevel
   ```

2. **Create the directory structure** under `<project-root>/`:

   ```
   <project-root>/
   ├── Context/
   │   ├── Glossary.md
   │   ├── Research/
   │   │   └── Research.md
   │   ├── ADR/
   │   └── Plans/
   └── Memories/
   ```

3. **`Glossary.md`** — create from this template. Replace `{Project Name}` with the actual project name (from `package.json` `"name"`, repo name, or directory name — whichever is most specific):

   ```md
   # {Project Name}

   {A one or two sentence description of what this context is and why it exists.}

   ## Language

   <!-- Terms are added by /grill as they crystallize during grilling sessions. -->
   ```

4. **`Context/Research/Research.md`** — create from this template. Create the `Context/Research/` directory first:

   ```md
   # Research: {Project Name}

   > Last updated: {{date}} (comprehensive)

   ## What is this?
   <!-- Filled by /research -->

   ## Architecture
   <!-- Filled by /research -->

   ## Domain Model
   <!-- Filled by /research -->

   ## Patterns
   <!-- Filled by /research -->

   ## Relevant ADRs
   <!-- Filled by /research -->

   ## Open Questions
   <!-- Filled by /research -->
   ```

5. **`Context/ADR/`** — empty directory. ADRs are created by `/grill` when architectural decisions crystallize.
6. **`Context/Plans/`** — empty directory. Implementation plans are created by `/blueprint`.
7. **`Memories/`** — empty directory. Session handoffs are created by `/handoff`.

---

## Rules

- **Idempotent.** If any path already exists, skip it. Never overwrite existing files.
- **Don't fill in content.** The template is structural scaffolding. `/research` fills in `Context/Research/Research.md`; `/grill` fills in Glossary.md and ADR/; `/blueprint` fills in Plans/.
- **Report what you did.** List exactly what was created vs what already existed.

---

## Workflow

**Before this command:** none. `/init` is the very first thing you run in a new project.

**After this command:**
- `/research` to map the codebase — will populate `Context/Research/Research.md`
- `/grill` will populate `Glossary.md` and `ADR/`
- `/blueprint` will populate `Plans/`
- `/handoff` will populate `Memories/`
