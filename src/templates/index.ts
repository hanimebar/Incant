import type { TemplateId } from "@/types";
import { lazy, type ComponentType } from "react";
import type { TemplateProps } from "./types";

export type { TemplateProps };

export const TEMPLATE_COMPONENTS: Record<TemplateId, ComponentType<TemplateProps>> = {
  "habit-tracker": lazy(() => import("./HabitTracker")),
  "water-intake": lazy(() => import("./WaterIntake")),
  "mood-tracker": lazy(() => import("./MoodTracker")),
  "workout-log": lazy(() => import("./WorkoutLog")),
  "sleep-tracker": lazy(() => import("./SleepTracker")),
  "expense-logger": lazy(() => import("./ExpenseLogger")),
  "tip-calculator": lazy(() => import("./TipCalculator")),
  "bill-splitter": lazy(() => import("./BillSplitter")),
  "savings-goal": lazy(() => import("./SavingsGoal")),
  "todo-list": lazy(() => import("./TodoList")),
  "reading-list": lazy(() => import("./ReadingList")),
  "link-saver": lazy(() => import("./LinkSaver")),
  "daily-journal": lazy(() => import("./DailyJournal")),
  "goal-tracker": lazy(() => import("./GoalTracker")),
  "quiz-builder": lazy(() => import("./QuizBuilder")),
  "countdown-timer": lazy(() => import("./CountdownTimer")),
  "form-survey": lazy(() => import("./FormSurvey")),
  "flashcard-deck": lazy(() => import("./FlashcardDeck")),
  "data-table": lazy(() => import("./DataTable")),
  "custom-reminder": lazy(() => import("./CustomReminder")),
  "sound-board": lazy(() => import("./SoundBoard")),
  "voice-modulator": lazy(() => import("./VoiceModulator")),
} as Record<TemplateId, ComponentType<TemplateProps>>;
