<script setup lang="ts">
import NavbarSectionElement from '@/components/NavbarSectionElement.vue'
import { Palette, Users, Package2, CalendarRange, MessageCircleDashed } from 'lucide-vue-next'

const sections = [
  { icon: Palette, title: 'Branding' },
  { icon: Users, title: 'Staff' },
  { icon: Package2, title: 'Logistics' },
  { icon: CalendarRange, title: 'Planner' },
  { icon: MessageCircleDashed, title: 'Socials' },
]
</script>

<template>
  <div class="hidden lg:w-80 lg:flex lg:flex-col bg-gray-100/75 rounded-2xl p-8 space-y-16">
    <!-- title -->
    <div class="font-normal text-2xl">Title</div>

    <!-- sections -->
    <div class="space-y-4">
      <NavbarSectionElement
        v-for="section in sections"
        :key="section"
        :icon="section.icon"
        :title="section.title"
      />
    </div>

    <!-- timer -->
    <div class="mt-auto">hi :3</div>
  </div>
</template>
