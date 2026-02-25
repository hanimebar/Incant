"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

export default function RandomNumber({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [current, setCurrent] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);

  function generate() {
    if (animating) return;
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    setAnimating(true);
    let ticks = 0;
    const interval = setInterval(() => {
      setCurrent(Math.floor(Math.random() * (hi - lo + 1)) + lo);
      ticks++;
      if (ticks >= 10) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * (hi - lo + 1)) + lo;
        setCurrent(final);
        setHistory((h) => [final, ...h].slice(0, 5));
        setAnimating(false);
      }
    }, 60);
  }

  const inputClass =
    "w-full border-2 rounded-xl px-3 py-2 text-lg font-medium outline-none bg-transparent text-gray-800 focus:border-opacity-100 transition-colors";

  return (
    <TemplateShell config={config} icon="🎲">
      <div className="flex flex-col gap-6">
        {/* Range inputs */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-500 mb-1 font-medium">Min</label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              className={inputClass}
              style={{ borderColor: `${color}60` }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-500 mb-1 font-medium">Max</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className={inputClass}
              style={{ borderColor: `${color}60` }}
            />
          </div>
        </div>

        {/* Big number display */}
        <div
          className="flex items-center justify-center rounded-3xl py-10"
          style={{ background: `${color}12` }}
        >
          {current !== null ? (
            <span
              className="font-black leading-none tabular-nums"
              style={{
                fontSize: "clamp(4rem, 20vw, 8rem)",
                color,
                opacity: animating ? 0.5 : 1,
                transition: "opacity 0.05s",
              }}
            >
              {current}
            </span>
          ) : (
            <span className="text-5xl text-gray-300 font-black select-none">?</span>
          )}
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={animating}
          className="w-full py-4 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-60"
          style={{ backgroundColor: color }}
        >
          {animating ? "Generating…" : "Generate"}
        </button>

        {/* History */}
        {history.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Last {history.length}</p>
            <div className="flex gap-2 flex-wrap">
              {history.map((n, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl text-sm font-bold"
                  style={{
                    background: i === 0 ? `${color}20` : "#f3f4f6",
                    color: i === 0 ? color : "#6b7280",
                    border: i === 0 ? `1px solid ${color}40` : "1px solid transparent",
                  }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
