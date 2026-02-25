"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://incant.actvli.com";

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const supabase = createClient();

  const callbackUrl = `${APP_URL}/auth/callback?redirect=${encodeURIComponent(redirect)}`;

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  const signInWithOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl },
    });
    if (error) { setError(error.message); setOauthLoading(null); }
  };

  return (
    <div className="min-h-screen bg-[#0f0a2e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl">🪄</Link>
          <h1 className="text-2xl font-bold text-white mt-3">Sign in to Incant</h1>
          <p className="text-indigo-400 text-sm mt-1">Create your spellbook in seconds</p>
        </div>

        {sent ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-4xl mb-3">📬</p>
            <p className="text-white font-semibold mb-2">Check your email</p>
            <p className="text-indigo-300 text-sm">We sent a magic link to <strong>{email}</strong></p>
            <button onClick={() => setSent(false)} className="text-indigo-400 text-xs underline mt-4">
              Use a different email
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* OAuth buttons */}
            <button
              onClick={() => signInWithOAuth("google")}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-all disabled:opacity-60"
            >
              {oauthLoading === "google" ? (
                <span className="text-gray-500">Redirecting...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <button
              onClick={() => signInWithOAuth("github")}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#24292e] text-white font-semibold text-sm hover:bg-[#2f363d] transition-all disabled:opacity-60 border border-white/10"
            >
              {oauthLoading === "github" ? (
                <span>Redirecting...</span>
              ) : (
                <>
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  Continue with GitHub
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-indigo-500 text-xs">or use email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email magic link */}
            <form onSubmit={signInWithEmail} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-indigo-400/50 outline-none focus:border-indigo-400 text-sm"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 rounded-xl bg-[#f5c518] text-[#0f0a2e] font-bold text-sm disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send magic link ✨"}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-indigo-500 text-xs mt-6">
          By signing in you agree to our{" "}
          <Link href="/terms" className="underline hover:text-indigo-400">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-indigo-400">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
