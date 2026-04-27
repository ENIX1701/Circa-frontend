<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'danger' | 'success' | 'info'
  }>(),
  {
    tone: 'info',
  },
)
</script>

<template>
  <div
    class="rounded-lg border px-4 py-3 text-sm"
    :class="[
      tone === 'danger' && 'border-(--app-danger) bg-(--app-bg-subtle) text-(--app-text)',
      tone === 'success' && 'border-green-600 bg-(--app-bg-subtle) text-(--app-text)',
      tone === 'info' && 'border-(--app-border) bg-(--app-surface) text-(--app-text)',
    ]"
  >
    <slot />
  </div>
</template>
