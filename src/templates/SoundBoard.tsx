"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  { name: "Big Fart",     emoji: "💨", sound: "fart"        },
  { name: "Air Horn",     emoji: "📯", sound: "airhorn"     },
  { name: "Sad Trombone", emoji: "😢", sound: "sadtrombone" },
  { name: "Ba Dum Tss",   emoji: "🥁", sound: "rimshot"     },
  { name: "Boing",        emoji: "🪃", sound: "boing"       },
  { name: "Laser",        emoji: "🔫", sound: "laser"       },
  { name: "Drum Roll",    emoji: "🎶", sound: "drumroll"    },
  { name: "Clown Honk",   emoji: "🤡", sound: "honk"        },
];

const SOUND_DURATIONS: Record<SoundType, number> = {
  fart: 0.7, airhorn: 1.1, sadtrombone: 1.1, rimshot: 0.7,
  boing: 0.8, laser: 0.35, drumroll: 1.1, honk: 0.5,
};

// Offline-render a sound into an AudioBuffer — deterministic and reliable.
function buildSound(type: SoundType): AudioBuffer {
  const sr = 44100;
  const dur = SOUND_DURATIONS[type];
  const frames = Math.ceil(sr * dur);
  const ctx = new OfflineAudioContext(1, frames, sr);
  const dest = ctx.destination;
  const t0 = 0; // offline context starts at 0

  switch (type) {
    case "fart": {
      // Shaped white noise through a descending bandpass + gentle pitch wobble
      const buf = ctx.createBuffer(1, frames, sr);
      const data = buf.getChannelData(0);
      // layered randomness for a "wet" texture
      for (let i = 0; i < frames; i++) {
        const env = Math.pow(1 - i / frames, 0.5);
        data[i] = (Math.random() * 2 - 1) * env * 1.4;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;

      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(320, t0);
      bp.frequency.linearRampToValueAtTime(110, t0 + 0.3);
      bp.frequency.linearRampToValueAtTime(60,  t0 + dur);
      bp.Q.value = 2.5;

      // Second bandpass layer for body
      const bp2 = ctx.createBiquadFilter();
      bp2.type = "bandpass";
      bp2.frequency.setValueAtTime(80, t0);
      bp2.frequency.linearRampToValueAtTime(50, t0 + dur);
      bp2.Q.value = 1.5;

      const g = ctx.createGain();
      g.gain.setValueAtTime(3.5, t0);
      g.gain.linearRampToValueAtTime(0, t0 + dur);

      src.connect(bp);
      bp.connect(bp2);
      bp2.connect(g);
      g.connect(dest);
      src.start(t0);
      break;
    }

    case "airhorn": {
      // Rich sawtooth chord with fast attack
      [180, 270, 360, 450].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i < 2 ? "sawtooth" : "square";
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.35, t0 + 0.025);
        g.gain.setValueAtTime(0.35, t0 + 0.9);
        g.gain.linearRampToValueAtTime(0, t0 + 1.1);
        osc.connect(g); g.connect(dest);
        osc.start(t0); osc.stop(t0 + 1.1);
      });
      break;
    }

    case "sadtrombone": {
      // Bb4→Ab4→Gb4→Eb4, each note slides flat
      [466, 415, 370, 311].forEach((freq, i) => {
        const t = t0 + i * 0.2;
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.88, t + 0.22);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.45, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(g); g.connect(dest);
        osc.start(t); osc.stop(t + 0.28);
      });
      break;
    }

    case "rimshot": {
      // kick at t0
      {
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(160, t0);
        osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.12);
        const g = ctx.createGain();
        g.gain.setValueAtTime(1.2, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.15);
        osc.connect(g); g.connect(dest);
        osc.start(t0); osc.stop(t0 + 0.18);
      }
      // snare at t0+0.22
      {
        const t = t0 + 0.22;
        const nbuf = ctx.createBuffer(1, Math.ceil(sr * 0.2), sr);
        const nd = nbuf.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nd.length);
        const src = ctx.createBufferSource(); src.buffer = nbuf;
        const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1200;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.8, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        src.connect(hp); hp.connect(g); g.connect(dest);
        src.start(t);
      }
      // hi-hat at t0+0.44
      {
        const t = t0 + 0.44;
        const hbuf = ctx.createBuffer(1, Math.ceil(sr * 0.1), sr);
        const hd = hbuf.getChannelData(0);
        for (let i = 0; i < hd.length; i++) hd[i] = (Math.random() * 2 - 1) * (1 - i / hd.length);
        const src = ctx.createBufferSource(); src.buffer = hbuf;
        const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.6, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        src.connect(hp); hp.connect(g); g.connect(dest);
        src.start(t);
      }
      break;
    }

    case "boing": {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, t0);
      osc.frequency.exponentialRampToValueAtTime(80, t0 + 0.8);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.9, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.8);
      osc.connect(g); g.connect(dest);
      osc.start(t0); osc.stop(t0 + 0.8);
      break;
    }

    case "laser": {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(2200, t0);
      osc.frequency.exponentialRampToValueAtTime(80, t0 + 0.3);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.7, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
      osc.connect(g); g.connect(dest);
      osc.start(t0); osc.stop(t0 + 0.35);
      break;
    }

    case "drumroll": {
      const hits = 28;
      for (let i = 0; i < hits; i++) {
        const t = t0 + (i / hits) * 1.0;
        const hbuf = ctx.createBuffer(1, Math.ceil(sr * 0.06), sr);
        const hd = hbuf.getChannelData(0);
        for (let j = 0; j < hd.length; j++) hd[j] = (Math.random() * 2 - 1) * (1 - j / hd.length);
        const src = ctx.createBufferSource(); src.buffer = hbuf;
        const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2000;
        const g = ctx.createGain();
        const vel = 0.2 + (i / hits) * 0.7;
        g.gain.setValueAtTime(vel, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        src.connect(hp); hp.connect(g); g.connect(dest);
        src.start(t);
      }
      break;
    }

    case "honk": {
      [392, 311].forEach((freq, i) => {
        const t = t0 + i * 0.2;
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.5, t + 0.02);
        g.gain.setValueAtTime(0.5, t + 0.14);
        g.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.connect(g); g.connect(dest);
        osc.start(t); osc.stop(t + 0.22);
      });
      break;
    }
  }

  // startRendering returns a Promise — we return the ctx for promise-based rendering
  // (caller uses ctx.startRendering())
  return ctx.startRendering() as unknown as AudioBuffer;
}

