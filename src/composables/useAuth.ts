import type { Role } from '@/enums/Role'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

// okay so this is really weird and frontend specific
// but I've found out the hard way that just logging in doesn't refresh the navbar
// so as a workaround I'm adding a ref
// that will force the refresh once updated >:3c
const tokenVersion = ref(0)

// this makes it work (hopefully)
export function notifyTokenChange() {
  tokenVersion.value++
}

function parseToken() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload)) as { sub: string; role: string; exp: number }
  } catch {
    return null
  }
}

export const useAuth = () => {
  const router = useRouter()

  const claims = computed(() => {
    tokenVersion.value // should suffice to notify/trigger the ref
    return parseToken()
  })
  const role = computed(() => (claims.value?.role as Role) ?? null)
  const isLoggedIn = computed(() => claims.value !== null)

  // no server-side logout for now
  function logout() {
    localStorage.removeItem('token')
    notifyTokenChange()
    router.push({ name: 'login' })
  }

  function hasRole(...roles: Role[]) {
    return role.value !== null && roles.includes(role.value)
  }

  async function requestMagicLink(email: string): Promise<string> {
    const res = await fetch('/auth/request-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.message ?? 'Failed to request magic link')
    }

    const data = await res.json()
    return data.message
  }

  async function verifyMagicToken(token: string): Promise<void> {
    const res = await fetch(`/auth/verify?token=${encodeURIComponent(token)}`)

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Invalid or expired magic link')
    }

    const data = await res.json()
    localStorage.setItem('token', data.token)
    notifyTokenChange()
  }

  return { claims, role, isLoggedIn, logout, hasRole, requestMagicLink, verifyMagicToken }
}
