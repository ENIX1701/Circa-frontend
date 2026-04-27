<script setup lang="ts">
import AppBadge from '../ui/AppBadge.vue'
import AppPanel from '../ui/AppPanel.vue'

defineProps<{
  eventName: string
  tagline: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  themeMode: 'dark' | 'light'
}>()
</script>

<template>
  <AppPanel class="space-y-4">
    <div>
      <p class="section-label">Preview</p>
      <h2 class="mt-2 text-2xl font-black text-(--app-text)">What's your brand about? :3</h2>
      <p class="mt-2 text-sm text-(--app-text-muted)">Make this space yours</p>
    </div>

    <div
      class="rounded-2xl border p-5"
      :style="{
        borderColor: primaryColor,
        backgroundColor,
        color: themeMode === 'light' ? '#171511' : '#f5f5f5',
      }"
    >
      <AppBadge tone="default">{{ themeMode }}</AppBadge>

      <h3 class="mt-4 text-2xl font-black">{{ eventName || 'Event name' }}</h3>

      <p class="mt-2 text-sm">{{ tagline || 'Tagline goes here' }}</p>

      <div class="mt-5 flex flex-wrap gap-3">
        <span
          class="rounded-lg px-3 py-2 text-sm font-bold text-white"
          :style="{ backgroundColor: primaryColor }"
          >Primary action</span
        >

        <span
          class="rounded-lg border px-3 py-2 text-sm font-bold"
          :style="{ borderColor: secondaryColor, color: secondaryColor }"
          >Secondary action</span
        >
      </div>
    </div>
  </AppPanel>
</template>
