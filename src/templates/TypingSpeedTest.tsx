"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const PASSAGES = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.",
  "Programming is the art of telling another human what one wants the computer to do. Code is like humour. When you have to explain it it is not that good.",
  "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks and starting on the first one.",
  "In the middle of every difficulty lies opportunity. Life is what happens when you are busy making other plans. The future belongs to those who believe in the beauty of their dreams.",
  "Success is not final failure is not fatal it is the courage to continue that counts. It always seems impossible until it is done. Keep your face always toward the sunshine and shadows will fall behind you.",
];

type TestState = "idle" | "running" | "done";

export default function TypingSpeedTest({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const [passageIdx, setPassageIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [state, setState] = useState<TestState>("idle");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const passage = PASSAGES[passageIdx];

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const calcStats = useCallback(
    (typedText: string, elapsedMs: number) => {
      const minutes = elapsedMs / 60000;
      // Count correct words: split passage into words, check each
      const passageWords = passage.split(" ");
      const typedWords = typedText.split(" ");
      let correctWords = 0;
      for (let i = 0; i < typedWords.length; i++) {
        if (typedWords[i] === passageWords[i]) correctWords++;
      }
      const calcWpm = minutes > 0 ? Math.round(correctWords / minutes) : 0;

      // Accuracy: per-character
      let correct = 0;
      for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] === passage[i]) correct++;
      }
      const calcAccuracy =
        typedText.length > 0 ? Math.round((correct / typedText.length) * 100) : 100;

      setWpm(calcWpm);
      setAccuracy(calcAccuracy);
      return elapsedMs;
    },
    [passage]
  );

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > passage.length) return;

    if (state === "idle" && val.length > 0) {
      const now = Date.now();
      setStartTime(now);
      setState("running");
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - now);
      }, 200);
    }

    setTyped(val);

    if (val.length === passage.length) {
      stopTimer();
      const end = Date.now();
      const ms = startTime ? end - startTime : 0;
      setElapsed(ms);
      calcStats(val, ms);
      setState("done");
    } else if (state === "running" && startTime) {
      calcStats(val, Date.now() - startTime);
    }
  };

  const reset = (newPassageIdx?: number) => {
    stopTimer();
    setTyped("");
    setState("idle");
    setStartTime(null);
    setElapsed(0);
    setWpm(0);
    setAccuracy(100);
    if (newPassageIdx !== undefined) setPassageIdx(newPassageIdx);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const nextPassage = () => {
    reset((passageIdx + 1) % PASSAGES.length);
  };

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const dec = Math.floor((ms % 1000) / 100);
    return `${s}.${dec}s`;
  };


  return (
    <TemplateShell config={config} icon="⌨️">
      <div className="p-4 space-y-4">
        {/* Passage display */}
        <div
          className="font-mono text-sm leading-7 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm select-none"
          aria-label="Passage to type"
        >
          {passage.split("").map((char, idx) => {
            let textColor = "#9ca3af"; // untyped: gray
            if (idx < typed.length) {
              textColor = typed[idx] === char ? "#16a34a" : "#dc2626"; // green / red
            }
            // Current cursor position
            const isCursor = idx === typed.length;
            return (
              <span
                key={idx}
                style={{ color: textColor }}
                className={isCursor ? "border-l-2 border-gray-900 animate-pulse" : ""}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Stats row — live */}
        {state !== "idle" && (
          <div className="flex gap-3 justify-center">
            {[
              { label: "WPM", value: wpm },
              { label: "Accuracy", value: `${accuracy}%` },
              { label: "Time", value: formatTime(elapsed) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex-1 text-center py-2.5 rounded-xl"
                style={{ backgroundColor: `${color}12` }}
              >
                <div className="text-xl font-bold" style={{ color }}>
                  {value}
                </div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Done overlay */}
        {state === "done" && (
          <div
            className="rounded-2xl p-4 text-center space-y-1"
            style={{ backgroundColor: `${color}15` }}
          >
            <p className="text-2xl font-bold" style={{ color }}>
              {wpm} WPM
            </p>
            <p className="text-sm text-gray-600">
              {accuracy}% accuracy · {formatTime(elapsed)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {wpm >= 80
                ? "Excellent! You type like a pro."
                : wpm >= 50
                ? "Great pace! Keep it up."
                : wpm >= 30
                ? "Decent speed. Practice makes perfect."
                : "Keep practicing — you'll improve!"}
            </p>
          </div>
        )}

        {/* Textarea */}
        {state !== "done" ? (
          <textarea
            ref={textareaRef}
            value={typed}
            onChange={handleInput}
            placeholder={state === "idle" ? "Start typing to begin the test..." : undefined}
            rows={4}
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono resize-none outline-none focus:ring-2 transition-colors"
            style={{
              "--tw-ring-color": color,
              borderColor: state === "running" ? color : undefined,
            } as React.CSSProperties}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        ) : null}

        {/* Buttons */}
        <div className="flex gap-2">
          {state === "done" ? (
            <>
              <button
                onClick={() => reset(passageIdx)}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ backgroundColor: color }}
              >
                Try Again
              </button>
              <button
                onClick={nextPassage}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2"
                style={{ borderColor: color, color }}
              >
                New Passage
              </button>
            </>
          ) : (
            <>
              {state !== "idle" && (
                <button
                  onClick={() => reset(passageIdx)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 border-gray-200 text-gray-600"
                >
                  Reset
                </button>
              )}
              <button
                onClick={nextPassage}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2"
                style={{ borderColor: color, color }}
              >
                New Passage ({passageIdx + 1}/{PASSAGES.length})
              </button>
            </>
          )}
        </div>
      </div>
    </TemplateShell>
  );
}
