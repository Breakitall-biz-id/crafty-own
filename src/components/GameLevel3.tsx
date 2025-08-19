import React, { useState, useEffect, useRef } from "react";
import { useSound } from "../hooks/useSound";
import { Home, HelpCircle, Volume2, VolumeX, X } from "lucide-react";
import { Screen } from "../types/GameTypes";

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

  // Define cutting lines (3 vertical lines on the apple)
  const [cutLines, setCutLines] = useState<CutLine[]>([
    {
      id: 1,
      x: 320,
      startY: 200,
      endY: 380,
      isCompleted: false,
      progress: 0,
      accuracy: 100,
    },
    {
      id: 2,
      x: 400,
      startY: 200,
      endY: 380,
      isCompleted: false,
      progress: 0,
      accuracy: 100,
    },
    {
      id: 3,
      x: 480,
      startY: 200,
      endY: 380,
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
    tolerance: number = 30
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
    const startY = appleTop;
    const endY = appleTop + appleHeight;

    if (Math.abs(x - lineX) > tolerance) return false;
    return y >= startY - tolerance && y <= endY + tolerance;
  };

  const calculateLineProgress = (y: number): number => {
    const gameArea = gameAreaRef.current;
    const appleEl = appleRef.current;
    if (!gameArea || !appleEl) return 0;

    const gameRect = gameArea.getBoundingClientRect();
    const appleRect = appleEl.getBoundingClientRect();
    const startY = appleRect.top - gameRect.top;
    const endY = startY + appleRect.height;

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
    const appleTop = appleRect.top - gameRect.top - 20;
    const appleWidth = appleRect.width;
    const appleHeight = appleRect.height;
    const startY = appleTop;
    const endY = appleTop + appleHeight;

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
                left: lineX - 15,
                top: startY,
                width: "4px",
                height: endY - startY,
                boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)",
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
                left: lineX - 15,
                top: startY,
                width: "4px",
                height: progressHeight,
                boxShadow: "0 0 8px rgba(245, 158, 11, 0.8)",
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
              strokeWidth="5"
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

  if (showInstructions) {
    return (
      <div
        className="relative min-h-screen overflow-hidden bg-center bg-cover"
        style={{ backgroundImage: "url(/images/bg-level.png)" }}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Background trees */}
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
                <X className="w-6 h-6 text-amber-800" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 mb-6 bg-white rounded-2xl">
              {/* Visual example */}
              <div className="flex items-center justify-center mb-4">
                {/* Apple with cutting line */}
                <div className="relative">
                  <div className="relative w-20 h-20 bg-red-500 rounded-full">
                    {/* Apple stem */}
                    <div className="absolute w-1 h-3 transform -translate-x-1/2 rounded-full -top-2 left-1/2 bg-amber-700"></div>
                    {/* Apple leaf */}
                    <div className="absolute w-4 h-3 transform rotate-45 bg-green-500 rounded-full -top-1 right-6"></div>
                    {/* Cutting line */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-16 border-l-2 border-dashed border-black"></div>
                  </div>
                  {/* Hand gesture */}
                  <div className="absolute transform -translate-x-1/2 -bottom-8 left-1/2">
                    <div className="relative w-8 h-10 rounded-full bg-amber-200">
                      <div className="absolute w-1 h-6 rounded-full top-2 left-1 bg-amber-300"></div>
                      <div className="absolute w-1 rounded-full top-1 left-3 h-7 bg-amber-300"></div>
                      <div className="absolute w-1 h-6 rounded-full top-2 left-5 bg-amber-300"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 text-center bg-yellow-100 rounded-xl">
                <p className="text-lg font-bold text-amber-800">
                  GERAKAN JARI DARI ATAS KE BAWAH MENGIKUTI GARIS PUTUS-PUTUS
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
        style={{ backgroundImage: "url(/images/bg-level.png)" }}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>

        {/* Results Modal */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md p-8 mx-4 bg-white border-4 border-orange-500 shadow-2xl rounded-3xl">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="px-6 py-3 mb-4 text-xl font-bold text-white bg-teal-500 rounded-full">
                LEVEL 3 COMPLETE
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
              <p className="text-lg text-gray-600">
                Akurasi: {Math.round(overallAccuracy)}%
              </p>
              <p className="text-lg text-gray-600">
                Keluar garis: {mistakes} kali
              </p>
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
    <div
      className="relative min-h-screen overflow-hidden bg-center bg-cover"
      style={{ backgroundImage: "url(/images/bg-level.png)" }}
    >
      {/* Background trees */}
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

        <div className="px-6 py-2 text-lg font-bold text-orange-600 bg-yellow-100 rounded-full shadow-lg">
          POTONG BUAH APEL!
        </div>

        <button
          onClick={() => setShowInstructions(true)}
          className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
        >
          <HelpCircle className="w-6 h-6 text-amber-800" />
        </button>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="absolute inset-0 top-16 md:top-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ touchAction: "none" }}
      >
        {/* Game Content Container (white card) */}
        <div className="relative w-[96%] mx-auto h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] mt-3 md:mt-4 bg-white rounded-[32px] shadow-lg overflow-hidden">
          {/* Header pill inside card like mock */}
          <div className="absolute -translate-x-1/2 top-4 left-1/2">
            <div className="px-6 py-2 text-lg font-bold tracking-wide text-orange-600 bg-yellow-200 rounded-full md:px-8 md:py-3 md:text-2xl">
              POTONG BUAH APEL!
            </div>
          </div>

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
              className="w-[540px] max-w-[80vw] h-auto select-none"
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
                  className={`absolute top-0 bottom-0 border-l-4 ${
                    i === currentLineIndex
                      ? "border-yellow-600 animate-pulse"
                      : "border-black"
                  } border-dashed`}
                  style={{ left: `${30 + i * 20}%` }}
                />
              ))}
            </div>
          </div>

          {/* Cut lines visualization */}
          {renderCutLines()}

          {/* Game Stats */}
          <div className="absolute p-3 text-sm rounded-lg shadow-lg top-4 right-4 bg-white/80">
            <div className="space-y-1 font-bold text-gray-700">
              <div>Waktu: {Math.round((Date.now() - startTime) / 1000)}s</div>
              <div>
                Garis: {currentLineIndex + 1}/{cutLines.length}
              </div>
              <div>Keluar: {mistakes}</div>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default GameLevel3;
