import { Dumbbell, Home, MessageCircle, User } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import OfflineBanner from './OfflineBanner'

const TABS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/chatbot', label: 'Chat', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Layout() {
  return (
    <div className="h-svh flex flex-col mx-auto max-w-md bg-[#070b19] text-slate-100 relative overflow-hidden shadow-2xl border-x border-white/5">
      {/* Background ambient radial glow matching reference screenshot */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-64 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-blue-600/10 to-transparent pointer-events-none z-0" />
      
      <OfflineBanner />
      
      <main className="flex-1 min-h-0 overflow-y-auto relative z-10">
        <Outlet />
      </main>

      <nav className="shrink-0 bg-[#091026]/95 backdrop-blur-2xl border-t border-white/10 flex px-3 py-2 z-20 shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 gap-1',
                isActive
                  ? 'bg-gradient-to-b from-cyan-500/20 to-blue-600/30 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : ''} />
                <span className={isActive ? 'font-bold tracking-wide' : ''}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
