import { CloudOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPendingSync } from '../lib/progress'

export default function SyncStatus() {
  const [pending, setPending] = useState(() => getPendingSync())

  useEffect(() => {
    const id = setInterval(() => setPending(getPendingSync()), 2000)
    return () => clearInterval(id)
  }, [])

  const hasPending = pending.profileDirty || pending.wordIds.length > 0 || pending.items.length > 0
  if (!hasPending) return null

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 w-fit shadow-[0_0_10px_rgba(245,158,11,0.2)]">
      <CloudOff size={13} />
      Saved on this device — syncing when back online
    </div>
  )
}
