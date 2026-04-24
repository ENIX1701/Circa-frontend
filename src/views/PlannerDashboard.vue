<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router';

interface PlannerItem {
  id: string
  title: string
  done: boolean
}

const route = useRoute()

const eventId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

const newItemTitle = ref('')
const items = ref<PlannerItem[]>([])

const storageKey = computed(() => `circa:planner:${eventId.value}`)

function defaultItems(): PlannerItem[] {
  return [
    { id: 'seed-1', title: 'Confirm event structure', done: false},
    { id: 'seed-2', title: 'Lock event times', done: false},
    { id: 'seed-3', title: 'Review pre-start checklist', done: true},
  ]
}

function loadItems() {
  if (!eventId.value) {
    items.value = []
    return
  }

  const saved = localStorage.getItem(storageKey.value)

  if (!saved) {
    items.value = defaultItems()
    return
  }

  try {
    const parsed = JSON.parse(saved) as PlannerItem[]
    items.value = Array.isArray(parsed) ? parsed : defaultItems()
  } catch {
    items.value = defaultItems()
  }
}

watch(eventId, () => { loadItems() }, { immediate: true })
watch(items, (value) => {
  if (!eventId.value) {
    return
  }

  localStorage.setItem(storageKey.value, JSON.stringify(value))
}, { deep: true })

const completedCount = computed(() => items.value.filter((item) => item.done).length)
const openCount = computed(() => items.value.filter((item) => !item.done).length)

function addItem() {
  const title = newItemTitle.value.trim()

  if (!title) {
    return
  }

  items.value.unshift({
    id: crypto.randomUUID(),
    title,
    done: false,
  })

  newItemTitle.value = ''
}

function toggleItem(id: string) {
  items.value = items.value.map((item) => item.id === id ? { ...item, done: !item.done } : item)
}

function removeItem(id: string) {
  items.value = items.value.filter((item) => item.id !== id)
}
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-3">
      <p class="section-lable">Planner</p>
      <h1 class="text-3xl font-bold tracking-tight">Event planner</h1>
      <p class="max-w-2xl text-sm text--(--color-text-muted)">Event-scoped planning boar</p>
    </div>
    
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

      <form @submit-prevent="addItem" class="mt-6 flex flex-cold gap-3 sm:flex-row">
        <input v-model="newItemTitle" type="text" class="app-input flex-1" placeholder="Add new item! :3" />
        <button type="submit" class="app-button-primary">
          Add item
        </button>
      </form>
    </section>

    <section class="glass-panel glass-panel--strong p-6 md:p-8">
      <div class="space-y-3">
        <div v-if="items.length === 0" class="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5">
          <p class="section-label">Nothing here :c</p>
          <p class="mt-2 text-sm text-(--color-text-muted)">Add the first item above! Pwease QwQ</p>
        </div>

        <div v-for="item in items" :key="item.id" class="flex items-center gap-3 rounded-2xl border border-white/10 bg0white/5 px-4 py-3">
          <input type="checkbox" :checked="item.done" @change="toggleItem(item.id)" />

          <span class="flex-1 text-sm" :class="item.done ? 'text-white/50 line-through' : 'text-white'">{ item.title }</span>

          <button type="button" class="text-xs text-(--color-text-muted) transition" @click="removeItem(item.id)">Remove</button>
        </div>
      </div>
    </section>
  </div>
</template>
