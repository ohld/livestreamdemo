export type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

export type GameState = "idle" | "playing" | "won" | "lost";

export type Board = CellState[][];

export function createBoard(rows: number, cols: number, mines: number): Board {
  const board: Board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
    }))
  );
  return board;
}

export function placeMines(
  board: Board,
  mines: number,
  safeRow: number,
  safeCol: number
): Board {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (
      !newBoard[r][c].isMine &&
      !(Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1)
    ) {
      newBoard[r][c].isMine = true;
      placed++;
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!newBoard[r][c].isMine) {
        newBoard[r][c].neighborMines = countNeighborMines(newBoard, r, c);
      }
    }
  }

  return newBoard;
}

function countNeighborMines(board: Board, row: number, col: number): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length) {
        if (board[nr][nc].isMine) count++;
      }
    }
  }
  return count;
}

export function revealCell(board: Board, row: number, col: number): Board {
  const newBoard = board.map((r) => r.map((c) => ({ ...c })));
  const cell = newBoard[row][col];

  if (cell.isRevealed || cell.isFlagged) return newBoard;

  cell.isRevealed = true;

  if (cell.isMine) return newBoard;

  if (cell.neighborMines === 0) {
    floodReveal(newBoard, row, col);
  }

  return newBoard;
}

function floodReveal(board: Board, row: number, col: number): void {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length) {
        const neighbor = board[nr][nc];
        if (!neighbor.isRevealed && !neighbor.isMine && !neighbor.isFlagged) {
          neighbor.isRevealed = true;
          if (neighbor.neighborMines === 0) {
            floodReveal(board, nr, nc);
          }
        }
      }
    }
  }
}

export function toggleFlag(board: Board, row: number, col: number): Board {
  const newBoard = board.map((r) => r.map((c) => ({ ...c })));
  const cell = newBoard[row][col];
  if (!cell.isRevealed) {
    cell.isFlagged = !cell.isFlagged;
  }
  return newBoard;
}

export function checkWin(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && !cell.isRevealed) return false;
    }
  }
  return true;
}

export function revealAllMines(board: Board): Board {
  const newBoard = board.map((r) => r.map((c) => ({ ...c })));
  for (const row of newBoard) {
    for (const cell of row) {
      if (cell.isMine) {
        cell.isRevealed = true;
      }
    }
  }
  return newBoard;
}

export function countFlags(board: Board): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.isFlagged) count++;
    }
  }
  return count;
}
