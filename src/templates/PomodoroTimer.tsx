"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Phase = "work" | "short-break" | "long-break";

const PHASE_LABELS: Record<Phase, string> = {
  work: "Focus",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

const PHASE_EMOJI: Record<Phase, string> = {
  work: "🧠",
  "short-break": "☕",
  "long-break": "🛋️",
};

export default function PomodoroTimer({ config, spellId }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const sessionKey = `incant-${spellId}-pomodoro-sessions`;

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [sessionsPerLong, setSessionsPerLong] = useState(4);

  // Timer state
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(workDuration * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>("work");
  const secondsRef = useRef(workDuration * 60);
  const sessionsRef = useRef(0);

  // Sync refs
  phaseRef.current = phase;
  secondsRef.current = secondsLeft;
  sessionsRef.current = sessions;

  // Load persisted session count
  useEffect(() => {
    const stored = localStorage.getItem(sessionKey);
    if (stored) {
      const n = parseInt(stored, 10);
      if (!isNaN(n)) {
        setSessions(n);
        sessionsRef.current = n;
      }
    }
  }, [sessionKey]);

  const getTotalSeconds = useCallback(
    (p: Phase) => {
      if (p === "work") return workDuration * 60;
      if (p === "short-break") return shortBreak * 60;
      return longBreak * 60;
    },
    [workDuration, shortBreak, longBreak]
  );

  const advancePhase = useCallback(() => {
    const currentPhase = phaseRef.current;
    let nextPhase: Phase;
    let newSessions = sessionsRef.current;

    if (currentPhase === "work") {
      newSessions = sessionsRef.current + 1;
      setSessions(newSessions);
      sessionsRef.current = newSessions;
      localStorage.setItem(sessionKey, String(newSessions));
      nextPhase = newSessions % sessionsPerLong === 0 ? "long-break" : "short-break";
    } else {
      nextPhase = "work";
    }

    setPhase(nextPhase);
    phaseRef.current = nextPhase;
    const secs = getTotalSeconds(nextPhase);
    setSecondsLeft(secs);
    secondsRef.current = secs;
    setRunning(true);

    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Incant Pomodoro`, {
        body: `${PHASE_LABELS[currentPhase]} complete! Starting ${PHASE_LABELS[nextPhase]}.`,
      });
    }
  }, [getTotalSeconds, sessionKey, sessionsPerLong]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            advancePhase();
            return getTotalSeconds(phaseRef.current);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, advancePhase, getTotalSeconds]);

  const reset = () => {
    setRunning(false);
    const secs = getTotalSeconds(phase);
    setSecondsLeft(secs);
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  // SVG ring
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const total = getTotalSeconds(phase);
  const progress = secondsLeft / total;
  const dashOffset = circumference * (1 - progress);

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const handleSettingsSave = () => {
    setShowSettings(false);
    setRunning(false);
    const secs = getTotalSeconds(phase);
    setSecondsLeft(secs);
  };

  return (
    <TemplateShell config={config} icon="🍅">
      <div className="p-4">
        {/* Phase tabs */}
        <div className="flex gap-2 justify-center mb-6">
          {(["work", "short-break", "long-break"] as Phase[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setRunning(false);
                setPhase(p);
                setSecondsLeft(getTotalSeconds(p));
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: phase === p ? color : "transparent",
                color: phase === p ? "#fff" : "#6b7280",
                border: `1.5px solid ${phase === p ? color : "#e5e7eb"}`,
              }}
            >
              {PHASE_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Ring */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <svg width="220" height="220" className="rotate-[-90deg]">
              {/* Track */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              {/* Progress */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl mb-1">{PHASE_EMOJI[phase]}</span>
              <span className="text-4xl font-bold tabular-nums text-gray-900">{timeStr}</span>
              <span className="text-xs text-gray-400 mt-1">{PHASE_LABELS[phase]}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={reset}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors text-sm"
            >
              ↺
            </button>
            <button
              onClick={() => {
                requestNotificationPermission();
                setRunning((r) => !r);
              }}
              className="w-16 h-16 rounded-full text-white text-base font-semibold flex items-center justify-center shadow-lg transition-transform active:scale-95"
              style={{ backgroundColor: color }}
            >
              {running ? "Pause" : "Start"}
            </button>
            <button
              onClick={() => setShowSettings((s) => !s)}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              ⚙️
            </button>
          </div>

          {/* Session counter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sessions completed:</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.max(4, sessions + 1) }).map((_, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: i < sessions ? color : "#e5e7eb" }}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{sessions}</span>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm">Timer Settings</h3>
            {[
              { label: "Focus (min)", value: workDuration, set: setWorkDuration, min: 1, max: 60 },
              { label: "Short break (min)", value: shortBreak, set: setShortBreak, min: 1, max: 30 },
              { label: "Long break (min)", value: longBreak, set: setLongBreak, min: 5, max: 60 },
              { label: "Sessions per long break", value: sessionsPerLong, set: setSessionsPerLong, min: 2, max: 10 },
            ].map(({ label, value, set, min, max }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <label className="text-xs text-gray-600 flex-1">{label}</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => set((v) => Math.max(min, v - 1))}
                    className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-200"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums text-gray-800">
                    {value}
                  </span>
                  <button
                    onClick={() => set((v) => Math.min(max, v + 1))}
                    className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={handleSettingsSave}
              className="w-full py-2 rounded-xl text-white text-sm font-medium"
              style={{ backgroundColor: color }}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
