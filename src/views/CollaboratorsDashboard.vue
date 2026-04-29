<script setup lang="ts">
import CollaboratorForm from '@/components/collaborators/CollaboratorForm.vue'
import CollaboratorRow from '@/components/collaborators/CollaboratorRow.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppLoadingState from '@/components/ui/AppLoadingState.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import {
  type AddEventCollaboratorRequest,
  type EventCollaboratorRecord,
  type EventMembershipRole,
  useEvents,
} from '@/composables/useEvents'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const {
  getEvent,
  listEventCollaborators,
  addEventCollaborator,
  updateEventCollaborator,
  deleteEventCollaborator,
} = useEvents()

const eventId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

const loading = ref(true)
const creating = ref(false)
const updatingUserId = ref('')
const deletingUserId = ref('')
const error = ref('')
const currentUserRole = ref<EventMembershipRole>('volunteer')
const collaborators = ref<EventCollaboratorRecord[]>([])

const isOwner = computed(() => currentUserRole.value === 'owner')

async function loadCollaborators() {
  if (!eventId.value) {
    collaborators.value = []
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''

  try {
    const [event, members] = await Promise.all([
      getEvent(eventId.value),
      listEventCollaborators(eventId.value),
    ])

    currentUserRole.value = event.current_user_role
    collaborators.value = members
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load collaborators'
  } finally {
    loading.value = false
  }
}

async function handleAddCollaborator(payload: AddEventCollaboratorRequest) {
  if (!eventId.value || !isOwner.value) return

  creating.value = true
  error.value = ''

  try {
    const created = await addEventCollaborator(eventId.value, payload)

    collaborators.value = [
      ...collaborators.value.filter((member) => member.user_id !== created.user_id),
      created,
    ]
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add collaborator'
  } finally {
    creating.value = false
  }
}

async function handleRoleChange(member: EventCollaboratorRecord, role: EventMembershipRole) {
  if (!eventId.value || !isOwner.value) return

  updatingUserId.value = member.user_id
  error.value = ''

  try {
    const updated = await updateEventCollaborator(eventId.value, member.user_id, { role })
    collaborators.value = collaborators.value.map((current) =>
      current.user_id === updated.user_id ? updated : current,
    )
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update collaborator'
  } finally {
    updatingUserId.value = ''
  }
}

async function handleRemoveCollaborator(member: EventCollaboratorRecord) {
  if (!eventId.value || !isOwner.value) return

  deletingUserId.value = member.user_id
  error.value = ''

  try {
    await deleteEventCollaborator(eventId.value, member.user_id)
    collaborators.value = collaborators.value.filter(
      (current) => current.user_id !== member.user_id,
    )
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to remove collaborator'
  } finally {
    deletingUserId.value = ''
  }
}

watch(
  eventId,
  () => {
    void loadCollaborators()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-8">
    <AppPageHeader
      eyebrow="Collaborators"
      title="Event team"
      description="Manage who can access and edit this event! :3"
    />

    <AppAlert v-if="error" tone="danger">{{ error }}</AppAlert>

    <AppPanel v-if="isOwner">
      <CollaboratorForm :loading="creating" @add="handleAddCollaborator" />
    </AppPanel>

    <AppAlert v-else tone="info"> Only event owners can manage collaborator roles >:c </AppAlert>

    <AppPanel tone="muted" class="space-y-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="section-label">Members</p>
          <h2 class="mt-2 text-2xl font-black text-(--app-text)">Access list</h2>
        </div>
      </div>

      <AppLoadingState v-if="loading" label="Loading collaborators..." />

      <AppEmptyState
        v-else-if="collaborators.length === 0"
        title="No collaborators yet QwQ"
        description="It's always more fun with friends..."
      />

      <div v-else class="space-y-3">
        <CollaboratorRow
          v-for="collaborator in collaborators"
          :key="collaborator.user_id"
          :member="collaborator"
          :can-manage="isOwner"
          :updating="updatingUserId === collaborator.user_id"
          :deleting="deletingUserId === collaborator.user_id"
          @role-change="handleRoleChange"
          @remove="handleRemoveCollaborator"
        />
      </div>
    </AppPanel>
  </div>
</template>
