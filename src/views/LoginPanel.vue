<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AppPanel from '@/components/ui/AppPanel.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppLinkButton from '@/components/ui/AppLinkButton.vue'

const router = useRouter()
const route = useRoute()
const { requestMagicLink, verifyMagicToken, isTestInboxPreviewAvailable } = useAuth()

const email = ref('')
const error = ref('')
const loading = ref(false)
const linkSent = ref(false)
const linkMessage = ref('')
const verifying = ref(false)

onMounted(async () => {
  const token = route.query.token as string | undefined
  if (!token) return

  verifying.value = true
  error.value = ''

  try {
    await verifyMagicToken(token)
    router.replace('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Verification failed'
  } finally {
    verifying.value = false
  }
})

async function handleRequestLink() {
  error.value = ''

  if (!email.value.trim()) {
    error.value = 'Please enter your email QwQ'
    return
  }

  loading.value = true

  try {
    linkMessage.value = await requestMagicLink(email.value.trim())
    linkSent.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not reach server'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  linkSent.value = false
  error.value = ''
}
</script>

<template>
  <div v-if="verifying" class="space-y-4 text-center">
    <p class="section-label">Authentication</p>
    <h1 class="text-3xl font-bold tracking-tight">Verifying your magic link...</h1>
    <p class="text-sm text-(--app-text-muted)">Hang on, this will only take a moment :3</p>
  </div>

  <div v-else-if="linkSent" class="space-y-6">
    <div class="space-y-2">
      <p class="section-label">Check your inbox</p>
      <h1 class="text-3xl font-bold tracking-tight">Magic link requested</h1>
      <p class="text-sm text-(--app-text-muted)">{{ linkMessage }}</p>
    </div>

    <AppPanel v-if="isTestInboxPreviewAvailable" class="space-y-4">
      <p class="text-sm leading-6 text-(--app-text-muted)">
        This instance is configured without an SMTP server. You can get the magic link from the dev
        inbox!
      </p>

      <div class="mt-4">
        <AppLinkButton :to="{ name: 'test-inbox', query: { email } }">
          Open dev inbox
        </AppLinkButton>
      </div>
    </AppPanel>

    <AppButton type="button" variant="ghost" @click="resetForm">Try a different email</AppButton>
  </div>

  <div v-else class="space-y-6">
    <div class="space-y-2">
      <p class="section-label">Authentication</p>
      <h1 class="text-3xl font-bold tracking-tight">Sign in</h1>
      <p class="text-sm text-(--app-text-muted)">
        Enter your email and we'll send you your own magic link :3
      </p>
    </div>

    <AppAlert v-if="error" tone="danger">{{ error }}</AppAlert>

    <form @submit.prevent="handleRequestLink" class="space-y-5">
      <AppField id="email" label="email">
        <AppInput id="email" v-model="email" type="email" placeholder="admin@example.com" />
      </AppField>

      <AppButton type="submit" :loading="loading" class="w-full">
        {{ loading ? 'Sending link...' : 'Send magic link' }}
      </AppButton>
    </form>
  </div>
</template>
