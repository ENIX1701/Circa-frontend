<script setup lang="ts">
defineProps<{
  eyebrow?: string // this is a really weird name, but it's the piece of typography that sits above the main header x3
  title: string
  description?: string
}>()
</script>

<template>
  <header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div class="space-y-3">
      <p v-if="eyebrow" class="section-label">{{ eyebrow }}</p>
      <h1 class="text-3xl font-black tracking-tight text-(--app-text)">{{ title }}</h1>
      <p v-if="description" class="max-w-3xl text-sm leading-6 text-(--app-text-muted)">
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.actions">
      <slot name="actions" />
    </div>
  </header>
</template>
