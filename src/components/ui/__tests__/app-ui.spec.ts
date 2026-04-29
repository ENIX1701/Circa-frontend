import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppStatCard from '@/components/ui/AppStatCard.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import ColorField from '@/components/ui/ColorField.vue'

describe('shared app UI components', () => {
  it('renders button variants and disables when loading or explicitly disabled', () => {
    const loading = mount(AppButton, {
      props: { loading: true, variant: 'danger' },
      slots: { default: 'Delete' },
    })
    const disabled = mount(AppButton, {
      props: { disabled: true, variant: 'ghost', size: 'sm' },
      slots: { default: 'Cancel' },
    })

    expect(loading.find('button').attributes('disabled')).toBeDefined()
    expect(loading.text()).toContain('Delete')
    expect(loading.find('svg').exists()).toBe(true)
    expect(disabled.find('button').attributes('disabled')).toBeDefined()
    expect(disabled.find('button').classes()).toContain('app-action--sm')
  })

  it('emits v-model changes from input, select, and textarea controls', async () => {
    const input = mount(AppInput, {
      props: { modelValue: '', id: 'name' },
      attrs: { placeholder: 'Name' },
    })
    await input.find('input').setValue('Ada')

    const select = mount(AppSelect, {
      props: {
        modelValue: '',
        placeholder: 'Pick one',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Ready', value: 'ready' },
        ],
      },
    })
    await select.find('select').setValue('ready')

    const textarea = mount(AppTextarea, {
      props: { modelValue: '' },
      attrs: { placeholder: 'Notes' },
    })
    await textarea.find('textarea').setValue('Bring signs')

    expect(input.emitted('update:modelValue')).toEqual([['Ada']])
    expect(select.text()).toContain('Pick one')
    expect(select.emitted('update:modelValue')).toEqual([['ready']])
    expect(textarea.emitted('update:modelValue')).toEqual([['Bring signs']])
  })

  it('renders alert, badge, empty state, panel, and stat card content', () => {
    expect(
      mount(AppAlert, { props: { tone: 'danger' }, slots: { default: 'Problem' } }).text(),
    ).toBe('Problem')
    expect(mount(AppBadge, { props: { tone: 'success' }, slots: { default: 'done' } }).text()).toBe(
      'done',
    )
    expect(
      mount(AppEmptyState, {
        props: { title: 'Nothing here', description: 'Create one first' },
      }).text(),
    ).toContain('Create one first')
    expect(mount(AppPanel, { props: { tone: 'muted' }, slots: { default: 'Panel' } }).text()).toBe(
      'Panel',
    )
    expect(
      mount(AppStatCard, {
        props: { label: 'Assigned', value: 4 },
        slots: { default: 'One blocked' },
      }).text(),
    ).toContain('One blocked')
  })

  it('renders field labels, required markers, hints, and errors', () => {
    const withHint = mount(AppField, {
      props: { id: 'email', label: 'Email', hint: 'Used for login', required: true },
      slots: { default: '<input id="email" />' },
    })
    const withError = mount(AppField, {
      props: { label: 'Name', hint: 'Hidden', error: 'Name is required' },
      slots: { default: '<input />' },
    })

    expect(withHint.find('label').attributes('for')).toBe('email')
    expect(withHint.text()).toContain('*')
    expect(withHint.text()).toContain('Used for login')
    expect(withError.text()).toContain('Name is required')
    expect(withError.text()).not.toContain('Hidden')
  })

  it('renders page header actions only when provided', () => {
    const wrapper = mount(AppPageHeader, {
      props: { eyebrow: 'Events', title: 'Your events', description: 'Plan here' },
      slots: { actions: '<button>Create</button>' },
    })

    expect(wrapper.text()).toContain('Events')
    expect(wrapper.text()).toContain('Your events')
    expect(wrapper.find('button').text()).toBe('Create')
  })

  it('keeps color picker input safe and emits both picker and text changes', async () => {
    const wrapper = mount(ColorField, {
      props: { id: 'primary', label: 'Primary', color: 'bad-color', hint: 'Pick a color' },
    })

    const inputs = wrapper.findAll('input')
    expect((inputs[0]!.element as HTMLInputElement).value).toBe('#000000')
    expect(wrapper.text()).toContain('Pick a color')

    await inputs[0]!.setValue('#ABCDEF')
    await inputs[1]!.setValue('#123456')

    expect(wrapper.emitted('update:color')).toEqual([['#abcdef'], ['#123456']])
  })
})
