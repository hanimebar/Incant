"use client";

import { useState, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const WORDS = [
  "python", "bridge", "castle", "forest", "garden", "planet", "rocket", "sunlight",
  "dolphin", "elephant", "blanket", "captain", "diamond", "feather", "glacier",
  "harvest", "journey", "kitchen", "lantern", "muffin", "napkin", "penguin",
  "quarter", "rainbow", "silence", "temple", "umbrella", "village", "whisper",
  "yellow", "zipper", "balloon", "candle", "danger", "engine", "flower", "guitar",
  "hammer", "island", "jungle", "kitten", "lemon", "mirror", "needle", "orange",
  "pencil", "queen", "ribbon", "silver", "ticket", "urgent", "violet", "wonder",
  "cactus",
];

const MAX_WRONG = 6;

const STAGE_EMOJI = ["❓", "😐", "😟", "😰", "😱", "💀", "☠️"];

function pickWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Hangman({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const [word, setWord] = useState(() => pickWord());
  const [guessed, setGuessed] = useState<Set<string>>(new Set());

  const letters = word.toUpperCase().split("");
  const wrongGuesses = [...guessed].filter((l) => !letters.includes(l));
  const wrongCount = wrongGuesses.length;
  const isWon = letters.every((l) => guessed.has(l));
  const isLost = wrongCount >= MAX_WRONG;
  const isOver = isWon || isLost;

  const guess = useCallback(
    (letter: string) => {
      if (isOver || guessed.has(letter)) return;
      setGuessed((prev) => new Set([...prev, letter]));
    },
    [isOver, guessed]
  );

  const reset = () => {
    setWord(pickWord());
    setGuessed(new Set());
  };

  const stageEmoji = STAGE_EMOJI[wrongCount] ?? "☠️";

  return (
    <TemplateShell config={config}>
      <div className="p-4">
        {/* Stage display */}
        <div className="text-center mb-4">
          <span className="text-6xl">{stageEmoji}</span>
          <p className="text-sm text-gray-500 mt-1">
            {wrongCount} / {MAX_WRONG} wrong guesses
          </p>
        </div>

        {/* Game over / win banners */}
        {isWon && (
          <div
            className="text-center py-3 rounded-2xl text-white font-semibold mb-4"
            style={{ backgroundColor: color }}
          >
            You win! 🎉
          </div>
        )}
        {isLost && (
          <div className="text-center py-3 rounded-2xl bg-red-500 text-white font-semibold mb-4">
            Game over! The word was <span className="uppercase">{word}</span>
          </div>
        )}

        {/* Word display */}
        <div className="flex justify-center gap-2 flex-wrap mb-6">
          {letters.map((letter, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className="text-xl font-bold uppercase w-7 text-center"
                style={{ color: guessed.has(letter) ? color : "transparent" }}
              >
                {letter}
              </span>
              <div className="w-7 h-0.5 bg-gray-400 rounded" />
            </div>
          ))}
        </div>

        {/* Alphabet buttons */}
        <div className="flex flex-wrap gap-1.5 justify-center mb-6">
          {ALPHABET.map((letter) => {
            const isGuessed = guessed.has(letter);
            const isCorrect = isGuessed && letters.includes(letter);
            const isWrong = isGuessed && !letters.includes(letter);
            return (
              <button
                key={letter}
                onClick={() => guess(letter)}
                disabled={isGuessed || isOver}
                className="w-9 h-9 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:cursor-default"
                style={{
                  backgroundColor: isCorrect
                    ? color
                    : isWrong
                    ? "#e5e7eb"
                    : `${color}18`,
                  color: isCorrect ? "white" : isWrong ? "#9ca3af" : color,
                  opacity: isWrong ? 0.5 : 1,
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl text-white font-medium text-sm"
            style={{ backgroundColor: color }}
          >
            New word
          </button>
        </div>
      </div>
    </TemplateShell>
  );
}
