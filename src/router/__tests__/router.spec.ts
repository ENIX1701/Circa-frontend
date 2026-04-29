import { beforeEach, describe, expect, it } from 'vitest'
import router from '@/router'

function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

async function navigateTo(path: string) {
  await router.push(path)
  await router.isReady()
  return router.currentRoute.value
}

describe('router', () => {
  beforeEach(async () => {
    localStorage.clear()
    await router.push('/login')
    await router.isReady()
  })

  it('defines the current event workspace routes', () => {
    expect(router.getRoutes().map((route) => route.name)).toEqual(
      expect.arrayContaining([
        'events',
        'event-detail',
        'event-planner',
        'event-branding',
        'event-socials',
        'event-collaborators',
        'event-staff',
        'login',
        'test-inbox',
      ]),
    )
  })

  it('redirects unauthenticated protected routes to login', async () => {
    const route = await navigateTo('/events/evt-1/planner')

    expect(route.name).toBe('login')
  })

  it('allows unauthenticated public routes', async () => {
    const route = await navigateTo('/test-inbox?email=ada@example.com')

    expect(route.name).toBe('test-inbox')
    expect(route.query.email).toBe('ada@example.com')
  })

  it('allows authenticated users into event routes', async () => {
    localStorage.setItem('token', fakeJwt({ sub: 'user-1', role: 'staff', exp: 9999999999 }))

    const route = await navigateTo('/events/evt-1/socials')

    expect(route.name).toBe('event-socials')
    expect(route.params.id).toBe('evt-1')
  })

  it('redirects authenticated users away from login without a magic token', async () => {
    await navigateTo('/test-inbox')
    localStorage.setItem('token', fakeJwt({ sub: 'user-1', role: 'staff', exp: 9999999999 }))

    const route = await navigateTo('/login')

    expect(route.path).toBe('/events')
  })

  it('keeps authenticated users on login when verifying a magic token', async () => {
    localStorage.setItem('token', fakeJwt({ sub: 'user-1', role: 'staff', exp: 9999999999 }))

    const route = await navigateTo('/login?token=new-token')

    expect(route.name).toBe('login')
    expect(route.query.token).toBe('new-token')
  })

  it('redirects the root route to events for signed in users', async () => {
    localStorage.setItem('token', fakeJwt({ sub: 'user-1', role: 'owner', exp: 9999999999 }))

    const route = await navigateTo('/')

    expect(route.name).toBe('events')
  })
})
