
import React, { useRef, useState, useEffect } from "react";
import { useSound } from "../hooks/useSound";
import { Screen } from "../types/GameTypes";
import { Home, Lightbulb, X } from "lucide-react";


interface GameLevel4Props {
  onNavigate: (screen: Screen) => void;
  onLevelComplete: (stars: number, timeElapsed: number, mistakes: number) => void;
  onNextLevel: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  playerName: string;
}


const applePath = `
  M300,390
  C210,375 180,300 195,225
  C202,165 255,150 285,188
  Q300,173 315,188
  C345,150 397,165 405,225
  C420,300 390,375 300,390
  Z
`;
const stemPath = `M300,188 Q298,165 302,145`;
const leafPath = `M300,143 Q278,120 255,143 Q270,165 300,143`;
const combinedPath = `${applePath} ${stemPath} ${leafPath}`;


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
  const svgRef = useRef<SVGSVGElement>(null);
  const { play, stop, unlock } = useSound(soundEnabled);
  const [showResults, setShowResults] = useState(false);

  // Start game: play sound, bgm, reset state, close modal
  const startGame = async () => {
    if (soundEnabled) {
      try {
        await unlock();
      } catch { }
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

  // Mulai menggambar
  const handlePointerDown = (e: React.PointerEvent) => {
    if (completed || showInstructions) return;
    setDrawing(true);
    if (!startTime) setStartTime(Date.now());
    const { x, y } = getSvgCoords(e);
    setUserPath(`M${x},${y}`);
  };

  // Menggambar mengikuti pointer
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawing || completed) return;
    const { x, y } = getSvgCoords(e);
    setUserPath((prev) => prev + ` L${x},${y}`);
  };

  // Selesai menggambar
  const handlePointerUp = () => {
    if (!drawing) return;
    setDrawing(false);
    const finishTime = Date.now();
    setEndTime(finishTime);
    // Penilaian otomatis
    const timeElapsed = startTime ? (finishTime - startTime) / 1000 : 0;
    const userLength = estimatePathLength(userPath);
    const combinedLength = estimatePathLength(combinedPath);
    const accuracy = combinedLength > 0 ? Math.min(1, userLength / combinedLength) : 0;
    let bintang = 1;
    if (accuracy >= 0.9 && timeElapsed >= 15 && timeElapsed <= 20) {
      bintang = 3;
    } else if (accuracy >= 0.7 && (timeElapsed <= 30)) {
      bintang = 2;
    }
    setStars(bintang);
    setCompleted(true);
  };

  // Efek: mainkan audio complete, stop bgm, dan tampilkan reward setelah delay
  useEffect(() => {
    if (!completed) return;
    play("complete");
    stop("bgm");
    const t = setTimeout(() => setShowResults(true), 1000);
    return () => clearTimeout(t);
  }, [completed, play, stop]);



  // Estimasi panjang path SVG (sederhana, hanya untuk penilaian kasar)
  function estimatePathLength(path: string): number {
    if (!path) return 0;
    const commands = path.match(/[MLQCT][^MLQCTZz]*/g);
    if (!commands) return 0;
    let prev: [number, number] | null = null;
    let length = 0;
    for (const cmd of commands) {
      const type = cmd[0];
      const nums = cmd.slice(1).trim().split(/[ ,]+/).map(Number).filter(n => !isNaN(n));
      if (type === 'M' || type === 'L') {
        const [x, y] = nums;
        if (prev) {
          length += Math.hypot(x - prev[0], y - prev[1]);
        }
        prev = [x, y];
      } else if (type === 'Q' && nums.length === 4) {
        const [cx, cy, x, y] = nums;
        if (prev) {
          length += Math.hypot(x - prev[0], y - prev[1]);
        }
        prev = [x, y];
      } else if (type === 'C' && nums.length === 6) {
        const [c1x, c1y, c2x, c2y, x, y] = nums;
        if (prev) {
          length += Math.hypot(x - prev[0], y - prev[1]);
        }
        prev = [x, y];
      }
    }
    return length;
  }

  // Konversi koordinat pointer ke koordinat SVG
  function getSvgCoords(e: React.PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorpt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const x = cursorpt.x / 1.5 + 100;
    const y = cursorpt.y / 1.5 + 100;
    return { x, y };
  }

  if (showInstructions) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center min-h-screen overflow-hidden bg-center bg-cover"
        style={{ backgroundImage: "url(/images/bg-level.png)" }}
      >
        {/* Overlay hitam transparan */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        {/* Pohon dekorasi kiri-kanan (bisa disesuaikan sesuai kebutuhan) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-8 h-12 rounded-full left-4 top-20 bg-amber-700"></div>
          <div className="absolute w-12 h-16 bg-green-600 rounded-full left-2 top-16"></div>
          <div className="absolute w-6 h-10 rounded-full right-8 top-24 bg-amber-600"></div>
          <div className="absolute w-10 bg-green-500 rounded-full right-6 top-20 h-14"></div>
        </div>
        {/* Modal box */}
        <div className="relative z-10 w-full max-w-2xl p-8 mx-4 bg-orange-500 shadow-2xl rounded-3xl flex flex-col items-center">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 w-full">
            <div className="px-6 py-2 text-lg font-bold text-white bg-red-500 rounded-full">PETUNJUK</div>
            <button
              onClick={startGame}
              className="flex items-center justify-center w-10 h-10 bg-yellow-400 rounded-full hover:bg-yellow-500"
              aria-label="Tutup"
            >
              <X className="w-6 h-6 text-amber-800" />
            </button>
          </div>
          {/* Content */}
          <div className="p-6 mb-6 bg-white rounded-2xl w-full flex flex-col items-center">
            {/* Visual example: SVG apel dengan path putus-putus */}
            <div className="flex items-center justify-center mb-4">
              <svg
                viewBox="0 0 600 600"
                className="w-32 h-32"
                style={{ background: 'none' }}
              >
                <g transform="scale(1.5) translate(-100, -100)">
                  {/* Apel garis putus-putus */}
                  <path
                    d={applePath}
                    stroke="#222"
                    strokeWidth={7}
                    fill="none"
                    strokeDasharray="12 10"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Batang apel */}
                  <path
                    d="M300,188 Q298,165 302,145"
                    stroke="#222"
                    strokeWidth={6}
                    fill="none"
                    strokeDasharray="12 10"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Daun */}
                  <path
                    d="M300,143 Q278,120 255,143 Q270,165 300,143"
                    stroke="#222"
                    strokeWidth={6}
                    fill="none"
                    strokeDasharray="12 10"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>
            <div className="p-4 text-center bg-yellow-100 rounded-xl w-full">
              <p className="text-lg font-bold text-amber-800">
                GERAKAN JARI MENGIKUTI GARIS PUTUS-PUTUS
              </p>
            </div>
          </div>
          {/* Start Button */}
          <button
            onClick={startGame}
            className="w-full max-w-sm mt-2 py-4 rounded-full bg-[#FF7F1F] text-white font-bold text-xl shadow-md hover:bg-[#FF9800] transition"
            style={{ boxShadow: '0 4px 0 #E65100', fontWeight: 700, fontSize: '1.2rem' }}
          >
            MULAI BERMAIN
          </button>
        </div>
      </div>
    );
  }

  // Render area game utama jika instruksi sudah ditutup
  if (showResults && !!stars) {
    // TypeScript: stars, endTime, startTime dijamin number di sini
    const safeStars = stars ?? 0;
    const safeEndTime = endTime ?? 0;
    const safeStartTime = startTime ?? 0;
    return (
      <div className="relative min-h-screen overflow-hidden bg-center bg-cover flex items-center justify-center" style={{ backgroundImage: "url(/images/bg-level.png)" }}>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md p-8 mx-4 bg-white border-4 border-orange-500 shadow-2xl rounded-3xl animate-slide-in">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="px-6 py-3 mb-4 text-xl font-bold text-white bg-teal-500 rounded-full">
                LEVEL 4 COMPLETE
              </div>
            </div>
            {/* Stars */}
            <div className="flex justify-center mb-6">
              {[1, 2, 3].map((star) => (
                <div
                  key={star}
                  className={`w-16 h-16 mx-2 ${star <= safeStars ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              ))}
            </div>
            {/* Message */}
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-3xl font-bold text-orange-600">GOOD JOB</h2>
              <p className="text-lg text-gray-600">
                Waktu: {endTime && startTime ? Math.round((safeEndTime - safeStartTime) / 1000) : '-'} detik
              </p>
              <p className="text-lg text-gray-600">
                Akurasi: {userPath ? Math.min(100, (estimatePathLength(userPath) / estimatePathLength(combinedPath) * 100)).toFixed(0) : '-'}%
              </p>
              <p className="text-lg text-gray-600">
                Kesalahan: 0
              </p>
            </div>
            {/* Next Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  onLevelComplete(safeStars, endTime && startTime ? (safeEndTime - safeStartTime) / 1000 : 0, 0);
                  onNextLevel();
                  // Reset state agar modal hilang dan siap main lagi
                  setShowResults(false);
                  setDrawing(false);
                  setUserPath("");
                  setCompleted(false);
                  setStartTime(null);
                  setEndTime(null);
                  setStars(null);
                }}
                className="px-8 py-3 mt-2 text-lg font-bold text-white bg-teal-500 rounded-full shadow hover:bg-teal-600 transition"
              >
                NEXT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render area game utama jika belum showResults
  return (
    <div className="relative min-h-screen overflow-hidden bg-center bg-cover flex items-center justify-center" style={{ backgroundImage: "url(/images/bg-level.png)" }}>
      {/* Header */}
      <div className="absolute top-6 left-0 w-full flex items-center justify-center z-20">
        <div className="relative w-full max-w-4xl flex items-center justify-between px-8">
          <button
            onClick={() => onNavigate("menu")}
            className="w-12 h-12 bg-yellow-200 border-4 border-white rounded-full shadow flex items-center justify-center hover:bg-yellow-300"
            style={{ marginRight: 12 }}
          >
            <Home className="w-7 h-7 text-orange-700" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <div className="px-8 py-2 bg-yellow-100 rounded-full shadow text-2xl font-bold text-orange-700 tracking-wide border-2 border-yellow-200">
              GAMBAR BUAH APEL!
            </div>
          </div>
          <button
            onClick={() => setShowInstructions(true)}
            className="w-12 h-12 bg-yellow-200 border-4 border-white rounded-full shadow flex items-center justify-center hover:bg-yellow-300"
            style={{ marginLeft: 12 }}
            aria-label="Petunjuk"
          >
            <Lightbulb className="w-7 h-7 text-orange-700" />
          </button>
        </div>
      </div>
      {/* White drawing area */}
      <div className="relative w-[95vw] max-w-4xl h-[70vh] bg-white rounded-[32px] shadow-2xl flex items-center justify-center mt-32">
        <svg
          ref={svgRef}
          viewBox="0 0 600 600"
          className="w-full h-full touch-none"
          style={{ touchAction: "none", aspectRatio: "1/1" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <g transform="scale(1.5) translate(-100, -100)">
            <path
              d={applePath}
              stroke="#222"
              strokeWidth={6}
              fill="none"
              strokeDasharray="12 10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Batang apel */}
            <path
              d="M300,188 Q298,165 302,145"
              stroke="#222"
              strokeWidth={6}
              fill="none"
              strokeDasharray="12 10"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Daun */}
            <path
              d="M300,143 Q278,120 255,143 Q270,165 300,143"
              stroke="#222"
              strokeWidth={6}
              fill="none"
              strokeDasharray="12 10"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={userPath}
              stroke="#e53e3e"
              strokeWidth={7}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default GameLevel4;