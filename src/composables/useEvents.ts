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
  notes: string
  created_at: string | null
  updated_at: string | null
}

export interface UpsertEventBrandingRequest {
  event_name_override: string
  tagline: string
  primary_color: string
  secondary_color: string
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

export const useEvents = () => {
  async function listEvents(): Promise<EventRecord[]> {
    return requestJson<EventRecord[]>('/api/events')
  }

  async function getEvent(id: string): Promise<EventRecord> {
    return requestJson<EventRecord>(`/api/events/${encodeURIComponent(id)}`)
  }

  async function createEvent(payload: CreateEventRequest): Promise<EventRecord> {
    return requestJson<EventRecord>('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async function activateEvent(id: string): Promise<EventRecord> {
    return requestJson<EventRecord>(`/api/events/${encodeURIComponent(id)}/activate`, {
      method: 'POST',
    })
  }

  async function closeEvent(id: string): Promise<EventRecord> {
    return requestJson<EventRecord>(`/api/events/${encodeURIComponent(id)}/close`, {
      method: 'POST',
    })
  }

  async function requestDestruction(id: string): Promise<EventRecord> {
    return requestJson<EventRecord>(`/api/events/${encodeURIComponent(id)}/request-destruction`, {
      method: 'POST',
    })
  }

  async function cancelDestruction(id: string): Promise<EventRecord> {
    return requestJson<EventRecord>(`/api/events/${encodeURIComponent(id)}/cancel-destruction`, {
      method: 'POST',
    })
  }

  async function listPlannerItems(eventId: string): Promise<PlannerItemRecord[]> {
    return requestJson<PlannerItemRecord[]>(
      `/api/events/${encodeURIComponent(eventId)}/planner-items`,
    )
  }

  async function createPlannerItem(
    eventId: string,
    payload: CreatePlannerItemRequest,
  ): Promise<PlannerItemRecord> {
    return requestJson<PlannerItemRecord>(
      `/api/events/${encodeURIComponent(eventId)}/planner-items`,
      { method: 'POST', body: JSON.stringify(payload) },
    )
  }

  async function updatePlannerItem(
    eventId: string,
    itemId: string,
    payload: UpdatePlannerItemRequest,
  ): Promise<PlannerItemRecord> {
    return requestJson<PlannerItemRecord>(
      `/api/events/${encodeURIComponent(eventId)}/planner-items/${encodeURIComponent(itemId)}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    )
  }

  async function deletePlannerItem(eventId: string, itemId: string): Promise<void> {
    return requestNoContent(
      `/api/events/${encodeURIComponent(eventId)}/planner-items/${encodeURIComponent(itemId)}`,
      { method: 'DELETE' },
    )
  }

  async function getEventBranding(eventId: string): Promise<EventBrandingRecord> {
    return requestJson<EventBrandingRecord>(
      `/api/events/${encodeURIComponent(eventId)}/branding`
    )
  }

  async function upsertEventBranding(eventId: string, payload: UpsertEventBrandingRequest): Promise<EventBrandingRecord> {
    return requestJson<EventBrandingRecord>(
      `/api/events/${encodeURIComponent(eventId)}/branding`, {
        method: 'PUT', body: JSON.stringify(payload)
      }
    )
  }

  async function listSocialPosts(eventId: string): Promise<SocialPostRecord[]> {
    return requestJson<SocialPostRecord[]>(
      `/api/events/${encodeURIComponent(eventId)}/social-posts`
    )
  }

  async function createSocialPost(eventId: string, payload: CreateSocialPostRequest): Promise<SocialPostRecord> {
    return requestJson<SocialPostRecord>(
      `/api/events/${encodeURIComponent(eventId)}/social-posts`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    )
  }

  async function updateSocialPost(eventId: string, postId: string, payload: UpdateSocialPostRequest): Promise<SocialPostRecord> {
    return requestJson<SocialPostRecord>(
      `/api/events/${encodeURIComponent(eventId)}/social-posts/${encodeURIComponent(postId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    )
  }

  async function deleteSocialPost(eventId: string, postId: string): Promise<void> {
    return requestNoContent(
      `/api/events/${encodeURIComponent(eventId)}/social-posts/${encodeURIComponent(postId)}`,
      {
        method: 'DELETE'
      }
    )
  }

  async function archiveEvent(id: string): Promise<EventRecord> {
    return requestJson<EventRecord>(
      `/api/events/${encodeURIComponent(id)}/archive`,
      {
        method: 'POST'
      }
    )
  }

  async function getEventExport(id: string): Promise<EventExportRecord> {
    return requestJson<EventExportRecord>(
      `/api/events/${encodeURIComponent(id)}/export`
    )
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
  }
}
