<script setup lang="ts">
import type { EventRecord } from '@/composables/useEvents'
import AppPanel from '../ui/AppPanel.vue'
import EventStatusBadge from '../events/EventStatusBadge.vue'
import AppPanelHeader from '../ui/AppPanelHeader.vue'
import { CalendarClock, Clock, Link2, MapPin, Shield, UserCircle } from 'lucide-vue-next'

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
        <span class="meta-label inline-flex items-center gap-2"
          ><Shield class="h-4 w-4" aria-hidden="true" /> Status</span
        >
        <span class="meta-value">
          <EventStatusBadge :status="event.status" />
        </span>
      </div>

      <div class="meta-row">
        <span class="meta-label inline-flex items-center gap-2"
          ><Link2 class="h-4 w-4" aria-hidden="true" /> Slug</span
        >
        <span class="meta-value">{{ event.slug }}</span>
      </div>

      <div class="meta-row">
        <span class="meta-label inline-flex items-center gap-2"
          ><MapPin class="h-4 w-4" aria-hidden="true" /> Venue</span
        >
        <span class="meta-value">{{ event.venue }}</span>
      </div>

      <div class="meta-row">
        <span class="meta-label inline-flex items-center gap-2"
          ><Clock class="h-4 w-4" aria-hidden="true" /> Timezone</span
        >
        <span class="meta-value">{{ event.timezone }}</span>
      </div>

      <div class="meta-row">
        <span class="meta-label inline-flex items-center gap-2"
          ><CalendarClock class="h-4 w-4" aria-hidden="true" /> Starts</span
        >
        <span class="meta-value">{{ formatDate(event.starts_at) }}</span>
      </div>

      <div class="meta-row">
        <span class="meta-label inline-flex items-center gap-2"
          ><CalendarClock class="h-4 w-4" aria-hidden="true" /> Ends</span
        >
        <span class="meta-value">{{ formatDate(event.ends_at) }}</span>
      </div>

      <div class="meta-row">
        <span class="meta-label inline-flex items-center gap-2"
          ><UserCircle class="h-4 w-4" aria-hidden="true" /> Your role :D</span
        >
        <span class="meta-value">{{ event.current_user_role }}</span>
      </div>

      <div v-if="event.destruction_requested_at" class="meta-row">
        <span class="meta-label inline-flex items-center gap-2"
          ><CalendarClock class="h-4 w-4" aria-hidden="true" /> Destruction requested</span
        >
        <span class="meta-value">{{ formatDate(event.destruction_requested_at) }}</span>
      </div>
    </div>
  </AppPanel>
</template>
