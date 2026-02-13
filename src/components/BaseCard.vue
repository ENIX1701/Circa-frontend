<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  title: string
}>()
</script>

<template>
  <div class="bg-white/5 backdrop-blur-md p-8 rounded-2xl space-y-4">
    <span v-if="title" class="block uppercase text-white font-medium text-sm -mt-">{{
      title
    }}</span>

    <div v-bind="$attrs">
      <slot></slot>
    </div>
  </div>
</template>
