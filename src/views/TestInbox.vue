<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth, type TestInboxLinkPreview } from '@/composables/useAuth'
import AppPanel from '@/components/ui/AppPanel.vue'
import AppField from '@/components/ui/AppField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppPanelHeader from '@/components/ui/AppPanelHeader.vue'
import AppLinkButton from '@/components/ui/AppLinkButton.vue'
import AppAlert from '@/components/ui/AppAlert.vue'

type LookupState = 'idle' | 'loading' | 'success' | 'empty' | 'unavailable' | 'error'

const route = useRoute()
const { getLatestTestInboxLink } = useAuth()

const email = ref('')
const state = ref<LookupState>('idle')
const message = ref('')
const preview = ref<TestInboxLinkPreview | null>(null)
const submitted = ref(false)
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emailError = computed(() => {
  const normalizedEmail = email.value.trim()

  if (!normalizedEmail && submitted.value) return 'Email is required'
  if (normalizedEmail && !emailPattern.test(normalizedEmail)) return 'Enter a valid email address'
  return ''
})

const hasValidationErrors = computed(() => Boolean(emailError.value))

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

async function handleLookup() {
  submitted.value = true
  preview.value = null
  message.value = ''

  if (hasValidationErrors.value) {
    state.value = 'idle'
    return
  }

  state.value = 'loading'

  const normalizedEmail = email.value.trim()
  email.value = normalizedEmail
  const result = await getLatestTestInboxLink(normalizedEmail)

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
  if (typeof initialEmail === 'string' && initialEmail.trim().length > 0) {
    email.value = initialEmail.trim()
    await handleLookup()
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <p class="section-label">Tester tools</p>
      <h1 class="text-3xl font-bold tracking-tight">Dev inbox</h1>
      <p class="text-sm text-(--app-text-muted)">
        Find the latest valid magic link for a tester email when SMTP is disabled.
      </p>
    </div>

    <AppPanel>
      <div class="space-y-4">
        <AppField id="test-inbox-email" label="Email" required :error="emailError">
          <AppInput
            id="test-inbox-email"
            v-model="email"
            type="email"
            placeholder="tester@example.com"
          />
        </AppField>

        <AppButton
          type="button"
          class="w-full sm:w-auto"
          :loading="state === 'loading'"
          :disabled="hasValidationErrors"
          @click="handleLookup"
        >
          {{ state === 'loading' ? 'Looking up link...' : 'Find latest link' }}
        </AppButton>
      </div>
    </AppPanel>

    <AppPanel v-if="state === 'success' && preview" tone="muted" class="space-y-5">
      <AppPanelHeader eyebrow="Latest valid link" :title="preview.email" size="md" />

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

      <AppLinkButton :href="preview.magic_link"> Open magic link </AppLinkButton>
    </AppPanel>

    <AppPanel v-else-if="state === 'empty'">
      <AppPanelHeader
        eyebrow="No active link"
        :title="message || 'No valid magic link was found for this email :c'"
      />
    </AppPanel>

    <AppPanel v-else-if="state === 'unavailable'">
      <AppPanelHeader
        eyebrow="Unavailable"
        :title="message || 'The test inbox is not enabled in this environment :c'"
      />
    </AppPanel>

    <AppAlert v-else-if="state === 'error'" tone="danger">
      {{ message }}
    </AppAlert>
  </div>
</template>
