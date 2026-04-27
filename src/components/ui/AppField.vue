<script setup lang="ts">
defineProps<{
  id?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
}>()
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" :for="id" class="block text-sm font-bold text-(--app-text)">
      {{ label }}<span v-if="required" class="text-(--app-danger)"> *</span>
    </label>

    <slot />

    <p v-if="error" class="text-sm text-(--app-danger)">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-(--app-text-muted)">{{ hint }}</p>
  </div>
</template>
