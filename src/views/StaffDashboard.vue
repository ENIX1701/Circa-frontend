<script setup lang="ts">
import BaseCard from '@/components/BaseCard.vue'
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
    <div class="space-y-8">
      <!-- total/active staff -->
      <BaseCard title="Overview"></BaseCard>

      <BaseCard title="Add member"></BaseCard>

      <!-- export contacts, send mail to team, generate reports, etc.  -->
      <BaseCard title="Quick actions"></BaseCard>
    </div>

    <!-- preview -->
    <BaseCard title="Team"></BaseCard>
  </div>
</template>
