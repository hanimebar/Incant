"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Direction = "horizontal" | "vertical" | "diagonal-down" | "diagonal-up" | "radial";

const DIR_MAP: Record<Direction, string> = {
  horizontal: "to right",
  vertical: "to bottom",
  "diagonal-down": "135deg",
  "diagonal-up": "45deg",
  radial: "radial",
};

const DIR_LABELS: { id: Direction; label: string }[] = [
  { id: "horizontal", label: "→ Horizontal" },
  { id: "vertical", label: "↓ Vertical" },
  { id: "diagonal-down", label: "↘ Diagonal" },
  { id: "diagonal-up", label: "↗ Diagonal" },
  { id: "radial", label: "◎ Radial" },
];

function buildGradient(dir: Direction, angle: number, colors: string[]): string {
  const stops = colors.join(", ");
  if (dir === "radial") {
    return `radial-gradient(circle, ${stops})`;
  }
  const isAngleDeg = dir === "horizontal" || dir === "vertical" || dir === "diagonal-down" || dir === "diagonal-up";
  if (isAngleDeg) {
    // Use angle slider for linear directions
    return `linear-gradient(${angle}deg, ${stops})`;
  }
  return `linear-gradient(${DIR_MAP[dir]}, ${stops})`;
}

function buildCss(dir: Direction, angle: number, colors: string[]): string {
  const stops = colors.join(", ");
  if (dir === "radial") {
    return `background: radial-gradient(circle, ${stops});`;
  }
  return `background: linear-gradient(${angle}deg, ${stops});`;
}

export default function GradientMaker({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const [color1, setColor1] = useState("#6366f1");
  const [color2, setColor2] = useState("#f5c518");
  const [color3, setColor3] = useState("#ec4899");
  const [useThird, setUseThird] = useState(false);
  const [direction, setDirection] = useState<Direction>("horizontal");
  const [angle, setAngle] = useState(90);
  const [copied, setCopied] = useState(false);

  const colors = useThird ? [color1, color3, color2] : [color1, color2];
  const gradient = buildGradient(direction, angle, colors);
  const css = buildCss(direction, angle, colors);

  const copy = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
      <label className="block text-xs text-gray-500 font-medium mb-1">{label}</label>
      <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-2 bg-white">
        <div
          className="w-9 h-9 rounded-lg shrink-0 overflow-hidden relative border border-gray-200"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          className="flex-1 text-sm font-mono outline-none min-w-0"
        />
      </div>
    </div>
  );

  return (
    <TemplateShell config={config} icon="🌈">
      <div className="p-4">
        {/* Colour pickers */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <ColorPicker label="Colour 1" value={color1} onChange={setColor1} />
          <ColorPicker label="Colour 2" value={color2} onChange={setColor2} />
        </div>

        {/* Third colour toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setUseThird((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium transition-all"
            style={{ color: useThird ? color : "#9ca3af" }}
          >
            <div
              className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
              style={{ borderColor: useThird ? color : "#d1d5db", backgroundColor: useThird ? color : "white" }}
            >
              {useThird && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            Add middle colour stop
          </button>
        </div>

        {useThird && (
          <div className="mb-4">
            <ColorPicker label="Middle colour" value={color3} onChange={setColor3} />
          </div>
        )}

        {/* Direction */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 font-medium mb-2">Direction</label>
          <div className="flex flex-wrap gap-2">
            {DIR_LABELS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDirection(d.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
                style={{
                  backgroundColor: direction === d.id ? color : "white",
                  color: direction === d.id ? "white" : "#6b7280",
                  borderColor: direction === d.id ? color : "#e5e7eb",
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Angle slider (only for linear) */}
        {direction !== "radial" && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Angle</span>
              <span style={{ color }}>{angle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value, 10))}
              className="w-full"
              style={{ accentColor: color }}
            />
          </div>
        )}

        {/* Preview */}
        <div
          className="rounded-2xl h-40 w-full mb-4"
          style={{ background: gradient, border: "1px solid #e5e7eb" }}
        />

        {/* CSS output */}
        <div
          className="rounded-xl p-3 font-mono text-xs mb-3 relative break-all"
          style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
        >
          <pre className="whitespace-pre-wrap text-gray-600">{css}</pre>
        </div>

        <button
          onClick={copy}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
          style={{
            backgroundColor: copied ? "#22c55e" : color,
            color: "white",
          }}
        >
          {copied ? "Copied!" : "Copy CSS"}
        </button>
      </div>
    </TemplateShell>
  );
}
