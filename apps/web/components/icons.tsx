import type { DayPlanKindIcon, NavIcon, ShoppingCategoryIcon } from '@family-companion/shared';

type IconProps = {
  size?: number;
  className?: string;
  title?: string;
};

function SvgIcon({
  size = 20,
  className,
  title,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

const NAV_ICON_PATHS: Record<NavIcon, React.ReactNode> = {
  heute: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  kalender: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  todos: (
    <>
      <rect x="3" y="5" width="18" height="18" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  listen: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </>
  ),
  haushalt: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
};

const SHOPPING_ICON_PATH = (
  <>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2 2h2l2.4 12.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L22 6H6" />
  </>
);

const DAY_PLAN_KIND_ICON_PATHS: Record<DayPlanKindIcon, React.ReactNode> = {
  event: NAV_ICON_PATHS.kalender,
  todo: NAV_ICON_PATHS.todos,
  shopping: SHOPPING_ICON_PATH,
};

const SHOPPING_CATEGORY_ICON_PATHS: Record<ShoppingCategoryIcon, React.ReactNode> = {
  supermarket: SHOPPING_ICON_PATH,
  drugstore: (
    <>
      <path d="M10 2v4" />
      <path d="M14 2v4" />
      <path d="M4 7h16" />
      <path d="M6 7l1 14h10l1-14" />
    </>
  ),
  pharmacy: (
    <>
      <path d="M12 6v12M6 12h12" />
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </>
  ),
  clothing: (
    <>
      <path d="M6 3l3 3-1 15h8l-1-15 3-3" />
      <path d="M9 3h6" />
    </>
  ),
  other: NAV_ICON_PATHS.listen,
};

export function NavAreaIcon({ icon, ...props }: IconProps & { icon: NavIcon }) {
  return <SvgIcon {...props}>{NAV_ICON_PATHS[icon]}</SvgIcon>;
}

export function DayPlanKindIconGlyph({
  icon,
  ...props
}: IconProps & { icon: DayPlanKindIcon }) {
  return <SvgIcon {...props}>{DAY_PLAN_KIND_ICON_PATHS[icon]}</SvgIcon>;
}

export function ShoppingCategoryIconGlyph({
  icon,
  ...props
}: IconProps & { icon: ShoppingCategoryIcon }) {
  return <SvgIcon {...props}>{SHOPPING_CATEGORY_ICON_PATHS[icon]}</SvgIcon>;
}
