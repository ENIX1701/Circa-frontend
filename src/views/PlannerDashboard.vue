<script setup lang="ts">
import { computed, ref, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useEvents, type PlannerItemRecord, type PlannerTimelineItemRecord, type PlannerTimelineItemType, type PlannerTimelineStatus} from '@/composables/useEvents'

const route = useRoute()

const {listPlannerItems, createPlannerItem, updatePlannerItem, deletePlannerItem, listPlannerTimelineItems, createPlannerTimelineItem, updatePlannerTimelineItem, deletePlannerTimelineItem} = useEvents()

const eventId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

const loading = ref(true)
const creating = ref(false)
const updatingItemId = ref('')
const deletingItemId = ref('')
const error = ref('')
const newItemTitle = ref('')
const items = ref<PlannerItemRecord[]>([])

async function loadItems() {
  if (!eventId.value) {
    items.value = []
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''

  try {
    items.value = await listPlannerItems(eventId.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load planner items'
  } finally {
    loading.value = false
  }
}

watch(eventId, () => { void loadItems() }, { immediate: true })

const completedCount = computed(() => items.value.filter((item) => item.done).length)
const openCount = computed(() => items.value.filter((item) => !item.done).length)

async function handleAddItem() {
  const title = newItemTitle.value.trim()

  if (!title || !eventId.value) {
    return
  }

  creating.value = true
  error.value = ''
  
  try {
    const created = await createPlannerItem(eventId.value, { title })
    items.value = [...items.value, created].sort((a, b) => a.position - b.position)
    newItemTitle.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create planner items'
  } finally {
    creating.value = false
  }
}

async function toggleItem(item: PlannerItemRecord) {
  if (!eventId.value) {
    return
  }

  updatingItemId.value = item.id
  error.value = ''

  try {
    const updated = await updatePlannerItem(eventId.value, item.id, { done: !item.done })
    items.value = items.value.map((current) => current.id === updated.id ? updated : current)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update planner items'
  } finally {
    updatingItemId.value = ''
  }
}

async function removeItem(itemId: string) {
  if (!eventId.value) {
    return
  }

  deletingItemId.value = itemId
  error.value = ''

  try {
    await deletePlannerItem(eventId.value, itemId)
    items.value = items.value.filter((item) => item.id !== itemId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete planner item'
  } finally {
    deletingItemId.value = ''
  }
}

const timelineItems = ref<PlannerTimelineItemRecord[]>([])
const timelineLoading = ref(true)
const timelineCreating = ref(false)
const updatingTimelineItemId = ref('')  // I don't like this, because updating and editing are very similar
const editingTimelineItemId = ref('')   // but this became somewhat of a mess, so editing will be the backend update for now
const deletingTimelineItemId = ref('')

const timelineForm = reactive({
  title: '',
  item_type: 'task' as PlannerTimelineItemType,
  starts_at_local: '',
  ends_at_local: '',
  status: 'planned' as PlannerTimelineStatus,
  owner: '',
  color: '#38bdf8',
  notes: '',
})

const timelineEditForm = reactive({
  title: '',
  item_type: 'task' as PlannerTimelineItemType,
  starts_at_local: '',
  ends_at_local: '',
  status: 'planned' as PlannerTimelineStatus,
  owner: '',
  color: '',
  notes: '',
})

const dayMs = 1000 * 60 * 60 * 24

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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatTimelineDay(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric'
  }).format(date)
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

async function handleCreateTimelineItem() {
  if (!eventId.value) return

  const title = timelineForm.title.trim()

  if (!title || !timelineForm.starts_at_local || !timelineForm.ends_at_local) {
    error.value = 'Timeline title, start and end are required! >:c'
    return
  }

  timelineCreating.value = true
  error.value = ''

  try {
    const created = await createPlannerTimelineItem(eventId.value, {
      title,
      item_type: timelineForm.item_type,
      starts_at: toRfc3339Local(timelineForm.starts_at_local),
      ends_at: toRfc3339Local(timelineForm.ends_at_local),
      status: timelineForm.status,
      owner: timelineForm.owner.trim() || undefined,
      notes: timelineForm.notes.trim() || undefined,
      color: timelineForm.color.trim() || undefined,
    })

    timelineItems.value = [...timelineItems.value, created].sort((a, b) => a.position - b.position)
    timelineForm.title = ''
    timelineForm.owner = ''
    timelineForm.notes = ''
    timelineForm.starts_at_local = ''
    timelineForm.ends_at_local = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load planner timeline'
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

async function handleTimelineItemSave(item: PlannerTimelineItemRecord) {
  if (!eventId.value) return

  const title = timelineEditForm.title.trim()

  if (!title || !timelineEditForm.starts_at_local || !timelineEditForm.ends_at_local) {
    error.value = 'Timeline title, start and end are required! >:c'
    return
  }

  updatingTimelineItemId.value = item.id
  error.value = ''

  try {
    const updated = await updatePlannerTimelineItem(eventId.value, item.id, {
      title,
      item_type: timelineEditForm.item_type,
      starts_at: toRfc3339Local(timelineEditForm.starts_at_local),
      ends_at: toRfc3339Local(timelineEditForm.ends_at_local),
      status: timelineEditForm.status,
      owner: timelineEditForm.owner.trim(),
      color: timelineEditForm.color.trim(),
      notes: timelineEditForm.notes.trim(),
    })

    replaceTimelineItem(updated)
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

function toDateTimeLocalValue(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  // TODO: rethink/research a better way of storing dates
  // this is horrendous (but easy ;3)
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  ].join('')
}

function replaceTimelineItem(updated: PlannerTimelineItemRecord) {
  timelineItems.value = timelineItems.value.map((item) => item.id === updated.id ? updated : item).sort((a, b) => a.position - b.position)
}

function beginEditTimelineItem(item: PlannerTimelineItemRecord) {
  editingTimelineItemId.value = item.id

  timelineEditForm.title = item.title
  timelineEditForm.item_type = item.item_type
  timelineEditForm.starts_at_local = toDateTimeLocalValue(item.starts_at)
  timelineEditForm.ends_at_local = toDateTimeLocalValue(item.ends_at)
  timelineEditForm.status = item.status
  timelineEditForm.owner = item.owner
  timelineEditForm.color = item.color
  timelineEditForm.notes = item.notes
}

function cancelEditTimelineItem() {
  editingTimelineItemId.value = ''
}

// Gantt layout and helpers
const timelineStart = computed(() => {
  if (timelineItems.value.length === 0) {
    return startOfDay(new Date())
  }

  const min = Math.min(...timelineItems.value.map((item) => new Date(item.starts_at).getTime()))
  const date = startOfDay(new Date(min))
  date.setDate(date.getDate() - 1)
  return date
})

const timelineEnd = computed(() => {
  if (timelineItems.value.length === 0) {
    const date = startOfDay(new Date())
    date.setDate(date.getDate() + 14)
    return date
  }

  const max = Math.max(...timelineItems.value.map((item) => new Date(item.ends_at).getTime()))
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

// this is really wonky but let's see how it works :/
const timelineGridTemplate = computed(() => `16rem repeat(${timelineDays.value.length}, minmax(5rem, 1fr))`)

function timelineColor(item: PlannerTimelineItemRecord) {
  if (item.color) return item.color
  
  // TODO: make this proper later -> for now just make it exist x3
  switch (item.item_type) {
    case 'asset':
      return 'color-primary'
    case 'milestone':
      return 'color-secondary'
    case 'task':
      return 'color-text-muted'
  }
}

function timelineBarStyle(item: PlannerTimelineItemRecord) {
  const start = startOfDay(new Date(item.starts_at))
  const end = startOfDay(new Date(item.ends_at))
  const offset = Math.max(0, Math.round((start.getTime() - timelineStart.value.getTime()) / dayMs))
  const duration = item.item_type === 'milestone' ? 1 : Math.max(1, Math.round((end.getTime() - start.getTime() / dayMs) + 1))

  return {
    gridColumn: `${offset + 2} / span ${duration}`,
    gridRow: '1',
    backgroundColor: timelineColor(item),
  }
}

watch(eventId, () => {void loadTimelineItems()}, {immediate: true})
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-3">
      <p class="section-label">Planner</p>
      <h1 class="text-3xl font-bold tracking-tight">Event planner</h1>
      <p class="max-w-2xl text-sm text--(--color-text-muted)">Event-scoped planning boar</p>
    </div>

    <div v-if="error" class="app-alert app-alert--danger">{{ error }}</div>
    
    <div class="grid gap-4 md:grid-cols-2">
      <section class="glass-panel p-5">
        <p class="section-label">Open items</p>
        <p class="mt-2 text-3xl font-semibold">{{ openCount }}</p>
      </section>
      <section class="glass-panel p-5">
        <p class="section-label">Completed</p>
        <p class="mt-2 text-3xl font-semibold">{{ completedCount }}</p>
      </section>
    </div>

    <section class="glass-panel p-6 space-y-5">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="section-label">Timeline</p>
        </div>
      </div>

      <form class="grid gap-4" @submit.prevent="handleCreateTimelineItem">
        <input v-model="timelineForm.title" type="text" class="app-input" placeholder="Some very important asset" :disabled="timelineCreating" />

        <select v-model="timelineForm.item_type" class="app-input" :disabled="timelineCreating">
          <option value="task">task</option>
          <option value="asset">asset</option>
          <option value="milestone">milestone</option>
        </select>

        <input v-model="timelineForm.starts_at_local" type="datetime-local" class="app-input" :disabled="timelineCreating" />
        <input v-model="timelineForm.ends_at_local" type="datetime-local" class="app-input" :disabled="timelineCreating" />

      <div class="grid gap-4">
        <input v-model="timelineForm.owner" type="text" class="app-input" placeholder="Owner" :disabled="timelineCreating" />

        <!-- TODO: make into a color picker; no time for now -->
        <input v-model="timelineForm.color" type="text" class="app-input" :disabled="timelineCreating" />

        <textarea v-model="timelineForm.notes" class="app-input min-h-12" placeholder="notes" :disabled="timelineCreating" />
      </div>

        <button type="submit" class="app-button-primary" :disabled="timelineCreating">{{ timelineCreating ? 'Adding...' : 'Add' }}</button>
      </form>
    </section>

    <section class="glass-panel glass-panel--strong p-6">
      <div v-if="timelineLoading" class="text-sm text-(--color-text-muted)">
        Loading timeline...
      </div>

      <div v-else-if="timelineItems.length === 0" class="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5">
        <p class="section-label">No items in the timeline yet :c</p>
        <p class="mt-2 text-sm text-(--color-text-muted)">Add the first asset or milestone above :3</p>
      </div>

      <div v-else class="overflow-x-auto">
        <div class="min-w-80 space-y-2">
          <div class="grid items-center text-xs uppercase text-(--color-text-muted)" :style="{ gridTemplateColumns: timelineGridTemplate }">
            <div class="sticky left-0 z-20 px-3 py-2">Item</div>
            <div v-for="day in timelineDays" :key="day.toISOString()" class="border border-white/10 px-2 py-2">
              {{ formatTimelineDay(day) }}
            </div>
          </div>

          <div v-for="item in timelineItems" :key="item.id" class="grid min-h-16 items-center rounded-xl border border-white/10 bg-white/5" :style="{ gridTemplateColumns: timelineGridTemplate}">
            <div class="sticky left-0 z-20 h-full px-3 py-3">
              <p class="text-sm font-semibold">{{ item.title }}</p>
              <p class="mt-1 text-xs text-(--color-text-muted)">
                {{ item.item_type }} <span v-if="item.owner"> / {{ item.owner }}</span>
              </p>
            </div>

            <div v-for="day in timelineDays" :key="`${item.id}-${day.toISOString()}`" class="h-full border border-white/10"/>

            <div class="z-10 mx-1 rounded-lg px-3 py-2 text-xs font-semibold text-black" :class="item.item_type === 'milestone' ? 'aspect-square w-10 rotate-45 justify-self-center' : ''" :style="timelineBarStyle(item)">
              <span :class="item.item_type === 'milestone' ? 'block -rotate-45 text-center' : ''">{{ item.status }}</span>
            </div>

            <div class="col-start-1 -col-end-1 px-3 py-3">
              <form v-if="editingTimelineItemId === item.id" class="grid gap-3 md:grid-cols-2" @submit.prevent="handleTimelineItemSave(item)">
                <input v-model="timelineEditForm.title" type="text" class="app-input" :disabled="updatingTimelineItemId === item.id" />

                <select v-model="timelineEditForm.item_type" class="app-input" :disabled="updatingTimelineItemId === item.id">
                  <option value="task">task</option>
                  <option value="asset">asset</option>
                  <option value="milestone">milestone</option>
                </select>

                <input v-model="timelineEditForm.starts_at_local" type="datetime-local" class="app-input" :disabled="updatingTimelineItemId === item.id" />
                <input v-model="timelineEditForm.ends_at_local" type="datetime-local" class="app-input" :disabled="updatingTimelineItemId === item.id" />
                
                <select v-model="timelineEditForm.status" class="app-input" :disabled="updatingTimelineItemId === item.id">
                  <option value="planned">planned</option>
                  <option value="in_progress">in progress</option>
                  <option value="blocked">blocked</option>
                  <option value="done">done</option>
                </select>

                <input v-model="timelineEditForm.owner" type="text" class="app-input" placeholder="Owner" :disabled="updatingTimelineItemId === item.id" />
                <input v-model="timelineEditForm.color" type="text" class="app-input" placeholder="#38bdf8" :disabled="updatingTimelineItemId === item.id" />
                <textarea v-model="timelineEditForm.notes" class="app-input md:col-span-2" :disabled="updatingTimelineItemId === item.id" />

                <div class="flex gap-3 md:col-span-2">
                  <button type="submit" class="app-button-primary" :disabled="updatingTimelineItemId === item.id">Save</button>
                  <button type="button" class="text-xs text-(--color-text-muted)" @click="cancelEditTimelineItem">Cancel</button>
                </div>
              </form>

              <div v-else class="flex flex-wrap items-center gap-3">
                <select class="app-input max-w-40" :value="item.status" :disabled="updatingTimelineItemId === item.id" @change="handleTimelineStatusChange(item, ($event.target as HTMLSelectElement).value as PlannerTimelineStatus)">
                  <option value="planned">planned</option>
                  <option value="in_progress">in progress</option>
                  <option value="blocked">blocked</option>
                  <option value="done">done</option>
                </select>

                <button type="button" class="text-xs text-(--color-text-muted)" :disabled="updatingTimelineItemId === item.id" @click="shiftTimelineItem(item, -1)">Move -1 day</button>
                <button type="button" class="text-xs text-(--color-text-muted)" :disabled="updatingTimelineItemId === item.id" @click="shiftTimelineItem(item, 1)">Move 1 day</button>
                <button v-if="item.item_type !== 'milestone'" type="button" class="text-xs text-(--color-text-muted)" :disabled="updatingTimelineItemId === item.id" @click="extendTimelineItem(item, 1)">Extend +1 day</button>
                <button type="button" class="text-xs text-(--color-text-muted)" :disabled="updatingTimelineItemId === item.id" @click="beginEditTimelineItem(item)">Edit</button>
                <button type="button" class="text-xs text-(--color-text-muted)" :disabled="updatingTimelineItemId === item.id" @click="removeTimelineItem(item)">{{ deletingTimelineItemId === item.id ? 'Removing...' : 'Remove' }}</button>

                <p v-if="item.notes" class="text-xs text-(--color-text-muted)">{{ item.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="glass-panel p-6">
      <div class="space-y-2">
        <p class="section-label">Current event</p>
        <p class="break-all text-sm text-(--color-text-muted)">{{ eventId }}</p>
      </div>

      <form @submit.prevent="handleAddItem" class="mt-6 flex flex-cold gap-3 sm:flex-row">
        <input v-model="newItemTitle" type="text" class="app-input flex-1" placeholder="Add new item! :3" :disabled="creating" />
        <button type="submit" class="app-button-primary" :disabled="creating">
          {{ creating ? 'Adding...' : 'Add item' }}
        </button>
      </form>
    </section>

    <section class="glass-panel glass-panel--strong p-6 md:p-8">
      <div v-if="loading" class="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p class="text-sm text-(--color-text-muted)">Loading planner items >w<</p>
      </div>

      <div v-else-if="items.length === 0" class="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5">
        <p class="section label">Nothing here yet :c</p>
        <p class="mt-2 text-sm text-(--color-text-muted)">Add the first item above! :D</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="item in items" :key="item.id" class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <input type="checkbox" :checked="item.done" :disabled="updatingItemId === item.id" @change="toggleItem(item)" />

          <div class="flex-1">
            <p class="text-sm" :class="item.done ? 'text-white/50 line-through' : 'text-white'">{{ item.title }}</p>
            <p v-if="item.notes" class="mt-1 text-sm text-(--color-text-muted)">{{ item.notes }}</p>
          </div>

          <button type="button" class="text-xs text-(--color-text-muted) transition" :disabled="deletingItemId === item.id" @click="removeItem(item.id)">
            {{ deletingItemId === item.id ? 'Removing...' : 'Remove' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
