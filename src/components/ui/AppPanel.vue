<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'default' | 'muted' | 'danger'
  }>(),
  {
    tone: 'default',
  },
)
</script>

<template>
  <section
    class="rounded-2xl border p-6"
    :class="[
      tone === 'default' && 'border-(--app-border) bg-(--app-surface)',
      tone === 'muted' && 'border-(--app-border) bg-(--app-surface-muted)',
      tone === 'danger' && 'border-(--app-danger) bg-(--app-surface)',
    ]"
  >
    <slot />
  </section>
</template>
