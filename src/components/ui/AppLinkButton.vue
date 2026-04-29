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

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg border font-bold'
const sizeClasses = computed(() =>
  props.size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm',
)

const variantClasses = computed(() => ({
  'border-(--app-accent) bg-(--app-accent) text-white': props.variant === 'primary',
  'border-(--app-border) bg-(--app-surface) text-(--app-text)': props.variant === 'secondary',
  'border-transparent bg-transparent text-(--app-text-muted)': props.variant === 'ghost',
  'border-(--app-danger) bg-(--app-danger) text-white': props.variant === 'danger',
}))
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
