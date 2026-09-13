import { FREE_TIER_MAX_MEMBERS } from '@family-companion/shared';

export default function HomePage() {
  return (
    <main>
      <h1>Family Companion</h1>
      <p>Web-Scaffold. Shared-Paket ist verbunden.</p>
      <p>Free-Tier: höchstens {FREE_TIER_MAX_MEMBERS} Mitglieder.</p>
    </main>
  );
}
