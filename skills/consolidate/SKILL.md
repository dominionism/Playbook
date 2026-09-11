---
name: consolidate
description: Distill the current session into a Grove context tree. Use when the user explicitly asks to preserve durable memory; route the signal, write owner-voiced leaves, refresh the canopy, reindex, show the staged diff, and commit only after explicit approval.
compatibility: Requires the grove binary on PATH and a Grove root at GROVE_ROOT or ~/Grove.
---

## Preflight

Run this before anything else:

```sh
command -v grove >/dev/null && test -d "${GROVE_ROOT:-$HOME/Grove}"
```

If either check fails, stop. Tell the user that this skill requires the `grove` CLI and a Grove root (`GROVE_ROOT`, defaulting to `~/Grove`), and that Grove is a separate project. Do not improvise a substitute memory store, and do not write anywhere else.

## Protocol

Read `references/protocol.md` relative to this skill directory and follow it end to end. The bundled file is the canonical protocol for this skill: routing may skip a question but never acceptance; every leaf obeys the signal check and owner-voice rule; canopy refresh is mandatory.

Treat the request supplied with this skill invocation as an optional subject hint. If absent, scope the consolidation in the protocol's first beat.
