<script setup lang="ts">
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import MobileNavbar from '@/components/MobileNavbar.vue'
</script>

<template>
  <div
    class="min-h-screen flex flex-col lg:flex-row text-white bg-gray-800"
  >
    <MobileNavbar class="block lg:hidden shrink-0" />
    <DesktopSidebar class="hidden lg:w-80 lg:block shrink-0 my-8 mx-4 [calc(100vh-4rem)]" />

    <main class="flex-1 min-w-0 text-white m-8 space-y-8">
      <RouterView />
    </main>
  </div>
</template>

<style></style>
