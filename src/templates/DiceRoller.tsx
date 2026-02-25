"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type DieType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20";

interface Die {
  id: number;
  type: DieType;
  result: number | null;
}

const DIE_SIDES: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
};

const D6_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

interface HistoryEntry {
  dice: string;
  results: number[];
  total: number;
}

let nextId = 1;

export default function DiceRoller({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [dice, setDice] = useState<Die[]>([
    { id: nextId++, type: "d6", result: null },
    { id: nextId++, type: "d6", result: null },
  ]);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  function addDie(type: DieType) {
    if (dice.length >= 12) return;
    setDice((d) => [...d, { id: nextId++, type, result: null }]);
  }

  function removeDie(id: number) {
    setDice((d) => d.filter((die) => die.id !== id));
  }

  function changeDieType(id: number, type: DieType) {
    setDice((d) => d.map((die) => (die.id === id ? { ...die, type, result: null } : die)));
  }

  function roll() {
    if (rolling || dice.length === 0) return;
    setRolling(true);

    // Animate with random values for 600ms
    let ticks = 0;
    const interval = setInterval(() => {
      setDice((d) =>
        d.map((die) => ({
          ...die,
          result: Math.floor(Math.random() * DIE_SIDES[die.type]) + 1,
        }))
      );
      ticks++;
      if (ticks >= 8) {
        clearInterval(interval);
        setDice((prev) => {
          const rolled = prev.map((die) => ({
            ...die,
            result: Math.floor(Math.random() * DIE_SIDES[die.type]) + 1,
          }));
          const results = rolled.map((d) => d.result as number);
          const total = results.reduce((a, b) => a + b, 0);
          const label = Object.entries(
            rolled.reduce((acc: Record<string, number>, d) => {
              acc[d.type] = (acc[d.type] || 0) + 1;
              return acc;
            }, {})
          )
            .map(([t, n]) => `${n}${t}`)
            .join(", ");
          setHistory((h) => [{ dice: label, results, total }, ...h].slice(0, 5));
          return rolled;
        });
        setRolling(false);
      }
    }, 80);
  }

  const total = dice.reduce((sum, d) => sum + (d.result ?? 0), 0);
  const allRolled = dice.length > 0 && dice.every((d) => d.result !== null);

  return (
    <TemplateShell config={config} icon="🎲">
      <div className="flex flex-col gap-5">
        {/* Die type picker */}
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Add a die</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(DIE_SIDES) as DieType[]).map((type) => (
              <button
                key={type}
                onClick={() => addDie(type)}
                className="px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-colors"
                style={{ borderColor: `${color}60`, color }}
              >
                +{type}
              </button>
            ))}
          </div>
        </div>

        {/* Dice tray */}
        {dice.length === 0 ? (
          <p className="text-gray-400 text-center py-6">Add some dice above</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {dice.map((die) => (
              <div
                key={die.id}
                className="flex flex-col items-center gap-1 p-3 rounded-2xl border-2 min-w-16 relative"
                style={{
                  borderColor: rolling ? `${color}80` : `${color}30`,
                  background: `${color}08`,
                }}
              >
                {/* Remove button */}
                <button
                  onClick={() => removeDie(die.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs leading-none flex items-center justify-center hover:bg-red-100 hover:text-red-500"
                >
                  ×
                </button>

                {/* Die face / result */}
                <span className="text-3xl font-black leading-none" style={{ color }}>
                  {die.result !== null
                    ? die.type === "d6"
                      ? D6_FACES[die.result - 1]
                      : die.result
                    : "·"}
                </span>

                {/* Die type selector */}
                <select
                  value={die.type}
                  onChange={(e) => changeDieType(die.id, e.target.value as DieType)}
                  className="text-xs text-gray-500 bg-transparent outline-none cursor-pointer"
                >
                  {(Object.keys(DIE_SIDES) as DieType[]).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {allRolled && (
          <div
            className="text-center py-3 rounded-2xl font-bold text-2xl"
            style={{ background: `${color}15`, color }}
          >
            Total: {total}
          </div>
        )}

        {/* Roll button */}
        <button
          onClick={roll}
          disabled={rolling || dice.length === 0}
          className="w-full py-4 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-60"
          style={{ backgroundColor: color }}
        >
          {rolling ? "Rolling…" : "Roll!"}
        </button>

        {/* History */}
        {history.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Roll history</p>
            <div className="space-y-1.5">
              {history.map((entry, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-3 py-2 rounded-xl bg-gray-50 text-sm"
                >
                  <span className="text-gray-500">
                    {entry.dice} → [{entry.results.join(", ")}]
                  </span>
                  <span className="font-bold" style={{ color: i === 0 ? color : "#9ca3af" }}>
                    {entry.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
