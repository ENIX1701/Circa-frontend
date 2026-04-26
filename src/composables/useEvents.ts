export type EventStatus = 'draft' | 'active' | 'closed' | 'archived' | 'pending_destruction'
export type EventMembershipRole = 'owner' | 'organizer' | 'staff' | 'volunteer'

export interface EventRecord {
  id: string
  name: string
  slug: string
  description: string
  venue: string
  timezone: string
  starts_at: string
  ends_at: string
  status: EventStatus
  created_by_user_id: string
  current_user_role: EventMembershipRole
  destruction_requested_at: string | null
  created_at: string
  updated_at: string
}

export interface EventCollaboratorRecord {
  user_id: string
  name: string
  surname: string
  email: string
  phone: string
  role: EventMembershipRole
  created_at: string
}

export interface AddEventCollaboratorRequest {
  email: string
  role: EventMembershipRole
}

export interface UpdateEventCollaboratorRequest {
  role: EventMembershipRole
}

export interface CreateEventRequest {
  name: string
  slug: string
  description?: string
  venue: string
  timezone: string
  starts_at: string
  ends_at: string
}

export interface PlannerItemRecord {
  id: string
  event_id: string
  title: string
  notes: string
  position: number
  done: boolean
  created_at: string
  updated_at: string
}

export interface CreatePlannerItemRequest {
  title: string
  notes?: string
}

export interface UpdatePlannerItemRequest {
  title?: string
  notes?: string
  position?: number
  done?: boolean
}

export interface EventBrandingRecord {
  id: string | null,
  event_id: string
  event_name_override: string
  tagline: string
  primary_color: string
  secondary_color: string
  theme_mode: 'dark' | 'light'
  background_color: string
  notes: string
  created_at: string | null
  updated_at: string | null
}

export interface UpsertEventBrandingRequest {
  event_name_override: string
  tagline: string
  primary_color: string
  secondary_color: string
  theme_mode: 'dark' | 'light'
  background_color: string
  notes: string
}

export type SocialPostStatus = 'draft' | 'ready' | 'posted'

export interface SocialPostRecord {
  id: string
  event_id: string
  platform: string
  title: string
  body: string
  status: SocialPostStatus
  position: number
  created_at: string
  updated_at: string
}

export interface CreateSocialPostRequest {
  platform: string
  title: string
  body?: string
}

export interface UpdateSocialPostRequest {
  platform?: string
  title?: string
  body?: string
  status?: SocialPostStatus
  position?: number
}

export interface EventExportRecord {
  exported_at: string
  event: EventRecord
  branding: EventBrandingRecord
  planner_items: PlannerItemRecord[]
  social_posts: SocialPostRecord[]
  planner_timeline_items: PlannerTimelineItemRecord[]
}

export type PlannerTimelineItemType = 'task' | 'asset' | 'milestone'
export type PlannerTimelineStatus = 'planned' | 'in_progress' | 'blocked' | 'done'

export interface PlannerTimelineItemRecord {
  id: string
  event_id: string
  title: string
  item_type: PlannerTimelineItemType
  starts_at: string
  ends_at: string
  status: PlannerTimelineStatus
  owner: string
  notes: string
  color: string
  depends_on_item_id: string
  position: number
  created_at: string
  updated_at: string
}

export interface CreatePlannerTimelineItemRequest {
  title: string
  item_type: PlannerTimelineItemType
  starts_at: string
  ends_at: string
  status?: PlannerTimelineStatus
  owner?: string
  notes?: string
  color?: string
  depends_on_item_id?: string
}

export interface UpdatePlannerTimelineItemRequest {
  title?: string
  item_type?: PlannerTimelineItemType
  starts_at?: string
  ends_at?: string
  status?: PlannerTimelineStatus
  owner?: string
  notes?: string
  color?: string
  depends_on_item_id?: string
  position?: number
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = await response.json().catch(() => null)
    return body?.message ?? body?.error ?? 'Request failed QwQ'
  }

  return (await response.text()) || 'Request failed QwQ'
}

