import 'vue-router'
import type { Role } from '@/enums/Role'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    roles?: Role[]
  }
}
