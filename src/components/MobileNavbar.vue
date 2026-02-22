<script setup lang="ts">
import MobileMenuItem from '@/components/MobileMenuItem.vue'
import { useNavigation } from '@/composables/useNavigation'
import { useAuth } from '@/composables/useAuth'
import { LogOut } from 'lucide-vue-next'

const { sections } = useNavigation()
const { logout } = useAuth()
</script>

<!-- TODO: make this a proper menu instead of whatever this is -->
<template>
  <div class="lg:hidden flex lg:flex-col bg-gray-100/75 rounded-2xl p-8 space-y-16">
    <!-- sections -->
    <div class="space-y-4">
      <RouterLink v-for="section in sections" :key="section.title" :to="section.path" class="block">
        <MobileMenuItem :icon="section.icon" :title="section.title" />
      </RouterLink>

      <button
        @click="logout"
        class="bg-white/25 p-4 rounded-xl flex items-center w-full hover:bg-white/50 transition mt-auto"
      >
        <LogOut class="mr-2" /> Logout
      </button>
    </div>
  </div>
</template>
