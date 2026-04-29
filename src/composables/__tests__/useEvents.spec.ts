import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useEvents } from '@/composables/useEvents'
import {
  brandingFactory,
  collaboratorFactory,
  eventExportFactory,
  eventFactory,
  plannerItemFactory,
  socialPostFactory,
  timelineItemFactory,
} from '@/test/factories'

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

function textResponse(body: string, init: ResponseInit = {}) {
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
    ...init,
  })
}

function lastRequestInit() {
  const calls = fetchMock.mock.calls
  return calls[calls.length - 1]?.[1] as RequestInit
}

function lastRequestBody() {
  return JSON.parse(String(lastRequestInit().body)) as Record<string, unknown>
}

function lastRequestHeaders() {
  return lastRequestInit().headers as Headers
}

function setToken() {
  localStorage.setItem('token', 'token-123')
}

describe('useEvents', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
    localStorage.clear()
    setToken()
    useEvents().clearEventsCache()
  })

  it('requires a token before making authenticated API calls', async () => {
    localStorage.clear()

    await expect(useEvents().listEvents()).rejects.toThrow('You must be signed in')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends auth and json headers for write requests', async () => {
    const created = eventFactory({ id: 'evt-created' })
    fetchMock.mockResolvedValueOnce(jsonResponse(created))

    await expect(
      useEvents().createEvent({
        name: 'Spring Summit',
        slug: 'spring-summit',
        description: 'Planning weekend',
        venue: 'Expo Hall',
        timezone: 'Europe/Warsaw',
        starts_at: '2026-05-15T09:00:00+02:00',
        ends_at: '2026-05-16T18:00:00+02:00',
      }),
    ).resolves.toEqual(created)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(lastRequestHeaders().get('Authorization')).toBe('Bearer token-123')
    expect(lastRequestHeaders().get('Content-Type')).toBe('application/json')
    expect(lastRequestBody()).toMatchObject({
      name: 'Spring Summit',
      slug: 'spring-summit',
      venue: 'Expo Hall',
    })
  })

  it('surfaces json and text API errors', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'No access' }, { status: 403 }))
      .mockResolvedValueOnce(textResponse('Plain failure', { status: 500 }))

    await expect(useEvents().listEvents()).rejects.toThrow('No access')
    await expect(useEvents().getEvent('evt-1')).rejects.toThrow('Plain failure')
  })

  it('caches reads, refreshes stale cache in the background, and emits cache updates', async () => {
    const cached = [eventFactory({ id: 'evt-1', name: 'Cached event' })]
    const fresh = [eventFactory({ id: 'evt-2', name: 'Fresh event' })]
    const updates: Array<{ path: string; value: unknown }> = []

    window.addEventListener('circa:cache-updated', ((event: CustomEvent) => {
      updates.push(event.detail)
    }) as EventListener)

    fetchMock.mockResolvedValueOnce(jsonResponse(cached)).mockResolvedValueOnce(jsonResponse(fresh))

    await expect(useEvents().listEvents()).resolves.toEqual(cached)
    await expect(useEvents().listEvents()).resolves.toEqual(cached)
    await vi.waitFor(() => expect(updates[updates.length - 1]?.value).toEqual(fresh))

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(updates.map((update) => update.path)).toContain('/api/events')
  })

  it('deduplicates concurrent reads for the same path', async () => {
    const event = eventFactory()
    fetchMock.mockResolvedValueOnce(jsonResponse(event))

    const first = useEvents().getEvent('evt-1')
    const second = useEvents().getEvent('evt-1')

    await expect(Promise.all([first, second])).resolves.toEqual([event, event])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/events/evt-1', expect.any(Object))
  })

  it('keeps the event list cache current after creating an event', async () => {
    const existing = eventFactory({ id: 'evt-old', name: 'Old event' })
    const created = eventFactory({ id: 'evt-new', name: 'New event' })

    fetchMock
      .mockResolvedValueOnce(jsonResponse([existing]))
      .mockResolvedValueOnce(jsonResponse(created))
      .mockResolvedValueOnce(jsonResponse([created, existing]))

    await useEvents().listEvents()
    await useEvents().createEvent({
      name: 'New event',
      slug: 'new-event',
      venue: 'Main Hall',
      timezone: 'UTC',
      starts_at: '2026-05-15T09:00:00Z',
      ends_at: '2026-05-15T10:00:00Z',
    })

    await expect(useEvents().listEvents()).resolves.toEqual([created, existing])
  })

  it('invalidates cached exports when event lifecycle changes', async () => {
    const draftExport = eventExportFactory({ exported_at: '2026-04-22T11:00:00Z' })
    const activated = eventFactory({ status: 'active' })
    const activeExport = eventExportFactory({ exported_at: '2026-04-22T12:00:00Z' })

    fetchMock
      .mockResolvedValueOnce(jsonResponse(draftExport))
      .mockResolvedValueOnce(jsonResponse(activated))
      .mockResolvedValueOnce(jsonResponse(activeExport))

    await expect(useEvents().getEventExport('evt-1')).resolves.toEqual(draftExport)
    await expect(useEvents().activateEvent('evt-1')).resolves.toEqual(activated)
    await expect(useEvents().getEventExport('evt-1')).resolves.toEqual(activeExport)

    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      '/api/events/evt-1/export',
      '/api/events/evt-1/activate',
      '/api/events/evt-1/export',
    ])
  })

  it('updates planner item caches for create, update, and delete operations', async () => {
    const existing = plannerItemFactory({ id: 'plan-2', position: 2 })
    const created = plannerItemFactory({ id: 'plan-1', position: 1 })
    const updated = plannerItemFactory({ id: 'plan-1', title: 'Book tables', position: 3 })

    fetchMock
      .mockResolvedValueOnce(jsonResponse([existing]))
      .mockResolvedValueOnce(jsonResponse(created))
      .mockResolvedValueOnce(jsonResponse([created, existing]))
      .mockResolvedValueOnce(jsonResponse(updated))
      .mockResolvedValueOnce(jsonResponse([existing, updated]))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse([updated]))

    await useEvents().listPlannerItems('evt-1')
    await useEvents().createPlannerItem('evt-1', { title: 'Book chairs' })
    await expect(useEvents().listPlannerItems('evt-1')).resolves.toEqual([created, existing])

    await useEvents().updatePlannerItem('evt-1', 'plan-1', { title: 'Book tables' })
    await expect(useEvents().listPlannerItems('evt-1')).resolves.toEqual([existing, updated])

    await useEvents().deletePlannerItem('evt-1', 'plan-2')
    await expect(useEvents().listPlannerItems('evt-1')).resolves.toEqual([updated])
  })

  it('uses encoded planner timeline endpoints and sorted timeline caches', async () => {
    const existing = timelineItemFactory({ id: 'tl/2', position: 2 })
    const created = timelineItemFactory({ id: 'tl/1', position: 1 })
    const updated = timelineItemFactory({ id: 'tl/1', status: 'done', position: 3 })

    fetchMock
      .mockResolvedValueOnce(jsonResponse([existing]))
      .mockResolvedValueOnce(jsonResponse(created))
      .mockResolvedValueOnce(jsonResponse([created, existing]))
      .mockResolvedValueOnce(jsonResponse(updated))
      .mockResolvedValueOnce(jsonResponse([existing, updated]))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse([updated]))

    await useEvents().listPlannerTimelineItems('evt 1')
    await useEvents().createPlannerTimelineItem('evt 1', {
      title: 'Build stage',
      item_type: 'task',
      starts_at: '2026-05-15T09:00:00Z',
      ends_at: '2026-05-16T09:00:00Z',
    })
    await expect(useEvents().listPlannerTimelineItems('evt 1')).resolves.toEqual([
      created,
      existing,
    ])

    await useEvents().updatePlannerTimelineItem('evt 1', 'tl/1', { status: 'done' })
    await expect(useEvents().listPlannerTimelineItems('evt 1')).resolves.toEqual([
      existing,
      updated,
    ])

    await useEvents().deletePlannerTimelineItem('evt 1', 'tl/2')
    await expect(useEvents().listPlannerTimelineItems('evt 1')).resolves.toEqual([updated])

    expect(fetchMock.mock.calls.map((call) => call[0])).toContain(
      '/api/events/evt%201/planner-timeline-items/tl%2F1',
    )
  })

  it('updates branding cache through upsert', async () => {
    const initial = brandingFactory({ tagline: 'Initial' })
    const saved = brandingFactory({ tagline: 'Saved' })

    fetchMock
      .mockResolvedValueOnce(jsonResponse(initial))
      .mockResolvedValueOnce(jsonResponse(saved))
      .mockResolvedValueOnce(jsonResponse(saved))

    await useEvents().getEventBranding('evt-1')
    await useEvents().upsertEventBranding('evt-1', {
      event_name_override: 'Summit Prime',
      tagline: 'Saved',
      primary_color: '#123456',
      secondary_color: '#abcdef',
      theme_mode: 'dark',
      background_color: '#111111',
      notes: '',
    })

    await expect(useEvents().getEventBranding('evt-1')).resolves.toEqual(saved)
    expect(fetchMock.mock.calls[1]![0]).toBe('/api/events/evt-1/branding')
    expect((fetchMock.mock.calls[1]![1] as RequestInit).method).toBe('PUT')
  })

  it('updates social post caches for create, status update, and delete', async () => {
    const existing = socialPostFactory({ id: 'post-2', position: 2 })
    const created = socialPostFactory({ id: 'post-1', position: 1 })
    const updated = socialPostFactory({ id: 'post-1', status: 'ready', position: 3 })

    fetchMock
      .mockResolvedValueOnce(jsonResponse([existing]))
      .mockResolvedValueOnce(jsonResponse(created))
      .mockResolvedValueOnce(jsonResponse([created, existing]))
      .mockResolvedValueOnce(jsonResponse(updated))
      .mockResolvedValueOnce(jsonResponse([existing, updated]))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse([updated]))

    await useEvents().listSocialPosts('evt-1')
    await useEvents().createSocialPost('evt-1', { platform: 'Instagram', title: 'Teaser' })
    await expect(useEvents().listSocialPosts('evt-1')).resolves.toEqual([created, existing])

    await useEvents().updateSocialPost('evt-1', 'post-1', { status: 'ready' })
    await expect(useEvents().listSocialPosts('evt-1')).resolves.toEqual([existing, updated])

    await useEvents().deleteSocialPost('evt-1', 'post-2')
    await expect(useEvents().listSocialPosts('evt-1')).resolves.toEqual([updated])
  })

  it('updates collaborator caches for add, role change, and delete', async () => {
    const ada = collaboratorFactory({ user_id: 'user-1', role: 'staff' })
    const grace = collaboratorFactory({
      user_id: 'user-2',
      name: 'Grace',
      surname: 'Hopper',
      email: 'grace@example.com',
      role: 'volunteer',
    })
    const updatedGrace = collaboratorFactory({
      user_id: 'user-2',
      name: 'Grace',
      surname: 'Hopper',
      email: 'grace@example.com',
      role: 'organizer',
    })

    fetchMock
      .mockResolvedValueOnce(jsonResponse([ada]))
      .mockResolvedValueOnce(jsonResponse(grace))
      .mockResolvedValueOnce(jsonResponse([ada, grace]))
      .mockResolvedValueOnce(jsonResponse(updatedGrace))
      .mockResolvedValueOnce(jsonResponse([ada, updatedGrace]))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse([updatedGrace]))

    await useEvents().listEventCollaborators('evt-1')
    await useEvents().addEventCollaborator('evt-1', {
      email: 'grace@example.com',
      role: 'volunteer',
    })
    await expect(useEvents().listEventCollaborators('evt-1')).resolves.toEqual([ada, grace])

    await useEvents().updateEventCollaborator('evt-1', 'user-2', { role: 'organizer' })
    await expect(useEvents().listEventCollaborators('evt-1')).resolves.toEqual([ada, updatedGrace])

    await useEvents().deleteEventCollaborator('evt-1', 'user-1')
    await expect(useEvents().listEventCollaborators('evt-1')).resolves.toEqual([updatedGrace])
  })

  it('archives, closes, requests destruction, and cancels destruction through explicit endpoints', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(eventFactory({ status: 'closed' })))
      .mockResolvedValueOnce(jsonResponse(eventFactory({ status: 'pending_destruction' })))
      .mockResolvedValueOnce(jsonResponse(eventFactory({ status: 'closed' })))
      .mockResolvedValueOnce(jsonResponse(eventFactory({ status: 'archived' })))

    await useEvents().closeEvent('evt-1')
    await useEvents().requestDestruction('evt-1')
    await useEvents().cancelDestruction('evt-1')
    await useEvents().archiveEvent('evt-1')

    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      '/api/events/evt-1/close',
      '/api/events/evt-1/request-destruction',
      '/api/events/evt-1/cancel-destruction',
      '/api/events/evt-1/archive',
    ])
  })
})
