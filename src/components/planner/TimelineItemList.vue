<script setup lang="ts">
import type { EventCollaboratorRecord, PlannerTimelineItemRecord } from '@/composables/useEvents'
import AppPanel from '../ui/AppPanel.vue'
import AppEmptyState from '../ui/AppEmptyState.vue'
import PlannerStatusBadge from '../planner/PlannerStatusBadge.vue'
import type { TimelineItemFormPayload } from './TimelineItemForm.vue'
import TimelineItemForm from './TimelineItemForm.vue'
import AppButton from '../ui/AppButton.vue'
import AppSurface from '../ui/AppSurface.vue'
import AppPanelHeader from '../ui/AppPanelHeader.vue'
import AppLoadingState from '../ui/AppLoadingState.vue'

defineProps<{
  items: PlannerTimelineItemRecord[]
  collaborators: EventCollaboratorRecord[]
  loading: boolean
  updatingItemId: string
  deletingItemId: string
  editingItemId: string
  collaboratorName: (userId: string) => string
}>()

const emit = defineEmits<{
  edit: [item: PlannerTimelineItemRecord]
  cancelEdit: []
  save: [item: PlannerTimelineItemRecord, payload: TimelineItemFormPayload]
  remove: [itemId: string]
}>()

function formatWindow(item: PlannerTimelineItemRecord) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${formatter.format(new Date(item.starts_at))} -> ${formatter.format(new Date(item.ends_at))}`
}
</script>

<template>
  <AppPanel tone="muted" class="space-y-6">
    <AppPanelHeader eyebrow="Timeline items" title="All scheduled work" size="md" />

    <AppLoadingState v-if="loading" label="Loading timeline items..." />

    <AppEmptyState
      v-else-if="items.length === 0"
      title="No timeline items yet :c"
      description="Add the first item now! :3"
    />

    <div v-else class="grid max-h-136 gap-3 overflow-y-auto pr-2">
      <AppSurface v-for="item in items" :key="item.id" as="article">
        <TimelineItemForm
          v-if="editingItemId === item.id"
          :item="item"
          :collaborators="collaborators"
          :loading="updatingItemId === item.id"
          @submit="emit('save', item, $event)"
          @cancel="emit('cancelEdit')"
        />

        <template v-else>
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <h3 class="font-bold text-(--app-text)">{{ item.title }}</h3>
                <PlannerStatusBadge :status="item.status" />
              </div>

              <p class="mt-2 text-sm font-semibold text-(--app-text)">
                {{ item.item_type }} / {{ formatWindow(item) }}
              </p>

              <p v-if="item.assigned_user_id" class="mt-1 text-sm text-(--app-text)">
                Assigned to {{ collaboratorName(item.assigned_user_id) || 'unknown' }}
              </p>

              <p v-if="item.owner" class="mt-1 text-sm text-(--app-text)">
                Owner: {{ item.owner }}
              </p>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <div
                class="h-8 w-8 rounded-lg border border-(--app-border)"
                :style="{ backgroundColor: item.color || 'var(--app-accent)' }"
              />

              <AppButton type="button" variant="ghost" size="sm" @click="emit('edit', item)">
                Edit
              </AppButton>

              <AppButton
                type="button"
                variant="danger-ghost"
                size="sm"
                :loading="deletingItemId === item.id"
                @click="emit('remove', item.id)"
              >
                Remove
              </AppButton>
            </div>
          </div>

          <p v-if="item.notes" class="mt-3 text-sm leading-6 text-(--app-text-muted)">
            {{ item.notes }}
          </p>
        </template>
      </AppSurface>
    </div>
  </AppPanel>
</template>
