<script setup lang="ts">
import {
  useEvents,
  type EventBrandingRecord,
  type UpsertEventBrandingRequest,
} from '@/composables/useEvents'
import { ref, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import BrandingForm from '@/components/branding/BrandingForm.vue'
import BrandingPreview from '@/components/branding/BrandingPreview.vue'
import TypographyPreview from '@/components/branding/TypographyPreview.vue'

const route = useRoute()
const { getEventBranding, upsertEventBranding } = useEvents()

const eventId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const saved = ref(false)

const form = reactive<UpsertEventBrandingRequest>({
  event_name_override: '',
  tagline: '',
  primary_color: '#8b5cf6',
  secondary_color: '#f97316',
  theme_mode: 'dark',
  background_color: '#111111',
  notes: '',
})

function applyBranding(branding: EventBrandingRecord) {
  form.event_name_override = branding.event_name_override
  form.tagline = branding.tagline
  form.primary_color = branding.primary_color?.trim() || '#8b5cf6'
  form.secondary_color = branding.secondary_color?.trim() || '#f97316'
  form.theme_mode = branding.theme_mode || 'dark'
  form.background_color = branding.background_color?.trim() || '#111111'
  form.notes = branding.notes
}

function updateForm(nextForm: UpsertEventBrandingRequest) {
  Object.assign(form, nextForm)
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
      theme_mode: form.theme_mode,
      background_color: form.background_color.trim(),
      notes: form.notes.trim(),
    })

    applyBranding(branding)
    saved.value = true

    window.dispatchEvent(
      new CustomEvent('circa:branding-updated', {
        detail: {
          eventId: eventId.value,
          branding,
        },
      }),
    )
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
  <div class="space-y-8">
    <AppPageHeader eyebrow="Branding" title="branding" description="Give this even a soul!" />

    <AppAlert v-if="error" tone="danger">{{ error }}</AppAlert>
    <AppAlert v-if="saved" tone="success">Branding saved :3</AppAlert>

    <AppPanel v-if="loading">
      <p class="text-sm text-(--app-text-muted)">Loading branding...</p>
    </AppPanel>

    <div v-else class="grid gap-8 lg:grid-cols-2">
      <AppPanel>
        <BrandingForm :form="form" :saving="saving" @update:form="updateForm" @save="handleSave" />
      </AppPanel>

      <div class="space-y-8">
        <TypographyPreview />

        <BrandingPreview
          :event-name="form.event_name_override"
          :tagline="form.tagline"
          :primary-color="form.primary_color"
          :secondary-color="form.secondary_color"
          :background-color="form.background_color"
          :theme-mode="form.theme_mode"
        />
      </div>
    </div>
  </div>
</template>
