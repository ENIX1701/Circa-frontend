<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import { BadgeCheck, Users, Mail, Phone } from 'lucide-vue-next'

const members = [
  {
    name: 'John',
    surname: 'Smith',
    role: 'Event director',
    email: 'john@event.com',
    phone: '+1 234 567 890',
    badge: 'active',
  },
  {
    name: 'Michael',
    surname: 'Brown',
    role: 'Booth owner',
    email: 'michael@event.com',
    phone: '+22 987 654 321',
    badge: 'active',
  },
  {
    name: 'Teressa',
    surname: 'Birkenstock',
    role: 'Clown',
    email: 'clown@event.com',
    phone: '+123 33 44 112',
    badge: 'inactive',
  },
]

const activeCount = computed(() => {
  return members.filter((member) => member.badge === 'active').length
})
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
    <div class="space-y-8">
      <!-- total/active staff -->
      <BaseCard title="Overview">
        <div class="flex flex-row space-x-4">
          <BaseCard class="flex-1">
            <div class="space-y-2">
              <!-- icon -->
              <Users />
              <!-- number -->
              <span class="block text-4xl">{{ members.length }}</span>
              <!-- label -->
              <span class="block">Total staff</span>
            </div>
          </BaseCard>
          <BaseCard class="flex-1">
            <div class="space-y-2">
              <!-- icon -->
              <BadgeCheck />
              <!-- number -->
              <span class="block text-4xl">{{ activeCount }}</span>
              <!-- label -->
              <span class="block">Active staff</span>
            </div>
          </BaseCard>
        </div>
      </BaseCard>

      <BaseCard title="Add member">
        <!-- name/surname -->
        <!-- role (dropdown) -->
        <!-- email -->
        <!-- phone -->
        <!-- confirm button -->
      </BaseCard>

      <BaseCard title="Quick actions">
        <!-- export contacts button -->
        <!-- send team email button -->
        <!-- generate reports button -->
      </BaseCard>
    </div>

    <!-- preview -->
    <BaseCard title="Team">
      <!-- list of all members' namecards -->
      <div class="space-y-4">
        <BaseCard v-for="member in members">
          <div class="space-y-2">
            <div class="flex justify-between">
              <div class="space-x-2">
                <!-- name -->
                <span>{{ member.name }} {{ member.surname }}</span>
                <!-- role -->
                <span>{{ member.role }}</span>
              </div>
              <!-- active pill/badge -->
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-solid"
                :class="
                  member.badge === 'active'
                    ? 'bg-green-600/25 text-green-300 border-green-500'
                    : 'bg-gray-700/15 text-gray-200 border-gray-400'
                "
                >{{ member.badge }}</span
              >
            </div>
            <hr class="border-white/10" />
            <div class="flex flex-col space-y-1">
              <!-- email -->
              <div class="flex flex-inline space-x-2">
                <Mail />
                <span>{{ member.email }}</span>
              </div>
              <!-- number -->
              <div class="flex flex-inline space-x-2">
                <Phone />
                <span>{{ member.phone }}</span>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </BaseCard>
  </div>
</template>
