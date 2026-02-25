"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface Item {
  id: string;
  text: string;
}

export default function ProsConsList({ config, spellId }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const storageKey = `incant-${spellId}-proscons`;

  const [pros, setPros] = useState<Item[]>([]);
  const [cons, setCons] = useState<Item[]>([]);
  const [title, setTitle] = useState(config.name || "My Decision");
  const [proInput, setProInput] = useState("");
  const [conInput, setConInput] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.pros) setPros(data.pros);
        if (data.cons) setCons(data.cons);
        if (data.title) setTitle(data.title);
      } catch {
        // ignore
      }
    }
  }, [storageKey]);

  const save = (newPros: Item[], newCons: Item[], newTitle: string) => {
    localStorage.setItem(storageKey, JSON.stringify({ pros: newPros, cons: newCons, title: newTitle }));
  };

  const addPro = () => {
    if (!proInput.trim()) return;
    const newPros = [...pros, { id: Date.now().toString(), text: proInput.trim() }];
    setPros(newPros);
    save(newPros, cons, title);
    setProInput("");
  };

  const addCon = () => {
    if (!conInput.trim()) return;
    const newCons = [...cons, { id: Date.now().toString(), text: conInput.trim() }];
    setCons(newCons);
    save(pros, newCons, title);
    setConInput("");
  };

  const deletePro = (id: string) => {
    const newPros = pros.filter((p) => p.id !== id);
    setPros(newPros);
    save(newPros, cons, title);
  };

  const deleteCon = (id: string) => {
    const newCons = cons.filter((c) => c.id !== id);
    setCons(newCons);
    save(pros, newCons, title);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    save(pros, cons, val);
  };

  const proCount = pros.length;
  const conCount = cons.length;

  let verdict = "Balanced";
  let verdictColor = "#6b7280";
  if (proCount > conCount) {
    verdict = `Leaning towards Pros`;
    verdictColor = "#16a34a";
  } else if (conCount > proCount) {
    verdict = `Leaning towards Cons`;
    verdictColor = "#dc2626";
  }

  return (
    <TemplateShell config={config} icon="⚖️">
      <div className="p-4 space-y-4">
        {/* Title */}
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full text-center text-lg font-bold text-gray-900 border-b-2 border-dashed border-gray-200 pb-2 bg-transparent outline-none focus:border-current"
          style={{ "--tw-border-opacity": "1" } as React.CSSProperties}
          placeholder="Decision title..."
        />

        {/* Score banner */}
        <div
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: `${color}12`, color: verdictColor }}
        >
          <span className="text-base">⚖️</span>
          <span>
            {proCount} Pros vs {conCount} Cons — {verdict}
          </span>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-2 gap-3">
          {/* Pros */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">✅</span>
              <span className="font-semibold text-sm text-green-700">Pros</span>
              <span className="ml-auto text-xs font-bold text-white bg-green-500 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {proCount}
              </span>
            </div>
            {pros.map((p) => (
              <div
                key={p.id}
                className="flex items-start gap-1.5 bg-green-50 border border-green-100 rounded-xl px-2.5 py-2"
              >
                <span className="flex-1 text-xs text-gray-700 break-words leading-snug">{p.text}</span>
                <button
                  onClick={() => deletePro(p.id)}
                  className="text-gray-300 hover:text-red-400 text-base leading-none shrink-0 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex gap-1">
              <input
                value={proInput}
                onChange={(e) => setProInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPro()}
                placeholder="Add pro..."
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-green-400 min-w-0"
              />
              <button
                onClick={addPro}
                disabled={!proInput.trim()}
                className="text-white text-sm px-2 rounded-lg disabled:opacity-40 bg-green-500 hover:bg-green-600 transition-colors shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* Cons */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">❌</span>
              <span className="font-semibold text-sm text-red-700">Cons</span>
              <span className="ml-auto text-xs font-bold text-white bg-red-500 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {conCount}
              </span>
            </div>
            {cons.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-xl px-2.5 py-2"
              >
                <span className="flex-1 text-xs text-gray-700 break-words leading-snug">{c.text}</span>
                <button
                  onClick={() => deleteCon(c.id)}
                  className="text-gray-300 hover:text-red-400 text-base leading-none shrink-0 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex gap-1">
              <input
                value={conInput}
                onChange={(e) => setConInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCon()}
                placeholder="Add con..."
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-red-400 min-w-0"
              />
              <button
                onClick={addCon}
                disabled={!conInput.trim()}
                className="text-white text-sm px-2 rounded-lg disabled:opacity-40 bg-red-500 hover:bg-red-600 transition-colors shrink-0"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </TemplateShell>
  );
}
