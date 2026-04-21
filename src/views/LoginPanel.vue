<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

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
    <p class="text-sm text-(--color-text-muted)">Hang on, this will only take a moment :3</p>
  </div>

  <div v-else-if="linkSent" class="space-y-6">
    <div class="space-y-2">
      <p class="section-label">Check your inbox</p>
      <h1 class="text-3xl font-bold tracking-tight">Magic link requested</h1>
      <p class="text-sm text(--color-text-muted)">{{ linkMessage }}</p>
    </div>

    <div v-if="isTestInboxPreviewAvailable" class="glass-panel p-4">
      <p class="text-sm leading-6 text-(--color-text-muted)">
        This instance is configured without an SMTP server. You can get the magic link from the dev
        inbox!
      </p>

      <div class="mt-4">
        <RouterLink :to="{ name: 'test-inbox', query: { email } }" class="app-button-secondary"
          >Open dev inbox</RouterLink
        >
      </div>
    </div>

    <button @click="resetForm" class="app-link-subtle">Try a different email</button>
  </div>

  <div v-else class="space-y-6">
    <div class="space-y-2">
      <p class="section-label">Authentication</p>
      <h1 class="text-3xl font-bold tracking-tight">Sign in</h1>
      <p class="text-sm text(--color-text-muted)">
        Enter your email and we'll send you your own magic link :3
      </p>
    </div>

    <div v-if="error" class="app-alert app-alert--danger">{{ error }}</div>

    <form @submit.prevent="handleRequestLink" class="space-y-5">
      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium text-(--color-text-muted)">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="admin@example.com"
          class="app-input"
        />
      </div>

      <button type="submit" :disabled="loading" class="app-button-primary w-full">
        {{ loading ? 'Sending link...' : 'Send magic link' }}
      </button>
    </form>
  </div>
</template>
