<script setup lang="ts">
import type { AddEventCollaboratorRequest, EventMembershipRole } from '@/composables/useEvents'
import { reactive } from 'vue'
import AppField from '../ui/AppField.vue'
import AppInput from '../ui/AppInput.vue'
import AppSelect from '../ui/AppSelect.vue'
import AppButton from '../ui/AppButton.vue'
import { roleOptions } from '@/config/formOptions'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  add: [payload: AddEventCollaboratorRequest]
}>()

const form = reactive({
  email: '',
  role: 'staff' as EventMembershipRole,
})

function handleSubmit() {
  const email = form.email.trim().toLowerCase()

  if (!email) return

  emit('add', {
    email,
    role: form.role,
  })

  form.email = ''
  form.role = 'staff'
}
</script>

<template>
  <form class="grid gap-5 md:grid-cols-[minmax(0,1fr)_14rem_auto]" @submit.prevent="handleSubmit">
    <AppField label="email">
      <AppInput v-model="form.email" type="email" placeholder="you@circa.local" />
    </AppField>

    <AppField label="Role">
      <AppSelect v-model="form.role" :options="roleOptions" />
    </AppField>

    <div class="flex items-end">
      <AppButton type="submit" class="w-full" :loading="loading">
        {{ loading ? 'Adding...' : 'Add member' }}
      </AppButton>
    </div>
  </form>
</template>
