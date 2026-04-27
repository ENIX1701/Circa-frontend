<script setup lang="ts">
import { computed, ref, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useEvents, type EventCollaboratorRecord, type PlannerItemRecord, type PlannerTimelineItemRecord, type PlannerTimelineItemType, type PlannerTimelineStatus} from '@/composables/useEvents'
import type { TimelineItemFormPayload } from '@/components/planner/TimelineItemForm.vue'
import TimelineCreatePanel from '@/components/planner/TimelineCreatePanel.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import TimelineBoard from '@/components/planner/TimelineBoard.vue'
import TimelineItemList from '@/components/planner/TimelineItemList.vue'

const route = useRoute()

const {listEventCollaborators, listPlannerItems, createPlannerItem, updatePlannerItem, deletePlannerItem, listPlannerTimelineItems, createPlannerTimelineItem, updatePlannerTimelineItem, deletePlannerTimelineItem} = useEvents()

const eventId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

const error = ref('')
const collaborators = ref<EventCollaboratorRecord[]>([])

const timelineItems = ref<PlannerTimelineItemRecord[]>([])
const timelineLoading = ref(true)
const timelineCreating = ref(false)
const updatingTimelineItemId = ref('')  // I don't like this, because updating and editing are very similar
const editingTimelineItemId = ref('')   // but this became somewhat of a mess, so editing will be the backend update for now
const deletingTimelineItemId = ref('')

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toRfc3339Local(value: string) {
  return toRfc3339Date(new Date(value))
}

function toRfc3339Date(date: Date) {
  if (Number.isNaN(date.getTime())) {
    throw new Error('Please enter a valid date and time')
  }

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteOffset = Math.abs(offsetMinutes)
  const offsetHours = pad(Math.floor(absoluteOffset / 60))
  const offsetRemainder = pad(absoluteOffset % 60)

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    `${sign}${offsetHours}:${offsetRemainder}`,
  ].join('')
}

async function loadTimelineItems() {
  if (!eventId.value) {
    timelineItems.value = []
    timelineLoading.value = false
    return
  }

  timelineLoading.value = true
  error.value = ''

  try {
    timelineItems.value = await listPlannerTimelineItems(eventId.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load planner timeline'
  } finally {
    timelineLoading.value = false
  }
}

async function loadCollaborators() {
  if (!eventId.value) {
    collaborators.value = []
    return
  }

  try {
    collaborators.value = await listEventCollaborators(eventId.value)
  } catch {
    collaborators.value = []
  }
}

async function handleCreateTimelineItem(payload: TimelineItemFormPayload) {
  if (!eventId.value) return

  if (!payload.title.trim() || !payload.starts_at_local || !payload.ends_at_local) {
    error.value = 'Timeline title, start and end are required! >:c'
    return
  }

  timelineCreating.value = true
  error.value = ''

  try {
    const created = await createPlannerTimelineItem(eventId.value, payloadToRequest(payload))

    timelineItems.value = [...timelineItems.value, created].sort((a, b) => a.position - b.position)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create planner timeline item'
  } finally {
    timelineCreating.value = false
  }
}

async function handleTimelineStatusChange(
  item: PlannerTimelineItemRecord,
  status: PlannerTimelineStatus,
) {
  if (!eventId.value) return

  updatingTimelineItemId.value = item.id
  error.value = ''

  try {
    const updated = await updatePlannerTimelineItem(eventId.value, item.id, { status })
    timelineItems.value = timelineItems.value.map((current) => current.id === updated.id ? updated : current)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update timeline item'
  } finally {
    updatingTimelineItemId.value = ''
  }
}

async function handleTimelineItemSave(item: PlannerTimelineItemRecord, payload: TimelineItemFormPayload) {
  if (!eventId.value) return

  updatingTimelineItemId.value = item.id
  error.value = ''

  try {
    const updated = await updatePlannerTimelineItem(eventId.value, item.id, payloadToRequest(payload))
    replaceTimelineItem(updated)
    editingTimelineItemId.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update timeline item'
  } finally {
    updatingTimelineItemId.value = ''
  }
}

function addDays(value: string, days: number) {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return toRfc3339Date(date)
}

async function shiftTimelineItem(item: PlannerTimelineItemRecord, days: number) {
  if (!eventId.value) return

  updatingTimelineItemId.value = item.id
  error.value = ''

  try {
    const updated = await updatePlannerTimelineItem(eventId.value, item.id, {
      starts_at: addDays(item.starts_at, days),
      ends_at: addDays(item.ends_at, days)
    })

    replaceTimelineItem(updated)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to move timeline item'
  } finally {
    updatingTimelineItemId.value = ''
  }
}

async function extendTimelineItem(item: PlannerTimelineItemRecord, days: number) {
  if (!eventId.value || item.item_type === 'milestone') return

  updatingTimelineItemId.value = item.id
  error.value = ''

  try {
    const updated = await updatePlannerTimelineItem(eventId.value, item.id, {
      ends_at: addDays(item.ends_at, days)
    })

    replaceTimelineItem(updated)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to resize timeline item'
  } finally {
    updatingTimelineItemId.value = ''
  }
}

async function removeTimelineItem(itemId: string) {
  if (!eventId.value) return

  deletingTimelineItemId.value = itemId
  error.value = ''

  try {
    await deletePlannerTimelineItem(eventId.value, itemId)
    timelineItems.value = timelineItems.value.filter((item) => item.id !== itemId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete timeline item'
  } finally {
    deletingTimelineItemId.value = ''
  }
}

function replaceTimelineItem(updated: PlannerTimelineItemRecord) {
  timelineItems.value = timelineItems.value.map((item) => item.id === updated.id ? updated : item).sort((a, b) => a.position - b.position)
}

function payloadToRequest(payload: TimelineItemFormPayload) {
  return {
    title: payload.title.trim(),
    item_type: payload.item_type,
    starts_at: toRfc3339Local(payload.starts_at_local),
    ends_at: toRfc3339Local(payload.ends_at_local),
    status: payload.status,
    owner: payload.owner.trim() || undefined,
    notes: payload.notes.trim() || undefined,
    color: payload.color.trim() || undefined,
    assigned_user_id: payload.assigned_user_id || undefined,
  }
}

function collaboratorName(userId: string) {
  const collaborator = collaborators.value.find((member) => member.user_id === userId)
  
  if (!collaborator) return ''

  return `${collaborator.name} ${collaborator.surname}`
}

watch(eventId, () => {
  void loadTimelineItems(),
  void loadCollaborators()
  }, {immediate: true})
</script>

<template>
  <div class="space-y-8">
    <AppPageHeader eyebrow="Planner" title="Event planner" description="Schedule your event here :3" />

    <AppAlert v-if="error" tone="danger">{{ error }}</AppAlert>

    <TimelineCreatePanel :collaborators="collaborators" :loading="timelineCreating" @create="handleCreateTimelineItem" />

    <TimelineBoard :items="timelineItems" :collaborators="collaborators" :loading="timelineLoading" :updating-item-id="updatingTimelineItemId" :deleting-item-id="deletingTimelineItemId" :editing-item-id="editingTimelineItemId" :collaborator-name="collaboratorName" @status-change="handleTimelineStatusChange" @shift="shiftTimelineItem" @extend="extendTimelineItem" @edit="editingTimelineItemId = $event.id" @cancel-edit="editingTimelineItemId = ''" @save="handleTimelineItemSave" @remove="removeTimelineItem" />

    <TimelineItemList :items="timelineItems" :loading="timelineLoading" :collaborator-name="collaboratorName" />
  </div>
</template>
