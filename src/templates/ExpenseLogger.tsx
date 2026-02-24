"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface Expense { id: string; amount: number; category: string; description: string; date: string }

export default function ExpenseLogger({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-expenses`;
  const primary = config.primaryColor || "#10b981";
  const currency = config.currency || "€";
  const categories = config.categories || ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Other"];

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({ amount: "", category: categories[0], description: "" });

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setExpenses(JSON.parse(stored));
  }, [key]);

  const save = (updated: Expense[]) => {
    setExpenses(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const addExpense = () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) return;
    save([{
      id: Date.now().toString(),
      amount: parseFloat(form.amount),
      category: form.category,
      description: form.description,
      date: new Date().toLocaleDateString(),
    }, ...expenses]);
    setForm({ amount: "", category: categories[0], description: "" });
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = categories.map((cat) => ({
    cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  return (
    <TemplateShell config={config} icon="💸">
      <div className="mb-5 p-4 rounded-xl text-white text-center" style={{ backgroundColor: primary }}>
        <p className="text-sm opacity-80">Total spent</p>
        <p className="text-4xl font-bold">{currency}{total.toFixed(2)}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 space-y-2">
        <div className="flex gap-2">
          <input type="number" placeholder="Amount" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <input placeholder="Description (optional)" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
        <button onClick={addExpense} className="w-full py-2.5 rounded-xl text-white font-medium"
          style={{ backgroundColor: primary }}>
          Add Expense
        </button>
      </div>

      {byCategory.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider">By category</p>
          {byCategory.map(({ cat, total: t }) => (
            <div key={cat} className="flex justify-between text-sm">
              <span className="text-gray-600">{cat}</span>
              <span className="font-medium text-gray-800">{currency}{t.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {expenses.map((e) => (
          <div key={e.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">{e.description || e.category}</p>
              <p className="text-xs text-gray-400">{e.category} · {e.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: primary }}>{currency}{e.amount.toFixed(2)}</span>
              <button onClick={() => save(expenses.filter((x) => x.id !== e.id))} className="text-gray-300 hover:text-red-400">×</button>
            </div>
          </div>
        ))}
      </div>
    </TemplateShell>
  );
}
