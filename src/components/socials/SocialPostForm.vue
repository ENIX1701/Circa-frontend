<script setup lang="ts">
import type { CreateSocialPostRequest, SocialPostRecord } from '@/composables/useEvents'
import { reactive, watch } from 'vue'
import AppField from '../ui/AppField.vue'
import AppTextarea from '../ui/AppTextarea.vue'
import AppSelect from '../ui/AppSelect.vue'
import AppButton from '../ui/AppButton.vue'
import AppInput from '../ui/AppInput.vue'

const props = defineProps<{
  post?: SocialPostRecord
  loading?: boolean
}>()

const emit = defineEmits<{
  create: [payload: CreateSocialPostRequest]
  update: [
    payload: {
      platform: string
      title: string
      body: string
      status: SocialPostRecord['status']
    },
  ]
  cancel: []
}>()

const form = reactive({
  platform: 'Instagram',
  title: '',
  body: '',
  status: 'draft' as SocialPostRecord['status'],
})

const statusOptions: Array<{ label: string; value: SocialPostRecord['status'] }> = [
  { label: 'draft', value: 'draft' },
  { label: 'ready', value: 'ready' },
  { label: 'posted', value: 'posted' },
]

watch(
  () => props.post,
  (post) => {
    if (!post) {
      form.platform = 'Instagram'
      form.title = ''
      form.body = ''
      form.status = 'draft'
      return
    }

    form.platform = post.platform
    form.title = post.title
    form.body = post.body
    form.status = post.status
  },
  { immediate: true },
)

function handleSubmit() {
  const platform = form.platform.trim()
  const title = form.title.trim()
  const body = form.body.trim()

  if (!platform || !title) return

  if (props.post) {
    emit('update', {
      platform,
      title,
      body,
      status: form.status,
    })
    return
  }

  emit('create', {
    platform,
    title,
    body: body || undefined,
  })

  form.title = ''
  form.body = ''
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div class="grid gap-5 md:grid-cols-2">
      <AppField label="Platform">
        <AppInput v-model="form.platform" type="text" placeholder="Instagram" />
      </AppField>

      <AppField label="Title">
        <AppInput v-model="form.title" type="text" placeholder="Launch teaser" />
      </AppField>
    </div>

    <AppField label="Body">
      <AppTextarea v-model="form.body" class="min-h-32" placeholder="The copy goes here :3" />
    </AppField>

    <AppField v-if="post" label="Status">
      <AppSelect v-model="form.status" :options="statusOptions" />
    </AppField>

    <div class="flex flex-wrap gap-3">
      <AppButton type="submit" :loading="loading">
        {{ post ? (loading ? 'Saving...' : 'Save post') : loading ? 'Creating...' : 'Create post' }}
      </AppButton>

      <AppButton v-if="post" type="button" variant="ghost" @click="emit('cancel')"
        >Cancel</AppButton
      >
    </div>
  </form>
</template>
