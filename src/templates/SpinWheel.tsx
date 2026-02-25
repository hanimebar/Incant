"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const PALETTE = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#6366f1", "#a855f7", "#ec4899",
  "#14b8a6", "#f59e0b", "#84cc16", "#3b82f6",
];

export default function SpinWheel({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  const [options, setOptions] = useState(["Option 1", "Option 2", "Option 3"]);
  const [newOption, setNewOption] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);

  const drawWheel = useCallback(
    (currentAngle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const size = canvas.width;
      const cx = size / 2;
      const cy = size / 2;
      const radius = size / 2 - 4;
      const n = options.length;
      if (n === 0) return;

      ctx.clearRect(0, 0, size, size);
      const arc = (2 * Math.PI) / n;

      for (let i = 0; i < n; i++) {
        const start = currentAngle + i * arc;
        const end = start + arc;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = PALETTE[i % PALETTE.length];
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.max(10, Math.min(14, 120 / n))}px sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 3;
        const label =
          options[i].length > 14 ? options[i].slice(0, 13) + "…" : options[i];
        ctx.fillText(label, radius - 12, 5);
        ctx.restore();
      }

      // Centre hub
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    [options]
  );

  useEffect(() => {
    drawWheel(angle);
  }, [drawWheel, angle]);

  function spin() {
    if (spinning || options.length < 2) return;
    setWinner(null);
    setSpinning(true);

    const extraRotations = (3 + Math.random() * 5) * 2 * Math.PI;
    const finalAngle = angle + extraRotations;
    const duration = 3000;
    const start = performance.now();
    const startAngle = angle;

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = startAngle + extraRotations * easeOut(progress);
      setAngle(current);
      drawWheel(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        // Find winner: pointer at top (angle = -PI/2 from positive x-axis)
        const n = options.length;
        const arc = (2 * Math.PI) / n;
        const normalised = ((current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        // Pointer is at top = 3*PI/2 in canvas coords (or -PI/2)
        const pointerAngle = (3 * Math.PI) / 2;
        let idx = Math.floor(
          ((pointerAngle - normalised + 2 * Math.PI) % (2 * Math.PI)) / arc
        ) % n;
        setWinner(options[idx]);
        setSpinning(false);
      }
    }

    animRef.current = requestAnimationFrame(frame);
  }

  useEffect(() => {
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  function addOption() {
    const trimmed = newOption.trim();
    if (!trimmed || options.length >= 12) return;
    setOptions((o) => [...o, trimmed]);
    setNewOption("");
    setWinner(null);
  }

  function removeOption(i: number) {
    setOptions((o) => o.filter((_, idx) => idx !== i));
    setWinner(null);
  }

  return (
    <TemplateShell config={config} icon="🎡">
      <div className="flex flex-col items-center gap-5">
        {/* Pointer + Canvas */}
        <div className="relative">
          {/* Pointer triangle at top */}
          <div
            className="absolute left-1/2 -top-2 z-10"
            style={{ transform: "translateX(-50%)" }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: `20px solid ${color}`,
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
              }}
            />
          </div>
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="rounded-full shadow-xl"
            style={{ touchAction: "none" }}
          />
        </div>

        {/* Winner banner */}
        {winner && !spinning && (
          <div
            className="w-full py-3 px-4 rounded-2xl text-center text-lg font-bold shadow-md"
            style={{ background: color, color: "#fff" }}
          >
            🎉 {winner}!
          </div>
        )}

        {/* Spin button */}
        <button
          onClick={spin}
          disabled={spinning || options.length < 2}
          className="w-full py-4 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-60"
          style={{ backgroundColor: color }}
        >
          {spinning ? "Spinning…" : "Spin!"}
        </button>

        {/* Add option */}
        <div className="w-full flex gap-2">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addOption()}
            placeholder="Add an option…"
            className="flex-1 px-3 py-2 rounded-xl border-2 outline-none text-sm bg-white text-gray-700"
            style={{ borderColor: `${color}40` }}
          />
          <button
            onClick={addOption}
            disabled={!newOption.trim() || options.length >= 12}
            className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50"
            style={{ backgroundColor: color }}
          >
            Add
          </button>
        </div>

        {/* Option list */}
        <div className="w-full space-y-1.5">
          {options.map((opt, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: `${PALETTE[i % PALETTE.length]}18` }}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="flex-1 text-sm text-gray-700">{opt}</span>
              <button
                onClick={() => removeOption(i)}
                className="text-gray-400 hover:text-red-400 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {options.length < 2 && (
          <p className="text-sm text-gray-400">Add at least 2 options to spin</p>
        )}
      </div>
    </TemplateShell>
  );
}
