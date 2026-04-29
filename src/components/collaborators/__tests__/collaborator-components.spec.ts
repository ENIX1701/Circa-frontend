import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CollaboratorForm from '@/components/collaborators/CollaboratorForm.vue'
import CollaboratorRow from '@/components/collaborators/CollaboratorRow.vue'
import { collaboratorFactory } from '@/test/factories'

describe('collaborator components', () => {
  it('adds lowercased trimmed collaborators and resets the form', async () => {
    const wrapper = mount(CollaboratorForm)

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('add')).toBeUndefined()

    await wrapper.find('input[type="email"]').setValue('  ADA@EXAMPLE.COM  ')
    await wrapper.find('select').setValue('organizer')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('add')).toEqual([[{ email: 'ada@example.com', role: 'organizer' }]])
    expect((wrapper.find('input[type="email"]').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('staff')
  })

  it('emits role changes and removal only when management is enabled', async () => {
    const member = collaboratorFactory({ role: 'staff' })
    const manageable = mount(CollaboratorRow, {
      props: { member, canManage: true },
    })

    await manageable.find('select').setValue('organizer')
    await manageable.find('button').trigger('click')

    expect(manageable.emitted('roleChange')).toEqual([[member, 'organizer']])
    expect(manageable.emitted('remove')).toEqual([[member]])

    const readonly = mount(CollaboratorRow, {
      props: { member, canManage: false },
    })

    expect(readonly.find('button').exists()).toBe(false)
    expect(readonly.find('select').attributes('disabled')).toBeDefined()
  })
})
