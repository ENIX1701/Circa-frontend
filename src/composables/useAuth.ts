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

  return { claims, role, isLoggedIn, logout, hasRole }
}
