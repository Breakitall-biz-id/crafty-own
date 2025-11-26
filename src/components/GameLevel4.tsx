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
  const [gameStarted, setGameStarted] = useState(false);
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

  const handleStart = () => {
    setGameStarted(true);
    setShowInstructions(false);
    if (soundEnabled) {
      play("start");
    }
  };

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
    // Check if point is within apple area bounds (sesuai viewBox "10 0 194 231")
    return x >= 10 && x <= 204 && y >= 0 && y <= 231;
  }

  // Fungsi untuk menghitung persentase titik yang berada di luar area target
  function calculateOutOfBoundsPercentage(userPath: string): number {
    if (!userPath) return 100; // Jika tidak ada gambar, 100% salah

    const commands = userPath.match(/[ML][^ML]*/g);
    if (!commands) return 100;

    let outOfBoundsCount = 0;
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

        // Check if point is outside target area
        if (!isPointNearPath(x, y)) {
          outOfBoundsCount++;
        }
      }
    }

    // Return percentage of out-of-bounds points
    return totalPoints > 0
      ? Math.round((outOfBoundsCount / totalPoints) * 100)
      : 100;
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
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (completed || showInstructions || !gameStarted) return;
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

    // Set end time saat tombol selesai ditekan
    const finishTime = Date.now();
    setEndTime(finishTime);

    const timeElapsedMs = startTime ? finishTime - startTime : 0;
    const timeElapsedSeconds = timeElapsedMs / 1000;

    const userLength = estimatePathLength(userPath);
    const combinedLength = estimatePathLength(combinedPath);

    // Hitung akurasi berdasarkan panjang path
    let pathAccuracy = 0;
    if (combinedLength > 0 && userLength > 0) {
      const lengthRatio =
        Math.min(userLength, combinedLength) /
        Math.max(userLength, combinedLength);
      pathAccuracy = lengthRatio;
    }

    // Hitung persentase titik yang keluar area target
    const outOfBoundsPercentage = calculateOutOfBoundsPercentage(userPath);

    // Akurasi area = 100% - persentase yang keluar area
    const areaAccuracy = (100 - outOfBoundsPercentage) / 100;

    // Akurasi total = rata-rata dari akurasi path dan akurasi area
    const totalAccuracy = (pathAccuracy + areaAccuracy) / 2;
    const accuracyPercentage = Math.round(totalAccuracy * 100);

    // Set state untuk ditampilkan di result
    setAccuracy(accuracyPercentage);
    setMistakes(outOfBoundsPercentage); // mistakes = persentase keluar area

    let bintang = 1;
    if (accuracyPercentage >= 80 && timeElapsedSeconds <= 30) {
      bintang = 3;
    } else if (accuracyPercentage >= 60 && timeElapsedSeconds <= 60) {
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


  return (
    <>
      <BaseGameLayout
        onNavigate={onNavigate}
        onShowInstructions={() => setShowInstructions(true)}
        title="GAMBAR BUAH APEL!"
      >
        {/* Drawing area */}
        <div className="flex items-center justify-center flex-1 w-full h-full px-2 pt-2 pb-8">
          <svg
            ref={svgRef}
            viewBox="10 0 194 231"
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

        {/* Finish button - positioned on the right side */}
        <button
          onClick={handleFinishDrawing}
          className="absolute flex items-center justify-center w-12 h-12 text-xl text-white transition-all -translate-y-1/2 bg-green-500 rounded-full shadow-lg hover:bg-green-600 right-4 top-1/2"
          title="Selesai"
        >
          ✓
        </button>
      </BaseGameLayout>

      <InstructionModal
        isOpen={showInstructions}
        onClose={startGame}
        title="PETUNJUK"
        imageSrc="/images/petunjuk/level4.png"
        description="GERAKAN JARI MENGIKUTI GARIS PUTUS-PUTUS"
      />

      <GameResultModal
        isOpen={showResults}
        level={4}
        stars={stars ?? 0}
        timeElapsed={endTime && startTime ? (endTime - startTime) / 1000 : 0}
        mistakes={mistakes}
        onNextLevel={() => {
          const safeStars = stars ?? 0;
          const timeElapsedMs = endTime && startTime ? endTime - startTime : 0;
          onLevelComplete(safeStars, timeElapsedMs / 1000, mistakes);
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

      {showInstructions && (
        <InstructionModal
          isOpen={showInstructions}
          onClose={handleStart}
          title="Level 4: Ikuti Garis Apel"
          imageSrc="/images/petunjuk/level4.png"
          description="Ikuti garis bentuk apel dengan tepat. Semakin akurat, semakin banyak bintang yang kamu dapatkan!"
        />
      )}
    </>
  );
};

export default GameLevel4;
