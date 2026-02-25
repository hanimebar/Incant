"use client";

import { useState, useEffect, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const WORD_LIST = [
  "about","above","abuse","actor","acute","admit","adopt","adult","after","again",
  "agent","agree","ahead","alarm","album","alert","alien","align","alive","alley",
  "allow","alone","along","alter","angel","anger","angle","angry","anime","ankle",
  "annex","apple","apply","arena","argue","arise","array","aside","asset","atlas",
  "avoid","award","awake","awful","badge","baker",
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

type TileState = "empty" | "tbd" | "correct" | "present" | "absent";

interface Tile {
  letter: string;
  state: TileState;
}

type KeyState = "unused" | "correct" | "present" | "absent";

const KEYBOARD_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

function pickWord(): string {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toUpperCase();
}

function evaluate(guess: string, target: string): TileState[] {
  const result: TileState[] = Array(WORD_LENGTH).fill("absent");
  const targetArr = target.split("");
  const guessArr = guess.split("");
  const used = Array(WORD_LENGTH).fill(false);

  // First pass: correct
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }

  // Second pass: present
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (!used[j] && guessArr[i] === targetArr[j]) {
        result[i] = "present";
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

const TILE_COLORS: Record<TileState, { bg: string; text: string; border: string }> = {
  empty:   { bg: "#ffffff", text: "#1f2937", border: "#d1d5db" },
  tbd:     { bg: "#ffffff", text: "#1f2937", border: "#6b7280" },
  correct: { bg: "#22c55e", text: "#ffffff", border: "#22c55e" },
  present: { bg: "#eab308", text: "#ffffff", border: "#eab308" },
  absent:  { bg: "#6b7280", text: "#ffffff", border: "#6b7280" },
};

const KEY_COLORS: Record<KeyState, { bg: string; text: string }> = {
  unused:  { bg: "#e5e7eb", text: "#1f2937" },
  correct: { bg: "#22c55e", text: "#ffffff" },
  present: { bg: "#eab308", text: "#ffffff" },
  absent:  { bg: "#9ca3af", text: "#ffffff" },
};

type GamePhase = "playing" | "won" | "lost";

export default function WordleClone({ config, spellId: _spellId }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const [target, setTarget] = useState<string>(() => pickWord());
  const [board, setBoard] = useState<Tile[][]>(() =>
    Array.from({ length: MAX_GUESSES }, () =>
      Array.from({ length: WORD_LENGTH }, () => ({ letter: "", state: "empty" as TileState }))
    )
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [message, setMessage] = useState("");
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  const [shake, setShake] = useState(false);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const newGame = useCallback(() => {
    setTarget(pickWord());
    setBoard(
      Array.from({ length: MAX_GUESSES }, () =>
        Array.from({ length: WORD_LENGTH }, () => ({ letter: "", state: "empty" as TileState }))
      )
    );
    setCurrentRow(0);
    setCurrentCol(0);
    setPhase("playing");
    setMessage("");
    setKeyStates({});
  }, []);

  const pressKey = useCallback(
    (key: string) => {
      if (phase !== "playing") return;

      if (key === "⌫" || key === "BACKSPACE") {
        if (currentCol === 0) return;
        const next = board.map((r) => r.map((t) => ({ ...t })));
        next[currentRow][currentCol - 1] = { letter: "", state: "empty" };
        setBoard(next);
        setCurrentCol(currentCol - 1);
        return;
      }

      if (key === "ENTER") {
        const guess = board[currentRow].map((t) => t.letter).join("");
        if (guess.length < WORD_LENGTH) {
          showMessage("Not enough letters");
          triggerShake();
          return;
        }

        const states = evaluate(guess, target);
        const next = board.map((r) => r.map((t) => ({ ...t })));
        states.forEach((state, i) => {
          next[currentRow][i].state = state;
        });
        setBoard(next);

        // Update key states
        const newKeyStates = { ...keyStates };
        const priority: KeyState[] = ["correct", "present", "absent", "unused"];
        guess.split("").forEach((letter, i) => {
          const current = newKeyStates[letter] || "unused";
          const next2 = states[i] as KeyState;
          if (priority.indexOf(next2) < priority.indexOf(current)) {
            newKeyStates[letter] = next2;
          }
        });
        setKeyStates(newKeyStates);

        const won = states.every((s) => s === "correct");
        if (won) {
          const msgs = ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!"];
          setTimeout(() => showMessage(msgs[currentRow] || "Brilliant! 🎉"), 300);
          setPhase("won");
          setCurrentRow(currentRow + 1);
          return;
        }

        if (currentRow + 1 >= MAX_GUESSES) {
          setTimeout(() => showMessage(`The word was ${target}`), 300);
          setPhase("lost");
          setCurrentRow(currentRow + 1);
          return;
        }

        setCurrentRow(currentRow + 1);
        setCurrentCol(0);
        return;
      }

      if (/^[A-Z]$/.test(key) && currentCol < WORD_LENGTH) {
        const next = board.map((r) => r.map((t) => ({ ...t })));
        next[currentRow][currentCol] = { letter: key, state: "tbd" };
        setBoard(next);
        setCurrentCol(currentCol + 1);
      }
    },
    [phase, currentRow, currentCol, board, target, keyStates]
  );

  // Physical keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (k === "BACKSPACE") pressKey("⌫");
      else if (k === "ENTER") pressKey("ENTER");
      else if (/^[A-Z]$/.test(k)) pressKey(k);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pressKey]);

  return (
    <TemplateShell config={config} icon="🟩">
      <div className="p-4 flex flex-col items-center">
        {/* Message toast */}
        <div className="h-8 mb-2 flex items-center justify-center">
          {message && (
            <div className="bg-gray-800 text-white text-sm font-medium px-4 py-1.5 rounded-lg">
              {message}
            </div>
          )}
        </div>

        {/* Board */}
        <div className="grid gap-1.5 mb-5" style={{ gridTemplateRows: `repeat(${MAX_GUESSES}, 1fr)` }}>
          {board.map((row, r) => (
            <div
              key={r}
              className={`flex gap-1.5 ${shake && r === currentRow ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
            >
              {row.map((tile, c) => {
                const colors = TILE_COLORS[tile.state];
                return (
                  <div
                    key={c}
                    className="flex items-center justify-center font-bold text-lg rounded-md border-2 select-none"
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderColor: colors.border,
                      transition: "background-color 0.15s, border-color 0.15s",
                    }}
                  >
                    {tile.letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Keyboard */}
        <div className="w-full max-w-xs space-y-1.5">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.map((key) => {
                const ks: KeyState = keyStates[key] || "unused";
                const kc = KEY_COLORS[ks];
                const isWide = key === "ENTER" || key === "⌫";
                return (
                  <button
                    key={key}
                    onPointerDown={() => pressKey(key)}
                    className="rounded-md font-bold text-xs active:opacity-70 transition-opacity select-none"
                    style={{
                      backgroundColor: key === "ENTER" ? color : kc.bg,
                      color: key === "ENTER" ? "#ffffff" : kc.text,
                      width: isWide ? 52 : 32,
                      height: 44,
                      fontSize: key === "ENTER" ? 9 : 13,
                    }}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* New game button after end */}
        {(phase === "won" || phase === "lost") && (
          <button
            onClick={newGame}
            className="mt-5 px-8 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: color }}
          >
            New Game
          </button>
        )}
      </div>
    </TemplateShell>
  );
}
