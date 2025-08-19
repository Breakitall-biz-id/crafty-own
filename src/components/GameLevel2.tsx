import React, { useState, useEffect, useRef } from "react";
import { useSound } from "../hooks/useSound";
import { Home, HelpCircle, Volume2, VolumeX, X } from "lucide-react";
import { Screen } from "../types/GameTypes";

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
  const [showInstructions, setShowInstructions] = useState(true);
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
    { id: "shadow1", type: "apple", x: 80, y: 80, isMatched: false },
    { id: "shadow2", type: "pineapple", x: 200, y: 80, isMatched: false },
    { id: "shadow3", type: "grapes", x: 80, y: 200, isMatched: false },
    { id: "shadow4", type: "watermelon", x: 200, y: 200, isMatched: false },
  ]);

  const [draggedFruit, setDraggedFruit] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const startGame = async () => {
    if (soundEnabled) {
      try {
        await unlock();
      } catch {
        /* ignore */
      }
      play("start");
      loop("bgm", { volume: 0.35 });
    }
    setShowInstructions(false);
    setGameStarted(true);
    setStartTime(Date.now());
  };

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

  // After the game is marked complete, show results after a short delay and play sound once
  useEffect(() => {
    if (!gameCompleted) return;
    if (soundEnabled) {
      play("complete");
      stop("bgm");
    }
    const t = setTimeout(() => setShowResults(true), 1000);
    return () => clearTimeout(t);
  }, [gameCompleted, soundEnabled, play, stop]);

  useEffect(() => {
    // Initialize fruit positions when game starts
    if (gameStarted && gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();

      // Responsive positioning
      const isMobile = window.innerWidth < 768;
      const isLandscape = window.innerWidth > window.innerHeight;

      let positions: { [key: string]: { x: number; y: number } };

      if (isMobile && !isLandscape) {
        // Mobile Portrait: Vertical layout (top panel)
        const topPanelX = rect.width / 2 - 140; // Center horizontally
        const topPanelY = 60; // Top position

        positions = {
          pineapple: { x: topPanelX + 60, y: topPanelY + 60 },
          watermelon: { x: topPanelX + 180, y: topPanelY + 60 },
          grapes: { x: topPanelX + 60, y: topPanelY + 180 },
          apple: { x: topPanelX + 180, y: topPanelY + 180 },
        };
      } else {
        // Desktop or Mobile Landscape: Horizontal layout (left panel)
        const panelWidth = isMobile ? 280 : 320;
        const panelHeight = isMobile ? 300 : 384;
        const leftPanelX = rect.width / 2 - 24 - panelWidth;
        const leftPanelY = rect.height / 2 - panelHeight / 2;

        positions = {
          pineapple: {
            x: leftPanelX + (isMobile ? 60 : 80),
            y: leftPanelY + (isMobile ? 60 : 80),
          },
          watermelon: {
            x: leftPanelX + (isMobile ? 180 : 200),
            y: leftPanelY + (isMobile ? 60 : 80),
          },
          grapes: {
            x: leftPanelX + (isMobile ? 60 : 80),
            y: leftPanelY + (isMobile ? 180 : 200),
          },
          apple: {
            x: leftPanelX + (isMobile ? 180 : 200),
            y: leftPanelY + (isMobile ? 180 : 200),
          },
        };
      }

      setFruits((prev) =>
        prev.map((f) => {
          return { ...f, ...positions[f.type] };
        })
      );
    }
  }, [gameStarted]);


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

    const isMobile = window.innerWidth < 768;
    const isLandscape = window.innerWidth > window.innerHeight;

    let droppedOnShadow = false;

    for (const shadow of shadows) {
      if (shadow.isMatched) continue;

      let shadowAbsoluteX: number, shadowAbsoluteY: number;

      if (isMobile && !isLandscape) {
        // Mobile Portrait: Bottom panel
        shadowAbsoluteX = gameAreaRect.width / 2 - 140 + shadow.x;
        shadowAbsoluteY = 320 + shadow.y;
      } else {
        // Desktop or Mobile Landscape: Right panel
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
          // Wrong match
          setMistakes((prev) => prev + 1);
          setShowWrongFeedback(draggedFruit);
          play("error");
          setTimeout(() => setShowWrongFeedback(null), 1000);

          let originalPositions: Record<string, { x: number; y: number }>;
          if (isMobile && !isLandscape) {
            // Mobile Portrait: Top panel
            const topPanelX = gameAreaRect.width / 2 - 140;
            const topPanelY = 60;
            originalPositions = {
              pineapple: { x: topPanelX + 60, y: topPanelY + 60 },
              watermelon: { x: topPanelX + 180, y: topPanelY + 60 },
              grapes: { x: topPanelX + 60, y: topPanelY + 180 },
              apple: { x: topPanelX + 180, y: topPanelY + 180 },
            };
          } else {
            // Desktop or Mobile Landscape: Left panel
            const panelWidth = isMobile ? 280 : 320;
            const panelHeight = isMobile ? 300 : 384;
            const leftPanelX = gameAreaRect.width / 2 - 24 - panelWidth;
            const leftPanelY = gameAreaRect.height / 2 - panelHeight / 2;
            originalPositions = {
              pineapple: {
                x: leftPanelX + (isMobile ? 60 : 80),
                y: leftPanelY + (isMobile ? 60 : 80),
              },
              watermelon: {
                x: leftPanelX + (isMobile ? 180 : 200),
                y: leftPanelY + (isMobile ? 60 : 80),
              },
              grapes: {
                x: leftPanelX + (isMobile ? 60 : 80),
                y: leftPanelY + (isMobile ? 180 : 200),
              },
              apple: {
                x: leftPanelX + (isMobile ? 180 : 200),
                y: leftPanelY + (isMobile ? 180 : 200),
              },
            };
          }
          setFruits((prev) =>
            prev.map((f) =>
              f.id === draggedFruit
                ? { ...f, isDragging: false, ...originalPositions[f.type] }
                : f
            )
          );
        }
        break;
      }
    }

    if (!droppedOnShadow) {
      // Return to original position if not dropped on any shadow
      let originalPositions: Record<string, { x: number; y: number }>;
      if (isMobile && !isLandscape) {
        const topPanelX = gameAreaRect.width / 2 - 140;
        const topPanelY = 60;
        originalPositions = {
          pineapple: { x: topPanelX + 60, y: topPanelY + 60 },
          watermelon: { x: topPanelX + 180, y: topPanelY + 60 },
          grapes: { x: topPanelX + 60, y: topPanelY + 180 },
          apple: { x: topPanelX + 180, y: topPanelY + 180 },
        };
      } else {
        const panelWidth = isMobile ? 280 : 320;
        const panelHeight = isMobile ? 300 : 384;
        const leftPanelX = gameAreaRect.width / 2 - 24 - panelWidth;
        const leftPanelY = gameAreaRect.height / 2 - panelHeight / 2;
        originalPositions = {
          pineapple: {
            x: leftPanelX + (isMobile ? 60 : 80),
            y: leftPanelY + (isMobile ? 60 : 80),
          },
          watermelon: {
            x: leftPanelX + (isMobile ? 180 : 200),
            y: leftPanelY + (isMobile ? 60 : 80),
          },
          grapes: {
            x: leftPanelX + (isMobile ? 60 : 80),
            y: leftPanelY + (isMobile ? 180 : 200),
          },
          apple: {
            x: leftPanelX + (isMobile ? 180 : 200),
            y: leftPanelY + (isMobile ? 180 : 200),
          },
        };
      }
      setFruits((prev) =>
        prev.map((f) =>
          f.id === draggedFruit
            ? { ...f, isDragging: false, ...originalPositions[f.type] }
            : f
        )
      );
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
          top: fruit.y,
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
              <X className="w-10 h-10 text-white" />
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

  if (showInstructions) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-300 via-green-200 to-green-300">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute w-8 h-12 rounded-full left-4 top-20 bg-amber-700"></div>
          <div className="absolute w-12 h-16 bg-green-600 rounded-full left-2 top-16"></div>
          <div className="absolute w-6 h-10 rounded-full right-8 top-24 bg-amber-600"></div>
          <div className="absolute w-10 bg-green-500 rounded-full right-6 top-20 h-14"></div>
        </div>

        {/* Top Navigation */}
        <div className="absolute z-20 flex items-center justify-between top-4 left-4 right-4">
          <button
            onClick={() => onNavigate("menu")}
            className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
          >
            <Home className="w-6 h-6 text-amber-800" />
          </button>
          <button
            onClick={onSoundToggle}
            className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6 text-amber-800" />
            ) : (
              <VolumeX className="w-6 h-6 text-amber-800" />
            )}
          </button>
        </div>

        {/* Instructions Modal */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-2xl p-8 mx-4 bg-orange-500 shadow-2xl rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="px-6 py-2 text-lg font-bold text-white bg-red-500 rounded-full">
                PETUNJUK
              </div>
              <button
                onClick={startGame}
                className="flex items-center justify-center w-10 h-10 bg-yellow-400 rounded-full hover:bg-yellow-500"
              >
                <span className="text-2xl font-bold text-amber-800">X</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 mb-6 bg-white rounded-2xl">
              {/* Visual example */}
              <div className="flex items-center justify-center mb-4">
                {/* Pineapple */}
                <div className="relative w-16 h-20 mr-4 bg-yellow-400 rounded-lg">
                  <div className="absolute transform -translate-x-1/2 -top-4 left-1/2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-6 bg-green-500 rounded-t-full transform ${
                            i === 0 ? "-rotate-12" : i === 4 ? "rotate-12" : ""
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  {/* Pineapple pattern */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-1 h-1 bg-yellow-600 rounded-full`}
                      style={{
                        left: `${20 + (i % 3) * 15}px`,
                        top: `${8 + Math.floor(i / 3) * 12}px`,
                      }}
                    ></div>
                  ))}
                </div>
                <div className="mx-4 text-4xl text-yellow-400">→</div>
                {/* Pineapple shadow */}
                <div className="relative w-16 h-20 bg-gray-800 rounded-lg">
                  <div className="absolute transform -translate-x-1/2 -top-4 left-1/2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-6 bg-gray-800 rounded-t-full transform ${
                            i === 0 ? "-rotate-12" : i === 4 ? "rotate-12" : ""
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 text-center bg-yellow-100 rounded-xl">
                <p className="text-lg font-bold text-amber-800">
                  LETAKKAN BUAH SESUAI DENGAN BAYANGANNYA
                </p>
              </div>
            </div>

            {/* Start Button */}
            <div className="mt-6 text-center">
              <button
                onClick={startGame}
                className="px-12 py-4 text-xl font-bold text-white transition-all duration-200 transform bg-orange-600 rounded-full shadow-lg hover:bg-orange-700 hover:scale-105"
              >
                MULAI BERMAIN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-300 via-green-200 to-green-300">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>

        {/* Results Modal */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md p-8 mx-4 bg-white border-4 border-orange-500 shadow-2xl rounded-3xl">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="px-6 py-3 mb-4 text-xl font-bold text-white bg-teal-500 rounded-full">
                LEVEL 2 COMPLETE
              </div>
            </div>

            {/* Stars */}
            <div className="flex justify-center mb-6">
              {[1, 2, 3].map((star) => (
                <div
                  key={star}
                  className={`w-16 h-16 mx-2 ${
                    star <= stars ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-full h-full"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              ))}
            </div>

            {/* Message */}
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-3xl font-bold text-orange-600">
                GOOD JOB
              </h2>
              <p className="text-lg text-gray-600">
                Waktu: {Math.round(timeElapsed / 1000)} detik
              </p>
              <p className="text-lg text-gray-600">Kesalahan: {mistakes}</p>
            </div>

            {/* Next Button */}
            <div className="text-center">
              <button
                onClick={handleNextLevel}
                className="px-12 py-4 text-xl font-bold text-white transition-all duration-200 transform bg-teal-500 rounded-full shadow-lg hover:bg-teal-600 hover:scale-105"
              >
                NEXT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-300 via-green-200 to-green-300">
      {/* Top Navigation */}
      <div className="absolute z-20 flex items-center justify-between top-4 left-4 right-4">
        <button
          onClick={() => onNavigate("menu")}
          className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
        >
          <Home className="w-6 h-6 text-amber-800" />
        </button>

        <div className="px-6 py-2 text-lg font-bold bg-yellow-400 rounded-full shadow-lg text-amber-800">
          COCOKKAN BUAH DENGAN BAYANGANNYA!
        </div>

        <button
          onClick={() => setShowInstructions(true)}
          className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
        >
          <HelpCircle className="w-6 h-6 text-amber-800" />
        </button>
      </div>

      {/* Game Stats */}
      <div className="absolute z-20 p-1 text-xs transform -translate-x-1/2 bg-white rounded-lg shadow-lg top-12 md:top-20 left-1/2 bg-opacity-90 md:p-3 md:text-sm">
        <div className="text-xs font-bold text-center text-gray-700 md:text-sm">
          <div>Waktu: {Math.round((Date.now() - startTime) / 1000)}s</div>
          <div>Kesalahan: {mistakes}</div>
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="absolute inset-0 overflow-visible top-20 md:top-32"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ userSelect: "none", position: "relative" }}
      >
        {/* Fruits - Rendered at top level to prevent clipping */}
        {fruits.map(renderFruit)}

        {/* Game Panels Container - Responsive Layout */}
        <div className="relative flex flex-col items-center justify-center w-full h-full gap-4 px-4 pointer-events-none portrait:flex-col landscape:flex-row md:gap-8 md:px-8">
          {/* Top/Left Panel - Fruits */}
          <div className="relative p-3 bg-yellow-100 shadow-lg w-70 md:w-80 h-60 portrait:h-60 landscape:h-75 md:landscape:h-96 rounded-3xl md:p-4">
            {/* This panel is just for visual background */}
          </div>

          {/* Bottom/Right Panel - Shadows */}
          <div className="relative p-3 bg-yellow-100 shadow-lg w-70 md:w-80 h-60 portrait:h-60 landscape:h-75 md:landscape:h-96 rounded-3xl md:p-4">
            {shadows.map(renderShadow)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLevel2;
