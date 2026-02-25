"use client";

import { useState, useRef } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

export default function RandomNamePicker({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [namesText, setNamesText] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [animating, setAnimating] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allNames = namesText
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);

  const available = allNames.filter((n) => !removed.includes(n));

  function pickOne() {
    if (animating || available.length === 0) return;
    setPicked(null);
    setAnimating(true);

    let ticks = 0;
    const maxTicks = 18;
    intervalRef.current = setInterval(() => {
      const idx = Math.floor(Math.random() * available.length);
      setFlash(available[idx]);
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(intervalRef.current!);
        const final = available[Math.floor(Math.random() * available.length)];
        setFlash(null);
        setPicked(final);
        setAnimating(false);
      }
    }, 80);
  }

  function removeAndPickAgain() {
    if (!picked) return;
    setRemoved((r) => [...r, picked]);
    setPicked(null);
    // Slight delay so state settles
    setTimeout(() => {
      pickOne();
    }, 50);
  }

  function reset() {
    setRemoved([]);
    setPicked(null);
    setFlash(null);
    setAnimating(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  return (
    <TemplateShell config={config} icon="🎯">
      <div className="flex flex-col gap-5">
        {/* Names textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Names (one per line)
          </label>
          <textarea
            value={namesText}
            onChange={(e) => {
              setNamesText(e.target.value);
              setPicked(null);
              setRemoved([]);
            }}
            rows={5}
            placeholder={"Alice\nBob\nCharlie\nDiana"}
            className="w-full px-3 py-2 rounded-xl border-2 outline-none text-sm text-gray-700 bg-white resize-none"
            style={{ borderColor: `${color}40` }}
          />
          <p className="text-xs text-gray-400 mt-1">
            {available.length} available · {removed.length} removed
          </p>
        </div>

        {/* Pick buttons */}
        <div className="flex gap-2">
          <button
            onClick={pickOne}
            disabled={animating || available.length === 0}
            className="flex-1 py-3 rounded-2xl text-white font-bold text-base shadow-md active:scale-95 transition-transform disabled:opacity-50"
            style={{ backgroundColor: color }}
          >
            {animating ? "Picking…" : "Pick One!"}
          </button>
          {removed.length > 0 && (
            <button
              onClick={reset}
              className="px-4 py-3 rounded-2xl text-sm font-medium bg-gray-100 text-gray-600 active:scale-95 transition-transform"
            >
              Reset
            </button>
          )}
        </div>

        {/* Flashing animation */}
        {animating && flash && (
          <div
            className="text-center py-4 rounded-2xl text-2xl font-black"
            style={{ background: `${color}15`, color, opacity: 0.7 }}
          >
            {flash}
          </div>
        )}

        {/* Winner display */}
        {!animating && picked && (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-full text-center py-5 rounded-2xl shadow-md"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
            >
              <p className="text-white text-sm font-medium opacity-80 mb-1">Selected</p>
              <p className="text-white text-3xl font-black">{picked}</p>
            </div>
            {available.filter((n) => n !== picked).length > 0 && (
              <button
                onClick={removeAndPickAgain}
                className="w-full py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors"
                style={{ borderColor: color, color }}
              >
                Remove &amp; Pick Again
              </button>
            )}
          </div>
        )}

        {/* Removed list */}
        {removed.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">Already picked</p>
            <div className="flex flex-wrap gap-2">
              {removed.map((name, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-sm text-gray-400 bg-gray-100 line-through"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
