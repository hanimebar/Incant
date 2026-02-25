"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const FORTUNES = [
  "The greatest risk is not taking one",
  "A smooth sea never made a skilled sailor",
  "What you seek is seeking you",
  "Begin, and the work will complete itself",
  "The best view comes after the hardest climb",
  "Fortune favors the prepared mind",
  "Today's preparation is tomorrow's opportunity",
  "Your smile is your logo, your personality is your business card",
  "Do what you love and the money will follow",
  "Every accomplishment starts with the decision to try",
  "You are the architect of your own destiny",
  "The only way to do great work is to love what you do",
  "Stars can't shine without darkness",
  "Small steps lead to big changes",
  "The secret of getting ahead is getting started",
  "Your kindness is your greatest strength",
  "What you think, you become",
  "The journey of a thousand miles begins with one step",
  "Trust the timing of your life",
  "Turn your wounds into wisdom",
];

function randomFortune(last: string | null): string {
  if (FORTUNES.length <= 1) return FORTUNES[0];
  let f: string;
  do {
    f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  } while (f === last);
  return f;
}

function randomLuckyNumbers(): number[] {
  const nums = new Set<number>();
  while (nums.size < 3) {
    nums.add(Math.floor(Math.random() * 99) + 1);
  }
  return [...nums];
}

type Phase = "whole" | "cracking" | "open";

export default function FortuneCookie({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [phase, setPhase] = useState<Phase>("whole");
  const [fortune, setFortune] = useState<string | null>(null);
  const [lastFortune, setLastFortune] = useState<string | null>(null);
  const [luckyNumbers, setLuckyNumbers] = useState<number[]>([]);

  function crack() {
    if (phase === "cracking") return;
    setPhase("cracking");
    setTimeout(() => {
      const f = randomFortune(lastFortune);
      setFortune(f);
      setLastFortune(f);
      setLuckyNumbers(randomLuckyNumbers());
      setPhase("open");
    }, 600);
  }

  function crackAnother() {
    setPhase("whole");
    setFortune(null);
    setTimeout(() => crack(), 100);
  }

  return (
    <TemplateShell config={config} icon="🥠">
      <div className="flex flex-col items-center gap-7">
        <style>{`
          @keyframes cookieCrack {
            0%   { transform: scale(1) rotate(0deg); }
            25%  { transform: scale(1.1) rotate(-8deg); }
            50%  { transform: scale(0.95) rotate(8deg); }
            75%  { transform: scale(1.05) rotate(-4deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes fortuneReveal {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Cookie graphic */}
        <button
          onClick={phase === "whole" ? crack : crackAnother}
          disabled={phase === "cracking"}
          className="relative flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform disabled:cursor-wait"
          aria-label="Crack the fortune cookie"
        >
          {phase === "whole" && (
            <span
              className="text-9xl"
              style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}
            >
              🥠
            </span>
          )}
          {phase === "cracking" && (
            <span
              className="text-9xl"
              style={{
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
                animation: "cookieCrack 0.6s ease-in-out",
              }}
            >
              🥠
            </span>
          )}
          {phase === "open" && (
            <div className="flex items-end gap-[-12px]">
              <span className="text-7xl" style={{ transform: "rotate(-30deg) translateY(8px)" }}>
                🍪
              </span>
              <span className="text-7xl" style={{ transform: "rotate(30deg) translateY(8px)" }}>
                🍪
              </span>
            </div>
          )}
        </button>

        {/* Fortune strip */}
        {phase === "open" && fortune && (
          <div
            className="w-full py-5 px-5 rounded-2xl text-center shadow-md"
            style={{
              background: `linear-gradient(135deg, #fef9ec, #fef3c7)`,
              border: `2px solid ${color}40`,
              animation: "fortuneReveal 0.5s ease-out",
            }}
          >
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
              Your fortune
            </p>
            <p
              className="text-xl font-bold leading-snug text-gray-800 italic"
              style={{ color: "#78350f" }}
            >
              "{fortune}"
            </p>
          </div>
        )}

        {/* Lucky numbers */}
        {phase === "open" && luckyNumbers.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Lucky numbers
            </p>
            <div className="flex gap-3">
              {luckyNumbers.map((n, i) => (
                <span
                  key={i}
                  className="w-11 h-11 rounded-full flex items-center justify-center font-black text-base text-white shadow-md"
                  style={{ backgroundColor: color }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {phase === "whole" && (
          <p className="text-gray-400 text-sm text-center">Tap the cookie to crack it open</p>
        )}
        {phase === "open" && (
          <button
            onClick={crackAnother}
            className="px-8 py-3 rounded-2xl text-white font-bold text-base active:scale-95 transition-transform shadow-md"
            style={{ backgroundColor: color }}
          >
            Crack another!
          </button>
        )}
      </div>
    </TemplateShell>
  );
}
