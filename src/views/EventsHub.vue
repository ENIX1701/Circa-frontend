<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEvents, type EventRecord, type EventStatus } from '@/composables/useEvents'

const router = useRouter()
const { listEvents, createEvent } = useEvents()

const loading = ref(true)
const creating = ref(false)
const error = ref('')
const events = ref<EventRecord[]>([])

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const form = reactive({
  name: '',
  slug: '',
  description: '',
  venue: '',
  timezone: browserTimeZone,
  starts_at_local: '',
  ends_at_local: '',
})

const slugTouched = ref(false)

// I hope this regex is enough
// I'm sure there's an 1 in a billion edge case
// but that's for my lovely users to find!
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
}

function handleNameInput() {
  if (!slugTouched.value) {
    form.slug = slugify(form.name)
  }
}

function handleSlugInput() {
  slugTouched.value = true
  form.slug = slugify(form.slug)
}

function resetForm() {
  form.name = ''
  form.slug = ''
  form.description = ''
  form.venue = ''
  form.timezone = browserTimeZone
  form.starts_at_local = ''
  form.ends_at_local = ''
  slugTouched.value = false
}

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

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toRfc3339Local(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error('Please enter a valid date and time')
  }

  const offsetMinutes = -date.getTimezoneOffset;
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

async function handleCreateEvent() {
  error.value = ''

  if (
    !form.name.trim() ||
    !form.slug.trim() ||
    !form.venue.trim() ||
    !form.timezone.trim() ||
    !form.starts_at_local.trim() ||
    !form.ends_at_local.trim()
  ) {
    error.value = 'Pwease fill in all required fields QwQ'
    return
  }

  creating.value = true

  try {
    const created = await createEvent({
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      venue: form.venue.trim(),
      timezone: form.timezone.trim(),
      starts_at: toRfc3339Local(form.starts_at_local),
      ends_at: toRfc3339Local(form.ends_at_local),
    })

    resetForm()

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
    <div class="space-y-3">
      <p class="section-label">Events</p>
      <h1 class="text-3xl font-bold tracking-tight">Your events :3</h1>
      <p class="max-w-2xl text-sm leading-6 text-(--color-text-muted)">
        Here lies the power of Circa. Where dreams come true, where they come alive, and lay, after
        their due time.
      </p>
    </div>

    <!-- error -->
    <div v-if="error" class="app-alert app-alert--danger">{{ error }}</div>

    <!-- event grid -->
    <div class="grid gap-8 grid-cols-2">
      <section class="glass-panel glass-panel--strong p-6 md:p-8">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="section-label">Events you have access to</p>
            <h2 class="mt-2 text-2xl font-semibold">Event list</h2>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p class="section-label">Count</p>
            <p class="mt-2 text-xl font-semibold">{{ events.length }}</p>
          </div>

          <div v-if="loading" class="mt-8 rounded-2xl border border-white/10 bg-white/4 p-5">
            <p class="text-sm text-(--color-text-muted)">Loading events...</p>
          </div>

          <div
            v-else-if="events.length === 0"
            class="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/4 p-5"
          >
            <p class="section-label">No events yet :c</p>
            <p class="mt-2 text-sm text-(--color-text-muted)">
              Create your first event using the form on the right :3
            </p>
          </div>

          <div v-else class="mt-8 space-y-4">
            <button
              v-for="event in events"
              :key="event.id"
              type="button"
              class="w-full rounded-2xl border border-white/10 bg-white/4 p-5 text-left transition hover:border-white/20 hover:bg-white/6"
              @click="openEvent(event.id)"
            >
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div class="space-y-2">
                  <h3 class="text-lg font-semibold">{{ event.name }}</h3>
                  <p class="text-sm text-(--color-text-muted)">
                    {{ event.description || 'No description yet :c' }}
                  </p>
                </div>

                <span
                  class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase text-(--colkor-text-muted)"
                >
                  {{ statusLabel(event.status) }}
                </span>
              </div>

              <div class="mt-4 space-y-1 text-sm text-(--color-text-muted)">
                <p>{{ event.venue }}</p>
                <p>{{ formatDate(event.starts_at) }} to {{ formatDate(event.ends_at) }}</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section class="glass-panel p-6 md:p-8">
        <div class="space-y-2">
          <p class="section-label">Create</p>
          <h2 class="text-2xl font-semibold">New event</h2>
          <p class="text-sm leading-6 text-(--color-text-muted)">
            uhhhhh. some instruction will need to be here x3
          </p>
        </div>

        <form class="mt-8 space-y-5" @submit.prevent="handleCreateEvent">
          <div class="space-y-2">
            <label for="event-name" class="block text-sm font-medium text-(--color-text-muted)"
              >Event name</label
            >
            <input
              id="event-name"
              v-model="form.name"
              type="text"
              class="app-input"
              placeholder="Windows 95 launch"
              @input="handleNameInput"
            />
          </div>

          <div class="space-y-2">
            <label for="event-slug" class="block text-sm font-medium text-(--color-text-muted)"
              >Slug</label
            >
            <input
              id="event-slug"
              v-model="form.slug"
              type="text"
              class="app-input"
              placeholder="windows-95-launch"
              @input="handleSlugInput"
            />
          </div>

          <div class="space-y-2">
            <label
              for="event-description"
              class="block text-sm font-medium text-(--color-text-muted)"
              >Description</label
            >
            <textarea
              id="event-description"
              v-model="form.description"
              class="app-input min-h-28 resize-none"
              placeholder="What's the event about? What are the goals? :3"
            />
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <div class="space-y-2">
              <label for="event-venue" class="block text-sm font-medium text-(--color-text-muted)"
                >Venue</label
              >
              <input
                id="event-venue"
                v-model="form.venue"
                type="text"
                class="app-input"
                placeholder="Varso Tower"
              />
            </div>

            <div class="space-y-2">
              <label
                for="event-timezone"
                class="block text-sm font-medium text-(--color-text-muted)"
                >Timezone</label
              >
              <input
                id="event-timezone"
                v-model="form.timezone"
                type="text"
                class="app-input"
                placeholder="Europe/Warsaw"
              />
            </div>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <div class="space-y-2">
              <label
                for="event-starts-at"
                class="block text-sm font-medium text-(--color-text-muted)"
                >Starts at</label
              >
              <input
                id="event-starts-at"
                v-model="form.starts_at_local"
                type="datetime-local"
                step="60"
                class="app-input"
                placeholder="uhhh"
              />
            </div>

            <div class="space-y-2">
              <label for="event-ends-at" class="block text-sm font-medium text-(--color-text-muted)"
                >Ends at</label
              >
              <input
                id="event-ends-at"
                v-model="form.ends_at_local"
                type="datetime-local"
                step="60"
                class="app-input"
                placeholder="uhhh_v2"
              />
            </div>
          </div>

          <button
            data-testid="create-event-submit"
            type="submit"
            :disabled="creating"
            class="app-button-primary w-full"
          >
            {{ creating ? 'Creating event...' : 'Create event' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>
