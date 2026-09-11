import { Mic, RotateCcw, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  createRecognizer,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  PASS_THRESHOLD,
  similarity,
  speak,
} from '../../lib/speech'

const RECOGNITION_ERROR_MESSAGES = {
  'not-allowed': "Microphone access is off, so I can't listen — that's okay, just self-check below.",
  'audio-capture': "I couldn't find a working microphone — that's okay, just self-check below.",
  'no-speech': "Didn't catch anything that time.",
  network: 'Connection hiccup while listening.',
}

// Some browsers/permission states never fire onresult/onerror/onend at all
// (e.g. a permission prompt left unanswered) — without a hard timeout the
// user would be stuck on the pulsing "listening" state forever.
const LISTEN_TIMEOUT_MS = 8000

export default function Pronunciation({ exercise, onResult }) {
  const [phase, setPhase] = useState('idle') // idle | listening | correct | retry | self-report
  const [attempts, setAttempts] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)

  const speechSupported = isSpeechRecognitionSupported()
  const ttsSupported = isSpeechSynthesisSupported()

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleListen() {
    speak(exercise.target)
  }

  function stopListening(nextPhase, message) {
    clearTimeout(timeoutRef.current)
    recognitionRef.current = null
    setErrorMessage(message ?? null)
    setPhase(nextPhase)
  }

  function handleRecord() {
    if (phase === 'listening') return // guard against double-tap while already recording
    const recognition = createRecognizer()
    if (!recognition) {
      setPhase('self-report')
      return
    }

    recognitionRef.current = recognition
    setErrorMessage(null)
    setPhase('listening')

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      const score = similarity(transcript, exercise.target)
      setAttempts((a) => a + 1)
      stopListening(score >= PASS_THRESHOLD ? 'correct' : 'retry')
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        stopListening('self-report', RECOGNITION_ERROR_MESSAGES[event.error])
      } else {
        setAttempts((a) => a + 1)
        stopListening('retry', RECOGNITION_ERROR_MESSAGES[event.error] ?? "Didn't catch that clearly.")
      }
    }

    recognition.onend = () => {
      // If neither onresult nor onerror fired (e.g. silence timeout), don't get stuck.
      setPhase((p) => (p === 'listening' ? 'retry' : p))
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      recognition.abort()
      setAttempts((a) => a + 1)
      stopListening('retry', "Didn't hear anything — check your mic and try again.")
    }, LISTEN_TIMEOUT_MS)

    recognition.start()
  }

  function handleCancelListening() {
    recognitionRef.current?.abort()
    stopListening('idle')
  }

  // Browser has no speech recognition at all — never block the lesson on it.
  if (!speechSupported && phase === 'idle') {
    return (
      <SelfReport
        exercise={exercise}
        ttsSupported={ttsSupported}
        onListen={handleListen}
        note="Your browser doesn't support speech recognition — practice saying it out loud, then tell us how it went."
        onResult={onResult}
      />
    )
  }

  if (phase === 'self-report') {
    return (
      <SelfReport
        exercise={exercise}
        ttsSupported={ttsSupported}
        onListen={handleListen}
        note={errorMessage}
        onResult={onResult}
      />
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <p className="text-lg font-medium text-gray-800 text-center">{exercise.prompt}</p>
      <p className="text-2xl font-semibold text-primary-700 text-center">{exercise.target}</p>

      {ttsSupported && (
        <button
          type="button"
          onClick={handleListen}
          className="flex items-center gap-2 text-primary-600 font-medium"
        >
          <Volume2 size={20} /> Listen
        </button>
      )}

      {phase === 'idle' && (
        <button
          type="button"
          onClick={handleRecord}
          className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center"
        >
          <Mic size={32} />
        </button>
      )}

      {phase === 'listening' && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center animate-pulse">
            <Mic size={32} />
          </div>
          <button type="button" onClick={handleCancelListening} className="text-sm text-gray-400">
            Cancel
          </button>
        </div>
      )}

      {phase === 'retry' && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-gray-500 text-center">
            {errorMessage ?? 'Not quite — give it another try.'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRecord}
              className="flex items-center gap-1.5 rounded-xl border border-primary-500 text-primary-600 px-4 py-2 font-medium"
            >
              <RotateCcw size={16} /> Try again
            </button>
            {attempts >= 2 && (
              <button
                type="button"
                onClick={() => setPhase('self-report')}
                className="rounded-xl border border-gray-200 text-gray-500 px-4 py-2 font-medium"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'correct' && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-success font-medium">Nicely done! 🎉</p>
          <button
            type="button"
            onClick={() => onResult(true)}
            className="rounded-xl bg-primary-600 text-white py-3 px-8 font-medium"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

// Fallback used whenever we can't (or shouldn't) trust automated recognition:
// unsupported browser, denied mic, or repeated misfires. The user self-grades
// instead of being hard-blocked — mirrors the Flashcard "knew it" pattern.
function SelfReport({ exercise, ttsSupported, onListen, note, onResult }) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <p className="text-lg font-medium text-gray-800 text-center">{exercise.prompt}</p>
      <p className="text-2xl font-semibold text-primary-700 text-center">{exercise.target}</p>

      {ttsSupported && (
        <button type="button" onClick={onListen} className="flex items-center gap-2 text-primary-600 font-medium">
          <Volume2 size={20} /> Listen
        </button>
      )}

      {note && <p className="text-sm text-gray-500 text-center">{note}</p>}

      <p className="text-sm text-gray-600">Say it out loud, then let us know:</p>
      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={() => onResult(false)}
          className="flex-1 rounded-xl border border-danger text-danger py-3 font-medium"
        >
          Struggled
        </button>
        <button
          type="button"
          onClick={() => onResult(true)}
          className="flex-1 rounded-xl bg-success text-white py-3 font-medium"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
