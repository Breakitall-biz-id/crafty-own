import React, { useRef, useState, useEffect } from "react";
import { useSound } from "../hooks/useSound";
import { Screen } from "../types/GameTypes";
import InstructionModal from "./InstructionModal";
import BaseGameLayout from "./BaseGameLayout";
import GameResultModal from "./GameResultModal";

interface GameLevel4Props {
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

// === Path apel (gabungan 3 path dari Figma). ViewBox aslinya 214 x 231 ===
const applePath = [
  "M106.454 82.3906 C102.454 67.3906 70.9537 40.3903 27.9538 76.3905 C-15.0462 112.391 2.95378 176.891 16.9538 192.891 C30.9537 208.891 45.9538 221.176 62.4537 225.891 C83.4537 231.891 90.4538 230.391 106.954 222.391",
  "M106.954 222.391 C118.454 231.391 150.454 231.885 169.954 216.891 C189.454 201.896 197.25 197.02 205.954 177.891 C212.324 163.891 224.954 112.891 185.954 75.8906 C146.954 38.8905 112.454 74.8906 112.454 74.8906 C112.454 74.8906 108.954 61.3906 112.954 45.8906 C116.954 30.3906 127.454 22.8906 127.454 22.8906 C127.454 22.8906 126.954 13.3908 120.454 18.8906 C113.954 24.3904 109.954 27.3906 104.954 44.3906 C100.761 58.6472 106.954 82.3906 106.954 82.3906",
  "M102.954 40.3909 C102.954 40.3909 103.454 20.988 82.9537 7.89087 C62.4537 -5.20624 39.9537 4.39062 39.9537 4.39062 C39.9537 4.39062 42.4537 12.3908 47.9537 20.3907 C53.4537 28.3906 54.6469 29.1405 60.9537 33.3907 C83.9537 48.8906 103.954 46.8909 103.954 46.8909",
].join(" ");

const combinedPath = applePath;

const GameLevel4: React.FC<GameLevel4Props> = ({
  onNavigate,
  onLevelComplete,
  onNextLevel,
  soundEnabled,
  onSoundToggle,
  playerName,
}) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [userPath, setUserPath] = useState<string>("");
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [stars, setStars] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const { play, stop, unlock } = useSound(soundEnabled);

  // ===== Helpers =====
  function estimatePathLength(path: string): number {
    if (!path) return 0;
    const commands = path.match(/[MLQCT][^MLQCTZz]*/g);
    if (!commands) return 0;
    let prev: [number, number] | null = null;
    let length = 0;
    for (const cmd of commands) {
      const type = cmd[0];
      const nums = cmd
        .slice(1)
        .trim()
        .split(/[ ,]+/)
        .map(Number)
        .filter((n) => !isNaN(n));
      if (type === "M" || type === "L") {
        const [x, y] = nums;
        if (prev) length += Math.hypot(x - prev[0], y - prev[1]);
        prev = [x, y];
      } else if (type === "Q" && nums.length === 4) {
        const [, , x, y] = nums;
        if (prev) length += Math.hypot(x - prev[0], y - prev[1]);
        prev = [x, y];
      } else if (type === "C" && nums.length === 6) {
        const [, , , , x, y] = nums;
        if (prev) length += Math.hypot(x - prev[0], y - prev[1]);
        prev = [x, y];
      }
    }
    return length;
  }

  // Fungsi untuk mendeteksi apakah titik berada dekat dengan path target
  function isPointNearPath(x: number, y: number): boolean {
    // Simplified: check if point is within apple area bounds
    return x >= 20 && x <= 194 && y >= 0 && y <= 231;
  }

  // Fungsi untuk menghitung kesalahan berdasarkan drawing user
  function calculateMistakes(userPath: string): number {
    if (!userPath) return 0;

    const commands = userPath.match(/[ML][^ML]*/g);
    if (!commands) return 0;

    let mistakeCount = 0;
    let totalPoints = 0;

    for (const cmd of commands) {
      const type = cmd[0];
      const nums = cmd
        .slice(1)
        .trim()
        .split(/[ ,]+/)
        .map(Number)
        .filter((n) => !isNaN(n));

      if (type === "M" || type === "L") {
        const [x, y] = nums;
        totalPoints++;

        // Check if point is too far from target path
        if (!isPointNearPath(x, y)) {
          mistakeCount++;
        }
      }
    }

    // Return percentage of mistakes (out of 100)
    return totalPoints > 0 ? Math.round((mistakeCount / totalPoints) * 100) : 0;
  }

  function getSvgCoords(e: React.PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const { x, y } = pt.matrixTransform(ctm.inverse());
    // Tidak ada scaling/offset manual: koordinat user == viewBox (214x231)
    return { x, y };
  }

