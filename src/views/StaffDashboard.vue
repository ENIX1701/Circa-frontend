<script setup lang="ts">
import { useEvents, type EventCollaboratorRecord, type PlannerTimelineItemRecord } from '@/composables/useEvents';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const {listEventCollaborators, listPlannerTimelineItems} = useEvents()

const eventId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

const loading = ref(true)
const error = ref('')
const collaborators = ref<EventCollaboratorRecord[]>([])
const timelineItems = ref<PlannerTimelineItemRecord[]>([])

// for now we want to have basic data about the event
// that is: what's assigned, what's not, and what's blocked (or maybe blocking also in the future?)
const assignedItems = computed(() => timelineItems.value.filter((item) => item.assigned_user_id))
const unassignedItems = computed(() => timelineItems.value.filter((item) => !item.assigned_user_id))
const blockedItems = computed(() => timelineItems.value.filter((item) => item.status === 'blocked'))

const teamCards = computed(() => collaborators.value.map((member) => {
  const assignments = timelineItems.value.filter((item) => item.assigned_user_id === member.user_id)
  const done = assignments.filter((item) => item.status === 'done').length
  const blocked = assignments.filter((item) => item.status === 'blocked').length

  return {
    member, assignments, done, blocked, open: assignments.length - done
  }
}))

async function loadStaff() {
  if (!eventId.value) {
    collaborators.value = []
    timelineItems.value = []
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''

  try {
      const [members, items] = await Promise.all([listEventCollaborators(eventId.value), listPlannerTimelineItems(eventId.value)])

      collaborators.value = members
      timelineItems.value = items
  } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load staff :c'
  } finally {
      loading.value = false
  }
}

function formatWindow(item: PlannerTimelineItemRecord) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${formatter.format(new Date(item.starts_at))} -> ${formatter.format(new Date(item.ends_at))}`
}

watch(eventId, () => { void loadStaff()}, {immediate: true})
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="section-label">Staff</p>
      <h1 class="text-3xl font-bold tracking-tight">Team</h1>
      <p class="mt-2 text-sm text-(--color-text-muted)">Who owns what, what's blocked and what still needs a person! :3</p>
    </div>

    <div v-if="error" class="app-alert app-alert--danger">{{ error }}</div>

    <!-- I really want to make this part a fancy data-dense dashbaord, but we'll see how useful it is xC -->
    <div class="grid gap-4 md:grid-cols-3">
      <section class="glass-panel p-5">
        <p class="section-label">Team</p>
        <p class="mt-2 text-3xl font-semibold">{{ collaborators.length }}</p>
      </section>
      
      <section class="glass-panel p-5">
        <p class="section-label">Assigned</p>
        <p class="mt-2 text-3xl font-semibold">{{ assignedItems.length }}</p>
      </section>
      
      <section class="glass-panel p-5">
        <p class="section-label">Blocked</p>
        <p class="mt-2 text-3xl font-semibold">{{ blockedItems.length }}</p>
      </section>
    </div>

    <!-- assigned -->
    <section class="glass-panel glass-panel--strong p-6">
      <div class="grid gap-4 lg:grid-cols-2">
        <article v-for="card in teamCards" :key="card.member.user_id" class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="font-semibold">{{ card.member.name }} {{ card.member.surname }}</h2>
              <p class="mt-1 text-sm text-(--color-text-muted)">{{ card.member.role }}</p>
              <p class="mt-1 text-xs text-(--color-text-muted)">{{ card.member.email }}</p>
              <p v-if="card.member.phone" class="mt-1 text-xs text-(--color-text-muted)">{{ card.member.phone }}</p>
            </div>

            <div class="text-right text-xs text-(--color-text-muted)">
              <p>{{ card.open }} open</p>
              <p>{{ card.done }} done</p>
              <p v-if="card.blocked" class="text-red-300">{{ card.blocked }} blocked</p>
            </div>
          </div>

          <div v-if="card.assignments.length" class="mt-5 space-y-3">
            <div v-for="item in card.assignments" :key="item.id" class="rounded-xl border border-white/10 bg-black/10 p-3">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-medium">{{ item.title }}</p>
                  <p class="mt-1 text-xs text-(--color-text-muted)">{{ formatWindow(item) }}</p>
                </div>

                <span class="rounded-full border border-white/10 px-2 py-1 text-xs text-(--color-text-muted)">{{ item.status }}</span>
              </div>

              <p v-if="item.notes" class="mt-2 text-xs text-(--color-text-muted)">{{ item.notes }}</p>
            </div>
          </div>

          <p v-else class="mt-5 text-sm text-(--color-text-muted)">No assigned timeline work yet :c</p>
        </article>
      </div>
    </section>

    <!-- unassigned -->
    <section class="glass-panel p-6">
        <p class="section-label">Unassigned work >:c</p>

        <div v-if="unassignedItems.length === 0" class="mt-4 text-sm text-(--color-text-muted)">
          Everything has an owner. Interesting...
        </div>

        <div v-else class="mt-4 space-y-3">
          <article v-for="item in unassignedItems" :key="item.id" class="rounded-xl border border-white/10 bg-white/5 p-4">
            <p class="text-sm font-semibold">{{ item.title }}</p>
            <p class="mt-1 text-xs text-(--color-text-muted)">
              {{ item.item_type }} / {{ item.status }} / {{ formatWindow(item) }}
            </p>
          </article>
        </div>
    </section>
  </div>
</template>
