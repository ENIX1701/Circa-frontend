<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="bg-white/5 backdrop-blur-md p-8 rounded-2xl space-y-4">
    <span class="block uppercase text-white font-medium text-sm -mt-">{{ title }}</span>

    <div>
      <slot></slot>
    </div>
  </div>
</template>
