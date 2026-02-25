"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const QUOTES = [
  "The obstacle is the path, but so is the path.",
  "If you are the smartest person in the room, you are probably in the wrong room.",
  "Do not seek the treasure, become the treasure.",
  "The answer is always in the last place you look, because once you find it you stop looking.",
  "Every wall is a door, except for actual walls.",
  "The universe does not give you what you ask for, it gives you what you need, which is sometimes nothing.",
  "You miss 100% of the shots you don't take, but you also miss some that you do take.",
  "Not all who wander are lost, but some definitely are.",
  "The journey of a thousand miles begins with one step, unless you take a taxi.",
  "Be the change you wish to see, but double-check the change first.",
  "The early bird gets the worm, but the second mouse gets the cheese.",
  "Yesterday is history, tomorrow is a mystery, today is why you're procrastinating.",
  "To find yourself, first lose yourself, then retrace your steps.",
  "The clouds are temporary but so is everything else.",
  "Success is not about the destination, it is about the Wi-Fi along the way.",
  "If you want to go fast go alone, if you want to go far bring snacks.",
  "Not all storms come to disrupt your life, some come to clear your search history.",
  "A dream written down becomes a goal, a goal with steps becomes a plan, a plan with action becomes a disaster.",
  "Life is a journey not a destination, except when you take the wrong exit.",
  "You cannot pour from an empty cup, but you can order delivery.",
  "The mind is like a parachute — it only works when it is open, and occasionally fails anyway.",
  "Know thyself. Then forget thyself. Then Google thyself.",
  "The truth will set you free, but first it will confuse and annoy you.",
  "Fortune favours the bold, but also occasionally the person who just stays home.",
  "Time flies, but only because you keep looking at your phone.",
  "In the end we only regret the chances we didn't take and the Wi-Fi passwords we forgot.",
  "The cave you fear to enter holds the treasure you seek. Also, possibly bats.",
  "He who asks a question is a fool for five minutes. He who does not ask remains a fool forever and saves five minutes.",
  "The best time to plant a tree was 20 years ago. The second best time is to plant a virtual one.",
  "Comparison is the thief of joy, but so are utility bills.",
];

const ATTRIBUTIONS = [
  "— Confucius (probably)",
  "— Ancient Finnish proverb",
  "— Sun Tzu, maybe",
  "— Someone wise on the internet",
  "— Aristotle (allegedly)",
  "— A fortune cookie",
  "— Unknown genius",
  "— Your future self",
  "— A monk who really knew their stuff",
  "— Socrates, on a bad day",
  "— Anonymous philosopher, 3am",
  "— Lao Tzu (translation disputed)",
  "— An extremely confident LinkedIn post",
  "— Marcus Aurelius, if he'd had Wi-Fi",
  "— A surprisingly profound tea bag label",
];

function pickRandom<T>(arr: T[], exclude?: T): T {
  const filtered = exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export default function FakeQuote({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const [quote, setQuote] = useState<string | null>(null);
  const [attribution, setAttribution] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);

  const generate = () => {
    setAnimating(true);
    setTimeout(() => {
      setQuote((prev) => pickRandom(QUOTES, prev ?? undefined));
      setAttribution(pickRandom(ATTRIBUTIONS));
      setAnimating(false);
    }, 180);
  };

  const copyQuote = () => {
    if (!quote || !attribution) return;
    const text = `"${quote}" ${attribution}`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareQuote = () => {
    if (!quote || !attribution) return;
    const text = `"${quote}" ${attribution}`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <TemplateShell config={config} icon="💬">
      <div className="p-4 space-y-5">
        {/* Quote card */}
        <div
          className="relative rounded-3xl p-6 min-h-44 flex flex-col justify-between shadow-md"
          style={{ backgroundColor: `${color}10`, borderLeft: `4px solid ${color}` }}
        >
          {/* Big quotation mark */}
          <span
            className="text-8xl font-serif leading-none select-none absolute -top-3 left-4"
            style={{ color: `${color}25` }}
          >
            "
          </span>

          <div
            className="mt-4 space-y-4"
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? "translateY(6px)" : "translateY(0)",
              transition: "opacity 0.2s ease, transform 0.2s ease",
            }}
          >
            {quote ? (
              <>
                <p className="text-base font-medium text-gray-900 leading-relaxed relative z-10">
                  &ldquo;{quote}&rdquo;
                </p>
                <p className="text-sm text-gray-500 italic">{attribution}</p>
              </>
            ) : (
              <p className="text-gray-400 text-sm text-center pt-6">
                Press Generate for some wisdom.
              </p>
            )}
          </div>

          {/* Action buttons */}
          {quote && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={copyQuote}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors"
                style={{ borderColor: `${color}50`, color }}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
              <button
                onClick={shareQuote}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors"
                style={{ borderColor: `${color}50`, color }}
              >
                Share
              </button>
            </div>
          )}
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm shadow-lg transition-transform active:scale-[0.98]"
          style={{ backgroundColor: color }}
        >
          {quote ? "Generate Another" : "Generate Quote"}
        </button>

        {/* Attribution note */}
        <p className="text-xs text-gray-400 text-center">
          All quotes are entirely made up for entertainment. Any resemblance to actual wisdom is coincidental.
        </p>
      </div>
    </TemplateShell>
  );
}
