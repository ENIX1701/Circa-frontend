<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import MobileNavbar from './components/MobileNavbar.vue'
</script>

<template>
  <div
    class="min-h-screen flex flex-col lg:flex-row text-white bg-[url(https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpaperaccess.com%2Ffull%2F628286.jpg&f=1&nofb=1&ipt=d70b28dd76d02cc78b5cba97efb2aac51f420e02718c216cb1121618c151bf43)]"
  >
    <MobileNavbar class="block lg:hidden shrink-0" />
    <Sidebar class="hidden lg:w-80 lg:block shrink-0 my-8 mx-4 [calc(100vh-4rem)]" />

    <main class="flex-1 min-w-0 text-white m-8 space-y-8">
      <RouterView />
    </main>
  </div>
</template>

<style></style>
