<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="rounded-2xl border border-dashed border-(--app-border) bg-(--app-bg-subtle) p-5">
    <div class="flex items-center gap-3">
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-(--app-border) bg-(--app-surface)"
        aria-hidden="true"
      >
        <Inbox class="h-4 w-4 text-(--app-text-muted)" />
      </div>

      <div class="min-w-0">
        <p class="section-label">{{ title }}</p>
        <p v-if="description" class="mt-2 text-sm text-(--app-text-muted)">{{ description }}</p>
      </div>
    </div>
  </div>
</template>
