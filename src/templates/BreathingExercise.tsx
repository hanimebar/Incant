"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type PatternId = "4-7-8" | "box" | "2-1-4-1";

interface Phase {
  label: string;
  seconds: number;
  instruction: string;
}

interface Pattern {
  id: PatternId;
  name: string;
  description: string;
  phases: Phase[];
}

const PATTERNS: Pattern[] = [
  {
    id: "4-7-8",
    name: "4-7-8",
    description: "Calming & sleep",
    phases: [
      { label: "Inhale", seconds: 4, instruction: "Breathe in through your nose..." },
      { label: "Hold", seconds: 7, instruction: "Hold your breath..." },
      { label: "Exhale", seconds: 8, instruction: "Breathe out through your mouth..." },
    ],
  },
  {
    id: "box",
    name: "Box",
    description: "Focus & stress relief",
    phases: [
      { label: "Inhale", seconds: 4, instruction: "Breathe in slowly..." },
      { label: "Hold", seconds: 4, instruction: "Hold gently..." },
      { label: "Exhale", seconds: 4, instruction: "Breathe out smoothly..." },
      { label: "Hold", seconds: 4, instruction: "Rest and hold..." },
    ],
  },
  {
    id: "2-1-4-1",
    name: "2-1-4-1",
    description: "Quick & energising",
    phases: [
      { label: "Inhale", seconds: 2, instruction: "Quick inhale..." },
      { label: "Hold", seconds: 1, instruction: "Brief hold..." },
      { label: "Exhale", seconds: 4, instruction: "Long exhale..." },
      { label: "Hold", seconds: 1, instruction: "Brief pause..." },
    ],
  },
];

export default function BreathingExercise({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const [patternId, setPatternId] = useState<PatternId>("box");
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondInPhase, setSecondInPhase] = useState(0);
  const [cycles, setCycles] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIdxRef = useRef(0);
  const secondInPhaseRef = useRef(0);
  const cyclesRef = useRef(0);

  const pattern = PATTERNS.find((p) => p.id === patternId)!;
  const currentPhase = pattern.phases[phaseIdx];

  // Scale: 0.85 (exhale/hold) → 1.25 (inhale)
  const getScale = (phase: Phase) => {
    if (phase.label === "Inhale") return 1.25;
    if (phase.label === "Exhale") return 0.85;
    return 1.0; // hold
  };

  const scale = running ? getScale(currentPhase) : 1.0;
  const phasePct = currentPhase ? (secondInPhase / currentPhase.seconds) * 100 : 0;

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setPhaseIdx(0);
    setSecondInPhase(0);
    phaseIdxRef.current = 0;
    secondInPhaseRef.current = 0;
  }, []);

  const tick = useCallback(
    (phases: Phase[]) => {
      secondInPhaseRef.current += 1;
      const phase = phases[phaseIdxRef.current];

      if (secondInPhaseRef.current >= phase.seconds) {
        // advance phase
        const nextPhaseIdx = (phaseIdxRef.current + 1) % phases.length;
        if (nextPhaseIdx === 0) {
          cyclesRef.current += 1;
          setCycles(cyclesRef.current);
        }
        phaseIdxRef.current = nextPhaseIdx;
        secondInPhaseRef.current = 0;
        setPhaseIdx(nextPhaseIdx);
        setSecondInPhase(0);
      } else {
        setSecondInPhase(secondInPhaseRef.current);
      }
    },
    []
  );

  const start = useCallback(() => {
    phaseIdxRef.current = 0;
    secondInPhaseRef.current = 0;
    cyclesRef.current = 0;
    setPhaseIdx(0);
    setSecondInPhase(0);
    setCycles(0);
    setRunning(true);
    const phases = PATTERNS.find((p) => p.id === patternId)!.phases;
    intervalRef.current = setInterval(() => tick(phases), 1000);
  }, [patternId, tick]);

  // Clean up on unmount or pattern change
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handlePatternChange = (id: PatternId) => {
    stop();
    setPatternId(id);
  };

  const secondsRemaining = currentPhase
    ? currentPhase.seconds - secondInPhase
    : 0;

  return (
    <TemplateShell config={config} icon="🫁">
      <div className="p-4 space-y-6">
        {/* Pattern selector */}
        <div className="grid grid-cols-3 gap-2">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePatternChange(p.id)}
              className="flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all"
              style={{
                borderColor: patternId === p.id ? color : "#e5e7eb",
                backgroundColor: patternId === p.id ? `${color}12` : "#fff",
              }}
            >
              <span
                className="font-bold text-sm"
                style={{ color: patternId === p.id ? color : "#374151" }}
              >
                {p.name}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">{p.description}</span>
            </button>
          ))}
        </div>

        {/* Animated circle */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
            {/* Outer glow ring */}
            <div
              className="absolute rounded-full"
              style={{
                width: 220,
                height: 220,
                backgroundColor: `${color}12`,
                transform: `scale(${running ? scale : 1})`,
                transition: currentPhase
                  ? `transform ${currentPhase.seconds}s ease-in-out`
                  : "transform 0.5s ease",
              }}
            />
            {/* Main circle */}
            <div
              className="absolute rounded-full flex flex-col items-center justify-center"
              style={{
                width: 180,
                height: 180,
                backgroundColor: `${color}22`,
                border: `3px solid ${color}`,
                transform: `scale(${running ? scale : 1})`,
                transition: currentPhase
                  ? `transform ${currentPhase.seconds}s ease-in-out`
                  : "transform 0.5s ease",
              }}
            >
              {running ? (
                <>
                  <span className="text-2xl font-bold" style={{ color }}>
                    {secondsRemaining}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 mt-0.5">
                    {currentPhase?.label}
                  </span>
                </>
              ) : (
                <span className="text-4xl">🫁</span>
              )}
            </div>
          </div>

          {/* Instruction text */}
          <p className="text-sm text-gray-500 text-center h-5">
            {running ? currentPhase?.instruction : "Press Start to begin"}
          </p>

          {/* Phase progress dots */}
          {running && (
            <div className="flex gap-2">
              {pattern.phases.map((ph, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      backgroundColor: i === phaseIdx ? color : "#e5e7eb",
                    }}
                  />
                  <span className="text-xs text-gray-400">{ph.label[0]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Start / Stop */}
          <button
            onClick={running ? stop : start}
            className="px-10 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: running ? "#6b7280" : color }}
          >
            {running ? "Stop" : "Start"}
          </button>

          {/* Cycle counter */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Cycles completed:</span>
            <span className="font-bold" style={{ color }}>
              {cycles}
            </span>
          </div>

          {/* Phase breakdown */}
          <div className="w-full bg-white border border-gray-100 rounded-2xl p-3 space-y-1.5">
            {pattern.phases.map((ph, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span
                  className="font-medium"
                  style={{ color: running && i === phaseIdx ? color : "#6b7280" }}
                >
                  {ph.label}
                </span>
                <div className="flex items-center gap-2">
                  {running && i === phaseIdx && (
                    <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${phasePct}%`,
                          backgroundColor: color,
                          transition: "width 1s linear",
                        }}
                      />
                    </div>
                  )}
                  <span className="text-gray-400 tabular-nums">{ph.seconds}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TemplateShell>
  );
}
