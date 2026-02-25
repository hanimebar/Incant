"use client";

import { useState, useMemo } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type FontStyle = "filled" | "outline" | "dots";

// 5-row by 5-char block font for A–Z and 0–9.
// Each character occupies a 5×5 grid. '#' = filled pixel.
const FONT: Record<string, string[]> = {
  A: [
    " ### ",
    "#   #",
    "#####",
    "#   #",
    "#   #",
  ],
  B: [
    "#### ",
    "#   #",
    "#### ",
    "#   #",
    "#### ",
  ],
  C: [
    " ####",
    "#    ",
    "#    ",
    "#    ",
    " ####",
  ],
  D: [
    "#### ",
    "#   #",
    "#   #",
    "#   #",
    "#### ",
  ],
  E: [
    "#####",
    "#    ",
    "#### ",
    "#    ",
    "#####",
  ],
  F: [
    "#####",
    "#    ",
    "#### ",
    "#    ",
    "#    ",
  ],
  G: [
    " ####",
    "#    ",
    "#  ##",
    "#   #",
    " ####",
  ],
  H: [
    "#   #",
    "#   #",
    "#####",
    "#   #",
    "#   #",
  ],
  I: [
    "#####",
    "  #  ",
    "  #  ",
    "  #  ",
    "#####",
  ],
  J: [
    "#####",
    "   # ",
    "   # ",
    "#  # ",
    " ##  ",
  ],
  K: [
    "#   #",
    "#  # ",
    "###  ",
    "#  # ",
    "#   #",
  ],
  L: [
    "#    ",
    "#    ",
    "#    ",
    "#    ",
    "#####",
  ],
  M: [
    "#   #",
    "## ##",
    "# # #",
    "#   #",
    "#   #",
  ],
  N: [
    "#   #",
    "##  #",
    "# # #",
    "#  ##",
    "#   #",
  ],
  O: [
    " ### ",
    "#   #",
    "#   #",
    "#   #",
    " ### ",
  ],
  P: [
    "#### ",
    "#   #",
    "#### ",
    "#    ",
    "#    ",
  ],
  Q: [
    " ### ",
    "#   #",
    "# # #",
    "#  ##",
    " ####",
  ],
  R: [
    "#### ",
    "#   #",
    "#### ",
    "#  # ",
    "#   #",
  ],
  S: [
    " ####",
    "#    ",
    " ### ",
    "    #",
    "#### ",
  ],
  T: [
    "#####",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
  ],
  U: [
    "#   #",
    "#   #",
    "#   #",
    "#   #",
    " ### ",
  ],
  V: [
    "#   #",
    "#   #",
    "#   #",
    " # # ",
    "  #  ",
  ],
  W: [
    "#   #",
    "#   #",
    "# # #",
    "## ##",
    "#   #",
  ],
  X: [
    "#   #",
    " # # ",
    "  #  ",
    " # # ",
    "#   #",
  ],
  Y: [
    "#   #",
    " # # ",
    "  #  ",
    "  #  ",
    "  #  ",
  ],
  Z: [
    "#####",
    "   # ",
    "  #  ",
    " #   ",
    "#####",
  ],
  "0": [
    " ### ",
    "#  ##",
    "# # #",
    "##  #",
    " ### ",
  ],
  "1": [
    "  #  ",
    " ##  ",
    "  #  ",
    "  #  ",
    "#####",
  ],
  "2": [
    " ### ",
    "#   #",
    "  ## ",
    " #   ",
    "#####",
  ],
  "3": [
    "#####",
    "   # ",
    " ### ",
    "   # ",
    "#####",
  ],
  "4": [
    "#   #",
    "#   #",
    "#####",
    "    #",
    "    #",
  ],
  "5": [
    "#####",
    "#    ",
    "#### ",
    "    #",
    "#### ",
  ],
  "6": [
    " ### ",
    "#    ",
    "#### ",
    "#   #",
    " ### ",
  ],
  "7": [
    "#####",
    "   # ",
    "  #  ",
    " #   ",
    "#    ",
  ],
  "8": [
    " ### ",
    "#   #",
    " ### ",
    "#   #",
    " ### ",
  ],
  "9": [
    " ### ",
    "#   #",
    " ####",
    "    #",
    " ### ",
  ],
  " ": [
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
  ],
};

