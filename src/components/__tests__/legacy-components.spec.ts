import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import ColorPicker from '@/components/ColorPicker.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import ItemCard from '@/components/ItemCard.vue'
import MobileMenuItem from '@/components/MobileMenuItem.vue'
import NavbarSectionElement from '@/components/NavbarSectionElement.vue'
import SidebarTimer from '@/components/SidebarTimer.vue'
import { ItemState } from '@/enums/itemState'

const IconStub = defineComponent({
  template: '<svg data-testid="icon" />',
})

describe('legacy shared components', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders base button loading and secondary states', () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true, variant: 'secondary' },
      slots: { default: 'Save' },
    })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Save')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('renders base card title and forwards attributes to the body', () => {
    const wrapper = mount(BaseCard, {
      props: { title: 'Card title' },
      attrs: { 'data-testid': 'body' },
      slots: { default: 'Card body' },
    })

    expect(wrapper.text()).toContain('Card title')
    expect(wrapper.find('[data-testid="body"]').text()).toBe('Card body')
  })

  it('emits updates from base input and select', async () => {
    const input = mount(BaseInput, {
      props: { id: 'email', label: 'Email', modelValue: '', error: 'Required' },
    })
    const select = mount(BaseSelect, {
      props: {
        id: 'role',
        label: 'Role',
        modelValue: '',
        placeholder: 'Pick',
        options: [
          { label: 'Staff', value: 'staff' },
          { label: 'Owner', value: 'owner' },
        ],
      },
    })

    await input.find('input').setValue('ada@example.com')
    await select.find('select').setValue('owner')

    expect(input.text()).toContain('Required')
    expect(input.emitted('update:modelValue')).toEqual([['ada@example.com']])
    expect(select.text()).toContain('Pick')
    expect(select.emitted('update:modelValue')).toEqual([['owner']])
  })

  it('emits normalized picker values and raw text values from color picker', async () => {
    const wrapper = mount(ColorPicker, {
      props: { title: 'Accent', color: 'invalid' },
    })
    const inputs = wrapper.findAll('input')

    expect((inputs[0]!.element as HTMLInputElement).value).toBe('#000000')
    await inputs[0]!.setValue('#AABBCC')
    await inputs[1]!.setValue('#123456')

    expect(wrapper.emitted('update:color')).toEqual([['#aabbcc'], ['#123456']])
  })

  it('handles image selection and removal', async () => {
    const createObjectURL = vi.fn(() => 'blob:preview')
    vi.stubGlobal('URL', { createObjectURL })
    const wrapper = mount(ImageUpload)
    const file = new File(['image'], 'poster.png', { type: 'image/png' })
    const input = wrapper.find('input[type="file"]')

    Object.defineProperty(input.element, 'files', {
      value: [file],
      configurable: true,
    })
    await input.trigger('change')

    expect(createObjectURL).toHaveBeenCalledWith(file)
    expect(wrapper.emitted('update:modelValue')).toEqual([[file]])
    expect(wrapper.find('img').attributes('src')).toBe('blob:preview')

    await wrapper.find('button').trigger('click')
    const updates = wrapper.emitted('update:modelValue')!
    expect(updates[updates.length - 1]).toEqual([null])
  })

  it('renders item and simple navigation display components', () => {
    expect(
      mount(ItemCard, {
        props: {
          assignee: 'Ada',
          item: { name: 'Projector', supplier: 'AV Team' },
          eta: new Date('2026-05-15T09:00:00Z'),
          type: ItemState.Planned,
        },
      }).text(),
    ).toContain('Projector')
    expect(mount(MobileMenuItem, { props: { icon: IconStub, title: 'Planner' } }).text()).toContain(
      'Planner',
    )
    expect(
      mount(NavbarSectionElement, { props: { icon: IconStub, title: 'Events' } }).text(),
    ).toContain('Events')
    expect(mount(SidebarTimer).text()).toContain('hi')
  })
})
