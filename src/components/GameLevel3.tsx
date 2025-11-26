import React, { useState, useEffect, useRef } from "react";
import { useSound } from "../hooks/useSound";
import { Screen } from "../types/GameTypes";
import InstructionModal from "./InstructionModal";
import BaseGameLayout from "./BaseGameLayout";
import GameResultModal from "./GameResultModal";

interface GameLevel3Props {
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

interface CutLine {
  id: number;
  x: number;
  startY: number;
  endY: number;
  isCompleted: boolean;
  progress: number;
  accuracy: number;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

const GameLevel3: React.FC<GameLevel3Props> = ({
  onNavigate,
  onLevelComplete,
  onNextLevel,
  soundEnabled,
  onSoundToggle,
  // playerName,
}) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [mistakes, setMistakes] = useState(0);
  const [stars, setStars] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [touchPath, setTouchPath] = useState<TouchPoint[]>([]);
  const [overallAccuracy, setOverallAccuracy] = useState(100);
  const [, setCutPaths] = useState<{ [key: number]: TouchPoint[] }>({});

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const appleRef = useRef<HTMLDivElement>(null);
  const { play, stop, unlock } = useSound(soundEnabled);

  // Define cutting lines (3 vertical lines on the apple) - adjusted for current size
  const [cutLines, setCutLines] = useState<CutLine[]>([
    {
      id: 1,
      x: 150,
      startY: 120,
      endY: 250,
      isCompleted: false,
      progress: 0,
      accuracy: 100,
    },
    {
      id: 2,
      x: 200,
      startY: 120,
      endY: 250,
      isCompleted: false,
      progress: 0,
      accuracy: 100,
    },
    {
      id: 3,
      x: 250,
      startY: 120,
      endY: 250,
      isCompleted: false,
      progress: 0,
      accuracy: 100,
    },
  ]);

