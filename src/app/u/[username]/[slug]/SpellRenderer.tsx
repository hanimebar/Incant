"use client";

import { Suspense, lazy } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Spell } from "@/types";
import type { TemplateId } from "@/types";
import HomeScreenBanner from "@/components/HomeScreenBanner";
import TopNav from "@/components/TopNav";

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
  "simon-says": lazy(() => import("@/templates/SimonSays")),
  "snake": lazy(() => import("@/templates/Snake")),
  "minesweeper": lazy(() => import("@/templates/Minesweeper")),
  "wordle-clone": lazy(() => import("@/templates/WordleClone")),
  "tic-tac-toe": lazy(() => import("@/templates/TicTacToe")),
  "memory-match": lazy(() => import("@/templates/MemoryMatch")),
  "rock-paper-scissors": lazy(() => import("@/templates/RockPaperScissors")),
  "number-guess": lazy(() => import("@/templates/NumberGuess")),
  "hangman": lazy(() => import("@/templates/Hangman")),
  "coin-flip": lazy(() => import("@/templates/CoinFlip")),
  "random-number": lazy(() => import("@/templates/RandomNumber")),
  "dice-roller": lazy(() => import("@/templates/DiceRoller")),
  "magic-8-ball": lazy(() => import("@/templates/Magic8Ball")),
  "spin-wheel": lazy(() => import("@/templates/SpinWheel")),
  "random-name-picker": lazy(() => import("@/templates/RandomNamePicker")),
  "decision-maker": lazy(() => import("@/templates/DecisionMaker")),
  "would-you-rather": lazy(() => import("@/templates/WouldYouRather")),
  "truth-or-dare": lazy(() => import("@/templates/TruthOrDare")),
  "fortune-cookie": lazy(() => import("@/templates/FortuneCookie")),
  "compliment-machine": lazy(() => import("@/templates/ComplimentMachine")),
  "unit-converter": lazy(() => import("@/templates/UnitConverter")),
  "bmi-calculator": lazy(() => import("@/templates/BmiCalculator")),
  "age-calculator": lazy(() => import("@/templates/AgeCalculator")),
  "loan-calculator": lazy(() => import("@/templates/LoanCalculator")),
  "compound-interest": lazy(() => import("@/templates/CompoundInterest")),
  "percentage-calc": lazy(() => import("@/templates/PercentageCalc")),
  "roman-numerals": lazy(() => import("@/templates/RomanNumerals")),
  "binary-hex": lazy(() => import("@/templates/BinaryHex")),
  "colour-contrast": lazy(() => import("@/templates/ColourContrast")),
  "password-generator": lazy(() => import("@/templates/PasswordGenerator")),
  "qr-generator": lazy(() => import("@/templates/QrGenerator")),
  "gradient-maker": lazy(() => import("@/templates/GradientMaker")),
  "colour-palette": lazy(() => import("@/templates/ColourPalette")),
  "pixel-art": lazy(() => import("@/templates/PixelArt")),
  "ascii-art": lazy(() => import("@/templates/AsciiArt")),
  "pomodoro-timer": lazy(() => import("@/templates/PomodoroTimer")),
  "kanban-board": lazy(() => import("@/templates/KanbanBoard")),
  "pros-cons-list": lazy(() => import("@/templates/ProsConsList")),
  "bucket-list": lazy(() => import("@/templates/BucketList")),
  "typing-speed-test": lazy(() => import("@/templates/TypingSpeedTest")),
  "breathing-exercise": lazy(() => import("@/templates/BreathingExercise")),
  "meeting-agenda": lazy(() => import("@/templates/MeetingAgenda")),
  "random-word": lazy(() => import("@/templates/RandomWord")),
  "fake-quote": lazy(() => import("@/templates/FakeQuote")),
  "excuse-generator": lazy(() => import("@/templates/ExcuseGenerator")),
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
      {/* Top navigation */}
      <TopNav variant="light" />

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
