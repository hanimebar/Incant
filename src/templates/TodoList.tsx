"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Priority = "high" | "medium" | "low";
interface Todo { id: string; text: string; completed: boolean; priority: Priority; createdAt: string }
type Filter = "all" | "active" | "completed";

const PRIORITY_COLORS: Record<Priority, string> = { high: "#ef4444", medium: "#f59e0b", low: "#6b7280" };

export default function TodoList({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-todos`;
  const primary = config.primaryColor || "#6366f1";
  const [items, setItems] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setItems(JSON.parse(stored));
  }, [key]);

  const save = (updated: Todo[]) => {
    setItems(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const add = () => {
    if (!text.trim()) return;
    save([{ id: Date.now().toString(), text: text.trim(), completed: false, priority, createdAt: new Date().toISOString() }, ...items]);
    setText("");
  };

  const toggle = (id: string) => save(items.map((i) => i.id === id ? { ...i, completed: !i.completed } : i));
  const del = (id: string) => save(items.filter((i) => i.id !== id));

  const filtered = items.filter((i) =>
    filter === "all" ? true : filter === "active" ? !i.completed : i.completed
  );

  const doneCount = items.filter((i) => i.completed).length;

  return (
    <TemplateShell config={config} icon="📋">
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <span>{doneCount}/{items.length} completed</span>
        {doneCount > 0 && (
          <button onClick={() => save(items.filter((i) => !i.completed))}
            className="ml-auto text-xs text-red-400 hover:text-red-600">Clear done</button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "active", "completed"] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="flex-1 py-1.5 rounded-xl text-xs font-medium transition-all capitalize"
            style={{ backgroundColor: filter === f ? primary : "#f3f4f6", color: filter === f ? "white" : "#6b7280" }}>
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a task..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}
          className="border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none bg-white">
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Med</option>
          <option value="low">⚪ Low</option>
        </select>
        <button onClick={add} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: primary }}>Add</button>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-6">Nothing here.</p>}
        {filtered.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
            <button onClick={() => toggle(item.id)}
              className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all"
              style={{ borderColor: primary, backgroundColor: item.completed ? primary : "transparent" }}>
              {item.completed && <span className="text-white text-xs">✓</span>}
            </button>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[item.priority] }} />
            <p className={`flex-1 text-sm ${item.completed ? "line-through text-gray-400" : "text-gray-700"}`}>{item.text}</p>
            <button onClick={() => del(item.id)} className="text-gray-300 hover:text-red-400 shrink-0">×</button>
          </div>
        ))}
      </div>
    </TemplateShell>
  );
}