  const startGame = async () => {
    if (soundEnabled) {
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
    setStartTime(Date.now());
    setCurrentLineIndex(0);

    // Reset all states
    setCutLines((prev) =>
      prev.map((line) => ({
        ...line,
        isCompleted: false,
        progress: 0,
        accuracy: 100,
      }))
    );
    setTouchPath([]);
    setMistakes(0);
    setOverallAccuracy(100);
  };

  const calculateStars = (
    accuracy: number,
    time: number,
    outOfBounds: boolean
  ): number => {
    if (accuracy >= 90 && time <= 8000 && !outOfBounds) return 3; // 3 stars: ≥90% accuracy, ≤8 seconds, no out of bounds
    if ((accuracy >= 70 && accuracy < 90) || time <= 15000) return 2; // 2 stars: 70-89% accuracy or ≤15 seconds
    return 1; // 1 star: <70% accuracy or >15 seconds
  };

  // Detect completion when all lines are done
  useEffect(() => {
    const allCompleted = cutLines.every((line) => line.isCompleted);
    if (allCompleted && !gameCompleted) {
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      const avgAccuracy =
        cutLines.reduce((sum, line) => sum + line.accuracy, 0) /
        cutLines.length;
      const outOfBounds = mistakes > 0;
      const calculatedStars = calculateStars(avgAccuracy, elapsed, outOfBounds);

      setTimeElapsed(elapsed);
      setStars(calculatedStars);
      setOverallAccuracy(avgAccuracy);
      setGameCompleted(true);
    }
  }, [cutLines, gameCompleted, startTime, mistakes]);

  // After completion, play sound and show results with a delay
  useEffect(() => {
    if (!gameCompleted) return;
    play("complete");
    stop("bgm");
    const t = setTimeout(() => setShowResults(true), 1000);
    return () => clearTimeout(t);
  }, [gameCompleted, play, stop]);

  const isPointOnLine = (
    x: number,
    y: number,
    line: CutLine,
    tolerance: number = 20
  ): boolean => {
    // Use the apple element's real position and size for line hit testing
    const gameArea = gameAreaRef.current;
    const appleEl = appleRef.current;
    if (!gameArea || !appleEl) return false;

    const gameRect = gameArea.getBoundingClientRect();
    const appleRect = appleEl.getBoundingClientRect();

    const appleLeft = appleRect.left - gameRect.left;
    const appleTop = appleRect.top - gameRect.top;
    const appleWidth = appleRect.width;
    const appleHeight = appleRect.height;

    // Three vertical lines inside the apple at ~30%, 50%, 70%
    const linePercents = [0.3, 0.5, 0.7];
    const idx = Math.max(0, Math.min(2, line.id - 1));
    const lineX = appleLeft + appleWidth * linePercents[idx];
    const startY = appleTop + appleHeight * 0.2;
    const endY = appleTop + appleHeight * 0.8;

    if (Math.abs(x - lineX) > tolerance) return false;
    return y >= startY - tolerance && y <= endY + tolerance;
  };

  const calculateLineProgress = (y: number): number => {
    const gameArea = gameAreaRef.current;
    const appleEl = appleRef.current;
    if (!gameArea || !appleEl) return 0;

    const gameRect = gameArea.getBoundingClientRect();
    const appleRect = appleEl.getBoundingClientRect();
    const startY = appleRect.top - gameRect.top + appleRect.height * 0.2;
    const endY = appleRect.top - gameRect.top + appleRect.height * 0.8;

    if (y < startY) return 0;
    if (y > endY) return 100;
    return ((y - startY) / (endY - startY)) * 100;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!gameStarted || gameCompleted) return;

    e.preventDefault();
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const currentLine = cutLines[currentLineIndex];
    if (currentLine && !currentLine.isCompleted) {
      if (isPointOnLine(x, y, currentLine)) {
        setIsDrawing(true);
        setTouchPath([{ x, y, timestamp: Date.now() }]);

        // Start new cut path for this line
        setCutPaths((prev) => ({
          ...prev,
          [currentLineIndex]: [{ x, y, timestamp: Date.now() }],
        }));
      } else {
        // Started outside the line - count as mistake
        setMistakes((prev) => prev + 1);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gameStarted || !isDrawing) return;

    e.preventDefault();
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const currentLine = cutLines[currentLineIndex];
    if (!currentLine || currentLine.isCompleted) return;

    // Add point to path
    setTouchPath((prev) => [...prev, { x, y, timestamp: Date.now() }]);

    // Add to cut path
    setCutPaths((prev) => ({
      ...prev,
      [currentLineIndex]: [
        ...(prev[currentLineIndex] || []),
        { x, y, timestamp: Date.now() },
      ],
    }));

    // Check if still on line
    if (isPointOnLine(x, y, currentLine)) {
      const progress = calculateLineProgress(y);

      // Update line progress
      setCutLines((prev) =>
        prev.map((line, index) =>
          index === currentLineIndex
            ? { ...line, progress: Math.max(line.progress, progress) }
            : line
        )
      );

      // Draw on canvas
      console.log("✅ Drawing on line, progress:", progress);
    } else {
      // Went out of bounds
      setMistakes((prev) => prev + 1);
      console.log("❌ Out of bounds!");

      // Reduce accuracy for current line
      setCutLines((prev) =>
        prev.map((line, index) =>
          index === currentLineIndex
            ? { ...line, accuracy: Math.max(0, line.accuracy - 10) }
            : line
        )
      );
    }
  };

  const handleTouchEnd = () => {
    if (!gameStarted || !isDrawing) return;

    setIsDrawing(false);

    const currentLine = cutLines[currentLineIndex];
    if (currentLine && currentLine.progress >= 95) {
      // Line completed!
      setCutLines((prev) =>
        prev.map((line, index) =>
          index === currentLineIndex
            ? { ...line, isCompleted: true, progress: 100 }
            : line
        )
      );

      // Play cut sound
      play("swoosh");

      // Move to next line
      if (currentLineIndex < cutLines.length - 1) {
        setCurrentLineIndex((prev) => prev + 1);
        console.log("➡️ Moving to next line:", currentLineIndex + 1);
      }
    }

    setTouchPath([]);
  };

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!gameStarted || gameCompleted) return;

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentLine = cutLines[currentLineIndex];
    if (currentLine && !currentLine.isCompleted) {
      if (isPointOnLine(x, y, currentLine)) {
        setIsDrawing(true);
        setTouchPath([{ x, y, timestamp: Date.now() }]);

        // Start new cut path for this line
        setCutPaths((prev) => ({
          ...prev,
          [currentLineIndex]: [{ x, y, timestamp: Date.now() }],
        }));
      } else {
        setMistakes((prev) => prev + 1);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gameStarted || !isDrawing) return;

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentLine = cutLines[currentLineIndex];
    if (!currentLine || currentLine.isCompleted) return;

    setTouchPath((prev) => [...prev, { x, y, timestamp: Date.now() }]);

    // Add to cut path
    setCutPaths((prev) => ({
      ...prev,
      [currentLineIndex]: [
        ...(prev[currentLineIndex] || []),
        { x, y, timestamp: Date.now() },
      ],
    }));

    if (isPointOnLine(x, y, currentLine)) {
      const progress = calculateLineProgress(y);

      setCutLines((prev) =>
        prev.map((line, index) =>
          index === currentLineIndex
            ? { ...line, progress: Math.max(line.progress, progress) }
            : line
        )
      );

      console.log("✅ Mouse drawing on line, progress:", progress);
    } else {
      setMistakes((prev) => prev + 1);
      console.log("❌ Mouse out of bounds!");
      setCutLines((prev) =>
        prev.map((line, index) =>
          index === currentLineIndex
            ? { ...line, accuracy: Math.max(0, line.accuracy - 10) }
            : line
        )
      );
    }
  };

  const handleMouseUp = () => {
    if (!gameStarted || !isDrawing) return;

    setIsDrawing(false);

    const currentLine = cutLines[currentLineIndex];
    if (currentLine && currentLine.progress >= 95) {
      setCutLines((prev) =>
        prev.map((line, index) =>
          index === currentLineIndex
            ? { ...line, isCompleted: true, progress: 100 }
            : line
        )
      );

      play("swoosh");

      if (currentLineIndex < cutLines.length - 1) {
        setCurrentLineIndex((prev) => prev + 1);
      }
    }

    setTouchPath([]);
  };

