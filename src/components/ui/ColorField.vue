<script setup lang="ts">
import { computed } from 'vue'
import AppField from './AppField.vue'

const props = defineProps<{
  color: string
  label: string
  id: string
  hint?: string
}>()

const emit = defineEmits<{
  'update:color': [value: string]
}>()

const pickerColor = computed(() =>
  /^#[0-9a-fA-F]{6}$/.test(props.color) ? props.color : '#000000',
)

function handlePickerInput(event: Event) {
  emit('update:color', (event.target as HTMLInputElement).value.toLowerCase())
}

function handleTextInput(event: Event) {
  emit('update:color', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <AppField :id="id" :label="label" :hint="hint">
    <div class="flex overflow-hidden rounded-lg border border-(--app-border) bg-(--app-bg-subtle)">
      <div
        class="relative w-12 shrink-0 border-r border-(--app-border)"
        :style="{ backgroundColor: pickerColor }"
      >
        <input
          :id="id"
          type="color"
          :value="pickerColor"
          class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          @input="handlePickerInput"
        />
      </div>

      <input
        :value="color"
        type="text"
        maxlength="7"
        class="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm text-(--app-text) outline-none"
        placeholder="#000000"
        @input="handleTextInput"
      />
    </div>
  </AppField>
</template>
