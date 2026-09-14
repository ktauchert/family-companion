import Link from 'next/link';

export function Chrome({
  crumb,
  current,
  children,
}: {
  crumb: string;
  current?: 'heute' | 'haushalt';
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="top">
        <strong className="serif">Family Companion</strong>
        <nav>
          <Link href="/heute" aria-current={current === 'heute' ? 'page' : undefined}>
            Heute
          </Link>
          <span>Kalender</span>
          <span>Todos</span>
          <span>Listen</span>
          <Link href="/haushalt" aria-current={current === 'haushalt' ? 'page' : undefined}>
            Haushalt
          </Link>
        </nav>
      </header>
      <div className="wrap">
        <p className="crumb">{crumb}</p>
        {children}
      </div>
    </>
  );
}
