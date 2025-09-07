import React, { useState, useRef, useEffect } from "react";
import { useSound } from "../hooks/useSound";
import type { Screen } from "../types/GameTypes";
import InstructionModal from "./InstructionModal";
import BaseGameLayout from "./BaseGameLayout";
import GameResultModal from "./GameResultModal";

interface GameLevel5Props {
  onNavigate: (screen: Screen) => void;
  onSoundToggle: () => void;
  soundEnabled: boolean;
  setScreen: (screen: Screen) => void;
  playerName: string;
}

export default function GameLevel5({ onNavigate, soundEnabled }: GameLevel5Props) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [stars] = useState(3);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeTool, setActiveTool] = useState<"fill" | "draw" | "eraser">("fill");
  const [activeColor, setActiveColor] = useState("#dc2626");
  const [drawingPaths, setDrawingPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);

  // Color palette - hanya 3 warna sesuai gambar
  const colors = ["#dc2626", "#16a34a", "#92400e"]; // Merah, Hijau, Coklat

  // Apple areas for coloring - bentuk geometris seperti di gambar
  const [appleAreas, setAppleAreas] = useState([
    { id: "apple-body-left", path: "M 150 150 L 250 150 L 250 400 C 250 420 230 440 210 440 C 190 440 150 420 150 400 Z", fill: "transparent" },
    { id: "apple-body-right", path: "M 250 150 L 350 150 C 370 150 390 170 390 190 L 390 380 C 390 420 350 440 310 440 C 290 440 250 420 250 400 Z", fill: "transparent" },
    { id: "apple-stem-left", path: "M 180 110 C 180 100 190 90 200 90 C 210 90 220 100 220 110 L 220 150 L 180 150 Z", fill: "transparent" },
    { id: "apple-stem-right", path: "M 280 110 C 280 100 290 90 300 90 C 310 90 320 100 320 110 L 320 150 L 280 150 Z", fill: "transparent" },
    { id: "apple-leaf-left", path: "M 160 120 C 150 110 140 105 130 110 C 125 115 130 125 140 130 L 170 140 Z", fill: "transparent" },
    { id: "apple-leaf-right", path: "M 340 120 C 350 110 360 105 370 110 C 375 115 370 125 360 130 L 330 140 Z", fill: "transparent" },
    { id: "apple-center", path: "M 220 180 C 240 160 260 160 280 180 L 280 350 C 280 370 250 390 250 390 C 250 390 220 370 220 350 Z", fill: "transparent" }
  ]);

  const sound = useSound(soundEnabled);

  // Timer effect
  useEffect(() => {
    let interval: number;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  // Check if game is complete
  useEffect(() => {
    const completedAreas = appleAreas.filter(area => area.fill && area.fill !== "transparent").length;
    
    if (completedAreas === appleAreas.length && gameStarted && !gameCompleted) {
      setGameCompleted(true);
      if (soundEnabled) sound.play("success");
      setTimeout(() => setShowResults(true), 800);
    }
  }, [appleAreas, gameStarted, gameCompleted, soundEnabled, sound]);

  const handleStart = () => {
    setGameStarted(true);
    setShowInstructions(false);
    if (soundEnabled) sound.play("start");
  };

  const isPointInsideAppleArea = (x: number, y: number): boolean => {
    return (x >= 130 && x <= 390 && y >= 90 && y <= 440);
  };

  const isPointInArea = (x: number, y: number, area: { id: string; path: string; fill: string }): boolean => {
    // Bounding box check untuk setiap area apel
    if (area.id === "apple-body-left") {
      return x >= 150 && x <= 250 && y >= 150 && y <= 440;
    } else if (area.id === "apple-body-right") {
      return x >= 250 && x <= 390 && y >= 150 && y <= 440;
    } else if (area.id === "apple-stem-left") {
      return x >= 180 && x <= 220 && y >= 90 && y <= 150;
    } else if (area.id === "apple-stem-right") {
      return x >= 280 && x <= 320 && y >= 90 && y <= 150;
    } else if (area.id === "apple-leaf-left") {
      return x >= 125 && x <= 175 && y >= 105 && y <= 145;
    } else if (area.id === "apple-leaf-right") {
      return x >= 325 && x <= 375 && y >= 105 && y <= 145;
    } else if (area.id === "apple-center") {
      return x >= 220 && x <= 280 && y >= 160 && y <= 390;
    }
    return false;
  };

  const fillAreaAtPosition = (x: number, y: number) => {
    for (let i = 0; i < appleAreas.length; i++) {
      const area = appleAreas[i];
      if (isPointInArea(x, y, area)) {
        if (area.fill !== activeColor) {
          setAppleAreas(prev => prev.map((a, index) => 
            index === i ? { ...a, fill: activeColor } : a
          ));
          if (soundEnabled) sound.play("match");
        }
        break;
      }
    }
  };

  const eraseAreaAtPosition = (x: number, y: number) => {
    for (let i = 0; i < appleAreas.length; i++) {
      const area = appleAreas[i];
      if (isPointInArea(x, y, area)) {
        if (area.fill !== "transparent") {
          setAppleAreas(prev => prev.map((a, index) => 
            index === i ? { ...a, fill: "transparent" } : a
          ));
        }
        break;
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 500;
    const y = ((e.clientY - rect.top) / rect.height) * 500;

    if (!isPointInsideAppleArea(x, y)) return;

    if (activeTool === "fill") {
      fillAreaAtPosition(x, y);
    } else if (activeTool === "draw") {
      setIsDrawing(true);
      setCurrentPath(`M ${x} ${y}`);
      setLastPoint({x, y});
    } else if (activeTool === "eraser") {
      eraseAreaAtPosition(x, y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || activeTool !== "draw") return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 500;
    const y = ((e.clientY - rect.top) / rect.height) * 500;

    if (!isPointInsideAppleArea(x, y)) return;

    if (lastPoint) {
      setCurrentPath(prev => prev + ` L ${x} ${y}`);
      setLastPoint({x, y});
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (activeTool === "draw" && currentPath) {
      setDrawingPaths(prev => [...prev, currentPath]);
      setCurrentPath("");
      if (soundEnabled) sound.play("match");
    }
    
    setLastPoint(null);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg || e.touches.length === 0) return;

    const rect = svg.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 500;
    const y = ((touch.clientY - rect.top) / rect.height) * 500;

    if (!isPointInsideAppleArea(x, y)) return;

    if (activeTool === "fill") {
      fillAreaAtPosition(x, y);
    } else if (activeTool === "draw") {
      setIsDrawing(true);
      setCurrentPath(`M ${x} ${y}`);
      setLastPoint({x, y});
    } else if (activeTool === "eraser") {
      eraseAreaAtPosition(x, y);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || activeTool !== "draw") return;

    const svg = svgRef.current;
    if (!svg || e.touches.length === 0) return;

    const rect = svg.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 500;
    const y = ((touch.clientY - rect.top) / rect.height) * 500;

    if (!isPointInsideAppleArea(x, y)) return;

    if (lastPoint) {
      setCurrentPath(prev => prev + ` L ${x} ${y}`);
      setLastPoint({x, y});
    }
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (activeTool === "draw" && currentPath) {
      setDrawingPaths(prev => [...prev, currentPath]);
      setCurrentPath("");
      if (soundEnabled) sound.play("match");
    }
    
    setLastPoint(null);
  };

  const handleRestart = () => {
    setAppleAreas(prev => prev.map(area => ({ ...area, fill: "transparent" })));
    setDrawingPaths([]);
    setCurrentPath("");
    setGameCompleted(false);
    setGameStarted(false);
    setShowInstructions(true);
    setShowResults(false);
    setTimeElapsed(0);
  };

  return (
    <>
      <BaseGameLayout
        title="Level 5: Mewarnai Apel"
        onNavigate={onNavigate}
        onShowInstructions={() => setShowInstructions(true)}
        backgroundImage="url('/images/IMG_20250724_015554.png')"
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative p-2 md:p-4 overflow-hidden">
          {/* Apple SVG - bentuk geometris sesuai gambar */}
          <div className="flex-1 flex items-center justify-center mb-2 md:mb-4 max-h-[60vh] md:max-h-none">
            <svg 
              ref={svgRef}
              viewBox="0 0 500 500" 
              className="w-[280px] h-[280px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px] bg-white rounded-lg shadow-lg cursor-crosshair select-none"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={() => setIsDrawing(false)}
              onTouchStart={handleCanvasTouchStart}
              onTouchMove={handleCanvasTouchMove}
              onTouchEnd={handleCanvasTouchEnd}
            >
              {/* Apple outline areas - bentuk geometris */}
              {appleAreas.map(area => (
                <path
                  key={area.id}
                  id={area.id}
                  d={area.path}
                  fill={area.fill}
                  stroke="#666"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  className="hover:stroke-orange-500 transition-colors"
                />
              ))}
              
              {/* Drawing paths - pensil coret-coret */}
              {drawingPaths.map((path, index) => (
                <path
                  key={index}
                  d={path}
                  fill="none"
                  stroke={activeColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              
              {/* Current drawing path */}
              {currentPath && (
                <path
                  d={currentPath}
                  fill="none"
                  stroke={activeColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>

          {/* Tool palette - posisi di bawah gambar untuk mobile landscape */}
          <div className="bg-yellow-200 rounded-2xl p-3 shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center gap-3 md:gap-4">
              {/* Color palette - 3 warna untuk mode fill area */}
              {colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveTool("fill"); // Mode fill area
                    setActiveColor(color);
                  }}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 md:border-3 transition-all ${
                    activeColor === color && activeTool === "fill" 
                      ? "border-gray-800 scale-110 shadow-lg" 
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  title="Warnai Area"
                />
              ))}
              
              {/* Pensil - untuk mode coret-coret */}
              <button
                onClick={() => setActiveTool("draw")}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 ${
                  activeTool === "draw" ? "bg-yellow-400 text-white border-yellow-500" : "bg-white border-gray-300"
                } flex items-center justify-center text-sm md:text-lg transition-all`}
                title="Pensil Coret-Coret"
              >
                ✏️
              </button>
              
              {/* Penghapus */}
              <button
                onClick={() => {
                  setActiveTool("eraser");
                  setDrawingPaths([]);
                  setCurrentPath("");
                }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 ${
                  activeTool === "eraser" ? "bg-blue-400 text-white border-blue-500" : "bg-white border-gray-300"
                } flex items-center justify-center text-sm md:text-lg transition-all`}
                title="Penghapus"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </BaseGameLayout>

      {/* Instruction Modal */}
      {showInstructions && (
        <InstructionModal
          isOpen={showInstructions}
          onClose={handleStart}
          title="Level 5: Mewarnai Apel"
          imageSrc="/images/IMG_20250724_015554.png"
          description="Warnai seluruh area apel dengan 3 warna yang tersedia. Klik warna untuk mewarnai per area, klik pensil untuk coret-coret bebas, atau gunakan penghapus untuk menghapus."
          showStartButton={true}
          startButtonText="Mulai Mewarnai"
        />
      )}

      {/* Game Result Modal */}
      {showResults && (
        <GameResultModal
          isOpen={showResults}
          level={5}
          stars={stars}
          timeElapsed={timeElapsed}
          mistakes={0}
          onNextLevel={handleRestart}
        />
      )}
    </>
  );
}
