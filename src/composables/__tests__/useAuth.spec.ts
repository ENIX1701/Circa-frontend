import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useAuth, notifyTokenChange } from '@/composables/useAuth'
import { Role } from '@/enums/Role'

// Mock vue-router
const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

// Helper: build a fake JWT with the given payload (no signature verification on the frontend)
function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fake-signature`
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    pushMock.mockReset()
    // Reset the internal tokenVersion so each test starts fresh
    notifyTokenChange()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ── claims ───────────────────────────────────────────────────────

  it('returns null claims when no token in localStorage', () => {
    const { claims } = useAuth()
    expect(claims.value).toBeNull()
  })

  it('returns parsed claims when a valid token exists', () => {
    const token = fakeJwt({ sub: 'user-1', role: 'admin', exp: 9999999999 })
    localStorage.setItem('token', token)
    notifyTokenChange()

    const { claims } = useAuth()
    expect(claims.value).toEqual({ sub: 'user-1', role: 'admin', exp: 9999999999 })
  })

  it('returns null claims when the token is malformed', () => {
    localStorage.setItem('token', 'not.a.valid.jwt')
    notifyTokenChange()

    const { claims } = useAuth()
    // atob of "a" or garbled segments should cause JSON.parse to fail
    expect(claims.value).toBeNull()
  })

  it('returns null claims when the token has no payload segment', () => {
    localStorage.setItem('token', 'headeronly')
    notifyTokenChange()

    const { claims } = useAuth()
    expect(claims.value).toBeNull()
  })

  it('returns null claims when the token payload is not valid base64', () => {
    localStorage.setItem('token', 'header.!!!invalid-base64!!!.sig')
    notifyTokenChange()

    const { claims } = useAuth()
    expect(claims.value).toBeNull()
  })

  // ── role ─────────────────────────────────────────────────────────

  it('returns the role from the token', () => {
    const token = fakeJwt({ sub: 'u', role: 'organizer', exp: 1 })
    localStorage.setItem('token', token)
    notifyTokenChange()

    const { role } = useAuth()
    expect(role.value).toBe(Role.Organizer)
  })

  it('returns null role when no token exists', () => {
    const { role } = useAuth()
    expect(role.value).toBeNull()
  })

  it('returns the correct role for every Role enum value', () => {
    for (const r of Object.values(Role)) {
      localStorage.setItem('token', fakeJwt({ sub: 'u', role: r, exp: 1 }))
      notifyTokenChange()

      const { role } = useAuth()
      expect(role.value).toBe(r)
    }
  })

  // ── isLoggedIn ───────────────────────────────────────────────────

  it('is false when no token exists', () => {
    const { isLoggedIn } = useAuth()
    expect(isLoggedIn.value).toBe(false)
  })

  it('is true when a valid token exists', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: 'admin', exp: 1 }))
    notifyTokenChange()

    const { isLoggedIn } = useAuth()
    expect(isLoggedIn.value).toBe(true)
  })

  it('is false when the token is garbage', () => {
    localStorage.setItem('token', 'garbage')
    notifyTokenChange()

    const { isLoggedIn } = useAuth()
    expect(isLoggedIn.value).toBe(false)
  })

  // ── logout ───────────────────────────────────────────────────────

  it('removes the token from localStorage on logout', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: 'admin', exp: 1 }))
    notifyTokenChange()

    const { logout } = useAuth()
    logout()

    expect(localStorage.getItem('token')).toBeNull()
  })

  it('navigates to login route on logout', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: 'admin', exp: 1 }))
    notifyTokenChange()

    const { logout } = useAuth()
    logout()

    expect(pushMock).toHaveBeenCalledWith({ name: 'login' })
  })

  it('sets isLoggedIn to false after logout', async () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: 'admin', exp: 1 }))
    notifyTokenChange()

    const { logout, isLoggedIn } = useAuth()
    expect(isLoggedIn.value).toBe(true)

    logout()
    await nextTick()

    expect(isLoggedIn.value).toBe(false)
  })

  it('sets claims to null after logout', async () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: 'admin', exp: 1 }))
    notifyTokenChange()

    const { logout, claims } = useAuth()
    expect(claims.value).not.toBeNull()

    logout()
    await nextTick()

    expect(claims.value).toBeNull()
  })

  // ── hasRole ──────────────────────────────────────────────────────

  it('returns true when the user has one of the specified roles', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: 'admin', exp: 1 }))
    notifyTokenChange()

    const { hasRole } = useAuth()
    expect(hasRole(Role.Admin)).toBe(true)
    expect(hasRole(Role.Admin, Role.Organizer)).toBe(true)
  })

  it('returns false when the user does not have any of the specified roles', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: 'volunteer', exp: 1 }))
    notifyTokenChange()

    const { hasRole } = useAuth()
    expect(hasRole(Role.Admin)).toBe(false)
    expect(hasRole(Role.Admin, Role.Organizer)).toBe(false)
  })

  it('returns false when no token exists', () => {
    const { hasRole } = useAuth()
    expect(hasRole(Role.Admin)).toBe(false)
  })

  it('returns true for staff when staff is in the allowed list', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: 'staff', exp: 1 }))
    notifyTokenChange()

    const { hasRole } = useAuth()
    expect(hasRole(Role.Admin, Role.Staff)).toBe(true)
  })

  // ── notifyTokenChange ────────────────────────────────────────────

  it('causes claims to update reactively after token changes', async () => {
    const { claims } = useAuth()
    expect(claims.value).toBeNull()

    localStorage.setItem('token', fakeJwt({ sub: 'new-user', role: 'staff', exp: 42 }))
    notifyTokenChange()
    await nextTick()

    expect(claims.value).toEqual({ sub: 'new-user', role: 'staff', exp: 42 })
  })

  it('reflects token removal after notifyTokenChange', async () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: 'admin', exp: 1 }))
    notifyTokenChange()

    const { isLoggedIn } = useAuth()
    expect(isLoggedIn.value).toBe(true)

    localStorage.removeItem('token')
    notifyTokenChange()
    await nextTick()

    expect(isLoggedIn.value).toBe(false)
  })

  it('reflects token replacement after notifyTokenChange', async () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: 'admin', exp: 1 }))
    notifyTokenChange()

    const { role } = useAuth()
    expect(role.value).toBe(Role.Admin)

    localStorage.setItem('token', fakeJwt({ sub: 'u', role: 'volunteer', exp: 1 }))
    notifyTokenChange()
    await nextTick()

    expect(role.value).toBe(Role.Volunteer)
  })
})
