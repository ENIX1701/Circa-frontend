<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  modelValue: string | number
  label?: string
  error?: string
  id: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block uppercase text-sm text-white/75">{{ label }}</label>
    <div>
      <input
        v-bind="$attrs"
        :id="id"
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="block w-full rounded-md border-0 py-2"
        :class="[
          error
            ? 'ring-1 ring-red-300 focus:ring-red-500 text-red-900 '
            : 'ring-1 ring-gray-300 focus-ring-gray-950',
        ]"
      />

      <p v-if="error" class="text-red-500">{{ error }}</p>
    </div>
  </div>
</template>
