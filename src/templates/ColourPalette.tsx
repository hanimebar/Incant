"use client";

import { useState, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type PaletteType = "monochromatic" | "complementary" | "analogous" | "triadic" | "tetradic";

function hexToHsl(hex: string): [number, number, number] | null {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const hNorm = ((h % 360) + 360) % 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0, g = 0, b = 0;

  if (hNorm < 60)       { r = c; g = x; b = 0; }
  else if (hNorm < 120) { r = x; g = c; b = 0; }
  else if (hNorm < 180) { r = 0; g = c; b = x; }
  else if (hNorm < 240) { r = 0; g = x; b = c; }
  else if (hNorm < 300) { r = x; g = 0; b = c; }
  else                   { r = c; g = 0; b = x; }

  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generatePalette(hex: string, type: PaletteType): string[] {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex, hex, hex, hex, hex];
  const [h, s, l] = hsl;

  switch (type) {
    case "monochromatic":
      return [
        hslToHex(h, s, Math.max(10, l - 30)),
        hslToHex(h, s, Math.max(10, l - 15)),
        hex,
        hslToHex(h, s, Math.min(90, l + 15)),
        hslToHex(h, s, Math.min(90, l + 30)),
      ];
    case "complementary": {
      const comp = h + 180;
      return [
        hslToHex(h, s, Math.max(10, l - 15)),
        hex,
        hslToHex(h, s, Math.min(90, l + 15)),
        hslToHex(comp, s, l),
        hslToHex(comp, s, Math.min(90, l + 15)),
      ];
    }
    case "analogous":
      return [
        hslToHex(h - 40, s, l),
        hslToHex(h - 20, s, l),
        hex,
        hslToHex(h + 20, s, l),
        hslToHex(h + 40, s, l),
      ];
    case "triadic":
      return [
        hex,
        hslToHex(h, s, Math.min(90, l + 15)),
        hslToHex(h + 120, s, l),
        hslToHex(h + 120, s, Math.min(90, l + 15)),
        hslToHex(h + 240, s, l),
      ];
    case "tetradic":
      return [
        hex,
        hslToHex(h + 90, s, l),
        hslToHex(h + 180, s, l),
        hslToHex(h + 270, s, l),
        hslToHex(h, s, Math.min(90, l + 20)),
      ];
    default:
      return [hex, hex, hex, hex, hex];
  }
}

const PALETTE_TYPES: { id: PaletteType; label: string }[] = [
  { id: "monochromatic", label: "Mono" },
  { id: "complementary", label: "Comp" },
  { id: "analogous", label: "Analogous" },
  { id: "triadic", label: "Triadic" },
  { id: "tetradic", label: "Tetradic" },
];

export default function ColourPalette({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [baseColor, setBaseColor] = useState(color);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyHex = useCallback(async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  }, []);

  return (
    <TemplateShell config={config} icon="🎨">
      <div className="p-4">
        {/* Base colour picker */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Base colour</label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 bg-white">
            <div
              className="w-12 h-12 rounded-xl shrink-0 border border-gray-200 overflow-hidden relative"
              style={{ backgroundColor: baseColor }}
            >
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </div>
            <div>
              <input
                type="text"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                maxLength={7}
                className="text-base font-mono font-bold outline-none"
                style={{ color }}
              />
              <p className="text-xs text-gray-400">Click swatch to open picker</p>
            </div>
          </div>
        </div>

        {/* Palettes */}
        <div className="space-y-4">
          {PALETTE_TYPES.map((pt) => {
            const palette = generatePalette(baseColor, pt.id);
            return (
              <div key={pt.id}>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{pt.label}</p>
                <div className="flex gap-1.5">
                  {palette.map((hex, i) => (
                    <button
                      key={`${pt.id}-${i}`}
                      onClick={() => copyHex(hex)}
                      className="flex-1 group relative rounded-xl overflow-hidden border border-gray-100"
                      title={`Copy ${hex}`}
                    >
                      <div
                        className="w-full aspect-square transition-transform group-hover:scale-105"
                        style={{ backgroundColor: hex }}
                      />
                      {copiedHex === hex && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                      <p className="text-[9px] text-gray-500 font-mono text-center py-1 truncate px-0.5">{hex}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">Tap any swatch to copy its hex code</p>
      </div>
    </TemplateShell>
  );
}
