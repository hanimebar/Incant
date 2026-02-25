"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { Spell } from "@/types";

interface Props {
  spell: Spell;
  onClose: () => void;
  onSaved: (updated: Spell) => void;
}

export default function EditSpellModal({ spell, onClose, onSaved }: Props) {
  const [name, setName] = useState(spell.name);
  const [description, setDescription] = useState(spell.config.description ?? "");
  const [primaryColor, setPrimaryColor] = useState(spell.config.primaryColor ?? "#6366f1");
  const [goal, setGoal] = useState(spell.config.goal !== undefined ? String(spell.config.goal) : "");
  const [unit, setUnit] = useState(spell.config.unit ?? "");
  const [currency, setCurrency] = useState(spell.config.currency ?? "");
  const [categories, setCategories] = useState(
    spell.config.categories ? spell.config.categories.join(", ") : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    const config: Record<string, unknown> = {
      description: description.trim() || undefined,
      primaryColor,
    };
    if (spell.config.goal !== undefined) config.goal = Number(goal) || 0;
    if (spell.config.unit !== undefined) config.unit = unit.trim();
    if (spell.config.currency !== undefined) config.currency = currency.trim();
    if (spell.config.categories !== undefined) {
      config.categories = categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }

    try {
      const res = await fetch(`/api/spells/${spell.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), config }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save. Try again.");
        return;
      }
      const updated = await res.json();
      onSaved(updated);
      onClose();
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg">Edit spell</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Primary colour */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary colour</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-sm text-gray-500 font-mono">{primaryColor}</span>
            </div>
          </div>

          {/* Goal (conditional) */}
          {spell.config.goal !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          {/* Unit (conditional) */}
          {spell.config.unit !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          {/* Currency (conditional) */}
          {spell.config.currency !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          {/* Categories (conditional) */}
          {spell.config.categories !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
              <input
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder="e.g. Work, Personal, Health"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-[#0f0a2e] text-white hover:bg-indigo-900 disabled:opacity-50 transition-all"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
