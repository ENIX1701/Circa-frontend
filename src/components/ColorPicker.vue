<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps<{
  title: string
  color: string
}>()

const emit = defineEmits<{
  'update:color': [value: string]
}>()

const rawColor = computed(() => props.color?.trim() ?? '')

const pickerColor = computed(() => /^#[0-9a-fA-F]{6}$/.test(props.color) ? props.color : '#000000',)

const handlePickerInput = (event: Event) => {
  emit('update:color', (event.target as HTMLInputElement).value.toLowerCase())
}

const handleTextInput = (event: Event) => {
  emit('update:color', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div>
    <span class="block uppercase text-gray-200 font-medium text-sm mb-1">{{ props.title }}</span>
    <div
      class="flex w-full rounded-lg border border-white/20 bg-white/5 overflow-hidden focus-within:ring-2 focus-within:ring-white/30 transition-all"
    >
      <div class="relative w-12 shrink-0" :style="{ backgroundColor: pickerColor }">
        <input
          type="color"
          :value="pickerColor"
          @input="handlePickerInput"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <input
        type="text"
        :value="props.color"
        @input="handleTextInput"
        class="flex-1 w-full bg-transparent px-4 py-3 text-white lowercase focus:outline-none focus:ring-0 placeholder-white/20"
        placeholder="#000000"
        maxlength="7"
      />
    </div>
  </div>
</template>
