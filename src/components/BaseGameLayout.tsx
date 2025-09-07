import React from "react";
import { Home, HelpCircle } from "lucide-react";
import { Screen } from "../types/GameTypes";

interface BaseGameLayoutProps {
  children: React.ReactNode;
  onNavigate: (screen: Screen) => void;
  onShowInstructions: () => void;
  title: string;
  backgroundImage?: string;
  gameAreaRef?: React.RefObject<HTMLDivElement>;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  touchAction?: string;
}

const BaseGameLayout: React.FC<BaseGameLayoutProps> = ({
  children,
  onNavigate,
  onShowInstructions,
  title,
  backgroundImage = "/images/bg-level.png",
  gameAreaRef,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onMouseDown,
  onTouchMove,
  onTouchEnd,
  onTouchStart,
  touchAction = "none",
}) => {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-center bg-cover"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Container utama dengan papan putih */}
      <div
        className="absolute inset-0 flex items-center justify-center px-3 top-12 landscape:top-8 md:top-20 md:px-6"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchStart={onTouchStart}
        style={{ touchAction, paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="relative w-full max-w-[1200px] h-[min(84vh,700px)] bg-white rounded-[28px] shadow-xl overflow-hidden">
          {/* Tombol navigasi di kiri dan kanan atas */}
          <div className="absolute z-20 flex items-center justify-between w-full px-5 pt-4">
            <button
              onClick={() => onNavigate("menu")}
              className="flex items-center justify-center transition-all duration-200 bg-yellow-400 rounded-full shadow-lg w-14 h-14 ring-2 ring-amber-300 hover:bg-yellow-500"
            >
            <img src="/images/home-icon.png" alt="Close" className="h-14 w-14" />
            </button>
            <button
              onClick={onShowInstructions}
              className="flex items-center justify-center transition-all duration-200 bg-yellow-400 rounded-full shadow-lg w-14 h-14 ring-2 ring-amber-300 hover:bg-yellow-500"
            >
            <img src="/images/instruction-icon.png" alt="Close" className="h-14 w-14" />
            </button>
          </div>

          {/* Banner judul */}
          <div className="absolute -translate-x-1/2 left-1/2 top-4">
            <div className="px-5 md:px-3 py-2.5 md:py-3 rounded-[26px] bg-amber-200 border-2 border-amber-300 shadow">
              <p className="font-extrabold tracking-wide text-center text-orange-600 text-md">
                {title}
              </p>
            </div>
          </div>

          {/* Area permainan */}
          <div ref={gameAreaRef} className="absolute inset-0 pt-16 md:pt-20">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseGameLayout;
