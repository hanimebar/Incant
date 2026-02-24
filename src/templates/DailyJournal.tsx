"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface Entry { date: string; content: string; mood: string }

const MOODS = ["🤩", "😊", "😐", "😔", "😤"];

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (iso === today) return "Today";
  if (iso === yesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function DailyJournal({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-journal`;
  const primary = config.primaryColor || "#8b5cf6";
  const today = new Date().toISOString().slice(0, 10);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [todayContent, setTodayContent] = useState("");
  const [todayMood, setTodayMood] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      setEntries(parsed);
      if (parsed[today]) {
        setTodayContent(parsed[today].content);
        setTodayMood(parsed[today].mood);
      }
    }
  }, [key, today]);

  const saveToday = () => {
    const updated = { ...entries, [today]: { date: today, content: todayContent, mood: todayMood } };
    setEntries(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const pastEntries = Object.values(entries).filter((e) => e.date !== today).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <TemplateShell config={config} icon="📓">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-700">Today — {formatDate(today)}</h2>
          <div className="flex gap-1">
            {MOODS.map((m) => (
              <button key={m} onClick={() => setTodayMood(m)}
                className="text-xl transition-all"
                style={{ opacity: todayMood === m ? 1 : 0.35 }}>{m}</button>
            ))}
          </div>
        </div>
        <textarea
          value={todayContent}
          onChange={(e) => setTodayContent(e.target.value)}
          onBlur={saveToday}
          placeholder="How was your day? Write anything..."
          rows={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-indigo-300"
          style={{ borderColor: todayContent ? primary : undefined }}
        />
        <button onClick={saveToday}
          className="mt-2 px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: primary }}>
          Save
        </button>
      </div>

      {pastEntries.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Past entries</p>
          <div className="space-y-2">
            {pastEntries.map((e) => (
              <div key={e.date} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button className="w-full flex items-center justify-between px-4 py-3 text-left"
                  onClick={() => setExpanded(expanded === e.date ? null : e.date)}>
                  <span className="text-sm font-medium text-gray-700">{formatDate(e.date)}</span>
                  <span className="flex items-center gap-2">
                    {e.mood && <span>{e.mood}</span>}
                    <span className="text-gray-400 text-xs">{expanded === e.date ? "▲" : "▼"}</span>
                  </span>
                </button>
                {expanded === e.date && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2">{e.content || <em className="text-gray-400">No content</em>}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </TemplateShell>
  );
}
