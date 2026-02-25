"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Phase = "idle" | "watching" | "input" | "correct" | "gameover";

const BUTTONS = [
  { id: 0, color: "#ef4444", label: "Red" },
  { id: 1, color: "#22c55e", label: "Green" },
  { id: 2, color: "#3b82f6", label: "Blue" },
  { id: 3, color: "#eab308", label: "Yellow" },
];

export default function SimonSays({ config, spellId: _spellId }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const sequence = useRef<number[]>([]);
  const playerIndex = useRef(0);

  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState("Tap Start to play");
  const [finalRound, setFinalRound] = useState(0);

  const playSequence = useCallback((seq: number[]) => {
    setPhase("watching");
    setStatusMsg("Watch...");
    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setLit(null);
        setTimeout(() => {
          playerIndex.current = 0;
          setPhase("input");
          setStatusMsg("Your turn!");
        }, 400);
        return;
      }
      setLit(seq[i]);
      setTimeout(() => {
        setLit(null);
        i++;
        setTimeout(step, 200);
      }, 600);
    };
    setTimeout(step, 400);
  }, []);

  const startGame = useCallback(() => {
    sequence.current = [];
    const first = Math.floor(Math.random() * 4);
    sequence.current = [first];
    setRound(1);
    playSequence([first]);
  }, [playSequence]);

  const handleButtonPress = (id: number) => {
    if (phase !== "input") return;

    setLit(id);
    setTimeout(() => setLit(null), 200);

    const expected = sequence.current[playerIndex.current];
    if (id !== expected) {
      setFinalRound(round);
      setPhase("gameover");
      setStatusMsg(`Game over! You reached round ${round}`);
      return;
    }

    playerIndex.current += 1;

    if (playerIndex.current >= sequence.current.length) {
      // Completed round
      setPhase("correct");
      setStatusMsg("Correct! Next round...");
      const next = Math.floor(Math.random() * 4);
      sequence.current = [...sequence.current, next];
      const nextRound = round + 1;
      setRound(nextRound);
      setTimeout(() => {
        playSequence(sequence.current);
      }, 900);
    }
  };

  return (
    <TemplateShell config={config} icon="🎮">
      <div className="p-4">
        {/* Status bar */}
        <div
          className="rounded-xl px-4 py-3 mb-6 text-center"
          style={{ background: `${color}15` }}
        >
          <p className="text-sm font-medium text-gray-700">{statusMsg}</p>
          {round > 0 && phase !== "gameover" && (
            <p className="text-xs text-gray-400 mt-0.5">Round {round}</p>
          )}
        </div>

        {/* 2x2 button grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {BUTTONS.map((btn) => {
            const isLit = lit === btn.id;
            return (
              <button
                key={btn.id}
                onPointerDown={() => handleButtonPress(btn.id)}
                disabled={phase !== "input"}
                className="rounded-2xl transition-all duration-100 active:scale-95"
                style={{
                  backgroundColor: isLit ? btn.color : `${btn.color}60`,
                  boxShadow: isLit
                    ? `0 0 28px 8px ${btn.color}88`
                    : "none",
                  minHeight: "120px",
                  border: `3px solid ${btn.color}`,
                  opacity: phase === "watching" || phase === "correct" ? 0.85 : 1,
                }}
                aria-label={btn.label}
              />
            );
          })}
        </div>

        {/* Controls */}
        {(phase === "idle" || phase === "gameover") && (
          <div className="text-center">
            {phase === "gameover" && (
              <p className="text-2xl font-bold text-gray-800 mb-1">
                Round {finalRound}
              </p>
            )}
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: color }}
            >
              {phase === "idle" ? "Start" : "Play Again"}
            </button>
          </div>
        )}

        {phase !== "idle" && phase !== "gameover" && (
          <div className="text-center">
            <button
              onClick={() => {
                setPhase("idle");
                setRound(0);
                setStatusMsg("Tap Start to play");
                sequence.current = [];
              }}
              className="text-xs text-gray-400 underline"
            >
              Quit
            </button>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
