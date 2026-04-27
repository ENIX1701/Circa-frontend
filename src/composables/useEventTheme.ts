import { computed, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEvents, type EventBrandingRecord } from '@/composables/useEvents'

type ThemeMode = EventBrandingRecord['theme_mode']

const DEFAULT_THEME = {
  mode: 'dark' as ThemeMode,
  bg: '#111111',
  bgDeep: '#0b0b0b',
  primary: '#8b5cf6',
  secondary: '#f97316',
  surface: '#181818',
  surfaceStrong: '#202020',
  border: '#343434',
  text: '#f5f5f5',
  textMuted: '#a8a29e',
}

function normalizeHex(value: string | undefined | null, fallback: string) {
  const raw = value?.trim()

  if (!raw) return fallback

  const withHash = raw.startsWith('#') ? raw : `#${raw}`

  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash : fallback
}

function hexToRgb(hex: string, fallback: string) {
  const normalized = normalizeHex(hex, fallback).replace('#', '')
  const value = Number.parseInt(normalized, 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function setColorVar(name: string, value: string, fallback = DEFAULT_THEME.primary) {
  const color = normalizeHex(value, fallback)
  const rgb = hexToRgb(color, fallback)
  const root = document.documentElement

  root.style.setProperty(`--color-${name}`, color)
  root.style.setProperty(`--color-${name}-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`)
}

function applyModeVars(mode: ThemeMode) {
  const root = document.documentElement

  root.style.setProperty('color-scheme', mode)
  root.dataset.theme = mode

  if (mode === 'light') {
    root.style.setProperty('--color-bg', '#f7f4ef')
    root.style.setProperty('--color-bg-deep', '#f8fafc')
    root.style.setProperty('--color-surface', 'rgba(255, 255, 255, 0.7)')
    root.style.setProperty('--color-surface-strong', 'rgba(255, 255, 255, 0.9)')
    root.style.setProperty('--color-surface-border', 'rgba(15, 20, 40, 0.1)')
    root.style.setProperty('--color-text', 'rgba(15, 20, 40, 1)')
    root.style.setProperty('--color-text-muted', 'rgba(50, 65, 75, 0.7)')
    return
  }

  root.style.setProperty('--color-bg', DEFAULT_THEME.bg)
  root.style.setProperty('--color-bg-deep', DEFAULT_THEME.bgDeep)
  root.style.setProperty('--color-surface', DEFAULT_THEME.surface)
  root.style.setProperty('--color-surface-strong', DEFAULT_THEME.surfaceStrong)
  root.style.setProperty('--color-surface-border', DEFAULT_THEME.border)
  root.style.setProperty('--color-text', DEFAULT_THEME.text)
  root.style.setProperty('--color-text-muted', DEFAULT_THEME.textMuted)
}

function applyTheme(branding: EventBrandingRecord) {
  const mode = branding.theme_mode === 'light' ? 'light' : 'dark'

  applyModeVars(mode)
  setColorVar('primary', branding.primary_color, DEFAULT_THEME.primary)
  setColorVar('secondary', branding.secondary_color, DEFAULT_THEME.secondary)
}

function resetTheme() {
  applyModeVars(DEFAULT_THEME.mode)

  setColorVar('primary', DEFAULT_THEME.primary, DEFAULT_THEME.primary)
  setColorVar('secondary', DEFAULT_THEME.secondary, DEFAULT_THEME.secondary)
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
