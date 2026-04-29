<script setup lang="ts">
import type { EventRecord } from '@/composables/useEvents'
import AppPanel from '../ui/AppPanel.vue'
import EventStatusBadge from '../events/EventStatusBadge.vue'
import AppPanelHeader from '../ui/AppPanelHeader.vue'

defineProps<{
  event: EventRecord
}>()

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
</script>

<template>
  <AppPanel tone="muted" class="space-y-6">
    <AppPanelHeader eyebrow="Metadata" title="Overview" />

    <div class="meta-grid">
      <div class="meta-row">
        <span class="meta-label">Status</span>
        <span class="meta-value">
          <EventStatusBadge :status="event.status" />
        </span>
      </div>

      <div class="meta-row">
        <span class="meta-label">Slug</span>
        <span class="meta-value">{{ event.slug }}</span>
      </div>

      <div class="meta-row">
        <span class="meta-label">Venue</span>
        <span class="meta-value">{{ event.venue }}</span>
      </div>

      <div class="meta-row">
        <span class="meta-label">Timezone</span>
        <span class="meta-value">{{ event.timezone }}</span>
      </div>

      <div class="meta-row">
        <span class="meta-label">Starts</span>
        <span class="meta-value">{{ formatDate(event.starts_at) }}</span>
      </div>

      <div class="meta-row">
        <span class="meta-label">Ends</span>
        <span class="meta-value">{{ formatDate(event.ends_at) }}</span>
      </div>

      <div class="meta-row">
        <span class="meta-label">Your role :D</span>
        <span class="meta-value">{{ event.current_user_role }}</span>
      </div>

      <div v-if="event.destruction_requested_at" class="meta-row">
        <span class="meta-label">Destruction requested</span>
        <span class="meta-value">{{ formatDate(event.destruction_requested_at) }}</span>
      </div>
    </div>
  </AppPanel>
</template>
