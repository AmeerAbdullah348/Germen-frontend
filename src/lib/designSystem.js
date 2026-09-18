// Centralized visual design system definitions matching Practice screen reference (abdu.png)
// Provides vibrant gradient cards, glowing icon containers, badges, and colors across all screens.

export const PRACTICE_THEMES = {
  '/daily-challenge': {
    gradient: 'bg-gradient-to-r from-[#00c6ff] via-[#00a8ff] to-[#0072ff]',
    glow: 'shadow-[0_8px_25px_rgba(0,198,255,0.35)]',
    iconBg: 'bg-white/20 border border-white/30 text-yellow-300',
    iconColor: 'text-yellow-300 fill-yellow-300',
    badge: 'Today',
    badgeStyle: 'bg-white/25 text-white border border-white/30 backdrop-blur-sm',
    accentColor: '#00c6ff',
  },
  '/missions': {
    gradient: 'bg-gradient-to-r from-[#7b2cbf] via-[#8a2be2] to-[#9d4edd]',
    glow: 'shadow-[0_8px_25px_rgba(123,44,191,0.35)]',
    iconBg: 'bg-white/20 border border-white/30 text-rose-300',
    iconColor: 'text-white',
    badge: '3/5',
    badgeStyle: 'bg-white/25 text-white border border-white/30 backdrop-blur-sm',
    accentColor: '#9d4edd',
  },
  '/achievements': {
    gradient: 'bg-gradient-to-r from-[#ffb703] via-[#f7971e] to-[#fb8500]',
    glow: 'shadow-[0_8px_25px_rgba(255,183,3,0.35)]',
    iconBg: 'bg-white/25 border border-white/30 text-amber-900',
    iconColor: 'text-amber-900 fill-amber-900',
    badge: '12/48',
    badgeStyle: 'bg-black/20 text-slate-900 font-bold border border-black/10 backdrop-blur-sm',
    accentColor: '#ffb703',
    textColor: 'text-slate-900',
    subtitleColor: 'text-slate-800/90',
  },
  '/placement': {
    gradient: 'bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0077b6]',
    glow: 'shadow-[0_8px_25px_rgba(2,132,199,0.35)]',
    iconBg: 'bg-white/20 border border-white/30 text-cyan-200',
    iconColor: 'text-white',
    badge: '0/1',
    badgeStyle: 'bg-white/25 text-white border border-white/30 backdrop-blur-sm',
    accentColor: '#0284c7',
  },
  '/grammar': {
    gradient: 'bg-gradient-to-r from-[#0d9488] via-[#0d9488] to-[#14b8a6]',
    glow: 'shadow-[0_8px_25px_rgba(13,148,136,0.35)]',
    iconBg: 'bg-white/20 border border-white/30 text-teal-100',
    iconColor: 'text-white',
    accentColor: '#14b8a6',
  },
  '/vocabulary': {
    gradient: 'bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#60a5fa]',
    glow: 'shadow-[0_8px_25px_rgba(37,99,235,0.35)]',
    iconBg: 'bg-white/20 border border-white/30 text-blue-100',
    iconColor: 'text-white',
    accentColor: '#3b82f6',
  },
  '/reading': {
    gradient: 'bg-gradient-to-r from-[#8b5cf6] via-[#7c3aed] to-[#d946ef]',
    glow: 'shadow-[0_8px_25px_rgba(139,92,246,0.35)]',
    iconBg: 'bg-white/20 border border-white/30 text-purple-100',
    iconColor: 'text-white',
    accentColor: '#8b5cf6',
  },
  '/dictionary': {
    gradient: 'bg-gradient-to-r from-[#334155] via-[#1e293b] to-[#0f172a]',
    glow: 'shadow-[0_8px_25px_rgba(30,41,59,0.5)]',
    iconBg: 'bg-cyan-500/20 border border-cyan-400/30 text-cyan-300',
    iconColor: 'text-cyan-300',
    accentColor: '#38bdf8',
  },
  '/listening': {
    gradient: 'bg-gradient-to-r from-[#ec4899] via-[#d946ef] to-[#8b5cf6]',
    glow: 'shadow-[0_8px_25px_rgba(236,72,153,0.35)]',
    iconBg: 'bg-white/20 border border-white/30 text-pink-100',
    iconColor: 'text-white',
    accentColor: '#ec4899',
  },
  '/speaking': {
    gradient: 'bg-gradient-to-r from-[#10b981] via-[#059669] to-[#06b6d4]',
    glow: 'shadow-[0_8px_25px_rgba(16,185,129,0.35)]',
    iconBg: 'bg-white/20 border border-white/30 text-emerald-100',
    iconColor: 'text-white',
    accentColor: '#10b981',
  },
  '/writing': {
    gradient: 'bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#f43f5e]',
    glow: 'shadow-[0_8px_25px_rgba(249,115,22,0.35)]',
    iconBg: 'bg-white/20 border border-white/30 text-orange-100',
    iconColor: 'text-white',
    accentColor: '#f97316',
  },
  '/conversation': {
    gradient: 'bg-gradient-to-r from-[#6366f1] via-[#4f46e5] to-[#a855f7]',
    glow: 'shadow-[0_8px_25px_rgba(99,102,241,0.35)]',
    iconBg: 'bg-white/20 border border-white/30 text-indigo-100',
    iconColor: 'text-white',
    accentColor: '#6366f1',
  },
  '/favorites': {
    gradient: 'bg-gradient-to-r from-[#eab308] via-[#f59e0b] to-[#d97706]',
    glow: 'shadow-[0_8px_25px_rgba(234,179,8,0.35)]',
    iconBg: 'bg-black/20 border border-black/10 text-slate-900',
    iconColor: 'text-slate-900 fill-slate-900',
    accentColor: '#eab308',
    textColor: 'text-slate-900',
    subtitleColor: 'text-slate-800/90',
  },
  '/review': {
    gradient: 'bg-gradient-to-r from-[#0ea5e9] via-[#0284c7] to-[#3b82f6]',
    glow: 'shadow-[0_8px_25px_rgba(14,165,233,0.35)]',
    iconBg: 'bg-white/20 border border-white/30 text-sky-100',
    iconColor: 'text-white',
    accentColor: '#0ea5e9',
  },
  '/mistakes': {
    gradient: 'bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#be123c]',
    glow: 'shadow-[0_8px_25px_rgba(244,63,94,0.35)]',
    iconBg: 'bg-white/20 border border-white/30 text-rose-100',
    iconColor: 'text-white',
    accentColor: '#f43f5e',
  },
}

export function getThemeForPath(path) {
  const prefix = '/' + path.split('/')[1]
  return PRACTICE_THEMES[path] || PRACTICE_THEMES[prefix] || {
    gradient: 'bg-gradient-to-r from-[#1e293b] via-[#0f172a] to-[#1e293b]',
    glow: 'shadow-[0_8px_25px_rgba(0,0,0,0.4)]',
    iconBg: 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300',
    iconColor: 'text-cyan-300',
    accentColor: '#38bdf8',
  }
}
