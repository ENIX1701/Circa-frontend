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

const eventId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

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

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-(--app-border) bg-(--app-surface) px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 xl:hidden"
  >
    <div class="grid auto-cols-fr grid-flow-col gap-1 overflow-x-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.key"
        :to="item.to"
        class="flex min-w-20 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center text-xs font-semibold"
        :class="
          isActive(item)
            ? 'border-(--app-accent) bg-(--app-bg-subtle) text-(--app-text)'
            : 'border-transparent text-(--app-text-muted)'
        "
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span class="leading-none">{{ item.title }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
