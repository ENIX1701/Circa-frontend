import type { Role } from '@/enums/Role'
import { CalendarRange, MessageCircleDashed, Package2, Palette, Users } from 'lucide-vue-next'
import type { Component } from 'vue'

export interface AppSection {
  path: string
  name: string
  component: () => Promise<Component>
  icon: Component
  title: string
  roles?: Role[]
}

export const appSections: AppSection[] = [
  {
    path: '/branding',
    name: 'branding',
    component: () => import('@/views/BrandingDashboard.vue'),
    icon: Palette,
    title: 'Branding',
    roles: [Role.Admin, Role.Organizer],
  },
  {
    path: '/staff',
    name: 'staff',
    component: () => import('@/views/StaffDashboard.vue'),
    icon: Users,
    title: 'Staff',
    roles: [Role.Admin, Role.Organizer],
  },
  {
    path: '/logistics',
    name: 'logistics',
    component: () => import('@/views/LogisticsDashboard.vue'),
    icon: Package2,
    title: 'Logistics',
    roles: [Role.Admin, Role.Organizer, Role.Staff],
  },
  {
    path: '/planner',
    name: 'planner',
    component: () => import('@/views/PlannerDashboard.vue'),
    icon: CalendarRange,
    title: 'Planner',
  },
  {
    path: '/socials',
    name: 'socials',
    component: () => import('@/views/SocialsDashboard.vue'),
    icon: MessageCircleDashed,
    title: 'Socials',
    roles: [Role.Admin, Role.Organizer],
  },
]
