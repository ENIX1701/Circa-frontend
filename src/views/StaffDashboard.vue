<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import { BadgeCheck, Users, Mail, Phone } from 'lucide-vue-next'

const role = ref('')
const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Organizer', value: 'organizer' },
  { label: 'Staff', value: 'staff' },
  { label: 'Volunteer', value: 'volunteer' },
]

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
  <div class="glass-panel p-6">
    <p class="section-label">Staff</p>
    <h1 class="text-2xl font-semibold">Staff dashboard</h1>
    <p class="mt-2 text-sm text-(--color-text-muted)">Coming soon in the next release</p>
  </div>
</template>
