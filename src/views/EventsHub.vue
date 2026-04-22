<script setup lang="ts">
import { ArrowRight, CalendarRange, MapPin, Plus, ShieldCheck } from 'lucide-vue-next'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEvents, type EventRecord, type EventStatus } from '@/composables/useEvents'

const router = useRouter()
const { listEvents, createEvent } = useEvents()

const loading = ref(true)
const creating = ref(false)
const error = ref('')
const events = ref<EventRecord[]>([])

const form = reactive({
  name: '',
  slug: '',
  description: '',
  venue: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  starts_at: '',
  ends_at: '',
})

const slugTouched = ref(false)

// I hope this regex is enough
// I'm sure there's an 1 in a billion edge case
// but that's for my lovely users to find!
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
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
  form.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  form.starts_at = ''
  form.ends_at = ''
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

function titleCase(value: string) {
  return value.charAt(0).toUppercase() + value.slice(1)
}

// TODO: check if status badge style should be applied here or in the stylesheet

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

async function loadEvents() {
  loading.value = true
  error.value = ''

  try {
    events.value = await listEvents()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load evnts'
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
    !form.starts_at.trim() ||
    !form.ends_at.trim()
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
      starts_at: form.starts_at.trim(),
      ends_at: form.ends_at.trim(),
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
    <!-- info -->
    <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div class="space-y-3">
        <p class="section-label">Command center</p>
        <h1 class="text-3xl font-bold tracking-tight md:text-4xl">Your events :3</h1>
        <p class="max-w-2xl text-sm leading-6 text-(--color-text-muted) md:text-base">
          Here lies the power of Circa. Where dreams come true, where they come alive, and lay,
          after their due time.
        </p>
      </div>
    </div>

    <!-- error -->
    <div v-if="error" class="app-alert app-alert--danger">{{ error }}</div>

    <!-- event grid -->
    <div class="grid gap-8">
      <section class="glass-panel p-6 md:p-8">
        <div>
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
              id="even-name"
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
            ></textarea>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <div class="space-y-2">
              <label for="event-venue" class="block text-sm font-medium text-(--color-text-muted)"
                >Venue</label
              >
              <input
                id="even-venue"
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
                id="even-timezone"
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
              <!-- TODO: make thsi a date -->
              <input
                id="even-starts-at"
                v-model="form.starts_at"
                type="text"
                class="app-input"
                placeholder="uhhh"
              />
            </div>

            <div class="space-y-2">
              <label for="event-ends-at" class="block text-sm font-medium text-(--color-text-muted)"
                >Ends at</label
              >
              <!-- TODO: make thsi a date -->
              <input
                id="even-ends-at"
                v-model="form.ends_at"
                type="text"
                class="app-input"
                placeholder="uhhh_v2"
              />
            </div>
          </div>

          <p class="text-xs leading-5 text-(--color-text-muted)">
            The dates are uhhh,,, work in progress for now....
          </p>

          <button
            data-testid="create-event-submit"
            type="submit"
            :disabled="creating"
            class="app-button-primary w-full"
          >
            <Plus class="h-4 w-4" />
            {{ creating ? 'Creating event...' : 'Create event' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>
