"use client";

import { useState, useRef, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type SoundType =
  | "fart" | "airhorn" | "sadtrombone" | "rimshot"
  | "boing" | "laser" | "drumroll" | "honk";

interface SoundButton {
  name: string;
  emoji: string;
  sound: SoundType;
}

const DEFAULT_SOUNDS: SoundButton[] = [
  { name: "Big Fart",      emoji: "💨", sound: "fart"        },
  { name: "Air Horn",      emoji: "📯", sound: "airhorn"     },
  { name: "Sad Trombone",  emoji: "😢", sound: "sadtrombone" },
  { name: "Ba Dum Tss",    emoji: "🥁", sound: "rimshot"     },
  { name: "Boing",         emoji: "🪃", sound: "boing"       },
  { name: "Laser",         emoji: "🔫", sound: "laser"       },
  { name: "Drum Roll",     emoji: "🎶", sound: "drumroll"    },
  { name: "Clown Honk",    emoji: "🤡", sound: "honk"        },
];

function scheduleSound(ctx: AudioContext, type: SoundType) {
  const now = ctx.currentTime;
  const out = ctx.destination;

  switch (type) {
    case "fart": {
      // Filtered noise burst with LFO on cutoff — realistic flatulence
      const dur = 0.55;
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 0.6);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.setValueAtTime(180, now + 0.15);
      filter.frequency.setValueAtTime(90,  now + 0.35);
      filter.Q.value = 3;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      src.connect(filter); filter.connect(gain); gain.connect(out);
      src.start(now);
      break;
    }

    case "airhorn": {
      // Sawtooth + detuned sine chord, fast attack, sustained blast
      const dur = 1.0;
      [180, 270, 360, 540].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? "sawtooth" : "square";
        osc.frequency.value = freq;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.setValueAtTime(0.18, now + dur - 0.1);
        gain.gain.linearRampToValueAtTime(0, now + dur);

        osc.connect(gain); gain.connect(out);
        osc.start(now); osc.stop(now + dur);
      });
      break;
    }

    case "sadtrombone": {
      // Classic wah-wah descent
      const notes = [466, 415, 370, 311]; // Bb4 → Ab4 → Gb4 → Eb4
      notes.forEach((freq, i) => {
        const t = now + i * 0.18;
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.88, t + 0.18);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain); gain.connect(out);
        osc.start(t); osc.stop(t + 0.25);
      });
      break;
    }

    case "rimshot": {
      // Snare crack (noise) + kick thud + short silence + hi-hat = "ba dum tss"
      // kick at t=0
      const kick = () => {
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.8, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(g); g.connect(out);
        osc.start(now); osc.stop(now + 0.15);
      };
      // snare at t=0.22
      const snare = (t: number) => {
        const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.18), ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass"; filter.frequency.value = 1200;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.5, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        src.connect(filter); filter.connect(g); g.connect(out);
        src.start(t);
      };
      // hi-hat at t=0.44
      const hihat = (t: number) => {
        const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.08), ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass"; filter.frequency.value = 7000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        src.connect(filter); filter.connect(g); g.connect(out);
        src.start(t);
      };
      kick();
      snare(now + 0.22);
      kick(); // second kick overlapping snare is actually at now+0.22 too
      hihat(now + 0.44);
      break;
    }

    case "boing": {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.7);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain); gain.connect(out);
      osc.start(now); osc.stop(now + 0.7);
      break;
    }

    case "laser": {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain); gain.connect(out);
      osc.start(now); osc.stop(now + 0.28);
      break;
    }

    case "drumroll": {
      const hitCount = 24;
      const totalDur = 1.0;
      for (let i = 0; i < hitCount; i++) {
        const t = now + (i / hitCount) * totalDur;
        const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.05), ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * (1 - j / d.length);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass"; filter.frequency.value = 2000;
        const g = ctx.createGain();
        const vel = 0.15 + (i / hitCount) * 0.4; // crescendo
        g.gain.setValueAtTime(vel, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        src.connect(filter); filter.connect(g); g.connect(out);
        src.start(t);
      }
      break;
    }

    case "honk": {
      // Two-tone clown horn
      [392, 311].forEach((freq, i) => {
        const t = now + i * 0.18;
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
        gain.gain.setValueAtTime(0.3, t + 0.13);
        gain.gain.linearRampToValueAtTime(0, t + 0.17);
        osc.connect(gain); gain.connect(out);
        osc.start(t); osc.stop(t + 0.2);
      });
      break;
    }
  }
}

export default function SoundBoard({ config, spellId }: TemplateProps) {
  const [active, setActive] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const sounds: SoundButton[] =
    (config.customData?.sounds as SoundButton[] | undefined) ?? DEFAULT_SOUNDS;
  const color = config.primaryColor || "#6366f1";

  const handlePress = useCallback(async (btn: SoundButton) => {
    setActive(btn.name);
    setAudioError(null);
    try {
      // Create AudioContext on first press (must be inside a user gesture)
      if (!ctxRef.current || ctxRef.current.state === "closed") {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = new AC();
      }
      // resume() is required on all modern browsers — context starts "suspended"
      await ctxRef.current.resume();
      scheduleSound(ctxRef.current, btn.sound);
    } catch (e) {
      console.error("[SoundBoard]", e);
      setAudioError("Audio blocked — try clicking first, then tapping a sound.");
    }
    setTimeout(() => setActive(null), 300);
  }, []);

  return (
    <TemplateShell config={config}>
      <div className="p-4">
        <p className="text-center text-gray-400 text-sm mb-4">
          {config.description || "Tap a button to play a sound"}
        </p>
        {audioError && (
          <p className="text-center text-red-400 text-xs mb-3">{audioError}</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {sounds.map((btn) => (
            <button
              key={btn.name}
              onClick={() => handlePress(btn)}
              className="relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 font-semibold text-sm select-none active:scale-95 transition-all"
              style={{
                backgroundColor: active === btn.name ? color : `${color}18`,
                borderColor:     active === btn.name ? color : `${color}40`,
                color:           active === btn.name ? "white" : color,
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
