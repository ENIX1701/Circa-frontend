<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Circle, CircleDot, XCircle } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    tone?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
  }>(),
  {
    tone: 'default',
  },
)

type BadgeTone = 'default' | 'accent' | 'success' | 'warning' | 'danger'

function iconForTone(tone: BadgeTone) {
  switch (tone) {
    case 'success':
      return CheckCircle2
    case 'warning':
      return AlertTriangle
    case 'danger':
      return XCircle
    case 'accent':
      return CircleDot
    case 'default':
      return Circle
  }
}
</script>

<template>
  <div
    class="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs leading-none lowercase tracking-wide"
    :class="[
      tone === 'default' && 'border-(--app-border) text-(--app-text-muted)',
      tone === 'accent' && 'border-(--app-accent) text-(--app-accent)',
      tone === 'success' && 'border-green-600 text-green-500',
      tone === 'warning' && 'border-orange-500 text-orange-400',
      tone === 'danger' && 'border-(--app-danger) text-(--app-danger)',
    ]"
  >
    <component :is="iconForTone(tone)" class="h-3 w-3 shrink-0" aria-hidden="true" />
    <slot />
  </div>
</template>
