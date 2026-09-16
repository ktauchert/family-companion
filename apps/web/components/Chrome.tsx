import Link from 'next/link';
import {
  NAV_AREA_KEYS,
  NAV_AREA_LABELS,
  NAV_ICON_TO_WEB_PATH,
  type NavIcon,
} from '@family-companion/shared';
import { NavAreaIcon } from './icons';

export function Chrome({
  crumb,
  current,
  children,
}: {
  crumb: string;
  current?: NavIcon;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="top">
        <strong className="serif">Family Companion</strong>
        <nav>
          {NAV_AREA_KEYS.map((key) => (
            <Link
              key={key}
              href={NAV_ICON_TO_WEB_PATH[key]}
              className="nav-link"
              aria-current={current === key ? 'page' : undefined}
            >
              <NavAreaIcon icon={key} size={18} title={NAV_AREA_LABELS[key]} />
              <span>{NAV_AREA_LABELS[key]}</span>
            </Link>
          ))}
        </nav>
      </header>
      <div className="wrap">
        <p className="crumb">{crumb}</p>
        {children}
      </div>
    </>
  );
}
