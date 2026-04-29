<script setup lang="ts">
import type { PlannerTimelineItemRecord } from '@/composables/useEvents'
import AppPanel from '../ui/AppPanel.vue'
import AppEmptyState from '../ui/AppEmptyState.vue'
import PlannerStatusBadge from '../planner/PlannerStatusBadge.vue'
import AppPanelHeader from '../ui/AppPanelHeader.vue'
import AppSurface from '../ui/AppSurface.vue'

defineProps<{
  items: PlannerTimelineItemRecord[]
}>()

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
  <AppPanel class="space-y-4">
    <AppPanelHeader eyebrow="Unassigned work >:c" title="Needs a person" />

    <AppEmptyState
      v-if="items.length === 0"
      title="Everything has an owner!"
      description="Suspiciously responsible behavior..."
    />

    <div v-else class="space-y-3">
      <AppSurface v-for="item in items" :key="item.id" as="article">
        <p class="text-sm font-bold text-(--app-text)">{{ item.title }}</p>
        <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-(--app-text-muted)">
          <span>{{ item.item_type }}</span>
          <PlannerStatusBadge :status="item.status" />
          <span>{{ formatWindow(item) }}</span>
        </div>
      </AppSurface>
    </div>
  </AppPanel>
</template>
