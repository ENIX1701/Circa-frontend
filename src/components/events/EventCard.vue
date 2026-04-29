<script setup lang="ts">
import type { EventRecord } from '@/composables/useEvents'
import EventStatusBadge from '../events/EventStatusBadge.vue'

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
  <button
    type="button"
    class="w-full rounded-2xl border border-(--app-border) bg-(--app-bg-subtle) p-5 text-left"
    @click="emit('open', event.id)"
  >
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div class="space-y-2">
        <h3 class="text-lg font-bold text-(--app-text)">{{ event.name }}</h3>
        <p class="text-sm leading-6 text-(--app-text-muted)">
          {{ event.description || 'No description yet :c' }}
        </p>
      </div>

      <EventStatusBadge :status="event.status" />
    </div>

    <div class="mt-4 space-y-1 text-sm text-(--app-text-muted)">
      <p>{{ event.venue }}</p>
      <p>{{ formatDate(event.starts_at) }} to {{ formatDate(event.ends_at) }}</p>
    </div>
  </button>
</template>
