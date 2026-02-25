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
  | "sound-board"
  | "voice-modulator";

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
