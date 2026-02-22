<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const error = ref('')
const loading = ref(false)

// get submit
async function handleLogin() {
  error.value = ''

  if (!email.value.trim()) {
    error.value = 'Please enter your email'
    return
  }

  loading.value = true

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    })

    if (!res.ok) {
      const message = await res.text()
      error.value = message || 'Login failed'
      return
    }

    const data = await res.json()
    localStorage.setItem('token', data.token)
    router.push('/')
  } catch {
    error.value = 'Could not reach server'
  } finally {
    loading.value = false
  }
}
</script>

<!-- TODO: make the sidebar go away on the login screen :sob: -->
<template>
  <div>
    <form @submit.prevent="handleLogin" class="w-full">
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
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>
