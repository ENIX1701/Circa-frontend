<script setup lang="ts">
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
  <select
    v-bind="$attrs"
    :value="modelValue"
    class="app-input"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <option v-for="option in options" :key="String(option.value)" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>
