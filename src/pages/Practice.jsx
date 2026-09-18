import {
  AlertTriangle,
  Award,
  BookMarked,
  BookOpen,
  CheckSquare,
  ChevronRight,
  Flame,
  GraduationCap,
  Headphones,
  LibraryBig,
  MessageCircleHeart,
  Mic,
  PenLine,
  RefreshCw,
  Search,
  Star,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PRACTICE_THEMES } from '../lib/designSystem'
import { getState } from '../lib/progress'

const ENTRIES = [
  {
    to: '/daily-challenge',
    icon: Zap,
    title: 'Daily Challenge',
    description: 'A short mixed session with bonus XP.',
  },
  {
    to: '/missions',
    icon: CheckSquare,
    title: 'Missions',
    description: 'Daily and weekly goals for bonus XP.',
  },
  {
    to: '/achievements',
    icon: Award,
    title: 'Achievements',
    description: 'Badges earned from genuine learning progress.',
  },
  {
    to: '/placement',
    icon: GraduationCap,
    title: 'Placement Test',
    description: 'Find your CEFR level and unlock the right content.',
  },
  {
    to: '/grammar',
    icon: BookOpen,
    title: 'Grammar',
    description: 'Learn German grammar topics, from articles to word order.',
  },
  {
    to: '/vocabulary',
    icon: LibraryBig,
    title: 'Vocabulary',
    description: 'Browse and practice words by category.',
  },
  {
    to: '/reading',
    icon: BookMarked,
    title: 'Reading',
    description: 'Short German stories and dialogues with comprehension questions.',
  },
  {
    to: '/dictionary',
    icon: Search,
    title: 'Dictionary',
    description: 'Search every word across the app.',
  },
  {
    to: '/listening',
    icon: Headphones,
    title: 'Listening',
    description: 'Listen to German words, sentences, and short exchanges.',
  },
  {
    to: '/speaking',
    icon: Mic,
    title: 'Speaking',
    description: 'Repeat-after-me and sentence-level pronunciation practice.',
  },
  {
    to: '/writing',
    icon: PenLine,
    title: 'Writing',
    description: 'Translate, complete, fix, and rearrange German sentences.',
  },
  {
    to: '/conversation',
    icon: MessageCircleHeart,
    title: 'Conversation Practice',
    description: 'Roleplay real scenarios — restaurant, airport, job interview, and more.',
  },
  {
    to: '/favorites',
    icon: Star,
    title: 'Favorites',
    description: 'Words you’ve saved for later review.',
  },
  {
    to: '/review',
    icon: RefreshCw,
    title: 'Review Center',
    description: 'Due, overdue, weak, recent, and mastered vocabulary — plus Quick Review.',
  },
  {
    to: '/mistakes',
    icon: AlertTriangle,
    title: 'Mistakes',
    description: 'Revisit what you got wrong and practice it again.',
  },
]

export default function Practice() {
  const navigate = useNavigate()
  const state = getState()
  const userXp = state?.xp ?? 0

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8">
      {/* Header section mirroring abdu.png */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-white font-serif drop-shadow-md">Practice</h1>
          <p className="text-slate-300 text-sm leading-snug">
            Grammar, review, and everything beyond vocabulary lessons.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/40 text-amber-300 font-bold px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-md text-xs tracking-wide">
          <Flame size={15} className="text-amber-400 fill-amber-400 animate-pulse" />
          <span>{userXp.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Vibrant Module Cards */}
      <div className="flex flex-col gap-3.5">
        {ENTRIES.map(({ to, icon: Icon, title, description }) => {
          const theme = PRACTICE_THEMES[to] || {
            gradient: 'bg-gradient-to-r from-blue-600 to-indigo-700',
            glow: 'shadow-lg',
            iconBg: 'bg-white/20 border border-white/30 text-white',
            iconColor: 'text-white',
          }

          return (
            <button
              key={to}
              type="button"
              onClick={() => navigate(to)}
              className={[
                'text-left w-full rounded-3xl p-4.5 flex items-center gap-4 transition-all duration-200 active:scale-[0.98] border border-white/20',
                theme.gradient,
                theme.glow,
              ].join(' ')}
            >
              {/* Glowing circular icon container */}
              <div
                className={`shrink-0 h-13 w-13 rounded-full flex items-center justify-center shadow-inner ${theme.iconBg}`}
              >
                <Icon size={24} className={theme.iconColor} />
              </div>

              {/* Title & description */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-base tracking-tight ${theme.textColor || 'text-white'}`}>
                    {title}
                  </p>
                  {theme.badge && (
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        theme.badgeStyle || 'bg-white/20 text-white border border-white/30'
                      }`}
                    >
                      {theme.badge}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 truncate ${theme.subtitleColor || 'text-white/80'}`}>
                  {description}
                </p>
              </div>

              {/* Chevron arrow indicator */}
              <ChevronRight
                size={20}
                className={`shrink-0 transition-transform ${theme.textColor || 'text-white/80'}`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
