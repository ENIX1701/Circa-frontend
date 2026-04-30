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
import { plannerTimelineStatusOptions } from '@/config/formOptions'
import AppPanelHeader from '../ui/AppPanelHeader.vue'
import { CalendarPlus, Edit2, Loader2, MoveLeft, MoveRight, Trash2 } from 'lucide-vue-next'
import AppLoadingState from '../ui/AppLoadingState.vue'

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

const minimumTimelineDays = 7

const timelineEnd = computed(() => {
  const start = timelineStart.value

  if (props.items.length === 0) {
    const date = startOfDay(new Date())
    date.setDate(date.getDate() + minimumTimelineDays - 1)
    return date
  }

  const max = Math.max(...props.items.map((item) => new Date(item.ends_at).getTime()))
  const naturalEnd = startOfDay(new Date(max))
  naturalEnd.setDate(naturalEnd.getDate() + 1)

  const minimumEnd = new Date(start)
  minimumEnd.setDate(minimumEnd.getDate() + minimumTimelineDays - 1)

  return naturalEnd > minimumEnd ? naturalEnd : minimumEnd
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

const timelineLabelColumnRem = 15
const timelineDayColumnMinRem = 4

const timelineGridTemplate = computed(() => {
  const dayColumns = `repeat(${timelineDays.value.length}, minmax(${timelineDayColumnMinRem}rem, 1fr))`

  return `${timelineLabelColumnRem}rem ${dayColumns}`
})

const timelineGridStyle = computed(() => ({
  gridTemplateColumns: timelineGridTemplate.value,
  minWidth: `${timelineLabelColumnRem + timelineDays.value.length * timelineDayColumnMinRem}rem`,
}))

function statusLabel(status: PlannerTimelineStatus) {
  return status.replace('_', ' ')
}

function typeLabel(type: PlannerTimelineItemRecord['item_type']) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const timelineRows = computed(() => props.items.filter((item) => item.item_type !== 'milestone'))
const milestoneItems = computed(() => props.items.filter((item) => item.item_type === 'milestone'))

function milestoneStyle(item: PlannerTimelineItemRecord) {
  const start = startOfDay(new Date(item.starts_at))
  const offset = Math.max(0, Math.round((start.getTime() - timelineStart.value.getTime()) / dayMs))

  return {
    gridColumn: `${offset + 2} / span 1`,
    gridRow: '1',
  }
}

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
    borderColor: timelineColor(item),
  }
}
</script>

