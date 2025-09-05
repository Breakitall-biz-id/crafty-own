
import React, { useRef, useState, useEffect } from "react";
import { useSound } from "../hooks/useSound";
import { Screen } from "../types/GameTypes";


interface GameLevel4Props {
  onNavigate: (screen: Screen) => void;
  onLevelComplete: (stars: number, timeElapsed: number, mistakes: number) => void;
  onNextLevel: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  playerName: string;
}


const applePath = [
  "M106.454 82.3906 C102.454 67.3906 70.9537 40.3903 27.9538 76.3905 C-15.0462 112.391 2.95378 176.891 16.9538 192.891 C30.9537 208.891 45.9538 221.176 62.4537 225.891 C83.4537 231.891 90.4538 230.391 106.954 222.391",
  "M106.954 222.391 C118.454 231.391 150.454 231.885 169.954 216.891 C189.454 201.896 197.25 197.02 205.954 177.891 C212.324 163.891 224.954 112.891 185.954 75.8906 C146.954 38.8905 112.454 74.8906 112.454 74.8906 C112.454 74.8906 108.954 61.3906 112.954 45.8906 C116.954 30.3906 127.454 22.8906 127.454 22.8906 C127.454 22.8906 126.954 13.3908 120.454 18.8906 C113.954 24.3904 109.954 27.3906 104.954 44.3906 C100.761 58.6472 106.954 82.3906 106.954 82.3906",
  "M102.954 40.3909 C102.954 40.3909 103.454 20.988 82.9537 7.89087 C62.4537 -5.20624 39.9537 4.39062 39.9537 4.39062 C39.9537 4.39062 42.4537 12.3908 47.9537 20.3907 C53.4537 28.3906 54.6469 29.1405 60.9537 33.3907 C83.9537 48.8906 103.954 46.8909 103.954 46.8909"
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
  const [showInstructions, setShowInstructions] = useState(false);
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
    setUserPath((prev) => prev ? `${prev} M${x},${y}` : `M${x},${y}`);
  };

  // Menggambar mengikuti pointer
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawing || completed) return;
    const { x, y } = getSvgCoords(e);
    setUserPath((prev) => prev + ` L${x},${y}`);
  };

  // Selesai menggambar (hanya stop drawing, penilaian dilakukan manual)
  const handlePointerUp = () => {
    if (!drawing) return;
    setDrawing(false);
    setEndTime(Date.now());
  };

  // Tombol selesai: lakukan penilaian
  const handleFinishDrawing = () => {
    if (completed || !userPath) return;
    const finishTime = endTime ?? Date.now();
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

    // Gunakan SVGPoint untuk konversi yang akurat
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    // Transform ke koordinat SVG
    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return { x: 0, y: 0 };

    const cursorpt = pt.matrixTransform(screenCTM.inverse());

    // Karena grup memiliki transform="scale(1.5) translate(100, 40)"
    // Order: scale dulu (1.5), lalu translate (100, 40)
    // Untuk balik: translate dulu, lalu scale
    const x = (cursorpt.x / 1.5) - 100;
    const y = (cursorpt.y / 1.5) - 40;

    return { x, y };
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
      {/* White drawing area */}
      <div className="relative w-[95vw] max-w-4xl h-[85vh] bg-white rounded-[32px] shadow-2xl flex flex-col items-center justify-center mt-0">
        <div className="absolute top-6 left-0 w-full flex items-center justify-center z-20">
          <div className="relative w-full max-w-4xl flex items-center justify-between px-8">
            <button
              onClick={() => onNavigate("menu")}
              className="p-0 m-0 flex items-center justify-center"
              style={{ marginRight: 12, background: 'none', border: 'none', boxShadow: 'none' }}
            >
              <img src="/images/home-icon.png" alt="Home" className="w-20 h-20" />
            </button>
            <div className="flex-1 flex items-center justify-center">
              <div
                className="px-8 py-2 rounded-full shadow text-2xl font-bold tracking-wide border-2 border-yellow-200"
                style={{ background: '#fbf6a6', color: '#e37631' }}
              >
                GAMBAR BUAH APEL!
              </div>
            </div>
            <button
              onClick={() => setShowInstructions(true)}
              className="p-0 m-0 flex items-center justify-center"
              style={{ marginLeft: 12, background: 'none', border: 'none', boxShadow: 'none' }}
              aria-label="Petunjuk"
            >
              <img src="/images/instruction-icon.png" alt="Instruction" className="w-20 h-20" />
            </button>
          </div>
        </div>
        <div className="flex w-full h-full items-center justify-center">
          <svg
            ref={svgRef}
            viewBox="0 0 600 600"
            className="w-full h-full touch-none mb-4"
            style={{ touchAction: "none", aspectRatio: "1/1", marginTop: '144px', maxWidth: '100%', maxHeight: '100%' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <g transform="scale(1.5) translate(100, 40)">
              <path
                d={applePath}
                stroke="#222"
                strokeWidth={6}
                fill="none"
                strokeDasharray="12 10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={userPath}
                stroke="#222"
                strokeWidth={7}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>
        {/* Tombol selesai, aktif jika user sudah menggambar minimal 30% dari path apel */}
        <button
          onClick={handleFinishDrawing}
          className="absolute bottom-6 px-8 py-4 rounded-full text-xl font-bold shadow bg-orange-500 text-white hover:bg-orange-600 transition"
        >
          SELESAI
        </button>
      </div>

      {/* Modal petunjuk overlay */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-3xl p-3 shadow-2xl max-w-lg w-full mx-4 relative" style={{ backgroundColor: '#c53c03' }}>
            {/* X icon di sudut kanan atas */}
            <img
              src="/images/x-icon.png"
              alt="Close"
              className="absolute top-4 right-4 w-20 h-20 cursor-pointer hover:scale-110 transition-transform z-10"
              onClick={() => setShowInstructions(false)}
            />
            <div className="text-white text-center py-3 rounded-t-3xl" style={{ backgroundColor: '#ce0e0a' }}>
              <h2 className="text-2xl font-bold">PETUNJUK</h2>
            </div>
            <div className="bg-white p-6 rounded-b-3xl">
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    viewBox="0 0 600 600"
                    className="w-48 h-48 mx-auto"
                    style={{ background: 'none' }}
                  >
                    <g transform="scale(2) translate(50, 30)">
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
                    </g>
                  </svg>
                </div>
                <div className="p-4 text-center rounded-xl" style={{ backgroundColor: '#ffe7b4' }}>
                  <p className="text-lg font-bold" style={{ color: '#9f4a1d' }}>
                    GERAKAN JARI MENGIKUTI GARIS PUTUS-PUTUS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default GameLevel4;