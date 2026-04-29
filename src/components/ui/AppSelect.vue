<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

export interface AppSelectOption {
  label: string
  value: string | number
}

defineProps<{
  modelValue: string | number
  options: AppSelectOption[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <div class="relative">
    <select
      v-bind="$attrs"
      :value="modelValue"
      class="app-input appearance-none pr-10"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="String(option.value)" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <ChevronDown
      class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--app-text-muted)"
      aria-hidden="true"
    />
  </div>
</template>
