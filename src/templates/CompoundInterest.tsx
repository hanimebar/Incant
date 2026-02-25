"use client";

import { useState, useMemo } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type CompoundFreq = "yearly" | "monthly" | "daily";

const FREQ_MAP: Record<CompoundFreq, number> = {
  yearly: 1,
  monthly: 12,
  daily: 365,
};

interface YearRow {
  year: number;
  balance: number;
  interest: number;
  totalInterest: number;
}

function computeCompound(principal: number, rate: number, years: number, freq: CompoundFreq): {
  final: number;
  totalInterest: number;
  growthPct: number;
  rows: YearRow[];
} {
  const n = FREQ_MAP[freq];
  const r = rate / 100;
  const rows: YearRow[] = [];
  let prevBalance = principal;

  for (let y = 1; y <= Math.min(years, 30); y++) {
    const balance = principal * Math.pow(1 + r / n, n * y);
    const totalInterest = balance - principal;
    rows.push({
      year: y,
      balance,
      interest: balance - prevBalance,
      totalInterest,
    });
    prevBalance = balance;
  }

  const final = principal * Math.pow(1 + r / n, n * years);
  const totalInterest = final - principal;
  const growthPct = (totalInterest / principal) * 100;

  return { final, totalInterest, growthPct, rows };
}

function fmt(n: number): string {
  return n.toLocaleString("en-EU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CompoundInterest({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const currency = config.currency || "€";

  const [principal, setPrincipal] = useState("1000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("10");
  const [freq, setFreq] = useState<CompoundFreq>("yearly");

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const y = parseInt(years, 10);
    if (isNaN(p) || isNaN(r) || isNaN(y) || p <= 0 || r <= 0 || y <= 0) return null;
    return computeCompound(p, r, y, freq);
  }, [principal, rate, years, freq]);

  return (
    <TemplateShell config={config} icon="📈">
      <div className="p-4">
        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Initial investment ({currency})</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Annual rate (%)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                min="0"
                step="0.1"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Years</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                min="1"
                max="50"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Compound frequency</label>
              <select
                value={freq}
                onChange={(e) => setFreq(e.target.value as CompoundFreq)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none"
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>
        </div>

        {result ? (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: "Final amount", value: `${currency}${fmt(result.final)}`, highlight: true },
                { label: "Interest earned", value: `${currency}${fmt(result.totalInterest)}`, highlight: false },
                { label: "Growth", value: `+${result.growthPct.toFixed(1)}%`, highlight: false },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl p-3 text-center"
                  style={{
                    backgroundColor: c.highlight ? color : `${color}10`,
                    border: c.highlight ? "none" : `1px solid ${color}30`,
                  }}
                >
                  <p className="text-[10px] font-medium mb-1" style={{ color: c.highlight ? "rgba(255,255,255,0.7)" : "#9ca3af" }}>
                    {c.label}
                  </p>
                  <p className="text-sm font-bold leading-tight break-all" style={{ color: c.highlight ? "white" : color }}>
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Year-by-year table */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Year-by-year growth</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: `${color}10` }}>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Year</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-600">Balance</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-600">Year interest</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-600">Total interest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr key={row.year} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 text-gray-500">Y{row.year}</td>
                        <td className="px-3 py-2 text-right font-medium" style={{ color }}>
                          {currency}{fmt(row.balance)}
                        </td>
                        <td className="px-3 py-2 text-right text-green-500">
                          +{currency}{fmt(row.interest)}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">
                          {currency}{fmt(row.totalInterest)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parseInt(years, 10) > 30 && (
                <p className="text-xs text-gray-400 mt-1 text-center">Showing first 30 years</p>
              )}
            </div>
          </>
        ) : (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
          >
            <p className="text-gray-400 text-sm">Fill in the fields above to calculate compound interest</p>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
