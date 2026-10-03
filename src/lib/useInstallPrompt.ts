import { useCallback, useEffect, useState } from 'react'

export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type UseInstallPromptResult = {
  canInstall: boolean
  installed: boolean
  isIOS: boolean
  hasPromptEvent: boolean
  promptInstall: () => Promise<InstallOutcome>
}

function checkStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const matchMediaMatches = window.matchMedia?.('(display-mode: standalone)').matches
  const navigatorStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true
  return Boolean(matchMediaMatches || navigatorStandalone)
}

function checkIOS(standalone: boolean): boolean {
  if (typeof navigator === 'undefined') return false
  const isApple =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  return Boolean(isApple && !standalone)
}

export function useInstallPrompt(): UseInstallPromptResult {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState<boolean>(checkStandalone)
  const [isIOS] = useState<boolean>(() => checkIOS(checkStandalone()))

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const onAppInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    if (!deferredPrompt) return 'unavailable'
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return outcome
    } catch {
      return 'unavailable'
    }
  }, [deferredPrompt])

  return {
    canInstall: !installed && (deferredPrompt !== null || isIOS),
    installed,
    isIOS,
    hasPromptEvent: deferredPrompt !== null,
    promptInstall,
  }
}
