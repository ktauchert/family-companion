# Ursprüngliche Monorepo-Notiz

Erste Zusammenstellung der Turborepo-Struktur. Angepasst: **npm Workspaces** statt pnpm, Projektname **family-companion**.

Ziel: Types, Firebase-Konstanten und Validierungslogik zwischen Next.js (Web) und Expo (Mobile) teilen.

---

## Ziel-Dateibaum (spätere Phasen)

Scaffolds stehen (Phase 0.1). Der Ordnerbaum unten ist das Zielbild inkl. späterer Auth- und API-Routen.

```text
family-companion/
├── apps/
│   ├── web/                        # Next.js App
│   │   ├── app/
│   │   │   ├── (auth)/login/
│   │   │   ├── dashboard/
│   │   │   └── api/ai/             # Next.js Route Handlers (OpenAI API)
│   │   ├── lib/firebase.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                     # React Native (Expo) App
│       ├── app/                    # Expo Router (file-based navigation)
│       │   ├── _layout.tsx
│       │   ├── (auth)/login.tsx
│       │   └── (tabs)/index.tsx
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
