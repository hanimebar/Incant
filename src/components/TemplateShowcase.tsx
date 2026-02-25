"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = ["Games", "Randomisers", "Trackers", "Calculators", "Creative", "Productivity"] as const;
type Category = (typeof CATEGORIES)[number];

interface Template {
  icon: string;
  name: string;
  prompt: string;
}

const TEMPLATES: Record<Category, Template[]> = {
  Games: [
    { icon: "⭕", name: "Tic-Tac-Toe", prompt: "A tic-tac-toe game to play with a friend" },
    { icon: "🃏", name: "Memory Match", prompt: "A card memory matching game" },
    { icon: "✊", name: "Rock Paper Scissors", prompt: "Rock paper scissors game" },
    { icon: "🔢", name: "Number Guess", prompt: "A number guessing game between 1 and 100" },
    { icon: "🪢", name: "Hangman", prompt: "A hangman word guessing game" },
    { icon: "🔔", name: "Simon Says", prompt: "A Simon Says memory game with coloured buttons" },
    { icon: "🐍", name: "Snake", prompt: "The classic Snake game" },
    { icon: "💣", name: "Minesweeper", prompt: "A minesweeper game" },
    { icon: "🔤", name: "Wordle Clone", prompt: "A Wordle-style word guessing game" },
  ],
  Randomisers: [
    { icon: "🪙", name: "Coin Flip", prompt: "A coin flip app" },
    { icon: "🎲", name: "Random Number", prompt: "A random number generator between 1 and 1000" },
    { icon: "🎲", name: "Dice Roller", prompt: "A dice roller for tabletop games" },
    { icon: "🎱", name: "Magic 8 Ball", prompt: "A magic 8 ball for life decisions" },
    { icon: "🎡", name: "Spin Wheel", prompt: "A spin-the-wheel random picker" },
    { icon: "👤", name: "Name Picker", prompt: "A random name picker for my team" },
    { icon: "🤔", name: "Decision Maker", prompt: "A decision maker to help me choose between options" },
    { icon: "🤷", name: "Would You Rather", prompt: "A would-you-rather game for parties" },
    { icon: "😅", name: "Truth or Dare", prompt: "A truth or dare game" },
    { icon: "🥠", name: "Fortune Cookie", prompt: "A fortune cookie with daily wisdom" },
    { icon: "😊", name: "Compliment Machine", prompt: "A random compliment generator to brighten my day" },
  ],
  Trackers: [
    { icon: "✅", name: "Habit Tracker", prompt: "A habit tracker for my morning routine" },
    { icon: "💧", name: "Water Intake", prompt: "A water intake tracker to drink 8 glasses a day" },
    { icon: "😊", name: "Mood Tracker", prompt: "A daily mood tracker" },
    { icon: "💪", name: "Workout Log", prompt: "A workout log for my gym sessions" },
    { icon: "😴", name: "Sleep Tracker", prompt: "A sleep tracker to log my nightly rest" },
    { icon: "💸", name: "Expense Logger", prompt: "An expense logger for my weekend trip" },
    { icon: "🧮", name: "Tip Calculator", prompt: "A tip calculator for restaurants" },
    { icon: "🍕", name: "Bill Splitter", prompt: "A bill splitter for group dinners" },
    { icon: "🏦", name: "Savings Goal", prompt: "A savings goal tracker for a new laptop" },
    { icon: "📋", name: "To-Do List", prompt: "A to-do list for my daily tasks" },
    { icon: "📚", name: "Reading List", prompt: "A reading list to track books I want to read" },
    { icon: "🔗", name: "Link Saver", prompt: "A link saver for articles I want to read later" },
    { icon: "📓", name: "Daily Journal", prompt: "A daily journal for my thoughts" },
    { icon: "🎯", name: "Goal Tracker", prompt: "A goal tracker for my quarterly objectives" },
    { icon: "❓", name: "Quiz Builder", prompt: "A quiz about European capitals" },
    { icon: "⏱️", name: "Countdown Timer", prompt: "A countdown timer to my birthday next month" },
    { icon: "📝", name: "Form & Survey", prompt: "A simple feedback form for my website" },
    { icon: "🃏", name: "Flashcard Deck", prompt: "A flashcard deck to learn Spanish vocabulary" },
    { icon: "📊", name: "Data Table", prompt: "A data table to track my project milestones" },
    { icon: "🔔", name: "Custom Reminder", prompt: "A daily reminder to take my vitamins at 8am" },
  ],
  Calculators: [
    { icon: "📐", name: "Unit Converter", prompt: "A unit converter for cooking measurements" },
    { icon: "⚖️", name: "BMI Calculator", prompt: "A BMI calculator" },
    { icon: "🎂", name: "Age Calculator", prompt: "An age calculator that shows days, months and years" },
    { icon: "🏠", name: "Loan Calculator", prompt: "A loan repayment calculator for a mortgage" },
    { icon: "📈", name: "Compound Interest", prompt: "A compound interest calculator for my savings" },
    { icon: "🔢", name: "Percentage Calc", prompt: "A percentage calculator" },
    { icon: "🏛️", name: "Roman Numerals", prompt: "A Roman numeral converter" },
    { icon: "💻", name: "Binary & Hex", prompt: "A binary and hex converter for developers" },
    { icon: "🎨", name: "Colour Contrast", prompt: "A colour contrast checker for accessibility" },
  ],
  Creative: [
    { icon: "🔐", name: "Password Generator", prompt: "A strong password generator" },
    { icon: "📷", name: "QR Generator", prompt: "A QR code generator for my website URL" },
    { icon: "🌈", name: "Gradient Maker", prompt: "A CSS gradient maker tool" },
    { icon: "🎨", name: "Colour Palette", prompt: "A colour palette generator for design inspiration" },
    { icon: "🖼️", name: "Pixel Art", prompt: "A pixel art drawing canvas" },
    { icon: "💬", name: "ASCII Art", prompt: "An ASCII art text generator" },
  ],
  Productivity: [
    { icon: "🍅", name: "Pomodoro Timer", prompt: "A Pomodoro timer for focused work sessions" },
    { icon: "📌", name: "Kanban Board", prompt: "A kanban board to manage my projects" },
    { icon: "⚖️", name: "Pros & Cons List", prompt: "A pros and cons list to help me make a decision" },
    { icon: "🪣", name: "Bucket List", prompt: "A bucket list of things I want to do before 40" },
    { icon: "⌨️", name: "Typing Speed Test", prompt: "A typing speed test" },
    { icon: "🧘", name: "Breathing Exercise", prompt: "A breathing exercise app for stress relief" },
    { icon: "📅", name: "Meeting Agenda", prompt: "A meeting agenda builder for my weekly standup" },
    { icon: "📖", name: "Random Word", prompt: "A random word generator for creative writing prompts" },
    { icon: "💬", name: "Fake Quote", prompt: "A fake motivational quote generator" },
    { icon: "😅", name: "Excuse Generator", prompt: "A funny excuse generator for skipping the gym" },
  ],
};

export default function TemplateShowcase() {
  const [activeCategory, setActiveCategory] = useState<Category>("Games");

  return (
    <div>
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-[#f5c518] text-[#0f0a2e]"
                : "bg-white/5 text-indigo-300 border border-white/10 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TEMPLATES[activeCategory].map((t) => (
          <div
            key={t.name}
            className="flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5 shrink-0">{t.icon}</span>
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm">{t.name}</p>
                <p className="text-indigo-400 text-xs leading-relaxed mt-0.5">
                  &ldquo;{t.prompt}&rdquo;
                </p>
              </div>
            </div>
            <Link
              href={`/cast?prompt=${encodeURIComponent(t.prompt)}`}
              className="text-center text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-600/40 hover:text-white transition-all"
            >
              Cast this →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
