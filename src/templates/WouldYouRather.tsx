"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const DILEMMAS: [string, string][] = [
  ["Fly", "Be invisible"],
  ["Live in the past", "Live in the future"],
  ["Be always hot", "Be always cold"],
  ["Have no phone", "Have no internet"],
  ["Speak all languages", "Play all instruments"],
  ["Be famous", "Be rich"],
  ["Have a personal chef", "Have a personal driver"],
  ["Never sleep", "Never eat"],
  ["Be a genius", "Be a superhero"],
  ["Time travel to the past", "Time travel to the future"],
  ["Explore space", "Explore the deep ocean"],
  ["Have unlimited money", "Have unlimited time"],
  ["Run at 100mph", "Fly at 10mph"],
  ["Always say what you think", "Never speak again"],
  ["Lose all your memories", "Never make new ones"],
  ["Control fire", "Control water"],
  ["Be the hero", "Be the villain"],
  ["Have a rewind button", "Have a pause button for your life"],
  ["Know how you die", "Know when you die"],
  ["Master every art", "Master every sport"],
  ["Live in a city", "Live in the wilderness"],
  ["Be respected", "Be loved"],
  ["Have a photographic memory", "Be super fast"],
  ["Always be overdressed", "Always be underdressed"],
  ["Meet your ancestors", "Meet your descendants"],
  ["Work your dream job for free", "Work a boring job for millions"],
  ["Have one true friend", "Have 100 casual friends"],
  ["Always tell the truth", "Be able to lie"],
  ["Be the smartest person", "Be the happiest person"],
  ["End hunger", "End war"],
];

interface Tally {
  [key: string]: { a: number; b: number };
}

function getTally(spellId: string): Tally {
  try {
    const raw = localStorage.getItem(`incant-${spellId}-wyr-tally`);
    return raw ? (JSON.parse(raw) as Tally) : {};
  } catch {
    return {};
  }
}

function saveTally(spellId: string, tally: Tally) {
  try {
    localStorage.setItem(`incant-${spellId}-wyr-tally`, JSON.stringify(tally));
  } catch {}
}

export default function WouldYouRather({ config, spellId }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const [idx, setIdx] = useState(() => Math.floor(Math.random() * DILEMMAS.length));
  const [sessionA, setSessionA] = useState(0);
  const [sessionB, setSessionB] = useState(0);
  const [tally, setTally] = useState<Tally>({});
  const [voted, setVoted] = useState<"a" | "b" | null>(null);

  useEffect(() => {
    setTally(getTally(spellId));
  }, [spellId]);

  const [optA, optB] = DILEMMAS[idx];
  const key = `${idx}`;
  const storedA = tally[key]?.a ?? 0;
  const storedB = tally[key]?.b ?? 0;
  const totalStored = storedA + storedB;

  function vote(choice: "a" | "b") {
    if (voted) return;
    setVoted(choice);
    if (choice === "a") setSessionA((n) => n + 1);
    else setSessionB((n) => n + 1);
    const newTally = { ...tally, [key]: { a: storedA + (choice === "a" ? 1 : 0), b: storedB + (choice === "b" ? 1 : 0) } };
    setTally(newTally);
    saveTally(spellId, newTally);
  }

  function next() {
    setVoted(null);
    let newIdx: number;
    do {
      newIdx = Math.floor(Math.random() * DILEMMAS.length);
    } while (newIdx === idx && DILEMMAS.length > 1);
    setIdx(newIdx);
  }

  const sessionTotal = sessionA + sessionB;

  return (
    <TemplateShell config={config} icon="🤔">
      <div className="flex flex-col gap-6">
        {/* Dilemma prompt */}
        <div
          className="rounded-2xl px-4 py-4 text-center"
          style={{ background: `${color}10`, borderLeft: `4px solid ${color}` }}
        >
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
            Would you rather…
          </p>
        </div>

        {/* Option buttons */}
        <div className="flex flex-col gap-3">
          {(["a", "b"] as const).map((choice) => {
            const label = choice === "a" ? optA : optB;
            const isVoted = voted === choice;
            const isOther = voted && voted !== choice;
            const votes = choice === "a" ? storedA + (voted === "a" ? 0 : 0) : storedB;
            const pct = totalStored > 0 ? Math.round(((choice === "a" ? tally[key]?.a ?? 0 : tally[key]?.b ?? 0) / totalStored) * 100) : null;

            return (
              <button
                key={choice}
                onClick={() => vote(choice)}
                disabled={!!voted}
                className="relative w-full rounded-2xl p-5 text-left font-semibold text-base shadow-sm overflow-hidden transition-all active:scale-98 disabled:cursor-default"
                style={{
                  background: isVoted
                    ? `linear-gradient(135deg, ${color}, ${color}bb)`
                    : isOther
                    ? "#f3f4f6"
                    : "#fff",
                  color: isVoted ? "#fff" : isOther ? "#9ca3af" : "#1f2937",
                  border: `2px solid ${isVoted ? color : isOther ? "#e5e7eb" : `${color}30`}`,
                }}
              >
                <span className="relative z-10">{label}</span>
                {voted && pct !== null && (
                  <>
                    <div
                      className="absolute inset-0 opacity-20 transition-all"
                      style={{
                        width: `${pct}%`,
                        background: isVoted ? "#fff" : color,
                      }}
                    />
                    <span
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold"
                      style={{ color: isVoted ? "rgba(255,255,255,0.9)" : color }}
                    >
                      {pct}%
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Vote counts after voting */}
        {voted && (
          <p className="text-center text-xs text-gray-400">
            {totalStored} vote{totalStored !== 1 ? "s" : ""} recorded for this question
          </p>
        )}

        {/* Next button */}
        {voted && (
          <button
            onClick={next}
            className="w-full py-3 rounded-2xl text-white font-bold text-base active:scale-95 transition-transform"
            style={{ backgroundColor: color }}
          >
            Next question
          </button>
        )}

        {/* Session tally */}
        {sessionTotal > 0 && (
          <div className="flex justify-around text-center py-3 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              <p className="text-2xl font-black" style={{ color }}>{sessionA}</p>
              <p className="text-xs text-gray-500">Option A votes</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-2xl font-black" style={{ color }}>{sessionB}</p>
              <p className="text-xs text-gray-500">Option B votes</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-2xl font-black text-gray-600">{sessionTotal}</p>
              <p className="text-xs text-gray-500">This session</p>
            </div>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
