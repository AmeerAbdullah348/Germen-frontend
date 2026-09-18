// Compact stat box — styled with dark glass backdrop and cyan text accents
export default function StatBox({ value, label }) {
  return (
    <div className="flex-1 rounded-2xl bg-slate-900/80 border border-white/10 p-3.5 flex flex-col items-center justify-center gap-0.5 text-center min-w-0 shadow-lg backdrop-blur-md hover:border-cyan-500/30 transition-all">
      <p className="text-xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)] truncate w-full">{value}</p>
      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</p>
    </div>
  )
}
