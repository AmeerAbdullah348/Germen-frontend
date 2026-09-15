import { readJSON, writeJSON } from './storage'

// Captures the browser's install-eligibility signal as early as possible
// (module load, not inside a component) since `beforeinstallprompt` only
// fires once and we call preventDefault() to stop Chrome's own mini-infobar
// so InstallBanner can show it at a time of our choosing instead.
let deferredPrompt = null
let listeners = []

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    listeners.forEach((cb) => cb())
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
  })
}

export function getDeferredInstallPrompt() {
  return deferredPrompt
}

// Lets InstallBanner re-render once the event arrives, since it can fire
// after the component has already mounted.
export function onInstallPromptAvailable(callback) {
  listeners.push(callback)
  return () => {
    listeners = listeners.filter((l) => l !== callback)
  }
}

export function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

// --- Dismiss cooldown (local-only, not synced — purely a UI nag-avoidance flag) ---
const DISMISS_KEY = 'gla:installPromptDismissedAt'
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000

export function isInstallPromptDismissed(now = new Date()) {
  const dismissedAt = readJSON(DISMISS_KEY, null)
  return typeof dismissedAt === 'number' && now.getTime() - dismissedAt < DISMISS_COOLDOWN_MS
}

export function dismissInstallPrompt(now = new Date()) {
  writeJSON(DISMISS_KEY, now.getTime())
}
