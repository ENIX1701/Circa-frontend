<script setup lang="ts">
import ItemState from '@/enums/itemState.ts'

defineProps<{
  assignee: string
  item?: object
  amount?: number
  eta?: Date // TODO: how to store time interval in a better way?
  type: ItemState
}>()
</script>

<!-- TODO: fix ETA to show how long until arrival (1h, 1 day, 35m, etc.) -->
<!-- TODO: Add return date if arrived -->
<template>
  <div class="bg-white/5 backdrop-blur-md p-8 rounded-2xl space-y-4">
    <div>
      <span>{{ assignee }}</span>
      <span class="text-white font-bold">{{ item.name }}</span>
      <p class="text-gray-400 text-sm">supplier: {{ item.supplier }}</p>
      <hr />
      <span>ETA: {{ eta }}</span>
    </div>
  </div>
</template>
