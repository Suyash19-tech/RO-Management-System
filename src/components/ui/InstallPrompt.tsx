"use client";

import { useState, useEffect } from "react";
import { X, Share, PlusSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service Worker registration failed: ', err);
      });
    }

    // Check if device is iOS
    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Check if app is already installed (standalone mode)
    const isStandaloneMode = window.matchMedia(
      "(display-mode: standalone)"
    ).matches || (navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay so it's not instantly annoying
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show the prompt if not standalone after a delay
    if (isIosDevice && !isStandaloneMode) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const closePrompt = () => {
    setShowPrompt(false);
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 border border-slate-100 max-w-sm mx-auto"
        >
          <button
            onClick={closePrompt}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-4 pr-6">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center p-2">
              <img
                src="/icons/icon-192.png"
                alt="Sardarji RO Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 leading-tight mb-1">
                Install Sardarji RO App
              </h3>
              
              {isIOS ? (
                <div className="text-sm text-slate-600 space-y-2">
                  <p>Install this application on your home screen for quick and easy access.</p>
                  <p className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg text-xs font-medium">
                    Tap <Share size={14} className="text-blue-600" /> then <br/> &quot;Add to Home Screen&quot; <PlusSquare size={14} className="text-slate-700" />
                  </p>
                </div>
              ) : (
                <div className="text-sm text-slate-600">
                  <p className="mb-3">Install this application on your home screen for quick and easy access.</p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full bg-[#0F4C81] text-white font-medium py-2 px-4 rounded-xl shadow-sm hover:bg-blue-800 transition-colors active:scale-[0.98]"
                  >
                    Install Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
