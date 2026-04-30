import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PlannerDashboard from '@/views/PlannerDashboard.vue'
import TimelineBoard from '@/components/planner/TimelineBoard.vue'
import TimelineCreatePanel from '@/components/planner/TimelineCreatePanel.vue'
import TimelineItemList from '@/components/planner/TimelineItemList.vue'
import { collaboratorFactory, timelineItemFactory } from '@/test/factories'
import type { TimelineItemFormPayload } from '@/components/planner/TimelineItemForm.vue'

const routeMock: { params: Record<string, string | undefined> } = {
  params: { id: 'evt-1' },
}

const listEventCollaboratorsMock = vi.fn()
const listPlannerTimelineItemsMock = vi.fn()
const createPlannerTimelineItemMock = vi.fn()
const updatePlannerTimelineItemMock = vi.fn()
const deletePlannerTimelineItemMock = vi.fn()
const pushToastMock = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('@/composables/useEvents', () => ({
  useEvents: () => ({
    listEventCollaborators: listEventCollaboratorsMock,
    listPlannerTimelineItems: listPlannerTimelineItemsMock,
    createPlannerTimelineItem: createPlannerTimelineItemMock,
    updatePlannerTimelineItem: updatePlannerTimelineItemMock,
    deletePlannerTimelineItem: deletePlannerTimelineItemMock,
  }),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    pushToast: pushToastMock,
  }),
}))

const collaborator = collaboratorFactory()
const item = timelineItemFactory()

const formPayload: TimelineItemFormPayload = {
  title: '  Build stage  ',
  item_type: 'task',
  starts_at_local: '2026-05-15T09:00',
  ends_at_local: '2026-05-15T17:00',
  status: 'planned',
  owner: '  Ada Lovelace  ',
  color: '#123456',
  notes: '  Bring truss  ',
  assigned_user_id: 'user-1',
}

function mountDashboard() {
  return mount(PlannerDashboard)
}

describe('PlannerDashboard.vue', () => {
  beforeEach(() => {
    routeMock.params = { id: 'evt-1' }
    listEventCollaboratorsMock.mockReset().mockResolvedValue([collaborator])
    listPlannerTimelineItemsMock.mockReset().mockResolvedValue([item])
    createPlannerTimelineItemMock.mockReset()
    updatePlannerTimelineItemMock.mockReset()
    deletePlannerTimelineItemMock.mockReset()
    pushToastMock.mockReset()
  })

  it('loads timeline items and collaborators on mount', async () => {
    const wrapper = mountDashboard()
    await flushPromises()

    expect(listPlannerTimelineItemsMock).toHaveBeenCalledWith('evt-1')
    expect(listEventCollaboratorsMock).toHaveBeenCalledWith('evt-1')
    expect(wrapper.text()).toContain('Build landing stage')
    expect(wrapper.text()).toContain('Ada Lovelace')
  })

  it('creates a timeline item with trimmed and local-date payload fields', async () => {
    const created = timelineItemFactory({ id: 'tl-new', title: 'Build stage', position: 0 })
    createPlannerTimelineItemMock.mockResolvedValueOnce(created)

    const wrapper = mountDashboard()
    await flushPromises()
    wrapper.findComponent(TimelineCreatePanel).vm.$emit('create', formPayload)
    await flushPromises()

    expect(createPlannerTimelineItemMock).toHaveBeenCalledWith(
      'evt-1',
      expect.objectContaining({
        title: 'Build stage',
        item_type: 'task',
        status: 'planned',
        owner: 'Ada Lovelace',
        notes: 'Bring truss',
        color: '#123456',
        assigned_user_id: 'user-1',
      }),
    )
    const payload = createPlannerTimelineItemMock.mock.calls[0]![1]
    expect(payload.starts_at).toMatch(/^2026-05-15T09:00:00[+-]\d{2}:\d{2}$/)
    expect(pushToastMock).toHaveBeenCalledWith({
      tone: 'success',
      title: 'Timeline item created',
      description: 'Build stage was added to the planner',
    })
    expect(wrapper.text()).toContain('Build stage')
  })

  it('updates status, shifts, extends, saves, and removes timeline items', async () => {
    const updated = timelineItemFactory({ status: 'done', position: 1 })
    updatePlannerTimelineItemMock.mockResolvedValue(updated)
    deletePlannerTimelineItemMock.mockResolvedValue(undefined)

    const wrapper = mountDashboard()
    await flushPromises()

    wrapper.findComponent(TimelineBoard).vm.$emit('statusChange', item, 'done')
    await flushPromises()
    expect(updatePlannerTimelineItemMock).toHaveBeenLastCalledWith('evt-1', 'tl-1', {
      status: 'done',
    })

    wrapper.findComponent(TimelineBoard).vm.$emit('shift', item, 1)
    await flushPromises()
    let calls = updatePlannerTimelineItemMock.mock.calls
    expect(calls[calls.length - 1]![2]).toMatchObject({
      starts_at: expect.stringMatching(/^2026-05-16T/),
      ends_at: expect.stringMatching(/^2026-05-17T/),
    })

    wrapper.findComponent(TimelineBoard).vm.$emit('extend', item, 1)
    await flushPromises()
    calls = updatePlannerTimelineItemMock.mock.calls
    expect(calls[calls.length - 1]![2]).toMatchObject({
      ends_at: expect.stringMatching(/^2026-05-17T/),
    })

    wrapper.findComponent(TimelineItemList).vm.$emit('save', item, formPayload)
    await flushPromises()
    calls = updatePlannerTimelineItemMock.mock.calls
    expect(calls[calls.length - 1]![2]).toMatchObject({
      title: 'Build stage',
    })

    wrapper.findComponent(TimelineItemList).vm.$emit('remove', 'tl-1')
    await flushPromises()
    expect(deletePlannerTimelineItemMock).toHaveBeenCalledWith('evt-1', 'tl-1')
    expect(pushToastMock).toHaveBeenCalledWith({
      tone: 'success',
      title: 'Timeline item removed',
      description: 'Build landing stage was removed from the planner',
    })
    expect(wrapper.text()).not.toContain('Build landing stage')
  })

  it('shows load and mutation errors without getting stuck in loading states', async () => {
    listPlannerTimelineItemsMock.mockRejectedValueOnce(new Error('Timeline exploded'))

    const wrapper = mountDashboard()
    await flushPromises()

    expect(wrapper.text()).toContain('Timeline exploded')

    createPlannerTimelineItemMock.mockRejectedValueOnce(new Error('Cannot create'))
    wrapper.findComponent(TimelineCreatePanel).vm.$emit('create', formPayload)
    await flushPromises()

    expect(wrapper.text()).toContain('Cannot create')
  })
})
