<script setup lang="ts">
import type { EventRecord, EventStatus } from '@/composables/useEvents'
import AppBadge from '../ui/AppBadge.vue'

defineProps<{
  event: EventRecord
}>()

const emit = defineEmits<{
  open: [id: string]
}>()

function statusLabel(status: EventStatus) {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'active':
      return 'Active'
    case 'closed':
      return 'Closed'
    case 'archived':
      return 'Archived'
    case 'pending_destruction':
      return 'Pending destruction'
  }
}

function statusTone(status: EventStatus) {
  switch (status) {
    case 'active':
      return 'success'
    case 'pending_destruction':
      return 'danger'
    case 'closed':
      return 'warning'
    case 'archived':
      return 'default'
    case 'draft':
      return 'accent'
  }
}

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

      <AppBadge :tone="statusTone(event.status)">
        {{ statusLabel(event.status) }}
      </AppBadge>
    </div>

    <div class="mt-4 space-y-1 text-sm text-(--app-text-muted)">
      <p>{{ event.venue }}</p>
      <p>{{ formatDate(event.starts_at) }} to {{ formatDate(event.ends_at) }}</p>
    </div>
  </button>
</template>
