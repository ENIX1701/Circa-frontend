<script setup lang="ts">
import type { PlannerTimelineStatus } from '@/composables/useEvents'
import AppBadge from '../ui/AppBadge.vue'

defineProps<{
  status: PlannerTimelineStatus
}>()

function statusLabel(status: PlannerTimelineStatus) {
  return status.replace('_', ' ')
}

function statusTone(status: PlannerTimelineStatus) {
  switch (status) {
    case 'planned':
      return 'default'
    case 'in_progress':
      return 'accent'
    case 'blocked':
      return 'danger'
    case 'done':
      return 'success'
  }
}
</script>

<template>
  <AppBadge :tone="statusTone(status)">
    {{ statusLabel(status) }}
  </AppBadge>
</template>