export default function SoundBoard({ config }: TemplateProps) {
  const [active, setActive] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const buffers = useRef<Partial<Record<SoundType, AudioBuffer>>>({});

  const sounds: SoundButton[] =
    (config.customData?.sounds as SoundButton[] | undefined) ?? DEFAULT_SOUNDS;
  const color = config.primaryColor || "#6366f1";

  // Pre-render all sounds offline on mount — no timing issues at playback
  useEffect(() => {
    const soundTypes = sounds.map((s) => s.sound);
    const unique = [...new Set(soundTypes)] as SoundType[];

    Promise.all(
      unique.map(async (type) => {
        // buildSound returns a startRendering() Promise disguised as AudioBuffer
        const rendered = await (buildSound(type) as unknown as Promise<AudioBuffer>);
        buffers.current[type] = rendered;
      })
    ).then(() => setReady(true)).catch((e) => {
      console.error("[SoundBoard] offline render failed:", e);
      setReady(true); // still allow playback attempt
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getCtx = useCallback(async () => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const handlePress = useCallback(async (btn: SoundButton) => {
    setActive(btn.name);
    setAudioError(null);
    try {
      const ctx = await getCtx();
      const buf = buffers.current[btn.sound];
      if (!buf) {
        // fallback: try again in 300ms if buffers aren't ready yet
        setTimeout(() => handlePress(btn), 300);
        return;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;

      // DynamicsCompressor ensures audible output on all devices
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.knee.value = 20;
      comp.ratio.value = 8;
      comp.attack.value = 0.003;
      comp.release.value = 0.15;

      const master = ctx.createGain();
      master.gain.value = 1.4;

      src.connect(comp);
      comp.connect(master);
      master.connect(ctx.destination);
      src.start(ctx.currentTime + 0.01); // tiny future offset avoids scheduling-in-past
    } catch (e) {
      console.error("[SoundBoard]", e);
      setAudioError("Tap to unlock audio, then try again.");
    }
    setTimeout(() => setActive(null), 350);
  }, [getCtx]);

  return (
    <TemplateShell config={config}>
      <div className="p-4">
        <p className="text-center text-gray-400 text-sm mb-1">
          {config.description || "Tap a button to play a sound"}
        </p>
        {!ready && (
          <p className="text-center text-indigo-400 text-xs mb-3 animate-pulse">Loading sounds…</p>
        )}
        {audioError && (
          <p className="text-center text-red-400 text-xs mb-3">{audioError}</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {sounds.map((btn) => (
            <button
              key={btn.name}
              onClick={() => handlePress(btn)}
              disabled={!ready}
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 font-semibold text-sm select-none active:scale-95 transition-all disabled:opacity-40"
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
        <p className="text-center text-gray-300 text-xs mt-5">
          🔊 Sounds generated in your browser
        </p>
      </div>
    </TemplateShell>
  );
}
