<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { appSections, eventSections } from '@/config/sections'

interface NavItem {
  key: string
  title: string
  to: string
  icon: Component
  exact: boolean
}

const route = useRoute()

const eventId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

const inEventWorkspace = computed(() => eventId.value.length > 0)

const navItems = computed<NavItem[]>(() => {
  if (!inEventWorkspace.value) {
    return appSections.map((section) => ({
      key: section.name,
      title: section.title,
      to: section.path,
      icon: section.icon,
      exact: true,
    }))
  }
  
  return eventSections.map((section) => ({
    key: section.key,
    title: section.title,
    to: `/events/${eventId.value}${section.suffix}`,
    icon: section.icon,
    exact: section.suffix === '',
  }))
})

function isActive(item: NavItem) {
  if (item.exact) {
    return route.path === item.to
  }

  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}
</script>

<!-- redesign because I said so... -->
<template>
  <!-- since this should be done properly -->
   <!-- I'll have to stick to the big-boy html tags... -->
  <aside class="hidden w-72 shrink-0 xl:flex">
    <div class="sticky top-0 flex h-screen w-full flex-col bg-[rgba(10,10,20,0.8)] px-5 py-6 backdrop-blur-xl">
      <RouterLink to="/events" class="block rounded-2xl bg-white/5 px-4 py-4">
        <p class="section-label">Circa</p>
        <h1 class="mt-2 text-xl font-semibold tracking-tight">Event workspace</h1>
        <p class="mt-2 text-sm text-(--color-text-muted)">
          event name here maybe??
        </p>
      </RouterLink>
      <div class="mt-8">
        <p class="section-label">
          Navigation
        </p>
      </div>

      <nav class="mt-4 space-y-2">
        <RouterLink
        v-for="item in navItems"
        :key="item.key"
        :to="item.to"
        class="flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-medium transition"
        :class="isActive(item) ? 'border border-white/15 bg-white/10 text-white' : 'border border-transparent text-(--color-text-muted)'"
        >
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span>{{ item.title }}</span>
        </RouterLink>
      </nav>

      <div
        v-if="inEventWorkspace"
        class="mt-auto rounded-2xl border border-whtie/10 bg-white/5 px-4 py-4"
      >
        <p class="section-label">Current event</p>
        <p class="mt-2 break-all text-sm font-medium text-white">{{  eventId }}</p>
      </div>
    </div>
  </aside>
</template>
