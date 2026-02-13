<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

defineProps<{
  loading?: boolean
  variant?: 'primary' | 'secondary'
}>()
</script>

<template>
  <button
    :disabled="loading"
    class="inline-flex items-center justify-center rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
    :class="[
      variant === 'secondary'
        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
        : 'bg-black/25 hover:bg-gray-800/25 focus:ring-black/50',
    ]"
  >
    <Loader2 v-if="loading" class="animate-spin" />
    <slot />
  </button>
</template>
