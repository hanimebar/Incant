"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, LogOut, Trash2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

const TIER_INFO: Record<string, { label: string; color: string; description: string }> = {
  free: {
    label: "Free",
    color: "#6b7280",
    description: "2 spells · Incant branding on shared links",
  },
  apprentice: {
    label: "Apprentice",
    color: "#a78bfa",
    description: "1 spell · No branding · One-time payment",
  },
  caster: {
    label: "Caster",
    color: "#6366f1",
    description: "Unlimited spells · No branding · Custom slugs",
  },
  wizard: {
    label: "Wizard ✨",
    color: "#f5c518",
    description: "Everything in Caster · Code export · Early access",
  },
};

export default function AccountClient({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [billingLoading, setBillingLoading] = useState(false);
  const [error, setError] = useState("");

  const tier = TIER_INFO[profile.tier] ?? TIER_INFO.free;
  const hasBilling = !!profile.stripe_customer_id;
  const isSubscription = profile.tier === "caster" || profile.tier === "wizard";

  const openBillingPortal = async () => {
    setBillingLoading(true);
    setError("");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error || "Could not open billing portal.");
      setBillingLoading(false);
    }
  };

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Delete your account and all spells permanently? This cannot be undone.")) return;
    const res = await fetch("/api/account", { method: "DELETE" });
    if (res.ok) router.push("/");
    else setError("Failed to delete account. Please contact support.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-10 space-y-6">

        {/* Plan card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Current plan</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-gray-800">{tier.label}</span>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: tier.color }}
            >
              {tier.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-5">{tier.description}</p>

          <div className="flex flex-col gap-2">
            {hasBilling ? (
              <button
                onClick={openBillingPortal}
                disabled={billingLoading}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all disabled:opacity-60"
              >
                <CreditCard className="w-4 h-4" />
                {billingLoading ? "Opening..." : isSubscription ? "Manage subscription" : "View billing"}
              </button>
            ) : (
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#f5c518] text-[#0f0a2e] text-sm font-bold hover:brightness-110 transition-all"
              >
                Upgrade plan →
              </Link>
            )}
          </div>

          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        </div>

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Account</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-800">@{profile.username}</p>
              <p className="text-xs text-gray-400">{profile.app_count} spell{profile.app_count !== 1 ? "s" : ""} created</p>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Spellbook
            </Link>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-all border border-gray-100"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl text-red-500 text-sm font-medium hover:bg-red-50 transition-all border border-red-100"
            >
              <Trash2 className="w-4 h-4" /> Delete account
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          {" · "}
          <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
          {" · "}
          <a href="mailto:reachout@actvli.com" className="underline hover:text-gray-600">Contact support</a>
        </p>
      </div>
    </div>
  );
}
