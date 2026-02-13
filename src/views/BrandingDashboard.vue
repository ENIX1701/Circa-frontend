<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import ColorPicker from '@/components/ColorPicker.vue'

const logoFile = ref<File | null>(null)

const logFile = (file: File | null) => {
  console.log('received file: ', file)
  logoFile.value = file
}

const colors = ref([
  { title: 'main', value: '#8b5cf6' },
  { title: 'accent', value: '#521bca' },
  { title: 'background', value: '#0f0f0f' },
  { title: 'text', value: '#ffffff' },
])
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
    <div class="space-y-8">
      <!-- logo -->
      <BaseCard title="Logo">
        <ImageUpload @update:model-value="logFile" />
      </BaseCard>

      <!-- colors -->
      <BaseCard title="Color scheme"
        ><div class="space-y-2">
          <ColorPicker
            v-for="color in colors"
            :key="color.title"
            :title="color.title"
            v-model:color="color.value"
          /></div
      ></BaseCard>

      <!-- typography -->
      <BaseCard title="Typography">
        <!-- preview window -->
        <!-- font selector -->
      </BaseCard>
    </div>

    <!-- preview -->
    <BaseCard title="Preview">
      <a href="#">aaa</a>
    </BaseCard>
  </div>
</template>
