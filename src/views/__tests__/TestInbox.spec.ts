import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const getLatestTestInboxLinkMock = vi.fn()

const routeMock: { query: Record<string, string | undefined> } = {
  query: {},
}

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    getLatestTestInboxLink: getLatestTestInboxLinkMock,
  }),
}))

import TestInbox from '@/views/TestInbox.vue'

function mountInbox() {
  return mount(TestInbox)
}

describe('TestInbox.vue', () => {
  beforeEach(() => {
    getLatestTestInboxLinkMock.mockReset()
    routeMock.query = {}
  })

  it('marks email as required and validates empty lookups', async () => {
    const wrapper = mountInbox()

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('label[for="test-inbox-email"]').text()).toContain('*')
    expect(wrapper.text()).toContain('Email is required')
    expect(getLatestTestInboxLinkMock).not.toHaveBeenCalled()
  })

  it('prefills the email from the route query and auto-loads the latest link', async () => {
    routeMock.query = { email: 'tester@example.com' }
    getLatestTestInboxLinkMock.mockResolvedValueOnce({
      ok: true,
      data: {
        email: 'tester@example.com',
        magic_link: 'http://localhost:5173/login?token=abc',
        requested_at: '2026-04-21T10:00:00Z',
        expires_at: '2026-04-21T10:15:00Z',
      },
    })

    const wrapper = mountInbox()
    await flushPromises()

    expect(getLatestTestInboxLinkMock).toHaveBeenCalledWith('tester@example.com')
    expect((wrapper.find('input#test-inbox-email').element as HTMLInputElement).value).toBe(
      'tester@example.com',
    )
    expect(wrapper.text()).toContain('Latest valid link')
  })

  it('renders the latest link details on success', async () => {
    getLatestTestInboxLinkMock.mockResolvedValueOnce({
      ok: true,
      data: {
        email: 'tester@example.com',
        magic_link: 'http://localhost:5173/login?token=abc',
        requested_at: '2026-04-21T10:00:00Z',
        expires_at: '2026-04-21T10:15:00Z',
      },
    })

    const wrapper = mountInbox()
    await wrapper.find('input#test-inbox-email').setValue('tester@example.com')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('tester@example.com')
    expect(wrapper.find('a[href="http://localhost:5173/login?token=abc"]').exists()).toBe(true)
  })

  it('shows an empty state when no valid link exists', async () => {
    getLatestTestInboxLinkMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      message: 'No valid magic link found',
    })

    const wrapper = mountInbox()
    await wrapper.find('input#test-inbox-email').setValue('tester@example.com')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('No active link')
    expect(wrapper.text()).toContain('No valid magic link found')
  })

  it('shows an unavailable state when the inbox is disabled', async () => {
    getLatestTestInboxLinkMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      message: 'Test inbox unavailable',
    })

    const wrapper = mountInbox()
    await wrapper.find('input#test-inbox-email').setValue('tester@example.com')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Unavailable')
    expect(wrapper.text()).toContain('Test inbox unavailable')
  })

  it('shows an error when lookup fails', async () => {
    getLatestTestInboxLinkMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      message: 'Failed to load test inbox',
    })

    const wrapper = mountInbox()
    await wrapper.find('input#test-inbox-email').setValue('tester@example.com')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load test inbox')
  })
})
