"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface Milestone { text: string; done: boolean }
interface Goal { id: string; title: string; description: string; targetDate: string; milestones: Milestone[]; progress: number }

export default function GoalTracker({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-goals`;
  const primary = config.primaryColor || "#6366f1";
  const [goals, setGoals] = useState<Goal[]>([]);
  const [form, setForm] = useState({ title: "", description: "", targetDate: "", milestoneText: "" });
  const [milestones, setMilestones] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setGoals(JSON.parse(stored));
  }, [key]);

  const save = (updated: Goal[]) => {
    setGoals(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const addGoal = () => {
    if (!form.title.trim()) return;
    save([{ id: Date.now().toString(), title: form.title, description: form.description, targetDate: form.targetDate,
      milestones: milestones.map((m) => ({ text: m, done: false })), progress: 0 }, ...goals]);
    setForm({ title: "", description: "", targetDate: "", milestoneText: "" });
    setMilestones([]);
    setShowForm(false);
  };

  const toggleMilestone = (goalId: string, idx: number) => {
    const updated = goals.map((g) => {
      if (g.id !== goalId) return g;
      const ms = g.milestones.map((m, i) => i === idx ? { ...m, done: !m.done } : m);
      const progress = ms.length > 0 ? Math.round((ms.filter((m) => m.done).length / ms.length) * 100) : g.progress;
      return { ...g, milestones: ms, progress };
    });
    save(updated);
  };

  const daysLeft = (date: string) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <TemplateShell config={config} icon="🎯">
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl text-white font-semibold mb-5"
          style={{ backgroundColor: primary }}>+ New Goal</button>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Goal title" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description (optional)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
          <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
          <div className="flex gap-2">
            <input value={form.milestoneText} onChange={(e) => setForm({ ...form, milestoneText: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter" && form.milestoneText.trim()) { setMilestones([...milestones, form.milestoneText.trim()]); setForm({ ...form, milestoneText: "" }); }}}
              placeholder="Add milestone (Enter)" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
          </div>
          {milestones.length > 0 && (
            <div className="space-y-1">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-gray-400">•</span> {m}
                  <button onClick={() => setMilestones(milestones.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 ml-auto">×</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={addGoal} className="flex-1 py-2.5 rounded-xl text-white font-medium text-sm" style={{ backgroundColor: primary }}>Save Goal</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {goals.length === 0 && !showForm && <p className="text-center text-gray-400 text-sm py-8">No goals yet. Add one above.</p>}
        {goals.map((g) => {
          const days = daysLeft(g.targetDate);
          return (
            <div key={g.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button className="w-full px-4 py-3 text-left" onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-gray-800 text-sm">{g.title}</p>
                  {days !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${days < 0 ? "bg-red-100 text-red-600" : days < 7 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                      {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                    </span>
                  )}
                </div>
                <div className="mt-2 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${g.progress}%`, backgroundColor: primary }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{g.progress}% complete</p>
              </button>
              {expanded === g.id && g.milestones.length > 0 && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2">
                  {g.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button onClick={() => toggleMilestone(g.id, i)}
                        className="w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center"
                        style={{ borderColor: primary, backgroundColor: m.done ? primary : "transparent" }}>
                        {m.done && <span className="text-white text-xs">✓</span>}
                      </button>
                      <p className={`text-sm ${m.done ? "line-through text-gray-400" : "text-gray-700"}`}>{m.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TemplateShell>
  );
}