  // Render cut lines as DOM elements; position them relative to the apple element
  const renderCutLines = () => {
    const gameArea = gameAreaRef.current;
    const appleEl = appleRef.current;
    if (!gameArea || !appleEl) return null;

    const gameRect = gameArea.getBoundingClientRect();
    const appleRect = appleEl.getBoundingClientRect();
    const appleLeft = appleRect.left - gameRect.left;
    const appleTop = appleRect.top - gameRect.top;
    const appleWidth = appleRect.width;
    const appleHeight = appleRect.height;
    const startY = appleTop + appleHeight * 0.2; // Start 20% from top
    const endY = appleTop + appleHeight * 0.8; // End 80% from top

    return (
      <>
        {/* Completed cut lines */}
        {cutLines.map((line) => {
          if (!line.isCompleted) return null;
          const linePercents = [0.3, 0.5, 0.7];
          const idx = Math.max(0, Math.min(2, line.id - 1));
          const lineX = appleLeft + appleWidth * linePercents[idx];

          return (
            <div
              key={`completed-${line.id}`}
              className="absolute z-30 bg-green-500 rounded-full pointer-events-none"
              style={{
                left: lineX - 2,
                top: startY,
                width: "3px",
                height: endY - startY,
                boxShadow: "0 0 6px rgba(34, 197, 94, 0.6)",
              }}
            />
          );
        })}

        {/* Current progress line */}
        {cutLines.map((line, index) => {
          if (
            line.isCompleted ||
            index !== currentLineIndex ||
            line.progress === 0
          )
            return null;
          const linePercents = [0.3, 0.5, 0.7];
          const idx = Math.max(0, Math.min(2, line.id - 1));
          const lineX = appleLeft + appleWidth * linePercents[idx];
          const progressHeight = (endY - startY) * (line.progress / 100);

          return (
            <div
              key={`progress-${line.id}`}
              className="absolute z-30 bg-yellow-500 rounded-full pointer-events-none animate-pulse"
              style={{
                left: lineX - 2,
                top: startY,
                width: "3px",
                height: progressHeight,
                boxShadow: "0 0 6px rgba(245, 158, 11, 0.8)",
              }}
            />
          );
        })}

        {/* Touch path visualization */}
        {isDrawing && touchPath.length > 1 && (
          <svg
            className="absolute inset-0 pointer-events-none z-25"
            style={{ width: "100%", height: "100%" }}
          >
            <path
              d={`M ${touchPath.map((p) => `${p.x},${p.y}`).join(" L ")}`}
              stroke="#ef4444"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          </svg>
        )}
      </>
    );
  };

  const handleNextLevel = () => {
    onLevelComplete(stars, timeElapsed, mistakes);
    onNextLevel();
  };

  return (
    <>
      <BaseGameLayout
        onNavigate={onNavigate}
        onShowInstructions={() => setShowInstructions(true)}
        title="Level 3: Potong buah apel!"
        gameAreaRef={gameAreaRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Knife on the left */}
        <img
          src="/images/knife.png"
          alt="knife"
          className="absolute w-16 -translate-y-1/2 pointer-events-none select-none left-6 md:left-10 top-1/2 md:w-24"
          draggable={false}
        />

        {/* Cutting board centered */}
        <div
          ref={boardRef}
          className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
        >
          <img
            src="/images/tatakan.png"
            alt="board"
            className="w-[480px] max-w-[40vw] h-auto select-none"
            draggable={false}
          />

          {/* Apple positioned centered over board */}
          <div
            ref={appleRef}
            className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
            style={{ width: "280px", height: "280px" }}
          >
            <img
              src="/images/fruits/apple.png"
              alt="apple"
              className="object-contain w-full h-full pointer-events-none select-none"
              draggable={false}
            />
            {/* Dashed guide lines */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`absolute top-16 bottom-16 border-l-2 ${
                  i === currentLineIndex
                    ? "border-yellow-500 animate-pulse"
                    : "border-gray-400"
                } border-dashed opacity-70`}
                style={{ left: `${28 + i * 22}%` }}
              />
            ))}
          </div>
        </div>

        {/* Cut lines visualization */}
        {renderCutLines()}

        {/* Progress indicator */}
        <div className="absolute flex space-x-2 transform -translate-x-1/2 bottom-4 left-1/2">
          {cutLines.map((line, index) => (
            <div
              key={line.id}
              className={`w-4 h-4 rounded-full ${
                line.isCompleted
                  ? "bg-green-500"
                  : index === currentLineIndex
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
      </BaseGameLayout>

      <InstructionModal
        isOpen={showInstructions}
        onClose={startGame}
        title="Petunjuk"
        imageSrc="/images/petunjuk/level3.png"
        description="Gerakan jari dari atas ke bawah mengikuti garis putus-putus"
      />

      {showResults && (
        <>
          <GameResultModal
            isOpen={showResults}
            level={3}
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

export default GameLevel3;
