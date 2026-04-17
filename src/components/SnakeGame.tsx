import { useCallback, useEffect, useRef, useState } from 'react';
import { GameState, Point } from '../types';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

export default function SnakeGame({ onScoreChange, gameState, setGameState }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(150);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (GRID_SIZE)),
        y: Math.floor(Math.random() * (GRID_SIZE)),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    onScoreChange(0);
    setSpeed(150);
    setGameState(GameState.PLAYING);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameState]);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
        };

        // Check collision with self
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameState(GameState.GAME_OVER);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          onScoreChange(newScore);
          setFood(generateFood(newSnake));
          setSpeed(prev => Math.max(50, prev - 2));
          return newSnake;
        } else {
          newSnake.pop();
          return newSnake;
        }
      });
    };

    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [direction, food, gameState, score, speed, onScoreChange, generateFood, setGameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = '#39ff14';
      ctx.shadowBlur = index === 0 ? 15 : 5;
      ctx.shadowColor = '#39ff14';
      ctx.beginPath();
      ctx.roundRect(segment.x * cellSize + 2, segment.y * cellSize + 2, cellSize - 4, cellSize - 4, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw food
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [snake, food]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_#1a1e26_0%,_#050608_100%)]">
      <div className="absolute top-10 right-10 text-right">
        <div className="text-[10px] uppercase tracking-[3px] text-color-text-dim">Current Score</div>
        <div className="text-[48px] font-thin font-mono leading-none">{score.toLocaleString('en-US', { minimumIntegerDigits: 5 })}</div>
      </div>
      
      <div className="relative bg-black border-[4px] border-card-bg shadow-[0_0_50px_rgba(0,0,0,0.5),0_0_2px_#00ffff]">
        <canvas
          ref={canvasRef}
          width={440}
          height={440}
          className="max-w-full aspect-square"
        />
        
        {gameState !== GameState.PLAYING && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            {gameState === GameState.IDLE && (
              <button
                onClick={() => setGameState(GameState.PLAYING)}
                className="px-8 py-3 bg-neon-cyan/20 border-2 border-neon-cyan text-neon-cyan font-bold tracking-widest hover:bg-neon-cyan/40 transition-all rounded uppercase"
              >
                START INTERFACE
              </button>
            )}
            
            {gameState === GameState.GAME_OVER && (
              <div className="text-center">
                <h2 className="text-4xl font-bold neon-text-pink mb-4 italic">CRITICAL_FAILURE</h2>
                <p className="text-xl font-mono text-neon-cyan mb-6">FINAL_SCORE: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-neon-pink/20 border-2 border-neon-pink text-neon-pink font-bold tracking-widest hover:bg-neon-pink/40 transition-all rounded"
                >
                  REBOOT SYSTEM
                </button>
              </div>
            )}
            
            {gameState === GameState.PAUSED && (
              <button
                onClick={() => setGameState(GameState.PLAYING)}
                className="px-8 py-3 bg-neon-cyan/20 border-2 border-neon-cyan text-neon-cyan font-bold tracking-widest hover:bg-neon-cyan/40 transition-all rounded"
              >
                RE-SYNC_SIGNAL
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-[30px] text-[11px] text-color-text-dim uppercase tracking-[2px]">
        Use ARROWS to navigate • System Active
      </div>
    </div>
  );
}
