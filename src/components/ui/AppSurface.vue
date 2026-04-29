<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    as?: 'div' | 'article' | 'button'
    tone?: 'default' | 'muted'
    padding?: 'sm' | 'md'
    radius?: 'xl' | '2xl'
  }>(),
  {
    as: 'div',
    tone: 'muted',
    padding: 'md',
    radius: 'xl',
  },
)
</script>

<template>
  <component
    :is="as"
    v-bind="$attrs"
    class="border border-(--app-border)"
    :class="[
      tone === 'default' && 'bg-(--app-surface)',
      tone === 'muted' && 'bg-(--app-bg-subtle)',
      padding === 'sm' && 'p-3',
      padding === 'md' && 'p-4',
      radius === 'xl' && 'rounded-xl',
      radius === '2xl' && 'rounded-2xl',
    ]"
  >
    <slot />
  </component>
</template>
