"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function WaterIntake({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-water`;
  const goal = config.goal || 8;
  const unit = config.unit || "glasses";
  const primary = config.primaryColor || "#3b82f6";

  const [data, setData] = useState<{ date: string; count: number }>({ date: today(), count: 0 });

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today()) {
        setData(parsed);
      } else {
        setData({ date: today(), count: 0 });
      }
    }
  }, [key]);

  const save = (count: number) => {
    const updated = { date: today(), count };
    setData(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const pct = Math.min(100, Math.round((data.count / goal) * 100));

  return (
    <TemplateShell config={config} icon="💧">
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="text-center">
          <span className="text-7xl font-bold" style={{ color: primary }}>{data.count}</span>
          <span className="text-2xl text-gray-400 ml-2">/ {goal}</span>
          <p className="text-gray-500 mt-1 text-sm">{unit} today</p>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: primary }}
          />
        </div>
        <p className="text-sm text-gray-500">{pct}% of daily goal</p>

        {data.count >= goal && (
          <div className="text-center py-2 px-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-green-600 font-medium">🎉 Goal reached! Great hydration today.</p>
          </div>
        )}

        <button
          onClick={() => save(data.count + 1)}
          disabled={data.count >= goal * 2}
          className="w-32 h-32 rounded-full text-white text-5xl shadow-xl active:scale-95 transition-transform disabled:opacity-40"
          style={{ backgroundColor: primary }}
        >
          +
        </button>

        {data.count > 0 && (
          <button onClick={() => save(data.count - 1)} className="text-sm text-gray-400 underline">
            Undo last
          </button>
        )}
      </div>
    </TemplateShell>
  );
}
