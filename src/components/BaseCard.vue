<script setup lang="ts">
const props = defineProps({
  title: String,
})
</script>

<template>
  <div class="bg-white/5 backdrop-blur-md p-4 rounded-2xl space-y-4">
    <span class="block uppercase text-white font-medium text-sm -mt-">{{ props.title }}</span>

    <div>
      <slot></slot>
    </div>
  </div>
</template>
