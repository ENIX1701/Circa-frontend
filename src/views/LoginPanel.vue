<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { requestMagicLink, verifyMagicToken } = useAuth()

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
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Verification failed'
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
    const message = await requestMagicLink(email.value)
    linkSent.value = true
    linkMessage.value = message
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not reach server'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  linkSent.value = false
  error.value = ''
}
</script>

<!-- TODO: make the sidebar go away on the login screen :sob: -->
<template>
  <div v-if="verifying" class="space-y-4 text-center">
    <h1 class="text-2xl font-bold text-white">Verifying your magic link...</h1>
    <p class="text-neutral-400">Hang on, this will only take a moment :3</p>
  </div>

  <div v-else-if="linkSent" class="space-y-4">
    <h1 class="text-2xl font-bold text-white">
      Check your inbox! (or the backend console for now...)
    </h1>
    <p class="text-neutral-400">{{ linkMessage }}</p>
    <button
      @click="resetForm"
      class="text-sm text-violet-400 hover:text-violet-300 underline transition"
    >
      Try a different email
    </button>
  </div>

  <div v-else>
    <form @submit.prevent="handleRequestLink" class="w-full">
      <h1 class="text-2xl font-bold text-white">Sign in</h1>

      <div v-if="error" class="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">{{ error }}</div>

      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium text-neutral-400">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="admin@example.com"
          class="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-white placeholder-neutral-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-violet-600 px-4 py-2 font-medium text-white transition hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Sending link...' : 'Send magic link' }}
      </button>
    </form>
  </div>
</template>
