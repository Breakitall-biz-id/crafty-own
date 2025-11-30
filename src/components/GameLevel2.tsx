import React, { useState, useEffect, useRef } from "react";
import { useSound } from "../hooks/useSound";
import { Screen } from "../types/GameTypes";
import InstructionModal from "./InstructionModal";
import BaseGameLayout from "./BaseGameLayout";
import GameResultModal from "./GameResultModal";

interface GameLevel2Props {
  onNavigate: (screen: Screen) => void;
  onLevelComplete: (
    stars: number,
    timeElapsed: number,
    mistakes: number
  ) => void;
  onNextLevel: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  playerName: string;
}

interface Fruit {
  id: string;
  type: "pineapple" | "watermelon" | "grapes" | "apple";
  x: number;
  y: number;
  isDragging: boolean;
  isMatched: boolean;
}

interface Shadow {
  id: string;
  type: "pineapple" | "watermelon" | "grapes" | "apple";
  x: number;
  y: number;
  isMatched: boolean;
}

const GameLevel2: React.FC<GameLevel2Props> = ({
  onNavigate,
  onLevelComplete,
  onNextLevel,
  soundEnabled,
  onSoundToggle,
  // playerName,
}) => {
  const { play, loop, stop, unlock } = useSound(soundEnabled);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [mistakes, setMistakes] = useState(0);
  const [stars, setStars] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showWrongFeedback, setShowWrongFeedback] = useState<string | null>(
    null
  );

  const [fruits, setFruits] = useState<Fruit[]>([
    {
      id: "1",
      type: "pineapple",
      x: 80,
      y: 80,
      isDragging: false,
      isMatched: false,
    },
    {
      id: "2",
      type: "watermelon",
      x: 200,
      y: 80,
      isDragging: false,
      isMatched: false,
    },
    {
      id: "3",
      type: "grapes",
      x: 80,
      y: 200,
      isDragging: false,
      isMatched: false,
    },
    {
      id: "4",
      type: "apple",
      x: 200,
      y: 200,
      isDragging: false,
      isMatched: false,
    },
  ]);

  const [shadows] = useState<Shadow[]>([
    { id: "shadow1", type: "apple", x: 40, y: 30, isMatched: false },
    {
      id: "shadow2",
      type: "pineapple",
      x: 200 - 40,
      y: 80 - 50,
      isMatched: false,
    },
    {
      id: "shadow3",
      type: "grapes",
      x: 80 - 40,
      y: 200 - 50,
      isMatched: false,
    },
    {
      id: "shadow4",
      type: "watermelon",
      x: 200 - 40,
      y: 200 - 50,
      isMatched: false,
    },
  ]);

  const [draggedFruit, setDraggedFruit] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Auto start game when component mounts
  useEffect(() => {
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check completion whenever fruits/mistakes/time state changes
  useEffect(() => {
    const allMatched = fruits.every((f) => f.isMatched);
    if (allMatched && !gameCompleted) {
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      // Star calculation (inline to avoid extra hook deps)
      const calculatedStars = (() => {
        if (mistakes === 0 && elapsed <= 15000) return 3; // perfect, ≤15s
        if (mistakes <= 1 && elapsed <= 25000) return 2; // ≤1 mistake, ≤25s
        return 1; // otherwise
      })();

      setTimeElapsed(elapsed);
      setStars(calculatedStars);
      setGameCompleted(true);
    }
  }, [fruits, gameCompleted, startTime, mistakes]);

  // Place fruits inside the left panel neatly once the card/panels are laid out
  useEffect(() => {
    if (!gameStarted) return;
    const place = () => {
      const gameRect = gameAreaRef.current?.getBoundingClientRect();
      const leftRect = leftPanelRef.current?.getBoundingClientRect();
      if (!gameRect || !leftRect) return;

      const cols = [
        leftRect.left + leftRect.width * 0.35,
        leftRect.left + leftRect.width * 0.65,
      ];
      const rows = [
        leftRect.top + leftRect.height * 0.35,
        leftRect.top + leftRect.height * 0.65,
      ];
      const half = 40; // fruit size ~80px (w-20 h-20)

      const positions: Record<string, { x: number; y: number }> = {
        pineapple: {
          x: cols[0] - gameRect.left - half,
          y: rows[0] - gameRect.top - half,
        },
        watermelon: {
          x: cols[1] - gameRect.left - half,
          y: rows[0] - gameRect.top - half,
        },
        grapes: {
          x: cols[0] - gameRect.left - half,
          y: rows[1] - gameRect.top - half,
        },
        apple: {
          x: cols[1] - gameRect.left - half,
          y: rows[1] - gameRect.top - half,
        },
      };

      setFruits((prev) => prev.map((f) => ({ ...f, ...positions[f.type] })));
    };

    const id = requestAnimationFrame(place);
    const onResize = () => place();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [gameStarted]);

  // After the game is marked complete, show results after a short delay and play sound once
  useEffect(() => {
    if (!gameCompleted) return;
    if (soundEnabled) {
      play("complete");
      // Don't stop BGM - let it continue to next level
    }
    const t = setTimeout(() => setShowResults(true), 1000);
    return () => clearTimeout(t);
  }, [gameCompleted, soundEnabled, play, stop]);

  // Removed old positioner; now positions are based on panel refs above

  const handleMouseDown = (e: React.MouseEvent, fruitId: string) => {
    if (!gameStarted || gameCompleted) return;

    const fruit = fruits.find((f) => f.id === fruitId);
    if (!fruit || fruit.isMatched) return;

    e.preventDefault();

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    const offsetX = clientX - rect.left - fruit.x;
    const offsetY = clientY - rect.top - fruit.y;

    setDraggedFruit(fruitId);
    setDragOffset({ x: offsetX, y: offsetY });

    setFruits((prev) =>
      prev.map((f) => (f.id === fruitId ? { ...f, isDragging: true } : f))
    );
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedFruit || !gameStarted) return;

    e.preventDefault();

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    const newX = clientX - rect.left - dragOffset.x;
    const newY = clientY - rect.top - dragOffset.y;

    setFruits((prev) =>
      prev.map((f) => (f.id === draggedFruit ? { ...f, x: newX, y: newY } : f))
    );
  };

  const handleMouseUp = () => {
    if (!draggedFruit || !gameStarted) return;

    const draggedFruitObj = fruits.find((f) => f.id === draggedFruit);
    if (!draggedFruitObj) return;

    const gameAreaRect = gameAreaRef.current?.getBoundingClientRect();
    if (!gameAreaRect) return;

    const rightRect = rightPanelRef.current?.getBoundingClientRect();

    let droppedOnShadow = false;

    for (const shadow of shadows) {
      if (shadow.isMatched) continue;

      let shadowAbsoluteX: number, shadowAbsoluteY: number;
      if (rightRect) {
        // Convert right panel local coords to game-area coords
        shadowAbsoluteX = rightRect.left - gameAreaRect.left + shadow.x;
        shadowAbsoluteY = rightRect.top - gameAreaRect.top + shadow.y;
      } else {
        // Fallback: assume centered panels similar to previous layout
        shadowAbsoluteX = gameAreaRect.width / 2 + 24 + shadow.x;
        shadowAbsoluteY = gameAreaRect.height / 2 - 192 + shadow.y;
      }

      const distance = Math.hypot(
        draggedFruitObj.x - shadowAbsoluteX,
        draggedFruitObj.y - shadowAbsoluteY
      );

      if (distance < 100) {
        droppedOnShadow = true;

        if (draggedFruitObj.type === shadow.type) {
          // Correct match
          setFruits((prev) =>
            prev.map((f) =>
              f.id === draggedFruit
                ? {
                    ...f,
                    isDragging: false,
                    isMatched: true,
                    x: shadowAbsoluteX,
                    y: shadowAbsoluteY,
                  }
                : f
            )
          );
          play("match");
        } else {
          setMistakes((prev) => prev + 1);
          setShowWrongFeedback(draggedFruit);
          play("error");
          setTimeout(() => setShowWrongFeedback(null), 1000);

          // Wrong: return to left panel positions via leftPanelRef
          const leftRect = leftPanelRef.current?.getBoundingClientRect();
          if (leftRect) {
            const cols = [
              leftRect.left + leftRect.width * 0.35,
              leftRect.left + leftRect.width * 0.65,
            ];
            const rows = [
              leftRect.top + leftRect.height * 0.35,
              leftRect.top + leftRect.height * 0.65,
            ];
            const half = 40;
            const originalPositions: Record<string, { x: number; y: number }> =
              {
                pineapple: {
                  x: cols[0] - gameAreaRect.left - half,
                  y: rows[0] - gameAreaRect.top - half,
                },
                watermelon: {
                  x: cols[1] - gameAreaRect.left - half,
                  y: rows[0] - gameAreaRect.top - half,
                },
                grapes: {
                  x: cols[0] - gameAreaRect.left - half,
                  y: rows[1] - gameAreaRect.top - half,
                },
                apple: {
                  x: cols[1] - gameAreaRect.left - half,
                  y: rows[1] - gameAreaRect.top - half,
                },
              };
            setFruits((prev) =>
              prev.map((f) =>
                f.id === draggedFruit
                  ? { ...f, isDragging: false, ...originalPositions[f.type] }
                  : f
              )
            );
          }
        }
        break;
      }
    }

    if (!droppedOnShadow) {
      // Snap back to left panel grid placement
      const leftRect = leftPanelRef.current?.getBoundingClientRect();
      if (leftRect) {
        const cols = [
          leftRect.left + leftRect.width * 0.35,
          leftRect.left + leftRect.width * 0.65,
        ];
        const rows = [
          leftRect.top + leftRect.height * 0.35,
          leftRect.top + leftRect.height * 0.65,
        ];
        const half = 40;
        const originalPositions: Record<string, { x: number; y: number }> = {
          pineapple: {
            x: cols[0] - gameAreaRect.left - half,
            y: rows[0] - gameAreaRect.top - half,
          },
          watermelon: {
            x: cols[1] - gameAreaRect.left - half,
            y: rows[0] - gameAreaRect.top - half,
          },
          grapes: {
            x: cols[0] - gameAreaRect.left - half,
            y: rows[1] - gameAreaRect.top - half,
          },
          apple: {
            x: cols[1] - gameAreaRect.left - half,
            y: rows[1] - gameAreaRect.top - half,
          },
        };
        setFruits((prev) =>
          prev.map((f) =>
            f.id === draggedFruit
              ? { ...f, isDragging: false, ...originalPositions[f.type] }
              : f
          )
        );
      }
    }

    setDraggedFruit(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, fruitId: string) => {
    if (!gameStarted || gameCompleted) return;

    const fruit = fruits.find((f) => f.id === fruitId);
    if (!fruit || fruit.isMatched) return;

    e.preventDefault();

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    const offsetX = touch.clientX - rect.left - fruit.x;
    const offsetY = touch.clientY - rect.top - fruit.y;

    setDraggedFruit(fruitId);
    setDragOffset({ x: offsetX, y: offsetY });

    setFruits((prev) =>
      prev.map((f) => (f.id === fruitId ? { ...f, isDragging: true } : f))
    );
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedFruit || !gameStarted) return;

    e.preventDefault();

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    const newX = touch.clientX - rect.left - dragOffset.x;
    const newY = touch.clientY - rect.top - dragOffset.y;

    setFruits((prev) =>
      prev.map((f) => (f.id === draggedFruit ? { ...f, x: newX, y: newY } : f))
    );
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const handleNextLevel = () => {
    onLevelComplete(stars, timeElapsed, mistakes);
    onNextLevel();
  };

  const renderFruit = (fruit: Fruit) => {
    const imgSrc: Record<Fruit["type"], string> = {
      pineapple: "/images/fruits/pineapple.png",
      watermelon: "/images/fruits/watermelon.png",
      grapes: "/images/fruits/grapes.png",
      apple: "/images/fruits/apple.png",
    };
    return (
      <div
        key={fruit.id}
        className={`absolute w-20 h-20 cursor-pointer transform transition-transform ${
          fruit.isDragging ? "scale-110 z-20" : "hover:scale-105 z-10"
        } ${fruit.isMatched ? "cursor-default opacity-80" : ""}`}
        style={{
          left: fruit.x,
          top: fruit.y + 5,
          pointerEvents: fruit.isMatched ? "none" : "auto",
          userSelect: "none",
          touchAction: "none",
        }}
        onMouseDown={(e) => handleMouseDown(e, fruit.id)}
        onTouchStart={(e) => handleTouchStart(e, fruit.id)}
      >
        <img
          src={imgSrc[fruit.type]}
          alt={fruit.type}
          className="object-contain w-full h-full pointer-events-none select-none"
          draggable={false}
        />
        {showWrongFeedback === fruit.id && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="z-30 flex items-center justify-center w-20 h-20 bg-red-500 rounded-full animate-pulse">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderShadow = (shadow: Shadow) => {
    const imgSrc: Record<Shadow["type"], string> = {
      pineapple: "/images/shadows/pineapple-shadow.png",
      watermelon: "/images/shadows/watermelon-shadow.png",
      grapes: "/images/shadows/grapes-shadow.png",
      apple: "/images/shadows/apple-shadow.png",
    } as const;
    // Fallback: if some shadow image is missing, keep a neutral circle
    const src = imgSrc[shadow.type];
    return (
      <div
        key={shadow.id}
        className="absolute w-20 h-20 pointer-events-none"
        style={{ left: shadow.x, top: shadow.y }}
      >
        <img
          src={src}
          alt={`${shadow.type}-shadow`}
          className="object-contain w-full h-full select-none opacity-80"
          draggable={false}
        />
      </div>
    );
  };

  return (
    <>
      <BaseGameLayout
        onNavigate={onNavigate}
        onShowInstructions={() => setShowInstructions(true)}
        title="Level 2: Cocokan buah dengan bayangannya!"
        gameAreaRef={gameAreaRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Fruits - keep at top level to avoid clipping */}
        {fruits.map(renderFruit)}

        {/* Two yellow panels */}
        <div className="absolute inset-0 flex items-center justify-center gap-6 pt-16 md:gap-10 md:pt-20">
          {/* Left (fruits) */}
          <div
            ref={leftPanelRef}
            className="relative h-64 p-2 bg-yellow-100 shadow-lg rounded-3xl w-72 md:w-72 md:h-64"
          ></div>
          {/* Right (shadows) */}
          <div
            ref={rightPanelRef}
            className="relative h-64 p-2 bg-yellow-100 shadow-lg rounded-3xl w-72 md:w-72 md:h-64"
          >
            {shadows.map(renderShadow)}
          </div>
        </div>
      </BaseGameLayout>

      {/* Instruction Modal - Overlay */}
      <InstructionModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Petunjuk:"
        imageSrc="/images/petunjuk/level2.png"
        description="Letakkan buah sesuai dengan bayangannya."
      />

      {showResults && (
        <>
          <GameResultModal
            isOpen={showResults}
            level={2}
            stars={stars}
            timeElapsed={timeElapsed}
            mistakes={mistakes}
            onNextLevel={handleNextLevel}
          />
        </>
      )}
    </>
  );
};

export default GameLevel2;
