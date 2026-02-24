"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface SleepEntry { id: string; date: string; bedtime: string; wakeTime: string; quality: number; notes: string; duration: number }

function calcDuration(bed: string, wake: string): number {
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60;
  return mins;
}

export default function SleepTracker({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-sleep`;
  const primary = config.primaryColor || "#4f46e5";
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [form, setForm] = useState({ bedtime: "22:00", wakeTime: "07:00", quality: 3, notes: "" });

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setEntries(JSON.parse(stored));
  }, [key]);

  const save = (updated: SleepEntry[]) => {
    setEntries(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const addEntry = () => {
    save([{
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      ...form,
      duration: calcDuration(form.bedtime, form.wakeTime),
    }, ...entries]);
    setForm({ bedtime: "22:00", wakeTime: "07:00", quality: 3, notes: "" });
  };

  const avgDuration = entries.length > 0
    ? Math.round(entries.slice(0, 7).reduce((a, e) => a + e.duration, 0) / Math.min(entries.length, 7))
    : 0;

  return (
    <TemplateShell config={config} icon="😴">
      {entries.length > 0 && (
        <div className="mb-5 p-4 rounded-xl text-white text-center" style={{ backgroundColor: primary }}>
          <p className="text-sm opacity-80">7-day avg sleep</p>
          <p className="text-3xl font-bold">{Math.floor(avgDuration / 60)}h {avgDuration % 60}m</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Bedtime</label>
            <input type="time" value={form.bedtime} onChange={(e) => setForm({ ...form, bedtime: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Wake time</label>
            <input type="time" value={form.wakeTime} onChange={(e) => setForm({ ...form, wakeTime: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none mt-1" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500">Quality</label>
          <div className="flex gap-2 mt-1">
            {[1, 2, 3, 4, 5].map((q) => (
              <button key={q} onClick={() => setForm({ ...form, quality: q })}
                className="text-xl transition-all" style={{ opacity: q <= form.quality ? 1 : 0.3 }}>⭐</button>
            ))}
          </div>
        </div>
        <input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
        <button onClick={addEntry} className="w-full py-2.5 rounded-xl text-white font-medium" style={{ backgroundColor: primary }}>
          Log Sleep
        </button>
      </div>

      <div className="space-y-2">
        {entries.slice(0, 7).map((e) => {
          const dur = `${Math.floor(e.duration / 60)}h ${e.duration % 60}m`;
          return (
            <div key={e.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-700">{e.date}</p>
                <p className="text-xs text-gray-500">{e.bedtime} → {e.wakeTime}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: primary }}>{dur}</p>
                <p className="text-xs">{"⭐".repeat(e.quality)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </TemplateShell>
  );
}
