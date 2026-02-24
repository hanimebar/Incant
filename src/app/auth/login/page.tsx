"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}` },
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0a2e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl">🪄</Link>
          <h1 className="text-2xl font-bold text-white mt-3">Sign in to Incant</h1>
          <p className="text-indigo-400 text-sm mt-1">We&apos;ll send you a magic link</p>
        </div>

        {sent ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-4xl mb-3">📬</p>
            <p className="text-white font-semibold mb-2">Check your email</p>
            <p className="text-indigo-300 text-sm">We sent a magic link to <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={signIn} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-sm text-indigo-300 mb-1.5 block">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-indigo-400/50 outline-none focus:border-indigo-400"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading || !email}
              className="w-full py-3 rounded-xl bg-[#f5c518] text-[#0f0a2e] font-bold text-sm disabled:opacity-50">
              {loading ? "Sending..." : "Send magic link ✨"}
            </button>
          </form>
        )}

        <p className="text-center text-indigo-500 text-xs mt-6">
          By signing in you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
