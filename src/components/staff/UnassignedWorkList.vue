<script setup lang="ts">
import type { PlannerTimelineItemRecord } from '@/composables/useEvents'
import AppPanel from '../ui/AppPanel.vue'
import AppEmptyState from '../ui/AppEmptyState.vue'

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
    <div>
      <p class="section-label">Unassigned work >:c</p>
      <h2 class="mt-2 text-2xl font-black text-(--app-text)">Needs a person</h2>
    </div>

    <AppEmptyState
      v-if="items.length === 0"
      title="Everything has an owner!"
      description="Suspiciously responsible behavior..."
    />

    <div v-else class="space-y-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="roudned-xl border border-(--app-border) bg-(--app-bg-subtle) p-4"
      >
        <p class="text-sm font-bold text-(--app-text)">{{ item.title }}</p>
        <p class="mt-1 text-xs text-(--app-text-muted)">
          {{ item.item_type }} / {{ item.status }} / {{ formatWindow(item) }}
        </p>
      </article>
    </div>
  </AppPanel>
</template>
