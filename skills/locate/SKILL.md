---
name: locate
description: Find and absorb the right Grove context tree. Use when the user explicitly asks to recover prior context; rank canopies, judge candidates, require confirmation, read the selected tree in full, and resume from its recorded state.
compatibility: Requires the grove binary on PATH and a Grove root at GROVE_ROOT or ~/Grove.
---

## Preflight

Run this before anything else:

```sh
command -v grove >/dev/null && test -d "${GROVE_ROOT:-$HOME/Grove}"
```

If either check fails, stop. Tell the user that this skill requires the `grove` CLI and a Grove root (`GROVE_ROOT`, defaulting to `~/Grove`), and that Grove is a separate project. Do not improvise a substitute memory store, and do not read from anywhere else.

## Protocol

Read `references/protocol.md` relative to this skill directory and follow it end to end. The bundled file is the canonical protocol for this skill: Grove is a locator rather than an injector, candidate confirmation is mandatory, and the selected tree must be read in full.

Treat the request supplied with this skill invocation as the optional locate query. If absent, gather intent in the protocol's first beat.
