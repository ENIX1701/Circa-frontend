<script setup lang="ts">
import type { EventRecord, EventStatus } from '@/composables/useEvents'
import AppPanel from '../ui/AppPanel.vue'
import AppBadge from '../ui/AppBadge.vue'

defineProps<{
  event: EventRecord
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
  <AppPanel tone="muted" class="space-y-6">
    <div>
      <p class="section-label">Metadata</p>
      <h2 class="mt-2 text-2xl font-black text-(--app-text)">Overview</h2>
    </div>

    <div class="meta-grid">
      <div class="meta-row">
        <span class="meta-label">Status</span>
        <span class="meta-value">
          <AppBadge :tone="statusTone(event.status)">
            {{ statusLabel(event.status) }}
          </AppBadge>
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
