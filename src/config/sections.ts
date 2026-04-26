import {
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  MessageCircleDashed,
  Palette,
  Users,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import { Role } from '@/enums/Role'

export interface AppSection {
  path: string
  name: string
  component: () => Promise<Component>
  icon: Component
  title: string
  roles?: Role[]
}

export interface EventSection {
  key: string
  title: string
  suffix: string
  icon: Component
  component: () => Promise<Component>
}

export const appSections: AppSection[] = [
  {
    path: '/events',
    name: 'events',
    component: () => import('@/views/EventsHub.vue'),
    icon: CalendarDays,
    title: 'Events',
  },
]

export const eventSections: EventSection[] = [
  {
    key: 'overview',
    title: 'Overview',
    suffix: '',
    icon: LayoutGrid,
    component: () => import('@/views/EventDetail.vue'),
  },
  {
    key: 'planner',
    title: 'Planner',
    suffix: '/planner',
    icon: CalendarRange,
    component: () => import('@/views/PlannerDashboard.vue'),
  },
  {
    key: 'branding',
    title: 'Branding',
    suffix: '/branding',
    icon: Palette,
    component: () => import('@/views/BrandingDashboard.vue'),
  },
  {
    key: 'socials',
    title: 'Socials',
    suffix: '/socials',
    icon: MessageCircleDashed,
    component: () => import('@/views/SocialsDashboard.vue'),
  },
  {
    key: 'collaborators',
    title: 'Collaborators',
    suffix: '/collaborators',
    icon: Users,
    component: () => import('@/views/CollaboratorsDashboard.vue'),
  },
  {
    key: 'staff',
    title: 'Staff',
    suffix: '/staff',
    icon: Users,
    component: () => import('@/views/StaffDashboard.vue'),
  },
]
