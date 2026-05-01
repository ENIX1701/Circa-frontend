import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TimelineBoard from '@/components/planner/TimelineBoard.vue'
import TimelineCreatePanel from '@/components/planner/TimelineCreatePanel.vue'
import TimelineItemForm from '@/components/planner/TimelineItemForm.vue'
import TimelineItemList from '@/components/planner/TimelineItemList.vue'
import { collaboratorFactory, timelineItemFactory } from '@/test/factories'

const collaborators = [
  collaboratorFactory({ user_id: 'user-1', name: 'Ada', surname: 'Lovelace', role: 'staff' }),
]

function collaboratorName(userId: string) {
  const member = collaborators.find((collaborator) => collaborator.user_id === userId)
  return member ? `${member.name} ${member.surname}` : ''
}

async function fillTimelineForm(wrapper: ReturnType<typeof mount>) {
  const inputs = wrapper.findAll('input')
  const selects = wrapper.findAll('select')
  await inputs[0]!.setValue('  Build stage  ')
  await selects[0]!.setValue('asset')
  await inputs[1]!.setValue('2026-05-15T09:00')
  await inputs[2]!.setValue('2026-05-15T17:00')
  await selects[1]!.setValue('in_progress')
  await selects[2]!.setValue('Ada Lovelace')
  await selects[3]!.setValue('user-1')
  await inputs[4]!.setValue('#123456')
  await wrapper.find('textarea').setValue('  Bring truss  ')
}

describe('planner timeline components', () => {
  it('submits valid timeline item forms and resets create forms', async () => {
    const wrapper = mount(TimelineItemForm, {
      props: { collaborators },
    })

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('label[for="timeline-title"]').text()).toContain('*')
    expect(wrapper.find('label[for="timeline-type"]').text()).toContain('*')
    expect(wrapper.find('label[for="timeline-starts-at"]').text()).toContain('*')
    expect(wrapper.find('label[for="timeline-ends-at"]').text()).toContain('*')
    expect(wrapper.text()).toContain('Title is required')
    expect(wrapper.text()).toContain('Start time is required')
    expect(wrapper.text()).toContain('End time is required')

    await fillTimelineForm(wrapper)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')![0]![0]).toMatchObject({
      title: '  Build stage  ',
      item_type: 'asset',
      starts_at_local: '2026-05-15T09:00',
      ends_at_local: '2026-05-15T17:00',
      status: 'in_progress',
      owner: 'Ada Lovelace',
      color: '#123456',
      notes: '  Bring truss  ',
      assigned_user_id: 'user-1',
    })
    expect((wrapper.findAll('input')[0]!.element as HTMLInputElement).value).toBe('')
  })

  it('prefills edit forms and emits cancel', async () => {
    const wrapper = mount(TimelineItemForm, {
      props: {
        collaborators,
        item: timelineItemFactory({
          starts_at: '2026-05-15T09:30:00',
          ends_at: '2026-05-15T10:30:00',
          status: 'blocked',
          owner: 'Ada Lovelace',
        }),
      },
    })

    expect((wrapper.findAll('input')[0]!.element as HTMLInputElement).value).toBe(
      'Build landing stage',
    )
    expect((wrapper.findAll('select')[1]!.element as HTMLSelectElement).value).toBe('blocked')
    expect((wrapper.findAll('select')[2]!.element as HTMLSelectElement).value).toBe('Ada Lovelace')

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Cancel')
      ?.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('re-emits creates from the create panel', async () => {
    const wrapper = mount(TimelineCreatePanel, {
      props: { collaborators },
    })

    await fillTimelineForm(wrapper)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('create')![0]![0]).toMatchObject({
      title: '  Build stage  ',
      item_type: 'asset',
    })
  })

  it('renders item list states and item actions', async () => {
    expect(
      mount(TimelineItemList, {
        props: {
          items: [],
          collaborators,
          loading: true,
          updatingItemId: '',
          deletingItemId: '',
          editingItemId: '',
          collaboratorName,
        },
      }).text(),
    ).toContain('Loading timeline items')

    const item = timelineItemFactory()
    const wrapper = mount(TimelineItemList, {
      props: {
        items: [item],
        collaborators,
        loading: false,
        updatingItemId: '',
        deletingItemId: '',
        editingItemId: '',
        collaboratorName,
      },
    })

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Edit')
      ?.trigger('click')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Remove')
      ?.trigger('click')

    expect(wrapper.text()).toContain('Assigned to Ada Lovelace')
    expect(wrapper.emitted('edit')).toEqual([[item]])
    expect(wrapper.emitted('remove')).toEqual([['tl-1']])
  })

  it('renders board rows, milestones, and emits timeline controls', async () => {
    const task = timelineItemFactory({ id: 'tl-task', item_type: 'task' })
    const milestone = timelineItemFactory({
      id: 'tl-mile',
      item_type: 'milestone',
      title: 'Doors open',
      starts_at: '2026-05-17T09:00:00Z',
      ends_at: '2026-05-17T09:00:00Z',
      assigned_user_id: '',
    })
    const wrapper = mount(TimelineBoard, {
      props: {
        items: [task, milestone],
        collaborators,
        loading: false,
        updatingItemId: '',
        deletingItemId: '',
        editingItemId: '',
        collaboratorName,
      },
    })

    await wrapper.find('select').setValue('done')
    await wrapper
      .findAll('button')
      .find((button) => button.attributes('aria-label') === 'Move item one day earlier')
      ?.trigger('click')
    await wrapper
      .findAll('button')
      .find((button) => button.attributes('aria-label') === 'Extend item by one day')
      ?.trigger('click')
    await wrapper
      .findAll('button')
      .find((button) => button.attributes('aria-label') === 'Edit item')
      ?.trigger('click')
    await wrapper
      .findAll('button')
      .find((button) => button.attributes('aria-label') === 'Remove item')
      ?.trigger('click')

    expect(wrapper.text()).toContain('Build landing stage')
    expect(wrapper.text()).toContain('Doors open')
    expect(wrapper.emitted('statusChange')).toEqual([[task, 'done']])
    expect(wrapper.emitted('shift')).toEqual([[task, -1]])
    expect(wrapper.emitted('extend')).toEqual([[task, 1]])
    expect(wrapper.emitted('edit')).toEqual([[task]])
    expect(wrapper.emitted('remove')).toEqual([['tl-task']])
  })
})
