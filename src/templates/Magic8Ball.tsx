"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const ANSWERS = [
  "It is certain",
  "It is decidedly so",
  "Without a doubt",
  "Yes definitely",
  "You may rely on it",
  "As I see it yes",
  "Most likely",
  "Outlook good",
  "Yes",
  "Signs point to yes",
  "Reply hazy try again",
  "Ask again later",
  "Better not tell you now",
  "Cannot predict now",
  "Concentrate and ask again",
  "Don't count on it",
  "My reply is no",
  "My sources say no",
  "Outlook not so good",
  "Very doubtful",
];

type Category = "positive" | "neutral" | "negative";

function getCategory(answer: string): Category {
  const positiveIdx = ANSWERS.indexOf(answer);
  if (positiveIdx < 10) return "positive";
  if (positiveIdx < 15) return "neutral";
  return "negative";
}

const CATEGORY_COLOR: Record<Category, string> = {
  positive: "#22c55e",
  neutral: "#f59e0b",
  negative: "#ef4444",
};

export default function Magic8Ball({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [revealing, setRevealing] = useState(false);

  function shake() {
    if (shaking || revealing) return;
    setAnswer(null);
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
      setRevealing(true);
      const picked = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
      setAnswer(picked);
      setTimeout(() => setRevealing(false), 400);
    }, 600);
  }

  const category = answer ? getCategory(answer) : null;
  const answerColor = category ? CATEGORY_COLOR[category] : "#ffffff";

  return (
    <TemplateShell config={config} icon="🎱">
      <div className="flex flex-col items-center gap-6">
        {/* Question input */}
        <div className="w-full">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question… (optional)"
            className="w-full px-4 py-3 rounded-2xl border-2 text-base outline-none bg-white text-gray-700 placeholder-gray-300 transition-colors"
            style={{ borderColor: `${color}40` }}
          />
        </div>

        {/* The 8-ball */}
        <style>{`
          @keyframes shake8 {
            0%  { transform: translate(0,0) rotate(0deg); }
            15% { transform: translate(-8px, 4px) rotate(-6deg); }
            30% { transform: translate(8px, -4px) rotate(6deg); }
            45% { transform: translate(-6px, 6px) rotate(-4deg); }
            60% { transform: translate(6px, -6px) rotate(4deg); }
            75% { transform: translate(-4px, 2px) rotate(-2deg); }
            90% { transform: translate(4px, -2px) rotate(2deg); }
            100%{ transform: translate(0,0) rotate(0deg); }
          }
          @keyframes fadeReveal {
            from { opacity: 0; transform: scale(0.7); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>

        <button
          onClick={shake}
          disabled={shaking || revealing}
          className="relative flex items-center justify-center rounded-full shadow-2xl select-none cursor-pointer active:scale-95 transition-transform disabled:cursor-wait"
          style={{
            width: 240,
            height: 240,
            background: "radial-gradient(circle at 35% 35%, #2d2d3a, #0a0a14)",
            animation: shaking ? "shake8 0.6s ease-in-out" : "none",
          }}
          aria-label="Shake the Magic 8-Ball"
        >
          {/* White circle */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: 110,
              height: 110,
              background: "radial-gradient(circle at 40% 40%, #2a2a3d, #111128)",
              border: "3px solid rgba(255,255,255,0.15)",
            }}
          >
            {shaking || revealing ? (
              <span className="text-4xl font-black text-white opacity-60">8</span>
            ) : answer ? (
              <p
                className="text-center text-xs font-bold leading-tight px-2"
                style={{
                  color: answerColor,
                  animation: "fadeReveal 0.4s ease-out",
                }}
              >
                {answer}
              </p>
            ) : (
              <span className="text-4xl font-black text-white opacity-60">8</span>
            )}
          </div>

          {/* Shine */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 60,
              height: 60,
              top: 28,
              left: 36,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)",
            }}
          />
        </button>

        <p className="text-sm text-gray-400 text-center">
          {shaking
            ? "Consulting the spirits…"
            : revealing
            ? "The answer appears…"
            : answer
            ? "Tap to ask again"
            : "Tap the ball to reveal your fate"}
        </p>

        {/* Answer category indicator */}
        {answer && !shaking && !revealing && (
          <div
            className="px-4 py-2 rounded-full text-sm font-semibold"
            style={{
              background: `${answerColor}20`,
              color: answerColor,
              border: `1px solid ${answerColor}40`,
            }}
          >
            {category === "positive" ? "✨ Positive" : category === "neutral" ? "🔮 Uncertain" : "⚠️ Negative"}
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
