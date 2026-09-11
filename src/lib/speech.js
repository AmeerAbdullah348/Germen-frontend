// Thin wrapper around the browser's built-in Web Speech API (free, no key).
// Both pieces (recognition + synthesis) are feature-detected independently —
// a browser can support one without the other.

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text, lang = 'de-DE') {
  if (!isSpeechSynthesisSupported()) return
  window.speechSynthesis.cancel() // avoid queuing/overlapping utterances on repeated taps
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  window.speechSynthesis.speak(utterance)
}

// Returns a ready-to-use recognizer, or null if unsupported.
export function createRecognizer(lang = 'de-DE') {
  if (!isSpeechRecognitionSupported()) return null
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognitionCtor()
  recognition.lang = lang
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  return recognition
}

// Word-overlap similarity — lenient on purpose since speech recognition of a
// non-native accent is inherently noisy; an exact-string match would fail
// too often on correct pronunciation.
export function similarity(transcript, target) {
  const normalize = (s) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.,!?]/g, '')
      .split(/\s+/)
      .filter(Boolean)

  const spoken = normalize(transcript)
  const expected = normalize(target)
  if (expected.length === 0) return 0

  const matched = expected.filter((word) => spoken.includes(word)).length
  return matched / expected.length
}

export const PASS_THRESHOLD = 0.6
