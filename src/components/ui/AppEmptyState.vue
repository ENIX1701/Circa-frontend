<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="rounded-2xl border border-dashed border-(--app-border) bg-(--app-bg-subtle) p-5">
    <p class="section-label">{{ title }}</p>
    <p v-if="description" class="mt-2 text-sm text-(--app-text-muted)">{{ description }}</p>
  </div>
</template>
