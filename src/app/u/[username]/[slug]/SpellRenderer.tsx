"use client";

import { Suspense, lazy } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Spell } from "@/types";
import type { TemplateId } from "@/types";
import HomeScreenBanner from "@/components/HomeScreenBanner";

const TEMPLATE_MAP: Record<TemplateId, ReturnType<typeof lazy>> = {
  "habit-tracker": lazy(() => import("@/templates/HabitTracker")),
  "water-intake": lazy(() => import("@/templates/WaterIntake")),
  "mood-tracker": lazy(() => import("@/templates/MoodTracker")),
  "workout-log": lazy(() => import("@/templates/WorkoutLog")),
  "sleep-tracker": lazy(() => import("@/templates/SleepTracker")),
  "expense-logger": lazy(() => import("@/templates/ExpenseLogger")),
  "tip-calculator": lazy(() => import("@/templates/TipCalculator")),
  "bill-splitter": lazy(() => import("@/templates/BillSplitter")),
  "savings-goal": lazy(() => import("@/templates/SavingsGoal")),
  "todo-list": lazy(() => import("@/templates/TodoList")),
  "reading-list": lazy(() => import("@/templates/ReadingList")),
  "link-saver": lazy(() => import("@/templates/LinkSaver")),
  "daily-journal": lazy(() => import("@/templates/DailyJournal")),
  "goal-tracker": lazy(() => import("@/templates/GoalTracker")),
  "quiz-builder": lazy(() => import("@/templates/QuizBuilder")),
  "countdown-timer": lazy(() => import("@/templates/CountdownTimer")),
  "form-survey": lazy(() => import("@/templates/FormSurvey")),
  "flashcard-deck": lazy(() => import("@/templates/FlashcardDeck")),
  "data-table": lazy(() => import("@/templates/DataTable")),
  "custom-reminder": lazy(() => import("@/templates/CustomReminder")),
};

interface Props {
  spell: Spell;
}

export default function SpellRenderer({ spell }: Props) {
  const [copied, setCopied] = useState(false);

  const TemplateComponent = TEMPLATE_MAP[spell.template_id as TemplateId];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: spell.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!TemplateComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Unknown template: {spell.template_id}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Add to Home Screen banner */}
      <HomeScreenBanner />

      {/* Share bar */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0f0a2e] text-white text-sm font-medium shadow-xl hover:bg-indigo-900 transition-all"
        >
          {copied ? (
            <><Check className="w-4 h-4 text-green-400" /> Copied!</>
          ) : (
            <><Share2 className="w-4 h-4" /> Share</>
          )}
        </button>
      </div>

      {/* Incant branding (shown for free tier — controlled server-side via config) */}
      {spell.config.customData && !!(spell.config.customData as Record<string, unknown>).showBranding && (
        <div className="text-center py-1.5 bg-indigo-950 text-indigo-400 text-xs">
          Made with{" "}
          <a href="/" className="text-[#f5c518] font-semibold hover:underline">
            Incant
          </a>{" "}
          🪄
        </div>
      )}

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-gray-400 text-sm">Loading spell...</div>
          </div>
        }
      >
        <TemplateComponent
          config={spell.config}
          spellId={spell.id}
        />
      </Suspense>
    </div>
  );
}