const STYLE_CHARS: Record<FontStyle, string> = {
  filled: "#",
  outline: "+",
  dots: "·",
};

function textToAscii(text: string, style: FontStyle): string {
  const upper = text.toUpperCase().slice(0, 20);
  const chars = upper.split("");
  const fillChar = STYLE_CHARS[style];

  // Build 5 rows
  const rows: string[] = ["", "", "", "", ""];
  for (const ch of chars) {
    const glyph = FONT[ch] ?? FONT[" "];
    for (let r = 0; r < 5; r++) {
      const processed = glyph[r].replace(/#/g, fillChar);
      rows[r] += processed + " ";
    }
  }
  return rows.join("\n");
}

// Outline variant: replace filled blocks with border chars
function textToAsciiOutline(text: string): string {
  const upper = text.toUpperCase().slice(0, 20);
  const chars = upper.split("");

  const rows: string[] = ["", "", "", "", ""];
  for (const ch of chars) {
    const glyph = FONT[ch] ?? FONT[" "];
    for (let r = 0; r < 5; r++) {
      const row = glyph[r];
      let processed = "";
      for (let c = 0; c < row.length; c++) {
        if (row[c] === "#") {
          // Check neighbours to determine if outline or interior
          const top    = r > 0        ? glyph[r - 1][c] === "#" : false;
          const bot    = r < 4        ? glyph[r + 1][c] === "#" : false;
          const left   = c > 0        ? row[c - 1] === "#" : false;
          const right  = c < row.length - 1 ? row[c + 1] === "#" : false;
          // On edge of the glyph block → outline
          if (!top || !bot || !left || !right) {
            processed += "+";
          } else {
            processed += " ";
          }
        } else {
          processed += " ";
        }
      }
      rows[r] += processed + " ";
    }
  }
  return rows.join("\n");
}

export default function AsciiArt({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [input, setInput] = useState("HELLO");
  const [style, setStyle] = useState<FontStyle>("filled");
  const [copied, setCopied] = useState(false);

  const ascii = useMemo(() => {
    if (!input.trim()) return "";
    if (style === "outline") return textToAsciiOutline(input);
    return textToAscii(input, style);
  }, [input, style]);

  const copy = async () => {
    await navigator.clipboard.writeText(ascii);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const styles: { id: FontStyle; label: string; char: string }[] = [
    { id: "filled", label: "Filled", char: "#" },
    { id: "outline", label: "Outline", char: "+" },
    { id: "dots", label: "Dots", char: "·" },
  ];

  return (
    <TemplateShell config={config} icon="🔤">
      <div className="p-4">
        {/* Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text (A–Z, 0–9, max 20 chars)
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 20))}
            placeholder="Enter text..."
            maxLength={20}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none uppercase"
            style={{ borderColor: input ? color : undefined }}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{input.length}/20</p>
        </div>

        {/* Style toggle */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 font-medium mb-2">Style</label>
          <div className="flex gap-2">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                style={{
                  backgroundColor: style === s.id ? color : "white",
                  color: style === s.id ? "white" : "#6b7280",
                  borderColor: style === s.id ? color : "#e5e7eb",
                }}
              >
                <span className="font-mono">{s.char}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        {ascii ? (
          <>
            <div
              className="rounded-2xl p-4 mb-3 overflow-x-auto"
              style={{ backgroundColor: `${color}06`, border: `1px solid ${color}20` }}
            >
              <pre
                className="text-[10px] leading-[1.4] font-mono whitespace-pre select-all"
                style={{ color }}
              >
                {ascii}
              </pre>
            </div>
            <button
              onClick={copy}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
              style={{ backgroundColor: copied ? "#22c55e" : color, color: "white" }}
            >
              {copied ? "Copied!" : "Copy ASCII"}
            </button>
          </>
        ) : (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: `${color}08`, border: `1px dashed ${color}30` }}
          >
            <p className="text-gray-400 text-sm">Enter text above to generate ASCII art</p>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
