"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import TopNav from "@/components/TopNav";

const examples = [
  "A water tracker to drink 8 glasses a day",
  "Expense log for my trip to Portugal",
  "Habit tracker for morning meditation and gym",
  "Countdown to my wedding on June 15th 2026",
  "Quiz about European capitals",
];

function CastPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("prompt") ?? "");
  const [isListening, setIsListening] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getSpeechRecognition = (): any =>
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognition());
  }, []);

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = getSpeechRecognition();
    if (!SR) return;

    setError(null);

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onend = () => {
      setIsListening(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setIsListening(false);
      const code = event.error as string;
      if (code === "not-allowed" || code === "permission-denied") {
        setError("Microphone access denied. Allow mic access in your browser and try again.");
      } else if (code === "no-speech") {
        setError("No speech detected. Make sure your mic is active and speak clearly.");
      } else if (code === "audio-capture") {
        setError("No microphone found. Plug one in and try again.");
      } else if (code === "network") {
        setError("Speech recognition needs an internet connection. Check your connection and try again.");
      } else if (code !== "aborted") {
        setError(`Voice error: ${code}. Try typing instead.`);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      // Always rebuild from ALL results in event.results (cumulative SpeechRecognitionResultList).
      // Do NOT start from event.resultIndex — Android Chrome resets resultIndex to 0 even
      // after earlier results are finalized, which causes re-adding them to any external
      // accumulator and produces "isis thisis this thing" duplication.
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interimText += event.results[i][0].transcript;
        }
      }
      setInput(finalText + interimText);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setError("Could not start voice recognition. Try again or type your idea.");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  };

  const handleCast = async () => {
    if (!input.trim() || isCasting) return;
    setIsCasting(true);
    setError(null);

    try {
      const res = await fetch("/api/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      let data: { error?: string; tier?: string; url?: string };
      try {
        data = await res.json();
      } catch {
        setError("Server error. Please try again.");
        return;
      }

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login?redirect=/cast");
          return;
        }
        if (res.status === 403) {
          setError("You've reached the free plan limit. Upgrade to Caster for unlimited apps.");
          return;
        }
        setError(data.error || "Something went wrong. Try again.");
        return;
      }

      router.push(data.url!);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setIsCasting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCast();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3 animate-float">🪄</div>
          <h1 className="text-4xl font-bold text-white mb-2">Cast your spell</h1>
          <p className="text-indigo-300 text-lg">Describe the app you want. Speak or type it.</p>
        </div>

        {/* Input area */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. A habit tracker to help me drink water and meditate daily..."
            rows={4}
            disabled={isCasting}
            className="w-full bg-transparent text-white placeholder-indigo-400/60 text-lg resize-none outline-none"
          />

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            {/* Voice button */}
            <div className="flex items-center gap-2">
              {voiceSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isCasting}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    isListening
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : "bg-white/10 text-indigo-300 border border-white/10 hover:bg-white/15"
                  )}
                >
                  {isListening ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      Listening… tap to stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" /> Speak
                    </>
                  )}
                </button>
              )}
              <span className="text-indigo-400/40 text-xs">{input.length} chars</span>
            </div>

            {/* Cast button */}
            <button
              onClick={handleCast}
              disabled={!input.trim() || isCasting}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
                input.trim() && !isCasting
                  ? "bg-[#f5c518] text-[#0f0a2e] hover:bg-[#fde68a] shadow-lg shadow-yellow-500/20"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              )}
            >
              {isCasting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Casting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Cast
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Example prompts */}
        <div className="mt-8">
          <p className="text-indigo-400/60 text-xs text-center mb-3 uppercase tracking-wider">
            Try one of these
          </p>
          <div className="flex flex-col gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                disabled={isCasting}
                className="flex items-center gap-2 text-left px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-indigo-300 text-sm hover:bg-white/10 hover:text-white transition-all group"
              >
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:text-[#f5c518] shrink-0 transition-colors" />
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CastPage() {
  return (
    <main className="min-h-screen bg-[#0f0a2e] flex flex-col">
      <TopNav variant="dark" />
      <Suspense fallback={<div className="flex-1" />}>
        <CastPageInner />
      </Suspense>
    </main>
  );
}
