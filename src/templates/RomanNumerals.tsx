"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const ROMAN_MAP: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

const KEY_VALUES: [string, number][] = [
  ["I", 1], ["IV", 4], ["V", 5], ["IX", 9],
  ["X", 10], ["XL", 40], ["L", 50], ["XC", 90],
  ["C", 100], ["CD", 400], ["D", 500], ["CM", 900], ["M", 1000],
];

function toRoman(num: number): string {
  if (num < 1 || num > 3999) return "Out of range (1–3999)";
  let result = "";
  let n = num;
  for (const [val, sym] of ROMAN_MAP) {
    while (n >= val) {
      result += sym;
      n -= val;
    }
  }
  return result;
}

function fromRoman(s: string): number | null {
  const input = s.toUpperCase().trim();
  if (!input) return null;
  const romanDigits: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let result = 0;
  let prev = 0;
  for (let i = input.length - 1; i >= 0; i--) {
    const curr = romanDigits[input[i]];
    if (curr === undefined) return null;
    if (curr < prev) result -= curr;
    else result += curr;
    prev = curr;
  }
  if (result < 1 || result > 3999) return null;
  // Validate by re-encoding
  if (toRoman(result) !== input) return null;
  return result;
}

const FUN_FACTS = [
  "There is no zero in Roman numerals — the concept of zero was introduced later by Arabic-Indian mathematicians.",
  "The Romans never used Roman numerals for complex arithmetic; they used an abacus instead.",
  "The year 2024 in Roman numerals is MMXXIV.",
  "Roman numerals are still used today for clock faces, Super Bowl numbers, and movie sequel titles.",
  "The longest Roman numeral for numbers 1–3999 is 3888 = MMMDCCCLXXXVIII (15 characters).",
];

const randomFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];

export default function RomanNumerals({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [numInput, setNumInput] = useState("");
  const [romanInput, setRomanInput] = useState("");

  const numVal = parseInt(numInput, 10);
  const romanFromNum = numInput && !isNaN(numVal) ? toRoman(numVal) : null;

  const arabicFromRoman = romanInput ? fromRoman(romanInput) : null;
  const romanError = romanInput && arabicFromRoman === null ? "Invalid Roman numeral" : null;

  return (
    <TemplateShell config={config} icon="🏛️">
      <div className="p-4">
        {/* Number → Roman */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
        >
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Number → Roman Numeral</h2>
          <input
            type="number"
            value={numInput}
            onChange={(e) => setNumInput(e.target.value)}
            placeholder="Enter 1 – 3999"
            min={1}
            max={3999}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none mb-3 bg-white"
          />
          <div className="text-center">
            {romanFromNum ? (
              <>
                <p className="text-xs text-gray-400 mb-1">{numVal} =</p>
                <p className="text-4xl font-bold tracking-widest" style={{ color }}>
                  {romanFromNum}
                </p>
              </>
            ) : (
              <p className="text-gray-300 text-sm">Result appears here</p>
            )}
          </div>
        </div>

        {/* Roman → Number */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
        >
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Roman Numeral → Number</h2>
          <input
            type="text"
            value={romanInput}
            onChange={(e) => setRomanInput(e.target.value.toUpperCase())}
            placeholder="e.g. XLII"
            maxLength={15}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none mb-3 bg-white uppercase"
          />
          <div className="text-center">
            {romanError ? (
              <p className="text-red-400 text-sm">{romanError}</p>
            ) : arabicFromRoman !== null ? (
              <>
                <p className="text-xs text-gray-400 mb-1">{romanInput} =</p>
                <p className="text-4xl font-bold" style={{ color }}>
                  {arabicFromRoman}
                </p>
              </>
            ) : (
              <p className="text-gray-300 text-sm">Result appears here</p>
            )}
          </div>
        </div>

        {/* Reference table */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Key values</h3>
          <div className="grid grid-cols-4 gap-1.5">
            {KEY_VALUES.map(([sym, val]) => (
              <div
                key={sym}
                className="rounded-xl p-2 text-center"
                style={{ backgroundColor: `${color}10` }}
              >
                <p className="font-bold text-sm" style={{ color }}>{sym}</p>
                <p className="text-xs text-gray-500">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fun fact */}
        <div className="rounded-2xl p-4 bg-gray-50 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-1">Fun fact</p>
          <p className="text-sm text-gray-600 italic">{randomFact}</p>
        </div>
      </div>
    </TemplateShell>
  );
}
