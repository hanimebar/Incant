"use client";

import { useState, useMemo } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface AmortRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

function computeLoan(principal: number, annualRate: number, years: number) {
  if (principal <= 0 || years <= 0) return null;
  const n = years * 12;

  if (annualRate === 0) {
    const monthly = principal / n;
    const rows: AmortRow[] = [];
    let balance = principal;
    for (let i = 1; i <= Math.min(12, n); i++) {
      balance -= monthly;
      rows.push({ month: i, payment: monthly, interest: 0, principal: monthly, balance: Math.max(0, balance) });
    }
    return { monthly, total: principal, totalInterest: 0, rows };
  }

  const r = annualRate / 100 / 12;
  const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = monthly * n;
  const totalInterest = total - principal;

  const rows: AmortRow[] = [];
  let balance = principal;
  for (let i = 1; i <= Math.min(12, n); i++) {
    const interestPart = balance * r;
    const principalPart = monthly - interestPart;
    balance -= principalPart;
    rows.push({
      month: i,
      payment: monthly,
      interest: interestPart,
      principal: principalPart,
      balance: Math.max(0, balance),
    });
  }

  return { monthly, total, totalInterest, rows };
}

function fmt(n: number): string {
  return n.toLocaleString("en-EU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function LoanCalculator({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const currency = config.currency || "€";

  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("5");
  const [years, setYears] = useState("5");

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const y = parseFloat(years);
    if (isNaN(p) || isNaN(r) || isNaN(y) || p <= 0 || r < 0 || y <= 0) return null;
    return computeLoan(p, r, y);
  }, [principal, rate, years]);

  return (
    <TemplateShell config={config} icon="🏦">
      <div className="p-4">
        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Principal ({currency})
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              min="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual interest rate (%)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              min="0"
              step="0.1"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan term (years)</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              min="1"
              max="50"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        {result ? (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { label: "Monthly", value: `${currency}${fmt(result.monthly)}`, highlight: true },
                { label: "Total paid", value: `${currency}${fmt(result.total)}`, highlight: false },
                { label: "Total interest", value: `${currency}${fmt(result.totalInterest)}`, highlight: false },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl p-3 text-center"
                  style={{
                    backgroundColor: c.highlight ? color : `${color}10`,
                    border: c.highlight ? "none" : `1px solid ${color}30`,
                  }}
                >
                  <p className="text-[10px] font-medium mb-1" style={{ color: c.highlight ? "rgba(255,255,255,0.8)" : "#9ca3af" }}>
                    {c.label}
                  </p>
                  <p className="text-sm font-bold leading-tight" style={{ color: c.highlight ? "white" : color }}>
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Interest vs principal bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Principal {((parseFloat(principal) / result.total) * 100).toFixed(0)}%</span>
                <span>Interest {((result.totalInterest / result.total) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-l-full"
                  style={{ width: `${(parseFloat(principal) / result.total) * 100}%`, backgroundColor: color }}
                />
                <div className="h-full flex-1 rounded-r-full bg-red-300" />
              </div>
            </div>

            {/* Amortization table */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">First 12 months breakdown</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: `${color}10` }}>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Month</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-600">Payment</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-600">Interest</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-600">Principal</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-600">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr key={row.month} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 text-gray-500">{row.month}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{currency}{fmt(row.payment)}</td>
                        <td className="px-3 py-2 text-right text-red-400">{currency}{fmt(row.interest)}</td>
                        <td className="px-3 py-2 text-right" style={{ color }}>{currency}{fmt(row.principal)}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{currency}{fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
          >
            <p className="text-gray-400 text-sm">Fill in all fields to calculate your loan</p>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
