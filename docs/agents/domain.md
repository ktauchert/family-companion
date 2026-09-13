# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.
- **`docs/design/ui.md`**: when the work is UI, layout, navigation, or visual form. Tokens live there; do not invent a sidebar or left-stripe cards.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

This repo is **single-context**. ADRs already live in `docs/adr/`. Product notes (`docs/features.md`, `docs/user-journey.md`, `docs/phasenplan.md`) are extra context, not a second glossary. Surface UI follows [`docs/design/ui.md`](../design/ui.md).

## File structure

Single-context (this repo):

```
/
├── CONTEXT.md                 ← created lazily by /grill-with-docs
├── docs/adr/
│   ├── 0001-npm-workspaces.md
│   └── …
├── docs/features.md
├── docs/design/ui.md
└── packages/shared/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (phasen-branches-und-docs), but worth reopening because…_
