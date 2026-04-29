import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, reactive } from 'vue'
import { mount } from '@vue/test-utils'

const routeMock = reactive<{
  path: string
  params: Record<string, string | undefined>
  meta: Record<string, unknown>
}>({
  path: '/events',
  params: {},
  meta: {},
})

const useEventThemeMock = vi.fn()
const RouterLinkStub = defineComponent({
  props: ['to'],
  template: '<a :data-to="typeof to === `string` ? to : JSON.stringify(to)"><slot /></a>',
})
const RouterViewStub = defineComponent({
  template: '<section data-testid="router-view">Current view</section>',
})

const globalStubs = {
  global: {
    stubs: {
      RouterLink: RouterLinkStub,
      RouterView: RouterViewStub,
    },
  },
}

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('@/composables/useEventTheme', () => ({
  useEventTheme: () => useEventThemeMock(),
}))

import App from '@/App.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import MobileNavbar from '@/components/MobileNavbar.vue'

describe('navigation shell components', () => {
  beforeEach(() => {
    routeMock.path = '/events'
    routeMock.params = {}
    routeMock.meta = {}
    useEventThemeMock.mockReset()
  })

  it('renders public routes without side navigation', () => {
    routeMock.meta = { public: true }

    const wrapper = mount(App, globalStubs)

    expect(useEventThemeMock).toHaveBeenCalledTimes(1)
    expect(wrapper.findComponent(DesktopSidebar).exists()).toBe(false)
    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true)
  })

  it('renders private app shell with desktop and mobile navigation', () => {
    const wrapper = mount(App, globalStubs)

    expect(wrapper.findComponent(DesktopSidebar).exists()).toBe(true)
    expect(wrapper.findComponent(MobileNavbar).exists()).toBe(true)
    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true)
  })

  it('renders app-level navigation outside an event workspace', () => {
    const wrapper = mount(DesktopSidebar, globalStubs)

    expect(wrapper.text()).toContain('Events')
    expect(wrapper.find('[data-to="/events"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Current event')
  })

  it('renders event workspace navigation and active nested links', () => {
    routeMock.path = '/events/evt-1/planner'
    routeMock.params = { id: 'evt-1' }

    const desktop = mount(DesktopSidebar, globalStubs)
    const mobile = mount(MobileNavbar, globalStubs)

    expect(desktop.text()).toContain('Planner')
    expect(desktop.text()).toContain('Branding')
    expect(desktop.text()).toContain('evt-1')
    expect(desktop.find('[data-to="/events/evt-1/planner"]').classes()).toContain(
      'app-nav-item--active',
    )
    expect(mobile.text()).toContain('Socials')
    expect(mobile.find('[data-to="/events/evt-1"]').exists()).toBe(true)
  })
})
