<script setup lang="ts">
import AppField from '../ui/AppField.vue'
import AppInput from '../ui/AppInput.vue'
import AppTextarea from '../ui/AppTextarea.vue'
import AppButton from '../ui/AppButton.vue'
import type { CreateEventRequest } from '@/composables/useEvents'
import { reactive, ref } from 'vue'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  create: [payload: CreateEventRequest]
}>()

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
const error = ref('')

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function handleNameInput(value: string | number) {
  form.name = String(value)

  if (!slugTouched.value) {
    form.slug = slugify(form.name)
  }
}

function handleSlugInput(value: string | number) {
  slugTouched.value = true
  form.slug = slugify(String(value))
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

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toRfc3339Local(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error('Please enter a valid date and time')
  }

  const offsetMinutes = -date.getTimezoneOffset()
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

async function handleSubmit() {
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

  emit('create', {
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim() || undefined,
    venue: form.venue.trim(),
    timezone: form.timezone.trim(),
    starts_at: toRfc3339Local(form.starts_at_local),
    ends_at: toRfc3339Local(form.ends_at_local),
  })

  resetForm()
}

defineExpose({ resetForm })
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div v-if="error" class="app-alert app-alert--danger">{{ error }}</div>

    <AppField id="event-name" label="Event name" required>
      <AppInput
        id="event-name"
        v-model="form.name"
        type="text"
        placeholder="Windows 95 launch"
        @update:model-value="handleNameInput"
      />
    </AppField>

    <AppField id="event-slug" label="Slug" required>
      <AppInput
        id="event-slug"
        v-model="form.slug"
        type="text"
        placeholder="windows-95-launch"
        @update:model-value="handleSlugInput"
      />
    </AppField>

    <AppField id="event-description" label="Description">
      <AppTextarea
        id="event-description"
        v-model="form.description"
        type="text"
        placeholder="What's the event about? What are the goals? :3"
      />
    </AppField>

    <div class="grid gap-5 md:grid-cols-2">
      <AppField id="event-venue" label="Venue" required>
        <AppInput id="event-venue" v-model="form.venue" type="text" placeholder="Varso Tower" />
      </AppField>
      <AppField id="event-timezone" label="Timezone" required>
        <AppInput
          id="event-timezone"
          v-model="form.timezone"
          type="text"
          placeholder="Europe/Warsaw"
        />
      </AppField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <AppField id="event-starts-at" label="Starts at" required>
        <AppInput
          id="event-starts-at"
          v-model="form.starts_at_local"
          type="datetime-local"
          step="60"
        />
      </AppField>
      <AppField id="event-ends-at" label="Ends at" required>
        <AppInput id="event-ends-at" v-model="form.ends_at_local" type="datetime-local" step="60" />
      </AppField>
    </div>

    <AppButton type="submit" class="w-full" :loading="props.loading">{{
      props.loading ? 'Creating event...' : 'Create event'
    }}</AppButton>
  </form>
</template>
