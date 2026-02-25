"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const TRUTHS = [
  "What's your biggest fear?",
  "What's the most embarrassing thing you've done?",
  "Have you ever lied to a best friend?",
  "What's your biggest secret?",
  "What's the worst gift you've ever received?",
  "Have you ever cheated in a game?",
  "What's your most awkward memory?",
  "Who was your first crush?",
  "What's a talent you wish you had?",
  "What's the pettiest thing you've done?",
  "Have you ever blamed someone else for something you did?",
  "What's the longest you've gone without showering?",
  "What's a bad habit you have?",
  "Have you ever cried at a movie?",
  "What's the most childish thing you still do?",
  "Have you ever pretended to be sick to skip something?",
  "What's your most controversial opinion?",
  "Have you ever sent a text to the wrong person?",
  "What's the most ridiculous thing you've been afraid of?",
  "What's something you've never told anyone?",
];

const DARES = [
  "Do your best animal impression",
  "Speak in an accent for the next 3 rounds",
  "Text someone 'I have a secret to tell you' and wait for their reply",
  "Do 20 jumping jacks right now",
  "Let someone post a status on your social media",
  "Eat a spoonful of something weird",
  "Sing the chorus of any song",
  "Call a family member and say 'I have exciting news' then make something up",
  "Draw a portrait of the person to your left",
  "Talk in third person for the next 2 rounds",
  "Do your best celebrity impression",
  "Read your last search history out loud",
  "Howl like a wolf for 30 seconds",
  "Let someone tickle you for 10 seconds",
  "Try to lick your elbow",
  "Do your best robot dance",
  "Speak only in questions for the next 3 rounds",
  "Send a funny voice message to someone",
  "Make up a rap about the person next to you",
  "Act out a movie scene without speaking",
];

type Category = "truth" | "dare";

function pickRandom<T>(arr: T[], last: T | null): T {
  if (arr.length <= 1) return arr[0];
  let item: T;
  do {
    item = arr[Math.floor(Math.random() * arr.length)];
  } while (item === last);
  return item;
}

export default function TruthOrDare({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [category, setCategory] = useState<Category | null>(null);
  const [card, setCard] = useState<string | null>(null);
  const [lastCard, setLastCard] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  const truthColor = "#6366f1";
  const dareColor = "#ef4444";

  function reveal(cat: Category) {
    setRevealing(true);
    setCategory(cat);
    setTimeout(() => {
      const list = cat === "truth" ? TRUTHS : DARES;
      const next = pickRandom(list, lastCard);
      setCard(next);
      setLastCard(next);
      setRevealing(false);
    }, 300);
  }

  function next() {
    if (!category) return;
    reveal(category);
  }

  const activeColor = category === "truth" ? truthColor : dareColor;

  return (
    <TemplateShell config={config} icon="🎭">
      <div className="flex flex-col gap-5">
        <style>{`
          @keyframes cardReveal {
            from { opacity: 0; transform: rotateX(90deg) scale(0.9); }
            to   { opacity: 1; transform: rotateX(0deg) scale(1); }
          }
        `}</style>

        {/* Pick buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => reveal("truth")}
            className="py-5 rounded-2xl text-white font-black text-lg shadow-lg active:scale-95 transition-transform"
            style={{ backgroundColor: truthColor }}
          >
            Truth 🤔
          </button>
          <button
            onClick={() => reveal("dare")}
            className="py-5 rounded-2xl text-white font-black text-lg shadow-lg active:scale-95 transition-transform"
            style={{ backgroundColor: dareColor }}
          >
            Dare 😈
          </button>
        </div>

        {/* Card */}
        {(card || revealing) && (
          <div
            className="rounded-3xl p-6 text-white shadow-xl min-h-36 flex flex-col justify-between"
            style={{
              background: `linear-gradient(135deg, ${activeColor}, ${activeColor}bb)`,
              animation: revealing ? "none" : "cardReveal 0.3s ease-out",
              opacity: revealing ? 0.4 : 1,
            }}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-3">
                {category === "truth" ? "🤔 Truth" : "😈 Dare"}
              </p>
              <p className="text-xl font-bold leading-snug">{card}</p>
            </div>
          </div>
        )}

        {/* Next button */}
        {card && !revealing && (
          <button
            onClick={next}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-base active:scale-95 transition-transform"
            style={{ backgroundColor: activeColor }}
          >
            Next {category === "truth" ? "Truth" : "Dare"}
          </button>
        )}

        {!card && (
          <p className="text-center text-gray-400 text-sm py-4">
            Tap Truth or Dare to reveal a challenge
          </p>
        )}
      </div>
    </TemplateShell>
  );
}
