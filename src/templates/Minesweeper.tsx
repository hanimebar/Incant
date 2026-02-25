"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const ROWS = 9;
const COLS = 9;
const MINES = 10;

type CellState = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

type GamePhase = "idle" | "playing" | "won" | "lost";

const NUM_COLORS: Record<number, string> = {
  1: "#2563eb",
  2: "#16a34a",
  3: "#dc2626",
  4: "#1d4ed8",
  5: "#991b1b",
  6: "#0e7490",
  7: "#7c3aed",
  8: "#374151",
};

function buildEmpty(): CellState[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );
}

function placeMines(grid: CellState[][], excludeR: number, excludeC: number): CellState[][] {
  const next = grid.map((row) => row.map((cell) => ({ ...cell })));
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if ((r === excludeR && c === excludeC) || next[r][c].mine) continue;
    next[r][c].mine = true;
    placed++;
  }
  // Compute adjacency
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (next[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && next[nr][nc].mine) count++;
        }
      }
      next[r][c].adjacent = count;
    }
  }
  return next;
}

function floodReveal(grid: CellState[][], r: number, c: number): CellState[][] {
  const next = grid.map((row) => row.map((cell) => ({ ...cell })));
  const queue: [number, number][] = [[r, c]];
  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue;
    const cell = next[cr][cc];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) queue.push([cr + dr, cc + dc]);
        }
      }
    }
  }
  return next;
}

function checkWin(grid: CellState[][]): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r][c].mine && !grid[r][c].revealed) return false;
    }
  }
  return true;
}

export default function Minesweeper({ config, spellId: _spellId }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";

  const [grid, setGrid] = useState<CellState[][]>(buildEmpty);
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [flags, setFlags] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const newGame = () => {
    stopTimer();
    setGrid(buildEmpty());
    setPhase("idle");
    setFlags(0);
    setSeconds(0);
  };

  const handleReveal = (r: number, c: number) => {
    if (phase === "won" || phase === "lost") return;
    const cell = grid[r][c];
    if (cell.flagged || cell.revealed) return;

    let currentGrid = grid;

    if (phase === "idle") {
      currentGrid = placeMines(grid, r, c);
      setPhase("playing");
      startTimer();
    }

    if (currentGrid[r][c].mine) {
      // Reveal all mines
      const revealed = currentGrid.map((row) =>
        row.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell))
      );
      setGrid(revealed);
      setPhase("lost");
      stopTimer();
      return;
    }

    const updated = floodReveal(currentGrid, r, c);
    setGrid(updated);

    if (checkWin(updated)) {
      setPhase("won");
      stopTimer();
    }
  };

  const handleFlag = (r: number, c: number) => {
    if (phase === "won" || phase === "lost") return;
    const cell = grid[r][c];
    if (cell.revealed) return;
    const next = grid.map((row) => row.map((c2) => ({ ...c2 })));
    next[r][c].flagged = !next[r][c].flagged;
    setGrid(next);
    setFlags((f) => (next[r][c].flagged ? f + 1 : f - 1));
  };

  const startLongPress = (r: number, c: number) => {
    longPressRef.current = setTimeout(() => {
      handleFlag(r, c);
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  };

  const pad = (n: number) => String(n).padStart(3, "0");

  return (
    <TemplateShell config={config} icon="💣">
      <div className="p-4">
        {/* Header row */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-2.5 mb-4"
          style={{ background: `${color}15` }}
        >
          <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-gray-700">
            <span>🚩</span>
            <span>{pad(MINES - flags)}</span>
          </div>
          <button
            onClick={newGame}
            className="text-xl leading-none"
            aria-label="New game"
          >
            {phase === "won" ? "😎" : phase === "lost" ? "😵" : "🙂"}
          </button>
          <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-gray-700">
            <span>⏱</span>
            <span>{pad(Math.min(seconds, 999))}</span>
          </div>
        </div>

        {/* Grid */}
        <div
          className="inline-grid rounded-xl overflow-hidden border-2 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            borderColor: `${color}40`,
            display: "grid",
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              let bg = "#d1d5db";
              let text = "";
              let textColor = "#374151";
              let cursor = "pointer";

              if (cell.revealed) {
                bg = "#e5e7eb";
                if (cell.mine) {
                  bg = "#fca5a5";
                  text = "💣";
                } else if (cell.adjacent > 0) {
                  text = String(cell.adjacent);
                  textColor = NUM_COLORS[cell.adjacent] || "#374151";
                }
              } else if (cell.flagged) {
                text = "🚩";
              }

              return (
                <button
                  key={`${r}-${c}`}
                  onPointerDown={() => startLongPress(r, c)}
                  onPointerUp={() => {
                    cancelLongPress();
                    if (!longPressRef.current) return;
                  }}
                  onPointerLeave={cancelLongPress}
                  onClick={() => handleReveal(r, c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleFlag(r, c);
                  }}
                  disabled={cell.revealed && !cell.mine}
                  className="flex items-center justify-center text-xs font-bold border border-gray-300 transition-colors"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: bg,
                    color: textColor,
                    fontSize: cell.flagged || cell.mine ? 14 : 11,
                    cursor,
                    boxShadow: !cell.revealed ? "inset 1px 1px 0 rgba(255,255,255,0.6), inset -1px -1px 0 rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  {text}
                </button>
              );
            })
          )}
        </div>

        {/* Result banner */}
        {(phase === "won" || phase === "lost") && (
          <div className="mt-4 text-center">
            <p className="text-lg font-bold text-gray-800 mb-1">
              {phase === "won" ? "You won! 🎉" : "Boom! 💥"}
            </p>
            {phase === "won" && (
              <p className="text-sm text-gray-500 mb-3">Cleared in {seconds}s</p>
            )}
            <button
              onClick={newGame}
              className="px-6 py-2.5 rounded-xl text-white font-medium text-sm"
              style={{ backgroundColor: color }}
            >
              New Game
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-3">
          Long press or right-click to flag
        </p>
      </div>
    </TemplateShell>
  );
}
