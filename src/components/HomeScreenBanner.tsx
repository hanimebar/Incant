"use client";

import { useState, useEffect } from "react";
import { X, Share, MoreVertical, Download } from "lucide-react";

export default function HomeScreenBanner() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android">("android");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("incant-a2hs-dismissed")) return;

    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) {
      setPlatform("ios");
      setVisible(true);
    } else if (/android/i.test(ua)) {
      setPlatform("android");
      setVisible(true);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") dismiss();
      setDeferredPrompt(null);
    } else {
      setShowGuide(true);
    }
  };

  const dismiss = () => {
    localStorage.setItem("incant-a2hs-dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3">
        <div className="max-w-lg mx-auto bg-[#0f0a2e] border border-indigo-700/40 rounded-2xl shadow-2xl p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">📱</span>
              <p className="text-white font-semibold text-sm">Add Incant to your home screen</p>
            </div>
            <button onClick={dismiss} className="text-indigo-400 hover:text-white shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-indigo-300 text-xs mb-3 leading-relaxed">
            Opens full screen like a native app. Your data stays on your device.
          </p>
          <div className="flex gap-2">
            {platform === "android" ? (
              <button
                onClick={handleAndroidInstall}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#f5c518] text-[#0f0a2e] text-sm font-bold hover:brightness-110 transition-all"
              >
                <Download className="w-4 h-4" />
                Install on Android
              </button>
            ) : (
              <button
                onClick={() => setShowGuide(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#f5c518] text-[#0f0a2e] text-sm font-bold hover:brightness-110 transition-all"
              >
                <Download className="w-4 h-4" />
                Install on iPhone
              </button>
            )}
            <button
              onClick={dismiss}
              className="px-4 py-2.5 rounded-xl bg-white/10 text-indigo-300 text-sm hover:bg-white/15 transition-all"
            >
              Not now
            </button>
          </div>
        </div>
      </div>

      {/* Guide modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0f0a2e] border border-indigo-700/40 rounded-2xl p-5">
            <h3 className="text-white font-bold text-base mb-4">
              {platform === "ios" ? "Install on iPhone / iPad" : "Install on Android"}
            </h3>

            {platform === "android" && (
              <ol className="space-y-3 mb-5">
                <Step n={1}>
                  Tap the <MoreVertical className="w-4 h-4 inline mx-0.5 -mt-0.5" />
                  <strong className="text-white"> three-dot menu</strong> in Chrome (top right)
                </Step>
                <Step n={2}>
                  Tap <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong> or{" "}
                  <strong className="text-white">&ldquo;Install app&rdquo;</strong>
                </Step>
                <Step n={3}>
                  Tap <strong className="text-white">Add</strong> to confirm
                </Step>
              </ol>
            )}

            {platform === "ios" && (
              <ol className="space-y-3 mb-5">
                <Step n={1}>
                  Open this page in <strong className="text-white">Safari</strong>{" "}
                  <span className="text-indigo-400">(not Chrome — iOS only supports install from Safari)</span>
                </Step>
                <Step n={2}>
                  Tap the <Share className="w-4 h-4 inline mx-0.5 -mt-0.5" />
                  <strong className="text-white"> Share</strong> button at the bottom of the screen
                </Step>
                <Step n={3}>
                  Scroll down and tap <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong>
                </Step>
                <Step n={4}>
                  Tap <strong className="text-white">Add</strong> to confirm
                </Step>
              </ol>
            )}

            <button
              onClick={() => { setShowGuide(false); dismiss(); }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-indigo-200 text-sm">
      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
