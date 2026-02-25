"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface GuessEntry {
  value: number;
  hint: "high" | "low" | "correct";
}

function newSecret(max: number): number {
  return Math.floor(Math.random() * max) + 1;
}

export default function NumberGuess({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const max = typeof config.goal === "number" && config.goal > 0 ? config.goal : 100;

  const [secret, setSecret] = useState(() => newSecret(max));
  const [input, setInput] = useState("");
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [won, setWon] = useState(false);

  const handleGuess = () => {
    const num = parseInt(input, 10);
    if (isNaN(num) || num < 1 || num > max) return;
    if (won) return;

    let hint: GuessEntry["hint"];
    if (num === secret) hint = "correct";
    else if (num > secret) hint = "high";
    else hint = "low";

    setGuesses((prev) => [{ value: num, hint }, ...prev]);
    setInput("");
    if (hint === "correct") setWon(true);
  };

  const reset = () => {
    setSecret(newSecret(max));
    setGuesses([]);
    setInput("");
    setWon(false);
  };

  const hintText = guesses.length > 0 && !won
    ? guesses[0].hint === "high"
      ? "Too high! ↓"
      : "Too low! ↑"
    : null;

  return (
    <TemplateShell config={config}>
      <div className="p-4">
        <p className="text-center text-sm text-gray-500 mb-6">
          Guess a number between 1 and {max}
        </p>

        {won ? (
          <div
            className="text-center py-4 rounded-2xl text-white font-semibold mb-6"
            style={{ backgroundColor: color }}
          >
            <p className="text-2xl mb-1">🎉</p>
            <p>
              Correct! You got it in {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}!
            </p>
          </div>
        ) : (
          <>
            {hintText && (
              <p className="text-center font-semibold mb-4" style={{ color }}>
                {hintText}
              </p>
            )}
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                placeholder={`1 – ${max}`}
                min={1}
                max={max}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none text-center text-lg font-mono"
              />
              <button
                onClick={handleGuess}
                className="px-5 py-2.5 rounded-xl text-white font-medium text-sm"
                style={{ backgroundColor: color }}
              >
                Guess
              </button>
            </div>
          </>
        )}

        {guesses.length > 0 && (
          <div className="space-y-1.5 mb-4 max-h-56 overflow-y-auto">
            {guesses.map((g, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2 rounded-xl border text-sm"
                style={{
                  borderColor: g.hint === "correct" ? color : "#e5e7eb",
                  backgroundColor: g.hint === "correct" ? `${color}12` : "#f9fafb",
                }}
              >
                <span className="font-mono font-semibold text-gray-700">{g.value}</span>
                <span className="text-gray-500">
                  {g.hint === "correct" ? "✓ Correct!" : g.hint === "high" ? "↓ Too high" : "↑ Too low"}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl text-white font-medium text-sm"
            style={{ backgroundColor: color }}
          >
            Play again
          </button>
        </div>
      </div>
    </TemplateShell>
  );
}
