import React, { useEffect, useRef, useState } from 'react';
import './Tetris.css';

const COLS = 10;
const ROWS = 20;

type Cell = number;
type Board = Cell[][];

const SHAPES = {
  I: [
    [1, 1, 1, 1],
  ],
  O: [
    [2, 2],
    [2, 2],
  ],
  T: [
    [0, 3, 0],
    [3, 3, 3],
  ],
  S: [
    [0, 4, 4],
    [4, 4, 0],
  ],
  Z: [
    [5, 5, 0],
    [0, 5, 5],
  ],
  J: [
    [6, 0, 0],
    [6, 6, 6],
  ],
  L: [
    [0, 0, 7],
    [7, 7, 7],
  ],
};

const COLORS = [
  'white',
  'cyan',
  'yellow',
  'purple',
  'green',
  'red',
  'blue',
  'orange',
];

function randomShape() {
  const keys = Object.keys(SHAPES) as (keyof typeof SHAPES)[];
  const rand = keys[Math.floor(Math.random() * keys.length)];
  return SHAPES[rand];
}

function rotate(matrix: number[][]): number[][] {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

interface Piece {
  shape: number[][];
  x: number;
  y: number;
}

function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

export const Tetris: React.FC = () => {
  const [board, setBoard] = useState<Board>(createBoard());
  const [current, setCurrent] = useState<Piece>({ shape: randomShape(), x: 3, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const intervalRef = useRef<NodeJS.Timer>();

  const merge = (b: Board, p: Piece): Board => {
    const newBoard = b.map(row => row.slice());
    p.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val && y + p.y >= 0) newBoard[y + p.y][x + p.x] = val;
      });
    });
    return newBoard;
  };

  const collision = (b: Board, p: Piece): boolean => {
    for (let y = 0; y < p.shape.length; y++) {
      for (let x = 0; x < p.shape[y].length; x++) {
        if (
          p.shape[y][x] &&
          (b[y + p.y] && b[y + p.y][x + p.x]) !== 0
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const clearLines = (b: Board): Board => {
    const newBoard = b.filter(row => !row.every(cell => cell !== 0));
    const cleared = ROWS - newBoard.length;
    if (cleared > 0) {
      setScore(prev => prev + cleared * 100);
    }
    for (let i = 0; i < cleared; i++) {
      newBoard.unshift(Array(COLS).fill(0));
    }
    return newBoard;
  };

  const moveDown = () => {
    const newPiece = { ...current, y: current.y + 1 };
    if (collision(board, newPiece)) {
      const merged = merge(board, current);
      const cleared = clearLines(merged);
      const next = { shape: randomShape(), x: 3, y: 0 };
      if (collision(cleared, next)) {
        setGameOver(true);
        clearInterval(intervalRef.current);
      } else {
        setBoard(cleared);
        setCurrent(next);
      }
    } else {
      setCurrent(newPiece);
    }
  };

  const move = (dir: number) => {
    const newPiece = { ...current, x: current.x + dir };
    if (!collision(board, newPiece)) {
      setCurrent(newPiece);
    }
  };

  const rotatePiece = () => {
    const newPiece = { ...current, shape: rotate(current.shape) };
    if (!collision(board, newPiece)) {
      setCurrent(newPiece);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowUp') rotatePiece();
      if (e.key === 'ArrowDown') moveDown();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, board, gameOver]);

  useEffect(() => {
    intervalRef.current = setInterval(moveDown, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  });

  const displayBoard = merge(board, current);

  return (
    <div className="tetris">
      {gameOver && <div className="game-over">Game Over</div>}
      <div className="score">Score: {score}</div>
      <div className="board">
        {displayBoard.map((row, y) => (
          <div key={y} className="row">
            {row.map((cell, x) => (
              <div
                key={x}
                className="cell"
                style={{ background: COLORS[cell] }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
