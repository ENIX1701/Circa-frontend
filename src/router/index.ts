import { createRouter, createWebHistory } from 'vue-router'
import BrandingDashboard from '@/views/BrandingDashboard.vue'
import StaffDashboard from '@/views/StaffDashboard.vue'
import LogisticsDashboard from '@/views/LogisticsDashboard.vue'
import PlannerDashboard from '@/views/PlannerDashboard.vue'
import SocialsDashboard from '@/views/SocialsDashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/branding',
    },
    {
      path: '/branding',
      name: 'branding',
      component: BrandingDashboard,
    },
    {
      path: '/staff',
      name: 'staff',
      component: StaffDashboard,
    },
    {
      path: '/logistics',
      name: 'logistics',
      component: LogisticsDashboard,
    },
    {
      path: '/planner',
      name: 'planner',
      component: PlannerDashboard,
    },
    {
      path: '/socials',
      name: 'socials',
      component: SocialsDashboard,
    },
  ],
})

export default router
