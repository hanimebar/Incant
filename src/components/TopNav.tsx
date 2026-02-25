import Link from "next/link";
import { Sparkles, BookOpen, Home } from "lucide-react";

interface Props {
  /** Makes the bar transparent/dark for dark-bg pages (cast, spell viewer) */
  variant?: "dark" | "light";
}

export default function TopNav({ variant = "dark" }: Props) {
  const dark = variant === "dark";

  return (
    <nav
      className={`sticky top-0 z-40 w-full px-4 py-3 flex items-center justify-between ${
        dark
          ? "bg-[#0f0a2e]/80 backdrop-blur-sm border-b border-white/5"
          : "bg-white/95 backdrop-blur-sm border-b border-gray-100"
      }`}
    >
      {/* Logo */}
      <Link
        href="/"
        className={`flex items-center gap-2 font-bold text-base transition-opacity hover:opacity-80 ${
          dark ? "text-white" : "text-gray-800"
        }`}
      >
        <span>🪄</span> Incant
      </Link>

      {/* Links */}
      <div className="flex items-center gap-1">
        <Link
          href="/"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
            dark
              ? "text-indigo-300 hover:text-white hover:bg-white/10"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <Link
          href="/dashboard"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
            dark
              ? "text-indigo-300 hover:text-white hover:bg-white/10"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Spellbook</span>
        </Link>
        <Link
          href="/cast"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            dark
              ? "bg-[#f5c518] text-[#0f0a2e] hover:bg-yellow-300"
              : "bg-[#0f0a2e] text-white hover:bg-indigo-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cast</span>
        </Link>
      </div>
    </nav>
  );
}
