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

const gridClass = computed(() => navItems.value.length === 1 ? 'grid-cols-1' : 'grid-cols-4')

function isActive(item: NavItem) {
  if (item.exact) {
    return route.path === item.to
  }

  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-40 bg-[rgba(10,10,20,0.9)] px-2 py-2 backdrop-blur-xl xl:hidden">
    <div class="grid gap-2" :class="gridClass">
      <RouterLink
        v-for="item in navItems"
        :key="item.key"
        :to="item.to"
        class="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center transition"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span class="font-medium leading-none">{{ item.title }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
