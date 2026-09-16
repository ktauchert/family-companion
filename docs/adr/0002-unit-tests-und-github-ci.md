# ADR 0002: Unit Tests (Vitest) und GitHub CI

- Status: Accepted
- Datum: 2026-09-13

## Kontext

Phase 0 hat noch keine Tests und keine CI. Sobald Shared-Logik und Apps wachsen, brauchen Web und Mobile denselben Test- und Prüfstapel. Ohne Festlegung entsteht später ein Mischmasch (Jest hier, Vitest dort, keine Pipeline).

Es gibt noch kein GitHub-Remote und kaum testbare Logik. Ein volles CD-Setup (Deploy) wäre jetzt Leerlauf.

## Entscheidung

**Unit Tests:** Vitest im ganzen Monorepo, ein Runner.

- Erste Tests leben in `@family-companion/shared` (Schemas, Limits, später Join- und Plan-Regeln).
- Root-Script: `test` → `turbo test`.
- Apps nutzen später denselben Runner, sobald sie Logik haben.

**CI (GitHub Actions), sobald das Repo auf GitHub liegt:**

- Trigger: Push und Pull Request.
- Schritte: `npm ci`, `npm run check`.
- `check` = `type-check` → `lint` → `test` (Root-Script; lokal und CI identisch).
- Kein Deploy in dieser Entscheidung.

*(Ergänzt 2026-09-16: Lint in CI aufgenommen; ein `check`-Script statt drei getrennte CI-Schritte.)*

**Später, nicht jetzt:**

- CD (Vercel / EAS), wenn Web bzw. Mobile deploybar sind.
- E2E (Playwright für Web) nach Phase 2, wenn Auth und Listen stehen.
- Mobiler Test-Runner (Expo/Jest) nur wenn Vitest an der Expo-Toolchain scheitert — dann eigenes ADR.

## Konsequenzen

- Ein Stack, den Turbo und CI gleich aufrufen.
- Shared wird zur ersten Testfläche; Types allein brauchen kaum Tests, Zod- und Limit-Logik schon.
- CI setzt ein GitHub-Repo voraus. Bis dahin lokal: `npm run check` (vor PR/Push).
- Kein Release-Gate durch CD; das bleibt eine spätere Entscheidung.

## Alternativen

- **Jest überall:** etabliert bei Expo, aber schwerer und ein zweites Modell neben Vite/Next.
- **CI inkl. Deploy ab Tag 1:** keine deploybare App, Secrets und Environments wären Spekulation.
- **Tests erst mit Phase 2:** zu spät; Join-Limit und Schemas entstehen in Phase 1.
