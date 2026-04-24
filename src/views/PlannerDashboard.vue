<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEvents, type PlannerItemRecord} from '@/composables/useEvents'

const route = useRoute()

const {listPlannerItems, createPlannerItem, updatePlannerItem, deletePlannerItem} = useEvents()

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
