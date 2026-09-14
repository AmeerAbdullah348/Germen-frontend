// Thin wrapper around navigator.onLine — centralized so every "is this
// feature reachable right now" check (AI chat, conversation mode) agrees on
// the same source of truth as the offline banner.
export function isOnline() {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}
