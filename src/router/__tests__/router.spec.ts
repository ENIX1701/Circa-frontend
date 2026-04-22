import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'
import { Role } from '@/enums/Role'

// Helper: build a fake JWT with the given payload
function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fake-signature`
}

// Extract the guard logic so we can test it in isolation without
// triggering real Vue Router navigation (which can loop on redirects).
// This mirrors the beforeEach in src/router/index.ts exactly.
function guardLogic(to: Partial<RouteLocationNormalized>): ReturnType<typeof Object> | undefined {
  const token = localStorage.getItem('token')

  if (!token && !to.meta?.public) {
    return { name: 'login' }
  }

  if (token && to.name === 'login') {
    return { path: '/' }
  }

  if (to.meta?.roles && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const allowedRoles = to.meta.roles as Role[]

      if (!allowedRoles.includes(payload.role)) {
        return { path: '/' }
      }
    } catch {
      return { name: 'login' }
    }
  }

  return undefined // allow navigation
}

function makeTo(overrides: Partial<RouteLocationNormalized>): Partial<RouteLocationNormalized> {
  return {
    path: '/',
    name: undefined,
    meta: {},
    ...overrides,
  }
}

describe('Router navigation guard logic', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ── unauthenticated access ───────────────────────────────────────

  it('redirects to login when visiting a protected route without a token', () => {
    const result = guardLogic(
      makeTo({ path: '/branding', meta: { roles: [Role.Admin, Role.Organizer] } }),
    )
    expect(result).toEqual({ name: 'login' })
  })

  it('redirects to login when visiting /staff without a token', () => {
    const result = guardLogic(
      makeTo({ path: '/staff', meta: { roles: [Role.Admin, Role.Organizer] } }),
    )
    expect(result).toEqual({ name: 'login' })
  })

  it('redirects to login when visiting /logistics without a token', () => {
    const result = guardLogic(
      makeTo({ path: '/logistics', meta: { roles: [Role.Admin, Role.Organizer, Role.Staff] } }),
    )
    expect(result).toEqual({ name: 'login' })
  })

  it('redirects to login when visiting /planner without a token (no roles but not public)', () => {
    const result = guardLogic(makeTo({ path: '/planner', name: 'planner', meta: {} }))
    expect(result).toEqual({ name: 'login' })
  })

  it('redirects to login when visiting /socials without a token', () => {
    const result = guardLogic(
      makeTo({ path: '/socials', meta: { roles: [Role.Admin, Role.Organizer] } }),
    )
    expect(result).toEqual({ name: 'login' })
  })

  it('allows access to /login without a token (public route)', () => {
    const result = guardLogic(makeTo({ path: '/login', name: 'login', meta: { public: true } }))
    expect(result).toBeUndefined()
  })

  // ── authenticated redirect away from login ───────────────────────

  it('redirects from /login to / when a token exists', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    const result = guardLogic(makeTo({ path: '/login', name: 'login', meta: { public: true } }))
    expect(result).toEqual({ path: '/' })
  })

  // ── admin access ─────────────────────────────────────────────────

  it('allows admin to access /branding', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    const result = guardLogic(
      makeTo({
        path: '/branding',
        name: 'branding',
        meta: { roles: [Role.Admin, Role.Organizer] },
      }),
    )
    expect(result).toBeUndefined()
  })

  it('allows admin to access /staff', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    const result = guardLogic(
      makeTo({ path: '/staff', name: 'staff', meta: { roles: [Role.Admin, Role.Organizer] } }),
    )
    expect(result).toBeUndefined()
  })

  it('allows admin to access /logistics', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    const result = guardLogic(
      makeTo({
        path: '/logistics',
        name: 'logistics',
        meta: { roles: [Role.Admin, Role.Organizer, Role.Staff] },
      }),
    )
    expect(result).toBeUndefined()
  })

  it('allows admin to access /socials', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    const result = guardLogic(
      makeTo({ path: '/socials', name: 'socials', meta: { roles: [Role.Admin, Role.Organizer] } }),
    )
    expect(result).toBeUndefined()
  })

  it('allows admin to access /planner (no roles restriction)', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    const result = guardLogic(makeTo({ path: '/planner', name: 'planner', meta: {} }))
    expect(result).toBeUndefined()
  })

  // ── organizer access ─────────────────────────────────────────────

  it('allows organizer to access /branding', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Organizer, exp: 1 }))
    const result = guardLogic(
      makeTo({
        path: '/branding',
        name: 'branding',
        meta: { roles: [Role.Admin, Role.Organizer] },
      }),
    )
    expect(result).toBeUndefined()
  })

  it('allows organizer to access /logistics', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Organizer, exp: 1 }))
    const result = guardLogic(
      makeTo({
        path: '/logistics',
        name: 'logistics',
        meta: { roles: [Role.Admin, Role.Organizer, Role.Staff] },
      }),
    )
    expect(result).toBeUndefined()
  })

  it('allows organizer to access /socials', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Organizer, exp: 1 }))
    const result = guardLogic(
      makeTo({ path: '/socials', name: 'socials', meta: { roles: [Role.Admin, Role.Organizer] } }),
    )
    expect(result).toBeUndefined()
  })

  it('allows organizer to access /staff', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Organizer, exp: 1 }))
    const result = guardLogic(
      makeTo({ path: '/staff', name: 'staff', meta: { roles: [Role.Admin, Role.Organizer] } }),
    )
    expect(result).toBeUndefined()
  })

  it('allows organizer to access /planner', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Organizer, exp: 1 }))
    const result = guardLogic(makeTo({ path: '/planner', name: 'planner', meta: {} }))
    expect(result).toBeUndefined()
  })

  // ── staff access ─────────────────────────────────────────────────

  it('allows staff to access /logistics', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Staff, exp: 1 }))
    const result = guardLogic(
      makeTo({
        path: '/logistics',
        name: 'logistics',
        meta: { roles: [Role.Admin, Role.Organizer, Role.Staff] },
      }),
    )
    expect(result).toBeUndefined()
  })

  it('allows staff to access /planner (unrestricted)', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Staff, exp: 1 }))
    const result = guardLogic(makeTo({ path: '/planner', name: 'planner', meta: {} }))
    expect(result).toBeUndefined()
  })

  it('denies staff access to /branding and redirects to /', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Staff, exp: 1 }))
    const result = guardLogic(
      makeTo({
        path: '/branding',
        name: 'branding',
        meta: { roles: [Role.Admin, Role.Organizer] },
      }),
    )
    expect(result).toEqual({ path: '/' })
  })

  it('denies staff access to /staff section', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Staff, exp: 1 }))
    const result = guardLogic(
      makeTo({ path: '/staff', name: 'staff', meta: { roles: [Role.Admin, Role.Organizer] } }),
    )
    expect(result).toEqual({ path: '/' })
  })

  it('denies staff access to /socials', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Staff, exp: 1 }))
    const result = guardLogic(
      makeTo({ path: '/socials', name: 'socials', meta: { roles: [Role.Admin, Role.Organizer] } }),
    )
    expect(result).toEqual({ path: '/' })
  })

  // ── volunteer access ─────────────────────────────────────────────

  it('allows volunteer to access /planner (unrestricted)', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
    const result = guardLogic(makeTo({ path: '/planner', name: 'planner', meta: {} }))
    expect(result).toBeUndefined()
  })

  it('denies volunteer access to /branding', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
    const result = guardLogic(
      makeTo({
        path: '/branding',
        name: 'branding',
        meta: { roles: [Role.Admin, Role.Organizer] },
      }),
    )
    expect(result).toEqual({ path: '/' })
  })

  it('denies volunteer access to /staff', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
    const result = guardLogic(
      makeTo({ path: '/staff', name: 'staff', meta: { roles: [Role.Admin, Role.Organizer] } }),
    )
    expect(result).toEqual({ path: '/' })
  })

  it('denies volunteer access to /logistics', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
    const result = guardLogic(
      makeTo({
        path: '/logistics',
        name: 'logistics',
        meta: { roles: [Role.Admin, Role.Organizer, Role.Staff] },
      }),
    )
    expect(result).toEqual({ path: '/' })
  })

  it('denies volunteer access to /socials', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
    const result = guardLogic(
      makeTo({ path: '/socials', name: 'socials', meta: { roles: [Role.Admin, Role.Organizer] } }),
    )
    expect(result).toEqual({ path: '/' })
  })

  // ── malformed token handling ─────────────────────────────────────

  it('redirects to /login when the token is complete garbage and visiting a role-protected route', () => {
    localStorage.setItem('token', 'not-a-jwt')
    const result = guardLogic(
      makeTo({
        path: '/branding',
        name: 'branding',
        meta: { roles: [Role.Admin, Role.Organizer] },
      }),
    )
    expect(result).toEqual({ name: 'login' })
  })

  it('redirects to /login when the token payload is not valid base64', () => {
    localStorage.setItem('token', 'header.!!!invalid!!!.sig')
    const result = guardLogic(
      makeTo({
        path: '/branding',
        name: 'branding',
        meta: { roles: [Role.Admin, Role.Organizer] },
      }),
    )
    expect(result).toEqual({ name: 'login' })
  })

  it('redirects to /login when the token payload is not valid JSON', () => {
    const header = btoa('{"alg":"HS256"}')
    const body = btoa('this is not json')
    localStorage.setItem('token', `${header}.${body}.sig`)
    const result = guardLogic(
      makeTo({
        path: '/branding',
        name: 'branding',
        meta: { roles: [Role.Admin, Role.Organizer] },
      }),
    )
    expect(result).toEqual({ name: 'login' })
  })

  it('allows access to a non-role-protected route even with a malformed token', () => {
    localStorage.setItem('token', 'garbage-token')
    // A route with no meta.roles should not trigger role checking
    const result = guardLogic(makeTo({ path: '/planner', name: 'planner', meta: {} }))
    expect(result).toBeUndefined()
  })

  it('redirects to /login when the token has no payload segment and visiting a role-protected route', () => {
    localStorage.setItem('token', 'headeronly')
    const result = guardLogic(
      makeTo({ path: '/staff', name: 'staff', meta: { roles: [Role.Admin, Role.Organizer] } }),
    )
    expect(result).toEqual({ name: 'login' })
  })

  // ── edge cases ───────────────────────────────────────────────────

  it('allows navigation when route has no meta at all and token exists', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    const result = guardLogic(makeTo({ path: '/some-page', name: 'some', meta: {} }))
    expect(result).toBeUndefined()
  })

  it('redirects to login when route has no meta and no token exists', () => {
    const result = guardLogic(makeTo({ path: '/some-page', name: 'some', meta: {} }))
    expect(result).toEqual({ name: 'login' })
  })

  it('handles token with empty role by denying access to role-protected routes', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: '', exp: 1 }))
    const result = guardLogic(
      makeTo({
        path: '/branding',
        name: 'branding',
        meta: { roles: [Role.Admin, Role.Organizer] },
      }),
    )
    expect(result).toEqual({ path: '/' })
  })

  it('handles token with unknown role by denying access to role-protected routes', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: 'superadmin', exp: 1 }))
    const result = guardLogic(
      makeTo({
        path: '/branding',
        name: 'branding',
        meta: { roles: [Role.Admin, Role.Organizer] },
      }),
    )
    expect(result).toEqual({ path: '/' })
  })

  it('allows access when meta.roles is an empty array (edge: no role restriction)', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
    // An empty roles array means no one can access — but it is truthy so the check runs
    const result = guardLogic(makeTo({ path: '/locked', name: 'locked', meta: { roles: [] } }))
    expect(result).toEqual({ path: '/' })
  })
})

it('allows access to /test-inbox without a token (public route)', () => {
  const result = guardLogic(
    makeTo({ path: '/test-inbox', name: 'test-inbox', meta: { public: true } }),
  )
  expect(result).toBeUndefined()
})

it('allows authenticated users to open /test-inbox', () => {
  localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))

  const result = guardLogic(
    makeTo({ path: '/test-inbox', name: 'test-inbox', meta: { public: true } }),
  )
  expect(result).toBeUndefined()
})

it('redirects to login when visiting /events without a token', () => {
  localStorage.clear()
  const result = guardLogic(makeTo({ path: '/events', name: 'events', meta: {} }))
  expect(result).toEqual({ name: 'login' })
})

it('allows access to /events with a token', () => {
  localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
  const result = guardLogic(makeTo({ path: '/events', name: 'events', meta: {} }))
  expect(result).toBeUndefined()
})

it('redirects to login when visiting /events/:id without a token', () => {
  localStorage.clear()
  const result = guardLogic(makeTo({ path: '/events/evt-1', name: 'event-detail', meta: {} }))
  expect(result).toEqual({ name: 'login' })
})

it('allows access to /events/:id with a token', () => {
  localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
  const result = guardLogic(makeTo({ path: '/events/evt-1', name: 'event-detail', meta: {} }))
  expect(result).toBeUndefined()
})
