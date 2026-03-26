"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  createBoard,
  placeMines,
  revealCell,
  toggleFlag,
  checkWin,
  revealAllMines,
  countFlags,
  Board,
  GameState,
} from "@/lib/minesweeper";

const ROWS = 10;
const COLS = 8;
const MINES = 12;

const NUMBER_COLORS: Record<number, string> = {
  1: "#2563eb",
  2: "#16a34a",
  3: "#dc2626",
  4: "#7c3aed",
  5: "#b91c1c",
  6: "#0891b2",
  7: "#1f2937",
  8: "#6b7280",
};

export default function MinesweeperGame({ onNewGame }: { onNewGame?: () => void }) {
  const [board, setBoard] = useState<Board>(() => createBoard(ROWS, COLS, MINES));
  const [gameState, setGameState] = useState<GameState>("idle");
  const [time, setTime] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const resetGame = useCallback(() => {
    setBoard(createBoard(ROWS, COLS, MINES));
    setGameState("idle");
    setTime(0);
    setFirstClick(true);
    onNewGame?.();
  }, [onNewGame]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameState === "won" || gameState === "lost") return;
      if (board[row][col].isFlagged) return;

      let currentBoard = board;

      if (firstClick) {
        currentBoard = placeMines(board, MINES, row, col);
        setFirstClick(false);
        setGameState("playing");
      }

      const cell = currentBoard[row][col];
      if (cell.isRevealed) return;

      if (cell.isMine) {
        setBoard(revealAllMines(currentBoard));
        setGameState("lost");
        return;
      }

      const newBoard = revealCell(currentBoard, row, col);
      setBoard(newBoard);

      if (checkWin(newBoard)) {
        setGameState("won");
      }
    },
    [board, gameState, firstClick]
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      if (gameState === "won" || gameState === "lost") return;
      if (board[row][col].isRevealed) return;
      setBoard(toggleFlag(board, row, col));
    },
    [board, gameState]
  );

  const handleTouchStart = useCallback(
    (row: number, col: number) => {
      longPressTriggered.current = false;
      longPressRef.current = setTimeout(() => {
        longPressTriggered.current = true;
        if (gameState === "won" || gameState === "lost") return;
        if (board[row][col].isRevealed) return;
        setBoard(toggleFlag(board, row, col));
      }, 400);
    },
    [board, gameState]
  );

  const handleTouchEnd = useCallback(
    (row: number, col: number) => {
      if (longPressRef.current) {
        clearTimeout(longPressRef.current);
        longPressRef.current = null;
      }
      if (!longPressTriggered.current) {
        handleCellClick(row, col);
      }
    },
    [handleCellClick]
  );

  const flagsCount = countFlags(board);
  const minesLeft = MINES - flagsCount;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto px-2">
      {/* Header */}
      <div className="flex items-center justify-between w-full bg-gray-800 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-red-400 font-mono font-bold text-lg">
          <span>💣</span>
          <span>{minesLeft}</span>
        </div>
        <button
          onClick={resetGame}
          className="text-2xl hover:scale-110 transition-transform active:scale-95"
        >
          {gameState === "won" ? "😎" : gameState === "lost" ? "💀" : "🙂"}
        </button>
        <div className="flex items-center gap-1.5 text-blue-400 font-mono font-bold text-lg">
          <span>⏱</span>
          <span>{time.toString().padStart(3, "0")}</span>
        </div>
      </div>

      {/* Game status */}
      {gameState === "won" && (
        <div className="text-green-400 font-bold text-lg animate-bounce">
          🎉 You Won!
        </div>
      )}
      {gameState === "lost" && (
        <div className="text-red-400 font-bold text-lg">
          💥 Game Over!
        </div>
      )}

      {/* Board */}
      <div
        className="grid gap-[2px] bg-gray-700 p-[2px] rounded-lg select-none"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onContextMenu={(e) => handleRightClick(e, r, c)}
              onTouchStart={() => handleTouchStart(r, c)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTouchEnd(r, c);
              }}
              onClick={() => handleCellClick(r, c)}
              className={`
                w-9 h-9 flex items-center justify-center text-sm font-bold rounded-sm
                transition-all duration-100
                ${
                  cell.isRevealed
                    ? cell.isMine
                      ? "bg-red-500/80"
                      : "bg-gray-600"
                    : "bg-gray-400 hover:bg-gray-350 active:bg-gray-500 cursor-pointer shadow-[inset_2px_2px_0_rgba(255,255,255,0.3),inset_-2px_-2px_0_rgba(0,0,0,0.2)]"
                }
              `}
              style={
                cell.isRevealed && !cell.isMine && cell.neighborMines > 0
                  ? { color: NUMBER_COLORS[cell.neighborMines] || "#fff" }
                  : undefined
              }
            >
              {cell.isRevealed
                ? cell.isMine
                  ? "💣"
                  : cell.neighborMines > 0
                  ? cell.neighborMines
                  : ""
                : cell.isFlagged
                ? "🚩"
                : ""}
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <p className="text-gray-400 text-xs text-center">
        Tap to reveal &bull; Long press to flag
      </p>
    </div>
  );
}
