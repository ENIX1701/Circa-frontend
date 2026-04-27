<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
}>()
</script>

<template>
  <section class="rounded-2xl border border-(--app-border) bg-(--app-surface) p-5">
    <p class="section-label">{{ label }}</p>
    <p class="mt-2 text-3xl font-black text-(--app-text)">{{ value }}</p>
    <p v-if="$slots.default" class="mt-2 text-sm text-(--app-text-muted)">
      <slot />
    </p>
  </section>
</template>
