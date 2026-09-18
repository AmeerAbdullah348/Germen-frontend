import { CloudOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isOnline } from '../lib/network'

export default function OfflineBanner() {
  const [online, setOnline] = useState(isOnline)

  useEffect(() => {
    function goOnline() {
      setOnline(true)
    }
    function goOffline() {
      setOnline(false)
    }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online) return null

  return (
    <div className="flex items-center justify-center gap-1.5 text-xs text-amber-200 bg-amber-950/90 border-b border-amber-500/30 px-3 py-2 text-center font-medium backdrop-blur-md">
      <CloudOff size={14} className="shrink-0 text-amber-400" />
      You're offline — practice still works, but sign-in, sync, and AI chat need a connection.
    </div>
  )
}
