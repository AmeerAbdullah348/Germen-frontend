// Scenario ids must exactly match the SCENARIO_ROLES keys in
// backend/supabase/functions/chat/index.ts — the backend looks the id up
// through its own map rather than trusting the label/description sent here.
export const SCENARIOS = [
  {
    id: 'restaurant',
    label: 'Restaurant',
    description: 'Order food and chat with your waiter.',
    opener: 'Guten Tag! Herzlich willkommen. Haben Sie schon eine Bestellung, oder brauchen Sie noch einen Moment?',
  },
  {
    id: 'airport',
    label: 'Airport',
    description: 'Check in, go through security, find your gate.',
    opener: 'Guten Tag! Ihren Reisepass und Ihr Ticket, bitte.',
  },
  {
    id: 'hotel',
    label: 'Hotel',
    description: 'Check in and ask about your room.',
    opener: 'Willkommen in unserem Hotel! Haben Sie eine Reservierung bei uns?',
  },
  {
    id: 'shopping',
    label: 'Shopping',
    description: 'Find and buy items in a store.',
    opener: 'Hallo! Kann ich Ihnen helfen, etwas zu finden?',
  },
  {
    id: 'job-interview',
    label: 'Job Interview',
    description: 'Practice a friendly first-round interview.',
    opener: 'Guten Tag, schön Sie kennenzulernen. Erzählen Sie mir bitte etwas über sich.',
  },
  {
    id: 'introductions',
    label: 'Introducing Yourself',
    description: 'Meet someone new and make small talk.',
    opener: 'Hallo! Ich glaube, wir kennen uns noch nicht. Wie heißt du?',
  },
  {
    id: 'directions',
    label: 'Asking for Directions',
    description: 'Ask a local for help finding your way.',
    opener: 'Entschuldigung, kann ich Ihnen helfen? Sie sehen ein bisschen verloren aus.',
  },
  {
    id: 'everyday',
    label: 'Everyday Conversation',
    description: 'Casual chat about daily life.',
    opener: 'Hallo! Wie geht es dir heute?',
  },
]

export const SCENARIOS_BY_ID = Object.fromEntries(SCENARIOS.map((scenario) => [scenario.id, scenario]))
