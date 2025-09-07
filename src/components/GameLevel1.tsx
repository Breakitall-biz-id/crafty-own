import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSound } from "../hooks/useSound";
import { Home, HelpCircle, Volume2, VolumeX } from "lucide-react";
import { Screen } from "../types/GameTypes";

interface GameLevel1Props {
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
  type: "apple" | "pear" | "pineapple";
  color: "red" | "yellow" | "green";
  x: number;
  y: number;
  isDragging: boolean;
  isPlaced: boolean;
}

interface Basket {
  id: string;
  color: "red" | "yellow" | "green";
  x: number;
  y: number;
  fruits: string[];
}

const GameLevel1: React.FC<GameLevel1Props> = ({
  onNavigate,
  onLevelComplete,
  onNextLevel,
  soundEnabled,
  onSoundToggle,
  // playerName,
}) => {
  const { play, stop, unlock } = useSound(soundEnabled);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [mistakes, setMistakes] = useState(0);
  const [stars, setStars] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [baskets] = useState<Basket[]>([
    { id: "red", color: "red", x: 0, y: 0, fruits: [] },
    { id: "yellow", color: "yellow", x: 0, y: 0, fruits: [] },
    { id: "green", color: "green", x: 0, y: 0, fruits: [] },
  ]);

  const [draggedFruit, setDraggedFruit] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Initialize responsive positions
  const initializePositions = useCallback(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const rect = gameArea.getBoundingClientRect();
    const isPortrait = window.innerHeight > window.innerWidth;
    const isMobile = window.innerWidth < 768;

    let fruitPositions: { x: number; y: number }[];
    let basketPositions: { x: number; y: number }[];

    if (isMobile && isPortrait) {
      // Mobile Portrait: Stack vertically
      const centerX = rect.width / 2;
      const topY = Math.max(100, rect.height * 0.15);
      const bottomY = Math.max(rect.height * 0.65, rect.height - 120);

      fruitPositions = [
        { x: centerX - 80, y: topY },
        { x: centerX, y: topY },
        { x: centerX + 80, y: topY },
      ];

      basketPositions = [
        { x: centerX - 80, y: bottomY },
        { x: centerX, y: bottomY },
        { x: centerX + 80, y: bottomY },
      ];
    } else if (isMobile && !isPortrait) {
      // Mobile Landscape: Optimized for limited height
      const availableWidth = rect.width - 100; // Leave margins
      const spacing = Math.min(100, availableWidth / 3);
      const startX = Math.max(50, (rect.width - spacing * 2) / 2);
      const topY = Math.max(40, rect.height * 0.15); // Much higher position
      const bottomY = Math.max(rect.height * 0.6, rect.height - 80); // Not too low

      fruitPositions = [
        { x: startX, y: topY },
        { x: startX + spacing, y: topY },
        { x: startX + spacing * 2, y: topY },
      ];

      basketPositions = [
        { x: startX, y: bottomY },
        { x: startX + spacing, y: bottomY },
        { x: startX + spacing * 2, y: bottomY },
      ];
    } else {
      // Desktop: Original layout with responsive spacing
      const spacing = Math.min(150, rect.width / 5);
      const startX = Math.max(150, (rect.width - spacing * 2) / 2);
      const fruitY = Math.max(120, rect.height * 0.25);
      const basketY = Math.max(rect.height * 0.65, rect.height - 150);

      fruitPositions = [
        { x: startX, y: fruitY },
        { x: startX + spacing, y: fruitY },
        { x: startX + spacing * 2, y: fruitY },
      ];

      basketPositions = [
        { x: startX, y: basketY },
        { x: startX + spacing, y: basketY },
        { x: startX + spacing * 2, y: basketY },
      ];
    }

    // Initialize fruits with responsive positions
    setFruits([
      {
        id: "1",
        type: "apple",
        color: "red",
        x: fruitPositions[0].x,
        y: fruitPositions[0].y,
        isDragging: false,
        isPlaced: false,
      },
      {
        id: "2",
        type: "pear",
        color: "green",
        x: fruitPositions[1].x,
        y: fruitPositions[1].y,
        isDragging: false,
        isPlaced: false,
      },
      {
        id: "3",
        type: "pineapple",
        color: "yellow",
        x: fruitPositions[2].x,
        y: fruitPositions[2].y,
        isDragging: false,
        isPlaced: false,
      },
    ]);

    // Update basket positions (baskets are created with initial positions, we need to update them)
    baskets[0].x = basketPositions[0].x;
    baskets[0].y = basketPositions[0].y;
    baskets[1].x = basketPositions[1].x;
    baskets[1].y = basketPositions[1].y;
    baskets[2].x = basketPositions[2].x;
    baskets[2].y = basketPositions[2].y;
  }, [baskets]);

  // Run initialize when game area mounts (after closing instructions) and on viewport/orientation changes
  useEffect(() => {
    // When the actual game area is mounted (showInstructions=false), schedule init for next frame
    if (gameAreaRef.current) {
      requestAnimationFrame(() => initializePositions());
      // Fallback microtask to ensure layout ready
      setTimeout(initializePositions, 0);
    }

    const handleResize = () => initializePositions();
    const handleOrientation = () => initializePositions();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientation);

    // Observe container size changes (safer across mobile UI chrome changes)
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && gameAreaRef.current) {
      ro = new ResizeObserver(() => initializePositions());
      ro.observe(gameAreaRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientation);
      if (ro) ro.disconnect();
    };
  }, [initializePositions, showInstructions]);

  const getOriginalFruitPosition = (
    fruitType: "apple" | "pear" | "pineapple"
  ) => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return { x: 200, y: 150 };

    const rect = gameArea.getBoundingClientRect();
    const isPortrait = window.innerHeight > window.innerWidth;
    const isMobile = window.innerWidth < 768;

    let fruitPositions: { x: number; y: number }[];

    if (isMobile && isPortrait) {
      const centerX = rect.width / 2;
      const topY = Math.max(100, rect.height * 0.15);
      fruitPositions = [
        { x: centerX - 80, y: topY },
        { x: centerX, y: topY },
        { x: centerX + 80, y: topY },
      ];
    } else if (isMobile && !isPortrait) {
      const availableWidth = rect.width - 100;
      const spacing = Math.min(100, availableWidth / 3);
      const startX = Math.max(50, (rect.width - spacing * 2) / 2);
      const topY = Math.max(40, rect.height * 0.15);
      fruitPositions = [
        { x: startX, y: topY },
        { x: startX + spacing, y: topY },
        { x: startX + spacing * 2, y: topY },
      ];
    } else {
      const spacing = Math.min(150, rect.width / 5);
      const startX = Math.max(150, (rect.width - spacing * 2) / 2);
      const fruitY = Math.max(120, rect.height * 0.25);
      fruitPositions = [
        { x: startX, y: fruitY },
        { x: startX + spacing, y: fruitY },
        { x: startX + spacing * 2, y: fruitY },
      ];
    }

    const index = fruitType === "apple" ? 0 : fruitType === "pear" ? 1 : 2;
    return fruitPositions[index];
  };

  const startGame = async () => {
    // Play audio first within the click gesture and unlock on iOS
    if (soundEnabled) {
      console.log("Starting game with sound enabled");
      try {
        await unlock();
      } catch {
        /* ignore */
      }
      play("start");
      play("bgm");
    }

    setShowInstructions(false);
    setGameStarted(true);
    setGameCompleted(false);
    setShowResults(false);
    setMistakes(0);
    setStars(0);
    setTimeElapsed(0);
    setStartTime(Date.now());

    // Reset all fruits to not placed
    setFruits((prev) =>
      prev.map((fruit) => ({
        ...fruit,
        isPlaced: false,
        isDragging: false,
      }))
    );

    // Ensure positions computed right after starting
    requestAnimationFrame(() => initializePositions());
  };

  const calculateStars = (time: number, mistakeCount: number): number => {
    if (mistakeCount === 0 && time <= 10000) return 3; // 3 stars: perfect, ≤10 seconds
    if (mistakeCount <= 1 && time <= 20000) return 2; // 2 stars: ≤1 mistake, ≤20 seconds
    return 1; // 1 star: more than 1 mistake or >20 seconds
  };

  const checkGameCompletion = useCallback(() => {
    // Only check if game is started and fruits array is not empty
    if (!gameStarted || fruits.length === 0) return;

    const allPlaced = fruits.every((fruit) => fruit.isPlaced);
    if (allPlaced && !gameCompleted) {
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      const calculatedStars = calculateStars(elapsed, mistakes);

      setTimeElapsed(elapsed);
      setStars(calculatedStars);
      setGameCompleted(true);
      setShowResults(true);
      if (soundEnabled) {
        play("complete");
        stop("bgm");
      }
    }
  }, [
    fruits,
    gameCompleted,
    startTime,
    mistakes,
    gameStarted,
    soundEnabled,
    play,
    stop,
  ]);

  useEffect(() => {
    checkGameCompletion();
  }, [checkGameCompletion]);

  const handleMouseDown = (e: React.MouseEvent, fruitId: string) => {
    if (!gameStarted || gameCompleted) return;

    const fruit = fruits.find((f) => f.id === fruitId);
    if (!fruit || fruit.isPlaced) return;

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

  const getDropRadius = () => {
    const isMobile = window.innerWidth < 768;
    const isPortrait = window.innerHeight > window.innerWidth;
    if (!isMobile) return 80; // desktop default
    // Slightly smaller radius in tight landscape; a bit larger in portrait
    return isPortrait ? 80 : 70;
  };

  const handleMouseUp = () => {
    if (!draggedFruit || !gameStarted) return;

    const draggedFruitObj = fruits.find((f) => f.id === draggedFruit);
    if (!draggedFruitObj) return;

    // Check if fruit is dropped on correct basket
    let correctBasket = false;
    const radius = getDropRadius();
    for (const basket of baskets) {
      const distance = Math.sqrt(
        Math.pow(draggedFruitObj.x - basket.x, 2) +
        Math.pow(draggedFruitObj.y - basket.y, 2)
      );

      if (distance < radius) {
        // Within basket range
        if (draggedFruitObj.color === basket.color) {
          // Correct placement
          setFruits((prev) =>
            prev.map((f) =>
              f.id === draggedFruit
                ? {
                  ...f,
                  isDragging: false,
                  isPlaced: true,
                  x: basket.x,
                  y: basket.y,
                }
                : f
            )
          );
          correctBasket = true;
          if (soundEnabled) {
            play("match");
          }
        } else {
          // Wrong placement
          setMistakes((prev) => prev + 1);
          if (soundEnabled) {
            play("error");
          }
          // Return fruit to original position
          const originalPos = getOriginalFruitPosition(draggedFruitObj.type);
          setFruits((prev) =>
            prev.map((f) =>
              f.id === draggedFruit
                ? {
                  ...f,
                  isDragging: false,
                  x: originalPos.x,
                  y: originalPos.y,
                }
                : f
            )
          );
        }
        break;
      }
    }

    if (!correctBasket) {
      // Return to original position if not dropped on any basket
      const originalPos = getOriginalFruitPosition(draggedFruitObj.type);
      setFruits((prev) =>
        prev.map((f) =>
          f.id === draggedFruit
            ? {
              ...f,
              isDragging: false,
              x: originalPos.x,
              y: originalPos.y,
            }
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
    if (!fruit || fruit.isPlaced) return;

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
      apple: "/images/fruits/apple.png",
      pear: "/images/fruits/pear.png",
      pineapple: "/images/fruits/pineapple.png",
    };

    return (
      <div
        key={fruit.id}
        className={`absolute w-16 h-16 cursor-pointer transform transition-transform ${fruit.isDragging ? "scale-110 z-20" : "hover:scale-105 z-10"
          } ${fruit.isPlaced ? "cursor-default" : ""}`}
        style={{
          left: fruit.x,
          top: fruit.y,
          pointerEvents: fruit.isPlaced ? "none" : "auto",
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
      </div>
    );
  };

  const renderBasket = (basket: Basket) => {
    const basketImg: Record<Basket["color"], string> = {
      red: "/images/basket/red.png",
      yellow: "/images/basket/yellow.png",
      green: "/images/basket/green.png",
    };

    return (
      <div
        key={basket.id}
        className="absolute w-20 h-16"
        style={{ left: basket.x - 10, top: basket.y }}
      >
        <img
          src={basketImg[basket.color]}
          alt={`basket-${basket.color}`}
          className="object-contain w-full h-full pointer-events-none select-none"
          draggable={false}
        />
      </div>
    );
  };

  if (showInstructions) {
    return (
      <div
        className="relative min-h-screen overflow-hidden bg-center bg-cover"
        style={{ backgroundImage: "url(/images/bg-level.png)" }}
      >
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
                <div className="relative w-12 h-12 mr-4 bg-yellow-400 rounded-lg">
                  <div className="absolute transform -translate-x-1/2 -top-2 left-1/2">
                    <div className="flex">
                      <div className="w-1 h-3 transform bg-green-500 rounded-t-full -rotate-12"></div>
                      <div className="w-1 h-3 bg-green-500 rounded-t-full"></div>
                      <div className="w-1 h-3 transform bg-green-500 rounded-t-full rotate-12"></div>
                    </div>
                  </div>
                </div>
                <div className="mx-4 text-4xl">→</div>
                <div className="relative w-16 h-12 bg-red-100 border-4 border-red-500 rounded-b-full">
                  <div className="absolute w-12 h-2 transform -translate-x-1/2 bg-red-500 rounded-full -top-1 left-1/2"></div>
                </div>
              </div>

              <div className="p-4 text-center bg-yellow-100 rounded-xl">
                <p className="text-lg font-bold text-amber-800">
                  LETAKKAN BUAH DI KERANJANG SESUAI DENGAN WARNANYA
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
      <div
        className="relative min-h-screen overflow-hidden bg-center bg-cover"
        style={{ backgroundImage: "url(/images/menu-page.png)" }}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Results Modal */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="relative w-full max-w-sm mx-4">
            {/* Main Card - White background with orange border */}
            <div className="relative bg-white rounded-3xl shadow-2xl border-8 border-[#c63c03] p-8 pt-12">

              {/* Teal Header Badge - Banner Style */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 w-80">
                <div className="relative bg-[#008c9b] text-white rounded-3xl shadow-lg overflow-hidden">
                  {/* Main banner content */}
                  <div className="px-8 py-4 text-center">
                    <div className="text-lg font-bold mb-1">LEVEL 1</div>
                    <div className="text-3xl font-black tracking-wide">COMPLETE</div>
                  </div>

                  {/* Curved sides */}
                  <div className="absolute left-0 top-0 w-6 h-full">
                    <div className="w-full h-full bg-[#008c9b] rounded-l-3xl"></div>
                    <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-[#008c9b] rounded-full"></div>
                  </div>

                  <div className="absolute right-0 top-0 w-6 h-full">
                    <div className="w-full h-full bg-[#008c9b] rounded-r-3xl"></div>
                    <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-[#008c9b] rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Stars Display */}
              <div className="flex justify-center items-center mb-6 h-28 w-full">
                <div className="relative flex justify-center items-center w-60 h-24">
                  {[1, 2, 3].map((star, index) => {
                    // Create a more natural rainbow arc with centered positioning
                    const positions = [
                      { x: -80, y: 28, rotate: -15 },    // Left star - lower and tilted
                      { x: 0, y: 0, rotate: 0 },        // Center star - highest (centered)
                      { x: 80, y: 28, rotate: 15 }      // Right star - lower and tilted
                    ];

                    const pos = positions[index];

                    return (
                      <div
                        key={star}
                        className={`absolute w-20 h-20 transition-all duration-700 ${star <= stars
                          ? "text-yellow-400 scale-110 animate-pulse"
                          : "text-gray-300 scale-90"
                          }`}
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotate}deg)`,
                          transformOrigin: 'center',
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-full h-full drop-shadow-lg"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GOOD JOB Text */}
              <div className="flex justify-center items-center w-full mb-6">
                <div className="text-[#c63c03] text-5xl font-black font-extrabold tracking-wide text-center">
                  GOOD JOB
                </div>
              </div>

              {/* Next Button - Positioned at bottom */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={handleNextLevel}
                  className="bg-[#008c9b] hover:bg-[#007080] text-white text-2xl font-black py-4 px-12 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  NEXT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-center bg-cover"
      style={{ backgroundImage: "url(/images/bg-level.png)" }}
    >
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute w-8 h-12 rounded-full left-4 top-20 bg-amber-700"></div>
        <div className="absolute w-12 h-16 bg-green-600 rounded-full left-2 top-16"></div>
        <div className="absolute w-6 h-10 rounded-full right-8 top-24 bg-amber-600"></div>
        <div className="absolute w-10 bg-green-500 rounded-full right-6 top-20 h-14"></div>
      </div>

      {/* Top Navigation */}
      <div
        className="absolute z-20 flex items-center justify-between top-2 left-2 right-2 landscape:top-1 landscape:left-1 landscape:right-1 md:top-4 md:left-4 md:right-4"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <button
          onClick={() => onNavigate("menu")}
          className="flex items-center justify-center w-10 h-10 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500 landscape:w-8 landscape:h-8 md:w-12 md:h-12"
        >
          <Home className="w-5 h-5 text-amber-800 landscape:w-4 landscape:h-4 md:w-6 md:h-6" />
        </button>

        <div className="px-3 py-1 text-sm font-bold bg-yellow-400 rounded-full shadow-lg text-amber-800 landscape:px-2 landscape:py-0.5 landscape:text-xs md:px-6 md:py-2 md:text-lg">
          MASUKAN BUAH KEDALAM KERANJANG YANG TEPAT!
        </div>

        <button
          onClick={() => setShowInstructions(true)}
          className="flex items-center justify-center w-10 h-10 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500 landscape:w-8 landscape:h-8 md:w-12 md:h-12"
        >
          <HelpCircle className="w-5 h-5 text-amber-800 landscape:w-4 landscape:h-4 md:w-6 md:h-6" />
        </button>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="absolute inset-0 top-12 landscape:top-8 md:top-20"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "none", paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Game Content Container - Mobile Responsive */}
        <div
          className="relative w-full h-full mx-1 mt-1 bg-white bg-opacity-90 rounded-t-3xl md:mx-4 md:mt-4 landscape:mt-0.5"
          style={{
            height: "100%",
            minHeight: "min(100dvh, 700px)",
          }}
        >
          {/* Fruits */}
          {fruits.map(renderFruit)}

          {/* Baskets */}
          {baskets.map(renderBasket)}

          {/* Game Stats */}
          <div className="absolute p-1 text-xs bg-white rounded-lg shadow-lg bg-opacity-80 md:p-3 md:text-sm top-1 right-1 landscape:top-2 landscape:right-2 md:top-4 md:right-4">
            <div className="text-xs font-bold text-gray-700 md:text-sm">
              <div>Waktu: {Math.round((Date.now() - startTime) / 1000)}s</div>
              <div>Kesalahan: {mistakes}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLevel1;
