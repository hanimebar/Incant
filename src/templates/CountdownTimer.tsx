"use client";

import { useState, useEffect, useRef } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

export default function CountdownTimer({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-countdown`;
  const primary = config.primaryColor || "#f59e0b";

  const [targetDate, setTargetDate] = useState<string>(() => {
    if (config.targetDate) return config.targetDate;
    return localStorage.getItem(key) || "";
  });
  const [dateInput, setDateInput] = useState(targetDate.slice(0, 10));
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, reached: false });
  const [celebrating, setCelebrating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calc = (target: string) => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, reached: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      reached: false,
    };
  };

  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const t = calc(targetDate);
      setTimeLeft(t);
      if (t.reached) { setCelebrating(true); if (intervalRef.current) clearInterval(intervalRef.current); }
    };
    update();
    intervalRef.current = setInterval(update, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [targetDate]);

  const setTarget = () => {
    if (!dateInput) return;
    const date = new Date(dateInput).toISOString();
    setTargetDate(date);
    localStorage.setItem(key, date);
    setCelebrating(false);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <TemplateShell config={config} icon="⏱️">
      {celebrating && (
        <div className="text-center py-8">
          <p className="text-6xl mb-3">🎉🎊🥳</p>
          <p className="text-2xl font-bold text-gray-800">Time&apos;s up!</p>
          <p className="text-gray-500 mt-1">{config.name} has arrived!</p>
        </div>
      )}

      {!celebrating && targetDate ? (
        <div className="text-center py-4">
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[{ v: timeLeft.days, l: "Days" }, { v: timeLeft.hours, l: "Hours" }, { v: timeLeft.minutes, l: "Min" }, { v: timeLeft.seconds, l: "Sec" }].map(({ v, l }) => (
              <div key={l} className="rounded-2xl p-4 text-white" style={{ backgroundColor: primary }}>
                <p className="text-4xl font-bold tabular-nums">{pad(v)}</p>
                <p className="text-xs opacity-70 mt-1">{l}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            Until {new Date(targetDate).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <button onClick={() => { setTargetDate(""); localStorage.removeItem(key); }}
            className="mt-4 text-xs text-gray-400 underline">Change date</button>
        </div>
      ) : !celebrating ? (
        <div className="text-center py-8">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-gray-600 mb-4">Set the target date to start counting down</p>
          <div className="flex gap-2 justify-center">
            <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
            <button onClick={setTarget} disabled={!dateInput}
              className="px-6 py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-40"
              style={{ backgroundColor: primary }}>Start</button>
          </div>
        </div>
      ) : null}
    </TemplateShell>
  );
}
