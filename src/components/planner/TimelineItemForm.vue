<script setup lang="ts">
import type {
  EventCollaboratorRecord,
  PlannerTimelineItemRecord,
  PlannerTimelineItemType,
  PlannerTimelineStatus,
} from '@/composables/useEvents'
import { computed, reactive, ref, watch } from 'vue'
import AppField from '../ui/AppField.vue'
import AppInput from '../ui/AppInput.vue'
import AppSelect from '../ui/AppSelect.vue'
import ColorField from '../ui/ColorField.vue'
import AppTextarea from '../ui/AppTextarea.vue'
import AppButton from '../ui/AppButton.vue'
import { plannerTimelineStatusOptions, plannerTimelineTypeOptions } from '@/config/formOptions'

export interface TimelineItemFormPayload {
  title: string
  item_type: PlannerTimelineItemType
  starts_at_local: string
  ends_at_local: string
  status: PlannerTimelineStatus
  owner: string
  color: string
  notes: string
  assigned_user_id: string
}

const props = defineProps<{
  item?: PlannerTimelineItemRecord
  collaborators: EventCollaboratorRecord[]
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: TimelineItemFormPayload]
  cancel: []
}>()

const form = reactive<TimelineItemFormPayload>({
  title: '',
  item_type: 'task',
  starts_at_local: '',
  ends_at_local: '',
  status: 'planned',
  owner: '',
  color: '#38bdf8',
  notes: '',
  assigned_user_id: '',
})

const submitted = ref(false)
const timelineItemTypes: PlannerTimelineItemType[] = ['task', 'asset', 'milestone']
const timelineStatuses: PlannerTimelineStatus[] = ['planned', 'in_progress', 'blocked', 'done']
const hexColorPattern = /^#[0-9a-fA-F]{6}$/

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join('')
}

function resetForm() {
  form.title = ''
  form.item_type = 'task'
  form.starts_at_local = ''
  form.ends_at_local = ''
  form.status = 'planned'
  form.owner = ''
  form.color = '#38bdf8'
  form.notes = ''
  form.assigned_user_id = ''
  submitted.value = false
}

function parseLocalDateTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const titleError = computed(() => {
  if (!form.title.trim() && submitted.value) return 'Title is required'
  return ''
})

const typeError = computed(() => {
  if (!form.item_type && submitted.value) return 'Type is required'
  if (!timelineItemTypes.includes(form.item_type)) return 'Type must be task, asset or milestone'
  return ''
})

const startsAtError = computed(() => {
  const start = parseLocalDateTime(form.starts_at_local)

  if (!form.starts_at_local && submitted.value) return 'Start time is required'
  if (form.starts_at_local && !start) return 'Start time must be valid'
  return ''
})

const endsAtError = computed(() => {
  const start = parseLocalDateTime(form.starts_at_local)
  const end = parseLocalDateTime(form.ends_at_local)

  if (!form.ends_at_local && submitted.value) return 'End time is required'
  if (form.ends_at_local && !end) return 'End time must be valid'
  if (start && end && end < start) return 'End time must be the same as or later than start time'
  return ''
})

const statusError = computed(() => {
  if (form.status && !timelineStatuses.includes(form.status)) {
    return 'Status must be planned, in progress, blocked or done'
  }

  return ''
})

const colorError = computed(() => {
  const color = form.color.trim()

  if (color && !hexColorPattern.test(color)) return 'Color must be a valid hex color'
  return ''
})

const hasValidationErrors = computed(() =>
  Boolean(
    titleError.value ||
    typeError.value ||
    startsAtError.value ||
    endsAtError.value ||
    statusError.value ||
    colorError.value,
  ),
)

watch(
  () => props.item,
  (item) => {
    if (!item) {
      resetForm()
      return
    }

    form.title = item.title
    form.item_type = item.item_type
    form.starts_at_local = toDateTimeLocalValue(item.starts_at)
    form.ends_at_local = toDateTimeLocalValue(item.ends_at)
    form.status = item.status
    form.owner = item.owner
    form.color = item.color || '#38bdf8'
    form.notes = item.notes
    form.assigned_user_id = item.assigned_user_id
  },
  { immediate: true },
)

function handleSubmit() {
  submitted.value = true

  if (hasValidationErrors.value) return

  emit('submit', { ...form })

  if (!props.item) {
    resetForm()
  }
}
</script>

<template>
  <form class="grid gap-5" @submit.prevent="handleSubmit">
    <div class="grid gap-5 md:grid-cols-2">
      <AppField id="timeline-title" label="Title" required :error="titleError">
        <AppInput
          id="timeline-title"
          v-model="form.title"
          type="text"
          placeholder="Some very important asset"
          :disabled="loading"
        />
      </AppField>

      <AppField id="timeline-type" label="Type" required :error="typeError">
        <AppSelect
          id="timeline-type"
          v-model="form.item_type"
          :options="plannerTimelineTypeOptions"
          :disabled="loading"
        />
      </AppField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <AppField id="timeline-starts-at" label="Starts at" required :error="startsAtError">
        <AppInput
          id="timeline-starts-at"
          v-model="form.starts_at_local"
          type="datetime-local"
          :disabled="loading"
        />
      </AppField>

      <AppField id="timeline-ends-at" label="Ends at" required :error="endsAtError">
        <AppInput
          id="timeline-ends-at"
          v-model="form.ends_at_local"
          type="datetime-local"
          :disabled="loading"
        />
      </AppField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <AppField id="timeline-status" label="Status" :error="statusError">
        <AppSelect
          id="timeline-status"
          v-model="form.status"
          :options="plannerTimelineStatusOptions"
          :disabled="loading"
        />
      </AppField>

      <AppField id="timeline-owner" label="Owner">
        <AppSelect
          id="timeline-owner"
          v-model="form.owner"
          :disabled="loading"
          :options="[
            { label: 'Unassigned', value: '' },
            ...collaborators.map((member) => ({
              label: `${member.name} ${member.surname} - ${member.role}`,
              value: `${member.name} ${member.surname}`,
            })),
          ]"
        />
      </AppField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <AppField id="timeline-assignee" label="Assignee">
        <AppSelect
          id="timeline-assignee"
          v-model="form.assigned_user_id"
          :disabled="loading"
          :options="[
            { label: 'Unassigned', value: '' },
            ...collaborators.map((member) => ({
              label: `${member.name} ${member.surname} - ${member.role}`,
              value: member.user_id,
            })),
          ]"
        />
      </AppField>

      <ColorField
        id="timeline-color"
        v-model:color="form.color"
        label="Color"
        :error="colorError"
      />
    </div>

    <AppField id="timeline-notes" label="Notes">
      <AppTextarea
        id="timeline-notes"
        v-model="form.notes"
        class="min-h-24"
        placeholder="notes"
        :disabled="loading"
      />
    </AppField>

    <div class="flex flex-wrap gap-3">
      <AppButton type="submit" :loading="loading" :disabled="hasValidationErrors">
        {{ item ? (loading ? 'Saving...' : 'Save item') : loading ? 'Adding...' : 'Add item' }}
      </AppButton>

      <AppButton v-if="item" type="button" variant="ghost" @click="emit('cancel')">
        Cancel
      </AppButton>
    </div>
  </form>
</template>
