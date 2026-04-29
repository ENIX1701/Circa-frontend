<script setup lang="ts">
import { ref, computed, watch, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { appSections, eventSections } from '@/config/sections'
import { useEvents, type EventRecord } from '@/composables/useEvents'

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

const { getEvent } = useEvents()

const currentEvent = ref<EventRecord | null>(null)
const eventLoading = ref(false)

async function loadCurrentEvent(id: string) {
  currentEvent.value = null

  if (!id) return

  eventLoading.value = true

  try {
    currentEvent.value = await getEvent(id)
  } catch {
    currentEvent.value = null
  } finally {
    eventLoading.value = false
  }
}

watch(eventId, (id) => void loadCurrentEvent(id), { immediate: true })
</script>

<template>
  <aside class="sticky top-0 h-screen w-72 border-r border-(--app-border) bg-(--app-surface)">
    <div class="flex h-full flex-col px-5 py-6">
      <RouterLink to="/events" class="block border-b border-(--app-border) pb-5">
        <p class="section-label">Circa</p>
        <h1 class="mt-2 text-xl font-bold tracking-tight text-(--app-text)">Event workspace</h1>
        <p class="mt-2 text-sm text-(--app-text-muted)">
          {{ currentEvent?.name || (eventLoading ? 'Loading event...' : 'Your event hub') }}
        </p>
      </RouterLink>
      <div class="mt-8">
        <p class="section-label">Navigation</p>

        <nav class="mt-4 space-y-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.key"
            :to="item.to"
            class="app-nav-item app-nav-item--desktop"
            :class="{ 'app-nav-item--active': isActive(item) }"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0" />
            <span>{{ item.title }}</span>
          </RouterLink>
        </nav>
      </div>
      <div v-if="inEventWorkspace" class="mt-auto border-t border-(--app-border) pt-5">
        <p class="section-label">Event ID</p>
        <p class="mt-2 break-all font-mono text-xs text-(--app-text-muted)">{{ eventId }}</p>
      </div>
    </div>
  </aside>
</template>
