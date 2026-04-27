<script setup lang="ts">
import type {
  EventCollaboratorRecord,
  PlannerTimelineItemRecord,
  PlannerTimelineStatus,
} from '@/composables/useEvents'
import type { TimelineItemFormPayload } from './TimelineItemForm.vue'
import { computed } from 'vue'
import AppPanel from '../ui/AppPanel.vue'
import AppEmptyState from '../ui/AppEmptyState.vue'
import TimelineItemForm from './TimelineItemForm.vue'
import AppSelect from '../ui/AppSelect.vue'
import AppButton from '../ui/AppButton.vue'

const props = defineProps<{
  items: PlannerTimelineItemRecord[]
  collaborators: EventCollaboratorRecord[]
  loading: boolean
  updatingItemId: string
  deletingItemId: string
  editingItemId: string
  collaboratorName: (userId: string) => string
}>()

const emit = defineEmits<{
  statusChange: [item: PlannerTimelineItemRecord, status: PlannerTimelineStatus]
  shift: [item: PlannerTimelineItemRecord, days: number]
  extend: [item: PlannerTimelineItemRecord, days: number]
  edit: [item: PlannerTimelineItemRecord]
  cancelEdit: []
  save: [item: PlannerTimelineItemRecord, payload: TimelineItemFormPayload]
  remove: [itemId: string]
}>()

const dayMs = 1000 * 60 * 60 * 24

const statusOptions: Array<{ label: string; value: PlannerTimelineStatus }> = [
  { label: 'planned', value: 'planned' },
  { label: 'in progress', value: 'in_progress' },
  { label: 'blocked', value: 'blocked' },
  { label: 'done', value: 'done' },
]

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatTimelineDay(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const timelineStart = computed(() => {
  if (props.items.length === 0) {
    return startOfDay(new Date())
  }

  const min = Math.min(...props.items.map((item) => new Date(item.starts_at).getTime()))
  const date = startOfDay(new Date(min))
  date.setDate(date.getDate() - 1)
  return date
})

const timelineEnd = computed(() => {
  if (props.items.length === 0) {
    const date = startOfDay(new Date())
    date.setDate(date.getDate() + 14)
    return date
  }

  const max = Math.max(...props.items.map((item) => new Date(item.ends_at).getTime()))
  const date = startOfDay(new Date(max))
  date.setDate(date.getDate() + 1)
  return date
})

const timelineDays = computed(() => {
  const days: Date[] = []
  const cursor = new Date(timelineStart.value)

  while (cursor <= timelineEnd.value) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
})

const timelineGridTemplate = computed(
  () => `16rem repeat(${timelineDays.value.length}, minmax(5rem, 1fr))`,
)

function timelineColor(item: PlannerTimelineItemRecord) {
  if (item.color) return item.color

  switch (item.item_type) {
    case 'asset':
      return 'var(--app-accent)'
    case 'milestone':
      return 'var(--app-secondary)'
    case 'task':
      return 'var(--app-text-muted)'
  }
}

function timelineBarStyle(item: PlannerTimelineItemRecord) {
  const start = startOfDay(new Date(item.starts_at))
  const end = startOfDay(new Date(item.ends_at))
  const offset = Math.max(0, Math.round((start.getTime() - timelineStart.value.getTime()) / dayMs))
  const duration =
    item.item_type === 'milestone'
      ? 1
      : Math.max(1, Math.round((end.getTime() - start.getTime()) / dayMs) + 1)

  return {
    gridColumn: `${offset + 2} / span ${duration}`,
    gridRow: '1',
    backgroundColor: timelineColor(item),
  }
}
</script>

<template>
  <AppPanel tone="muted" class="space-y-6">
    <div>
      <p class="section-label">Gantt</p>
      <h2 class="mt-2 text-2xl font-black text-(--app-text)">Timeline</h2>
    </div>

    <div v-if="loading" class="text-sm text-(--app-text-muted)">Loading timeline...</div>

    <AppEmptyState
      v-else-if="items.length === 0"
      title="No items in the timeline yet :c"
      description="Add the first asset or milestone above :3"
    />

    <div v-else class="overflow-x-auto">
      <div class="min-w-80 space-y-2">
        <div
          class="grid items-center text-xs uppercase text-(--app-text-muted)"
          :style="{ gridTemplateColumns: timelineGridTemplate }"
        >
          <div class="sticky left-0 z-20 bg-(--app-surface-muted) px-3 py-2">Item</div>
          <div
            v-for="day in timelineDays"
            :key="day.toISOString()"
            class="border border-(--app-border) px-2 py-2"
          >
            {{ formatTimelineDay(day) }}
          </div>
        </div>
      </div>

      <div
        v-for="item in items"
        :key="item.id"
        class="grid min-h-16 items-center rounded-xl border border-(--app-border) bg-(--app-bg-subtle)"
        :style="{ gridTemplateColumns: timelineGridTemplate }"
      >
        <div class="sticky left-0 z-20 h-full bg-(--app-bg-subtle) px-3 py-3">
          <p class="text-sm font-bold text-(--app-text)">{{ item.title }}</p>
          <p class="mt-1 text-xs text-(--app-text-muted)">
            {{ item.item_type }}
            <span v-if="item.owner"> / {{ item.owner }}</span>
            <span v-if="item.assigned_user_id">
              / assigned to {{ collaboratorName(item.assigned_user_id) }}</span
            >
          </p>
        </div>

        <div
          v-for="day in timelineDays"
          :key="`${item.id}-${day.toISOString()}`"
          class="h-full border border-(--app-border)"
        />

        <div
          class="z-10 mx-1 rounded-lg px-3 py-2 text-xs font-bold text-black"
          :class="
            item.item_type === 'milestone' ? 'aspect-square w-10 rotate-45 justify-self-center' : ''
          "
          :style="timelineBarStyle(item)"
        >
          <span :class="item.item_type === 'milestone' ? 'block -rotate-45 text-center' : ''">{{
            item.status
          }}</span>
        </div>

        <div class="col-start-1 -col-end-1 px-3 py-3">
          <TimelineItemForm
            v-if="editingItemId === item.id"
            :item="item"
            :collaborators="collaborators"
            :loading="updatingItemId === item.id"
            @submit="emit('save', item, $event)"
            @cancel="emit('cancelEdit')"
          />

          <div v-else class="flex flex-wrap items-center gap-3">
            <AppSelect
              :model-value="item.status"
              :options="statusOptions"
              class="max-w-40"
              :disabled="updatingItemId === item.id"
              @update:model-value="emit('statusChange', item, $event as PlannerTimelineStatus)"
            />

            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              :disabled="updatingItemId === item.id"
              @click="emit('shift', item, -1)"
              >Move -1 day</AppButton
            >
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              :disabled="updatingItemId === item.id"
              @click="emit('shift', item, 1)"
              >Move 1 day</AppButton
            >
            <AppButton
              v-if="item.item_type !== 'milestone'"
              type="button"
              variant="ghost"
              size="sm"
              :disabled="updatingItemId === item.id"
              @click="emit('extend', item, 1)"
              >Extend +1 day</AppButton
            >
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              :disabled="updatingItemId === item.id"
              @click="emit('edit', item)"
              >Edit</AppButton
            >
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              :disabled="deletingItemId === item.id"
              @click="emit('remove', item.id)"
              >{{ deletingItemId === item.id ? 'Removing...' : 'Remove' }}</AppButton
            >

            <p v-if="item.notes" class="text-xs text-(--app-text-muted)">{{ item.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </AppPanel>
</template>
