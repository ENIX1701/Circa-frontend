<script setup lang="ts">
import NavbarSectionElement from '@/components/NavbarSectionElement.vue'
import SidebarTimer from '@/components/SidebarTimer.vue'
import { useNavigation } from '@/composables/useNavigation'
import { useAuth } from '@/composables/useAuth'
import { LogOut } from 'lucide-vue-next'

const { sections } = useNavigation()
const { logout } = useAuth()
</script>

<template>
  <div class="lg:flex lg:flex-col bg-gray-100/75 rounded-2xl p-8 space-y-16">
    <!-- title -->
    <div class="font-normal text-2xl">Title</div>

    <!-- sections -->
    <div class="space-y-4">
      <RouterLink v-for="section in sections" :key="section.title" :to="section.path" class="block">
        <NavbarSectionElement :icon="section.icon" :title="section.title" />
      </RouterLink>
    </div>

    <SidebarTimer />
    <button
      @click="logout"
      class="bg-white/25 p-4 rounded-xl flex items-center w-full hover:bg-white/50 transition mt-auto"
    >
      <LogOut class="mr-2" /> Logout
    </button>
  </div>
</template>
