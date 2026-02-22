import { computed } from 'vue'
import { useAuth } from './useAuth'
import { appSections } from '@/config/sections'

export const useNavigation = () => {
  const { hasRole } = useAuth()

  const sections = computed(() => appSections.filter((s) => !s.roles || hasRole(...s.roles)))

  return { sections }
}
