<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <textarea
    v-bind="$attrs"
    :value="modelValue"
    class="app-input"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
