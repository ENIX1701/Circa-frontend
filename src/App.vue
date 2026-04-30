<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventTheme } from './composables/useEventTheme'

import DesktopSidebar from '@/components/DesktopSidebar.vue'
import MobileNavbar from '@/components/MobileNavbar.vue'
import AppPanel from './components/ui/AppPanel.vue'
import AppToastHost from './components/ui/AppToastHost.vue'
import { AUTH_EXPIRED_EVENT } from './composables/useEvents'

const route = useRoute()
const isPublicRoute = computed(() => Boolean(route.meta.public))

const router = useRouter()

function handleAuthExpired() {
  if (route.name !== 'login') {
    void router.replace({ name: 'login' })
  }
}

onMounted(() => window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired))
onBeforeUnmount(() => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired))

useEventTheme()
</script>

<template>
  <div class="app-shell">
    <AppToastHost />

    <main
      v-if="isPublicRoute"
      class="flex min-h-screen items-center justify-center px-6 py-10 md:px-10"
    >
      <div class="w-full max-w-xl">
        <AppPanel class="p-8 md:p-10">
          <RouterView />
        </AppPanel>
      </div>
    </main>

    <div v-else class="flex min-h-screen flex-col xl:flex-row">
      <DesktopSidebar class="hidden shrink-0 xl:block" />
      <MobileNavbar class="block shrink-0 xl:hidden" />

      <main
        class="min-w-0 flex-1 px-4 pb-[calc(10rem+env(safe-area-inset-bottom))] pt-6 md:px-8 md:pb-[calc(10rem+env(safe-area-inset-bottom))] md:pt-8 lg:pb-[calc(10rem+env(safe-area-inset-bottom))] xl:pb-8"
      >
        <RouterView />
      </main>
    </div>
  </div>
</template>
