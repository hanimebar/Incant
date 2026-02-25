"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type HeightUnit = "cm" | "ftin";
type WeightUnit = "kg" | "lb";

interface BMICategory {
  label: string;
  color: string;
  range: string;
}

function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6", range: "< 18.5" };
  if (bmi < 25)   return { label: "Normal weight", color: "#22c55e", range: "18.5 – 24.9" };
  if (bmi < 30)   return { label: "Overweight", color: "#f59e0b", range: "25 – 29.9" };
  return { label: "Obese", color: "#ef4444", range: "≥ 30" };
}

function getBMIPosition(bmi: number): number {
  // Map BMI to percentage on scale bar (10–45 range)
  const clamped = Math.min(Math.max(bmi, 10), 45);
  return ((clamped - 10) / 35) * 100;
}

export default function BmiCalculator({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weight, setWeight] = useState("");

  // Compute height in metres
  let heightM: number | null = null;
  if (heightUnit === "cm") {
    const v = parseFloat(heightCm);
    if (!isNaN(v) && v > 0) heightM = v / 100;
  } else {
    const ft = parseFloat(heightFt) || 0;
    const inch = parseFloat(heightIn) || 0;
    const totalInches = ft * 12 + inch;
    if (totalInches > 0) heightM = totalInches * 0.0254;
  }

  let weightKg: number | null = null;
  const wVal = parseFloat(weight);
  if (!isNaN(wVal) && wVal > 0) {
    weightKg = weightUnit === "kg" ? wVal : wVal * 0.453592;
  }

  let bmi: number | null = null;
  if (heightM && weightKg) {
    bmi = weightKg / (heightM * heightM);
  }

  const category = bmi !== null ? getBMICategory(bmi) : null;
  const position = bmi !== null ? getBMIPosition(bmi) : null;

  const scaleSegments = [
    { label: "Under", color: "#3b82f6", width: "20%" },
    { label: "Normal", color: "#22c55e", width: "20%" },
    { label: "Over", color: "#f59e0b", width: "14.3%" },
    { label: "Obese", color: "#ef4444", width: "45.7%" },
  ];

  return (
    <TemplateShell config={config} icon="⚖️">
      <div className="p-4">
        {/* Unit toggles */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium mb-1">Height unit</p>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              {(["cm", "ftin"] as HeightUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setHeightUnit(u)}
                  className="flex-1 py-2 text-xs font-semibold transition-all"
                  style={{ backgroundColor: heightUnit === u ? color : "white", color: heightUnit === u ? "white" : "#6b7280" }}
                >
                  {u === "cm" ? "cm" : "ft / in"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium mb-1">Weight unit</p>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              {(["kg", "lb"] as WeightUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setWeightUnit(u)}
                  className="flex-1 py-2 text-xs font-semibold transition-all"
                  style={{ backgroundColor: weightUnit === u ? color : "white", color: weightUnit === u ? "white" : "#6b7280" }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Height input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
          {heightUnit === "cm" ? (
            <div className="relative">
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="e.g. 175"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">cm</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  placeholder="5"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">ft</span>
              </div>
              <div className="relative flex-1">
                <input
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  placeholder="9"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">in</span>
              </div>
            </div>
          )}
        </div>

        {/* Weight input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
          <div className="relative">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={weightUnit === "kg" ? "e.g. 70" : "e.g. 154"}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">{weightUnit}</span>
          </div>
        </div>

        {/* Result */}
        {bmi !== null && category !== null && position !== null ? (
          <div className="space-y-4">
            <div
              className="rounded-2xl p-5 text-center"
              style={{ backgroundColor: `${category.color}15`, border: `2px solid ${category.color}40` }}
            >
              <p className="text-6xl font-bold mb-2" style={{ color: category.color }}>
                {bmi.toFixed(1)}
              </p>
              <p className="text-lg font-semibold" style={{ color: category.color }}>{category.label}</p>
              <p className="text-sm text-gray-500 mt-1">BMI range: {category.range}</p>
            </div>

            {/* Scale bar */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">BMI Scale</p>
              <div className="relative h-6 rounded-full overflow-hidden flex">
                {scaleSegments.map((seg) => (
                  <div
                    key={seg.label}
                    style={{ backgroundColor: seg.color, width: seg.width }}
                    className="flex items-center justify-center"
                  >
                    <span className="text-white text-[9px] font-bold">{seg.label}</span>
                  </div>
                ))}
                {/* Indicator */}
                <div
                  className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg transition-all"
                  style={{ left: `${position}%`, transform: "translateX(-50%)" }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>45+</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center italic">
              BMI is a general guide only and not a substitute for medical advice.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
          >
            <p className="text-gray-400 text-sm">Enter your height and weight to calculate BMI</p>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
