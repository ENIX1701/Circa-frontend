<script setup lang="ts">
import type { EventCollaboratorRecord, EventMembershipRole } from '@/composables/useEvents'
import AppSelect from '../ui/AppSelect.vue'
import AppButton from '../ui/AppButton.vue'
import RoleBadge from './RoleBadge.vue'
import { roleOptions } from '@/config/formOptions'

defineProps<{
  member: EventCollaboratorRecord
  canManage: boolean
  updating?: boolean
  deleting?: boolean
}>()

const emit = defineEmits<{
  roleChange: [member: EventCollaboratorRecord, role: EventMembershipRole]
  remove: [member: EventCollaboratorRecord]
}>()
</script>

<template>
  <article
    class="flex flex-col gap-4 rounded-2xl border border-(--app-border) bg-(--app-bg-subtle) p-4 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <div class="flex flex-wrap items-center gap-3">
        <p class="font-bold text-(--app-text)">{{ member.name }} {{ member.surname }}</p>
        <RoleBadge :role="member.role" />
      </div>

      <p class="mt-1 text-sm text-(--app-text-muted)">{{ member.email }}</p>
      <p v-if="member.phone" class="mt-1 text-xs text-(--app-text-muted)">{{ member.phone }}</p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <AppSelect
        :model-value="member.role"
        :options="roleOptions"
        class="max-w-40"
        :disabled="!canManage || updating"
        @update:model-value="emit('roleChange', member, $event as EventMembershipRole)"
      />

      <AppButton
        v-if="canManage"
        type="button"
        variant="ghost"
        size="sm"
        :loading="deleting"
        @click="emit('remove', member)"
      >
        {{ deleting ? 'Removing...' : 'Remove' }}
      </AppButton>
    </div>
  </article>
</template>
