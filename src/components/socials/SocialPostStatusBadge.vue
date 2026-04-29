<script setup lang="ts">
import type { SocialPostStatus } from '@/composables/useEvents'
import AppBadge from '../ui/AppBadge.vue'

defineProps<{
  status: SocialPostStatus
}>()

function statusTone(status: SocialPostStatus) {
  switch (status) {
    case 'draft':
      return 'default'
    case 'ready':
      return 'warning'
    case 'posted':
      return 'success'
  }
}
</script>

<template>
  <AppBadge :tone="statusTone(status)">
    {{ status }}
  </AppBadge>
</template>
