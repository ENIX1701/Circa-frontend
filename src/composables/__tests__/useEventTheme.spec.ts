import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, reactive } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { brandingFactory } from '@/test/factories'

const getEventBrandingMock = vi.fn()
const routeMock = reactive<{ params: Record<string, string | undefined> }>({
  params: { id: 'evt-1' },
})

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('@/composables/useEvents', () => ({
  useEvents: () => ({
    getEventBranding: getEventBrandingMock,
  }),
}))

import { useEventTheme } from '@/composables/useEventTheme'

const Harness = defineComponent({
  setup() {
    useEventTheme()
    return () => null
  },
})

let wrapper: ReturnType<typeof mount> | null = null

function rootStyle(name: string) {
  return document.documentElement.style.getPropertyValue(name)
}

describe('useEventTheme', () => {
  beforeEach(() => {
    wrapper = null
    routeMock.params = { id: 'evt-1' }
    getEventBrandingMock.mockReset()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('style')
  })

  afterEach(() => {
    wrapper?.unmount()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('style')
  })

  it('loads event branding and applies theme css variables', async () => {
    getEventBrandingMock.mockResolvedValueOnce(
      brandingFactory({
        theme_mode: 'light',
        primary_color: '123456',
        secondary_color: '#abcdef',
      }),
    )

    wrapper = mount(Harness)
    await flushPromises()

    expect(getEventBrandingMock).toHaveBeenCalledWith('evt-1')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(rootStyle('--color-primary')).toBe('#123456')
    expect(rootStyle('--color-primary-rgb')).toBe('18, 52, 86')
    expect(rootStyle('--color-secondary')).toBe('#abcdef')
  })

  it('resets to defaults when no event id is present', async () => {
    routeMock.params = {}

    wrapper = mount(Harness)
    await flushPromises()

    expect(getEventBrandingMock).not.toHaveBeenCalled()
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(rootStyle('--color-primary')).toBe('#8b5cf6')
  })

  it('resets to defaults when branding loading fails', async () => {
    getEventBrandingMock.mockRejectedValueOnce(new Error('No branding'))

    wrapper = mount(Harness)
    await flushPromises()

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(rootStyle('--color-secondary')).toBe('#f97316')
  })

  it('reloads branding when the route event id changes', async () => {
    getEventBrandingMock
      .mockResolvedValueOnce(brandingFactory({ event_id: 'evt-1', primary_color: '#111111' }))
      .mockResolvedValueOnce(brandingFactory({ event_id: 'evt-2', primary_color: '#222222' }))

    wrapper = mount(Harness)
    await flushPromises()

    routeMock.params = { id: 'evt-2' }
    await nextTick()
    await flushPromises()

    expect(getEventBrandingMock).toHaveBeenCalledWith('evt-2')
    expect(rootStyle('--color-primary')).toBe('#222222')
  })

  it('applies matching branding update events without refetching', async () => {
    getEventBrandingMock.mockResolvedValueOnce(brandingFactory({ primary_color: '#111111' }))

    wrapper = mount(Harness)
    await flushPromises()

    window.dispatchEvent(
      new CustomEvent('circa:branding-updated', {
        detail: {
          eventId: 'evt-1',
          branding: brandingFactory({ primary_color: '#654321', theme_mode: 'light' }),
        },
      }),
    )

    expect(rootStyle('--color-primary')).toBe('#654321')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(getEventBrandingMock).toHaveBeenCalledTimes(1)
  })

  it('ignores branding update events for other events', async () => {
    getEventBrandingMock.mockResolvedValueOnce(brandingFactory({ primary_color: '#111111' }))

    wrapper = mount(Harness)
    await flushPromises()

    window.dispatchEvent(
      new CustomEvent('circa:branding-updated', {
        detail: {
          eventId: 'evt-2',
          branding: brandingFactory({ primary_color: '#654321' }),
        },
      }),
    )

    expect(rootStyle('--color-primary')).toBe('#111111')
  })
})
