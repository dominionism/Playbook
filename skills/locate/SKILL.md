---
name: locate
description: Find and absorb the right Grove context tree. Use when the user explicitly asks to recover prior context; rank canopies, judge candidates, require confirmation, read the selected tree in full, and resume from its recorded state.
compatibility: Requires the grove binary and a configured GROVE_ROOT.
---

Read `references/protocol.md` relative to this skill directory and follow it end to end. The bundled file is the canonical protocol for this skill: Grove is a locator rather than an injector, candidate confirmation is mandatory, and the selected tree must be read in full.

Treat the request supplied with this skill invocation as the optional locate query. If absent, gather intent in the protocol's first beat.
