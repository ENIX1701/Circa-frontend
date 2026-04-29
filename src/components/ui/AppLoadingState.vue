<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'Loading...',
  },
)
</script>

<template>
  <div class="flex items-center gap-2 text-sm text-(--app-text-muted)" role="status">
    <Loader2 class="h-4 w-4 animate-spin" aria-hidden="true" />
    <span>{{ label }}</span>
  </div>
</template>
