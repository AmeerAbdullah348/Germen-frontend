import { Download, Share2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  dismissInstallPrompt,
  getDeferredInstallPrompt,
  isInstallPromptDismissed,
  isIOS,
  isStandalone,
  onInstallPromptAvailable,
} from '../lib/installPrompt'

export default function InstallBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(getDeferredInstallPrompt)

  useEffect(
    () => onInstallPromptAvailable(() => setInstallPrompt(getDeferredInstallPrompt())),
    []
  )

  const androidInstallable = Boolean(installPrompt)
  const iosInstallable = isIOS()

  if (dismissed || isStandalone() || isInstallPromptDismissed() || (!androidInstallable && !iosInstallable)) {
    return null
  }

  function handleDismiss() {
    dismissInstallPrompt()
    setDismissed(true)
  }

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice
    handleDismiss()
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-900/90 to-blue-950/80 border border-white/10 shadow-xl p-4 backdrop-blur-xl">
      <div className="shrink-0 h-11 w-11 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
        {androidInstallable ? (
          <Download className="text-cyan-300" size={20} />
        ) : (
          <Share2 className="text-cyan-300" size={18} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-white text-sm">Install Deutsch Lernen</p>
        <p className="text-xs text-slate-300 mt-0.5">
          {androidInstallable
            ? 'Add it to your home screen for quick, full-screen access.'
            : 'Tap Share, then "Add to Home Screen" for quick access.'}
        </p>
      </div>
      {androidInstallable && (
        <button
          type="button"
          onClick={handleInstall}
          className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
        >
          Install
        </button>
      )}
      <button type="button" onClick={handleDismiss} aria-label="Dismiss" className="shrink-0 text-slate-400 hover:text-white cursor-pointer">
        <X size={18} />
      </button>
    </div>
  )
}
