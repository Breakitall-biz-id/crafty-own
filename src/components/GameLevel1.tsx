import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSound } from "../hooks/useSound";
import { Screen } from "../types/GameTypes";
import InstructionModal from "./InstructionModal";
import BaseGameLayout from "./BaseGameLayout";
import GameResultModal from "./GameResultModal";

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
  const [showInstructions, setShowInstructions] = useState(false);
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

  const initializePositions = useCallback(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const rect = gameArea.getBoundingClientRect();
    const isPortrait = window.innerHeight > window.innerWidth;
    const isMobile = window.innerWidth < 768;

    let fruitPositions: { x: number; y: number }[];
    let basketPositions: { x: number; y: number }[];

    if (isMobile && isPortrait) {
      const centerX = rect.width / 2;
      const topY = Math.max(100, rect.height * 0.15);
      const bottomY = Math.max(rect.height * 0.65, rect.height - 120);

      fruitPositions = [
        { x: centerX - 200, y: topY },
        { x: centerX, y: topY },
        { x: centerX + 200, y: topY },
      ];

      basketPositions = [
        { x: centerX - 80, y: bottomY },
        { x: centerX, y: bottomY },
        { x: centerX + 80, y: bottomY },
      ];
    } else if (isMobile && !isPortrait) {
      const availableWidth = rect.width - 100;
      const spacing = Math.min(100, availableWidth / 3);
      const startX = Math.max(50, (rect.width - spacing * 2) / 2);
      const topY = Math.max(40, rect.height * 0.15);
      const bottomY = Math.max(rect.height * 0.6, rect.height - 80);

      fruitPositions = [
        { x: startX - 100, y: topY },
        { x: startX + spacing - 100, y: topY },
        { x: startX + spacing * 2 - 100, y: topY },
      ];

      basketPositions = [
        { x: startX, y: bottomY },
        { x: startX + spacing, y: bottomY },
        { x: startX + spacing * 2, y: bottomY },
      ];
    } else {
      const spacing = Math.min(150, rect.width / 5);
      const startX = Math.max(150, (rect.width - spacing * 2) / 2);
      const fruitY = Math.max(120, rect.height * 0.25);
      const basketY = Math.max(rect.height * 0.65, rect.height - 150);

      fruitPositions = [
        { x: startX - 40, y: fruitY },
        { x: startX + spacing - 40, y: fruitY },
        { x: startX + spacing * 2 - 40, y: fruitY },
      ];

      basketPositions = [
        { x: startX - 50, y: basketY },
        { x: startX + spacing - 50, y: basketY },
        { x: startX + spacing * 2 - 50, y: basketY },
      ];
    }

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

    baskets[0].x = basketPositions[0].x;
    baskets[0].y = basketPositions[0].y;
    baskets[1].x = basketPositions[1].x;
    baskets[1].y = basketPositions[1].y;
    baskets[2].x = basketPositions[2].x;
    baskets[2].y = basketPositions[2].y;
  }, [baskets]);

  // Auto start game when component mounts
  useEffect(() => {
    if (!gameStarted) {
      setGameStarted(true);
      setGameCompleted(false);
      setShowResults(false);
      setStartTime(Date.now()); // Set start time when game begins
      
      // Initialize music - start BGM that will continue throughout all levels
      if (soundEnabled) {
        try {
          unlock();
        } catch (error) {
          // Ignore unlock errors
          console.log('Audio unlock failed:', error);
        }
        play("start");
        // Start background music
        play("bgm");
      }
    }
  }, [gameStarted, soundEnabled, unlock, play]);

  useEffect(() => {
    if (gameAreaRef.current) {
      requestAnimationFrame(() => initializePositions());
      setTimeout(initializePositions, 0);
    }
    const handleResize = () => initializePositions();
    const handleOrientation = () => initializePositions();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientation);
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

  const calculateStars = (time: number, mistakeCount: number): number => {
    // time is in milliseconds
    if (mistakeCount === 0 && time <= 30000) return 3; // 30 seconds or less, no mistakes = 3 stars
    if (mistakeCount <= 1 && time <= 60000) return 2;  // 1 minute or less, max 1 mistake = 2 stars
    if (mistakeCount <= 3 && time <= 120000) return 2; // 2 minutes or less, max 3 mistakes = 2 stars
    return 1;
  };

  const checkGameCompletion = useCallback(() => {
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
        // Don't stop BGM - let it continue to next level
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
    if (!isMobile) return 80;
    return isPortrait ? 80 : 70;
  };

  const handleMouseUp = () => {
    if (!draggedFruit || !gameStarted) return;

    const draggedFruitObj = fruits.find((f) => f.id === draggedFruit);
    if (!draggedFruitObj) return;

    let correctBasket = false;
    const radius = getDropRadius();
    for (const basket of baskets) {
      const distance = Math.sqrt(
        Math.pow(draggedFruitObj.x - basket.x, 2) +
          Math.pow(draggedFruitObj.y - basket.y, 2)
      );

      if (distance < radius) {
        if (draggedFruitObj.color === basket.color) {
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
          setMistakes((prev) => prev + 1);
          if (soundEnabled) {
            play("error");
          }
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

  // ===== RENDER (STYLE-ONLY CHANGES) =====
  const renderFruit = (fruit: Fruit) => {
    const imgSrc: Record<Fruit["type"], string> = {
      apple: "/images/fruits/apple.png",
      pear: "/images/fruits/pear.png",
      pineapple: "/images/fruits/pineapple.png",
    };

    return (
      <div
        key={fruit.id}
        className={`absolute cursor-pointer transition-transform ${
          fruit.isDragging ? "scale-110 z-20" : "hover:scale-105 z-10"
        } ${fruit.isPlaced ? "cursor-default" : ""}`}
        style={{
          // ukuran disesuaikan agar mirip SS
          width: "clamp(72px,8vw,120px)",
          height: "clamp(72px,8vw,120px)",
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
        // NOTE: tetap pakai anchor top-left sesuai logika aslimu
        className="absolute"
        style={{
          left: basket.x - 10, // offset kecil seperti sebelumnya
          top: basket.y - 25,
          width: "clamp(110px,12vw,180px)",
          height: "clamp(90px,10vw,140px)",
        }}
      >
        <img
          src={basketImg[basket.color]}
          alt={`basket-${basket.color}`}
          className="object-contain w-40 h-40 pointer-events-none select-none"
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
        title="Level 1: Masukan buah ke dalam keranjang yang tepat!"
        gameAreaRef={gameAreaRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Buah */}
        {fruits.map(renderFruit)}

        {/* Keranjang */}
        {baskets.map(renderBasket)}
      </BaseGameLayout>

      {/* Instruction Modal - Overlay */}
      <InstructionModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Petunjuk:"
        imageSrc="/images/petunjuk/level1.png"
        description="Letakkan buah di keranjang sesuai dengan warnanya."
      />

      {showResults && (
        <>
          <GameResultModal
            isOpen={showResults}
            level={1}
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

export default GameLevel1;
