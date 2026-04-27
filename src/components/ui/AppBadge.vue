<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
  }>(),
  {
    tone: 'default',
  },
)
</script>

<template>
  <div
    class="inline-flex items-center rounded-full border px-2 py-1 text-xs lowercase tracking-wide"
    :class="[
      tone === 'default' && 'border-(--app-border) text-(--app-text-muted)',
      tone === 'accent' && 'border-(--app-accent) text-(--app-accent)',
      tone === 'success' && 'border-green-600 text-green-500',
      tone === 'warning' && 'border-orange-500 text-orange-400',
      tone === 'danger' && 'border-(--app-danger) text-(--app-danger)',
    ]"
  >
    <slot />
  </div>
</template>
