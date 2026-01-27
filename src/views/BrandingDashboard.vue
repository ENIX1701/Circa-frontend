<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import ImageUpload from '@/components/ImageUpload.vue'

const logoFile = ref<File | null>(null)

const logFile = (file: File | null) => {
  console.log('received file: ', file)
  logoFile.value = file
}
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
    <!-- logo -->
    <BaseCard title="Logo"><ImageUpload @update:model-value="logFile" /></BaseCard>

    <!-- colors -->
    <BaseCard title="Color scheme"><a href="#">meow</a></BaseCard>

    <!-- typography -->
    <BaseCard title="Typography"><a href="#">mrrphhh~</a></BaseCard>

    <!-- preview -->
    <BaseCard title="Preview"><a href="#">aaa</a></BaseCard>
  </div>
</template>
