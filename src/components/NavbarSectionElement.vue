<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  title: string
}>()
</script>

<template>
  <div class="bg-white/25 p-4 rounded-xl flex">
    <component :is="icon" class="mr-2" /> {{ title }}
  </div>
</template>
