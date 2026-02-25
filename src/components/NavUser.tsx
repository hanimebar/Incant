"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Props {
  dark?: boolean;
}

export default function NavUser({ dark = true }: Props) {
  const [user, setUser] = useState<SupabaseUser | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  // Still loading
  if (user === undefined) {
    return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />;
  }

  // Signed out
  if (!user) {
    return (
      <Link
        href="/auth/login"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
          dark
            ? "text-indigo-300 hover:text-white hover:bg-white/10"
            : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
        }`}
      >
        Sign in
      </Link>
    );
  }

  // Signed in — avatar button + dropdown
  const initial = (user.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:ring-2 hover:ring-white/20"
        style={{ backgroundColor: "#f5c518", color: "#0f0a2e" }}
        aria-label="Account menu"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#1a1040] border border-white/10 shadow-xl shadow-black/40 overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-xs text-indigo-400 truncate">{user.email}</p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-indigo-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Spellbook
          </Link>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-indigo-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <User className="w-4 h-4" /> Account
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-white/5"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
