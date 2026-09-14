import { getCachedAnswer, setCachedAnswer } from './chatCache'
import { getRemainingMessages, recordMessageSent } from './chatLimits'
import { isOnline } from './network'
import { supabase } from './supabaseClient'

export const MAX_INPUT_LENGTH = 500
// How many prior messages to resend for context on follow-ups like "give me
// another example" — capped to keep each request small on the free tier.
const MAX_HISTORY_MESSAGES = 8

// history: array of { role: 'user' | 'assistant', text: string }, oldest first,
// NOT including the message being sent now. Pass [] for a fresh conversation.
export async function askChatbot(rawMessage, history = []) {
  const message = rawMessage.trim()

  if (!message) {
    return { status: 'empty', text: '' }
  }

  if (message.length > MAX_INPUT_LENGTH) {
    return {
      status: 'too-long',
      text: `That message is a bit long — please keep questions under ${MAX_INPUT_LENGTH} characters.`,
    }
  }

  if (getRemainingMessages() <= 0) {
    return {
      status: 'rate-limited',
      text: "You've reached today's question limit so we can keep the chatbot free for everyone. Please come back tomorrow!",
    }
  }

  // The FAQ cache only makes sense for a context-free opening question — a
  // cached answer to "give me another example" would ignore what was
  // actually being discussed, so follow-ups always hit the API fresh. This
  // lookup is a local read, so it still works offline even though the
  // fallback below (an actual network call) can't.
  const isFollowUp = history.length > 0
  if (!isFollowUp) {
    const cached = getCachedAnswer(message)
    if (cached) {
      return { status: 'cached', text: cached }
    }
  }

  if (!isOnline()) {
    return {
      status: 'offline',
      text: "You're offline — the AI tutor needs an internet connection. Your other practice still works offline.",
    }
  }

  const trimmedHistory = history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.text.slice(0, MAX_INPUT_LENGTH) }))

  try {
    // supabase.functions.invoke handles the Authorization header (anon key /
    // user session token) that a plain fetch to the function URL would need
    // to attach manually.
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { message, history: trimmedHistory },
    })

    if (error || !data?.reply) {
      throw error ?? new Error('Empty response from chat function')
    }

    recordMessageSent()
    if (!isFollowUp) {
      setCachedAnswer(message, data.reply)
    }
    return { status: 'ok', text: data.reply }
  } catch {
    return {
      status: 'error',
      text: "I'm having trouble connecting right now. Please check your connection and try again.",
    }
  }
}
