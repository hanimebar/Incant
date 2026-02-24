"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDates: string[];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function HabitTracker({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-habits`;
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const primary = config.primaryColor || "#6366f1";

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setHabits(JSON.parse(stored));
  }, [key]);

  const save = (updated: Habit[]) => {
    setHabits(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const toggle = (id: string) => {
    const t = today();
    save(habits.map((h) => {
      if (h.id !== id) return h;
      const done = h.completedDates.includes(t);
      const newDates = done
        ? h.completedDates.filter((d) => d !== t)
        : [...h.completedDates, t];
      const streak = done ? Math.max(0, h.streak - 1) : h.streak + 1;
      return { ...h, completedDates: newDates, streak };
    }));
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    save([...habits, { id: Date.now().toString(), name: newHabit.trim(), streak: 0, completedDates: [] }]);
    setNewHabit("");
  };

  const deleteHabit = (id: string) => save(habits.filter((h) => h.id !== id));

  return (
    <TemplateShell config={config} icon="✅">
      <div className="space-y-3">
        {habits.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No habits yet. Add one below.</p>
        )}
        {habits.map((h) => {
          const done = h.completedDates.includes(today());
          return (
            <div key={h.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <button
                onClick={() => toggle(h.id)}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{ borderColor: primary, backgroundColor: done ? primary : "transparent" }}
              >
                {done && <span className="text-white text-xs">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${done ? "line-through text-gray-400" : "text-gray-800"}`}>{h.name}</p>
                <p className="text-xs text-gray-400">🔥 {h.streak} day streak</p>
              </div>
              <button onClick={() => deleteHabit(h.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-2">
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
          placeholder="New habit..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2"
          style={{ "--tw-ring-color": primary } as React.CSSProperties}
        />
        <button
          onClick={addHabit}
          disabled={!newHabit.trim()}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40"
          style={{ backgroundColor: primary }}
        >
          Add
        </button>
      </div>
    </TemplateShell>
  );
}
