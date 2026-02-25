"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const DRAMATIC_INTROS = [
  "The universe chooses…",
  "Fate has spoken:",
  "The cosmos declare…",
  "Your destiny is clear:",
  "The stars align for…",
  "The oracle has decided:",
  "Beyond all doubt…",
  "The answer is written:",
];

const REASONS_A = [
  "It came first — a sign of priority.",
  "Sometimes the heart already knows.",
  "The path of least resistance leads here.",
  "Trust the gut that brought you to Option A.",
];

const REASONS_B = [
  "A bold choice — fortune favours the brave.",
  "The second option often carries hidden wisdom.",
  "Choosing B shows openness to the unexpected.",
  "Something in you hesitated at A — honour that.",
];

export default function DecisionMaker({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [result, setResult] = useState<"A" | "B" | null>(null);
  const [intro, setIntro] = useState("");
  const [reason, setReason] = useState("");
  const [deciding, setDeciding] = useState(false);

  function decide() {
    if (deciding || !optionA.trim() || !optionB.trim()) return;
    setResult(null);
    setDeciding(true);
    setTimeout(() => {
      const choice: "A" | "B" = Math.random() < 0.5 ? "A" : "B";
      setResult(choice);
      setIntro(DRAMATIC_INTROS[Math.floor(Math.random() * DRAMATIC_INTROS.length)]);
      const reasonList = choice === "A" ? REASONS_A : REASONS_B;
      setReason(reasonList[Math.floor(Math.random() * reasonList.length)]);
      setDeciding(false);
    }, 1200);
  }

  function reset() {
    setResult(null);
    setIntro("");
    setReason("");
  }

  const chosenText = result === "A" ? optionA : result === "B" ? optionB : "";

  return (
    <TemplateShell config={config} icon="🔮">
      <div className="flex flex-col gap-5">
        <style>{`
          @keyframes revealChoice {
            0%  { opacity: 0; transform: scale(0.5) translateY(20px); }
            60% { transform: scale(1.08) translateY(-4px); }
            100%{ opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Option inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Option A
            </label>
            <input
              type="text"
              value={optionA}
              onChange={(e) => { setOptionA(e.target.value); reset(); }}
              placeholder="e.g. Stay in tonight"
              className="w-full px-4 py-3 rounded-xl border-2 outline-none text-base bg-white text-gray-800"
              style={{ borderColor: `${color}40` }}
            />
          </div>
          <div className="text-center text-sm font-bold text-gray-300">vs</div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Option B
            </label>
            <input
              type="text"
              value={optionB}
              onChange={(e) => { setOptionB(e.target.value); reset(); }}
              placeholder="e.g. Go out with friends"
              className="w-full px-4 py-3 rounded-xl border-2 outline-none text-base bg-white text-gray-800"
              style={{ borderColor: `${color}40` }}
            />
          </div>
        </div>

        {/* Decide button */}
        {!result && (
          <button
            onClick={decide}
            disabled={deciding || !optionA.trim() || !optionB.trim()}
            className="w-full py-4 rounded-2xl text-white text-xl font-black shadow-xl tracking-wide active:scale-95 transition-transform disabled:opacity-50"
            style={{
              background: deciding
                ? "#9ca3af"
                : `linear-gradient(135deg, ${color}, ${color}bb)`,
            }}
          >
            {deciding ? (
              <span className="animate-pulse">Consulting the oracle…</span>
            ) : (
              "DECIDE"
            )}
          </button>
        )}

        {/* Result */}
        {result && !deciding && (
          <div
            className="flex flex-col items-center gap-4 py-6 px-4 rounded-3xl text-white shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${color}ee, ${color}88)`,
              animation: "revealChoice 0.5s ease-out",
            }}
          >
            <p className="text-sm font-medium opacity-80">{intro}</p>
            <p className="text-3xl font-black text-center leading-tight">{chosenText}</p>
            <p className="text-xs opacity-70 text-center max-w-xs italic">{reason}</p>
            <button
              onClick={reset}
              className="mt-2 px-5 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              Ask again
            </button>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
