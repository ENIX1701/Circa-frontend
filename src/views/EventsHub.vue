<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEvents, type CreateEventRequest, type EventRecord } from '@/composables/useEvents'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import EventCreateForm from '@/components/events/EventCreateForm.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import EventCard from '@/components/events/EventCard.vue'
import AppPanelHeader from '@/components/ui/AppPanelHeader.vue'

const router = useRouter()
const { listEvents, createEvent } = useEvents()

const loading = ref(true)
const creating = ref(false)
const error = ref('')
const events = ref<EventRecord[]>([])

async function loadEvents() {
  loading.value = true
  error.value = ''

  try {
    events.value = await listEvents()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load events'
  } finally {
    loading.value = false
  }
}

async function handleCreateEvent(payload: CreateEventRequest) {
  creating.value = true
  error.value = ''

  try {
    const created = await createEvent(payload)
    router.push({ name: 'event-detail', params: { id: created.id } })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create event QwQ'
  } finally {
    creating.value = false
  }
}

function openEvent(id: string) {
  router.push({ name: 'event-detail', params: { id } })
}

onMounted(() => {
  void loadEvents()
})
</script>

<template>
  <div class="space-y-8">
    <AppPageHeader
      eyebrow="Events"
      title="Your events :3"
      description="Here lies the power of Circa. Where dreams come true, where they come alive, and lay, after
        their due time."
    />

    <AppAlert v-if="error" tone="danger">{{ error }}</AppAlert>

    <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <AppPanel tone="muted" class="space-y-6">
        <AppPanelHeader eyebrow="Events you have access to" title="Event list" />

        <div v-if="loading" class="text-sm text-(--app-text-muted)">Loading events...</div>

        <AppEmptyState
          v-else-if="events.length === 0"
          title="No events yet :c"
          description="Create your first event using the form on the right :3"
        />

        <div v-else class="space-y-4">
          <EventCard v-for="event in events" :key="event.id" :event="event" @open="openEvent" />
        </div>
      </AppPanel>

      <AppPanel class="space-y-6">
        <AppPanelHeader
          eyebrow="Create"
          title="New event"
          description="Your next great adventure begins here :3"
        />

        <EventCreateForm :loading="creating" @create="handleCreateEvent" />
      </AppPanel>
    </div>
  </div>
</template>
