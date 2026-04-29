import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BrandingForm from '@/components/branding/BrandingForm.vue'
import BrandingPreview from '@/components/branding/BrandingPreview.vue'
import TypographyPreview from '@/components/branding/TypographyPreview.vue'
import { brandingFactory } from '@/test/factories'
import type { UpsertEventBrandingRequest } from '@/composables/useEvents'

function formFactory(
  overrides: Partial<UpsertEventBrandingRequest> = {},
): UpsertEventBrandingRequest {
  const branding = brandingFactory()
  return {
    event_name_override: branding.event_name_override,
    tagline: branding.tagline,
    primary_color: branding.primary_color,
    secondary_color: branding.secondary_color,
    theme_mode: branding.theme_mode,
    background_color: branding.background_color,
    notes: branding.notes,
    ...overrides,
  }
}

describe('branding components', () => {
  it('emits whole-form updates and save events from the branding form', async () => {
    const wrapper = mount(BrandingForm, {
      props: { form: formFactory(), saving: false },
    })

    await wrapper.find('#event-name-override').setValue('  New Name  ')
    await wrapper.find('#theme-mode').setValue('light')
    await wrapper.find('form').trigger('submit.prevent')

    const updates = wrapper.emitted('update:form')!
    expect(updates[0]![0]).toMatchObject({
      event_name_override: '  New Name  ',
    })
    expect(updates[updates.length - 1]![0]).toMatchObject({ theme_mode: 'light' })
    expect(wrapper.emitted('save')).toHaveLength(1)
  })

  it('renders branding preview fallbacks and inline theme colors', () => {
    const wrapper = mount(BrandingPreview, {
      props: {
        eventName: '',
        tagline: '',
        primaryColor: '#123456',
        secondaryColor: '#abcdef',
        backgroundColor: '#ffffff',
        themeMode: 'light',
      },
    })

    expect(wrapper.text()).toContain('Event name')
    expect(wrapper.text()).toContain('Tagline goes here')
    expect(wrapper.find('[style*="background-color"]').exists()).toBe(true)
  })

  it('renders the typography placeholder', () => {
    expect(mount(TypographyPreview).text()).toContain('Coming soon')
  })
})