function getToken() {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('You must be signed in to continue QwQ')
  }

  return token
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers ?? {})
  headers.set('Authorization', `Bearer ${getToken()}`)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(path, {
    ...init,
    headers,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return response
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await request(path, init)
  return (await response.json()) as T
}

async function requestNoContent(path: string, init: RequestInit = {}): Promise<void> {
  await request(path, init)
}

const memoryCache = new Map<string, unknown>()
const inFlightRequests = new Map<string, Promise<unknown>>()

function eventPath(id: string) {
  return `/api/events/${encodeURIComponent(id)}`
}

function collaboratorsPath(eventId: string) {
  return `/api/events/${encodeURIComponent(eventId)}/collaborators`
}

function plannerItemsPath(eventId: string) {
  return `/api/events/${encodeURIComponent(eventId)}/planner-items`
}

function plannerTimelineItemsPath(eventId: string) {
  return `/api/events/${encodeURIComponent(eventId)}/planner-timeline-items`
}

function brandingPath(eventId: string) {
  return `/api/events/${encodeURIComponent(eventId)}/branding`
}

function socialPostsPath(eventId: string) {
  return `/api/events/${encodeURIComponent(eventId)}/social-posts`
}

function eventExportPath(eventId: string) {
  return `/api/events/${encodeURIComponent(eventId)}/export`
}

function getCached<T>(path: string): T | undefined {
  return memoryCache.get(path) as T | undefined 
}

function setCached<T>(path: string, value: T) {
  memoryCache.set(path, value)

  window.dispatchEvent(new CustomEvent('circa:cache-updated', {
    detail: { path, value },
  }))
}

function invalidateCached(path: string) {
  memoryCache.delete(path)
}

function sortByPosition<T extends { position: number }>(items: T[]) {
  return [...items].sort((a, b) => a.position - b.position)
}

function upsertCachedItem<T extends { id: string }>(path: string, item: T) {
  const cached = getCached<T[]>(path)

  if (!cached) return

  setCached(path, cached.map((current) => current.id === item.id ? item : current))
}

function upsertCachedPositionedItem<T extends { id: string, position: number }>(path: string, item: T) {
  const cached = getCached<T[]>(path)

  if (!cached) return

  const withoutCurrent = cached.filter((current) => current.id !== item.id)
  setCached(path, sortByPosition([...withoutCurrent, item]))
}

function removeCachedItem<T extends { id: string }>(path: string, itemId: string) {
  const cached = getCached<T[]>(path)

  if (!cached) return
  
  setCached(path, cached.filter((item) => item.id !== itemId))
}

function cacheEvent(event: EventRecord) {
  setCached(eventPath(event.id), event)
  upsertCachedItem('/api/events', event)
}

async function cachedRequestJson<T>(path: string): Promise<T> {
  const cached = getCached<T>(path)

  if (cached !== undefined) {
    if (!inFlightRequests.has(path)) {
      const refresh = requestJson<T>(path).then((fresh) => {
        setCached(path, fresh)
        return fresh
      }).finally(() => {inFlightRequests.delete(path)})

      inFlightRequests.set(path, refresh)
      void refresh.catch(() => {})
    }

    return cached
  }

  const existing = inFlightRequests.get(path) as Promise<T> | undefined

  if (existing) {
    return existing
  }

  const requestPromise = requestJson<T>(path).then((fresh) => {
    setCached(path, fresh)
    return fresh
  }).finally(() => {inFlightRequests.delete(path)})

  inFlightRequests.set(path, requestPromise)
  return requestPromise
}

function clearEventsCache() {
  memoryCache.clear()
  inFlightRequests.clear()
}

export const useEvents = () => {
  async function listEvents(): Promise<EventRecord[]> {
    return cachedRequestJson<EventRecord[]>('/api/events')
  }

  async function getEvent(id: string): Promise<EventRecord> {
    return cachedRequestJson<EventRecord>(eventPath(id))
  }

  async function createEvent(payload: CreateEventRequest): Promise<EventRecord> {
    const created = await requestJson<EventRecord>('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    setCached(eventPath(created.id), created)

    const cachedEvents = getCached<EventRecord[]>('/api/events')
    if (cachedEvents) {
      setCached('/api/events', [created, ...cachedEvents.filter((event) => event.id !== created.id)])
    }

    return created
  }

  async function activateEvent(id: string): Promise<EventRecord> {
    const updated = await requestJson<EventRecord>(`/api/events/${encodeURIComponent(id)}/activate`, {
      method: 'POST',
    })

    cacheEvent(updated)
    invalidateCached(eventExportPath(updated.id))

    return updated
  }

  async function closeEvent(id: string): Promise<EventRecord> {
    const updated = await requestJson<EventRecord>(`/api/events/${encodeURIComponent(id)}/close`, {
      method: 'POST',
    })

    cacheEvent(updated)
    invalidateCached(eventExportPath(updated.id))

    return updated
  }

  async function requestDestruction(id: string): Promise<EventRecord> {
    const updated = await requestJson<EventRecord>(`/api/events/${encodeURIComponent(id)}/request-destruction`, {
      method: 'POST',
    })

    cacheEvent(updated)
    invalidateCached(eventExportPath(updated.id))

    return updated
  }

  async function cancelDestruction(id: string): Promise<EventRecord> {
    const updated = await requestJson<EventRecord>(`/api/events/${encodeURIComponent(id)}/cancel-destruction`, {
      method: 'POST',
    })

    cacheEvent(updated)
    invalidateCached(eventExportPath(updated.id))

    return updated
  }

  async function listPlannerItems(eventId: string): Promise<PlannerItemRecord[]> {
    return cachedRequestJson<PlannerItemRecord[]>(plannerItemsPath(eventId))
  }

  async function createPlannerItem(
    eventId: string,
    payload: CreatePlannerItemRequest,
  ): Promise<PlannerItemRecord> {
    const created = await requestJson<PlannerItemRecord>(
      plannerItemsPath(eventId),
      { method: 'POST', body: JSON.stringify(payload) },
    )

    upsertCachedPositionedItem(plannerItemsPath(eventId), created)
    invalidateCached(eventExportPath(eventId))

    return created
  }

  async function updatePlannerItem(
    eventId: string,
    itemId: string,
    payload: UpdatePlannerItemRequest,
  ): Promise<PlannerItemRecord> {
    const updated = await requestJson<PlannerItemRecord>(
      `/api/events/${encodeURIComponent(eventId)}/planner-items/${encodeURIComponent(itemId)}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    )

    upsertCachedPositionedItem(plannerItemsPath(eventId), updated)
    invalidateCached(eventExportPath(eventId))

    return updated
  }

  async function deletePlannerItem(eventId: string, itemId: string): Promise<void> {
    await requestNoContent(
      `/api/events/${encodeURIComponent(eventId)}/planner-items/${encodeURIComponent(itemId)}`,
      { method: 'DELETE' },
    )

    removeCachedItem<PlannerItemRecord>(plannerItemsPath(eventId), itemId)
    invalidateCached(eventExportPath(eventId))
  }

  async function listPlannerTimelineItems(eventId: string): Promise<PlannerTimelineItemRecord[]> {
    return cachedRequestJson<PlannerTimelineItemRecord[]>(plannerTimelineItemsPath(eventId))
  }

  async function createPlannerTimelineItem(
    eventId: string,
    payload: CreatePlannerTimelineItemRequest,
  ): Promise<PlannerTimelineItemRecord> {
    const created = await requestJson<PlannerTimelineItemRecord>(
      `/api/events/${encodeURIComponent(eventId)}/planner-timeline-items`,
      { method: 'POST', body: JSON.stringify(payload) },
    )

    upsertCachedPositionedItem(plannerTimelineItemsPath(eventId), created)
    invalidateCached(eventExportPath(eventId))

    return created
  }

  async function updatePlannerTimelineItem(
    eventId: string,
    itemId: string,
    payload: UpdatePlannerTimelineItemRequest,
  ): Promise<PlannerTimelineItemRecord> {
    const updated = await requestJson<PlannerTimelineItemRecord>(
      `/api/events/${encodeURIComponent(eventId)}/planner-timeline-items/${encodeURIComponent(itemId)}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    )

    upsertCachedPositionedItem(plannerTimelineItemsPath(eventId), updated)
    invalidateCached(eventExportPath(eventId))

    return updated
  }

  async function deletePlannerTimelineItem(
    eventId: string,
    itemId: string
  ): Promise<void> {
    await requestNoContent(
      `/api/events/${encodeURIComponent(eventId)}/planner-timeline-items/${encodeURIComponent(itemId)}`,
      { method: 'DELETE' },
    )

    removeCachedItem<PlannerTimelineItemRecord>(plannerTimelineItemsPath(eventId), itemId)
    invalidateCached(eventExportPath(eventId))
  }

  async function getEventBranding(eventId: string): Promise<EventBrandingRecord> {
    return cachedRequestJson<EventBrandingRecord>(brandingPath(eventId))
  }

  async function upsertEventBranding(eventId: string, payload: UpsertEventBrandingRequest): Promise<EventBrandingRecord> {
    const branding = await requestJson<EventBrandingRecord>(
      brandingPath(eventId), {
        method: 'PUT', body: JSON.stringify(payload)
      }
    )

    setCached(brandingPath(eventId), branding)
    invalidateCached(eventExportPath(eventId))

    return branding
  }

  async function listSocialPosts(eventId: string): Promise<SocialPostRecord[]> {
    return cachedRequestJson<SocialPostRecord[]>(socialPostsPath(eventId))
  }

  async function createSocialPost(eventId: string, payload: CreateSocialPostRequest): Promise<SocialPostRecord> {
    const created = await requestJson<SocialPostRecord>(
      `/api/events/${encodeURIComponent(eventId)}/social-posts`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    )

    upsertCachedPositionedItem(socialPostsPath(eventId), created)
    invalidateCached(eventExportPath(eventId))

    return created
  }

  async function updateSocialPost(eventId: string, postId: string, payload: UpdateSocialPostRequest): Promise<SocialPostRecord> {
    const updated = await requestJson<SocialPostRecord>(
      `/api/events/${encodeURIComponent(eventId)}/social-posts/${encodeURIComponent(postId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    )

    upsertCachedPositionedItem(socialPostsPath(eventId), updated)
    invalidateCached(eventExportPath(eventId))

    return updated
  }

  async function deleteSocialPost(eventId: string, postId: string): Promise<void> {
    await requestNoContent(
      `/api/events/${encodeURIComponent(eventId)}/social-posts/${encodeURIComponent(postId)}`,
      {
        method: 'DELETE'
      }
    )

    removeCachedItem<SocialPostRecord>(socialPostsPath(eventId), postId)
    invalidateCached(eventExportPath(eventId))
  }

  async function archiveEvent(id: string): Promise<EventRecord> {
    const updated = await requestJson<EventRecord>(
      `/api/events/${encodeURIComponent(id)}/archive`,
      {
        method: 'POST'
      }
    )

    cacheEvent(updated)
    invalidateCached(eventExportPath(updated.id))

    return updated
  }

  async function getEventExport(id: string): Promise<EventExportRecord> {
    return cachedRequestJson<EventExportRecord>(eventExportPath(id))
  }

  async function listEventCollaborators(eventId: string): Promise<EventCollaboratorRecord[]> {
    return cachedRequestJson<EventCollaboratorRecord[]>(collaboratorsPath(eventId))
  }

  async function addEventCollaborator(eventId: string, payload: AddEventCollaboratorRequest): Promise<EventCollaboratorRecord> {
    const collaborator = await requestJson<EventCollaboratorRecord>(collaboratorsPath(eventId), { method: 'POST', body: JSON.stringify(payload) })

    const cached = getCached<EventCollaboratorRecord[]>(collaboratorsPath(eventId))
    if (cached) {
      setCached(collaboratorsPath(eventId), [
        ...cached.filter((item) => item.user_id !== collaborator.user_id), collaborator
      ])
    }

    invalidateCached(eventExportPath(eventId))
    return collaborator
  }

  async function updateEventCollaborator(eventId: string, userId: string, payload: UpdateEventCollaboratorRequest): Promise<EventCollaboratorRecord> {
    const collaborator = await requestJson<EventCollaboratorRecord>(`${collaboratorsPath(eventId)}/${encodeURIComponent(userId)}`, { method: 'PATCH', body: JSON.stringify(payload) })

    const cached = getCached<EventCollaboratorRecord[]>(collaboratorsPath(eventId))
    if (cached) {
      setCached(collaboratorsPath(eventId), [
        cached.map((item) => item.user_id !== collaborator.user_id ? collaborator : item)
      ])
    }

    invalidateCached(eventExportPath(eventId))
    return collaborator
  }

  async function deleteEventCollaborator(eventId: string, userId: string): Promise<void> {
    const collaborator = await requestJson<EventCollaboratorRecord>(`${collaboratorsPath(eventId)}/${encodeURIComponent(userId)}`, { method: 'DELETE' })

    const cached = getCached<EventCollaboratorRecord[]>(collaboratorsPath(eventId))
    if (cached) {
      setCached(collaboratorsPath(eventId), [
        cached.filter((item) => item.user_id !== userId)
      ])
    }

    invalidateCached(eventExportPath(eventId))
  }

  return {
    listEvents,
    getEvent,
    createEvent,
    activateEvent,
    closeEvent,
    requestDestruction,
    cancelDestruction,
    listPlannerItems,
    createPlannerItem,
    updatePlannerItem,
    deletePlannerItem,
    getEventBranding,
    upsertEventBranding,
    listSocialPosts,
    createSocialPost,
    updateSocialPost,
    deleteSocialPost,
    archiveEvent,
    getEventExport,
    listPlannerTimelineItems,
    createPlannerTimelineItem,
    updatePlannerTimelineItem,
    deletePlannerTimelineItem,
    clearEventsCache,
    listEventCollaborators,
    addEventCollaborator,
    updateEventCollaborator,
    deleteEventCollaborator,
  }
}
