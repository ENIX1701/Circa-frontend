import { createRouter, createWebHistory } from 'vue-router'
import BrandingDashboard from '../views/BrandingDashboard.vue'

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
  ],
})

export default router
