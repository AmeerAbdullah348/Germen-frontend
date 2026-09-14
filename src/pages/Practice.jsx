import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  GraduationCap,
  Headphones,
  LibraryBig,
  Mic,
  PenLine,
  RefreshCw,
  Search,
  Star,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'

const ENTRIES = [
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

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Practice</h1>
        <p className="text-gray-500 text-sm">Grammar, review, and everything beyond vocabulary lessons.</p>
      </div>

      <div className="flex flex-col gap-3">
        {ENTRIES.map(({ to, icon: Icon, title, description }) => (
          <Card
            key={to}
            as="button"
            type="button"
            interactive
            onClick={() => navigate(to)}
            className="text-left flex items-center gap-3"
          >
            <div className="shrink-0 h-11 w-11 rounded-full bg-primary-50 flex items-center justify-center">
              <Icon className="text-primary-500" size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{title}</p>
              <p className="text-sm text-gray-500 truncate">{description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
