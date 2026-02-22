import { createRouter, createWebHistory } from 'vue-router'
import BrandingDashboard from '@/views/BrandingDashboard.vue'
import StaffDashboard from '@/views/StaffDashboard.vue'
import LogisticsDashboard from '@/views/LogisticsDashboard.vue'
import LoginPanel from '@/views/LoginPanel.vue'
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
      path: '/login',
      name: 'login',
      component: LoginPanel,
      meta: { public: true },
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

router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  if (!token && !to.meta.public) {
    return { name: 'login' }
  }

  if (token && to.name === 'login') {
    return { path: '/' }
  }
})

export default router
