import Link from 'next/link';

export function Chrome({
  crumb,
  current,
  children,
}: {
  crumb: string;
  current?: 'heute' | 'kalender' | 'todos' | 'listen' | 'haushalt';
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
          <Link href="/kalender" aria-current={current === 'kalender' ? 'page' : undefined}>
            Kalender
          </Link>
          <Link href="/todos" aria-current={current === 'todos' ? 'page' : undefined}>
            Todos
          </Link>
          <Link href="/listen" aria-current={current === 'listen' ? 'page' : undefined}>
            Listen
          </Link>
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
