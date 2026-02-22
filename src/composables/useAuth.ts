import type { Role } from '@/enums/role'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

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

  const claims = computed(() => parseToken())
  const role = computed(() => (claims.value?.role as Role) ?? null)
  const isLoggedIn = computed(() => claims.value !== null)

  // no server-side logout for now
  function logout() {
    localStorage.removeItem('token')
    router.push({ name: 'login' })
  }

  function hasRole(...roles: Role[]) {
    return role.value !== null && roles.includes(role.value)
  }

  return { claims, role, isLoggedIn, logout, hasRole }
}
