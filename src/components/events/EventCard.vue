<script setup lang="ts">
import type { EventRecord } from '@/composables/useEvents'
import EventStatusBadge from '../events/EventStatusBadge.vue'
import AppSurface from '../ui/AppSurface.vue'
import { ChevronRight } from 'lucide-vue-next'

defineProps<{
  event: EventRecord
}>()

const emit = defineEmits<{
  open: [id: string]
}>()

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
</script>

<template>
  <AppSurface
    as="button"
    type="button"
    radius="2xl"
    class="app-clickable-surface w-full text-left"
    @click="emit('open', event.slug || event.id)"
  >
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div class="space-y-2">
        <h3 class="text-lg font-bold text-(--app-text)">{{ event.name }}</h3>
        <p class="text-sm leading-6 text-(--app-text-muted)">
          {{ event.description || 'No description yet :c' }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <EventStatusBadge :status="event.status" />
        <ChevronRight class="app-clickable-surface__arrow h-4 w-4 shrink-0" aria-hidden="true" />
      </div>
    </div>

    <div class="mt-4 space-y-1 text-sm text-(--app-text-muted)">
      <p>{{ event.venue }}</p>
      <p>{{ formatDate(event.starts_at) }} to {{ formatDate(event.ends_at) }}</p>
    </div>
  </AppSurface>
</template>
