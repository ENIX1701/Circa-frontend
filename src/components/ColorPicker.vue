<script setup lang="ts">
const props = defineProps<{
  title: string
  color: string
}>()

const emit = defineEmits<{
  (e: 'update:color', value: string): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:color', target.value)
}
</script>

<template>
  <div>
    <span class="block uppercase text-gray-200 font-medium text-sm mb-1">{{ title }}</span>
    <div
      class="flex w-full rounded-lg border border-white/20 bg-white/5 overflow-hidden focus-within:ring-2 focus-within:ring-white/30 transition-all"
    >
      <div class="relative w-12 shrink-0" :style="{ backgroundColor: color }">
        <input
          type="color"
          :value="color"
          @input="handleInput"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <input
        type="text"
        :value="color"
        @input="handleInput"
        class="flex-1 w-full bg-transparent px-4 py-3 text-white lowercase focus:outline-none focus:ring-0 placeholder-white/20"
        placeholder="#000000"
        maxlength="7"
      />
    </div>
  </div>
</template>
