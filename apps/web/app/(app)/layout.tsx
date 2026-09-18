import { AppAuthGate } from '../../components/AppAuthGate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppAuthGate>{children}</AppAuthGate>;
}
