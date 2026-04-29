<script setup lang="ts">
import type { EventMembershipRole } from '@/composables/useEvents'
import AppBadge from '../ui/AppBadge.vue'

defineProps<{
  role: EventMembershipRole
}>()

function roleTone(role: EventMembershipRole) {
  switch (role) {
    case 'owner':
      return 'accent'
    case 'organizer':
      return 'success'
    case 'staff':
      return 'warning'
    case 'volunteer':
      return 'default'
  }
}
</script>

<template>
  <AppBadge :tone="roleTone(role)">
    {{ role }}
  </AppBadge>
</template>
