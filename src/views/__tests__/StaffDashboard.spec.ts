import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import StaffDashboard from '@/views/StaffDashboard.vue'
import { collaboratorFactory, timelineItemFactory } from '@/test/factories'

const routeMock: { params: Record<string, string | undefined> } = {
  params: { id: 'evt-1' },
}

const listEventCollaboratorsMock = vi.fn()
const listPlannerTimelineItemsMock = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('@/composables/useEvents', () => ({
  useEvents: () => ({
    listEventCollaborators: listEventCollaboratorsMock,
    listPlannerTimelineItems: listPlannerTimelineItemsMock,
  }),
}))

describe('StaffDashboard.vue', () => {
  beforeEach(() => {
    routeMock.params = { id: 'evt-1' }
    listEventCollaboratorsMock.mockReset().mockResolvedValue([
      collaboratorFactory({ user_id: 'user-1' }),
      collaboratorFactory({
        user_id: 'user-2',
        name: 'Grace',
        surname: 'Hopper',
        email: 'grace@example.com',
      }),
    ])
    listPlannerTimelineItemsMock
      .mockReset()
      .mockResolvedValue([
        timelineItemFactory({ id: 'tl-1', assigned_user_id: 'user-1', status: 'done' }),
        timelineItemFactory({ id: 'tl-2', assigned_user_id: 'user-2', status: 'blocked' }),
        timelineItemFactory({ id: 'tl-3', assigned_user_id: '', status: 'planned' }),
      ])
  })

  it('loads staff workload, counts assigned and blocked items, and shows unassigned work', async () => {
    const wrapper = mount(StaffDashboard)
    await flushPromises()

    expect(listEventCollaboratorsMock).toHaveBeenCalledWith('evt-1')
    expect(listPlannerTimelineItemsMock).toHaveBeenCalledWith('evt-1')
    expect(wrapper.text()).toContain('Team')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('Assigned')
    expect(wrapper.text()).toContain('Blocked')
    expect(wrapper.text()).toContain('Ada Lovelace')
    expect(wrapper.text()).toContain('Grace Hopper')
    expect(wrapper.text()).toContain('Needs a person')
  })

  it('handles missing event id with empty local state', async () => {
    routeMock.params = {}

    const wrapper = mount(StaffDashboard)
    await flushPromises()

    expect(listEventCollaboratorsMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('No collaborators yet')
    expect(wrapper.text()).toContain('Everything has an owner')
  })

  it('shows load errors', async () => {
    listPlannerTimelineItemsMock.mockRejectedValueOnce(new Error('Cannot load staff'))

    const wrapper = mount(StaffDashboard)
    await flushPromises()

    expect(wrapper.text()).toContain('Cannot load staff')
  })
})
