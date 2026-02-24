"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface Exercise { name: string; sets: string; reps: string; weight: string }
interface Session { id: string; date: string; exercises: Exercise[] }

export default function WorkoutLog({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-workout`;
  const primary = config.primaryColor || "#ef4444";
  const weightUnit = config.unit || "kg";

  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<Session | null>(null);
  const [form, setForm] = useState<Exercise>({ name: "", sets: "", reps: "", weight: "" });

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setSessions(JSON.parse(stored));
  }, [key]);

  const saveSessions = (updated: Session[]) => {
    setSessions(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const startSession = () =>
    setActive({ id: Date.now().toString(), date: new Date().toLocaleDateString(), exercises: [] });

  const addExercise = () => {
    if (!form.name.trim() || !active) return;
    setActive({ ...active, exercises: [...active.exercises, form] });
    setForm({ name: "", sets: "", reps: "", weight: "" });
  };

  const finishSession = () => {
    if (!active || active.exercises.length === 0) { setActive(null); return; }
    saveSessions([active, ...sessions]);
    setActive(null);
  };

  return (
    <TemplateShell config={config} icon="💪">
      {!active ? (
        <>
          <button
            onClick={startSession}
            className="w-full py-3 rounded-xl text-white font-semibold mb-6"
            style={{ backgroundColor: primary }}
          >
            + Start Session
          </button>
          <div className="space-y-3">
            {sessions.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No sessions yet.</p>}
            {sessions.map((s) => (
              <div key={s.id} className="p-4 bg-white rounded-xl border border-gray-100">
                <p className="font-semibold text-gray-700 mb-2">📅 {s.date}</p>
                <div className="space-y-1">
                  {s.exercises.map((ex, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {ex.name} — {ex.sets}×{ex.reps} @ {ex.weight}{weightUnit}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 p-3 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: primary }}>
            Active session — {active.date}
          </div>

          {active.exercises.length > 0 && (
            <div className="mb-4 space-y-1">
              {active.exercises.map((ex, i) => (
                <div key={i} className="text-sm text-gray-600 flex justify-between">
                  <span>{ex.name}</span>
                  <span>{ex.sets}×{ex.reps} @ {ex.weight}{weightUnit}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 mb-4">
            <input placeholder="Exercise name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Sets" value={form.sets} onChange={(e) => setForm({ ...form, sets: e.target.value })}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none text-center" />
              <input placeholder="Reps" value={form.reps} onChange={(e) => setForm({ ...form, reps: e.target.value })}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none text-center" />
              <input placeholder={weightUnit} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none text-center" />
            </div>
            <button onClick={addExercise} className="w-full py-2 rounded-xl text-sm text-white" style={{ backgroundColor: primary }}>
              + Add Exercise
            </button>
          </div>

          <button
            onClick={finishSession}
            className="w-full py-3 rounded-xl border-2 font-semibold text-sm transition-all"
            style={{ borderColor: primary, color: primary }}
          >
            Finish Session
          </button>
        </>
      )}
    </TemplateShell>
  );
}
