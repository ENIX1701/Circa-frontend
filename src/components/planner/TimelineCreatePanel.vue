<script setup lang="ts">
import type { EventCollaboratorRecord } from '@/composables/useEvents'
import type { TimelineItemFormPayload } from './TimelineItemForm.vue'
import AppPanel from '../ui/AppPanel.vue'
import TimelineItemForm from './TimelineItemForm.vue'

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
    <div>
      <p class="section-label">Timeline</p>
      <h2 class="mt-2 text-xl font-black text-(--app-text)">Add scheduled work</h2>
      <p class="mt-2 text-sm text-(--app-text-muted)">Add a new item to the timeline!</p>
    </div>

    <TimelineItemForm
      :collaborators="collaborators"
      :loading="loading"
      @submit="emit('create', $event)"
    />
  </AppPanel>
</template>
