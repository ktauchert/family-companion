export type SubscriptionPlan = 'free' | 'pro';

export type CompletionMode = 'household' | 'per_member';

export type Recurrence = 'none' | 'daily' | 'weekly';

export type ShoppingCategory =
  | 'supermarket'
  | 'drugstore'
  | 'pharmacy'
  | 'clothing'
  | 'other';

export type EnergyBand = 'low' | 'medium' | 'high';

export interface Household {
  id: string;
  name: string;
  plan: SubscriptionPlan;
  ownerId: string;
  members: string[];
  memberEmails: Record<string, string>;
  createdAt: string;
  invitePin: string;
  invitedEmails: string[];
  kaizenNudgesEnabled?: boolean;
}

export type HouseholdDraft = Omit<Household, 'id'>;

export interface MemberCompletion {
  userId: string;
  done: boolean;
  doneAt?: string;
}

export interface CalendarEvent {
  id: string;
  householdId: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  assignedTo?: string[];
  completionMode: CompletionMode;
  recurrence: Recurrence;
  kind: 'event' | 'habit';
  mandatoryDaily?: boolean;
  energyHint?: EnergyBand;
  completions: MemberCompletion[];
}

export interface ShoppingItem {
  id: string;
  householdId: string;
  name: string;
  category: ShoppingCategory;
  checked: boolean;
  addedBy: string;
  createdAt: string;
  checkedAt?: string;
}

export interface TodoItem {
  id: string;
  householdId: string;
  title: string;
  status: 'todo' | 'done';
  dueDate?: string;
  assignedTo?: string;
  completionMode: CompletionMode;
  recurrence: Recurrence;
  kind: 'task' | 'habit';
  mandatoryDaily?: boolean;
  energyHint?: EnergyBand;
  completions: MemberCompletion[];
}

export interface MorningCheckIn {
  id: string;
  householdId: string;
  userId: string;
  date: string;
  mood: number;
  energy: number;
}
