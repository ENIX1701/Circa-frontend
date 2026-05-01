<script setup lang="ts">
import type { AddEventCollaboratorRequest, EventMembershipRole } from '@/composables/useEvents'
import { computed, reactive, ref } from 'vue'
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

const submitted = ref(false)
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emailError = computed(() => {
  const email = form.email.trim()

  if (!email && submitted.value) return 'Email is required'
  if (email && !emailPattern.test(email)) return 'Enter a valid email address'
  return ''
})

const roleError = computed(() => {
  if (!form.role && submitted.value) return 'Role is required'
  return ''
})

const hasValidationErrors = computed(() => Boolean(emailError.value || roleError.value))

function handleSubmit() {
  submitted.value = true

  if (hasValidationErrors.value) return

  const email = form.email.trim().toLowerCase()

  if (!email) return

  emit('add', {
    email,
    role: form.role,
  })

  form.email = ''
  form.role = 'staff'
  submitted.value = false
}
</script>

<template>
  <form class="grid gap-5 md:grid-cols-[minmax(0,1fr)_14rem_auto]" @submit.prevent="handleSubmit">
    <AppField id="collaborator-email" label="Email" required :error="emailError">
      <AppInput
        id="collaborator-email"
        v-model="form.email"
        type="email"
        placeholder="you@circa.local"
      />
    </AppField>

    <AppField id="collaborator-role" label="Role" required :error="roleError">
      <AppSelect id="collaborator-role" v-model="form.role" :options="roleOptions" />
    </AppField>

    <div class="flex items-end">
      <AppButton type="submit" class="w-full" :loading="loading" :disabled="hasValidationErrors">
        {{ loading ? 'Adding...' : 'Add member' }}
      </AppButton>
    </div>
  </form>
</template>
