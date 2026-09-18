'use client';

import Link from 'next/link';
import {
  NAV_AREA_KEYS,
  NAV_AREA_LABELS,
  NAV_ICON_TO_WEB_PATH,
  type NavIcon,
} from '@family-companion/shared';
import { ChromeCheckInChip } from './ChromeCheckInChip';
import { Footer } from './Footer';
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
    <div className="app-shell">
      <header className="top">
        <strong className="serif">Family Companion</strong>
        <nav aria-label="Hauptnavigation">
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
        <div className="top-actions">
          <ChromeCheckInChip />
          <Link className="icon-btn top-settings" href="/einstellungen" aria-label="Einstellungen">
            ⚙
          </Link>
        </div>
      </header>
      <div className="wrap">
        <p className="crumb">{crumb}</p>
        {children}
      </div>
      <Footer />
    </div>
  );
}
