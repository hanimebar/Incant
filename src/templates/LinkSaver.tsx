"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface Link { id: string; url: string; title: string; tag: string; savedAt: string }

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

export default function LinkSaver({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-links`;
  const primary = config.primaryColor || "#0ea5e9";
  const tagOptions = config.categories || [];
  const [links, setLinks] = useState<Link[]>([]);
  const [form, setForm] = useState({ url: "", title: "", tag: tagOptions[0] || "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setLinks(JSON.parse(stored));
  }, [key]);

  const save = (updated: Link[]) => {
    setLinks(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const add = () => {
    if (!form.url.trim()) return;
    const url = form.url.startsWith("http") ? form.url : `https://${form.url}`;
    save([{ id: Date.now().toString(), url, title: form.title || getDomain(url), tag: form.tag, savedAt: new Date().toISOString() }, ...links]);
    setForm({ url: "", title: "", tag: tagOptions[0] || "" });
  };

  const filtered = links.filter((l) =>
    !search || l.title.toLowerCase().includes(search) || l.tag.toLowerCase().includes(search) || l.url.toLowerCase().includes(search)
  );

  const allTags = Array.from(new Set(links.map((l) => l.tag).filter(Boolean)));

  return (
    <TemplateShell config={config} icon="🔗">
      <div className="space-y-2 mb-5 bg-white rounded-xl border border-gray-100 p-4">
        <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
        <div className="flex gap-2">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title (optional)" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
          <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}
            list="tag-options" placeholder="Tag" className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
          <datalist id="tag-options">{tagOptions.map((t) => <option key={t} value={t} />)}</datalist>
        </div>
        <button onClick={add} disabled={!form.url.trim()}
          className="w-full py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40"
          style={{ backgroundColor: primary }}>Save Link</button>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value.toLowerCase())}
        placeholder="Search..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none mb-3" />

      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          <button onClick={() => setSearch("")}
            className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">All</button>
          {allTags.map((t) => (
            <button key={t} onClick={() => setSearch(t.toLowerCase())}
              className="px-2.5 py-1 rounded-full text-xs transition-all"
              style={{ backgroundColor: search === t.toLowerCase() ? primary : "#f3f4f6", color: search === t.toLowerCase() ? "white" : "#4b5563" }}>
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No links saved yet.</p>}
        {filtered.map((l) => (
          <div key={l.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
              {getDomain(l.url).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <a href={l.url} target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium hover:underline truncate block" style={{ color: primary }}>{l.title}</a>
              <p className="text-xs text-gray-400 truncate">{getDomain(l.url)}</p>
            </div>
            {l.tag && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">{l.tag}</span>}
            <button onClick={() => save(links.filter((x) => x.id !== l.id))} className="text-gray-300 hover:text-red-400 shrink-0">×</button>
          </div>
        ))}
      </div>
    </TemplateShell>
  );
}
