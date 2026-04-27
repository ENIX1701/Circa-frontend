<script setup lang="ts">
import type { EventBrandingRecord, UpsertEventBrandingRequest } from '@/composables/useEvents'
import AppField from '../ui/AppField.vue'
import AppInput from '../ui/AppInput.vue'
import ColorField from '../ui/ColorField.vue'
import AppSelect from '../ui/AppSelect.vue'
import AppTextarea from '../ui/AppTextarea.vue'
import AppButton from '../ui/AppButton.vue'

const props = defineProps<{
  form: UpsertEventBrandingRequest
  saving?: boolean
}>()

const emit = defineEmits<{
  save: []
  'update:form': [value: UpsertEventBrandingRequest]
}>()

const themeOptions: Array<{ label: string; value: EventBrandingRecord['theme_mode'] }> = [
  { label: 'dark', value: 'dark' },
  { label: 'light', value: 'light' },
]

function updateForm(patch: Partial<UpsertEventBrandingRequest>) {
  emit('update:form', { ...props.form, ...patch })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="emit('save')">
    <AppField id="event-name-override" label="Event name override">
      <AppInput
        id="event-name-override"
        :model-value="form.event_name_override"
        type="text"
        placeholder="The coolest event on Earth!!"
        @update:model-value="updateForm({ event_name_override: String($event) })"
      />
    </AppField>

    <AppField id="event-tagline" label="Tagline">
      <AppInput
        id="event-tagline"
        :model-value="form.tagline"
        type="text"
        placeholder="We make things. They usually work..."
        @update:model-value="updateForm({ tagline: String($event) })"
      />
    </AppField>

    <div class="grid gap-5 md:grid-cols-2">
      <ColorField
        id="primary-color"
        :color="form.primary_color"
        label="Primary color"
        @update:color="updateForm({ primary_color: $event })"
      />
      <ColorField
        id="secondary-color"
        :color="form.secondary_color"
        label="Secondary color"
        @update:color="updateForm({ secondary_color: $event })"
      />
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <AppField id="theme-mode" label="Theme mode"
        ><AppSelect
          id="theme-mode"
          :model-value="form.theme_mode"
          :options="themeOptions"
          @update:model-value="
            updateForm({ theme_mode: $event as EventBrandingRecord['theme_mode'] })
          "
      /></AppField>
      <ColorField
        id="background-color"
        :color="form.background_color"
        label="Brand background"
        hint="Used in previews and brand surfaces :3"
        @update:color="updateForm({ background_color: $event })"
      />
    </div>

    <AppField id="branding-notes" label="Notes">
      <AppTextarea
        id="branding-notes"
        :model-value="form.notes"
        class="min-h-32"
        placeholder="No fluff description of what about to get done >:3c"
        @update:model-value="updateForm({ notes: $event })"
      />
    </AppField>

    <AppButton type="submit" :loading="saving">
      {{ saving ? 'Saving...' : 'Save branding' }}
    </AppButton>
  </form>
</template>
