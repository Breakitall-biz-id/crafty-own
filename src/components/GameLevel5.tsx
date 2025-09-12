import React, { useState, useRef, useEffect } from "react";
import { useSound } from "../hooks/useSound";
import type { Screen } from "../types/GameTypes";
import InstructionModal from "./InstructionModal";
import BaseGameLayout from "./BaseGameLayout";
import GameResultModal from "./GameResultModal";

interface GameLevel5Props {
  onNavigate: (screen: Screen) => void;
  onLevelComplete: (
    stars: number,
    timeElapsed: number,
    mistakes: number,
    completedArtwork?: string
  ) => void;
  onNextLevel: () => void;
  onSoundToggle: () => void;
  soundEnabled: boolean;
  setScreen: (screen: Screen) => void;
  playerName: string;
}

export default function GameLevel5({
  onNavigate,
  onLevelComplete,
  onNextLevel,
  soundEnabled,
}: GameLevel5Props) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [stars] = useState(3);

  const svgRef = useRef<SVGSVGElement>(null);
  const [activeTool, setActiveTool] = useState<"fill" | "draw" | "eraser">(
    "fill"
  );
  const [activeColor, setActiveColor] = useState("#dc2626");
  const [drawingPaths, setDrawingPaths] = useState<
    { path: string; color: string }[]
  >([]);
  const [currentPath, setCurrentPath] = useState("");
  const [currentPathColor, setCurrentPathColor] = useState("#dc2626");
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  // Bidang yang bisa diwarnai
  const paintableIds = React.useMemo(
    () => [
      "daun-kiri",
      "daun-kanan",
      "badan-1",
      "batang-kanan",
      "batang-kiri",
      "badan-3",
      "badan-4",
      "tangkai-kiri",
      "tangkai-kanan",
      "badan-2",
    ],
    []
  );

  const [fills, setFills] = useState<Record<string, string>>({});
  const sound = useSound(soundEnabled);

  // Fungsi untuk menyimpan hasil artwork sebagai SVG string
  const captureArtwork = (): string => {
    const svg = svgRef.current;
    if (!svg) return "";

    // Clone SVG untuk export
    const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute("width", "400");
    clonedSvg.setAttribute("height", "400");

    return new XMLSerializer().serializeToString(clonedSvg);
  };

  useEffect(() => {
    let interval: number;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    const allFilled = paintableIds.every(
      (id) => fills[id] && fills[id] !== "transparent"
    );
    if (allFilled) {
      setGameCompleted(true);
      if (soundEnabled) sound.play("success");
      setTimeout(() => setShowResults(true), 800);
    }
  }, [fills, gameStarted, gameCompleted, soundEnabled, sound, paintableIds]);

  const paint = (id: string) => {
    if (activeTool === "fill") {
      setFills((prev) => ({ ...prev, [id]: activeColor }));
      if (soundEnabled) sound.play("match");
    } else if (activeTool === "eraser") {
      setFills((prev) => ({ ...prev, [id]: "transparent" }));
    }
  };

  // Coretan bebas
  // Helper function untuk mendapatkan koordinat dari pointer event
  const getCoordinates = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return { x: 0, y: 0 };

    const svgPoint = pt.matrixTransform(screenCTM.inverse());

    return { x: svgPoint.x, y: svgPoint.y };
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (activeTool !== "draw") return;

    const svg = svgRef.current;
    if (!svg) return;

    // Capture pointer untuk memastikan events tetap diterima
    svg.setPointerCapture(e.pointerId);

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setCurrentPath(`M ${x} ${y}`);
    setCurrentPathColor(activeColor);
    setLastPoint({ x, y });

    // Prevent default untuk mencegah scrolling
    e.preventDefault();
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || activeTool !== "draw") return;

    const { x, y } = getCoordinates(e);
    if (lastPoint) {
      setCurrentPath((prev) => prev + ` L ${x} ${y}`);
      setLastPoint({ x, y });
    }

    e.preventDefault();
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (!isDrawing) return;

    const svg = svgRef.current;
    if (svg) {
      svg.releasePointerCapture(e.pointerId);
    }

    setIsDrawing(false);
    if (activeTool === "draw" && currentPath) {
      setDrawingPaths((prev) => [
        ...prev,
        { path: currentPath, color: currentPathColor },
      ]);
      setCurrentPath("");
      if (soundEnabled) sound.play("match");
    }
    setLastPoint(null);
  };

  const handleRestart = () => {
    setFills({});
    setDrawingPaths([]);
    setCurrentPath("");
    setGameCompleted(false);
    setGameStarted(false);
    setShowInstructions(true);
    setShowResults(false);
    setTimeElapsed(0);
  };
  const handleStart = () => {
    setGameStarted(true);
    setShowInstructions(false);
    if (soundEnabled) sound.play("start");
  };

  return (
    <>
      <BaseGameLayout
        title="Level 5: Mewarnai Papercraft"
        onNavigate={onNavigate}
        onShowInstructions={() => setShowInstructions(true)}
      >
        <div className="relative flex w-full h-full p-2 overflow-hidden md:p-4">
          {/* Toolbox */}
          <div className="flex flex-col items-center justify-center p-2 bg-yellow-200 shadow-lg rounded-xl mr-3 min-w-[60px]">
            <div className="flex flex-col items-center gap-2">
              {["#dc2626", "#16a34a", "#92400e"].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setActiveTool("fill");
                    setActiveColor(color);
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    activeColor === color && activeTool === "fill"
                      ? "border-gray-800 scale-110 shadow-lg"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                onClick={() => setActiveTool("draw")}
                className={`w-8 h-8 rounded-lg border-2 ${
                  activeTool === "draw"
                    ? "bg-yellow-400 text-white border-yellow-500"
                    : "bg-white border-gray-300"
                }`}
              >
                ✏️
              </button>
              <button
                onClick={() => {
                  setActiveTool("eraser");
                  setDrawingPaths([]); // Hapus semua coretan
                  setCurrentPath("");
                }}
                className={`w-8 h-8 rounded-lg border-2 ${
                  activeTool === "eraser"
                    ? "bg-blue-400 text-white border-blue-500"
                    : "bg-white border-gray-300"
                }`}
              >
                🗑️
              </button>
            </div>
          </div>

          {/* SVG */}
          <div className="flex items-center justify-center flex-1 p-2">
            <svg
              ref={svgRef}
              viewBox="0 0 437 324"
              preserveAspectRatio="xMidYMid meet"
              className="
                w-full h-auto 
                max-w-[80vw] max-h-[50vh] 
                bg-white rounded-lg shadow-lg select-none touch-none
              "
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={() => setIsDrawing(false)}
              style={{ touchAction: "none" }}
            >
              {/* === Bidang bisa diwarnai === */}
              <g id="faces" stroke="#333" strokeWidth={1.5} fillRule="evenodd">
                <path
                  id="daun-kiri"
                  d="M56 60.4086C36.663 66.0062 22.6667 82.7419 19 92.9086L21 96.4086C22.5 99.4088 26.5 103.608 48.5 96.4084C70.5 89.2084 82.6667 66.7418 86 56.4086C87.5 55.9086 75 54.9086 56 60.4086Z"
                  fill={fills["daun-kiri"] ?? "transparent"}
                  onPointerDown={() => paint("daun-kiri")}
                />
                <path
                  id="daun-kanan"
                  d="M228.5 4.50005C214.1 4.10005 195.167 14 187.5 19C195.667 23.5 210 33.5 228.5 34C246.022 34.4736 258 27.8333 264.5 24C265.5 24 266 15.5 264.5 14C260.964 10.4645 246.5 5.00005 228.5 4.50005Z"
                  fill={fills["daun-kanan"] ?? "transparent"}
                  onPointerDown={() => paint("daun-kanan")}
                />
                <path
                  id="badan-1"
                  d="M42 131L45.5 132.533L118 162.5L157.5 245.5L156 303.5L146 309L93 289.5L31.5 218.5L33 137.5"
                  fill={fills["badan-1"] ?? "transparent"}
                  onPointerDown={() => paint("badan-1")}
                />
                <path
                  id="batang-kanan"
                  d="M277.5 0.5L266 1L265.5 61.5H276.5L277.5 0.5Z"
                  fill={fills["batang-kanan"] ?? "transparent"}
                  onPointerDown={() => paint("batang-kanan")}
                />
                <path
                  id="batang-kiri"
                  d="M1 87C1 87 6.79002 83.3431 10.5 81M1 87L26.5 127.5L33 137.5L42 131L10.5 81M1 87L10.5 81"
                  fill={fills["batang-kiri"] ?? "transparent"}
                  onPointerDown={() => paint("batang-kiri")}
                />
                <path
                  id="badan-3"
                  d="M265.5 61.5L220 127.5L231.5 222L263.5 266.5L274.5 267.5L308.5 220.5L321.5 127.5L276.5 61.5H265.5Z"
                  fill={fills["badan-3"] ?? "transparent"}
                  onPointerDown={() => paint("badan-3")}
                />
                <path
                  id="badan-4"
                  d="M344.5 109L323.5 102.5L322 128L309 221.5L319 271L349 278.5L381.5 243.5L406.5 236L434.5 180L425 157.5L436 135L413.5 128V82.5L369.5 71L344.5 109Z"
                  fill={fills["badan-4"] ?? "transparent"}
                  onPointerDown={() => paint("badan-4")}
                />
                <path
                  id="tangkai-kiri"
                  d="M156 303.5L146 309L150 323L166.5 314L156 303.5Z"
                  fill={fills["tangkai-kiri"] ?? "transparent"}
                  onPointerDown={() => paint("tangkai-kiri")}
                />
                <path
                  id="tangkai-kanan"
                  d="M259 280L263.5 266.5L274.5 267.5L277.5 282L259 280Z"
                  fill={fills["tangkai-kanan"] ?? "transparent"}
                  onPointerDown={() => paint("tangkai-kanan")}
                />
                <path
                  id="badan-2"
                  d="M168 72.5L125 88L125.5 132.5L106.5 138.5L158 245.5L194.5 281.5L223.5 271.5L231.5 222.5L216.5 103.5L193 111L168 72.5Z"
                  fill={fills["badan-2"] ?? "transparent"}
                  onPointerDown={() => paint("badan-2")}
                />
              </g>

              {/* === Mata (dekorasi) === */}
              <g id="mata" pointerEvents="none">
                <path
                  d="M254.5 154.5C260.519 154.5 265.5 160.037 265.5 167C265.5 173.963 260.519 179.5 254.5 179.5C248.481 179.5 243.5 173.963 243.5 167C243.5 160.037 248.481 154.5 254.5 154.5Z"
                  fill="white"
                  stroke="#535151"
                />
                <path
                  d="M257.5 176C261.09 176 264 172.642 264 168.5C264 164.358 261.09 161 257.5 161C253.91 161 251 164.358 251 168.5C251 172.642 253.91 176 257.5 176Z"
                  fill="#272222"
                />
                <path
                  d="M286.5 153.5C292.519 153.5 297.5 159.037 297.5 166C297.5 172.963 292.519 178.5 286.5 178.5C280.481 178.5 275.5 172.963 275.5 166C275.5 159.037 280.481 153.5 286.5 153.5Z"
                  fill="white"
                  stroke="#535151"
                />
                <path
                  d="M283.5 175C287.09 175 290 171.642 290 167.5C290 163.358 287.09 160 283.5 160C279.91 160 277 163.358 277 167.5C277 171.642 279.91 175 283.5 175Z"
                  fill="#272222"
                />
              </g>

              {/* === Garis lipatan (non-interaktif) === */}
              <g
                id="lipatan"
                stroke="#46474B"
                strokeWidth={1}
                strokeDasharray="4 4"
                pointerEvents="none"
              >
                <path d="M35 137.5L43 132" />
                <path d="M119.5 164L157 241.5" />
                <path d="M121 161L217 129.5" />
                <path d="M35 189.5L89 153.5" />
                <path d="M35.5 218.5L116.5 163.5" />
                <path d="M97 287.5L156.5 248.5" />
                <path d="M193.5 111.5L128.5 132" />
                <path d="M126.5 133.5L119.5 161.5" />
                <path d="M194.5 111.5L219.5 128" />
                <path d="M161.5 245.5L230 222.5" />
                <path d="M221 131.5L232.5 219.5" />
                <path d="M223 129H320.5" />
                <path d="M238.5 105H303.5" />
                <path d="M235 221H306" />
                <path d="M322.5 130.5L310 218" />
                <path d="M347.5 109.5L413.5 128.5" />
                <path d="M415 130L425.5 156.5" />
                <path d="M324 127.5L345 110" />
                <path d="M325 128.5L424.5 157" />
                <path d="M383 241.5L425 159" />
                <path d="M311 222L380.5 243.5" />
                <path d="M268 61.5H277" />
              </g>

              {/* === Coretan user === */}
              {drawingPaths.map((pathObj, index) => (
                <path
                  key={index}
                  d={pathObj.path}
                  fill="none"
                  stroke={pathObj.color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentPath && (
                <path
                  d={currentPath}
                  fill="none"
                  stroke={currentPathColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>

          <div className="flex items-center justify-center ml-3">
            <button
              onClick={() => {
                setGameCompleted(true);
                if (soundEnabled) sound.play("success");
                setTimeout(() => setShowResults(true), 800);
              }}
              className="w-12 h-12 text-white bg-green-500 rounded-full shadow-lg hover:bg-green-600"
            >
              ✓
            </button>
          </div>
        </div>
      </BaseGameLayout>

      {showInstructions && (
        <InstructionModal
          isOpen={showInstructions}
          onClose={handleStart}
          title="Level 5: Mewarnai Papercraft"
          imageSrc="/images/petunjuk/level5.png"
          description="Warnai semua bagian papercraft dengan 3 warna. Garis lipatan hanya petunjuk, tidak bisa diwarnai."
        />
      )}

      {showResults && (
        <GameResultModal
          isOpen={showResults}
          level={5}
          stars={stars}
          timeElapsed={timeElapsed}
          mistakes={0}
          onNextLevel={() => {
            // Capture artwork sebelum navigasi
            const artworkSvg = captureArtwork();

            // Kirim data ke parent component
            onLevelComplete(stars, timeElapsed, 0, artworkSvg);

            // Navigasi ke ResultScreen
            onNextLevel();
          }}
        />
      )}
    </>
  );
}
