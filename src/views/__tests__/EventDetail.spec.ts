import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const routeMock: { params: Record<string, string> } = {
  params: { id: 'evt-1' },
}

const getEventMock = vi.fn()
const activateEventMock = vi.fn()
const closeEventMock = vi.fn()
const requestDestructionMock = vi.fn()
const cancelDestructionMock = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('@/composables/useEvents', () => ({
  useEvents: () => ({
    getEvent: getEventMock,
    activateEvent: activateEventMock,
    closeEvent: closeEventMock,
    requestDestruction: requestDestructionMock,
    cancelDestruction: cancelDestructionMock,
  }),
}))

import EventDetail from '@/views/EventDetail.vue'

const baseEvent = {
  id: 'evt-1',
  name: 'Spring Summit',
  slug: 'spring-summit',
  description: 'Planning weekend',
  venue: 'Expo Hall',
  timezone: 'Europe/Warsaw',
  starts_at_local: '2026-05-15T09:00:00+02:00',
  ends_at_local: '2026-05-16T18:00:00+02:00',
  status: 'draft',
  created_by_user_id: 'user-1',
  current_user_role: 'owner',
  destruction_requested_at: null,
  created_at: '2026-04-22T10:00:00Z',
  updated_at: '2026-04-22T10:00:00Z',
}

function mountDetail() {
  return mount(EventDetail, {
    global: {
      stubs: {
        RouterLink: {
          name: 'RouterLink',
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

describe('EventDetail.vue', () => {
  beforeEach(() => {
    routeMock.params = { id: 'evt-1' }
    getEventMock.mockReset()
    activateEventMock.mockReset()
    closeEventMock.mockReset()
    requestDestructionMock.mockReset()
    cancelDestructionMock.mockReset()
  })

  it('loads the event detail on mount', async () => {
    getEventMock.mockResolvedValueOnce(baseEvent)

    const wrapper = mountDetail()
    await flushPromises()

    expect(getEventMock).toHaveBeenCalledWith('evt-1')
    expect(wrapper.text()).toContain('Spring Summit')
    expect(wrapper.text()).toContain('Planning weekend')
  })

  it('activates a draft event for an owner', async () => {
    getEventMock.mockResolvedValueOnce(baseEvent)
    activateEventMock.mockResolvedValueOnce({
      ...baseEvent,
      status: 'active',
    })

    const wrapper = mountDetail()
    await flushPromises()

    expect(wrapper.find('[data-testid="activate-event"]').exists()).toBe(true)

    await wrapper.find('[data-testid="activate-event"]').trigger('click')
    await flushPromises()

    expect(activateEventMock).toHaveBeenCalledWith('evt-1')
    expect(wrapper.text()).toContain('Active')
  })
})
