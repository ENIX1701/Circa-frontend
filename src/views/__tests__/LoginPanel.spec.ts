import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const pushMock = vi.fn()
const replaceMock = vi.fn()
const requestMagicLinkMock = vi.fn()
const verifyMagicTokenMock = vi.fn()

const routeMock: { query: Record<string, string | undefined> } = {
  query: {},
}

const authState = {
  isTestInboxPreviewAvailable: true,
}

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  useRoute: () => routeMock,
}))

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    requestMagicLink: requestMagicLinkMock,
    verifyMagicToken: verifyMagicTokenMock,
    isTestInboxPreviewAvailable: authState.isTestInboxPreviewAvailable,
  }),
}))

import LoginPanel from '@/views/LoginPanel.vue'

function mountLogin() {
  return mount(LoginPanel, {
    global: {
      stubs: {
        RouterLink: {
          name: 'RouterLink',
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

describe('LoginPanel.vue', () => {
  beforeEach(() => {
    pushMock.mockReset()
    replaceMock.mockReset()
    requestMagicLinkMock.mockReset()
    verifyMagicTokenMock.mockReset()
    routeMock.query = {}
    authState.isTestInboxPreviewAvailable = true
  })

  it('renders the sign in form', () => {
    const wrapper = mountLogin()

    expect(wrapper.text()).toContain('Sign in')
    expect(wrapper.text()).toContain('Email *')
    expect(wrapper.find('input#email').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toContain('Send magic link')
  })

  it('shows a validation error when email is empty', async () => {
    const wrapper = mountLogin()

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Please enter your email')
    expect(requestMagicLinkMock).not.toHaveBeenCalled()
  })

  it('requests a magic link and shows the success state', async () => {
    requestMagicLinkMock.mockResolvedValueOnce(
      'If that email is registered, a magic link has been sent.',
    )

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('tester@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(requestMagicLinkMock).toHaveBeenCalledWith('tester@example.com')
    expect(wrapper.text()).toContain('Magic link requested')
    expect(wrapper.text()).toContain('If that email is registered')
  })

  it('shows the test inbox link after success when preview mode is enabled', async () => {
    requestMagicLinkMock.mockResolvedValueOnce(
      'If that email is registered, a magic link has been sent.',
    )

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('tester@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    const routerLink = wrapper.findComponent({ name: 'RouterLink' })
    expect(routerLink.exists()).toBe(true)
    expect(routerLink.props('to')).toEqual({
      name: 'test-inbox',
      query: { email: 'tester@example.com' },
    })
  })

  it('hides the test inbox link when preview mode is disabled', async () => {
    authState.isTestInboxPreviewAvailable = false
    requestMagicLinkMock.mockResolvedValueOnce(
      'If that email is registered, a magic link has been sent.',
    )

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('tester@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.findComponent({ name: 'RouterLink' }).exists()).toBe(false)
  })

  it('shows request errors', async () => {
    requestMagicLinkMock.mockRejectedValueOnce(new Error('Request failed'))

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('tester@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Request failed')
  })

  it('verifies a token from the route query on mount', async () => {
    routeMock.query = { token: 'magic-token-123' }
    verifyMagicTokenMock.mockResolvedValueOnce(undefined)

    mountLogin()
    await flushPromises()

    expect(verifyMagicTokenMock).toHaveBeenCalledWith('magic-token-123')
    expect(replaceMock).toHaveBeenCalledWith('/')
  })

  it('shows verification errors', async () => {
    routeMock.query = { token: 'bad-token' }
    verifyMagicTokenMock.mockRejectedValueOnce(new Error('Invalid or expired magic link'))

    const wrapper = mountLogin()
    await flushPromises()

    expect(wrapper.text()).toContain('Invalid or expired magic link')
  })
})
