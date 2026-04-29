<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Info } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    tone?: 'danger' | 'success' | 'info'
  }>(),
  {
    tone: 'info',
  },
)

function iconForTone(tone: 'danger' | 'success' | 'info') {
  switch (tone) {
    case 'danger':
      return AlertTriangle
    case 'success':
      return CheckCircle2
    case 'info':
      return Info
  }
}
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
    :class="[
      tone === 'danger' && 'border-(--app-danger) bg-(--app-bg-subtle) text-(--app-text)',
      tone === 'success' && 'border-green-600 bg-(--app-bg-subtle) text-(--app-text)',
      tone === 'info' && 'border-(--app-border) bg-(--app-surface) text-(--app-text)',
    ]"
  >
    <component
      :is="iconForTone(tone)"
      class="mt-0.5 h-4 w-4 shrink-0"
      :class="[
        tone === 'danger' && 'text-(--app-danger)',
        tone === 'success' && 'text-green-500',
        tone === 'info' && 'text-(--app-text-muted)',
      ]"
      aria-hidden="true"
    />
    <div class="min-w-0">
      <slot />
    </div>
  </div>
</template>
