"use client";

import { useState, useEffect } from "react";
import { X, Share, MoreVertical } from "lucide-react";

export default function HomeScreenBanner() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    // Don't show if already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Don't show if dismissed before
    if (localStorage.getItem("incant-a2hs-dismissed")) return;

    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) {
      setPlatform("ios");
      setVisible(true);
    } else if (/android/i.test(ua)) {
      setPlatform("android");
      setVisible(true);
    }
    // Desktop: don't show — not relevant
  }, []);

  const dismiss = () => {
    localStorage.setItem("incant-a2hs-dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-safe">
      <div className="max-w-lg mx-auto bg-[#0f0a2e] border border-indigo-700/40 rounded-2xl shadow-2xl p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <p className="text-white font-semibold text-sm">Add this app to your home screen</p>
          </div>
          <button onClick={dismiss} className="text-indigo-400 hover:text-white shrink-0 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Honest explanation */}
        <p className="text-indigo-300 text-xs mb-3 leading-relaxed">
          This isn&apos;t on the App Store — it&apos;s a web app that lives on your home screen.
          Once added, it opens full screen with no browser bar, just like a native app.
          Your data stays on your device.
        </p>

        {/* Platform instructions */}
        {platform === "ios" && (
          <div className="bg-white/5 rounded-xl px-3 py-2.5 flex items-center gap-3">
            <Share className="w-4 h-4 text-[#f5c518] shrink-0" />
            <p className="text-indigo-200 text-xs">
              Tap the <strong className="text-white">Share</strong> button at the bottom of Safari,
              then tap <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong>.
            </p>
          </div>
        )}
        {platform === "android" && (
          <div className="bg-white/5 rounded-xl px-3 py-2.5 flex items-center gap-3">
            <MoreVertical className="w-4 h-4 text-[#f5c518] shrink-0" />
            <p className="text-indigo-200 text-xs">
              Tap the <strong className="text-white">⋮ menu</strong> in Chrome,
              then tap <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong>.
            </p>
          </div>
        )}

        <button
          onClick={dismiss}
          className="mt-3 w-full py-2 rounded-xl bg-indigo-600/30 text-indigo-200 text-xs font-medium hover:bg-indigo-600/50 transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
