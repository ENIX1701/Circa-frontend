import {
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  MessageCircleDashed,
  Package2,
  Palette,
  Users,
} from 'lucide-vue-next'
import type { Component } from 'vue'

export interface AppSection {
  path: string
  name: string
  component: () => Promise<Component>
  icon: Component
  title: string
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
]
