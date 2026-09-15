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

// Shown on the Dashboard only, once the app is loaded — not a native browser
// prompt (browsers deliberately don't let a site re-trigger that repeatedly),
// but our own dismissible banner. Android/Chrome gets a real Install button
// (via the captured beforeinstallprompt event); iOS gets instructions, since
// Safari has no programmatic install API at all. Dismissing hides it for a
// week rather than forever, so it isn't a one-shot miss for someone who just
// wasn't ready yet.
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
    // The captured event can only be used once either way (accepted or
    // dismissed) — treat it as handled so we don't show a now-dead button.
    handleDismiss()
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
      <div className="shrink-0 h-11 w-11 rounded-full bg-primary-50 flex items-center justify-center">
        {androidInstallable ? (
          <Download className="text-primary-500" size={22} />
        ) : (
          <Share2 className="text-primary-500" size={20} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900">Install Deutsch Lernen</p>
        <p className="text-sm text-gray-500">
          {androidInstallable
            ? 'Add it to your home screen for quick, full-screen access.'
            : 'Tap Share, then "Add to Home Screen" for quick access.'}
        </p>
      </div>
      {androidInstallable && (
        <button
          type="button"
          onClick={handleInstall}
          className="shrink-0 rounded-lg bg-primary-600 text-white px-3 py-1.5 text-sm font-medium"
        >
          Install
        </button>
      )}
      <button type="button" onClick={handleDismiss} aria-label="Dismiss" className="shrink-0 text-gray-300">
        <X size={18} />
      </button>
    </div>
  )
}
