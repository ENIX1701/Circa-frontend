import { readonly, ref } from 'vue'

export type ToastTone = 'success' | 'danger' | 'info'

export interface ToastMessage {
  id: string
  tone: ToastTone
  title: string
  description?: string
}

const toasts = ref<ToastMessage[]>([])

function removeToast(id: string) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

// ts allows creating types from other types
// by omitting some of the fields
// this is really weird, but i really want to try x3
function pushToast(toast: Omit<ToastMessage, 'id'>) {
  const id = crypto.randomUUID()
  toasts.value = [...toasts.value, { id, ...toast }]

  window.setTimeout(() => removeToast(id), 3600)

  return id
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    pushToast,
    removeToast,
  }
}
