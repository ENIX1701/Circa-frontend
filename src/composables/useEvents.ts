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

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
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

  return (await response.json()) as T
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

  return {
    listEvents,
    getEvent,
    createEvent,
    activateEvent,
    closeEvent,
    requestDestruction,
    cancelDestruction,
  }
}
