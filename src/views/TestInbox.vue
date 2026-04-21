<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth, type TestInboxLinkPreview } from '@/composables/useAuth'

type LookupState = 'idle' | 'loading' | 'success' | 'empty' | 'unavailable' | 'error'

const route = useRoute()
const { getLatestTestInboxLink } = useAuth()

const email = ref('')
const state = ref<LookupState>('idle')
const message = ref('')
const preview = ref<TestInboxLinkPreview | null>(null)

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

async function handleLookup() {
  preview.value = null
  message.value = ''

  if (!email.value.trim()) {
    state.value = 'error'
    message.value = 'Please enter your email'
    return
  }

  state.value = 'loading'

  const result = await getLatestTestInboxLink(email.value.trim())

  if (!result.ok) {
    const normalized = result.message.toLowerCase()

    if (result.status === 404 && normalized.includes('unavailable')) {
      state.value = 'unavailable'
      message.value = result.message
      return
    }

    if (result.status === 404) {
      state.value = 'empty'
      message.value = result.message
      return
    }

    state.value = 'error'
    message.value = result.message
    return
  }

  preview.value = result.data
  state.value = 'success'
}

onMounted(async () => {
  const initialEmail = route.query.email
  if (typeof initialEmail === 'string' && initialEmail.length > 0) {
    email.value = initialEmail
    await handleLookup()
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <p class="section-label">Tester tools</p>
      <h1 class="text-3xl font-bold tracking-tight">Dev inbox</h1>
      <p class="text-sm text-[var(--color-text-muted)]">
        Find the latest valid magic link for a tester email when SMTP is disabled.
      </p>
    </div>

    <div class="glass-panel p-5">
      <div class="space-y-4">
        <div class="space-y-2">
          <label
            for="test-inbox-email"
            class="block text-sm font-medium text-[var(--color-text-muted)]"
          >
            Email
          </label>
          <input
            id="test-inbox-email"
            v-model="email"
            type="email"
            class="app-input"
            placeholder="tester@example.com"
          />
        </div>

        <button
          type="button"
          class="app-button-primary w-full sm:w-auto"
          :disabled="state === 'loading'"
          @click="handleLookup"
        >
          {{ state === 'loading' ? 'Looking up link...' : 'Find latest link' }}
        </button>
      </div>
    </div>

    <div
      v-if="state === 'success' && preview"
      class="glass-panel glass-panel--strong p-5 space-y-5"
    >
      <div class="space-y-1">
        <p class="section-label">Latest valid link</p>
        <h2 class="text-xl font-semibold">{{ preview.email }}</h2>
      </div>

      <div class="meta-grid">
        <div class="meta-row">
          <span class="meta-label">Requested</span>
          <span class="meta-value">{{ formatDate(preview.requested_at) }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Expires</span>
          <span class="meta-value">{{ formatDate(preview.expires_at) }}</span>
        </div>
      </div>

      <a :href="preview.magic_link" class="app-button-secondary"> Open magic link </a>
    </div>

    <div v-else-if="state === 'empty'" class="glass-panel p-5">
      <p class="section-label">No active link</p>
      <p class="mt-2 text-sm text-[var(--color-text-muted)]">
        {{ message || 'No valid magic link was found for this email.' }}
      </p>
    </div>

    <div v-else-if="state === 'unavailable'" class="glass-panel p-5">
      <p class="section-label">Unavailable</p>
      <p class="mt-2 text-sm text-[var(--color-text-muted)]">
        {{ message || 'The test inbox is not enabled in this environment.' }}
      </p>
    </div>

    <div v-else-if="state === 'error'" class="app-alert app-alert--danger">
      {{ message }}
    </div>
  </div>
</template>
