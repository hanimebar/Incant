"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import TopNav from "@/components/TopNav";

const PLANS = [
  {
    id: "free",
    name: "Free",
    icon: null,
    price: "€0",
    period: "/month",
    description: "Try it out",
    color: "#6b7280",
    features: [
      "2 spells",
      "All 65 templates",
      "Shareable PWA links",
      "Incant branding on links",
    ],
    cta: "Get started",
    ctaHref: "/auth/login",
    highlight: false,
  },
  {
    id: "apprentice",
    name: "Apprentice",
    icon: "/icon-apprentice.svg",
    price: "€3",
    period: " one-time",
    description: "One clean spell, no subscription",
    color: "#a78bfa",
    features: [
      "1 spell",
      "All 65 templates",
      "No Incant branding",
      "Pay once, yours forever",
    ],
    cta: "Cast once",
    highlight: false,
  },
  {
    id: "caster",
    name: "Caster",
    icon: "/icon-caster.svg",
    price: "€7",
    period: "/month",
    description: "For regular casters",
    color: "#6366f1",
    features: [
      "Unlimited spells",
      "All 65 templates",
      "Custom URL slugs",
      "No Incant branding",
      "Priority generation",
    ],
    cta: "Upgrade to Caster",
    highlight: true,
  },
  {
    id: "wizard",
    name: "Wizard",
    icon: "/icon-wizard.svg",
    price: "€14",
    period: "/month",
    description: "For power users",
    color: "#f5c518",
    features: [
      "Everything in Caster",
      "Code export",
      "Early access to new templates",
      "Wizard badge on profile",
    ],
    cta: "Become a Wizard",
    highlight: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") { router.push("/auth/login"); return; }
    setLoading(planId);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else if (res.status === 401) router.push("/auth/login?redirect=/pricing");
    setLoading(null);
  };

  return (
    <main className="min-h-screen bg-[#0f0a2e]">
      <TopNav variant="dark" />
      <div className="px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Simple pricing</h1>
          <p className="text-indigo-300 text-lg">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 border transition-all ${plan.highlight
                ? "border-indigo-400 bg-indigo-950/80 shadow-xl shadow-indigo-500/20"
                : "border-white/10 bg-white/5"}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white">
                  Most popular
                </div>
              )}

              <div className="mb-5">
                {plan.icon && (
                  <img src={plan.icon} alt={plan.name} className="w-12 h-12 mb-3" style={{ imageRendering: "pixelated" }} />
                )}
                <p className="text-sm font-medium mb-1" style={{ color: plan.color }}>{plan.name}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-indigo-400 text-sm mb-1">{plan.period}</span>
                </div>
                <p className="text-indigo-400 text-sm mt-1">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-indigo-200">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.ctaHref ? (
                <Link href={plan.ctaHref}
                  className="block w-full py-3 rounded-xl text-center font-semibold text-sm transition-all text-white"
                  style={{ backgroundColor: `${plan.color}30`, border: `1px solid ${plan.color}50` }}>
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: plan.highlight ? plan.color : `${plan.color}20`,
                    color: plan.highlight ? "#fff" : plan.color,
                    border: plan.highlight ? "none" : `1px solid ${plan.color}40`,
                  }}
                >
                  {loading === plan.id ? (
                    "Redirecting..."
                  ) : plan.id === "wizard" ? (
                    <><Wand2 className="w-4 h-4" /> {plan.cta}</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> {plan.cta}</>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-indigo-500 text-sm mt-8">
          Cancel anytime. No long-term commitment.
        </p>
      </div>
      </div>
    </main>
  );
}
