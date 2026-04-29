<script setup lang="ts">
import TeamMemberCard from '@/components/staff/TeamMemberCard.vue'
import UnassignedWorkList from '@/components/staff/UnassignedWorkList.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppLoadingState from '@/components/ui/AppLoadingState.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import AppPanelHeader from '@/components/ui/AppPanelHeader.vue'
import AppStatCard from '@/components/ui/AppStatCard.vue'
import {
  useEvents,
  type EventCollaboratorRecord,
  type PlannerTimelineItemRecord,
} from '@/composables/useEvents'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { listEventCollaborators, listPlannerTimelineItems } = useEvents()

const eventId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

const loading = ref(true)
const error = ref('')
const collaborators = ref<EventCollaboratorRecord[]>([])
const timelineItems = ref<PlannerTimelineItemRecord[]>([])

// for now we want to have basic data about the event
// that is: what's assigned, what's not, and what's blocked (or maybe blocking also in the future?)
const assignedItems = computed(() => timelineItems.value.filter((item) => item.assigned_user_id))
const unassignedItems = computed(() => timelineItems.value.filter((item) => !item.assigned_user_id))
const blockedItems = computed(() => timelineItems.value.filter((item) => item.status === 'blocked'))

const teamCards = computed(() =>
  collaborators.value.map((member) => {
    const assignments = timelineItems.value.filter(
      (item) => item.assigned_user_id === member.user_id,
    )
    const done = assignments.filter((item) => item.status === 'done').length
    const blocked = assignments.filter((item) => item.status === 'blocked').length

    return {
      member,
      assignments,
      done,
      blocked,
      open: assignments.length - done,
    }
  }),
)

async function loadStaff() {
  if (!eventId.value) {
    collaborators.value = []
    timelineItems.value = []
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''

  try {
    const [members, items] = await Promise.all([
      listEventCollaborators(eventId.value),
      listPlannerTimelineItems(eventId.value),
    ])

    collaborators.value = members
    timelineItems.value = items
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load staff :c'
  } finally {
    loading.value = false
  }
}

watch(
  eventId,
  () => {
    void loadStaff()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-8">
    <AppPageHeader
      eyebrow="Staff"
      title="Team"
      description="Who owns what, what's blocked, and what still needs a person! :3"
    />

    <AppAlert v-if="error" tone="danger">{{ error }}</AppAlert>

    <!-- I really want to make this part a fancy data-dense dashbaord, but we'll see how useful it is xC -->
    <div class="grid gap-4 md:grid-cols-3">
      <AppStatCard label="Team" :value="collaborators.length"></AppStatCard>
      <AppStatCard label="Assigned" :value="assignedItems.length"></AppStatCard>
      <AppStatCard label="Blocked" :value="blockedItems.length"></AppStatCard>
    </div>

    <AppPanel tone="muted" class="space-y-6">
      <AppPanelHeader eyebrow="Assignments" title="Team workload" />

      <AppLoadingState v-if="loading" label="Loading staff..." />

      <AppEmptyState
        v-else-if="teamCards.length === 0"
        title="No collaborators yet"
        description="Add people in the Collaborators tab first :3"
      />

      <div v-else class="grid gap-4 lg:grid-cols-2">
        <TeamMemberCard
          v-for="card in teamCards"
          :key="card.member.user_id"
          :member="card.member"
          :assignments="card.assignments"
          :done="card.done"
          :blocked="card.blocked"
          :open="card.open"
        />
      </div>
    </AppPanel>

    <UnassignedWorkList :items="unassignedItems" />
  </div>
</template>
