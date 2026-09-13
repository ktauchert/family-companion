# ADR 0001: npm Workspaces statt pnpm

- Status: Accepted
- Datum: 2026-09-13

## Kontext

Das Monorepo teilt Code zwischen Next.js und Expo. Die erste Struktur-Notiz sah pnpm vor (`pnpm-workspace.yaml`, `workspace:*`, `packageManager: pnpm`).

## Entscheidung

Wir nutzen **npm Workspaces**.

- Workspaces stehen in der Root-`package.json` (`apps/*`, `packages/*`).
- Interne Abhängigkeiten verwenden `"*"` (npm-Protokoll), nicht `workspace:*`.
- `packageManager` ist npm. Keine `pnpm-workspace.yaml`.

## Konsequenzen

- Ein Tool weniger; `npm install` reicht.
- Lockfile ist `package-lock.json`.
- Manche Turborepo-Beispiele gehen von pnpm aus — Workspace-Pfade und Filter weichen leicht ab.

## Alternativen

- **pnpm:** schnell und in der Vorlage beschrieben, aber bewusst abgelehnt.
- **Yarn Berry:** kein Vorteil gegenüber npm für dieses Repo.
