"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const COLS = 15;
const ROWS = 15;
const CELL = 20;
const INTERVAL = 150;

type Pos = { x: number; y: number };
type Dir = { x: number; y: number };
type GameState = "idle" | "running" | "over";

function randomFood(snake: Pos[]): Pos {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  let pos: Pos;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (occupied.has(`${pos.x},${pos.y}`));
  return pos;
}

export default function Snake({ config, spellId: _spellId }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const snakeRef = useRef<Pos[]>([]);
  const dirRef = useRef<Dir>({ x: 1, y: 0 });
  const nextDirRef = useRef<Dir>({ x: 1, y: 0 });
  const foodRef = useRef<Pos>({ x: 0, y: 0 });
  const scoreRef = useRef(0);
  const gameStateRef = useRef<GameState>("idle");

  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    // Grid lines (subtle)
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(COLS * CELL, y * CELL);
      ctx.stroke();
    }

    // Food
    const food = foodRef.current;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.roundRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6, 4);
    ctx.fill();

    // Snake
    snakeRef.current.forEach((seg, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? color : `${color}cc`;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, isHead ? 5 : 3);
      ctx.fill();
    });
  }, [color]);

  const initGame = useCallback(() => {
    const cx = Math.floor(COLS / 2);
    const cy = Math.floor(ROWS / 2);
    snakeRef.current = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    foodRef.current = randomFood(snakeRef.current);
    scoreRef.current = 0;
    setScore(0);
  }, []);

  const startGame = useCallback(() => {
    initGame();
    gameStateRef.current = "running";
    setGameState("running");
  }, [initGame]);

  const tick = useCallback(() => {
    if (gameStateRef.current !== "running") return;

    dirRef.current = nextDirRef.current;
    const head = snakeRef.current[0];
    const newHead = {
      x: head.x + dirRef.current.x,
      y: head.y + dirRef.current.y,
    };

    // Wall collision
    if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
      gameStateRef.current = "over";
      setGameState("over");
      setScore(scoreRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      draw();
      return;
    }

    // Self collision
    if (snakeRef.current.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      gameStateRef.current = "over";
      setGameState("over");
      setScore(scoreRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      draw();
      return;
    }

    const ate = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
    const newSnake = [newHead, ...snakeRef.current];
    if (!ate) newSnake.pop();
    snakeRef.current = newSnake;

    if (ate) {
      foodRef.current = randomFood(newSnake);
      scoreRef.current = newSnake.length - 3;
      setScore(scoreRef.current);
    }

    draw();
  }, [draw]);

  useEffect(() => {
    if (gameState === "running") {
      intervalRef.current = setInterval(tick, INTERVAL);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [gameState, tick]);

  // Draw initial board
  useEffect(() => {
    draw();
  }, [draw]);

  // Key controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = dirRef.current;
      if (e.key === "ArrowUp" && d.y !== 1) nextDirRef.current = { x: 0, y: -1 };
      else if (e.key === "ArrowDown" && d.y !== -1) nextDirRef.current = { x: 0, y: 1 };
      else if (e.key === "ArrowLeft" && d.x !== 1) nextDirRef.current = { x: -1, y: 0 };
      else if (e.key === "ArrowRight" && d.x !== -1) nextDirRef.current = { x: 1, y: 0 };
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const swipe = (dx: number, dy: number) => {
    if (gameStateRef.current !== "running") return;
    const d = dirRef.current;
    if (dx === 0 && dy === -1 && d.y !== 1) nextDirRef.current = { x: 0, y: -1 };
    else if (dx === 0 && dy === 1 && d.y !== -1) nextDirRef.current = { x: 0, y: 1 };
    else if (dx === -1 && dy === 0 && d.x !== 1) nextDirRef.current = { x: -1, y: 0 };
    else if (dx === 1 && dy === 0 && d.x !== -1) nextDirRef.current = { x: 1, y: 0 };
  };

  const btnBase =
    "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white active:scale-95 transition-transform";

  return (
    <TemplateShell config={config} icon="🐍">
      <div className="p-4 flex flex-col items-center">
        {/* Score */}
        <div className="flex items-center gap-6 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Score</p>
            <p className="text-2xl font-bold" style={{ color }}>
              {score}
            </p>
          </div>
        </div>

        {/* Canvas wrapper */}
        <div className="relative rounded-2xl overflow-hidden border-2" style={{ borderColor: `${color}40` }}>
          <canvas
            ref={canvasRef}
            width={COLS * CELL}
            height={ROWS * CELL}
            className="block"
          />

          {/* Idle overlay */}
          {gameState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-2xl">
              <p className="text-4xl mb-3">🐍</p>
              <button
                onClick={startGame}
                className="px-8 py-3 rounded-xl text-white font-semibold"
                style={{ backgroundColor: color }}
              >
                Tap to Start
              </button>
            </div>
          )}

          {/* Game over overlay */}
          {gameState === "over" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-2xl">
              <p className="text-white text-xl font-bold mb-1">Game Over!</p>
              <p className="text-white/70 text-sm mb-4">Score: {score}</p>
              <button
                onClick={startGame}
                className="px-8 py-3 rounded-xl text-white font-semibold"
                style={{ backgroundColor: color }}
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* On-screen D-pad */}
        <div className="mt-5 flex flex-col items-center gap-1.5">
          <button
            onPointerDown={() => swipe(0, -1)}
            className={btnBase}
            style={{ backgroundColor: `${color}99` }}
            aria-label="Up"
          >
            ▲
          </button>
          <div className="flex gap-1.5">
            <button
              onPointerDown={() => swipe(-1, 0)}
              className={btnBase}
              style={{ backgroundColor: `${color}99` }}
              aria-label="Left"
            >
              ◀
            </button>
            <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: `${color}22` }} />
            <button
              onPointerDown={() => swipe(1, 0)}
              className={btnBase}
              style={{ backgroundColor: `${color}99` }}
              aria-label="Right"
            >
              ▶
            </button>
          </div>
          <button
            onPointerDown={() => swipe(0, 1)}
            className={btnBase}
            style={{ backgroundColor: `${color}99` }}
            aria-label="Down"
          >
            ▼
          </button>
        </div>
      </div>
    </TemplateShell>
  );
}
