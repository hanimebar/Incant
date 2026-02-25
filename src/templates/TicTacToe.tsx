"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type Cell = null | "X" | "O";

const WINS: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: Cell[]): Cell | "draw" | null {
  for (const [a, b, c] of WINS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell !== null)) return "draw";
  return null;
}

export default function TicTacToe({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isX, setIsX] = useState(true);

  const result = checkWinner(board);

  const handleClick = (idx: number) => {
    if (board[idx] || result) return;
    const next = [...board];
    next[idx] = isX ? "X" : "O";
    setBoard(next);
    setIsX(!isX);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsX(true);
  };

  const statusText = result
    ? result === "draw"
      ? "Draw!"
      : `${result} wins!`
    : `${isX ? "X" : "O"}'s turn`;

  return (
    <TemplateShell config={config}>
      <div className="p-4">
        <div className="text-center mb-6">
          <p
            className="text-xl font-bold"
            style={{ color: result && result !== "draw" ? color : "#374151" }}
          >
            {statusText}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
          {board.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              className="aspect-square rounded-2xl border-2 text-4xl font-bold flex items-center justify-center transition-all active:scale-95"
              style={{
                borderColor: cell ? color : "#e5e7eb",
                backgroundColor: cell ? `${color}12` : "#f9fafb",
                color: cell === "X" ? color : "#ef4444",
                cursor: cell || result ? "default" : "pointer",
              }}
            >
              {cell}
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl text-white font-medium text-sm"
            style={{ backgroundColor: color }}
          >
            New Game
          </button>
        </div>
      </div>
    </TemplateShell>
  );
}
