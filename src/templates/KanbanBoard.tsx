"use client";

import { useState, useEffect, useRef } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type ColumnId = "todo" | "inprogress" | "done";

interface Card {
  id: string;
  text: string;
  column: ColumnId;
}

const COLUMNS: { id: ColumnId; label: string; emoji: string }[] = [
  { id: "todo", label: "To Do", emoji: "📋" },
  { id: "inprogress", label: "In Progress", emoji: "⚡" },
  { id: "done", label: "Done", emoji: "✅" },
];

export default function KanbanBoard({ config, spellId }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const storageKey = `incant-${spellId}-kanban`;

  const [cards, setCards] = useState<Card[]>([]);
  const [inputs, setInputs] = useState<Record<ColumnId, string>>({
    todo: "",
    inprogress: "",
    done: "",
  });
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<ColumnId | null>(null);
  const dragCardRef = useRef<Card | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setCards(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, [storageKey]);

  const save = (updated: Card[]) => {
    setCards(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const addCard = (col: ColumnId) => {
    const text = inputs[col].trim();
    if (!text) return;
    save([
      ...cards,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text, column: col },
    ]);
    setInputs((prev) => ({ ...prev, [col]: "" }));
  };

  const deleteCard = (id: string) => save(cards.filter((c) => c.id !== id));

  // Drag handlers
  const onDragStart = (e: React.DragEvent, card: Card) => {
    setDragId(card.id);
    dragCardRef.current = card;
    e.dataTransfer.effectAllowed = "move";
    // Small visual trick: set opacity via ghost
    (e.currentTarget as HTMLElement).style.opacity = "0.5";
  };

  const onDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    setDragId(null);
    setDragOver(null);
    dragCardRef.current = null;
  };

  const onDragOver = (e: React.DragEvent, col: ColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(col);
  };

  const onDrop = (e: React.DragEvent, col: ColumnId) => {
    e.preventDefault();
    if (!dragId) return;
    save(cards.map((c) => (c.id === dragId ? { ...c, column: col } : c)));
    setDragId(null);
    setDragOver(null);
  };

  return (
    <TemplateShell config={config} icon="📌">
      <div className="p-4">
        {/* On mobile: vertical stack; md+: 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const colCards = cards.filter((c) => c.column === col.id);
            const isOver = dragOver === col.id;
            return (
              <div
                key={col.id}
                onDragOver={(e) => onDragOver(e, col.id)}
                onDrop={(e) => onDrop(e, col.id)}
                className="flex flex-col rounded-2xl border-2 transition-colors"
                style={{
                  borderColor: isOver ? color : "#e5e7eb",
                  backgroundColor: isOver ? `${color}08` : "#f9fafb",
                  minHeight: 200,
                }}
              >
                {/* Column header */}
                <div
                  className="px-3 py-2.5 flex items-center justify-between rounded-t-2xl"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{col.emoji}</span>
                    <span className="font-semibold text-sm text-gray-800">{col.label}</span>
                  </div>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white min-w-[20px] text-center"
                    style={{ backgroundColor: color }}
                  >
                    {colCards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {colCards.length === 0 && !isOver && (
                    <p className="text-xs text-gray-300 text-center pt-4">Drop here</p>
                  )}
                  {colCards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, card)}
                      onDragEnd={onDragEnd}
                      className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-start gap-2 shadow-sm cursor-grab active:cursor-grabbing select-none"
                      style={{
                        opacity: dragId === card.id ? 0.4 : 1,
                      }}
                    >
                      <span className="flex-1 text-sm text-gray-700 break-words leading-snug">
                        {card.text}
                      </span>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="text-gray-300 hover:text-red-400 text-lg leading-none shrink-0 transition-colors"
                        aria-label="Delete card"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add input */}
                <div className="p-2 flex gap-1.5 border-t border-gray-100">
                  <input
                    value={inputs[col.id]}
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, [col.id]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && addCard(col.id)}
                    placeholder="Add card..."
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 bg-white"
                    style={{ "--tw-ring-color": color } as React.CSSProperties}
                  />
                  <button
                    onClick={() => addCard(col.id)}
                    disabled={!inputs[col.id].trim()}
                    className="text-white text-sm px-2.5 rounded-lg disabled:opacity-40 transition-colors"
                    style={{ backgroundColor: color }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Drag cards between columns to update status
        </p>
      </div>
    </TemplateShell>
  );
}
