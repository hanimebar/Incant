"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Frequency = "daily" | "weekdays" | "weekly";
interface Reminder { id: string; message: string; time: string; frequency: Frequency; active: boolean }

function nextTriggerLabel(time: string, frequency: Frequency): string {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const diff = next.getTime() - now.getTime();
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs === 0) return `in ${mins}m`;
  return `in ${hrs}h ${mins}m`;
}

export default function CustomReminder({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-reminders`;
  const primary = config.primaryColor || "#f59e0b";
  const defaultMsg = (config.customData as Record<string, string>)?.message || "";
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [form, setForm] = useState({ message: defaultMsg, time: "09:00", frequency: "daily" as Frequency });
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setReminders(JSON.parse(stored));
    if ("Notification" in window) setPermission(Notification.permission);
  }, [key]);

  const save = (updated: Reminder[]) => {
    setReminders(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const requestPermission = async () => {
    const perm = await Notification.requestPermission();
    setPermission(perm);
  };

  const addReminder = () => {
    if (!form.message.trim()) return;
    save([...reminders, { id: Date.now().toString(), ...form, active: true }]);
    setForm({ message: "", time: "09:00", frequency: "daily" });
  };

  const toggle = (id: string) => save(reminders.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  const del = (id: string) => save(reminders.filter((r) => r.id !== id));

  const FREQ_LABELS: Record<Frequency, string> = { daily: "Every day", weekdays: "Weekdays", weekly: "Weekly" };

  return (
    <TemplateShell config={config} icon="🔔">
      {permission === "default" && "Notification" in window && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Enable notifications</p>
            <p className="text-xs text-amber-600">Allow notifications to receive reminders</p>
          </div>
          <button onClick={requestPermission}
            className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
            style={{ backgroundColor: primary }}>Enable</button>
        </div>
      )}

      {permission === "denied" && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">Notifications blocked. Enable in browser settings.</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 space-y-2">
        <input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Reminder message..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
        <div className="flex gap-2">
          <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
            {(Object.keys(FREQ_LABELS) as Frequency[]).map((f) => <option key={f} value={f}>{FREQ_LABELS[f]}</option>)}
          </select>
        </div>
        <button onClick={addReminder} disabled={!form.message.trim()}
          className="w-full py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-40"
          style={{ backgroundColor: primary }}>
          Add Reminder
        </button>
      </div>

      <div className="space-y-2">
        {reminders.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No reminders yet.</p>}
        {reminders.map((r) => (
          <div key={r.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
            <button
              onClick={() => toggle(r.id)}
              className="w-12 h-6 rounded-full transition-all shrink-0"
              style={{ backgroundColor: r.active ? primary : "#e5e7eb" }}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${r.active ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{r.message}</p>
              <p className="text-xs text-gray-400">{r.time} · {FREQ_LABELS[r.frequency]} · {r.active ? nextTriggerLabel(r.time, r.frequency) : "paused"}</p>
            </div>
            <button onClick={() => del(r.id)} className="text-gray-300 hover:text-red-400 shrink-0">×</button>
          </div>
        ))}
      </div>
    </TemplateShell>
  );
}
