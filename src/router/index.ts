import { createRouter, createWebHistory } from 'vue-router'
import LoginPanel from '@/views/LoginPanel.vue'
import TestInbox from '@/views/TestInbox.vue'
import EventDetail from '@/views/EventDetail.vue'
import PlannerDashboard from '@/views/PlannerDashboard.vue'
import BrandingDashboard from '@/views/BrandingDashboard.vue'
import SocialsDashboard from '@/views/SocialsDashboard.vue'
import EventsHub from '@/views/EventsHub.vue'
import CollaboratorsDashboard from '@/views/CollaboratorsDashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/events',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPanel,
      meta: { public: true },
    },
    {
      path: '/test-inbox',
      name: 'test-inbox',
      component: TestInbox,
      meta: { public: true },
    },
    {
      path: '/events',
      name: 'events',
      component: EventsHub,
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: EventDetail,
    },
    {
      path: '/events/:id/planner',
      name: 'event-planner',
      component: PlannerDashboard,
    },
    {
      path: '/events/:id/branding',
      name: 'event-branding',
      component: BrandingDashboard,
    },
    {
      path: '/events/:id/socials',
      name: 'event-socials',
      component: SocialsDashboard,
    },
    {
      path: '/events/:id/collaborators',
      name: 'event-collaborators',
      component: CollaboratorsDashboard,
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  if (!token && !to.meta.public) {
    return { name: 'login' }
  }

  if (token && to.name === 'login') {
    if (to.query.token) {
      return
    }

    return { path: '/' }
  }
})

export default router
