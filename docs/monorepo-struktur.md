# Ursprüngliche Monorepo-Notiz

Erste Zusammenstellung der Turborepo-Struktur. Angepasst: **npm Workspaces** statt pnpm, Projektname **family-companion**.

Ziel: Types, Firebase-Konstanten und Validierungslogik zwischen Next.js (Web) und Expo (Mobile) teilen.

---

## Ziel-Dateibaum (Ist-Stand Web-Routing ab 2.5)

Scaffolds stehen (Phase 0.1). Web-App-Routen seit Phase 2.5 in Route-Gruppen; URLs bleiben flach (`/heute`, nicht `/app/heute`).

```text
family-companion/
├── apps/
│   ├── web/                        # Next.js App
│   │   ├── app/
│   │   │   ├── (marketing)/        # Landing, Login, Register, Legal
│   │   │   │   ├── page.tsx        # /
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── impressum/
│   │   │   │   └── datenschutz/
│   │   │   ├── (app)/              # Chrome + AppAuthGate
│   │   │   │   ├── heute/
│   │   │   │   ├── kalender/
│   │   │   │   ├── todos/
│   │   │   │   ├── listen/
│   │   │   │   ├── haushalt/
│   │   │   │   ├── onboarding/
│   │   │   │   └── einstellungen/
│   │   │   └── api/                # optional später (OpenAI serverseitig)
│   │   ├── components/
│   │   ├── lib/firebase.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                     # React Native (Expo) App
│       ├── app/                    # Expo Router (file-based navigation)
│       │   ├── _layout.tsx
│       │   ├── login.tsx
│       │   └── (tabs)/             # Heute, Kalender, …
│       ├── lib/firebase.ts
│       ├── app.json
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                     # Types, Schemas & Core Logic
│   │   ├── src/
│   │   │   ├── types/              # Firestore Document Types
│   │   │   ├── schemas/            # Zod Schemata
│   │   │   └── firebase/           # Shared Config / Constants
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config-typescript/          # Shared TSConfigs
│       ├── base.json
│       ├── nextjs.json
│       └── react-native.json
│
├── package.json                    # Root + npm workspaces
├── turbo.json
└── .gitignore
```

---

## Workspaces (npm statt pnpm)

Keine `pnpm-workspace.yaml`. Workspaces stehen in der Root-`package.json`:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

Shared-Package in den Apps:

```json
{
  "dependencies": {
    "@family-companion/shared": "*"
  }
}
```

(`*` statt `workspace:*` — das ist das npm-Workspace-Protokoll.)

---

## Shared Package

Package-Name: `@family-companion/shared`

Types: `Household`, `CalendarEvent`, `TodoItem`, `ShoppingItem`, `MorningCheckIn`, Completions, Listen-Themen. Katalog: [features.md](./features.md).

Erstes Schema: `AiSummaryResponseSchema` (Zod, vorgesehen für OpenAI Structured Output).

Firebase-Konstanten: Collection-Namen und `FREE_TIER_MAX_MEMBERS`.

### Verwendungsbeispiel

```typescript
import { Household, AiSummaryResponseSchema } from '@family-companion/shared';

const currentHousehold: Household = {
  id: 'hh_123',
  name: 'Familie Haus',
  plan: 'pro',
  members: ['user_a', 'user_b'],
  createdAt: new Date().toISOString(),
};
```

---

## Hinweise zur ursprünglichen Vorlage

- Vorlage nutzte `family-app` / `@family-app/*` und pnpm.
- Hier: `family-companion` / `@family-companion/*` und npm.
- Next.js- und Expo-Scaffolds stehen seit Phase 0.1.
