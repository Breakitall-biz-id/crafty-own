
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

  // Mulai menggambar
  const handlePointerDown = (e: React.PointerEvent) => {
    if (completed) return;
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

  // Efek: setelah reward tampil, lanjut ke level berikutnya setelah 1.5 detik
  useEffect(() => {
    if (!showResults || !stars) return;
    const t = setTimeout(() => {
      onLevelComplete(stars, endTime && startTime ? (endTime - startTime) / 1000 : 0, 0);
      onNextLevel();
    }, 1500);
    return () => clearTimeout(t);
  }, [showResults, stars, endTime, startTime, onLevelComplete, onNextLevel]);
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
        // Quadratic bezier: approx as straight line from prev to end
        const [cx, cy, x, y] = nums;
        if (prev) {
          length += Math.hypot(x - prev[0], y - prev[1]);
        }
        prev = [x, y];
      } else if (type === 'C' && nums.length === 6) {
        // Cubic bezier: approx as straight line from prev to end
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
    // Koreksi transformasi <g>: scale(1.5) dan translate(-100, -100)
    // Urutan transformasi: (x, y) -> (x - 100, y - 100) -> (x * 1.5, y * 1.5)
    // Maka inversenya: (x, y) -> (x / 1.5 + 100, y / 1.5 + 100)
    const x = cursorpt.x / 1.5 + 100;
    const y = cursorpt.y / 1.5 + 100;
    return { x, y };
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-center bg-cover flex items-center justify-center"
      style={{ backgroundImage: "url(/images/bg-level.png)" }}
    >
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
      {/* Modal Petunjuk */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative w-[370px] max-w-[95vw] rounded-2xl bg-white shadow-2xl flex flex-col items-center p-0 border-[10px] border-[#D3541B]">
            {/* PETUNJUK pill overlapping border */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-7 z-10">
              <div className="px-7 py-2 text-lg font-bold text-white bg-[#D32F2F] rounded-full shadow-lg tracking-wide border-4 border-white drop-shadow-lg" style={{ boxShadow: '0 4px 12px #0002' }}>PETUNJUK</div>
            </div>
            {/* Close button */}
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute right-3 top-3 w-10 h-10 flex items-center justify-center bg-[#FFD600] border-4 border-white rounded-full shadow-lg hover:bg-yellow-300"
              aria-label="Tutup"
              style={{ boxShadow: '0 2px 8px #0002' }}
            >
              <X className="w-7 h-7 text-[#D3541B]" />
            </button>
            {/* Content */}
            <div className="flex flex-col items-center w-full px-0 pb-8 pt-8">
              <div className="w-[90%] bg-white rounded-xl flex flex-col items-center py-4 px-2 mb-4 mt-2">
                {/* SVG apple, leaf, dashed, hand */}
                <svg width="120" height="110" viewBox="0 0 120 110" className="mb-2">
                  {/* Apple dashed */}
                  <path d="M60,90 C40,85 34,60 39,43 C42,31 53,28 59,39 Q60,36 61,39 C67,28 78,31 81,43 C86,60 80,85 60,90 Z" stroke="#222" strokeWidth="4" fill="none" strokeDasharray="10 8" />
                  {/* Leaf dashed */}
                  <path d="M60,28 Q54,22 49,28 Q52,34 60,28" stroke="#388E3C" strokeWidth="4" fill="none" strokeDasharray="7 7" />
                  {/* Hand (right, cartoon) */}
                  <g>
                    <path d="M85,70 Q95,80 85,90 Q75,100 65,90 Q55,80 65,70 Q75,60 85,70 Z" fill="#FFD180" stroke="#C97A00" strokeWidth="2" />
                    <rect x="75" y="85" width="10" height="15" rx="5" fill="#FFD180" stroke="#C97A00" strokeWidth="2" />
                  </g>
                </svg>
              </div>
              <div className="w-[90%] flex justify-center mt-2">
                <div className="bg-[#FFE9B0] rounded-full px-4 py-3 text-center w-full max-w-xs shadow text-[#A05A00] font-bold text-base border-2 border-[#FFE082]">
                  GERAKAN JARI MENGIKUTI GARIS PUTUS-PUTUS
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
        {showResults && stars && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-slide-in bg-yellow-200 rounded-lg px-6 py-4 shadow text-center font-bold text-lg">
              {stars === 3 && '⭐⭐⭐'}
              {stars === 2 && '⭐⭐'}
              {stars === 1 && '⭐'}
              <br />
              🎉 Hebat! Kamu berhasil menggambar apel!
              <br />
              <span className="text-base font-normal">Akurasi: {Math.min(100, (estimatePathLength(userPath) / estimatePathLength(combinedPath) * 100)).toFixed(0)}%<br />Waktu: {endTime && startTime ? ((endTime - startTime) / 1000).toFixed(1) : '-'} detik</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLevel4;