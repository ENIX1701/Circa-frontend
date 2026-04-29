import type {
  EventBrandingRecord,
  EventMembershipRole,
  PlannerTimelineItemType,
  PlannerTimelineStatus,
  SocialPostStatus,
} from '@/composables/useEvents'

export const roleOptions: Array<{ label: string; value: EventMembershipRole }> = [
  { label: 'organizer', value: 'organizer' },
  { label: 'staff', value: 'staff' },
  { label: 'volunteer', value: 'volunteer' },
  { label: 'owner', value: 'owner' },
]

export const socialPostStatusOptions: Array<{ label: string; value: SocialPostStatus }> = [
  { label: 'draft', value: 'draft' },
  { label: 'ready', value: 'ready' },
  { label: 'posted', value: 'posted' },
]

export const plannerTimelineTypeOptions: Array<{ label: string; value: PlannerTimelineItemType }> =
  [
    { label: 'task', value: 'task' },
    { label: 'asset', value: 'asset' },
    { label: 'milestone', value: 'milestone' },
  ]

export const plannerTimelineStatusOptions: Array<{ label: string; value: PlannerTimelineStatus }> =
  [
    { label: 'planned', value: 'planned' },
    { label: 'in progress', value: 'in_progress' },
    { label: 'blocked', value: 'blocked' },
    { label: 'done', value: 'done' },
  ]

export const themeOptions: Array<{ label: string; value: EventBrandingRecord['theme_mode'] }> = [
  { label: 'dark', value: 'dark' },
  { label: 'light', value: 'light' },
]
