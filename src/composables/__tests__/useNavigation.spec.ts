import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNavigation } from '@/composables/useNavigation'
import { notifyTokenChange } from '@/composables/useAuth'
import { Role } from '@/enums/Role'
import { appSections } from '@/config/sections'

// Mock vue-router
const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

// Helper: build a fake JWT with the given payload
function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fake-signature`
}

describe('useNavigation', () => {
  beforeEach(() => {
    localStorage.clear()
    pushMock.mockReset()
    notifyTokenChange()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ── no token / logged-out ────────────────────────────────────────

  it('returns only sections with no role restriction when no token exists', () => {
    const { sections } = useNavigation()

    const unrestricted = appSections.filter((s) => !s.roles)
    expect(sections.value.length).toBe(unrestricted.length)
    for (const s of sections.value) {
      expect(s.roles).toBeUndefined()
    }
  })

  // ── admin ────────────────────────────────────────────────────────

  it('returns all sections for an admin user', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    expect(sections.value.length).toBe(appSections.length)
  })

  it('includes branding section for admin', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    const names = sections.value.map((s) => s.name)
    expect(names).toContain('branding')
  })

  it('includes socials section for admin', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    const names = sections.value.map((s) => s.name)
    expect(names).toContain('socials')
  })

  // ── organizer ────────────────────────────────────────────────────

  it('returns all sections for an organizer user', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Organizer, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    expect(sections.value.length).toBe(appSections.length)
  })

  it('includes staff section for organizer', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Organizer, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    const names = sections.value.map((s) => s.name)
    expect(names).toContain('staff')
  })

  // ── staff ────────────────────────────────────────────────────────

  it('includes logistics and planner for staff but excludes branding, staff, and socials', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Staff, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    const names = sections.value.map((s) => s.name)

    expect(names).toContain('logistics')
    expect(names).toContain('planner')
    expect(names).not.toContain('branding')
    expect(names).not.toContain('staff')
    expect(names).not.toContain('socials')
  })

  it('returns the correct number of sections for staff', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Staff, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    // Staff has access to: logistics (admin/organizer/staff), planner (no restriction)
    const expected = appSections.filter((s) => !s.roles || s.roles.includes(Role.Staff))
    expect(sections.value.length).toBe(expected.length)
  })

  // ── volunteer ────────────────────────────────────────────────────

  it('returns only unrestricted sections for volunteer', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()

    const unrestricted = appSections.filter((s) => !s.roles || s.roles.includes(Role.Volunteer))
    expect(sections.value.length).toBe(unrestricted.length)
  })

  it('does not include branding for volunteer', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    const names = sections.value.map((s) => s.name)
    expect(names).not.toContain('branding')
  })

  it('does not include staff section for volunteer', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    const names = sections.value.map((s) => s.name)
    expect(names).not.toContain('staff')
  })

  it('does not include logistics for volunteer', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    const names = sections.value.map((s) => s.name)
    expect(names).not.toContain('logistics')
  })

  it('includes planner for volunteer (unrestricted)', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    const names = sections.value.map((s) => s.name)
    expect(names).toContain('planner')
  })

  // ── reactivity ───────────────────────────────────────────────────

  it('updates sections reactively when token changes', async () => {
    const { sections } = useNavigation()

    // Initially no token — only unrestricted
    const initial = sections.value.length
    const unrestricted = appSections.filter((s) => !s.roles).length
    expect(initial).toBe(unrestricted)

    // Set admin token
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    notifyTokenChange()

    // Now should see all sections
    expect(sections.value.length).toBe(appSections.length)
  })

  it('reduces visible sections when downgrading from admin to volunteer', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    expect(sections.value.length).toBe(appSections.length)

    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Volunteer, exp: 1 }))
    notifyTokenChange()

    const volunteerExpected = appSections.filter(
      (s) => !s.roles || s.roles.includes(Role.Volunteer),
    )
    expect(sections.value.length).toBe(volunteerExpected.length)
  })

  it('returns only unrestricted sections after logout clears the token', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()
    expect(sections.value.length).toBe(appSections.length)

    localStorage.removeItem('token')
    notifyTokenChange()

    const unrestricted = appSections.filter((s) => !s.roles)
    expect(sections.value.length).toBe(unrestricted.length)
  })

  // ── section metadata ─────────────────────────────────────────────

  it('preserves section paths, names, and titles', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()

    for (const section of sections.value) {
      const source = appSections.find((s) => s.name === section.name)
      expect(source).toBeDefined()
      expect(section.path).toBe(source!.path)
      expect(section.title).toBe(source!.title)
    }
  })

  it('every returned section has a component loader', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()

    for (const section of sections.value) {
      expect(typeof section.component).toBe('function')
    }
  })

  it('every returned section has an icon component', () => {
    localStorage.setItem('token', fakeJwt({ sub: 'u', role: Role.Admin, exp: 1 }))
    notifyTokenChange()

    const { sections } = useNavigation()

    for (const section of sections.value) {
      expect(section.icon).toBeDefined()
    }
  })
})
