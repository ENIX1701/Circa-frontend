<script setup lang="ts">
import { ref } from 'vue'
import { Trash2, Upload } from 'lucide-vue-next'

const emit = defineEmits(['update:modelValue'])

const previewUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    previewUrl.value = URL.createObjectURL(file)
    emit('update:modelValue', file)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const removeImage = () => {
  previewUrl.value = null
  emit('update:modelValue', null)

  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileChange" />

  <div
    v-if="!previewUrl"
    @click="triggerFileInput"
    class="space-y-2 bg-black/5 rounded-lg p-8 flex flex-col items-center justify-center text-center"
  >
    <Upload />
    <p class="text-xs">PNG, JPG up to 5MB</p>
  </div>
  <div v-else>
    <div class="relative rounded-lg overflow-hidden">
      <button @click="removeImage" class="absolute top-2 right-2"><Trash2 /></button>
      <img :src="previewUrl" />
    </div>
  </div>
</template>
