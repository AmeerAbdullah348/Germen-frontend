import { Mic, RotateCcw, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import {
  createRecognizer,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  PASS_THRESHOLD,
  similarity,
  SLOW_RATE,
  speak,
} from '../../lib/speech'

const RECOGNITION_ERROR_MESSAGES = {
  'not-allowed': "Microphone access is off, so I can't listen — that's okay, just self-check below.",
  'audio-capture': "I couldn't find a working microphone — that's okay, just self-check below.",
  'no-speech': "Didn't catch anything that time.",
  network: 'Connection hiccup while listening.',
}

const LISTEN_TIMEOUT_MS = 8000

export default function Pronunciation({ exercise, onResult }) {
  const [phase, setPhase] = useState('idle')
  const [attempts, setAttempts] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)
  const [heardTranscript, setHeardTranscript] = useState(null)
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

  function handleListen(rate = 1) {
    speak(exercise.target, 'de-DE', rate)
  }

  function stopListening(nextPhase, message) {
    clearTimeout(timeoutRef.current)
    recognitionRef.current = null
    setErrorMessage(message ?? null)
    setPhase(nextPhase)
  }

  function handleRecord() {
    if (phase === 'listening') return
    const recognition = createRecognizer()
    if (!recognition) {
      setPhase('self-report')
      return
    }

    recognitionRef.current = recognition
    setErrorMessage(null)
    setHeardTranscript(null)
    setPhase('listening')

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      const score = similarity(transcript, exercise.target)
      setAttempts((a) => a + 1)
      if (score < PASS_THRESHOLD) setHeardTranscript(transcript)
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
      <p className="text-lg font-bold text-slate-300 text-center">{exercise.prompt}</p>
      <p className="text-3xl font-black text-cyan-300 text-center drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">{exercise.target}</p>

      {ttsSupported && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleListen()}
            className="flex items-center gap-2 text-cyan-400 font-bold hover:underline"
          >
            <Volume2 size={20} /> Listen
          </button>
          <button
            type="button"
            onClick={() => handleListen(SLOW_RATE)}
            className="text-xs text-slate-400 font-medium"
          >
            Slower
          </button>
        </div>
      )}

      {phase === 'idle' && (
        <button
          type="button"
          onClick={handleRecord}
          className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 transition-all cursor-pointer"
        >
          <Mic size={32} />
        </button>
      )}

      {phase === 'listening' && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center animate-pulse shadow-[0_0_25px_rgba(16,185,129,0.5)]">
            <Mic size={32} />
          </div>
          <button type="button" onClick={handleCancelListening} className="text-xs text-slate-400 hover:text-white">
            Cancel
          </button>
        </div>
      )}

      {phase === 'retry' && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-slate-300 text-center">
            {errorMessage ?? 'Not quite — give it another try.'}
          </p>
          {heardTranscript && (
            <p className="text-xs text-slate-400 text-center">We heard: "{heardTranscript}"</p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRecord}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-300 px-4 py-2 text-xs font-bold"
            >
              <RotateCcw size={15} /> Try again
            </button>
            {attempts >= 2 && (
              <button
                type="button"
                onClick={() => setPhase('self-report')}
                className="rounded-xl border border-white/10 text-slate-400 px-4 py-2 text-xs font-bold"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'correct' && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-emerald-400 font-extrabold text-base">Nicely done! 🎉</p>
          <Button className="px-8" onClick={() => onResult(true)}>
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}

function SelfReport({ exercise, ttsSupported, onListen, note, onResult }) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <p className="text-lg font-bold text-slate-300 text-center">{exercise.prompt}</p>
      <p className="text-3xl font-black text-cyan-300 text-center drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">{exercise.target}</p>

      {ttsSupported && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onListen()}
            className="flex items-center gap-2 text-cyan-400 font-bold hover:underline"
          >
            <Volume2 size={20} /> Listen
          </button>
          <button type="button" onClick={() => onListen(SLOW_RATE)} className="text-xs text-slate-400 font-medium">
            Slower
          </button>
        </div>
      )}

      {note && <p className="text-xs text-slate-400 text-center">{note}</p>}

      <p className="text-xs text-slate-300">Say it out loud, then let us know:</p>
      <div className="flex gap-3 w-full">
        <Button variant="outline-danger" className="flex-1" onClick={() => onResult(false)}>
          Struggled
        </Button>
        <Button variant="success" className="flex-1" onClick={() => onResult(true)}>
          Got it
        </Button>
      </div>
    </div>
  )
}
