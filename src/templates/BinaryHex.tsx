"use client";

import { useState, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Field = "decimal" | "binary" | "hex" | "octal";

function toBinary(n: number): string {
  if (n < 0) return "Negative numbers not supported";
  return n.toString(2);
}

function toHex(n: number): string {
  return n.toString(16).toUpperCase();
}

function toOctal(n: number): string {
  return n.toString(8);
}

function spacedBinary(bin: string): string {
  // Group into nibbles from right
  const padded = bin.padStart(Math.ceil(bin.length / 4) * 4, "0");
  const groups: string[] = [];
  for (let i = 0; i < padded.length; i += 4) {
    groups.push(padded.slice(i, i + 4));
  }
  return groups.join(" ");
}

function getBitLength(n: number): "8-bit" | "16-bit" | "32-bit" | "64-bit" {
  if (n <= 0xff) return "8-bit";
  if (n <= 0xffff) return "16-bit";
  if (n <= 0xffffffff) return "32-bit";
  return "64-bit";
}

function parseValue(input: string, base: number): number | null {
  if (!input.trim()) return null;
  const n = parseInt(input.trim(), base);
  if (isNaN(n) || n < 0) return null;
  return n;
}

export default function BinaryHex({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const [decimal, setDecimal] = useState("");
  const [binary, setBinary] = useState("");
  const [hex, setHex] = useState("");
  const [octal, setOctal] = useState("");
  const [lastEdited, setLastEdited] = useState<Field | null>(null);

  const updateFrom = useCallback((source: Field, value: string) => {
    setLastEdited(source);

    const bases: Record<Field, number> = { decimal: 10, binary: 2, hex: 16, octal: 8 };
    const n = parseValue(value, bases[source]);

    // Always set the source field as-is
    if (source === "decimal") setDecimal(value);
    if (source === "binary") setBinary(value);
    if (source === "hex") setHex(value);
    if (source === "octal") setOctal(value);

    if (n === null) {
      // Clear other fields if input is empty
      if (!value.trim()) {
        if (source !== "decimal") setDecimal("");
        if (source !== "binary") setBinary("");
        if (source !== "hex") setHex("");
        if (source !== "octal") setOctal("");
      } else {
        // Keep other fields unchanged but indicate error
        if (source !== "decimal") setDecimal("—");
        if (source !== "binary") setBinary("—");
        if (source !== "hex") setHex("—");
        if (source !== "octal") setOctal("—");
      }
      return;
    }

    if (source !== "decimal") setDecimal(n.toString(10));
    if (source !== "binary") setBinary(toBinary(n));
    if (source !== "hex") setHex(toHex(n));
    if (source !== "octal") setOctal(toOctal(n));
  }, []);

  // Compute the canonical number for display
  const bases: Record<Field, number> = { decimal: 10, binary: 2, hex: 16, octal: 8 };
  const srcField = lastEdited || "decimal";
  const srcValue = { decimal, binary, hex, octal }[srcField];
  const n = parseValue(srcValue, bases[srcField]);

  const bitLen = n !== null ? getBitLength(n) : null;
  const spaced = n !== null ? spacedBinary(toBinary(n)) : null;

  const fields: { id: Field; label: string; placeholder: string; value: string; prefix?: string }[] = [
    { id: "decimal", label: "Decimal (Base 10)", placeholder: "e.g. 255", value: decimal },
    { id: "binary", label: "Binary (Base 2)", placeholder: "e.g. 11111111", value: binary },
    { id: "hex", label: "Hexadecimal (Base 16)", placeholder: "e.g. FF", prefix: "0x", value: hex },
    { id: "octal", label: "Octal (Base 8)", placeholder: "e.g. 377", prefix: "0o", value: octal },
  ];

  return (
    <TemplateShell config={config} icon="💾">
      <div className="p-4">
        <div className="space-y-3 mb-5">
          {fields.map((f) => (
            <div key={f.id}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-gray-400">
                {f.prefix && (
                  <span className="px-3 text-xs text-gray-400 font-mono bg-gray-50 border-r border-gray-200 py-3">
                    {f.prefix}
                  </span>
                )}
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => updateFrom(f.id, e.target.value)}
                  placeholder={f.placeholder}
                  className="flex-1 px-4 py-3 text-sm font-mono outline-none bg-transparent"
                  style={{ color: lastEdited === f.id ? color : "#374151" }}
                />
              </div>
            </div>
          ))}
        </div>

        {n !== null && spaced !== null && bitLen !== null && (
          <>
            {/* Bit length indicator */}
            <div className="flex gap-2 mb-4">
              {(["8-bit", "16-bit", "32-bit", "64-bit"] as const).map((b) => (
                <div
                  key={b}
                  className="flex-1 text-center py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    backgroundColor: bitLen === b ? color : `${color}10`,
                    color: bitLen === b ? "white" : "#9ca3af",
                  }}
                >
                  {b}
                </div>
              ))}
            </div>

            {/* Summary line */}
            <div
              className="rounded-2xl p-4 font-mono text-xs leading-relaxed break-all"
              style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
            >
              <p className="text-gray-500 mb-1 font-sans text-xs">Representation</p>
              <p className="text-gray-700">
                <span className="font-bold" style={{ color }}>Dec</span> {decimal}
              </p>
              <p className="text-gray-700">
                <span className="font-bold" style={{ color }}>Bin</span> {spaced}
              </p>
              <p className="text-gray-700">
                <span className="font-bold" style={{ color }}>Hex</span> 0x{hex}
              </p>
              <p className="text-gray-700">
                <span className="font-bold" style={{ color }}>Oct</span> 0o{octal}
              </p>
            </div>
          </>
        )}
      </div>
    </TemplateShell>
  );
}
