<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useEventTheme } from './composables/useEventTheme'

import DesktopSidebar from '@/components/DesktopSidebar.vue'
import MobileNavbar from '@/components/MobileNavbar.vue'

const route = useRoute()
const isPublicRoute = computed(() => Boolean(route.meta.public))

useEventTheme()
</script>

<template>
  <div class="app-shell">
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        class="absolute -left-20 -top-16 h-72 w-72 rounded-full opacity-30 blur-[120px]"
        style="background-color: var(--color-primary)"
      />
      <div
        class="absolute -bottom-24 -right-12 h-80 w-80 rounded-full opacity-20 blur-[140px]"
        style="background-color: var(--color-secondary)"
      />
      <div
        class="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full opacity-10 blur-[120px]"
        style="background-color: var(--color-primary)"
      />
    </div>

    <main
      v-if="isPublicRoute"
      class="relative flex min-h-screen items-center justify-center px-6 py-10 md:px-10"
    >
      <div class="w-full max-w-xl">
        <section class="glass-panel glass-panel--strong p-8 md:p-10">
          <RouterView />
        </section>
      </div>
    </main>

    <div v-else class="relative flex min-h-screen flex-col lg:flex-row">
      <MobileNavbar class="block shrink-0 lg:hidden" />
      <DesktopSidebar class="mx-4 my-8 hidden h-[calc(100vh-4rem)] shrink-0 lg:block lg:w-80" />

      <main class="m-8 min-w-0 flex-1 space-y-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
