import { useRouter } from 'vue-router'

export const useAuth = () => {
  const router = useRouter()

  // no server-side logout for now
  function logout() {
    localStorage.removeItem('token')
    router.push({ name: 'login' })
  }

  return { logout }
}
