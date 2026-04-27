<script setup lang="ts">
import type { PlannerTimelineItemRecord } from '@/composables/useEvents';
import AppPanel from '../ui/AppPanel.vue';
import AppEmptyState from '../ui/AppEmptyState.vue';
import AppBadge from '../ui/AppBadge.vue';

defineProps<{
    items: PlannerTimelineItemRecord[]
    loading: boolean
    collaboratorName: (userId: string) => string
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
    <AppPanel tone="muted" class="space-y-6">
        <div class="flex items-start justify-between gap-4">
            <div>
                <p class="section-label">Timeline items</p>
                <h2 class="mt-2 text-2xl font-black text-(--app-text)">All scheduled work</h2>
            </div>
        </div>

        <div v-if="loading" class="text-sm text-(--app-text-muted)">Loading timeline items...</div>

        <AppEmptyState v-else-if="items.length === 0" title="No timeline items yet :c" description="Add the first item now! :3" />

        <div v-else class="grid gap-3">
            <article v-for="item in items" :key="item.id" class="rounded-2xl border border-(--app-border) bg-(--app-bg-subtle) p-4">
                <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div class="flex flex-wrap items-center gap-3">
                            <h3 class="font-bold text-(--app-text)">{{ item.title }}</h3>
                            <AppBadge :tone="statusTone(item.status)">{{ item.status }}</AppBadge>
                        </div>

                        <p class="mt-2 text-sm text-(--app-text-muted)">{{ item.item_type }} / {{ formatWindow(item) }}</p>

                        <p v-if="item.assigned_user_id" class="mt-1 text-sm text-(--app-text-muted)">Assigned to {{ collaboratorName(item.assigned_user_id) || 'unknown' }}</p>

                        <p v-if="item.owner" class="mt-1 text-sm text-(--app-text-muted)">Owner: {{ item.owner }}</p>
                    </div>

                    <div class="h-8 w-8 rounded-lg border border-(--app-border)" :style="{backgroundColor: item.color || 'var(--app-accent)'}" />
                </div>

                <p v-if="item.notes" class="mt-3 text-sm leading-6 text-(--app-text-muted)">
                    {{ item.notes }}
                </p>
            </article>
        </div>
    </AppPanel>
</template>
