"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Effect = "normal" | "robot" | "megaphone" | "cave" | "alien" | "darth";

const EFFECTS: Array<{ id: Effect; emoji: string; label: string; desc: string }> = [
  { id: "normal",    emoji: "🎤", label: "Normal",    desc: "Clean voice"      },
  { id: "robot",     emoji: "🤖", label: "Robot",     desc: "Metallic buzz"    },
  { id: "megaphone", emoji: "📢", label: "Megaphone", desc: "Loud & distorted" },
  { id: "cave",      emoji: "🏔️", label: "Cave",      desc: "Deep echo"        },
  { id: "alien",     emoji: "👽", label: "Alien",     desc: "Otherworldly"     },
  { id: "darth",     emoji: "😈", label: "Darth",     desc: "Dark & deep"      },
];

interface StopFn { (): void }

/**
 * Connects the mic source through an effect chain and returns a cleanup fn.
 * Each case returns a zero-arg stop() that disconnects everything.
 */
function applyEffect(
  ctx: AudioContext,
  source: MediaStreamAudioSourceNode,
  effect: Effect,
): StopFn {
  const dest = ctx.destination;
  const oscillators: OscillatorNode[] = [];
  const nodes: AudioNode[] = [];

  const stop: StopFn = () => {
    try { source.disconnect(); } catch { /* ignore */ }
    oscillators.forEach(o => { try { o.stop(); } catch { /* ignore */ } });
    nodes.forEach(n => { try { n.disconnect(); } catch { /* ignore */ } });
  };

  switch (effect) {
    case "normal": {
      source.connect(dest);
      break;
    }

    case "robot": {
      // Amplitude modulation at 80 Hz — classic ring-mod robot voice
      const carrier = ctx.createOscillator();
      carrier.type = "sine";
      carrier.frequency.value = 80;
      carrier.start();
      oscillators.push(carrier);

      // Scale carrier to [0, 1] range so gain swings 0→1 (tremolo at audio rate)
      const scaler = ctx.createGain();
      scaler.gain.value = 0.5;
      carrier.connect(scaler);

      const ringGain = ctx.createGain();
      ringGain.gain.value = 0.5; // base; scaler output adds ±0.5 → range [0,1]
      scaler.connect(ringGain.gain);

      nodes.push(scaler, ringGain);
      source.connect(ringGain);
      ringGain.connect(dest);
      break;
    }

    case "megaphone": {
      // Soft-clip distortion → narrow bandpass (telephone/megaphone character)
      const preGain = ctx.createGain();
      preGain.gain.value = 3;

      const waveshaper = ctx.createWaveShaper();
      const n = 256;
      const curve = new Float32Array(n);
      const k = 150;
      for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
      }
      waveshaper.curve = curve;
      waveshaper.oversample = "4x";

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 1800;
      bandpass.Q.value = 1.5;

      nodes.push(preGain, waveshaper, bandpass);
      source.connect(preGain);
      preGain.connect(waveshaper);
      waveshaper.connect(bandpass);
      bandpass.connect(dest);
      break;
    }

    case "cave": {
      // Two independent echo taps with gentle feedback
      const dry = ctx.createGain();
      dry.gain.value = 0.8;

      const delay1 = ctx.createDelay(2.0);
      delay1.delayTime.value = 0.28;
      const fb1 = ctx.createGain();
      fb1.gain.value = 0.5;

      const delay2 = ctx.createDelay(2.0);
      delay2.delayTime.value = 0.56;
      const fb2 = ctx.createGain();
      fb2.gain.value = 0.3;

      nodes.push(dry, delay1, fb1, delay2, fb2);
      source.connect(dry);
      dry.connect(dest);
      dry.connect(delay1);
      delay1.connect(fb1);
      fb1.connect(delay1);      // feedback loop
      delay1.connect(dest);
      dry.connect(delay2);
      delay2.connect(fb2);
      fb2.connect(delay2);      // feedback loop
      delay2.connect(dest);
      break;
    }

    case "alien": {
      // Ring modulation with a wobbling carrier (~1800 Hz ±800 Hz at 5 Hz LFO)
      const carrier = ctx.createOscillator();
      carrier.type = "sawtooth";
      carrier.frequency.value = 1800;
      carrier.start();
      oscillators.push(carrier);

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 5;
      lfo.start();
      oscillators.push(lfo);

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 800; // LFO depth in Hz
      lfo.connect(lfoGain);
      lfoGain.connect(carrier.frequency);

      const scaler = ctx.createGain();
      scaler.gain.value = 0.5;
      carrier.connect(scaler);

      const ringGain = ctx.createGain();
      ringGain.gain.value = 0.5;
      scaler.connect(ringGain.gain);

      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 300;

      nodes.push(lfoGain, scaler, ringGain, hp);
      source.connect(ringGain);
      ringGain.connect(hp);
      hp.connect(dest);
      break;
    }

    case "darth": {
      // Heavy low-pass + slow amplitude tremolo → dark, breathing quality
      const preGain = ctx.createGain();
      preGain.gain.value = 2.5;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 650;
      lowpass.Q.value = 5;

      const ampGain = ctx.createGain();
      ampGain.gain.value = 0.65;

      const tremolo = ctx.createOscillator();
      tremolo.type = "sine";
      tremolo.frequency.value = 2.8;
      tremolo.start();
      oscillators.push(tremolo);

      const trGain = ctx.createGain();
      trGain.gain.value = 0.3;
      tremolo.connect(trGain);
      trGain.connect(ampGain.gain); // modulate amplitude ±0.3

      nodes.push(preGain, lowpass, ampGain, trGain);
      source.connect(preGain);
      preGain.connect(lowpass);
      lowpass.connect(ampGain);
      ampGain.connect(dest);
      break;
    }
  }

  return stop;
}

