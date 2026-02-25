"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

export default function QrGenerator({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [text, setText] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [fgColor, setFgColor] = useState("#000000");
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setDataUrl(null);
      setError(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const url = await QRCode.toDataURL(text, {
          width: 300,
          margin: 2,
          color: {
            dark: fgColor,
            light: "#ffffff",
          },
        });
        setDataUrl(url);
        setError(null);
      } catch {
        setError("Failed to generate QR code");
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, fgColor]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  };

  return (
    <TemplateShell config={config} icon="◻️">
      <div className="p-4">
        {/* Text input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Text or URL</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://example.com or any text"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none"
            style={{ borderColor: text ? color : undefined }}
          />
        </div>

        {/* Foreground colour */}
        <div className="mb-5 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">QR colour</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-2">
            <div
              className="w-8 h-8 rounded-lg overflow-hidden relative border border-gray-200"
              style={{ backgroundColor: fgColor }}
            >
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </div>
            <input
              type="text"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              maxLength={7}
              className="w-20 text-sm font-mono outline-none"
            />
          </div>
        </div>

        {/* QR output */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {dataUrl ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className="rounded-2xl p-4 inline-block"
              style={{ border: `2px solid ${color}30`, backgroundColor: "white" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dataUrl} alt="QR Code" className="w-64 h-64" />
            </div>
            <button
              onClick={download}
              className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-95 w-full"
              style={{ backgroundColor: color }}
            >
              Download PNG
            </button>
          </div>
        ) : (
          !error && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ backgroundColor: `${color}08`, border: `1px dashed ${color}30` }}
            >
              <div className="text-4xl mb-3 opacity-30" style={{ color }}>
                <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto" fill="currentColor">
                  <rect x="10" y="10" width="30" height="30" rx="4" />
                  <rect x="16" y="16" width="18" height="18" rx="2" fill="white" />
                  <rect x="22" y="22" width="6" height="6" />
                  <rect x="60" y="10" width="30" height="30" rx="4" />
                  <rect x="66" y="16" width="18" height="18" rx="2" fill="white" />
                  <rect x="72" y="22" width="6" height="6" />
                  <rect x="10" y="60" width="30" height="30" rx="4" />
                  <rect x="16" y="66" width="18" height="18" rx="2" fill="white" />
                  <rect x="22" y="72" width="6" height="6" />
                  <rect x="60" y="60" width="6" height="6" />
                  <rect x="72" y="60" width="18" height="6" />
                  <rect x="60" y="72" width="18" height="6" />
                  <rect x="84" y="66" width="6" height="18" />
                  <rect x="60" y="84" width="6" height="6" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Enter text or a URL above to generate a QR code</p>
            </div>
          )
        )}
      </div>
    </TemplateShell>
  );
}
