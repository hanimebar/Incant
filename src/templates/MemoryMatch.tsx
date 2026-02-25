"use client";

import { useState, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const EMOJIS = ["🐶", "🐱", "🦊", "🐸", "🦁", "🐯", "🐻", "🦄"];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function buildDeck(): Card[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  const shuffled = pairs.sort(() => Math.random() - 0.5);
  return shuffled.map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
}

export default function MemoryMatch({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [cards, setCards] = useState<Card[]>(buildDeck);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const pairsFound = cards.filter((c) => c.matched).length / 2;
  const won = pairsFound === EMOJIS.length;

  const reset = () => {
    setCards(buildDeck());
    setSelected([]);
    setMoves(0);
    setLocked(false);
  };

  const handleFlip = useCallback(
    (id: number) => {
      if (locked) return;
      const card = cards[id];
      if (card.flipped || card.matched || selected.includes(id)) return;

      const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
      const newSelected = [...selected, id];

      setCards(newCards);
      setSelected(newSelected);

      if (newSelected.length === 2) {
        setMoves((m) => m + 1);
        setLocked(true);
        const [first, second] = newSelected;
        const isMatch = newCards[first].emoji === newCards[second].emoji;

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => {
              if (c.id === first || c.id === second) {
                return isMatch ? { ...c, matched: true } : { ...c, flipped: false };
              }
              return c;
            })
          );
          setSelected([]);
          setLocked(false);
        }, 800);
      }
    },
    [cards, selected, locked]
  );

  return (
    <TemplateShell config={config}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <span>Pairs: {pairsFound}/{EMOJIS.length}</span>
          <span>Moves: {moves}</span>
        </div>

        {won && (
          <div
            className="text-center py-3 rounded-xl mb-4 font-semibold text-white text-sm"
            style={{ backgroundColor: color }}
          >
            You won in {moves} moves! 🎉
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 mb-6">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className="aspect-square rounded-xl text-2xl flex items-center justify-center transition-all active:scale-95 font-bold"
              style={{
                backgroundColor:
                  card.flipped || card.matched ? `${color}18` : color,
                border: `2px solid ${card.matched ? color : card.flipped ? color : "transparent"}`,
                color: card.flipped || card.matched ? "#374151" : "transparent",
                cursor: card.matched ? "default" : "pointer",
              }}
            >
              {card.flipped || card.matched ? card.emoji : ""}
            </button>
          ))}
        </div>

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
