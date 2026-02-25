import Link from "next/link";
import { Mic, Sparkles, Share2, Smartphone } from "lucide-react";
import type { Metadata } from "next";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Incant — Cast your idea into an app",
  description: "Speak or type your idea. Incant turns it into a shareable micro-app in seconds.",
  openGraph: {
    title: "Incant — Cast your idea into an app",
    description: "Speak or type your idea. It becomes a real app instantly.",
    siteName: "Incant",
  },
};

const TEMPLATES = [
  { icon: "✅", name: "Habit Tracker" },
  { icon: "💧", name: "Water Intake" },
  { icon: "💸", name: "Expense Logger" },
  { icon: "📋", name: "To-Do List" },
  { icon: "⏱️", name: "Countdown Timer" },
  { icon: "🃏", name: "Flashcard Deck" },
  { icon: "❓", name: "Quiz Builder" },
  { icon: "📓", name: "Daily Journal" },
  { icon: "🎯", name: "Goal Tracker" },
  { icon: "🏦", name: "Savings Goal" },
];

const STEPS = [
  { icon: <Mic className="w-6 h-6" />, title: "Speak or type", desc: "Describe the app you want in plain language. \"A habit tracker for my morning routine.\"" },
  { icon: <Sparkles className="w-6 h-6" />, title: "We cast it", desc: "Claude picks the best template and customizes it to your exact description." },
  { icon: <Share2 className="w-6 h-6" />, title: "Share it", desc: "Your app is live instantly at a unique link. Share it, add it to your phone." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0f0a2e] text-white overflow-hidden">
      <TopNav variant="dark" />

      {/* Hero */}
      <section className="relative text-center px-4 pt-16 pb-24 max-w-3xl mx-auto">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="inline-block px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm text-indigo-300 mb-6">
            ✨ Now in beta — try it free
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Cast your idea
            <br />
            <span style={{ color: "#f5c518" }}>into an app.</span>
          </h1>

          <p className="text-xl text-indigo-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Speak or type any idea for a personal micro-app.
            It appears — live, shareable, works on your phone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/cast"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg text-[#0f0a2e] hover:brightness-110 transition-all shadow-xl shadow-yellow-500/20"
              style={{ backgroundColor: "#f5c518" }}>
              <Sparkles className="w-5 h-5" />
              Cast your first spell
            </Link>
            <Link href="/explore"
              className="px-8 py-4 rounded-2xl font-semibold text-sm text-indigo-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              See examples →
            </Link>
          </div>

          <p className="text-indigo-500 text-sm mt-4">Free to start · No credit card · Ready in seconds</p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/30 flex items-center justify-center mx-auto mb-4 text-indigo-300">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-indigo-300 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Template showcase */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">65 app templates</h2>
        <p className="text-indigo-400 text-center mb-10">Games, trackers, calculators, tools, creative toys, and more.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {TEMPLATES.map(({ icon, name }) => (
            <div key={name} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
              <span className="text-2xl">{icon}</span>
              <span className="text-xs text-indigo-300 text-center leading-tight">{name}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-indigo-500 text-sm mt-4">+ 45 more — games, randomisers, calculators &amp; creative tools</p>
      </section>

      {/* PWA section */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-700/30 p-8 text-center">
          <Smartphone className="w-10 h-10 mx-auto mb-4 text-indigo-300" />
          <h2 className="text-2xl font-bold mb-3">Works on your phone</h2>
          <p className="text-indigo-300 max-w-md mx-auto text-sm leading-relaxed">
            Every spell is a PWA — add it to your home screen and it feels like a native app.
            Share the link and anyone can use it, no app store needed.
          </p>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="px-4 py-16 max-w-lg mx-auto text-center">
        <h2 className="text-3xl font-bold mb-3">Get started for free</h2>
        <p className="text-indigo-400 mb-6">2 free spells, no credit card needed.</p>
        <div className="flex justify-center gap-4 text-sm text-indigo-300">
          <span>Free: 2 apps</span>
          <span>·</span>
          <span>Caster: €7/mo</span>
          <span>·</span>
          <span>Wizard: €14/mo</span>
        </div>
        <Link href="/pricing" className="inline-block mt-4 text-[#f5c518] text-sm underline underline-offset-4">
          See all plans →
        </Link>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to cast?</h2>
        <p className="text-indigo-400 mb-8">Your first spell is free. Say it out loud.</p>
        <Link href="/cast"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-[#0f0a2e] hover:brightness-110 transition-all"
          style={{ backgroundColor: "#f5c518" }}>
          <Sparkles className="w-5 h-5" />
          Cast your first spell
        </Link>
      </section>

    </main>
  );
}
