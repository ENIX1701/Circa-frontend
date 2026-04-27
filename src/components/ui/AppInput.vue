<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  modelValue: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <input
    v-bind="$attrs"
    :value="modelValue"
    class="app-input"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
