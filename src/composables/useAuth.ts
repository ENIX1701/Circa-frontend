import type { Role } from '@/enums/Role'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export interface TestInboxLinkPreview {
  email: string
  magic_link: string
  requested_at: string
  expires_at: string
}

export type TestInboxLookupResult =
  | { ok: true; data: TestInboxLinkPreview }
  | { ok: false; status: number; message: string }

const env = import.meta.env as ImportMetaEnv & Record<string, string | undefined>

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
    if (!payload) return null

    return JSON.parse(atob(payload)) as { sub: string; role: string; exp: number }
  } catch {
    return null
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = await response.json().catch(() => null)
    return body?.message ?? body?.error ?? 'Request failed'
  }

  return (await response.text()) || 'Request failed'
}

export const useAuth = () => {
  const router = useRouter()

  const claims = computed(() => {
    tokenVersion.value // should suffice to notify/trigger the ref
    return parseToken()
  })
  const role = computed(() => (claims.value?.role as Role) ?? null)
  const isLoggedIn = computed(() => claims.value !== null)
  const isTestInboxPreviewAvailable = env.DEV || env.VITE_AUTH_DELIVERY_MODE === 'outbox'

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
      throw new Error(await readErrorMessage(res))
    }

    const data = await res.json()
    return data.message
  }

  async function verifyMagicToken(token: string): Promise<void> {
    const res = await fetch(`/auth/verify?token=${encodeURIComponent(token)}`)

    if (!res.ok) {
      throw new Error(await readErrorMessage(res))
    }

    const data = await res.json()
    localStorage.setItem('token', data.token)
    notifyTokenChange()
  }

  async function getLatestTestInboxLink(email: string): Promise<TestInboxLookupResult> {
    const res = await fetch(`/auth/test-inbox/latest?email=${encodeURIComponent(email)}`)

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: await readErrorMessage(res),
      }
    }

    return { ok: true, data: (await res.json()) as TestInboxLinkPreview }
  }

  return {
    claims,
    role,
    isLoggedIn,
    isTestInboxPreviewAvailable,
    logout,
    hasRole,
    requestMagicLink,
    verifyMagicToken,
    getLatestTestInboxLink,
  }
}
