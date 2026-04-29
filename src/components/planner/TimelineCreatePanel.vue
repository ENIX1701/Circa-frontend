<script setup lang="ts">
import type { EventCollaboratorRecord } from '@/composables/useEvents'
import type { TimelineItemFormPayload } from './TimelineItemForm.vue'
import AppPanel from '../ui/AppPanel.vue'
import TimelineItemForm from './TimelineItemForm.vue'
import AppPanelHeader from '../ui/AppPanelHeader.vue'

defineProps<{
  collaborators: EventCollaboratorRecord[]
  loading?: boolean
}>()

const emit = defineEmits<{
  create: [payload: TimelineItemFormPayload]
}>()
</script>

<template>
  <AppPanel class="space-y-6">
    <AppPanelHeader
      eyebrow="Timeline"
      title="Add scheduled work"
      description="Add a new item to the timeline!"
      size="md"
    />

    <TimelineItemForm
      :collaborators="collaborators"
      :loading="loading"
      @submit="emit('create', $event)"
    />
  </AppPanel>
</template>
