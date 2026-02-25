"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

export default function CoinFlip({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);

  const total = heads + tails;

  function flip() {
    if (flipping) return;
    setFlipping(true);
    setResult(null);
    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? "heads" : "tails";
      setResult(outcome);
      if (outcome === "heads") setHeads((h) => h + 1);
      else setTails((t) => t + 1);
      setFlipping(false);
    }, 700);
  }

  return (
    <TemplateShell config={config} icon="🪙">
      <div className="flex flex-col items-center gap-8">
        {/* Coin display */}
        <div
          className="flex items-center justify-center rounded-full shadow-2xl select-none"
          style={{
            width: 180,
            height: 180,
            background: flipping
              ? "#d1d5db"
              : result === "heads"
              ? `linear-gradient(135deg, ${color}, ${color}cc)`
              : result === "tails"
              ? "linear-gradient(135deg, #9ca3af, #6b7280)"
              : "#e5e7eb",
            transition: "background 0.3s",
            animation: flipping ? "spin 0.7s linear" : "none",
          }}
        >
          <style>{`@keyframes spin { 0%{transform:rotateY(0)} 50%{transform:rotateY(90deg)} 100%{transform:rotateY(0)} }`}</style>
          <span className="text-6xl" role="img" aria-label={result ?? "coin"}>
            {flipping ? "🪙" : result === "heads" ? "👑" : result === "tails" ? "🔵" : "🪙"}
          </span>
        </div>

        {/* Result text */}
        <div className="text-center min-h-12">
          {flipping && (
            <p className="text-xl text-gray-400 font-medium animate-pulse">Flipping…</p>
          )}
          {!flipping && result === "heads" && (
            <p className="text-3xl font-bold" style={{ color }}>
              Heads! 👑
            </p>
          )}
          {!flipping && result === "tails" && (
            <p className="text-3xl font-bold text-gray-600">Tails!</p>
          )}
          {!flipping && result === null && (
            <p className="text-gray-400 text-lg">Tap to flip</p>
          )}
        </div>

        {/* Flip button */}
        <button
          onClick={flip}
          disabled={flipping}
          className="px-10 py-4 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-60"
          style={{ backgroundColor: color }}
        >
          {flipping ? "Flipping…" : "Flip"}
        </button>

        {/* Stats */}
        {total > 0 && (
          <div className="w-full rounded-2xl p-4 bg-gray-50 border border-gray-100">
            <p className="text-center text-sm text-gray-500 mb-3 font-medium">
              {total} flip{total !== 1 ? "s" : ""} this session
            </p>
            <div className="flex gap-3">
              {/* Heads bar */}
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold" style={{ color }}>
                  {heads}
                </p>
                <p className="text-xs text-gray-500">Heads</p>
                <div className="mt-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${total > 0 ? (heads / total) * 100 : 0}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
              <div className="w-px bg-gray-200" />
              {/* Tails bar */}
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-gray-600">{tails}</p>
                <p className="text-xs text-gray-500">Tails</p>
                <div className="mt-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gray-500 transition-all"
                    style={{
                      width: `${total > 0 ? (tails / total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
