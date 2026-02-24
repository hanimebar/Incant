"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";
import type { TemplateConfig } from "@/types";

interface Response { answers: Record<string, string>; submittedAt: string }

const DEFAULT_FIELDS: TemplateConfig["fields"] = [
  { key: "name", label: "Your name", type: "text", placeholder: "Enter your name" },
  { key: "email", label: "Email address", type: "text", placeholder: "you@example.com" },
  { key: "rating", label: "Rating", type: "select", options: ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"] },
  { key: "feedback", label: "Feedback", type: "text", placeholder: "Your feedback..." },
];

export default function FormSurvey({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-form`;
  const primary = config.primaryColor || "#6366f1";
  const fields = config.fields && config.fields.length > 0 ? config.fields : DEFAULT_FIELDS!;

  const [responses, setResponses] = useState<Response[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [view, setView] = useState<"form" | "responses">("form");

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setResponses(JSON.parse(stored));
  }, [key]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [{ answers, submittedAt: new Date().toISOString() }, ...responses];
    setResponses(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    setSubmitted(true);
    setAnswers({});
  };

  return (
    <TemplateShell config={config} icon="📝">
      <div className="flex gap-2 mb-5">
        <button onClick={() => { setView("form"); setSubmitted(false); }}
          className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ backgroundColor: view === "form" ? primary : "#f3f4f6", color: view === "form" ? "white" : "#6b7280" }}>
          Fill Form
        </button>
        <button onClick={() => setView("responses")}
          className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ backgroundColor: view === "responses" ? primary : "#f3f4f6", color: view === "responses" ? "white" : "#6b7280" }}>
          Responses ({responses.length})
        </button>
      </div>

      {view === "form" ? (
        submitted ? (
          <div className="text-center py-10">
            <p className="text-5xl mb-3">✅</p>
            <p className="text-xl font-bold text-gray-800 mb-2">Submitted!</p>
            <p className="text-gray-500 text-sm mb-4">Thank you for your response.</p>
            <button onClick={() => setSubmitted(false)} className="px-5 py-2.5 rounded-xl text-white text-sm" style={{ backgroundColor: primary }}>
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                {f.type === "select" ? (
                  <select value={answers[f.key] || ""} onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
                    <option value="">Select...</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === "number" ? (
                  <input type="number" value={answers[f.key] || ""} onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
                ) : (
                  <input type="text" value={answers[f.key] || ""} onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
                )}
              </div>
            ))}
            <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: primary }}>
              Submit
            </button>
          </form>
        )
      ) : (
        <div className="space-y-3">
          {responses.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No responses yet.</p>}
          {responses.map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-2">{new Date(r.submittedAt).toLocaleString()}</p>
              {fields.map((f) => r.answers[f.key] && (
                <div key={f.key} className="flex gap-2 text-sm">
                  <span className="text-gray-500 shrink-0">{f.label}:</span>
                  <span className="text-gray-800 font-medium">{r.answers[f.key]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </TemplateShell>
  );
}
