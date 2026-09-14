import { MAX_INPUT_LENGTH } from './chatApi'
import { getRemainingMessages, recordMessageSent } from './chatLimits'
import { isOnline } from './network'
import { supabase } from './supabaseClient'

export { MAX_INPUT_LENGTH }

// How many prior messages to resend for context — same cap as the general
// chatbot, for the same reason (keep each request small on the free tier).
const MAX_HISTORY_MESSAGES = 8

// Mirrors chatApi.js's askChatbot, but roleplays a scenario instead of
// answering questions directly — deliberately no FAQ caching here, since a
// cached reply would ignore the actual conversation context. Shares the same
// daily message budget as the general chatbot (chatLimits.js) so switching
// between the two can't be used to double the free-tier quota.
export async function sendConversationMessage(rawMessage, history, scenarioId, level) {
  const message = rawMessage.trim()

  if (!message) {
    return { status: 'empty', text: '' }
  }

  if (message.length > MAX_INPUT_LENGTH) {
    return {
      status: 'too-long',
      text: `That message is a bit long — please keep it under ${MAX_INPUT_LENGTH} characters.`,
    }
  }

  if (getRemainingMessages() <= 0) {
    return {
      status: 'rate-limited',
      text: "You've reached today's message limit so we can keep this free for everyone. Please come back tomorrow!",
    }
  }

  if (!isOnline()) {
    return {
      status: 'offline',
      text: "You're offline — conversation practice needs an internet connection. Your other practice still works offline.",
    }
  }

  const trimmedHistory = history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.text.slice(0, MAX_INPUT_LENGTH) }))

  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { message, history: trimmedHistory, scenario: scenarioId, level },
    })

    if (error || !data?.reply) {
      throw error ?? new Error('Empty response from chat function')
    }

    recordMessageSent()
    return { status: 'ok', text: data.reply }
  } catch {
    return {
      status: 'error',
      text: "I'm having trouble connecting right now. Please check your connection and try again.",
    }
  }
}
