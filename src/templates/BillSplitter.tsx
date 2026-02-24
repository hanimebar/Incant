"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

export default function BillSplitter({ config }: TemplateProps) {
  const primary = config.primaryColor || "#06b6d4";
  const currency = config.currency || "€";
  const [total, setTotal] = useState("");
  const [tip, setTip] = useState(0);
  const [people, setPeople] = useState<string[]>(["Alice", "Bob"]);
  const [newPerson, setNewPerson] = useState("");
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<"equal" | "custom">("equal");

  const totalNum = parseFloat(total) || 0;
  const withTip = totalNum * (1 + tip / 100);
  const equalShare = people.length > 0 ? withTip / people.length : 0;

  const addPerson = () => {
    if (!newPerson.trim() || people.includes(newPerson.trim())) return;
    setPeople([...people, newPerson.trim()]);
    setNewPerson("");
  };

  return (
    <TemplateShell config={config} icon="🍕">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">Total bill ({currency})</label>
          <input type="number" value={total} onChange={(e) => setTotal(e.target.value)}
            placeholder="0.00" className="w-full text-3xl font-bold border-b-2 pb-2 outline-none bg-transparent mt-1"
            style={{ borderColor: primary }} />
        </div>

        <div>
          <label className="text-sm text-gray-500">Tip</label>
          <div className="flex gap-2 mt-1">
            {[0, 10, 15, 20].map((t) => (
              <button key={t} onClick={() => setTip(t)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{ backgroundColor: tip === t ? primary : "#f3f4f6", color: tip === t ? "white" : "#374151" }}>
                {t === 0 ? "No tip" : `${t}%`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500">People</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {people.map((p) => (
              <div key={p} className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm">
                {p}
                <button onClick={() => setPeople(people.filter((x) => x !== p))} className="text-gray-400 hover:text-red-400 ml-1">×</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input value={newPerson} onChange={(e) => setNewPerson(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPerson()}
              placeholder="Add person..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
            <button onClick={addPerson} className="px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: primary }}>Add</button>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setMode("equal")}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ backgroundColor: mode === "equal" ? primary : "#f3f4f6", color: mode === "equal" ? "white" : "#374151" }}>
            Equal split
          </button>
          <button onClick={() => setMode("custom")}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ backgroundColor: mode === "custom" ? primary : "#f3f4f6", color: mode === "custom" ? "white" : "#374151" }}>
            Custom
          </button>
        </div>

        <div className="p-4 rounded-2xl space-y-2" style={{ backgroundColor: `${primary}15` }}>
          {people.map((p) => (
            <div key={p} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{p}</span>
              {mode === "equal" ? (
                <span className="font-bold" style={{ color: primary }}>{currency}{equalShare.toFixed(2)}</span>
              ) : (
                <input type="number" placeholder={equalShare.toFixed(2)}
                  value={customAmounts[p] || ""}
                  onChange={(e) => setCustomAmounts({ ...customAmounts, [p]: e.target.value })}
                  className="w-24 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none" />
              )}
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-semibold text-gray-500">
            <span>Total{tip > 0 ? ` (incl. ${tip}% tip)` : ""}</span>
            <span>{currency}{withTip.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </TemplateShell>
  );
}
