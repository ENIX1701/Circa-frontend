<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import ItemCard from '@/components/ItemCard.vue'
import { ItemState } from '@/enums/itemState'

interface ShipmentData {
  id: number
  assignee: string
  amount: number
  eta: Date
  type: ItemState
  item: { name: string; supplier: string }
}

const supplierScrollContainer = ref<HTMLElement | null>(null)
const scrollSuppliers = (direction: 'left' | 'right') => {
  const container = supplierScrollContainer.value
  if (!container) return

  const firstCard = container.firstElementChild as HTMLElement
  const cardWidth = firstCard ? firstCard.clientWidth : 75
  const gap = 16

  const scrollAmount = cardWidth + gap
  const currentScroll = supplierScrollContainer.value.scrollLeft

  supplierScrollContainer.value.scrollTo({
    left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
    behavior: 'smooth',
  })
}

const suppliers = ref<ShipmentData[]>([
  {
    id: 101,
    assignee: 'Contact: Mike',
    amount: 12, // Active Orders
    eta: new Date(),
    type: ItemState.Planned, // Just for color coding
    item: { name: 'Raw Materials Ltd', supplier: 'Primary' },
  },
  {
    id: 102,
    assignee: 'Contact: Sarah',
    amount: 5,
    eta: new Date(),
    type: ItemState.Moving,
    item: { name: 'Global Logistics', supplier: 'Shipping' },
  },
  {
    id: 103,
    assignee: 'Contact: AI Bot',
    amount: 500,
    eta: new Date(),
    type: ItemState.Arrived,
    item: { name: 'Tech Components', supplier: 'Electronics' },
  },
  {
    id: 104,
    assignee: 'Contact: Dave',
    amount: 0,
    eta: new Date(),
    type: ItemState.Planned,
    item: { name: 'Packers Inc', supplier: 'Packaging' },
  },
])

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
  <div class="flex-col space-y-8 pb-20">
    <div>
      <div class="flex justify-between items-end mb-2">
        <span class="block uppercase text-white font-medium text-sm">Suppliers</span>

        <div class="flex gap-2">
          <button
            @click="scrollSuppliers('left')"
            class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            @click="scrollSuppliers('right')"
            class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref="supplierScrollContainer"
        class="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 scrollbar-hide"
        style="scrollbar-width: none; -ms-overflow-style: none"
      >
        <div v-for="sup in suppliers" :key="sup.id" class="snap-center shrink-0 w-[85vw] md:w-75">
          <ItemCard
            :assignee="sup.assignee"
            :amount="sup.amount"
            :eta="sup.eta"
            :type="sup.type"
            :item="sup.item"
          />
        </div>
      </div>
    </div>
    <span class="block uppercase text-white font-medium text-sm">Inventory</span>

    <span class="block uppercase text-white font-medium text-sm">Status</span>

    <div class="flex-col space-y-4">
      <BaseCard title="Planned">
        <ItemCard
          v-for="entry in planned"
          :key="entry.id"
          :assignee="entry.assignee"
          :amount="entry.amount"
          :eta="entry.eta"
          :type="entry.type"
          :item="entry.item"
        />
      </BaseCard>

      <BaseCard title="Moving">
        <ItemCard
          v-for="entry in moving"
          :key="entry.id"
          :assignee="entry.assignee"
          :amount="entry.amount"
          :eta="entry.eta"
          :type="entry.type"
          :item="entry.item"
        />
      </BaseCard>

      <BaseCard title="Arrived">
        <ItemCard
          v-for="entry in arrived"
          :key="entry.id"
          :assignee="entry.assignee"
          :amount="entry.amount"
          :eta="entry.eta"
          :type="entry.type"
          :item="entry.item"
        />
      </BaseCard>
    </div>
  </div>
</template>
