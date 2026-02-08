<script setup lang="ts">
import MobileMenuItem from '@/components/MobileMenuItem.vue'
import { useNavigation } from '@/composables/useNavigation'

const { sections } = useNavigation()
</script>

<!-- TODO: make this a proper menu instead of whatever this is -->
<template>
  <div class="lg:hidden flex lg:flex-col bg-gray-100/75 rounded-2xl p-8 space-y-16">
    <!-- sections -->
    <div class="space-y-4">
      <RouterLink v-for="section in sections" :key="section.title" :to="section.path" class="block">
        <MobileMenuItem :icon="section.icon" :title="section.title" />
      </RouterLink>
    </div>
  </div>
</template>
