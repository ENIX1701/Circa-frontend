<script setup lang="ts">
import NavbarSectionElement from '@/components/NavbarSectionElement.vue'
import { Palette, Users, Package2, CalendarRange, MessageCircleDashed } from 'lucide-vue-next'

const sections = [
  { icon: Palette, title: 'Branding', path: '/branding' },
  { icon: Users, title: 'Staff', path: '/staff' },
  { icon: Package2, title: 'Logistics', path: '/logistics' },
  { icon: CalendarRange, title: 'Planner', path: '/planner' },
  { icon: MessageCircleDashed, title: 'Socials', path: '/socials' },
]
</script>

<template>
  <div class="hidden lg:w-80 lg:flex lg:flex-col bg-gray-100/75 rounded-2xl p-8 space-y-16">
    <!-- title -->
    <div class="font-normal text-2xl">Title</div>

    <!-- sections -->
    <div class="space-y-4">
      <RouterLink v-for="section in sections" :key="section.title" :to="section.path" class="block">
        <NavbarSectionElement :icon="section.icon" :title="section.title" />
      </RouterLink>
    </div>

    <!-- timer, TODO: move out to a separate component -->
    <div class="mt-auto">hi :3</div>
  </div>
</template>
