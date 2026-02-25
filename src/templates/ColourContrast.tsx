"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return [r, g, b];
}

// sRGB linearisation
function linearise(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(linearise);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  if (l1 === null || l2 === null) return null;
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface PassFail {
  label: string;
  threshold: number;
  pass: boolean;
}

export default function ColourContrast({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");

  const ratio = contrastRatio(fg, bg);
  const fgLum = relativeLuminance(fg);
  const bgLum = relativeLuminance(bg);

  const checks: PassFail[] = ratio !== null
    ? [
        { label: "AA Normal text (4.5:1)", threshold: 4.5, pass: ratio >= 4.5 },
        { label: "AA Large text (3:1)", threshold: 3, pass: ratio >= 3 },
        { label: "AAA Normal text (7:1)", threshold: 7, pass: ratio >= 7 },
        { label: "AAA Large text (4.5:1)", threshold: 4.5, pass: ratio >= 4.5 },
      ]
    : [];

  return (
    <TemplateShell config={config} icon="🎨">
      <div className="p-4">
        {/* Colour pickers */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { label: "Foreground", value: fg, onChange: setFg },
            { label: "Background", value: bg, onChange: setBg },
          ].map((c) => (
            <div key={c.label}>
              <label className="block text-xs font-medium text-gray-500 mb-2">{c.label}</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-2 bg-white">
                <div
                  className="w-10 h-10 rounded-lg shrink-0 border border-gray-200 overflow-hidden relative"
                  style={{ backgroundColor: c.value }}
                >
                  <input
                    type="color"
                    value={c.value}
                    onChange={(e) => c.onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={c.value}
                  onChange={(e) => c.onChange(e.target.value)}
                  maxLength={7}
                  className="flex-1 text-sm font-mono outline-none min-w-0"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Live preview */}
        <div
          className="rounded-2xl p-5 mb-5 text-center"
          style={{ backgroundColor: bg, border: "1px solid #e5e7eb" }}
        >
          <p className="text-xl font-bold mb-1" style={{ color: fg }}>
            Sample heading text
          </p>
          <p className="text-sm" style={{ color: fg }}>
            The quick brown fox jumps over the lazy dog. This is body text.
          </p>
          <p className="text-xs mt-1 font-medium" style={{ color: fg }}>
            Small text sample (12px equivalent)
          </p>
        </div>

        {ratio !== null && (
          <>
            {/* Ratio display */}
            <div
              className="rounded-2xl p-4 text-center mb-4"
              style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30` }}
            >
              <p className="text-xs text-gray-500 mb-1">Contrast ratio</p>
              <p className="text-5xl font-bold" style={{ color }}>
                {ratio.toFixed(2)}
                <span className="text-2xl">:1</span>
              </p>
            </div>

            {/* WCAG checks */}
            <div className="space-y-2 mb-4">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-sm text-gray-700">{c.label}</span>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: c.pass ? "#22c55e20" : "#ef444420",
                      color: c.pass ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {c.pass ? "PASS" : "FAIL"}
                  </span>
                </div>
              ))}
            </div>

            {/* Luminance */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Foreground luminance", lum: fgLum, hex: fg },
                { label: "Background luminance", lum: bgLum, hex: bg },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded shrink-0 border border-gray-200"
                      style={{ backgroundColor: item.hex }}
                    />
                    <p className="text-sm font-semibold text-gray-700">
                      {item.lum !== null ? item.lum.toFixed(4) : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </TemplateShell>
  );
}
