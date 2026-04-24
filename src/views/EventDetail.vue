<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEvents, type EventRecord, type EventStatus } from '@/composables/useEvents'

const route = useRoute()
const { archiveEvent, getEventExport, getEvent, activateEvent, closeEvent, requestDestruction, cancelDestruction } = useEvents()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const event = ref<EventRecord | null>(null)
const exporting = ref(false)

const eventId = computed(() => String(route.params.id ?? ''))
const isOwner = computed(() => event.value?.current_user_role === 'owner')
const canArchive = computed(() => isOwner.value && (event.value?.status === 'closed' || event.value?.status === 'pending_destruction'))

const canActivate = computed(() => isOwner.value && event.value?.status === 'draft')
const canClose = computed(() => isOwner.value && event.value?.status === 'active')
const canRequestDestruction = computed(() => isOwner.value && event.value?.status === 'closed')
const canCancelDestruction = computed(
  () => isOwner.value && event.value?.status === 'pending_destruction',
)

function statusLabel(status: EventStatus) {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'active':
      return 'Active'
    case 'closed':
      return 'Closed'
    case 'archived':
      return 'Archived'
    case 'pending_destruction':
      return 'Pending destruction'
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

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

async function handleActivate() {
  if (!event.value) return

  saving.value = true
  error.value = ''

  try {
    event.value = await activateEvent(event.value.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to activate event'
  } finally {
    saving.value = false
  }
}

async function handleClose() {
  if (!event.value) return

  saving.value = true
  error.value = ''

  try {
    event.value = await closeEvent(event.value.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to close event'
  } finally {
    saving.value = false
  }
}

async function handleRequestDestruction() {
  if (!event.value) return

  saving.value = true
  error.value = ''

  try {
    event.value = await requestDestruction(event.value.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to request destruction'
  } finally {
    saving.value = false
  }
}

async function handleCancelDestruction() {
  if (!event.value) return

  saving.value = true
  error.value = ''

  try {
    event.value = await cancelDestruction(event.value.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to cancel destruction'
  } finally {
    saving.value = false
  }
}

async function handleArchive() {
  if (!event.value) return

  saving.value = true
  error.value = ''

  try {
    event.value = await archiveEvent(event.value.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to archive event'
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
      <p class="text-sm text-(--color-text-muted)">Loading event...</p>
    </div>

    <div v-else-if="error" class="app-alert app-alert--danger">{{ error }}</div>

    <div v-else-if="event" class="space-y-8">
      <div class="space-y-3">
        <p class="section-label">Event details</p>
        <h1 class="text-3xl font-bold tracking-tight">{{ event.name }}</h1>
        <p class="text-sm leading-6 text-(--color-text-muted)">
          {{ event.description || 'No description yet :c' }}
        </p>
      </div>

      <div class="grid gap-8 grid-cols-2">
        <section class="glass-panel glass-panel--strong p-6 md:p-8">
          <div class="space-y-2">
            <p class="section-label">Metadata</p>
            <h2 class="text-2xl font-semibold">Overview</h2>
          </div>

          <div class="meta-grid mt-8">
            <div class="meta-row">
              <span class="meta-label">Status</span>
              <span class="meta-value">{{ statusLabel(event.status) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Slug</span>
              <span class="meta-value">{{ event.slug }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Venue</span>
              <span class="meta-value">{{ event.venue }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Timezone</span>
              <span class="meta-value">{{ event.timezone }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Starts</span>
              <span class="meta-value">{{ formatDate(event.starts_at) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Ends</span>
              <span class="meta-value">{{ formatDate(event.ends_at) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Your role :D</span>
              <span class="meta-value">{{ event.current_user_role }}</span>
            </div>
            <div v-if="event.destruction_requested_at" class="meta-row">
              <span class="meta-label">Destruction requested</span>
              <span class="meta-value">{{ formatDate(event.destruction_requested_at) }}</span>
            </div>
          </div>
        </section>

        <section class="glass-panel p-6 md:p-8">
          <div class="space-y-2">
            <p class="section-label">Lifecycle</p>
            <h2 class="text-2xl font-semibold">{{ statusLabel(event.status) }}</h2>
            <p class="text-sm leading-6 text-(--color-text-muted)">
              Owners can manage the event's lifecycle :3
            </p>
          </div>

          <div class="mt-8 space-y-4">
            <button
              v-if="canActivate"
              data-testid="activate-event"
              type="button"
              :disabled="saving"
              class="app-button-primary w-full"
              @click="handleActivate"
            >
              {{ saving ? 'Saving...' : 'Activate event' }}
            </button>

            <button
              v-if="canClose"
              data-testid="close-event"
              type="button"
              :disabled="saving"
              class="app-button-primary w-full"
              @click="handleClose"
            >
              {{ saving ? 'Saving...' : 'Close event' }}
            </button>

            <button
              v-if="canRequestDestruction"
              data-testid="request-destruction"
              type="button"
              :disabled="saving"
              class="w-full rounded-2xl border border-[rgba(var(--color-danger-rgb),0.35)] bg-[rgba(var(--color-danger-rgb),0.2)] px-4 py-3 font-semibold text-white transition hover:bg-[rgba(var(--color-danger-rgb),0.25)] disabled:opacity-60"
              @click="handleRequestDestruction"
            >
              {{ saving ? 'Saving...' : 'Request destruction' }}
            </button>

            <button
              v-if="canCancelDestruction"
              data-testid="cancel-destruction"
              type="button"
              :disabled="saving"
              class="app-button-secondary w-full"
              @click="handleCancelDestruction"
            >
              {{ saving ? 'Saving...' : 'Cancel destruction' }}
            </button>

            <button
              v-if="canArchive"
              type="button"
              :disabled="saving"
              class="app-button-secondary w-full"
              @click="handleArchive"
            >
              {{ saving ? 'Saving...' : 'Archive event' }}
            </button>

            <button
              type="button"
              :disabled="exporting"
              class="app-button-secondary w-full"
              @click="handleExport"
            >
              {{ exporting ? 'Exporting...' : 'Export JSON' }}
            </button>

            <p
              v-if="!canActivate && !canClose && !canRequestDestruction && !canCancelDestruction"
              class="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-(--color-text-muted)"
            >
              No lifecycle action is currently available :C
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