<template>
  <AppPanel tone="muted" class="space-y-6 overflow-hidden">
    <AppPanelHeader eyebrow="Gantt" title="Timeline" />

    <AppLoadingState v-if="loading" label="Loading timeline..." />

    <AppEmptyState
      v-else-if="items.length === 0"
      title="No items in the timeline yet :c"
      description="Add the first asset or milestone above :3"
    />

    <div
      v-else
      class="@container overflow-x-auto rounded-xl border border-(--app-border) bg-(--app-bg-subtle)"
    >
      <div
        class="grid items-center border-b border-(--app-border) bg-(--app-surface) text-xs font-bold uppercase text-(--app-text-muted)"
        :style="timelineGridStyle"
      >
        <div class="sticky left-0 z-30 border-r border-(--app-border) bg-(--app-surface) px-3 py-2">
          Item
        </div>
        <div
          v-for="day in timelineDays"
          :key="day.toISOString()"
          class="border-r border-(--app-border) px-2 py-2"
        >
          {{ formatTimelineDay(day) }}
        </div>
      </div>

      <div
        v-if="milestoneItems.length"
        class="grid min-h-14 items-center border-b border-(--app-border) bg-(--app-bg-subtle)"
        :style="timelineGridStyle"
      >
        <div
          class="sticky left-0 z-30 h-full border-r border-(--app-border) bg-(--app-bg-subtle) px-3 py-3"
        >
          <p class="text-xs font-bold uppercase text-(--app-text-muted)">Milestones</p>
        </div>

        <div
          v-for="day in timelineDays"
          :key="`milestones-${day.toISOString()}`"
          class="h-full border-r border-(--app-border) last:border-r-0"
        />

        <div
          v-for="milestone in milestoneItems"
          :key="milestone.id"
          class="z-10 flex min-w-0 items-center justify-center gap-2 px-2"
          :style="milestoneStyle(milestone)"
          :title="milestone.title"
        >
          <span
            class="h-3 w-3 shrink-0 rotate-45 rounded-xs border shadow-sm"
            :style="{
              backgroundColor: timelineColor(milestone),
              borderColor: timelineColor(milestone),
            }"
          />

          <span
            class="min-w-0 max-w-28 rounded-md bg-(--app-surface) px-2 py-1 text-xs font-bold text-(--app-text)"
          >
            {{ milestone.title }}
          </span>
        </div>
      </div>

      <div
        v-for="item in timelineRows"
        :key="item.id"
        class="grid min-h-18 items-stretch rounded-xl border border-(--app-border) bg-(--app-bg-subtle) last:border-b-0"
        :style="timelineGridStyle"
      >
        <div
          class="sticky left-0 z-20 flex h-full min-h-18 flex-col justify-between border-r border-(--app-border) bg-(--app-bg-subtle) px-3 py-3"
        >
          <p class="text-sm font-bold text-(--app-text)">{{ item.title }}</p>
          <div class="mt-2 flex flex-wrap gap-1">
            <span
              class="rounded-md border border-(--app-border) bg-(--app-surface) px-2 py-1 text-xs uppercase text-(--app-text)"
            >
              {{ typeLabel(item.item_type) }}
            </span>

            <span
              v-if="item.owner"
              class="rounded-md bg-(--app-surface) px-2 py-1 text-xs font-semibold text-(--app-text)"
              >Owner: {{ item.owner }}</span
            >

            <span
              v-if="item.assigned_user_id"
              class="rounded-md bg-(--app-surface) px-2 py-1 text-xs font-semibold text-(--app-text)"
            >
              {{ collaboratorName(item.assigned_user_id) }}</span
            >
          </div>
          <p v-if="item.notes" class="mt-2 text-xs line-clamp-2 leading-4 text-(--app-text-muted)">
            {{ item.notes }}
          </p>
        </div>

        <div
          v-for="day in timelineDays"
          :key="`${item.id}-${day.toISOString()}`"
          class="h-full border-r border-(--app-border) last:border-r-0"
        />

        <div
          class="z-10 mx-1 rounded-md border px-3 py-2 text-xs font-bold text-(--app-bg-subtle)"
          :class="
            item.item_type === 'milestone' ? 'aspect-square w-10 rotate-45 justify-self-center' : ''
          "
          :style="timelineBarStyle(item)"
        >
          <span :class="item.item_type === 'milestone' ? 'block -rotate-45 text-center' : ''">{{
            statusLabel(item.status)
          }}</span>
        </div>

        <div
          class="col-start-1 -col-end-1 border-t border-(--app-border) bg-(--app-surface) px-3 py-3"
        >
          <TimelineItemForm
            v-if="editingItemId === item.id"
            :item="item"
            :collaborators="collaborators"
            :loading="updatingItemId === item.id"
            @submit="emit('save', item, $event)"
            @cancel="emit('cancelEdit')"
          />

          <div
            v-else
            class="sticky left-3 z-20 flex w-[calc(100cqw-1.5rem)] flex-wrap items-center justify-between gap-3"
          >
            <AppSelect
              :model-value="item.status"
              :options="plannerTimelineStatusOptions"
              class="max-w-40"
              :disabled="updatingItemId === item.id"
              @update:model-value="emit('statusChange', item, $event as PlannerTimelineStatus)"
            />

            <div class="flex flex-wrap items-center gap-1">
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                :disabled="updatingItemId === item.id"
                aria-label="Move item one day earlier"
                title="Move item one day earlier"
                @click="emit('shift', item, -1)"
                ><MoveLeft class="h-4 w-4" aria-hidden="true"
              /></AppButton>
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                :disabled="updatingItemId === item.id"
                aria-label="Move item one day later"
                title="Move item one day later"
                @click="emit('shift', item, 1)"
                ><MoveRight class="h-4 w-4" aria-hidden="true"
              /></AppButton>
              <AppButton
                v-if="item.item_type !== 'milestone'"
                type="button"
                variant="ghost"
                size="sm"
                :disabled="updatingItemId === item.id"
                aria-label="Extend item by one day"
                title="Extend item by one day"
                @click="emit('extend', item, 1)"
                ><CalendarPlus class="h-4 w-4" aria-hidden="true"
              /></AppButton>
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                :disabled="updatingItemId === item.id"
                aria-label="Edit item"
                title="Edit"
                @click="emit('edit', item)"
                ><Edit2 class="h-4 w-4" aria-hidden="true"
              /></AppButton>
              <AppButton
                type="button"
                variant="danger-ghost"
                size="sm"
                :disabled="deletingItemId === item.id"
                :aria-label="deletingItemId === item.id ? 'Removing item...' : 'Remove item'"
                :title="deletingItemId === item.id ? 'Removing...' : 'Remove'"
                @click="emit('remove', item.id)"
                ><Loader2
                  v-if="deletingItemId === item.id"
                  class="h-4 w-4 animate-spin"
                  aria-hidden="true" /><Trash2 v-else class="h-4 w-4" aria-hidden="true"
              /></AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppPanel>
</template>
