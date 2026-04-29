<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    size?: 'md' | 'lg'
  }>(),
  {
    size: 'lg',
  },
)
</script>

<template>
  <header class="flex items-start justify-between gap-4">
    <div>
      <p v-if="eyebrow" class="section-label">{{ eyebrow }}</p>
      <h2 class="mt-2 font-black text-(--app-text)" :class="size === 'md' ? 'text-xl' : 'text-2xl'">
        {{ title }}
      </h2>
      <p v-if="description" class="mt-2 text-sm leading-6 text-(--app-text-muted)">
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.actions" class="shrink-0">
      <slot name="actions" />
    </div>
  </header>
</template>
