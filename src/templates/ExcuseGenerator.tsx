"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type CategoryId =
  | "late-work"
  | "missed-call"
  | "didnt-reply"
  | "cant-attend"
  | "homework"
  | "late-payment";

interface ExcuseCategory {
  id: CategoryId;
  label: string;
  emoji: string;
  excuses: { text: string; quality: 1 | 2 | 3 | 4 | 5 }[];
}

const CATEGORIES: ExcuseCategory[] = [
  {
    id: "late-work",
    label: "Late for work",
    emoji: "⏰",
    excuses: [
      { text: "My alarm clock displayed the time in 24-hour format and I misread it.", quality: 3 },
      { text: "There was an unusually polite queue at the coffee shop.", quality: 4 },
      { text: "I was helping an elderly person cross the road. Twice.", quality: 4 },
      { text: "My GPS took me through a completely different part of the city.", quality: 3 },
      { text: "I had to wait for a very slow elevator.", quality: 2 },
      { text: "I was finalising some important thoughts in my car.", quality: 2 },
      { text: "There was a very interesting documentary on this morning.", quality: 1 },
      { text: "My neighbour asked me a quick question that took 40 minutes.", quality: 3 },
      { text: "I was stress-testing my commute for future reference.", quality: 5 },
      { text: "The traffic light sequence was particularly challenging today.", quality: 4 },
    ],
  },
  {
    id: "missed-call",
    label: "Missed call",
    emoji: "📵",
    excuses: [
      { text: "I was in a very loud area and didn't hear my phone.", quality: 4 },
      { text: "My phone was on silent after a meeting I forgot to leave.", quality: 3 },
      { text: "I was swimming. Metaphorically. In work.", quality: 3 },
      { text: "The signal in my building has been acting up again.", quality: 4 },
      { text: "I saw the call but was holding something fragile with both hands.", quality: 4 },
      { text: "My phone fell into my bag at an unreachable angle.", quality: 3 },
      { text: "I was on another call that lasted longer than expected.", quality: 5 },
      { text: "I was in a tunnel at the exact moment you rang.", quality: 3 },
      { text: "The ringtone changed and I didn't recognise the sound.", quality: 2 },
      { text: "I thought it might be a spam call based on the last few I had.", quality: 2 },
    ],
  },
  {
    id: "didnt-reply",
    label: "Didn't reply",
    emoji: "📩",
    excuses: [
      { text: "I read it, thought I'd replied, and then found out I'd only thought about replying.", quality: 5 },
      { text: "I was crafting a really thorough response and ran out of time.", quality: 4 },
      { text: "My notifications get buried by the time I look at my phone.", quality: 3 },
      { text: "I saw it when I couldn't respond and forgot when I could.", quality: 5 },
      { text: "I was going to reply and then a thing happened.", quality: 2 },
      { text: "The message got pushed up and I thought I'd already seen it.", quality: 3 },
      { text: "I was in a focus mode and missed it entirely.", quality: 4 },
      { text: "I started typing a reply and accidentally closed the app.", quality: 3 },
      { text: "I was waiting to reply until I had the answer you needed.", quality: 4 },
      { text: "I completely misread the notification and thought it was something else.", quality: 3 },
    ],
  },
  {
    id: "cant-attend",
    label: "Can't attend",
    emoji: "🚫",
    excuses: [
      { text: "I have a prior commitment that just came up slightly before your invite did.", quality: 3 },
      { text: "I'm not feeling 100% and don't want to pass anything on.", quality: 5 },
      { text: "My schedule has been completely rewritten by circumstances beyond my control.", quality: 3 },
      { text: "I have a non-negotiable family thing on that day.", quality: 5 },
      { text: "I need to be somewhere else at that exact time unfortunately.", quality: 2 },
      { text: "I have a conflict that I couldn't foresee when you first mentioned it.", quality: 3 },
      { text: "Transport is looking unreliable that day and I can't risk it.", quality: 3 },
      { text: "I've already RSVP'd to something else in that window.", quality: 4 },
      { text: "Work obligations have expanded to cover that timeslot entirely.", quality: 3 },
      { text: "I'll be travelling and the connection is uncertain.", quality: 4 },
    ],
  },
  {
    id: "homework",
    label: "Homework",
    emoji: "📚",
    excuses: [
      { text: "I completed it but saved it to the wrong cloud folder and it synced over itself.", quality: 4 },
      { text: "My printer ran out of ink at 11pm and the shops were closed.", quality: 3 },
      { text: "I was referencing a source that turned out to be incorrect so I started over.", quality: 4 },
      { text: "There was a power cut that lasted precisely as long as my working session.", quality: 3 },
      { text: "I thought the deadline was tomorrow. I was very nearly right.", quality: 3 },
      { text: "A family situation came up and I had to prioritise accordingly.", quality: 5 },
      { text: "I'm not satisfied with the quality yet and don't want to submit something below standard.", quality: 4 },
      { text: "My file became corrupted when I went to email it. The timing was terrible.", quality: 3 },
      { text: "I spent so long on the research phase that the writing phase ran out of time.", quality: 3 },
      { text: "I finished it but I've been unwell and my productivity has been impacted.", quality: 4 },
    ],
  },
  {
    id: "late-payment",
    label: "Late payment",
    emoji: "💸",
    excuses: [
      { text: "My bank app was down for maintenance at the exact moment I tried to pay.", quality: 4 },
      { text: "I queued the transfer but it went to a pending state I didn't monitor.", quality: 3 },
      { text: "The invoice came to my junk folder and I only found it recently.", quality: 4 },
      { text: "There was a hold on my card that I'm still resolving.", quality: 3 },
      { text: "I changed banks and the transition period caused some delays.", quality: 4 },
      { text: "I thought it had already gone out based on a previous instruction.", quality: 3 },
      { text: "I was waiting on an incoming payment to cover this — it arrived later than expected.", quality: 4 },
      { text: "I set a reminder and then the reminder didn't fire.", quality: 2 },
      { text: "I processed it from a different account and it's still clearing.", quality: 3 },
      { text: "An administrative error on my end that I've since corrected.", quality: 5 },
    ],
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < count ? "text-yellow-400" : "text-gray-200"}`}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ExcuseGenerator({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const [categoryId, setCategoryId] = useState<CategoryId>("late-work");
  const [currentExcuse, setCurrentExcuse] = useState<{ text: string; quality: number } | null>(
    null
  );
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);

  const category = CATEGORIES.find((c) => c.id === categoryId)!;

  const generate = () => {
    const available = category.excuses
      .map((_, i) => i)
      .filter((i) => !usedIndices.includes(i));
    const pool = available.length > 0 ? available : category.excuses.map((_, i) => i);
    const idx = pool[Math.floor(Math.random() * pool.length)];

    setAnimating(true);
    setTimeout(() => {
      setCurrentExcuse(category.excuses[idx]);
      setUsedIndices((prev) => (available.length > 0 ? [...prev, idx] : [idx]));
      setAnimating(false);
    }, 150);
  };

  const handleCategoryChange = (id: CategoryId) => {
    setCategoryId(id);
    setCurrentExcuse(null);
    setUsedIndices([]);
    setCopied(false);
  };

  const useExcuse = () => {
    if (!currentExcuse) return;
    navigator.clipboard.writeText(currentExcuse.text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TemplateShell config={config} icon="🤥">
      <div className="p-4 space-y-4">
        {/* Category selector */}
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all"
              style={{
                backgroundColor: categoryId === cat.id ? color : "#f9fafb",
                color: categoryId === cat.id ? "#fff" : "#374151",
                border: `1.5px solid ${categoryId === cat.id ? color : "#e5e7eb"}`,
                fontWeight: categoryId === cat.id ? 600 : 400,
              }}
            >
              <span className="text-base">{cat.emoji}</span>
              <span className="text-xs leading-snug">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Excuse card */}
        <div
          className="rounded-2xl p-5 min-h-28 flex flex-col justify-between shadow-sm"
          style={{ backgroundColor: `${color}08`, border: `1.5px solid ${color}25` }}
        >
          <div
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? "translateY(4px)" : "translateY(0)",
              transition: "opacity 0.18s ease, transform 0.18s ease",
            }}
          >
            {currentExcuse ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  &ldquo;{currentExcuse.text}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Believability:</span>
                  <Stars count={currentExcuse.quality} />
                  <span className="text-xs text-gray-400">
                    {currentExcuse.quality >= 5
                      ? "Masterful"
                      : currentExcuse.quality >= 4
                      ? "Convincing"
                      : currentExcuse.quality >= 3
                      ? "Decent"
                      : currentExcuse.quality >= 2
                      ? "Risky"
                      : "Obvious"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">
                Select a category and generate your excuse.
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={generate}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium shadow-md transition-transform active:scale-[0.98]"
            style={{ backgroundColor: color }}
          >
            {currentExcuse ? "Too Obvious →" : `Generate Excuse`}
          </button>
          {currentExcuse && (
            <button
              onClick={useExcuse}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors"
              style={{
                borderColor: color,
                color,
                backgroundColor: copied ? `${color}15` : "transparent",
              }}
            >
              {copied ? "Copied! ✓" : "Use This One"}
            </button>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center">
          Use responsibly. We accept no liability for failed excuses.
        </p>
      </div>
    </TemplateShell>
  );
}
