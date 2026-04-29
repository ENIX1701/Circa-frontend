<script setup lang="ts">
import { useToast, type ToastTone } from '@/composables/useToast'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-vue-next'

const { toasts, removeToast } = useToast()

function iconForTone(tone: ToastTone) {
  switch (tone) {
    case 'success':
      return CheckCircle2
    case 'danger':
      return AlertTriangle
    case 'info':
      return Info
  }
}
</script>

<template>
  <div class="fixed right-4 top-4 z-50 grid gap-3">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="flex items-start gap-3 rounded-lg border border-(--app-border) bg-(--app-surface) p-4 shadow-xl"
      role="status"
    >
      <component
        :is="iconForTone(toast.tone)"
        class="mt-0.5 h-4 w-4 shrink-0"
        :class="[
          toast.tone === 'success' && 'text-green-500',
          toast.tone === 'danger' && 'text-(--app-danger)',
          toast.tone === 'info' && 'text-(--app-text-muted)',
        ]"
        aria-hidden="true"
      />

      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-(--app-text)">{{ toast.title }}</p>
        <p v-if="toast.description" class="mt-1 text-sm text-(--app-text-muted)">
          {{ toast.description }}
        </p>
      </div>

      <button
        type="button"
        class="text-(--app-text-muted) hover:text-(--app-text)"
        aria-label="Dismiss notification"
        @click="removeToast(toast.id)"
      >
        <X class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
