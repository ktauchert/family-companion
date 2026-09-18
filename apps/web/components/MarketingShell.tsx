import { Footer } from './Footer';
import { MarketingHeader } from './MarketingHeader';

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-shell">
      <MarketingHeader />
      <main className="marketing-main">{children}</main>
      <Footer />
    </div>
  );
}
