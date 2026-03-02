import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LoginPanel from '@/views/LoginPanel.vue'

// Mock vue-router
const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

// Mock notifyTokenChange
const notifyTokenChangeMock = vi.fn()
vi.mock('@/composables/useAuth', () => ({
  notifyTokenChange: (...args: unknown[]) => notifyTokenChangeMock(...args),
}))

describe('LoginPanel.vue', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()
    pushMock.mockReset()
    notifyTokenChangeMock.mockReset()

    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  function mountLogin() {
    return mount(LoginPanel, {
      global: {
        stubs: {},
      },
    })
  }

  // ── rendering ────────────────────────────────────────────────────

  it('renders the sign in heading', () => {
    const wrapper = mountLogin()
    expect(wrapper.find('h1').text()).toBe('Sign in')
  })

  it('renders an email input field', () => {
    const wrapper = mountLogin()
    const input = wrapper.find('input#email')
    expect(input.exists()).toBe(true)
    expect(input.attributes('type')).toBe('email')
  })

  it('renders a submit button', () => {
    const wrapper = mountLogin()
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('Sign in')
  })

  it('does not show error message initially', () => {
    const wrapper = mountLogin()
    // The error div is rendered conditionally with v-if="error"
    const errorDiv = wrapper.find('.text-red-400')
    expect(errorDiv.exists()).toBe(false)
  })

  // ── empty email validation ───────────────────────────────────────

  it('shows error when submitting with empty email', async () => {
    const wrapper = mountLogin()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const errorDiv = wrapper.find('.text-red-400')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toBe('Please enter your email')
  })

  it('shows error when submitting with whitespace-only email', async () => {
    const wrapper = mountLogin()

    await wrapper.find('input#email').setValue('   ')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const errorDiv = wrapper.find('.text-red-400')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toBe('Please enter your email')
  })

  it('does not call fetch when email is empty', async () => {
    const wrapper = mountLogin()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(fetchMock).not.toHaveBeenCalled()
  })

  // ── successful login ─────────────────────────────────────────────

  it('calls fetch with the correct URL and body on submit', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'jwt-abc' }),
    })

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('admin@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com' }),
    })
  })

  it('stores the token in localStorage on success', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'jwt-token-123' }),
    })

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('admin@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(localStorage.getItem('token')).toBe('jwt-token-123')
  })

  it('calls notifyTokenChange on success', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'jwt-abc' }),
    })

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('admin@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(notifyTokenChangeMock).toHaveBeenCalled()
  })

  it('navigates to / on success', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'jwt-abc' }),
    })

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('admin@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(pushMock).toHaveBeenCalledWith('/')
  })

  // ── failed login (server returns non-ok) ─────────────────────────

  it('shows error message from server when response is not ok', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Invalid credentials',
    })

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('bad@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const errorDiv = wrapper.find('.text-red-400')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toBe('Invalid credentials')
  })

  it('shows fallback error when server returns empty message', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      text: async () => '',
    })

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('bad@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const errorDiv = wrapper.find('.text-red-400')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toBe('Login failed')
  })

  it('does not store token when login fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Nope',
    })

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('bad@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(localStorage.getItem('token')).toBeNull()
  })

  it('does not navigate when login fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Nope',
    })

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('bad@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(pushMock).not.toHaveBeenCalled()
  })

  // ── network error ────────────────────────────────────────────────

  it('shows "Could not reach server" on network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'))

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('user@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const errorDiv = wrapper.find('.text-red-400')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toBe('Could not reach server')
  })

  it('does not store token on network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'))

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('user@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(localStorage.getItem('token')).toBeNull()
  })

  // ── loading state ────────────────────────────────────────────────

  it('disables the button while loading', async () => {
    let resolveFetch!: (value: unknown) => void
    fetchMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('user@example.com')
    await wrapper.find('form').trigger('submit')

    // While fetch is pending
    await flushPromises()
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.text()).toBe('Signing in...')

    // Resolve fetch
    resolveFetch({
      ok: true,
      json: async () => ({ token: 'jwt' }),
    })
    await flushPromises()

    expect(btn.attributes('disabled')).toBeUndefined()
    expect(btn.text()).toBe('Sign in')
  })

  it('re-enables the button after a failed request', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      text: async () => 'fail',
    })

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('user@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeUndefined()
    expect(btn.text()).toBe('Sign in')
  })

  it('re-enables the button after a network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network'))

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('user@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeUndefined()
    expect(btn.text()).toBe('Sign in')
  })

  // ── error clearing ───────────────────────────────────────────────

  it('clears a previous error when resubmitting', async () => {
    // First: trigger an error
    fetchMock.mockResolvedValueOnce({
      ok: false,
      text: async () => 'First error',
    })

    const wrapper = mountLogin()
    await wrapper.find('input#email').setValue('user@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('.text-red-400').text()).toBe('First error')

    // Second: submit again, the error should clear before the new request
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'jwt' }),
    })

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('.text-red-400').exists()).toBe(false)
  })
})
