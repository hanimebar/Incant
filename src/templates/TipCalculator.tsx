"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

export default function TipCalculator({ config }: TemplateProps) {
  const primary = config.primaryColor || "#f59e0b";
  const currency = config.currency || "€";
  const [bill, setBill] = useState("");
  const [tipPct, setTipPct] = useState(15);
  const [people, setPeople] = useState(1);

  const billNum = parseFloat(bill) || 0;
  const tip = billNum * (tipPct / 100);
  const total = billNum + tip;
  const perPerson = people > 0 ? total / people : 0;

  const TIPS = [10, 15, 18, 20, 25];

  return (
    <TemplateShell config={config} icon="🧮">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Bill amount ({currency})</label>
          <input
            type="number"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            placeholder="0.00"
            className="w-full text-3xl font-bold border-b-2 pb-2 outline-none bg-transparent"
            style={{ borderColor: primary }}
          />
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-2 block">Tip %</label>
          <div className="flex gap-2 flex-wrap">
            {TIPS.map((t) => (
              <button
                key={t}
                onClick={() => setTipPct(t)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: tipPct === t ? primary : "#f3f4f6",
                  color: tipPct === t ? "white" : "#374151",
                }}
              >
                {t}%
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">Number of people</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setPeople(Math.max(1, people - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 font-bold text-lg">−</button>
            <span className="text-2xl font-bold w-8 text-center">{people}</span>
            <button onClick={() => setPeople(people + 1)}
              className="w-10 h-10 rounded-full text-white font-bold text-lg" style={{ backgroundColor: primary }}>+</button>
          </div>
        </div>

        <div className="mt-6 p-5 rounded-2xl text-white space-y-3" style={{ backgroundColor: primary }}>
          <div className="flex justify-between text-sm opacity-80">
            <span>Bill</span><span>{currency}{billNum.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm opacity-80">
            <span>Tip ({tipPct}%)</span><span>{currency}{tip.toFixed(2)}</span>
          </div>
          <div className="border-t border-white/30 pt-3 flex justify-between text-lg font-bold">
            <span>Total</span><span>{currency}{total.toFixed(2)}</span>
          </div>
          {people > 1 && (
            <div className="flex justify-between text-xl font-bold border-t border-white/30 pt-3">
              <span>Per person</span><span>{currency}{perPerson.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </TemplateShell>
  );
}
