"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Tab = "length" | "weight" | "temperature" | "volume";

const LENGTH_UNITS = ["mm", "cm", "m", "km", "inch", "foot", "yard", "mile"] as const;
const WEIGHT_UNITS = ["mg", "g", "kg", "tonne", "oz", "lb", "stone"] as const;
const TEMP_UNITS = ["Celsius", "Fahrenheit", "Kelvin"] as const;
const VOLUME_UNITS = ["ml", "cl", "dl", "L", "tsp", "tbsp", "fl oz", "cup", "pint", "gallon"] as const;

// Base unit: metres
const LENGTH_TO_M: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  inch: 0.0254,
  foot: 0.3048,
  yard: 0.9144,
  mile: 1609.344,
};

// Base unit: grams
const WEIGHT_TO_G: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  tonne: 1_000_000,
  oz: 28.3495,
  lb: 453.592,
  stone: 6350.29,
};

// Base unit: ml
const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  cl: 10,
  dl: 100,
  L: 1000,
  tsp: 4.92892,
  tbsp: 14.7868,
  "fl oz": 29.5735,
  cup: 236.588,
  pint: 473.176,
  gallon: 3785.41,
};

function convertLength(value: number, from: string, to: string): number {
  const metres = value * LENGTH_TO_M[from];
  return metres / LENGTH_TO_M[to];
}

function convertWeight(value: number, from: string, to: string): number {
  const grams = value * WEIGHT_TO_G[from];
  return grams / WEIGHT_TO_G[to];
}

function convertTemp(value: number, from: string, to: string): number {
  if (from === to) return value;
  // Convert to Celsius first
  let celsius: number;
  if (from === "Celsius") celsius = value;
  else if (from === "Fahrenheit") celsius = (value - 32) * 5 / 9;
  else celsius = value - 273.15;
  // Convert to target
  if (to === "Celsius") return celsius;
  if (to === "Fahrenheit") return celsius * 9 / 5 + 32;
  return celsius + 273.15;
}

function convertVolume(value: number, from: string, to: string): number {
  const ml = value * VOLUME_TO_ML[from];
  return ml / VOLUME_TO_ML[to];
}

function formatResult(val: number): string {
  if (!isFinite(val)) return "—";
  if (Math.abs(val) >= 1e9 || (Math.abs(val) < 0.000001 && val !== 0)) {
    return val.toExponential(6);
  }
  const str = val.toPrecision(10);
  const num = parseFloat(str);
  return String(parseFloat(num.toFixed(8)));
}

interface ConvState {
  from: string;
  to: string;
  input: string;
}

export default function UnitConverter({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [tab, setTab] = useState<Tab>("length");

  const [length, setLength] = useState<ConvState>({ from: "m", to: "foot", input: "" });
  const [weight, setWeight] = useState<ConvState>({ from: "kg", to: "lb", input: "" });
  const [temp, setTemp] = useState<ConvState>({ from: "Celsius", to: "Fahrenheit", input: "" });
  const [volume, setVolume] = useState<ConvState>({ from: "L", to: "cup", input: "" });

  const tabs: { id: Tab; label: string; units: readonly string[]; state: ConvState; setState: (s: ConvState) => void; convert: (v: number, f: string, t: string) => number }[] = [
    { id: "length", label: "Length", units: LENGTH_UNITS, state: length, setState: setLength, convert: convertLength },
    { id: "weight", label: "Weight", units: WEIGHT_UNITS, state: weight, setState: setWeight, convert: convertWeight },
    { id: "temperature", label: "Temp", units: TEMP_UNITS, state: temp, setState: setTemp, convert: convertTemp },
    { id: "volume", label: "Volume", units: VOLUME_UNITS, state: volume, setState: setVolume, convert: convertVolume },
  ];

  const current = tabs.find((t) => t.id === tab)!;
  const inputVal = parseFloat(current.state.input);
  const result = current.state.input !== "" && !isNaN(inputVal)
    ? formatResult(current.convert(inputVal, current.state.from, current.state.to))
    : null;

  return (
    <TemplateShell config={config} icon="📐">
      <div className="p-4">
        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-2xl p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: tab === t.id ? color : "transparent",
                color: tab === t.id ? "white" : "#6b7280",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* From / To selects */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <select
              value={current.state.from}
              onChange={(e) => current.setState({ ...current.state, from: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none"
            >
              {current.units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <select
              value={current.state.to}
              onChange={(e) => current.setState({ ...current.state, to: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none"
            >
              {current.units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => current.setState({ ...current.state, from: current.state.to, to: current.state.from })}
            className="text-sm px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
          >
            ⇄ Swap
          </button>
        </div>

        {/* Value input */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 mb-1">Value ({current.state.from})</label>
          <input
            type="number"
            value={current.state.input}
            onChange={(e) => current.setState({ ...current.state, input: e.target.value })}
            placeholder={`Enter value in ${current.state.from}`}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none"
            style={{ borderColor: current.state.input ? color : undefined }}
          />
        </div>

        {/* Result */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30` }}
        >
          {result !== null ? (
            <>
              <p className="text-sm text-gray-500 mb-1">{current.state.input} {current.state.from} =</p>
              <p className="text-4xl font-bold" style={{ color }}>{result}</p>
              <p className="text-lg font-medium text-gray-600 mt-1">{current.state.to}</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Enter a value above to convert</p>
          )}
        </div>
      </div>
    </TemplateShell>
  );
}
