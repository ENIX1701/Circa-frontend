<script setup lang="ts">
import type { EventStatus } from '@/composables/useEvents'
import AppBadge from '../ui/AppBadge.vue'

defineProps<{
  status: EventStatus
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
</script>

<template>
  <AppBadge :tone="statusTone(status)">
    {{ statusLabel(status) }}
  </AppBadge>
</template>
