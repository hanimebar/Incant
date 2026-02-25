"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Category = "Travel" | "Career" | "Adventure" | "Learning" | "Relationships" | "Other";

const CATEGORIES: { id: Category; emoji: string }[] = [
  { id: "Travel", emoji: "✈️" },
  { id: "Career", emoji: "💼" },
  { id: "Adventure", emoji: "🏔️" },
  { id: "Learning", emoji: "📚" },
  { id: "Relationships", emoji: "❤️" },
  { id: "Other", emoji: "⭐" },
];

interface BucketItem {
  id: string;
  text: string;
  category: Category;
  done: boolean;
}

export default function BucketList({ config, spellId }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const storageKey = `incant-${spellId}-bucketlist`;

  const [items, setItems] = useState<BucketItem[]>([]);
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Travel");
  const [filterCategory, setFilterCategory] = useState<Category | "All">("All");

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, [storageKey]);

  const save = (updated: BucketItem[]) => {
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const addItem = () => {
    if (!input.trim()) return;
    save([
      ...items,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text: input.trim(),
        category: selectedCategory,
        done: false,
      },
    ]);
    setInput("");
  };

  const toggleItem = (id: string) =>
    save(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  const deleteItem = (id: string) => save(items.filter((i) => i.id !== id));

  const filtered =
    filterCategory === "All" ? items : items.filter((i) => i.category === filterCategory);

  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const getCategoryEmoji = (cat: Category) =>
    CATEGORIES.find((c) => c.id === cat)?.emoji ?? "⭐";

  return (
    <TemplateShell config={config} icon="🌟">
      <div className="p-4 space-y-4">
        {/* Progress */}
        {total > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{completed}/{total} completed</span>
              <span className="font-semibold" style={{ color }}>{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )}

        {/* Add item */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3 space-y-2.5 shadow-sm">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Add a bucket list item..."
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2"
            style={{ "--tw-ring-color": color } as React.CSSProperties}
          />
          {/* Category picker */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all"
                style={{
                  backgroundColor: selectedCategory === cat.id ? color : "#f3f4f6",
                  color: selectedCategory === cat.id ? "#fff" : "#6b7280",
                  fontWeight: selectedCategory === cat.id ? 600 : 400,
                }}
              >
                {cat.emoji} {cat.id}
              </button>
            ))}
          </div>
          <button
            onClick={addItem}
            disabled={!input.trim()}
            className="w-full py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: color }}
          >
            Add to Bucket List
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterCategory("All")}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: filterCategory === "All" ? color : "#f3f4f6",
              color: filterCategory === "All" ? "#fff" : "#6b7280",
            }}
          >
            All ({total})
          </button>
          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: filterCategory === cat.id ? color : "#f3f4f6",
                  color: filterCategory === cat.id ? "#fff" : "#6b7280",
                }}
              >
                {cat.emoji} {cat.id} ({count})
              </button>
            );
          })}
        </div>

        {/* Items */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">
              {total === 0 ? "Your bucket list is empty. Start dreaming!" : "No items in this category."}
            </p>
          )}
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-3 py-3 shadow-sm"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{
                  borderColor: item.done ? "#16a34a" : "#d1d5db",
                  backgroundColor: item.done ? "#16a34a" : "transparent",
                }}
              >
                {item.done && <span className="text-white text-xs leading-none">✓</span>}
              </button>
              <span className="text-sm shrink-0">{getCategoryEmoji(item.category)}</span>
              <span
                className={`flex-1 text-sm ${item.done ? "line-through text-gray-400" : "text-gray-800"}`}
              >
                {item.text}
              </span>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-gray-300 hover:text-red-400 text-lg leading-none shrink-0 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </TemplateShell>
  );
}
