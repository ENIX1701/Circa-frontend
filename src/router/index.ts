import { createRouter, createWebHistory } from 'vue-router'
import LoginPanel from '@/views/LoginPanel.vue'
import type { Role } from '@/enums/role'
import { appSections } from '@/config/sections'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/branding',
      meta: { roles: [Role.Admin, Role.Organizer] },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPanel,
      meta: { public: true },
    },
    ...appSections.map((s) => ({
      path: s.path,
      name: s.name,
      component: s.component,
      meta: { roles: s.roles },
    })),
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

  if (to.meta.roles && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const allowedRoles = to.meta.roles as Role[]

      if (!allowedRoles.includes(payload.role)) {
        return { path: '/' }
      }
    } catch {
      return { name: 'login' }
    }
  }
})

export default router
