<script setup lang="ts">
import type { SocialPostRecord } from '@/composables/useEvents'
import AppPanel from '../ui/AppPanel.vue'
import AppBadge from '../ui/AppBadge.vue'
import AppSelect from '../ui/AppSelect.vue'
import AppButton from '../ui/AppButton.vue'

defineProps<{
  post: SocialPostRecord
  updating?: boolean
  deleting?: boolean
}>()

const emit = defineEmits<{
  edit: [post: SocialPostRecord]
  remove: [postId: string]
  statusChange: [post: SocialPostRecord, status: SocialPostRecord['status']]
}>()

const statusOptions: Array<{ label: string; value: SocialPostRecord['status'] }> = [
  { label: 'draft', value: 'draft' },
  { label: 'ready', value: 'ready' },
  { label: 'posted', value: 'posted' },
]

function statusTone(status: SocialPostRecord['status']) {
  switch (status) {
    case 'draft':
      return 'default'
    case 'ready':
      return 'warning'
    case 'posted':
      return 'success'
  }
}
</script>

<template>
  <AppPanel class="space-y-4">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="section-label">{{ post.platform }}</p>
        <h2 class="mt-1 text-lg font-black text-(--app-text)">{{ post.title }}</h2>
      </div>

      <AppBadge :tone="statusTone(post.status)">
        {{ post.status }}
      </AppBadge>
    </div>

    <p v-if="post.body" class="text-sm leading-6 text-(--app-text-muted)">
      {{ post.body }}
    </p>

    <div class="flex flex-wrap items-center gap-3">
      <AppSelect
        :model-value="post.status"
        :options="statusOptions"
        class="max-w-40"
        :disabled="updating"
        @update:model-value="emit('statusChange', post, $event as SocialPostRecord['status'])"
      />

      <AppButton type="button" variant="ghost" size="sm" @click="emit('edit', post)">
        Edit
      </AppButton>

      <AppButton
        type="button"
        variant="ghost"
        size="sm"
        :loading="deleting"
        @click="emit('remove', post.id)"
      >
        {{ deleting ? 'Removing...' : 'Remove' }}
      </AppButton>
    </div>
  </AppPanel>
</template>
