import { Dumbbell, Home, MessageCircle, User } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/chatbot', label: 'Chat', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Layout() {
  return (
    <div className="h-svh flex flex-col mx-auto max-w-md bg-primary-50">
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="shrink-0 bg-white border-t border-gray-200 flex">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium',
                isActive ? 'text-primary-600' : 'text-gray-400',
              ].join(' ')
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
