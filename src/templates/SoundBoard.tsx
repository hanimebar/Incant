"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type SoundType = "toot" | "squeak" | "blast" | "rumble" | "chirp" | "boing" | "zap" | "pop";

interface SoundButton {
  name: string;
  emoji: string;
  sound: SoundType;
}

const DEFAULT_SOUNDS: SoundButton[] = [
  { name: "Classic Toot", emoji: "💨", sound: "toot" },
  { name: "High Squeak", emoji: "🐭", sound: "squeak" },
  { name: "Big Blast", emoji: "💥", sound: "blast" },
  { name: "Low Rumble", emoji: "🌩️", sound: "rumble" },
  { name: "Chirp", emoji: "🐦", sound: "chirp" },
  { name: "Boing", emoji: "🎪", sound: "boing" },
  { name: "Zap", emoji: "⚡", sound: "zap" },
  { name: "Pop", emoji: "🎈", sound: "pop" },
];

// Singleton AudioContext — iOS limits concurrent instances to 4
let _ctx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === "closed") {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    _ctx = new AC();
  }
  return _ctx;
}

function playSound(type: SoundType) {
  const ctx = getCtx();
  // iOS Safari starts AudioContext in "suspended" state even on user gesture —
  // must call resume() before scheduling any nodes.
  ctx.resume().then(() => {
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (type) {
    case "toot": {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now); osc.stop(now + 0.5);
      break;
    }
    case "squeak": {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
      break;
    }
    case "blast": {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
      const src = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 300;
      src.buffer = buf;
      src.connect(filter); filter.connect(gain);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      src.start(now);
      break;
    }
    case "rumble": {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5);
      const src = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 120;
      src.buffer = buf;
      src.connect(filter); filter.connect(gain);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      src.start(now);
      break;
    }
    case "chirp": {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
      break;
    }
    case "boing": {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.6);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now); osc.stop(now + 0.6);
      break;
    }
    case "zap": {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(2000, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now); osc.stop(now + 0.2);
      break;
    }
    case "pop": {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now); osc.stop(now + 0.08);
      break;
    }
  }
  }); // ctx.resume().then
}

export default function SoundBoard({ config, spellId }: TemplateProps) {
  const [active, setActive] = useState<string | null>(null);

  const sounds: SoundButton[] = (config.customData?.sounds as SoundButton[] | undefined) ?? DEFAULT_SOUNDS;
  const color = config.primaryColor || "#6366f1";

  const handlePress = (btn: SoundButton) => {
    setActive(btn.name);
    playSound(btn.sound);
    setTimeout(() => setActive(null), 300);
  };

  return (
    <TemplateShell config={config}>
      <div className="p-4">
        <p className="text-center text-gray-400 text-sm mb-6">{config.description || "Tap a button to play a sound"}</p>
        <div className="grid grid-cols-2 gap-3">
          {sounds.map((btn) => (
            <button
              key={btn.name}
              onPointerDown={() => handlePress(btn)}
              className="relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 font-semibold text-sm select-none active:scale-95 transition-all"
              style={{
                backgroundColor: active === btn.name ? color : `${color}18`,
                borderColor: active === btn.name ? color : `${color}40`,
                color: active === btn.name ? "white" : color,
              }}
            >
              <span className="text-3xl">{btn.emoji}</span>
              <span>{btn.name}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-gray-300 text-xs mt-6">
          🔊 Sounds generated in your browser — no downloads
        </p>
      </div>
    </TemplateShell>
  );
}
