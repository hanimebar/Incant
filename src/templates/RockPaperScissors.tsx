"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Choice = "rock" | "paper" | "scissors";

const CHOICES: { id: Choice; emoji: string; label: string }[] = [
  { id: "rock", emoji: "🪨", label: "Rock" },
  { id: "paper", emoji: "📄", label: "Paper" },
  { id: "scissors", emoji: "✂️", label: "Scissors" },
];

function getResult(player: Choice, computer: Choice): "win" | "lose" | "tie" {
  if (player === computer) return "tie";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "win";
  }
  return "lose";
}

interface Score {
  wins: number;
  losses: number;
  ties: number;
}

export default function RockPaperScissors({ config, spellId }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const key = `incant-${spellId}-rps-score`;

  const [score, setScore] = useState<Score>({ wins: 0, losses: 0, ties: 0 });
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "tie" | null>(null);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setScore(JSON.parse(stored));
  }, [key]);

  const saveScore = (updated: Score) => {
    setScore(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const play = (choice: Choice) => {
    if (revealing) return;
    const computer = CHOICES[Math.floor(Math.random() * 3)].id;
    const outcome = getResult(choice, computer);

    setPlayerChoice(choice);
    setComputerChoice(computer);
    setResult(null);
    setRevealing(true);

    setTimeout(() => {
      setResult(outcome);
      setRevealing(false);
      const next = { ...score };
      if (outcome === "win") next.wins += 1;
      else if (outcome === "lose") next.losses += 1;
      else next.ties += 1;
      saveScore(next);
    }, 500);
  };

  const resultText =
    result === "win" ? "You win! 🎉" : result === "lose" ? "Computer wins! 🤖" : result === "tie" ? "Tie! 🤝" : null;

  const resultColor =
    result === "win" ? "#16a34a" : result === "lose" ? "#dc2626" : "#6b7280";

  return (
    <TemplateShell config={config}>
      <div className="p-4">
        {/* Score */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
          {(["wins", "ties", "losses"] as const).map((stat) => (
            <div key={stat} className="bg-white rounded-xl border border-gray-100 py-3">
              <p className="text-2xl font-bold" style={{ color: stat === "wins" ? "#16a34a" : stat === "losses" ? "#dc2626" : "#6b7280" }}>
                {score[stat]}
              </p>
              <p className="text-xs text-gray-400 capitalize">{stat}</p>
            </div>
          ))}
        </div>

        {/* Reveal area */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 min-h-[96px] flex flex-col items-center justify-center gap-2">
          {playerChoice && computerChoice ? (
            <>
              <div className="flex items-center gap-6 text-5xl">
                <span title="You">{CHOICES.find((c) => c.id === playerChoice)?.emoji}</span>
                <span className="text-base text-gray-400 font-medium">vs</span>
                <span title="Computer" className={revealing ? "opacity-0" : "opacity-100 transition-opacity duration-300"}>
                  {CHOICES.find((c) => c.id === computerChoice)?.emoji}
                </span>
              </div>
              {result && (
                <p className="font-semibold text-sm" style={{ color: resultColor }}>
                  {resultText}
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-sm">Pick your move below</p>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {CHOICES.map(({ id, emoji, label }) => (
            <button
              key={id}
              onClick={() => play(id)}
              disabled={revealing}
              className="flex flex-col items-center gap-1 py-4 rounded-2xl text-white font-medium transition-all active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: color }}
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </TemplateShell>
  );
}
