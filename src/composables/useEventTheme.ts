import { computed, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEvents, type EventBrandingRecord } from '@/composables/useEvents'

type ThemeMode = EventBrandingRecord['theme_mode']

const DEFAULT_THEME = {
  mode: 'dark' as ThemeMode,
  bg: '#0f0f12',
  bgDeep: '#050505',
  primary: '#8b5cf6',
  secondary: '#00f3ff',
}

function normalizeHex(value: string | undefined | null, fallback: string) {
  const raw = value?.trim()

  if (!raw) return fallback

  const withHash = raw.startsWith('#') ? raw : `#${raw}`

  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash : fallback
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex, DEFAULT_THEME.bg).replace('#', '')
  const value = Number.parseInt(normalized, 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function setColorVar(name: string, value: string) {
  const color = normalizeHex(value, DEFAULT_THEME.bg)
  const rgb = hexToRgb(color)
  const root = document.documentElement

  root.style.setProperty(`--color-${name}`, color)
  root.style.setProperty(`--color-${name}-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`)
}

function applyModeVars(mode: ThemeMode) {
  const root = document.documentElement

  root.style.setProperty('color-scheme', mode)
  root.dataset.theme = mode

  if (mode === 'light') {
    root.style.setProperty('--color-bg-deep', '#f8fafc')
    root.style.setProperty('--color-surface', 'rgba(255, 255, 255, 0.7)')
    root.style.setProperty('--color-surface-strong', 'rgba(255, 255, 255, 0.9)')
    root.style.setProperty('--color-surface-border', 'rgba(15, 20, 40, 0.1)')
    root.style.setProperty('--color-text', 'rgba(15, 20, 40, 1)')
    root.style.setProperty('--color-text-muted', 'rgba(50, 65, 75, 0.7)')
    return
  }

  root.style.setProperty('--color-bg-deep', DEFAULT_THEME.bgDeep)
  root.style.setProperty('--color-surface', 'rgba(255, 255, 255, 0.05)')
  root.style.setProperty('--color-surface-strong', 'rgba(255, 255, 255, 0.1)')
  root.style.setProperty('--color-surface-border', 'rgba(255, 255, 255, 0.1)')
  root.style.setProperty('--color-text', 'rgba(255, 255, 255, 1)')
  root.style.setProperty('--color-text-muted', 'rgba(255, 255, 255, 0.7)')
}

function applyTheme(branding: EventBrandingRecord) {
  const mode = branding.theme_mode === 'light' ? 'light' : 'dark'

  setColorVar('bg', normalizeHex(branding.background_color, DEFAULT_THEME.bg))
  setColorVar('primary', normalizeHex(branding.primary_color, DEFAULT_THEME.primary))
  setColorVar('secondary', normalizeHex(branding.secondary_color, DEFAULT_THEME.secondary))
  applyModeVars(mode)
}

function resetTheme() {
  setColorVar('bg', DEFAULT_THEME.bg)
  setColorVar('primary', DEFAULT_THEME.primary)
  setColorVar('secondary', DEFAULT_THEME.secondary)

  applyModeVars(DEFAULT_THEME.mode)
}

export function useEventTheme() {
  const route = useRoute()
  const { getEventBranding } = useEvents()

  const eventId = computed(() => {
    const id = route.params.id
    return typeof id === 'string' ? id : ''
  })

  async function loadTheme(id: string) {
    if (!id) {
      resetTheme()
      return
    }

    try {
      const branding = await getEventBranding(id)
      applyTheme(branding)
    } catch {
      resetTheme()
    }
  }

  function handleBrandingUpdated(event: Event) {
    const customEvent = event as CustomEvent<{ eventId: string; branding?: EventBrandingRecord }>

    if (customEvent.detail?.eventId !== eventId.value) return

    if (customEvent.detail.branding) {
      applyTheme(customEvent.detail.branding)
      return
    }

    void loadTheme(eventId.value)
  }

  watch(eventId, (id) => void loadTheme(id), { immediate: true })

  window.addEventListener('circa:branding-updated', handleBrandingUpdated)
  onBeforeUnmount(() => {
    window.removeEventListener('circa:branding-updated', handleBrandingUpdated)
  })
}
