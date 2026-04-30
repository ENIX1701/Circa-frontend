import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const pushMock = vi.fn()
const pushToastMock = vi.fn()
const listEventsMock = vi.fn()
const createEventMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('@/composables/useEvents', () => ({
  useEvents: () => ({
    listEvents: listEventsMock,
    createEvent: createEventMock,
  }),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    pushToast: pushToastMock,
  }),
}))

import EventsHub from '@/views/EventsHub.vue'

const sampleEvent = {
  id: 'evt-1',
  name: 'Spring Summit',
  slug: 'spring-summit',
  description: 'Planning weekend',
  venue: 'Expo Hall',
  timezone: 'Europe/Warsaw',
  starts_at: '2026-05-15T09:00:00+02:00',
  ends_at: '2026-05-16T18:00:00+02:00',
  status: 'draft',
  created_by_user_id: 'user-1',
  current_user_role: 'owner',
  destruction_requested_at: null,
  created_at: '2026-04-22T10:00:00Z',
  updated_at: '2026-04-22T10:00:00Z',
}

function mountHub() {
  return mount(EventsHub)
}

describe('EventsHub.vue', () => {
  beforeEach(() => {
    pushMock.mockReset()
    pushToastMock.mockReset()
    listEventsMock.mockReset()
    createEventMock.mockReset()
  })

  it('loads the current user events on mount', async () => {
    listEventsMock.mockResolvedValueOnce([sampleEvent])

    const wrapper = mountHub()
    await flushPromises()

    expect(listEventsMock).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Spring Summit')
    expect(wrapper.text()).toContain('Planning weekend')
  })

  it('creates an event and navigates to the detail page', async () => {
    listEventsMock.mockResolvedValueOnce([])
    createEventMock.mockResolvedValueOnce(sampleEvent)

    const wrapper = mountHub()
    await flushPromises()

    await wrapper.find('#event-name').setValue('Spring Summit')
    await wrapper.find('#event-slug').setValue('spring-summit')
    await wrapper.find('#event-description').setValue('Planning weekend')
    await wrapper.find('#event-venue').setValue('Expo Hall')
    await wrapper.find('#event-timezone').setValue('Europe/Warsaw')
    await wrapper.find('#event-starts-at').setValue('2026-05-15T09:00')
    await wrapper.find('#event-ends-at').setValue('2026-05-16T18:00')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(createEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Spring Summit',
        slug: 'spring-summit',
        description: 'Planning weekend',
        venue: 'Expo Hall',
        timezone: 'Europe/Warsaw',
      }),
    )
    expect(createEventMock.mock.calls[0]?.[0].starts_at).toMatch(
      /^2026-05-15T09:00:00[+-]\d{2}:\d{2}$/,
    )
    expect(createEventMock.mock.calls[0]?.[0].ends_at).toMatch(
      /^2026-05-16T18:00:00[+-]\d{2}:\d{2}$/,
    )

    expect(pushToastMock).toHaveBeenCalledWith({
      tone: 'success',
      title: 'Event created',
      description: 'Spring Summit is ready to plan :3',
    })
    expect(pushMock).toHaveBeenCalledWith({
      name: 'event-detail',
      params: { id: 'spring-summit' },
    })
  })
})
