import React from "react";
import { Screen } from "../types/GameTypes";

interface MenuScreenProps {
  onNavigate: (screen: Screen) => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onNavigate }) => {
  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url(/images/bg-menu.png)" }}
    >
      {/* Menu Title */}
      <div className="mb-8 landscape:mb-6">
        <div
          className="px-8 py-2 text-2xl font-bold text-white bg-orange-500 border-4 border-orange-400 shadow-lg rounded-2xl landscape:text-xl"
          style={{
            transform: "perspective(300px) rotateX(15deg)",
            transformStyle: "preserve-3d",
          }}
        >
          MENU
        </div>
      </div>

      {/* Menu Options */}
      <div className="flex items-center justify-center gap-8 landscape:gap-6 landscape:scale-90 portrait:flex-col portrait:gap-8">
        {/* About Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onNavigate("about")}
            className="flex items-center justify-center transition-all duration-200 transform bg-white border-4 border-white rounded-full shadow-xl bg-opacity-95 hover:bg-opacity-100 w-28 h-28 landscape:w-24 landscape:h-24 hover:scale-105 active:scale-95"
          >
            <img
              src="/images/fruits/pineapple.png"
              alt="Pineapple"
              className="object-contain w-16 h-16 landscape:w-20 landscape:h-20"
            />
          </button>
          <span className="relative px-6 py-1 text-sm font-bold bg-yellow-400 border-2 border-yellow-300 rounded-full shadow-lg -top-5 text-amber-800">
            Tentang
          </span>
        </div>

        {/* Play Button (Center, Larger) */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onNavigate("nameInput")}
            className="flex items-center justify-center w-40 h-40 transition-all duration-200 transform bg-white border-4 border-white rounded-full shadow-xl bg-opacity-95 hover:bg-opacity-100 landscape:w-40 landscape:h-40 hover:scale-105 active:scale-95"
          >
            <img
              src="/images/apple-bucket.png"
              alt="Apple Bucket"
              className="object-contain w-40 h-40 landscape:w-40 landscape:h-40"
            />
          </button>
          <span
            className="relative px-6 py-2 text-lg font-bold text-white bg-orange-500 border-4 border-orange-400 shadow-lg rounded-2xl -top-10"
            style={{
              transform: "perspective(300px) rotateX(-10deg)",
              transformStyle: "preserve-3d",
            }}
          >
            MAINKAN
          </span>
        </div>

        {/* Profile Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onNavigate("profile")}
            className="flex items-center justify-center transition-all duration-200 transform bg-white border-4 border-white rounded-full shadow-xl bg-opacity-95 hover:bg-opacity-100 w-28 h-28 landscape:w-24 landscape:h-24 hover:scale-105 active:scale-95"
          >
            <img
              src="/images/fruits/apple.png"
              alt="Apple"
              className="object-contain w-16 h-16 landscape:w-20 landscape:h-20"
            />
          </button>
          <span className="relative px-6 py-1 text-sm font-bold text-white bg-blue-400 border-2 border-blue-300 rounded-full shadow-lg -top-4">
            Profil
          </span>
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;
