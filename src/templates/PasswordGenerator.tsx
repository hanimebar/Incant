"use client";

import { useState, useEffect, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMS = "0123456789";
const SYMS = "!@#$%^&*()-_=+[]{}|;:,.<>?/~";
const AMBIGUOUS = /[0Ol1I]/g;

interface Options {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  noAmbiguous: boolean;
}

function generatePassword(opts: Options): string {
  let charset = "";
  if (opts.upper)   charset += UPPER;
  if (opts.lower)   charset += LOWER;
  if (opts.numbers) charset += NUMS;
  if (opts.symbols) charset += SYMS;
  if (!charset) charset = LOWER;

  if (opts.noAmbiguous) charset = charset.replace(AMBIGUOUS, "");

  let pwd = "";
  const arr = new Uint32Array(opts.length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < opts.length; i++) {
    pwd += charset[arr[i] % charset.length];
  }

  // Ensure at least one character from each required set
  const required: string[] = [];
  if (opts.upper)   required.push(UPPER.replace(AMBIGUOUS, ""));
  if (opts.lower)   required.push(LOWER.replace(AMBIGUOUS, ""));
  if (opts.numbers) required.push(NUMS.replace(AMBIGUOUS, ""));
  if (opts.symbols) required.push(SYMS);

  if (required.length > 1 && pwd.length >= required.length) {
    const positions = new Uint32Array(required.length);
    crypto.getRandomValues(positions);
    const chars = pwd.split("");
    for (let i = 0; i < required.length; i++) {
      const set = required[i];
      if (!set) continue;
      const charArr = new Uint32Array(1);
      crypto.getRandomValues(charArr);
      chars[positions[i] % chars.length] = set[charArr[0] % set.length];
    }
    pwd = chars.join("");
  }

  return pwd;
}

function calcEntropy(opts: Options): number {
  let charsetSize = 0;
  if (opts.upper)   charsetSize += opts.noAmbiguous ? UPPER.replace(AMBIGUOUS, "").length : UPPER.length;
  if (opts.lower)   charsetSize += opts.noAmbiguous ? LOWER.replace(AMBIGUOUS, "").length : LOWER.length;
  if (opts.numbers) charsetSize += opts.noAmbiguous ? NUMS.replace(AMBIGUOUS, "").length : NUMS.length;
  if (opts.symbols) charsetSize += SYMS.length;
  if (charsetSize === 0) return 0;
  return opts.length * Math.log2(charsetSize);
}

function strengthLabel(entropy: number): { label: string; color: string; pct: number } {
  if (entropy < 28)  return { label: "Weak",       color: "#ef4444", pct: 15 };
  if (entropy < 36)  return { label: "Fair",        color: "#f97316", pct: 35 };
  if (entropy < 60)  return { label: "Good",        color: "#f59e0b", pct: 55 };
  if (entropy < 80)  return { label: "Strong",      color: "#22c55e", pct: 75 };
  return               { label: "Very Strong",  color: "#10b981", pct: 100 };
}

export default function PasswordGenerator({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [opts, setOpts] = useState<Options>({
    length: 16,
    upper: true,
    lower: true,
    numbers: true,
    symbols: false,
    noAmbiguous: false,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    setPassword(generatePassword(opts));
    setCopied(false);
  }, [opts]);

  useEffect(() => {
    generate();
  }, [generate]);

  const entropy = calcEntropy(opts);
  const strength = strengthLabel(entropy);

  const copy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggle = (key: keyof Options) => {
    setOpts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkboxes: { key: keyof Options; label: string }[] = [
    { key: "upper", label: "Uppercase (A–Z)" },
    { key: "lower", label: "Lowercase (a–z)" },
    { key: "numbers", label: "Numbers (0–9)" },
    { key: "symbols", label: "Symbols (!@#…)" },
    { key: "noAmbiguous", label: "Exclude ambiguous (0/O/l/1/I)" },
  ];

  return (
    <TemplateShell config={config} icon="🔑">
      <div className="p-4">
        {/* Password display */}
        <div
          className="rounded-2xl p-4 mb-4 relative"
          style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
        >
          <p
            className="font-mono text-lg break-all leading-relaxed min-h-[3rem] text-center tracking-wider"
            style={{ color }}
          >
            {password || "—"}
          </p>
        </div>

        {/* Strength meter */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Strength</span>
            <span className="font-semibold" style={{ color: strength.color }}>{strength.label}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{entropy.toFixed(0)} bits of entropy</p>
        </div>

        {/* Length slider */}
        <div className="mb-5">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Length</span>
            <span style={{ color }}>{opts.length}</span>
          </div>
          <input
            type="range"
            min={8}
            max={64}
            value={opts.length}
            onChange={(e) => setOpts((prev) => ({ ...prev, length: parseInt(e.target.value, 10) }))}
            className="w-full accent-current"
            style={{ accentColor: color }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>8</span>
            <span>64</span>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2 mb-5">
          {checkboxes.map((cb) => (
            <label key={cb.key} className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => toggle(cb.key)}
                className="w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-all cursor-pointer"
                style={{
                  borderColor: opts[cb.key] ? color : "#d1d5db",
                  backgroundColor: opts[cb.key] ? color : "white",
                }}
              >
                {opts[cb.key] && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <span className="text-sm text-gray-700">{cb.label}</span>
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generate}
            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-95"
            style={{ backgroundColor: color }}
          >
            Generate
          </button>
          <button
            onClick={copy}
            className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all active:scale-95"
            style={{
              borderColor: color,
              color: copied ? "white" : color,
              backgroundColor: copied ? color : "transparent",
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </TemplateShell>
  );
}
