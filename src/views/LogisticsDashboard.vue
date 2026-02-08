<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import ItemCard from '@/components/ItemCard.vue'
import { ItemState } from '@/enums/itemState.ts'

interface ShipmentData {
  id: number
  assignee: string
  amount: number
  eta: Date
  type: ItemState
  item: { name: string; supplier: string }
}

const planned = ref<ShipmentData[]>([
  {
    id: 1,
    assignee: 'John Doe',
    amount: 4,
    eta: new Date('2026-10-04'),
    type: ItemState.Planned,
    item: { name: 'Kitty cats', supplier: 'Cat Inc.' },
  },
  {
    id: 2,
    assignee: 'Who Knows',
    amount: 1,
    eta: new Date('2026-14-06'),
    type: ItemState.Planned,
    item: { name: 'Lights', supplier: 'The Sun' },
  },
])
const moving = ref<ShipmentData[]>([
  {
    id: 3,
    assignee: 'John Doe',
    amount: 5,
    eta: new Date('2026-21-02'),
    type: ItemState.Moving,
    item: { name: 'AAAA', supplier: 'uhh' },
  },
])
const arrived = ref<ShipmentData[]>([
  {
    id: 4,
    assignee: 'Fabian Pork',
    amount: 100,
    eta: new Date('2025-10-12'),
    type: ItemState.Arrived,
    item: { name: 'Secret...', supplier: 'forgor' },
  },
])
</script>

<template>
  <div class="flex-col space-y-8">
    <!-- suppliers -->
    <span class="block uppercase text-white font-medium text-sm">Suppliers</span>
    <!-- horizontaly stacked scrollable namecards -->

    <!-- inventory -->
    <span class="block uppercase text-white font-medium text-sm">Inventory</span>
    <!-- items with name, quantity and current status -->

    <!-- transit status -->
    <span class="block uppercase text-white font-medium text-sm">Status</span>
    <!-- planned/moving/arrived -->
    <!-- possibly with return date reminders -->
    <div class="flex-col space-y-4">
      <BaseCard title="Planned"
        ><ItemCard
          v-for="entry in planned"
          :key="entry.id"
          :assignee="entry.assignee"
          :amount="entry.amount"
          :eta="entry.eta"
          :type="entry.type"
          :item="entry.item"
        >
        </ItemCard
      ></BaseCard>
      <BaseCard title="Moving"
        ><ItemCard
          v-for="entry in moving"
          :key="entry.id"
          :assignee="entry.assignee"
          :amount="entry.amount"
          :eta="entry.eta"
          :type="entry.type"
          :item="entry.item"
        >
        </ItemCard
      ></BaseCard>
      <BaseCard title="Arrived"
        ><ItemCard
          v-for="entry in arrived"
          :key="entry.id"
          :assignee="entry.assignee"
          :amount="entry.amount"
          :eta="entry.eta"
          :type="entry.type"
          :item="entry.item"
        >
        </ItemCard
      ></BaseCard>
    </div>
  </div>
</template>
