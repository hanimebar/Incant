"use client";

import { useState, type ReactNode } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Tab = "of" | "is" | "change";

function fmt(n: number): string {
  const fixed = parseFloat(n.toFixed(8));
  return isFinite(fixed) ? String(fixed) : "—";
}

export default function PercentageCalc({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [tab, setTab] = useState<Tab>("of");

  // Tab 1: X% of Y
  const [pct1, setPct1] = useState("");
  const [base1, setBase1] = useState("");
  const result1 = pct1 !== "" && base1 !== "" && !isNaN(+pct1) && !isNaN(+base1)
    ? fmt((+pct1 / 100) * +base1)
    : null;

  // Tab 2: X is what % of Y
  const [x2, setX2] = useState("");
  const [y2, setY2] = useState("");
  const result2 = x2 !== "" && y2 !== "" && !isNaN(+x2) && !isNaN(+y2) && +y2 !== 0
    ? fmt((+x2 / +y2) * 100)
    : null;

  // Tab 3: % change from X to Y
  const [from3, setFrom3] = useState("");
  const [to3, setTo3] = useState("");
  const change3 = from3 !== "" && to3 !== "" && !isNaN(+from3) && !isNaN(+to3) && +from3 !== 0
    ? ((+to3 - +from3) / Math.abs(+from3)) * 100
    : null;

  const tabs = [
    { id: "of" as Tab, label: "X% of Y" },
    { id: "is" as Tab, label: "X is % of Y" },
    { id: "change" as Tab, label: "% Change" },
  ];

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400";

  return (
    <TemplateShell config={config} icon="💯">
      <div className="p-4">
        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-2xl p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: tab === t.id ? color : "transparent",
                color: tab === t.id ? "white" : "#6b7280",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "of" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-700">What is X% of Y?</h2>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pct1}
                onChange={(e) => setPct1(e.target.value)}
                placeholder="X"
                className={inputClass}
              />
              <span className="text-gray-500 font-medium shrink-0">% of</span>
              <input
                type="number"
                value={base1}
                onChange={(e) => setBase1(e.target.value)}
                placeholder="Y"
                className={inputClass}
              />
            </div>
            <ResultBox color={color}>
              {result1 !== null ? (
                <>
                  <span className="text-sm text-gray-500">{pct1}% of {base1} =</span>
                  <span className="text-3xl font-bold" style={{ color }}>{result1}</span>
                </>
              ) : (
                <span className="text-gray-400 text-sm">Enter X and Y above</span>
              )}
            </ResultBox>
          </div>
        )}

        {tab === "is" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-700">X is what percentage of Y?</h2>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={x2}
                onChange={(e) => setX2(e.target.value)}
                placeholder="X"
                className={inputClass}
              />
              <span className="text-gray-500 font-medium shrink-0">is % of</span>
              <input
                type="number"
                value={y2}
                onChange={(e) => setY2(e.target.value)}
                placeholder="Y"
                className={inputClass}
              />
            </div>
            <ResultBox color={color}>
              {result2 !== null ? (
                <>
                  <span className="text-sm text-gray-500">{x2} is</span>
                  <span className="text-3xl font-bold" style={{ color }}>{result2}%</span>
                  <span className="text-sm text-gray-500">of {y2}</span>
                </>
              ) : (
                <span className="text-gray-400 text-sm">Enter X and Y above</span>
              )}
            </ResultBox>
          </div>
        )}

        {tab === "change" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-700">Percentage change from X to Y</h2>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">From (X)</label>
                <input
                  type="number"
                  value={from3}
                  onChange={(e) => setFrom3(e.target.value)}
                  placeholder="Original"
                  className={inputClass}
                />
              </div>
              <span className="text-gray-400 text-xl shrink-0 mt-4">→</span>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">To (Y)</label>
                <input
                  type="number"
                  value={to3}
                  onChange={(e) => setTo3(e.target.value)}
                  placeholder="New"
                  className={inputClass}
                />
              </div>
            </div>
            <ResultBox color={color}>
              {change3 !== null ? (
                <>
                  <span className="text-sm text-gray-500">
                    {change3 >= 0 ? "Increase" : "Decrease"} of
                  </span>
                  <span
                    className="text-3xl font-bold"
                    style={{ color: change3 >= 0 ? "#22c55e" : "#ef4444" }}
                  >
                    {change3 >= 0 ? "+" : ""}{fmt(change3)}%
                  </span>
                  <span className="text-xs text-gray-400">
                    {from3} → {to3}
                  </span>
                </>
              ) : (
                <span className="text-gray-400 text-sm">Enter both values above</span>
              )}
            </ResultBox>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}

function ResultBox({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col items-center gap-1"
      style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30` }}
    >
      {children}
    </div>
  );
}
