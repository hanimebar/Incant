"use client";

import { useState, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

interface Question { id: string; question: string; options: string[]; correctIndex: number }
type Mode = "edit" | "quiz" | "results";

export default function QuizBuilder({ config, spellId }: TemplateProps) {
  const key = `incant-${spellId}-quiz`;
  const primary = config.primaryColor || "#8b5cf6";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mode, setMode] = useState<Mode>("edit");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [form, setForm] = useState({ question: "", options: ["", "", "", ""], correctIndex: 0 });

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setQuestions(JSON.parse(stored));
  }, [key]);

  const save = (updated: Question[]) => {
    setQuestions(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const addQ = () => {
    if (!form.question.trim() || form.options.some((o) => !o.trim())) return;
    save([...questions, { id: Date.now().toString(), ...form }]);
    setForm({ question: "", options: ["", "", "", ""], correctIndex: 0 });
  };

  const startQuiz = () => { setMode("quiz"); setCurrentQ(0); setAnswers([]); setSelected(null); };

  const answer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, idx];
      setAnswers(newAnswers);
      setSelected(null);
      if (currentQ + 1 >= questions.length) {
        setMode("results");
      } else {
        setCurrentQ(currentQ + 1);
      }
    }, 800);
  };

  const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;

  if (mode === "quiz" && questions.length > 0) {
    const q = questions[currentQ];
    return (
      <TemplateShell config={config} icon="❓">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-500">Question {currentQ + 1} of {questions.length}</p>
            <button onClick={() => setMode("edit")} className="text-xs text-gray-400 underline">Exit</button>
          </div>
          <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${((currentQ) / questions.length) * 100}%`, backgroundColor: primary }} />
          </div>
        </div>
        <p className="text-lg font-semibold text-gray-800 mb-5">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let bg = "bg-gray-50 border-gray-200";
            if (selected !== null) {
              if (i === q.correctIndex) bg = "bg-green-50 border-green-400";
              else if (i === selected) bg = "bg-red-50 border-red-400";
            }
            return (
              <button key={i} onClick={() => answer(i)}
                className={`w-full text-left p-4 rounded-xl border-2 text-sm transition-all ${bg}`}>
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
              </button>
            );
          })}
        </div>
      </TemplateShell>
    );
  }

  if (mode === "results") {
    return (
      <TemplateShell config={config} icon="❓">
        <div className="text-center py-8">
          <p className="text-6xl mb-4">{score === questions.length ? "🏆" : score >= questions.length / 2 ? "👍" : "📚"}</p>
          <p className="text-4xl font-bold mb-2" style={{ color: primary }}>{score}/{questions.length}</p>
          <p className="text-gray-500 mb-6">
            {score === questions.length ? "Perfect score!" : score >= questions.length / 2 ? "Good job!" : "Keep studying!"}
          </p>
          <div className="space-y-2 text-left mb-6">
            {questions.map((q, i) => (
              <div key={q.id} className="flex items-center gap-2 text-sm">
                <span>{answers[i] === q.correctIndex ? "✅" : "❌"}</span>
                <span className="text-gray-700 truncate">{q.question}</span>
              </div>
            ))}
          </div>
          <button onClick={startQuiz} className="px-6 py-3 rounded-xl text-white font-medium mr-3" style={{ backgroundColor: primary }}>
            Try Again
          </button>
          <button onClick={() => setMode("edit")} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium">Edit Quiz</button>
        </div>
      </TemplateShell>
    );
  }

  return (
    <TemplateShell config={config} icon="❓">
      {questions.length > 0 && (
        <button onClick={startQuiz} className="w-full py-3 rounded-xl text-white font-semibold mb-5" style={{ backgroundColor: primary }}>
          ▶ Start Quiz ({questions.length} questions)
        </button>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 space-y-2">
        <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
          placeholder="Question" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
        {form.options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <button onClick={() => setForm({ ...form, correctIndex: i })}
              className="w-8 h-8 rounded-full border-2 text-xs font-bold shrink-0"
              style={{ borderColor: primary, backgroundColor: form.correctIndex === i ? primary : "transparent", color: form.correctIndex === i ? "white" : primary }}>
              {String.fromCharCode(65 + i)}
            </button>
            <input value={opt} onChange={(e) => { const opts = [...form.options]; opts[i] = e.target.value; setForm({ ...form, options: opts }); }}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
          </div>
        ))}
        <p className="text-xs text-gray-400">Click A/B/C/D to mark correct answer</p>
        <button onClick={addQ} className="w-full py-2.5 rounded-xl text-white font-medium text-sm" style={{ backgroundColor: primary }}>
          Add Question
        </button>
      </div>

      <div className="space-y-2">
        {questions.map((q, i) => (
          <div key={q.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
            <p className="text-sm text-gray-700 flex-1 truncate">{i + 1}. {q.question}</p>
            <button onClick={() => save(questions.filter((x) => x.id !== q.id))} className="text-gray-300 hover:text-red-400 ml-2">×</button>
          </div>
        ))}
      </div>
    </TemplateShell>
  );
}
