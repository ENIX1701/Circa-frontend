import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import CollaboratorsDashboard from '@/views/CollaboratorsDashboard.vue'
import CollaboratorForm from '@/components/collaborators/CollaboratorForm.vue'
import CollaboratorRow from '@/components/collaborators/CollaboratorRow.vue'
import { collaboratorFactory, eventFactory } from '@/test/factories'

const routeMock: { params: Record<string, string | undefined> } = {
  params: { id: 'evt-1' },
}

const getEventMock = vi.fn()
const listEventCollaboratorsMock = vi.fn()
const addEventCollaboratorMock = vi.fn()
const updateEventCollaboratorMock = vi.fn()
const deleteEventCollaboratorMock = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('@/composables/useEvents', () => ({
  useEvents: () => ({
    getEvent: getEventMock,
    listEventCollaborators: listEventCollaboratorsMock,
    addEventCollaborator: addEventCollaboratorMock,
    updateEventCollaborator: updateEventCollaboratorMock,
    deleteEventCollaborator: deleteEventCollaboratorMock,
  }),
}))

const ownerEvent = eventFactory({ current_user_role: 'owner' })
const ada = collaboratorFactory({ user_id: 'user-1', role: 'staff' })
const grace = collaboratorFactory({
  user_id: 'user-2',
  name: 'Grace',
  surname: 'Hopper',
  email: 'grace@example.com',
  role: 'volunteer',
})

describe('CollaboratorsDashboard.vue', () => {
  beforeEach(() => {
    routeMock.params = { id: 'evt-1' }
    getEventMock.mockReset().mockResolvedValue(ownerEvent)
    listEventCollaboratorsMock.mockReset().mockResolvedValue([ada])
    addEventCollaboratorMock.mockReset()
    updateEventCollaboratorMock.mockReset()
    deleteEventCollaboratorMock.mockReset()
  })

  it('loads collaborators and enables management for owners', async () => {
    const wrapper = mount(CollaboratorsDashboard)
    await flushPromises()

    expect(getEventMock).toHaveBeenCalledWith('evt-1')
    expect(listEventCollaboratorsMock).toHaveBeenCalledWith('evt-1')
    expect(wrapper.findComponent(CollaboratorForm).exists()).toBe(true)
    expect(wrapper.text()).toContain('Ada Lovelace')
  })

  it('adds, updates, and removes collaborators', async () => {
    addEventCollaboratorMock.mockResolvedValueOnce(grace)
    updateEventCollaboratorMock.mockResolvedValueOnce({ ...grace, role: 'organizer' })
    deleteEventCollaboratorMock.mockResolvedValueOnce(undefined)

    const wrapper = mount(CollaboratorsDashboard)
    await flushPromises()

    wrapper.findComponent(CollaboratorForm).vm.$emit('add', {
      email: 'grace@example.com',
      role: 'volunteer',
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Grace Hopper')

    const graceRow = wrapper
      .findAllComponents(CollaboratorRow)
      .find((row) => row.text().includes('Grace Hopper'))
    graceRow?.vm.$emit('roleChange', grace, 'organizer')
    await flushPromises()
    expect(updateEventCollaboratorMock).toHaveBeenCalledWith('evt-1', 'user-2', {
      role: 'organizer',
    })
    expect(wrapper.text()).toContain('organizer')

    graceRow?.vm.$emit('remove', { ...grace, role: 'organizer' })
    await flushPromises()
    expect(deleteEventCollaboratorMock).toHaveBeenCalledWith('evt-1', 'user-2')
    expect(wrapper.text()).not.toContain('Grace Hopper')
  })

  it('hides management when the current user is not an owner', async () => {
    getEventMock.mockResolvedValueOnce(eventFactory({ current_user_role: 'staff' }))

    const wrapper = mount(CollaboratorsDashboard)
    await flushPromises()

    expect(wrapper.findComponent(CollaboratorForm).exists()).toBe(false)
    expect(wrapper.text()).toContain('Only event owners can manage collaborator roles')
  })

  it('shows load and mutation errors', async () => {
    listEventCollaboratorsMock.mockRejectedValueOnce(new Error('Cannot load members'))

    const wrapper = mount(CollaboratorsDashboard)
    await flushPromises()

    expect(wrapper.text()).toContain('Cannot load members')

    listEventCollaboratorsMock.mockResolvedValueOnce([ada])
    addEventCollaboratorMock.mockRejectedValueOnce(new Error('Cannot add member'))
    const mutationWrapper = mount(CollaboratorsDashboard)
    await flushPromises()

    mutationWrapper.findComponent(CollaboratorForm).vm.$emit('add', {
      email: 'grace@example.com',
      role: 'staff',
    })
    await flushPromises()

    expect(mutationWrapper.text()).toContain('Cannot add member')
  })
})
