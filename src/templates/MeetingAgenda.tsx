"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface AgendaItem {
  id: string;
  title: string;
  minutes: number;
  notes: string;
  done: boolean;
}

type MeetingMode = "edit" | "running";

export default function MeetingAgenda({ config, spellId }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const storageKey = `incant-${spellId}-agenda`;

  const [items, setItems] = useState<AgendaItem[]>([]);
  const [mode, setMode] = useState<MeetingMode>("edit");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [itemSecondsLeft, setItemSecondsLeft] = useState(0);
  const [meetingSecondsElapsed, setMeetingSecondsElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // New item form
  const [newTitle, setNewTitle] = useState("");
  const [newMinutes, setNewMinutes] = useState(5);
  const [newNotes, setNewNotes] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const save = (updated: AgendaItem[]) => {
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const addItem = () => {
    if (!newTitle.trim()) return;
    save([
      ...items,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: newTitle.trim(),
        minutes: newMinutes,
        notes: newNotes.trim(),
        done: false,
      },
    ]);
    setNewTitle("");
    setNewMinutes(5);
    setNewNotes("");
  };

  const deleteItem = (id: string) => save(items.filter((i) => i.id !== id));

  const totalMinutes = items.reduce((s, i) => s + i.minutes, 0);

  // Meeting running mode
  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setTimerRunning(false);
  }, []);

  const startMeeting = () => {
    if (items.length === 0) return;
    const firstUndone = items.findIndex((i) => !i.done);
    const idx = firstUndone >= 0 ? firstUndone : 0;
    setCurrentIdx(idx);
    setItemSecondsLeft(items[idx].minutes * 60);
    setMeetingSecondsElapsed(0);
    setMode("running");
    setTimerRunning(true);
  };

  useEffect(() => {
    if (mode === "running" && timerRunning) {
      intervalRef.current = setInterval(() => {
        setItemSecondsLeft((prev) => Math.max(0, prev - 1));
        setMeetingSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [mode, timerRunning, stopTimer]);

  const nextItem = () => {
    // Mark current done
    const updated = items.map((item, idx) =>
      idx === currentIdx ? { ...item, done: true } : item
    );
    save(updated);
    const next = currentIdx + 1;
    if (next >= items.length) {
      // Done
      stopTimer();
      setMode("edit");
      return;
    }
    setCurrentIdx(next);
    setItemSecondsLeft(updated[next].minutes * 60);
    setTimerRunning(true);
  };

  const endMeeting = () => {
    stopTimer();
    setMode("edit");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const exportText = () => {
    const lines = [
      `Meeting: ${config.name}`,
      `Total time: ${totalMinutes} min`,
      "",
      ...items.map((item, i) => [
        `${i + 1}. ${item.title} (${item.minutes} min)`,
        item.notes ? `   Notes: ${item.notes}` : null,
      ].filter(Boolean).join("\n")),
    ];
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
  };

  const totalMeetingSeconds = totalMinutes * 60;
  const progressPct =
    totalMeetingSeconds > 0
      ? Math.min(100, (meetingSecondsElapsed / totalMeetingSeconds) * 100)
      : 0;

  const currentItem = items[currentIdx];

  // Edit mode
  if (mode === "edit") {
    return (
      <TemplateShell config={config} icon="📅">
        <div className="p-4 space-y-4">
          {/* Header summary */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ backgroundColor: `${color}12` }}
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">{items.length} agenda items</p>
              <p className="text-xs text-gray-500">Total: {totalMinutes} min</p>
            </div>
            <div className="flex gap-2">
              {items.length > 0 && (
                <button
                  onClick={exportText}
                  className="text-xs px-3 py-1.5 rounded-xl border"
                  style={{ borderColor: color, color }}
                >
                  Copy
                </button>
              )}
              <button
                onClick={startMeeting}
                disabled={items.length === 0}
                className="text-xs px-3 py-1.5 rounded-xl text-white font-medium disabled:opacity-40"
                style={{ backgroundColor: color }}
              >
                Start Meeting
              </button>
            </div>
          </div>

          {/* Item list */}
          <div className="space-y-2">
            {items.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">No agenda items yet.</p>
            )}
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl px-3 py-3 shadow-sm"
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: color }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  {item.notes && <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {item.minutes}m
                  </span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add item form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-gray-700">Add Agenda Item</p>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Topic or item title..."
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2"
              style={{ "--tw-ring-color": color } as React.CSSProperties}
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Time (min)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewMinutes((v) => Math.max(1, v - 1))}
                    className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-200"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums">
                    {newMinutes}
                  </span>
                  <button
                    onClick={() => setNewMinutes((v) => Math.min(120, v + 1))}
                    className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Notes (optional)</label>
                <input
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Brief notes..."
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none"
                />
              </div>
            </div>
            <button
              onClick={addItem}
              disabled={!newTitle.trim()}
              className="w-full py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: color }}
            >
              Add Item
            </button>
          </div>
        </div>
      </TemplateShell>
    );
  }

  // Running mode
  return (
    <TemplateShell config={config} icon="⏱️">
      <div className="p-4 space-y-4">
        {/* Overall progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Meeting progress</span>
            <span>{formatTime(meetingSecondsElapsed)} / {totalMinutes}:00</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, backgroundColor: color }}
            />
          </div>
          <div className="text-xs text-gray-400 text-right">
            Item {currentIdx + 1} of {items.length}
          </div>
        </div>

        {/* Current item */}
        {currentItem && (
          <div
            className="rounded-2xl p-5 text-center space-y-3"
            style={{ backgroundColor: `${color}12` }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Now discussing</p>
            <h2 className="text-xl font-bold text-gray-900">{currentItem.title}</h2>
            {currentItem.notes && (
              <p className="text-sm text-gray-500">{currentItem.notes}</p>
            )}
            <div
              className="text-4xl font-bold tabular-nums"
              style={{ color: itemSecondsLeft <= 60 ? "#dc2626" : color }}
            >
              {formatTime(itemSecondsLeft)}
            </div>
            <div className="h-1.5 bg-white bg-opacity-60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(0, (itemSecondsLeft / (currentItem.minutes * 60)) * 100)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimerRunning((r) => !r)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2"
            style={{ borderColor: color, color }}
          >
            {timerRunning ? "Pause" : "Resume"}
          </button>
          <button
            onClick={nextItem}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium"
            style={{ backgroundColor: color }}
          >
            {currentIdx + 1 >= items.length ? "End Meeting" : "Next Item →"}
          </button>
        </div>

        <button
          onClick={endMeeting}
          className="w-full py-2 rounded-xl text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          End meeting early
        </button>

        {/* Upcoming items */}
        {items.slice(currentIdx + 1).length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500 font-medium">Up next</p>
            {items.slice(currentIdx + 1).map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl"
              >
                <span className="text-xs text-gray-400">{currentIdx + i + 2}.</span>
                <span className="flex-1 text-sm text-gray-600">{item.title}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {item.minutes}m
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
