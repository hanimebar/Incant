"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const COMPLIMENTS = [
  "You have a gift for making everyone around you feel at ease.",
  "Your creativity is genuinely inspiring.",
  "The world is a measurably better place because you're in it.",
  "You have an incredible ability to see the best in people.",
  "Your perseverance is something others can only dream of.",
  "You light up every room you walk into.",
  "You make difficult things look effortless.",
  "Your kindness leaves a lasting impression on everyone you meet.",
  "You have a rare ability to truly listen.",
  "You are exactly the right amount of extra.",
  "Your energy is contagious in the best possible way.",
  "You turn ordinary moments into something memorable.",
  "You have the courage to be yourself, which takes more bravery than most people realise.",
  "You make the people around you want to be better.",
  "Your sense of humour is absolutely top tier.",
  "You have great instincts and you should trust them more.",
  "You're someone people genuinely look forward to seeing.",
  "You handle hard situations with grace that most people don't have.",
  "You make things better just by showing up.",
  "Your perspective is something the world genuinely needs.",
  "You are more capable than you give yourself credit for.",
  "You have a quiet strength that is impossible to ignore.",
  "You ask the right questions at exactly the right time.",
  "Your dedication to the things you care about is remarkable.",
  "You make people feel seen, and that is a rare talent.",
  "You have excellent taste.",
  "You are someone worth knowing.",
  "Your enthusiasm makes everything more interesting.",
  "You are genuinely one of the good ones.",
  "You have a way of saying exactly what needs to be said.",
];

const CATEGORIES = ["General ✨", "Strength 💪", "Creative 🎨", "Kind 💛"];

export default function ComplimentMachine({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [compliment, setCompliment] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(0);

  const generate = () => {
    setAnimating(true);
    setTimeout(() => {
      const random = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
      setCompliment(random);
      setCount((c) => c + 1);
      setAnimating(false);
    }, 300);
  };

  const copy = async () => {
    if (!compliment) return;
    await navigator.clipboard.writeText(compliment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TemplateShell config={config}>
      <div className="p-4 flex flex-col items-center gap-6 text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg"
          style={{ backgroundColor: `${color}20`, border: `3px solid ${color}40` }}
        >
          ✨
        </div>

        <div
          className="min-h-[120px] flex items-center justify-center w-full p-6 rounded-2xl border-2 transition-opacity duration-300"
          style={{
            borderColor: `${color}30`,
            backgroundColor: `${color}08`,
            opacity: animating ? 0 : 1,
          }}
        >
          {compliment ? (
            <p className="text-lg font-medium text-gray-700 leading-relaxed italic">
              &ldquo;{compliment}&rdquo;
            </p>
          ) : (
            <p className="text-gray-400 text-sm">
              {config.description || "Tap below for your compliment"}
            </p>
          )}
        </div>

        <button
          onClick={generate}
          className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all active:scale-95 shadow-md"
          style={{ backgroundColor: color }}
        >
          {count === 0 ? "Get a compliment ✨" : "Another one! ✨"}
        </button>

        {compliment && (
          <button
            onClick={copy}
            className="text-sm font-medium transition-colors"
            style={{ color: copied ? "#22c55e" : color }}
          >
            {copied ? "✓ Copied!" : "Copy to clipboard"}
          </button>
        )}

        {count > 0 && (
          <p className="text-xs text-gray-400">{count} compliment{count !== 1 ? "s" : ""} received today</p>
        )}
      </div>
    </TemplateShell>
  );
}
