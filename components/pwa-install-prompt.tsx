"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, Share, Plus, MoreVertical, Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed as PWA
    const standalone = window.matchMedia("(display-mode: standalone)").matches
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsStandalone(standalone || iosStandalone)

    if (standalone || iosStandalone) {
      return // Already installed, don't show prompt
    }

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
    const isAndroidDevice = /android/.test(userAgent)

    setIsIOS(isIOSDevice)
    setIsAndroid(isAndroidDevice)

    // Only show on mobile devices
    if (!isIOSDevice && !isAndroidDevice) {
      return
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem("pwa-prompt-dismissed")
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        return // Don't show again for 7 days
      }
    }

    // Listen for the beforeinstallprompt event (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // For iOS, show prompt after a short delay
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 2000)
      return () => {
        clearTimeout(timer)
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-prompt-dismissed", new Date().toISOString())
  }

  if (!showPrompt || isStandalone) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 animate-in slide-in-from-bottom duration-300 safe-area-inset-bottom">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Image
              src="/images/logo.png"
              alt="LifeDocs Family"
              width={180}
              height={45}
              className="h-14 w-auto"
              priority
            />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Install the App</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Get the full LifeDocs Family experience with quick access from your home screen
          </p>
          <div className="mt-3 space-y-2">
            {isIOS && (
              <div className="mt-5 w-full space-y-4">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">How to install</p>
                  <ol className="text-sm space-y-3">
                    <li className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                      <span className="flex items-center gap-2 text-foreground">
                        Tap <Share className="h-5 w-5 text-primary" /> <span className="font-medium">Share</span> in Safari
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                      <span className="flex items-center gap-2 text-foreground">
                        Scroll and tap <Plus className="h-5 w-5 text-primary" /> <span className="font-medium">Add to Home Screen</span>
                      </span>
                    </li>
                  </ol>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleDismiss}
                >
                  Got it
                </Button>
              </div>
            )}

            {isAndroid && (
              <div className="mt-5 w-full space-y-4">
                {deferredPrompt ? (
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={handleInstall}
                  >
                    <Download className="h-5 w-5" />
                    Install App
                  </Button>
                ) : (
                  <>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">How to install</p>
                      <ol className="text-sm space-y-3">
                        <li className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                          <span className="flex items-center gap-2 text-foreground">
                            Tap <MoreVertical className="h-5 w-5 text-primary" /> <span className="font-medium">Menu</span>
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                          <span className="flex items-center gap-2 text-foreground">
                            Select <Plus className="h-5 w-5 text-primary" /> <span className="font-medium">Add to Home Screen</span>
                          </span>
                        </li>
                      </ol>
                    </div>
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleDismiss}
                    >
                      Got it
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
