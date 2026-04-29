<script setup lang="ts">
import { computed } from 'vue'
import AppAlert from '../ui/AppAlert.vue'
import AppPanel from '../ui/AppPanel.vue'
import type { EventRecord, EventStatus } from '@/composables/useEvents'
import AppButton from '../ui/AppButton.vue'
import AppPanelHeader from '../ui/AppPanelHeader.vue'
import { Archive, Download, Rocket, RotateCcw, Trash2, XCircle } from 'lucide-vue-next'

const props = defineProps<{
  event: EventRecord
  saving?: boolean
  exporting?: boolean
}>()

const emit = defineEmits<{
  activate: []
  close: []
  requestDestruction: []
  cancelDestruction: []
  archive: []
  export: []
}>()

const isOwner = computed(() => props.event.current_user_role === 'owner')
const isArchived = computed(() => props.event.status === 'archived')

const canActivate = computed(() => isOwner.value && props.event.status === 'draft')
const canClose = computed(() => isOwner.value && props.event.status === 'active')
const canRequestDestruction = computed(() => isOwner.value && props.event.status === 'closed')
const canCancelDestruction = computed(
  () => isOwner.value && props.event.status === 'pending_destruction',
)
const canArchive = computed(
  () =>
    isOwner.value &&
    (props.event.status === 'closed' || props.event.status === 'pending_destruction'),
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
</script>

<template>
  <AppPanel class="space-y-6">
    <AppPanelHeader
      eyebrow="Lifecycle"
      :title="statusLabel(event.status)"
      description="Owners can manage the event's lifecycle :3"
    />

    <div class="space-y-3">
      <AppButton
        v-if="canActivate"
        data-testid="activate-event"
        class="w-full"
        :loading="saving"
        @click="emit('activate')"
      >
        <Rocket class="h-4 w-4" aria-hidden="true" />
        {{ saving ? 'Saving...' : 'Activate event' }}
      </AppButton>

      <AppButton
        v-if="canClose"
        data-testid="close-event"
        class="w-full"
        :loading="saving"
        @click="emit('close')"
      >
        <XCircle class="h-4 w-4" aria-hidden="true" />
        {{ saving ? 'Saving...' : 'Close event' }}
      </AppButton>

      <AppButton
        v-if="canRequestDestruction"
        data-testid="request-destruction"
        variant="danger"
        class="w-full"
        :loading="saving"
        @click="emit('requestDestruction')"
      >
        <Trash2 class="h-4 w-4" aria-hidden="true" />
        {{ saving ? 'Saving...' : 'Request destruction' }}
      </AppButton>

      <AppButton
        v-if="canCancelDestruction"
        data-testid="cancel-destruction"
        variant="secondary"
        class="w-full"
        :loading="saving"
        @click="emit('cancelDestruction')"
      >
        <RotateCcw class="h-4 w-4" aria-hidden="true" />
        {{ saving ? 'Saving...' : 'Cancel destruction' }}
      </AppButton>

      <AppButton
        v-if="canArchive"
        variant="secondary"
        class="w-full"
        :loading="saving"
        @click="emit('archive')"
      >
        <Archive class="h-4 w-4" aria-hidden="true" />
        {{ saving ? 'Saving...' : 'Archive event' }}
      </AppButton>

      <AppButton variant="secondary" class="w-full" :loading="exporting" @click="emit('export')">
        <Download class="h-4 w-4" aria-hidden="true" />
        {{ exporting ? 'Exporting...' : 'Export JSON' }}
      </AppButton>
    </div>

    <AppAlert v-if="isArchived" tone="info"
      >This event is archived! Lifecycle is finished, but export is still available :3</AppAlert
    >

    <AppAlert
      v-if="
        !canActivate && !canClose && !canRequestDestruction && !canCancelDestruction && !canArchive
      "
      tone="info"
      >No lifecycle action is currently available :c</AppAlert
    >
  </AppPanel>
</template>
