export type UserTier = "free" | "apprentice" | "caster" | "wizard";

export interface Profile {
  id: string;
  username: string;
  tier: UserTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  app_count: number;
  created_at: string;
}

export type TemplateId =
  | "habit-tracker"
  | "water-intake"
  | "mood-tracker"
  | "workout-log"
  | "sleep-tracker"
  | "expense-logger"
  | "tip-calculator"
  | "bill-splitter"
  | "savings-goal"
  | "todo-list"
  | "reading-list"
  | "link-saver"
  | "daily-journal"
  | "goal-tracker"
  | "quiz-builder"
  | "countdown-timer"
  | "form-survey"
  | "flashcard-deck"
  | "data-table"
  | "custom-reminder"
  | "simon-says"
  | "snake"
  | "minesweeper"
  | "wordle-clone"
  | "tic-tac-toe"
  | "memory-match"
  | "rock-paper-scissors"
  | "number-guess"
  | "hangman"
  | "coin-flip"
  | "random-number"
  | "dice-roller"
  | "magic-8-ball"
  | "spin-wheel"
  | "random-name-picker"
  | "decision-maker"
  | "would-you-rather"
  | "truth-or-dare"
  | "fortune-cookie"
  | "compliment-machine"
  | "unit-converter"
  | "bmi-calculator"
  | "age-calculator"
  | "loan-calculator"
  | "compound-interest"
  | "percentage-calc"
  | "roman-numerals"
  | "binary-hex"
  | "colour-contrast"
  | "password-generator"
  | "qr-generator"
  | "gradient-maker"
  | "colour-palette"
  | "pixel-art"
  | "ascii-art"
  | "pomodoro-timer"
  | "kanban-board"
  | "pros-cons-list"
  | "bucket-list"
  | "typing-speed-test"
  | "breathing-exercise"
  | "meeting-agenda"
  | "random-word"
  | "fake-quote"
  | "excuse-generator";

export interface TemplateConfig {
  name: string;
  description?: string;
  primaryColor?: string;
  accentColor?: string;
  fields?: Array<{
    key: string;
    label: string;
    type: "text" | "number" | "select" | "date" | "boolean";
    options?: string[];
    placeholder?: string;
    unit?: string;
  }>;
  goal?: number;
  unit?: string;
  categories?: string[];
  options?: string[];
  targetDate?: string;
  currency?: string;
  customData?: Record<string, unknown>;
}

export interface Spell {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  template_id: TemplateId;
  config: TemplateConfig;
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
  };
}

export interface CastResult {
  templateId: TemplateId;
  config: TemplateConfig;
  confidence: number;
}

export const TIER_LIMITS: Record<UserTier, { maxApps: number; customSlug: boolean; branding: boolean; codeExport: boolean }> = {
  free:       { maxApps: 2,        customSlug: false, branding: true,  codeExport: false },
  apprentice: { maxApps: 1,        customSlug: false, branding: false, codeExport: false },
  caster:     { maxApps: Infinity, customSlug: true,  branding: false, codeExport: false },
  wizard:     { maxApps: Infinity, customSlug: true,  branding: false, codeExport: true  },
};
