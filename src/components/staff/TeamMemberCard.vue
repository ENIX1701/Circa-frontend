<script setup lang="ts">
import type { EventCollaboratorRecord, PlannerTimelineItemRecord } from '@/composables/useEvents';
import AppPanel from '../ui/AppPanel.vue';
import AppBadge from '../ui/AppBadge.vue';

defineProps<{
    member: EventCollaboratorRecord
    assignments: PlannerTimelineItemRecord[]
    done: number
    blocked: number
    open: number
}>()

function statusTone(status: PlannerTimelineItemRecord['status']) {
    switch (status) {
        case 'planned':
            return 'default'
        case 'in_progress':
            return 'accent'
        case 'blocked':
            return 'danger'
        case 'done':
            return 'success'
    }
}

function formatWindow(item: PlannerTimelineItemRecord) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${formatter.format(new Date(item.starts_at))} -> ${formatter.format(new Date(item.ends_at))}`
}
</script>

<template>
    <AppPanel class="space-y-5">
        <div class="flex items-start justify-between gap-4">
            <div>
                <h2 class="font-bold text-(--app-text)">{{ member.name }} {{ member.surname }}</h2>
                <p class="mt-1 text-sm text-(--app-text-muted)">{{ member.role }}</p>
                <p v-if="member.phone" class="mt-1 text-xs text-(--app-text-muted)">{{ member.phone }}</p>
            </div>

            <div class="text-right text-xs text-(--app-text-muted)">
                <p>{{ open }} open</p>
                <p>{{ done }} done</p>
                <p v-if="blocked" class="text-(--app-danger)">{{ blocked }} blocked</p>
            </div>
        </div>

        <div v-if="assignments.length" class="space-y-3">
            <div v-for="item in assignments" :key="item.id" class="rounded-xl border border-(--app-border) bg-(--app-bg-subtle) p-3">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <p class="text-sm font-bold text-(--app-text)">
                            {{ item.title }}
                        </p>
                        <p class="mt-1 text-xs text-(--app-text-muted)">{{ formatWindow(item) }}</p>
                    </div>

                    <AppBadge :tone="statusTone(item.status)">
                        {{ item.status }}
                    </AppBadge>
                </div>

                <o class="mt-2 text-xs text-(--app-text-muted)">{{ item.notes }}</o>
            </div>
        </div>

        <p v-else class="text-sm text-(--app-text-muted)">No assigned timeline work yet :c</p>
    </AppPanel>
</template>
