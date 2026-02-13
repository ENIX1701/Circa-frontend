<script setup lang="ts">
defineOptions({ inheritAttrs: false })

type SelectOption = {
  label: string
  value: string | number
}

defineProps<{
  modelValue: string | number
  label?: string
  error?: string
  id: string
  options: SelectOption[p]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block uppercase text-sm text-white/75">{{ label }}</label>

    <div>
      <select
        v-bind="$attrs"
        :id="id"
        :value="modelValue"
        @change="emit('update:modelValue', $event.target as HTMLSelectElement)"
        class="block w-full rounded-md p-2"
        :class="[
          error
            ? 'ring-1 ring-red-300 focus:ring-red-500 text-red-900'
            : 'ring-1 ring-gray-300 focus:ring-gray-300',
        ]"
      >
        <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="String(option.value)" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>
