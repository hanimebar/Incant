"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface Card { id: string; front: string; back: string }
type Mode = "edit" | "study";

export default function FlashcardDeck({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-cards`;
  const primary = config.primaryColor || "#ec4899";
  const [cards, setCards] = useState<Card[]>([]);
  const [mode, setMode] = useState<Mode>("edit");
  const [form, setForm] = useState({ front: "", back: "" });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState<Card[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      setCards(JSON.parse(stored));
    } else if (config.customData && (config.customData as Record<string, Card[]>).cards) {
      const seed = (config.customData as Record<string, Card[]>).cards;
      setCards(seed);
      localStorage.setItem(key, JSON.stringify(seed));
    }
  }, [key, config.customData]);

  const save = (updated: Card[]) => {
    setCards(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const addCard = () => {
    if (!form.front.trim() || !form.back.trim()) return;
    save([...cards, { id: Date.now().toString(), ...form }]);
    setForm({ front: "", back: "" });
  };

  const startStudy = () => {
    const s = [...cards].sort(() => Math.random() - 0.5);
    setShuffled(s);
    setCurrentIdx(0);
    setFlipped(false);
    setMode("study");
  };

  const next = () => { setCurrentIdx((i) => Math.min(i + 1, shuffled.length - 1)); setFlipped(false); };
  const prev = () => { setCurrentIdx((i) => Math.max(i - 1, 0)); setFlipped(false); };
  const reshuffle = () => { setShuffled([...cards].sort(() => Math.random() - 0.5)); setCurrentIdx(0); setFlipped(false); };

  const current = shuffled[currentIdx];

  return (
    <TemplateShell config={config} icon="🃏">
      <div className="flex gap-2 mb-5">
        <button onClick={() => setMode("edit")}
          className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ backgroundColor: mode === "edit" ? primary : "#f3f4f6", color: mode === "edit" ? "white" : "#6b7280" }}>
          Edit ({cards.length} cards)
        </button>
        <button onClick={startStudy} disabled={cards.length === 0}
          className="flex-1 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
          style={{ backgroundColor: mode === "study" ? primary : "#f3f4f6", color: mode === "study" ? "white" : "#6b7280" }}>
          Study
        </button>
      </div>

      {mode === "edit" ? (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-2">
            <input value={form.front} onChange={(e) => setForm({ ...form, front: e.target.value })}
              placeholder="Front (question/term)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <input value={form.back} onChange={(e) => setForm({ ...form, back: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && addCard()}
              placeholder="Back (answer/definition)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <button onClick={addCard} disabled={!form.front.trim() || !form.back.trim()}
              className="w-full py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: primary }}>Add Card</button>
          </div>
          <div className="space-y-2">
            {cards.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{c.front}</p>
                  <p className="text-xs text-gray-400 truncate">{c.back}</p>
                </div>
                <button onClick={() => save(cards.filter((x) => x.id !== c.id))} className="text-gray-300 hover:text-red-400">×</button>
              </div>
            ))}
          </div>
        </>
      ) : current ? (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">{currentIdx + 1} / {shuffled.length}</p>
          <div
            onClick={() => setFlipped(!flipped)}
            className="min-h-48 flex items-center justify-center p-8 rounded-2xl cursor-pointer transition-all shadow-lg"
            style={{ backgroundColor: flipped ? `${primary}15` : primary }}
          >
            <div className="text-center">
              <p className={`text-xs uppercase tracking-wider mb-3 ${flipped ? "text-gray-500" : "text-white/70"}`}>
                {flipped ? "Answer" : "Question"}
              </p>
              <p className={`text-xl font-bold ${flipped ? "text-gray-800" : "text-white"}`}>
                {flipped ? current.back : current.front}
              </p>
              <p className={`text-xs mt-4 ${flipped ? "text-gray-400" : "text-white/60"}`}>Tap to flip</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-5">
            <button onClick={prev} disabled={currentIdx === 0}
              className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm disabled:opacity-40">← Prev</button>
            <button onClick={reshuffle} className="text-sm text-gray-400 underline">Shuffle</button>
            <button onClick={next} disabled={currentIdx === shuffled.length - 1}
              className="px-5 py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-40"
              style={{ backgroundColor: primary }}>Next →</button>
          </div>
        </div>
      ) : null}
    </TemplateShell>
  );
}
