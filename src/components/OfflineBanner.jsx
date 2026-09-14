import { CloudOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isOnline } from '../lib/network'

// Shown across every Layout-wrapped page (hub/list pages) whenever the
// browser reports offline — practice content works offline (it's all
// bundled into the app shell the service worker precaches), but this makes
// clear that sign-in, sync, and AI chat/conversation specifically need a
// connection, per the "keep network-dependent features clearly dependent on
// connectivity" requirement.
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
    <div className="flex items-center justify-center gap-1.5 text-xs text-white bg-gray-800 px-3 py-1.5 text-center">
      <CloudOff size={13} className="shrink-0" />
      You're offline — practice still works, but sign-in, sync, and AI chat need a connection.
    </div>
  )
}
