<script setup lang="ts">
import type { CreateSocialPostRequest, SocialPostRecord } from '@/composables/useEvents'
import { computed, reactive, ref, watch } from 'vue'
import AppField from '../ui/AppField.vue'
import AppTextarea from '../ui/AppTextarea.vue'
import AppSelect from '../ui/AppSelect.vue'
import AppButton from '../ui/AppButton.vue'
import AppInput from '../ui/AppInput.vue'
import { socialPostStatusOptions } from '@/config/formOptions'

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

const submitted = ref(false)

const platformError = computed(() => {
  if (!form.platform.trim() && submitted.value) return 'Platform is required'
  return ''
})

const titleError = computed(() => {
  if (!form.title.trim() && submitted.value) return 'Title is required'
  return ''
})

const hasValidationErrors = computed(() => Boolean(platformError.value || titleError.value))

watch(
  () => props.post,
  (post) => {
    submitted.value = false

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
  submitted.value = true

  if (hasValidationErrors.value) return

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
  submitted.value = false
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div class="grid gap-5 md:grid-cols-2">
      <AppField id="social-platform" label="Platform" required :error="platformError">
        <AppInput
          id="social-platform"
          v-model="form.platform"
          type="text"
          placeholder="Instagram"
        />
      </AppField>

      <AppField id="social-title" label="Title" required :error="titleError">
        <AppInput id="social-title" v-model="form.title" type="text" placeholder="Launch teaser" />
      </AppField>
    </div>

    <AppField id="social-body" label="Body">
      <AppTextarea
        id="social-body"
        v-model="form.body"
        class="min-h-32"
        placeholder="The copy goes here :3"
      />
    </AppField>

    <AppField v-if="post" id="social-status" label="Status">
      <AppSelect id="social-status" v-model="form.status" :options="socialPostStatusOptions" />
    </AppField>

    <div class="flex flex-wrap gap-3">
      <AppButton type="submit" :loading="loading" :disabled="hasValidationErrors">
        {{ post ? (loading ? 'Saving...' : 'Save post') : loading ? 'Creating...' : 'Create post' }}
      </AppButton>

      <AppButton v-if="post" type="button" variant="ghost" @click="emit('cancel')"
        >Cancel</AppButton
      >
    </div>
  </form>
</template>
