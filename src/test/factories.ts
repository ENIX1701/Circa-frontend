import type {
  EventBrandingRecord,
  EventCollaboratorRecord,
  EventExportRecord,
  EventRecord,
  PlannerItemRecord,
  PlannerTimelineItemRecord,
  SocialPostRecord,
} from '@/composables/useEvents'

export function eventFactory(overrides: Partial<EventRecord> = {}): EventRecord {
  return {
    id: 'evt-1',
    name: 'Spring Summit',
    slug: 'spring-summit',
    description: 'Planning weekend',
    venue: 'Expo Hall',
    timezone: 'Europe/Warsaw',
    starts_at: '2026-05-15T09:00:00Z',
    ends_at: '2026-05-16T18:00:00Z',
    status: 'draft',
    created_by_user_id: 'user-1',
    current_user_role: 'owner',
    destruction_requested_at: null,
    created_at: '2026-04-22T10:00:00Z',
    updated_at: '2026-04-22T10:00:00Z',
    ...overrides,
  }
}

export function collaboratorFactory(
  overrides: Partial<EventCollaboratorRecord> = {},
): EventCollaboratorRecord {
  return {
    user_id: 'user-1',
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    phone: '+48 123 456 789',
    role: 'staff',
    created_at: '2026-04-22T10:00:00Z',
    ...overrides,
  }
}

export function plannerItemFactory(overrides: Partial<PlannerItemRecord> = {}): PlannerItemRecord {
  return {
    id: 'plan-1',
    event_id: 'evt-1',
    title: 'Book chairs',
    notes: 'Need 200 chairs',
    position: 1,
    done: false,
    created_at: '2026-04-22T10:00:00Z',
    updated_at: '2026-04-22T10:00:00Z',
    ...overrides,
  }
}

export function timelineItemFactory(
  overrides: Partial<PlannerTimelineItemRecord> = {},
): PlannerTimelineItemRecord {
  return {
    id: 'tl-1',
    event_id: 'evt-1',
    title: 'Build landing stage',
    item_type: 'task',
    starts_at: '2026-05-15T09:00:00Z',
    ends_at: '2026-05-16T18:00:00Z',
    status: 'planned',
    owner: 'Ops',
    notes: 'Coordinate with venue',
    color: '#38bdf8',
    depends_on_item_id: '',
    assigned_user_id: 'user-1',
    position: 1,
    created_at: '2026-04-22T10:00:00Z',
    updated_at: '2026-04-22T10:00:00Z',
    ...overrides,
  }
}

export function brandingFactory(overrides: Partial<EventBrandingRecord> = {}): EventBrandingRecord {
  return {
    id: 'brand-1',
    event_id: 'evt-1',
    event_name_override: 'Summit Prime',
    tagline: 'Make the launch count',
    primary_color: '#123456',
    secondary_color: '#abcdef',
    theme_mode: 'dark',
    background_color: '#111111',
    notes: 'Keep it crisp',
    created_at: '2026-04-22T10:00:00Z',
    updated_at: '2026-04-22T10:00:00Z',
    ...overrides,
  }
}

export function socialPostFactory(overrides: Partial<SocialPostRecord> = {}): SocialPostRecord {
  return {
    id: 'post-1',
    event_id: 'evt-1',
    platform: 'Instagram',
    title: 'Launch teaser',
    body: 'Doors open soon',
    status: 'draft',
    position: 1,
    created_at: '2026-04-22T10:00:00Z',
    updated_at: '2026-04-22T10:00:00Z',
    ...overrides,
  }
}

export function eventExportFactory(overrides: Partial<EventExportRecord> = {}): EventExportRecord {
  return {
    exported_at: '2026-04-22T11:00:00Z',
    event: eventFactory(),
    branding: brandingFactory(),
    planner_items: [plannerItemFactory()],
    social_posts: [socialPostFactory()],
    planner_timeline_items: [timelineItemFactory()],
    ...overrides,
  }
}
