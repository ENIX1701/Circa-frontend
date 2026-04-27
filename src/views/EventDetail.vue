<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEvents, type EventRecord } from '@/composables/useEvents'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import EventMetadataPanel from '@/components/event-detail/EventMetadataPanel.vue'
import EventLifecyclePanel from '@/components/event-detail/EventLifecyclePanel.vue'

const route = useRoute()
const {
  archiveEvent,
  getEventExport,
  getEvent,
  activateEvent,
  closeEvent,
  requestDestruction,
  cancelDestruction,
} = useEvents()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const event = ref<EventRecord | null>(null)
const exporting = ref(false)

const eventId = computed(() => String(route.params.id ?? ''))

async function loadEvent() {
  loading.value = true
  error.value = ''

  try {
    event.value = await getEvent(eventId.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load event'
  } finally {
    loading.value = false
  }
}

async function handleLifecycleAction(
  action: (id: string) => Promise<EventRecord>,
  fallbackMessage: string,
) {
  if (!event.value) return

  saving.value = true
  error.value = ''

  try {
    event.value = await action(event.value.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : fallbackMessage
  } finally {
    saving.value = false
  }
}

async function handleExport() {
  if (!event.value) return

  exporting.value = true
  error.value = ''

  try {
    const payload = await getEventExport(event.value.id)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${event.value.slug}-export.json`
    link.click()

    URL.revokeObjectURL(url)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to export event'
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  void loadEvent()
})

watch(
  () => route.params.id,
  () => {
    void loadEvent()
  },
)
</script>

<template>
  <div class="space-y-8">
    <RouterLink to="/events" class="app-link-subtle">Back to events</RouterLink>

    <div v-if="loading" class="glass-panel p-6">
      <p class="text-sm text-(--app-text-muted)">Loading event...</p>
    </div>

    <AppAlert v-else-if="error" tone="danger">{{ error }}</AppAlert>

    <div v-else-if="event" class="space-y-8">
      <AppPageHeader
        eyebrow="Event details"
        :title="event.name"
        :description="event.description || 'No description yet :c'"
      />

      <div class="grid gap-8 grid-cols-2">
        <EventMetadataPanel :event="event" />

        <EventLifecyclePanel
          :event="event"
          :saving="saving"
          :exporting="exporting"
          @activate="handleLifecycleAction(activateEvent, 'Failed to activate event')"
          @close="handleLifecycleAction(closeEvent, 'Failed to close event')"
          @request-destruction="
            handleLifecycleAction(requestDestruction, 'Failed to request destruction')
          "
          @cancel-destruction="
            handleLifecycleAction(cancelDestruction, 'Failed to cancel destruction')
          "
          @archive="handleLifecycleAction(archiveEvent, 'Failed to archive event')"
          @export="handleExport"
        />
      </div>
    </div>
  </div>
</template>
