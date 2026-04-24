<script setup lang="ts">
import { useEvents, type EventBrandingRecord } from '@/composables/useEvents'
import { ref, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import ColorPicker from '@/components/ColorPicker.vue'

const route = useRoute()
const { getEventBranding, upsertEventBranding } = useEvents()

const eventId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const saved = ref(false)

const form = reactive({
  event_name_override: '',
  tagline: '',
  primary_color: '#8b5cf6',
  secondary_color: '#521bca',
  notes: '',
})

function applyBranding(branding: EventBrandingRecord) {
  form.event_name_override = branding.event_name_override
  form.tagline = branding.tagline
  form.primary_color = branding.primary_color?.trim() || '#8b5cf6'
  form.secondary_color = branding.secondary_color?.trim() || '#521bca'
  form.notes = branding.notes
}

async function loadBranding() {
  if (!eventId.value) {
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''
  saved.value = false

  try {
    const branding = await getEventBranding(eventId.value)
    applyBranding(branding)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load branding :c'
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!eventId.value) {
    return
  }

  saving.value = true
  error.value = ''
  saved.value = false

  try {
    const branding = await upsertEventBranding(eventId.value, {
      event_name_override: form.event_name_override.trim(),
      tagline: form.tagline.trim(),
      primary_color: form.primary_color.trim(),
      secondary_color: form.secondary_color.trim(),
      notes: form.notes.trim(),
    })

    applyBranding(branding)
    saved.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save branding :c'
  } finally {
    saving.value = false
  }
}

watch(
  eventId,
  () => {
    void loadBranding()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="section-label">Branding</p>
      <h1 class="text-3xl font-bold tracking-tight">Event branding</h1>
    </div>

    <div v-if="error" class="app-alert app-alert--danger">{{ error }}</div>

    <div v-if="saved" class="app-alert app-alert--success">Branding saved :3</div>

    <div v-if="loading" class="glass-panel p-6">
      <p class="text-sm text-(--color-text-muted)">Loading branding...</p>
    </div>

    <form v-else class="glass-panel p-6 space-y-4" @submit.prevent="handleSave">
      <div class="space-y-2">
        <label for="event-name-override" class="block text-sm font-medium text-(--color-text-muted)"
          >Event name override</label
        >
        <input
          id="event-name-override"
          v-model="form.event_name_override"
          type="text"
          class="app-input"
          placeholder="The coolest event on Earth!!!"
        />
      </div>

      <div class="space-y-2">
        <label for="branding-tagline" class="block text-sm font-medium text-(--color-text-muted)"
          >Tagline</label
        >
        <input
          id="branding-tagline"
          v-model="form.tagline"
          type="text"
          class="app-input"
          placeholder="We make things. They usually work."
        />
      </div>
      
      <div class="grid gap-4 md:grid-cols-2">
        <ColorPicker title="primary" v-model:color="form.primary_color"/>
        <ColorPicker title="secondary" v-model:color="form.secondary_color"/>
      </div>

      <div class="space-y-2">
        <label for="branding-notes" class="block text-sm font-medium text-(--color-text-muted)"
          >Notes</label
        >
        <textarea
          id="branding-notes"
          v-model="form.notes"
          class="app-input min-h-32 resize-none"
          placeholder="The no fluff description of what's about to get done >:3c"
        />
      </div>

      <button type="submit" class="app-button-primary" :disabled="saving">
        {{ saving ? 'Saving...' : 'Save branding' }}
      </button>
    </form>

    <section class="glass-panel p-6">
      <p class="section-label">Preview</p>

      <div class="mt-4 rounded-2xl border border-white/10 p-5" :style="{background: `linear-gradient(135deg, ${form.primary_color || '#8b5cf6'}, ${form.secondary_color || '#521bca'})`}">
        <p class="text-xs uppercase text-white">Event preview</p>
        <h2 class="mt-3 text-2xl font-bold text-white">{{ form.event_name_override || 'Event name' }}</h2>
        <p class="mt-2 text-sm text-white">{{ form.tagline || 'Tagline goes here' }}</p>
      </div>
    </section>
  </div>
</template>
