<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
  },
)
</script>

<template>
  <button
    :disabled="loading || disabled"
    class="inline-flex items-center justify-center gap-2 rounded-lg border font-bold disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm',
      variant === 'primary' && 'border-(--app-accent) bg-(--app-accent) text-white',
      variant === 'secondary' && 'border-(--app-border) bg-(--app-surface) text-(--app-text)',
      variant === 'ghost' && 'border-transparent bg-transparent text-(--app-text-muted)',
      variant === 'danger' && 'border-(--app-danger) bg-(--app-danger) text-white',
    ]"
  >
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
    <slot />
  </button>
</template>
