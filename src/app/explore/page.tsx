import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Sparkles, Globe } from "lucide-react";
import type { Metadata } from "next";
import type { Spell } from "@/types";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = { title: "Explore — Incant" };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TEMPLATE_ICONS: Record<string, string> = {
  "habit-tracker": "✅", "water-intake": "💧", "mood-tracker": "😊", "workout-log": "💪",
  "sleep-tracker": "😴", "expense-logger": "💸", "tip-calculator": "🧮", "bill-splitter": "🍕",
  "savings-goal": "🏦", "todo-list": "📋", "reading-list": "📚", "link-saver": "🔗",
  "daily-journal": "📓", "goal-tracker": "🎯", "quiz-builder": "❓", "countdown-timer": "⏱️",
  "form-survey": "📝", "flashcard-deck": "🃏", "data-table": "📊", "custom-reminder": "🔔",
};

export default async function ExplorePage() {
  const service = createServiceClient();
  const { data: spells } = await service
    .from("spells")
    .select("*, profiles!inner(username)")
    .eq("is_public", true)
    .order("view_count", { ascending: false })
    .limit(48);

  return (
    <main className="min-h-screen bg-[#0f0a2e] text-white">
      <TopNav variant="dark" />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore spells</h1>
          <p className="text-indigo-400">Apps made by the Incant community</p>
        </div>

        {!spells || spells.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔮</p>
            <p className="text-xl font-bold mb-2">No public spells yet</p>
            <p className="text-indigo-400 mb-6">Be the first to cast one!</p>
            <Link href="/cast"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[#0f0a2e]"
              style={{ backgroundColor: "#f5c518" }}>
              <Sparkles className="w-4 h-4" /> Cast first spell
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(spells as (Spell & { profiles: { username: string } })[]).map((spell) => (
              <Link
                key={spell.id}
                href={`/u/${spell.profiles.username}/${spell.slug}`}
                className="group block p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl shrink-0">{TEMPLATE_ICONS[spell.template_id] || "🔮"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate group-hover:text-[#f5c518] transition-colors">
                      {spell.name}
                    </p>
                    <p className="text-xs text-indigo-400 capitalize">{spell.template_id.replace(/-/g, " ")}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-indigo-500">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> @{spell.profiles.username}
                  </span>
                  {spell.view_count > 0 && <span>👁 {spell.view_count}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
