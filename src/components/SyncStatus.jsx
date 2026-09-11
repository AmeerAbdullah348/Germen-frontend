import { CloudOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPendingSync } from '../lib/progress'

// Surfaces when there are local changes not yet confirmed saved to Supabase —
// without this, a failed background write is invisible and the user would
// wrongly assume their progress is safe (see plan edge case: "Database write
// fails silently — user thinks progress saved but it wasn't").
export default function SyncStatus() {
  const [pending, setPending] = useState(() => getPendingSync())

  useEffect(() => {
    const id = setInterval(() => setPending(getPendingSync()), 2000)
    return () => clearInterval(id)
  }, [])

  const hasPending = pending.profileDirty || pending.wordIds.length > 0
  if (!hasPending) return null

  return (
    <div className="flex items-center gap-1.5 text-xs text-accent-600 bg-accent-100 rounded-full px-3 py-1 w-fit">
      <CloudOff size={13} />
      Saved on this device — syncing when back online
    </div>
  )
}
