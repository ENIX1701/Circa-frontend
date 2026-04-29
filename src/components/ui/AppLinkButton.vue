<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw
    href?: string
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
  }>(),
  {
    variant: 'secondary',
    size: 'md',
  },
)

const attrs = useAttrs()
const isRouterLink = computed(() => props.to !== undefined)
const routerTo = computed(() => props.to ?? '/')

const baseClasses = 'app-action'
const sizeClasses = computed(() =>
  props.size === 'sm' ? 'app-action--sm' : 'app-action--md',
)
const variantClasses = computed(() => `app-action--${props.variant}`)
</script>

<template>
  <RouterLink
    v-if="isRouterLink"
    v-bind="attrs"
    :to="routerTo"
    :class="[baseClasses, sizeClasses, variantClasses]"
  >
    <slot />
  </RouterLink>

  <a v-else v-bind="attrs" :href="href" :class="[baseClasses, sizeClasses, variantClasses]">
    <slot />
  </a>
</template>