interface AudioSession {
  ctx: AudioContext;
  source: MediaStreamAudioSourceNode;
  stream: MediaStream;
  stopEffect: StopFn;
}

export default function VoiceModulator({ config }: TemplateProps) {
  const [active, setActive] = useState(false);
  const [effect, setEffect] = useState<Effect>("robot");
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<AudioSession | null>(null);

  const color = config.primaryColor || "#6366f1";

  const stopSession = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;
    s.stopEffect();
    s.stream.getTracks().forEach(t => t.stop());
    s.ctx.close().catch(() => { /* ignore */ });
    sessionRef.current = null;
    setActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => stopSession, [stopSession]);

  const startSession = useCallback(async () => {
    try {
      setError(null);
      // getUserMedia must be called directly from an onClick handler (trusted user gesture).
      // We call resume() BEFORE getUserMedia so the AudioContext is unlocked first.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      await ctx.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const source = ctx.createMediaStreamSource(stream);
      const stopEffect = applyEffect(ctx, source, effect);
      sessionRef.current = { ctx, source, stream, stopEffect };
      setActive(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access denied";
      setError(
        msg.includes("Permission") || msg.includes("denied") || msg.includes("NotAllowed")
          ? "Microphone permission denied — allow it in your browser settings."
          : `Could not start mic: ${msg}`
      );
      setActive(false);
    }
  }, [effect]);

  const switchEffect = useCallback((next: Effect) => {
    setEffect(next);
    const s = sessionRef.current;
    if (!s) return;
    // Tear down old chain. The source node is now disconnected, so we must
    // reconnect it before applying the new effect.
    s.stopEffect();
    // Re-create source from the same stream (source nodes are single-use after disconnect)
    const newSource = s.ctx.createMediaStreamSource(s.stream);
    const stopEffect = applyEffect(s.ctx, newSource, next);
    sessionRef.current = { ...s, source: newSource, stopEffect };
  }, []);

  return (
    <TemplateShell config={config}>
      <div className="p-4 max-w-md mx-auto">

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-6 h-6">
          {active ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-semibold text-sm tracking-wide">LIVE — speak into mic</span>
            </>
          ) : (
            <span className="text-gray-500 text-sm">Tap Start, then speak</span>
          )}
        </div>

        {/* Effect grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {EFFECTS.map((e) => {
            const sel = effect === e.id;
            return (
              <button
                key={e.id}
                onClick={() => switchEffect(e.id)}
                className="flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all duration-150 active:scale-95 select-none"
                style={{
                  backgroundColor: sel ? `${color}22` : "transparent",
                  borderColor:     sel ? color        : `${color}35`,
                  color:           sel ? color        : "#9ca3af",
                }}
              >
                <span className="text-3xl">{e.emoji}</span>
                <span className="text-xs font-bold">{e.label}</span>
                <span className="text-xs opacity-60">{e.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Start / Stop — must use onClick so getUserMedia gets a trusted user gesture */}
        <button
          onClick={active ? stopSession : startSession}
          className="w-full py-5 rounded-2xl font-bold text-lg transition-all active:scale-95"
          style={{ backgroundColor: active ? "#dc2626" : color, color: "white" }}
        >
          {active ? "🛑 Stop" : "🎙️ Start"}
        </button>

        {error && (
          <p className="mt-3 text-center text-red-400 text-sm">{error}</p>
        )}

        <p className="mt-4 text-center text-gray-500 text-xs">
          💡 Use headphones to avoid feedback echo
        </p>
      </div>
    </TemplateShell>
  );
}
