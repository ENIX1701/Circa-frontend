import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import BrandingDashboard from '@/views/BrandingDashboard.vue'
import BrandingForm from '@/components/branding/BrandingForm.vue'
import { brandingFactory } from '@/test/factories'
import type { UpsertEventBrandingRequest } from '@/composables/useEvents'

const routeMock: { params: Record<string, string | undefined> } = {
  params: { id: 'evt-1' },
}

const getEventBrandingMock = vi.fn()
const upsertEventBrandingMock = vi.fn()
const pushToastMock = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('@/composables/useEvents', () => ({
  useEvents: () => ({
    getEventBranding: getEventBrandingMock,
    upsertEventBranding: upsertEventBrandingMock,
  }),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    pushToast: pushToastMock,
  }),
}))

const loadedBranding = brandingFactory()

function nextForm(overrides: Partial<UpsertEventBrandingRequest> = {}): UpsertEventBrandingRequest {
  return {
    event_name_override: '  New Name  ',
    tagline: '  New tagline  ',
    primary_color: '#111111',
    secondary_color: '#222222',
    theme_mode: 'light',
    background_color: '#ffffff',
    notes: '  Notes  ',
    ...overrides,
  }
}

describe('BrandingDashboard.vue', () => {
  beforeEach(() => {
    routeMock.params = { id: 'evt-1' }
    getEventBrandingMock.mockReset().mockResolvedValue(loadedBranding)
    upsertEventBrandingMock.mockReset()
    pushToastMock.mockReset()
  })

  it('loads branding and renders the form and preview', async () => {
    const wrapper = mount(BrandingDashboard)
    await flushPromises()

    expect(getEventBrandingMock).toHaveBeenCalledWith('evt-1')
    expect(wrapper.text()).toContain('Summit Prime')
    expect(wrapper.text()).toContain('Make the launch count')
  })

  it('saves trimmed branding and broadcasts the branding update event', async () => {
    const saved = brandingFactory({ event_name_override: 'New Name', theme_mode: 'light' })
    const brandingEvents: CustomEvent[] = []
    window.addEventListener('circa:branding-updated', ((event: CustomEvent) => {
      brandingEvents.push(event)
    }) as EventListener)
    upsertEventBrandingMock.mockResolvedValueOnce(saved)

    const wrapper = mount(BrandingDashboard)
    await flushPromises()
    wrapper.findComponent(BrandingForm).vm.$emit('update:form', nextForm())
    await flushPromises()
    wrapper.findComponent(BrandingForm).vm.$emit('save')
    await flushPromises()

    expect(upsertEventBrandingMock).toHaveBeenCalledWith('evt-1', {
      event_name_override: 'New Name',
      tagline: 'New tagline',
      primary_color: '#111111',
      secondary_color: '#222222',
      theme_mode: 'light',
      background_color: '#ffffff',
      notes: 'Notes',
    })
    expect(pushToastMock).toHaveBeenCalledWith({
      tone: 'success',
      title: 'Branding saved',
      description: 'Your event branding has been updated :3',
    })
    expect(brandingEvents[0]!.detail).toEqual({ eventId: 'evt-1', branding: saved })
  })

  it('shows load and save errors', async () => {
    getEventBrandingMock.mockRejectedValueOnce(new Error('No branding'))

    const wrapper = mount(BrandingDashboard)
    await flushPromises()

    expect(wrapper.text()).toContain('No branding')

    upsertEventBrandingMock.mockRejectedValueOnce(new Error('Save failed'))
    wrapper.findComponent(BrandingForm).vm.$emit('save')
    await flushPromises()

    expect(wrapper.text()).toContain('Save failed')
  })
})