  // ===== Game flow =====
  const startGame = async () => {
    if (soundEnabled) {
      try {
        await unlock();
      } catch {
        // Ignore unlock errors
      }
      play("start");
      play("bgm");
    }
    setShowInstructions(false);
    setDrawing(false);
    setUserPath("");
    setCompleted(false);
    setStartTime(null);
    setEndTime(null);
    setStars(null);
    setShowResults(false);
    setAccuracy(0);
    setMistakes(0);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (completed || showInstructions) return;
    setDrawing(true);
    if (!startTime) setStartTime(Date.now());
    const { x, y } = getSvgCoords(e);
    setUserPath((prev) => (prev ? `${prev} M${x},${y}` : `M${x},${y}`));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawing || completed) return;
    const { x, y } = getSvgCoords(e);
    setUserPath((prev) => prev + ` L${x},${y}`);
  };

  const handlePointerUp = () => {
    if (!drawing) return;
    setDrawing(false);
    setEndTime(Date.now());
  };

  const handleFinishDrawing = () => {
    if (completed || !userPath) return;
    const finishTime = endTime ?? Date.now();
    const timeElapsed = startTime ? (finishTime - startTime) / 1000 : 0;
    const userLength = estimatePathLength(userPath);
    const combinedLength = estimatePathLength(combinedPath);
    const calculatedAccuracy =
      combinedLength > 0 ? Math.min(1, userLength / combinedLength) : 0;

    // Hitung kesalahan dan akurasi
    const calculatedMistakes = calculateMistakes(userPath);
    const accuracyPercentage = Math.round(calculatedAccuracy * 100);

    // Set state untuk ditampilkan di result
    setAccuracy(accuracyPercentage);
    setMistakes(calculatedMistakes);

    let bintang = 1;
    if (calculatedAccuracy >= 0.9 && timeElapsed >= 15 && timeElapsed <= 20) {
      bintang = 3;
    } else if (calculatedAccuracy >= 0.7 && timeElapsed <= 30) {
      bintang = 2;
    }

    setStars(bintang);
    setCompleted(true);
  };

  useEffect(() => {
    if (!completed) return;
    play("complete");
    stop("bgm");
    const t = setTimeout(() => setShowResults(true), 1000);
    return () => clearTimeout(t);
  }, [completed, play, stop]);

  // ===== Screens =====
  if (showResults && !!stars) {
    const safeStars = stars ?? 0;
    const safeEndTime = endTime ?? 0;
    const safeStartTime = startTime ?? 0;
    const timeElapsed = endTime && startTime ? safeEndTime - safeStartTime : 0;

    return (
      <GameResultModal
        isOpen={showResults}
        level={4}
        stars={safeStars}
        timeElapsed={timeElapsed}
        mistakes={mistakes}
        accuracy={accuracy}
        onNextLevel={() => {
          onLevelComplete(safeStars, timeElapsed / 1000, mistakes);
          onNextLevel();
          setShowResults(false);
          setDrawing(false);
          setUserPath("");
          setCompleted(false);
          setStartTime(null);
          setEndTime(null);
          setStars(null);
          setAccuracy(0);
          setMistakes(0);
        }}
      />
    );
  }

  // ===== Main Canvas =====
  return (
    <>
      <BaseGameLayout
        onNavigate={onNavigate}
        onShowInstructions={() => setShowInstructions(true)}
        title="GAMBAR BUAH APEL!"
      >
        {/* Drawing area */}
        <div className="flex items-center justify-center flex-1 w-full h-full px-6 pt-8 pb-16">
          <svg
            ref={svgRef}
            viewBox="0 0 214 231"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full touch-none"
            style={{
              touchAction: "none",
              display: "block",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <path
              d={applePath}
              stroke="#999999"
              strokeWidth={3}
              fill="none"
              strokeDasharray="8 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={userPath}
              stroke="#e53935"
              strokeWidth={3}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Finish button */}
        <button
          onClick={handleFinishDrawing}
          className="absolute px-8 py-2 font-bold text-white transition -translate-x-1/2 bg-orange-500 rounded-full shadow bottom-1 text-md left-1/2 hover:bg-orange-600"
        >
          SELESAI
        </button>
      </BaseGameLayout>

      <InstructionModal
        isOpen={showInstructions}
        onClose={startGame}
        title="PETUNJUK"
        imageSrc="/images/petunjuk/level4.png"
        description="GERAKAN JARI MENGIKUTI GARIS PUTUS-PUTUS"
      />
    </>
  );
};

export default GameLevel4;
