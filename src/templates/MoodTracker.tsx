"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface MoodEntry {
  id: string;
  mood: string;
  label: string;
  note: string;
  timestamp: string;
}

const DEFAULT_MOODS = [
  { emoji: "🤩", label: "Excited" },
  { emoji: "😊", label: "Happy" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😤", label: "Stressed" },
  { emoji: "😴", label: "Tired" },
];

export default function MoodTracker({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-moods`;
  const primary = config.primaryColor || "#8b5cf6";
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selected, setSelected] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setEntries(JSON.parse(stored));
  }, [key]);

  const save = (updated: MoodEntry[]) => {
    setEntries(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const addEntry = () => {
    if (!selected) return;
    const mood = DEFAULT_MOODS.find((m) => m.emoji === selected);
    save([
      { id: Date.now().toString(), mood: selected, label: mood?.label || "", note, timestamp: new Date().toISOString() },
      ...entries,
    ]);
    setSelected("");
    setNote("");
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <TemplateShell config={config} icon="😊">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3">How are you feeling?</p>
        <div className="flex gap-2 flex-wrap">
          {DEFAULT_MOODS.map((m) => (
            <button
              key={m.emoji}
              onClick={() => setSelected(m.emoji)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all"
              style={{
                borderColor: selected === m.emoji ? primary : "transparent",
                backgroundColor: selected === m.emoji ? `${primary}15` : "#f9fafb",
              }}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs text-gray-500">{m.label}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-3 flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={addEntry}
              className="px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ backgroundColor: primary }}
            >
              Log
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider">History</p>
        {entries.length === 0 && <p className="text-gray-400 text-sm py-4 text-center">No entries yet.</p>}
        {entries.map((e) => (
          <div key={e.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
            <span className="text-2xl">{e.mood}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">{e.label}</p>
              {e.note && <p className="text-sm text-gray-500">{e.note}</p>}
              <p className="text-xs text-gray-400 mt-0.5">{formatTime(e.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </TemplateShell>
  );
}
