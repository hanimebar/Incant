"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface Contribution { id: string; amount: number; note: string; date: string }

export default function SavingsGoal({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-savings`;
  const primary = config.primaryColor || "#10b981";
  const currency = config.currency || "€";
  const goal = config.goal || 1000;
  const [contribs, setContribs] = useState<Contribution[]>([]);
  const [form, setForm] = useState({ amount: "", note: "" });

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setContribs(JSON.parse(stored));
  }, [key]);

  const save = (updated: Contribution[]) => {
    setContribs(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const total = contribs.reduce((s, c) => s + c.amount, 0);
  const pct = Math.min(100, Math.round((total / goal) * 100));
  const reached = total >= goal;

  const add = () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) return;
    save([{ id: Date.now().toString(), amount: parseFloat(form.amount), note: form.note, date: new Date().toLocaleDateString() }, ...contribs]);
    setForm({ amount: "", note: "" });
  };

  return (
    <TemplateShell config={config} icon="🏦">
      <div className="mb-6 p-5 rounded-2xl text-white" style={{ backgroundColor: primary }}>
        <p className="text-sm opacity-80 mb-1">Saved so far</p>
        <p className="text-4xl font-bold">{currency}{total.toFixed(2)}</p>
        <p className="text-sm opacity-70">of {currency}{goal.toFixed(2)} goal</p>
        <div className="mt-3 bg-white/20 rounded-full h-3 overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs opacity-70 mt-1">{pct}% complete</p>
      </div>

      {reached && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-bold text-yellow-700">Goal reached! Amazing work!</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 space-y-2">
        <div className="flex gap-2">
          <input type="number" placeholder={`Amount (${currency})`} value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
          <input placeholder="Note (optional)" value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
        </div>
        <button onClick={add} className="w-full py-2.5 rounded-xl text-white font-medium" style={{ backgroundColor: primary }}>
          Add Contribution
        </button>
      </div>

      <div className="space-y-2">
        {contribs.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">{c.note || "Contribution"}</p>
              <p className="text-xs text-gray-400">{c.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: primary }}>+{currency}{c.amount.toFixed(2)}</span>
              <button onClick={() => save(contribs.filter((x) => x.id !== c.id))} className="text-gray-300 hover:text-red-400">×</button>
            </div>
          </div>
        ))}
      </div>
    </TemplateShell>
  );
}
