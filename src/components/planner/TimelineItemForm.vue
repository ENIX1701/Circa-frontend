<script setup lang="ts">
import type {
  EventCollaboratorRecord,
  PlannerTimelineItemRecord,
  PlannerTimelineItemType,
  PlannerTimelineStatus,
} from '@/composables/useEvents'
import { reactive, watch } from 'vue'
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
}

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
  if (!form.title.trim() || !form.starts_at_local || !form.ends_at_local) return

  emit('submit', { ...form })

  if (!props.item) {
    resetForm()
  }
}
</script>

<template>
  <form class="grid gap-5" @submit.prevent="handleSubmit">
    <div class="grid gap-5 md:grid-cols-2">
      <AppField label="Title">
        <AppInput
          v-model="form.title"
          type="text"
          placeholder="Some very important asset"
          :disabled="loading"
        />
      </AppField>

      <AppField label="Type">
        <AppSelect
          v-model="form.item_type"
          :options="plannerTimelineTypeOptions"
          :disabled="loading"
        />
      </AppField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <AppField label="Starts at">
        <AppInput v-model="form.starts_at_local" type="datetime-local" :disabled="loading" />
      </AppField>

      <AppField label="Ends at">
        <AppInput v-model="form.ends_at_local" type="datetime-local" :disabled="loading" />
      </AppField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <AppField label="Status">
        <AppSelect
          v-model="form.status"
          :options="plannerTimelineStatusOptions"
          :disabled="loading"
        />
      </AppField>

      <AppField label="Owner">
        <AppInput v-model="form.owner" type="text" placeholder="Owner" :disabled="loading" />
      </AppField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <AppField label="Assignee">
        <AppSelect
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

      <ColorField id="timeline-color" v-model:color="form.color" label="Color" />
    </div>

    <AppField label="Notes">
      <AppTextarea v-model="form.notes" class="min-h-24" placeholder="notes" :disabled="loading" />
    </AppField>

    <div class="flex flex-wrap gap-3">
      <AppButton type="submit" :loading="loading">
        {{ item ? (loading ? 'Saving...' : 'Save item') : loading ? 'Adding...' : 'Add item' }}
      </AppButton>

      <AppButton v-if="item" type="button" variant="ghost" @click="emit('cancel')">
        Cancel
      </AppButton>
    </div>
  </form>
</template>
