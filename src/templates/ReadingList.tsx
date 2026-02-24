"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Status = "to-read" | "reading" | "finished";
interface Book { id: string; title: string; author: string; status: Status; rating: number; addedAt: string }

export default function ReadingList({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-books`;
  const primary = config.primaryColor || "#f97316";
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState({ title: "", author: "" });
  const [activeTab, setActiveTab] = useState<Status>("to-read");

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setBooks(JSON.parse(stored));
  }, [key]);

  const save = (updated: Book[]) => {
    setBooks(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const add = () => {
    if (!form.title.trim()) return;
    save([{ id: Date.now().toString(), ...form, status: "to-read", rating: 0, addedAt: new Date().toISOString() }, ...books]);
    setForm({ title: "", author: "" });
  };

  const moveTo = (id: string, status: Status) => save(books.map((b) => b.id === id ? { ...b, status } : b));
  const rate = (id: string, rating: number) => save(books.map((b) => b.id === id ? { ...b, rating } : b));
  const del = (id: string) => save(books.filter((b) => b.id !== id));

  const tabs: { key: Status; label: string; emoji: string }[] = [
    { key: "to-read", label: "To Read", emoji: "📚" },
    { key: "reading", label: "Reading", emoji: "📖" },
    { key: "finished", label: "Done", emoji: "✅" },
  ];

  const filtered = books.filter((b) => b.status === activeTab);

  return (
    <TemplateShell config={config} icon="📚">
      <div className="flex gap-2 mb-5">
        {tabs.map(({ key: k, label, emoji }) => (
          <button key={k} onClick={() => setActiveTab(k)}
            className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ backgroundColor: activeTab === k ? primary : "#f3f4f6", color: activeTab === k ? "white" : "#6b7280" }}>
            {emoji} {label} ({books.filter((b) => b.status === k).length})
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        <div className="flex-1 space-y-2">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Book title" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
          <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Author (optional)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
        </div>
        <button onClick={add} disabled={!form.title.trim()}
          className="px-4 py-2 rounded-xl text-white text-sm font-medium self-stretch disabled:opacity-40"
          style={{ backgroundColor: primary }}>Add</button>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No books here.</p>}
        {filtered.map((b) => (
          <div key={b.id} className="p-3 bg-white rounded-xl border border-gray-100">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">{b.title}</p>
                {b.author && <p className="text-xs text-gray-500">{b.author}</p>}
                {b.status === "finished" && (
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} onClick={() => rate(b.id, s)}
                        className="text-base transition-opacity"
                        style={{ opacity: s <= b.rating ? 1 : 0.25 }}>⭐</button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => del(b.id)} className="text-gray-300 hover:text-red-400 shrink-0">×</button>
            </div>
            <div className="flex gap-1 mt-2">
              {tabs.filter((t) => t.key !== b.status).map(({ key: k, label }) => (
                <button key={k} onClick={() => moveTo(b.id, k)}
                  className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                  → {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TemplateShell>
  );
}
