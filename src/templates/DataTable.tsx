"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";
import type { TemplateConfig } from "@/types";

type ColType = "text" | "number" | "date";
interface Column { key: string; label: string; type: ColType }

export default function DataTable({ config, spellId }: TemplateProps) {
  const colsKey = `incant-${spellId}-cols`;
  const rowsKey = `incant-${spellId}-rows`;
  const primary = config.primaryColor || "#0f172a";

  const initCols: Column[] = config.fields
    ? config.fields.map((f) => ({ key: f.key, label: f.label, type: (f.type as ColType) || "text" }))
    : [];

  const [columns, setColumns] = useState<Column[]>(initCols);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [newRow, setNewRow] = useState<Record<string, string>>({});
  const [newColForm, setNewColForm] = useState({ label: "", type: "text" as ColType });
  const [showColForm, setShowColForm] = useState(false);

  useEffect(() => {
    const sc = localStorage.getItem(colsKey);
    const sr = localStorage.getItem(rowsKey);
    if (sc) setColumns(JSON.parse(sc));
    if (sr) setRows(JSON.parse(sr));
  }, [colsKey, rowsKey]);

  const saveCols = (c: Column[]) => { setColumns(c); localStorage.setItem(colsKey, JSON.stringify(c)); };
  const saveRows = (r: Record<string, string>[]) => { setRows(r); localStorage.setItem(rowsKey, JSON.stringify(r)); };

  const addColumn = () => {
    if (!newColForm.label.trim()) return;
    const key = newColForm.label.toLowerCase().replace(/\s+/g, "_");
    saveCols([...columns, { key, label: newColForm.label, type: newColForm.type }]);
    setNewColForm({ label: "", type: "text" });
    setShowColForm(false);
  };

  const addRow = () => {
    if (columns.every((c) => !newRow[c.key])) return;
    saveRows([...rows, { ...newRow, _id: Date.now().toString() }]);
    setNewRow({});
  };

  const exportCsv = () => {
    const header = columns.map((c) => c.label).join(",");
    const body = rows.map((r) => columns.map((c) => `"${r[c.key] || ""}"`).join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${config.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TemplateShell config={config} icon="📊">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setShowColForm(!showColForm)}
          className="px-4 py-2 rounded-xl text-sm border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 transition-all">
          + Column
        </button>
        {rows.length > 0 && (
          <button onClick={exportCsv}
            className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all ml-auto">
            ↓ Export CSV
          </button>
        )}
      </div>

      {showColForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 flex gap-2">
          <input value={newColForm.label} onChange={(e) => setNewColForm({ ...newColForm, label: e.target.value })}
            placeholder="Column name" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
          <select value={newColForm.type} onChange={(e) => setNewColForm({ ...newColForm, type: e.target.value as ColType })}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none bg-white">
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </select>
          <button onClick={addColumn} className="px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: primary }}>Add</button>
        </div>
      )}

      {columns.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: primary }}>
                  {columns.map((c) => <th key={c.key} className="px-3 py-2.5 text-left text-white font-medium whitespace-nowrap">{c.label}</th>)}
                  <th className="px-3 py-2.5 w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row._id || i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {columns.map((c) => <td key={c.key} className="px-3 py-2 text-gray-700">{row[c.key] || "—"}</td>)}
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => saveRows(rows.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400">×</button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50">
                  {columns.map((c) => (
                    <td key={c.key} className="px-2 py-1.5">
                      <input type={c.type === "date" ? "date" : c.type === "number" ? "number" : "text"}
                        value={newRow[c.key] || ""}
                        onChange={(e) => setNewRow({ ...newRow, [c.key]: e.target.value })}
                        placeholder={c.label}
                        className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 min-w-16" />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-center">
                    <button onClick={addRow} className="text-white text-lg w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: primary }}>+</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">{rows.length} rows</p>
        </>
      ) : (
        <p className="text-center text-gray-400 text-sm py-8">Add a column to get started.</p>
      )}
    </TemplateShell>
  );
}
