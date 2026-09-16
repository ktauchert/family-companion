import type { DayPlanKindIcon, NavIcon, ShoppingCategoryIcon } from '@family-companion/shared';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const NAV_IONICON_NAMES: Record<NavIcon, { outline: IoniconName; filled: IoniconName }> = {
  heute: { outline: 'sunny-outline', filled: 'sunny' },
  kalender: { outline: 'calendar-outline', filled: 'calendar' },
  todos: { outline: 'checkbox-outline', filled: 'checkbox' },
  listen: { outline: 'list-outline', filled: 'list' },
  haushalt: { outline: 'people-outline', filled: 'people' },
};

const DAY_PLAN_KIND_IONICON_NAMES: Record<
  DayPlanKindIcon,
  { outline: IoniconName; filled: IoniconName }
> = {
  event: NAV_IONICON_NAMES.kalender,
  todo: NAV_IONICON_NAMES.todos,
  shopping: { outline: 'cart-outline', filled: 'cart' },
};

const SHOPPING_CATEGORY_IONICON_NAMES: Record<
  ShoppingCategoryIcon,
  { outline: IoniconName; filled: IoniconName }
> = {
  supermarket: DAY_PLAN_KIND_IONICON_NAMES.shopping,
  drugstore: { outline: 'flask-outline', filled: 'flask' },
  pharmacy: { outline: 'medkit-outline', filled: 'medkit' },
  clothing: { outline: 'shirt-outline', filled: 'shirt' },
  other: NAV_IONICON_NAMES.listen,
};

type IconProps = {
  size?: number;
  color: ColorValue;
  focused?: boolean;
};

export function NavAreaIcon({ icon, size = 22, color, focused = false }: IconProps & { icon: NavIcon }) {
  const names = NAV_IONICON_NAMES[icon];
  return <Ionicons name={focused ? names.filled : names.outline} size={size} color={color} />;
}

export function DayPlanKindIconGlyph({
  icon,
  size = 20,
  color,
  focused = false,
}: IconProps & { icon: DayPlanKindIcon }) {
  const names = DAY_PLAN_KIND_IONICON_NAMES[icon];
  return <Ionicons name={focused ? names.filled : names.outline} size={size} color={color} />;
}

export function ShoppingCategoryIconGlyph({
  icon,
  size = 20,
  color,
  focused = false,
}: IconProps & { icon: ShoppingCategoryIcon }) {
  const names = SHOPPING_CATEGORY_IONICON_NAMES[icon];
  return <Ionicons name={focused ? names.filled : names.outline} size={size} color={color} />;
}

export function navAreaTabIcon(icon: NavIcon) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <NavAreaIcon icon={icon} color={color} size={size} focused={focused} />
  );
}
