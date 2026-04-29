import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNavigation } from '@/composables/useNavigation'
import { notifyTokenChange } from '@/composables/useAuth'
import { appSections } from '@/config/sections'
import { Role } from '@/enums/Role'

const pushMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

describe('useNavigation', () => {
  beforeEach(() => {
    localStorage.clear()
    pushMock.mockReset()
    notifyTokenChange()
  })

  it('returns unrestricted app sections when logged out', () => {
    const { sections } = useNavigation()

    expect(sections.value).toEqual(appSections.filter((section) => !section.roles))
  })

  it('returns the current app-level Events section for every known role', () => {
    for (const role of Object.values(Role)) {
      localStorage.setItem('token', fakeJwt({ sub: 'user-1', role, exp: 9999999999 }))
      notifyTokenChange()

      const { sections } = useNavigation()

      expect(sections.value.map((section) => section.name)).toEqual(['events'])
      expect(sections.value[0]).toMatchObject({
        path: '/events',
        title: 'Events',
      })
    }
  })

  it('reacts to token changes without mutating the source section config', () => {
    const { sections } = useNavigation()

    expect(sections.value).toHaveLength(1)
    localStorage.setItem('token', fakeJwt({ sub: 'user-1', role: Role.Admin, exp: 9999999999 }))
    notifyTokenChange()

    expect(sections.value).toHaveLength(1)
    expect(sections.value[0]).toBe(appSections[0])
  })
})
