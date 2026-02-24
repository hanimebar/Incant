"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Globe, Lock, Trash2, ExternalLink, Copy, Check, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TIER_LIMITS } from "@/types";
import type { Profile, Spell } from "@/types";

const TEMPLATE_ICONS: Record<string, string> = {
  "habit-tracker": "✅", "water-intake": "💧", "mood-tracker": "😊", "workout-log": "💪",
  "sleep-tracker": "😴", "expense-logger": "💸", "tip-calculator": "🧮", "bill-splitter": "🍕",
  "savings-goal": "🏦", "todo-list": "📋", "reading-list": "📚", "link-saver": "🔗",
  "daily-journal": "📓", "goal-tracker": "🎯", "quiz-builder": "❓", "countdown-timer": "⏱️",
  "form-survey": "📝", "flashcard-deck": "🃏", "data-table": "📊", "custom-reminder": "🔔",
};

interface Props { profile: Profile; spells: Spell[] }

export default function SpellbookClient({ profile, spells: initialSpells }: Props) {
  const router = useRouter();
  const [spells, setSpells] = useState(initialSpells);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  const limits = TIER_LIMITS[profile.tier];
  const atLimit = !limits.maxApps || (limits.maxApps !== Infinity && spells.length >= limits.maxApps);

  const togglePublic = async (spell: Spell) => {
    await supabase.from("spells").update({ is_public: !spell.is_public }).eq("id", spell.id);
    setSpells(spells.map((s) => s.id === spell.id ? { ...s, is_public: !s.is_public } : s));
  };

  const deleteSpell = async (id: string) => {
    setDeletingId(id);
    await supabase.from("spells").delete().eq("id", id);
    setSpells(spells.filter((s) => s.id !== id));
    setDeletingId(null);
  };

  const copyLink = async (spell: Spell) => {
    const url = `${window.location.origin}/u/${profile.username}/${spell.slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(spell.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const TIER_BADGE: Record<string, { label: string; color: string }> = {
    free: { label: "Free", color: "#6b7280" },
    caster: { label: "Caster", color: "#6366f1" },
    wizard: { label: "Wizard ✨", color: "#f5c518" },
  };

  const badge = TIER_BADGE[profile.tier];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0f0a2e] text-white px-4 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>🪄</span> Spellbook
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-indigo-300 text-sm">@{profile.username}</p>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: badge.color, color: badge.color === "#f5c518" ? "#0f0a2e" : "white" }}>
                {badge.label}
              </span>
            </div>
          </div>
          <Link
            href="/cast"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${atLimit ? "bg-white/10 text-white/40 cursor-not-allowed pointer-events-none" : "bg-[#f5c518] text-[#0f0a2e] hover:bg-yellow-300"}`}
          >
            <Sparkles className="w-4 h-4" /> Cast
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tier limit warning */}
        {profile.tier === "free" && (
          <div className="mb-5 p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-800">{spells.length}/2 free spells used</p>
              <p className="text-xs text-indigo-600">Upgrade to Caster for unlimited spells</p>
            </div>
            <Link href="/pricing" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
              Upgrade
            </Link>
          </div>
        )}

        {spells.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🪄</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Your spellbook is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Cast your first spell to create a micro-app</p>
            <Link href="/cast"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0f0a2e] text-white font-semibold hover:bg-indigo-900 transition-all">
              <Wand2 className="w-4 h-4" /> Cast your first spell
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {spells.map((spell) => (
              <div key={spell.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: `${spell.config.primaryColor || "#6366f1"}15` }}>
                    {TEMPLATE_ICONS[spell.template_id] || "🔮"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{spell.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{spell.template_id.replace(/-/g, " ")}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => copyLink(spell)}
                      className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all">
                      {copiedId === spell.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <Link href={`/u/${profile.username}/${spell.slug}`} target="_blank"
                      className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button onClick={() => togglePublic(spell)}
                      className="p-2 rounded-lg hover:bg-gray-50 transition-all"
                      title={spell.is_public ? "Make private" : "Make public"}>
                      {spell.is_public
                        ? <Globe className="w-4 h-4 text-green-500" />
                        : <Lock className="w-4 h-4 text-gray-400" />}
                    </button>
                    <button onClick={() => deleteSpell(spell.id)} disabled={deletingId === spell.id}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all disabled:opacity-40">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="px-4 pb-3 flex items-center gap-3 text-xs text-gray-400">
                  <span>{new Date(spell.created_at).toLocaleDateString()}</span>
                  {spell.view_count > 0 && <span>👁 {spell.view_count} views</span>}
                  {spell.is_public
                    ? <span className="text-green-600 font-medium">Public</span>
                    : <span className="text-gray-400">Private</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Account settings */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Account</p>
              <p className="text-xs text-gray-400">{profile.username} · {profile.tier} plan</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await createClient().auth.signOut();
                  router.push("/");
                }}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-gray-200 hover:bg-gray-50"
              >
                Sign out
              </button>
              <button
                onClick={async () => {
                  if (!confirm("Delete your account and all spells permanently? This cannot be undone.")) return;
                  const res = await fetch("/api/account", { method: "DELETE" });
                  if (res.ok) router.push("/");
                }}
                className="px-3 py-1.5 rounded-lg text-xs text-red-500 border border-red-200 hover:bg-red-50"
              >
                Delete account
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
            {" · "}
            <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
