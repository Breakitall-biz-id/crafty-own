import React, { useState } from "react";
import { Screen } from "../types/GameTypes";

interface NameInputScreenProps {
  onNavigate: (screen: Screen) => void;
  onNameSubmit: (name: string) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

const NameInputScreen: React.FC<NameInputScreenProps> = ({
  onNavigate,
  onNameSubmit,
  soundEnabled,
  onSoundToggle,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = () => {
    const trimmedName = playerName.trim();
    if (trimmedName.length === 0) {
      // Shake animation for empty name
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    if (trimmedName.length < 2) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    onNameSubmit(trimmedName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url(/images/nameInput.png)" }}
    >
      {/* Top Navigation */}
      <div className="absolute z-20 flex items-center justify-between top-4 left-4 right-4">
        {/* Back Button */}
        <button
          onClick={() => onNavigate("menu")}
          className="flex items-center justify-center w-12 h-12 transition-all duration-200 transform bg-yellow-400 border-2 border-yellow-300 rounded-full shadow-lg landscape:w-20 landscape:h-20 hover:bg-yellow-500 hover:scale-105 active:scale-95"
        >
          <img
            src="/images/back-icon.png"
            alt="Back"
            className="w-6 h-6 landscape:w-16 landscape:h-16"
          />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onSoundToggle}
          className="flex items-center justify-center w-12 h-12 transition-all duration-200 transform bg-yellow-400 border-2 border-yellow-300 rounded-full shadow-lg landscape:w-20 landscape:h-20 hover:bg-yellow-500 hover:scale-105 active:scale-95"
        >
          <img
            src="/images/sound-icon.png"
            alt="Sound"
            className={`w-6 h-6 landscape:w-16 landscape:h-16 ${
              !soundEnabled ? "opacity-50" : ""
            }`}
          />
        </button>
      </div>

      {/* Menu Title */}
      <div className="absolute z-10 transform -translate-x-1/2 top-4 left-1/2">
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

      {/* Main Modal */}
      <div className="flex flex-col items-center mt-20">
        <div className="flex items-center justify-center px-4 min-h-52">
          <div
            className={`bg-orange-700 rounded-3xl p-2 landscape:p-2 landscape:px-4 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 border-2 border-orange-600 ${
              isShaking ? "animate-bounce" : ""
            }`}
          >
            {/* Modal Header */}
            <div className="mb-1 text-center landscape:mb-4">
              <div className="inline-block px-6 py-3 text-xl font-bold text-white bg-orange-500 shadow-lg rounded-2xl landscape:text-lg">
                SIAPA NAMAMU?
              </div>
            </div>

            {/* Input Field */}
            <div className="mb-6 landscape:mb-4">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="KETIK..."
                maxLength={20}
                className="w-full px-6 py-4 text-lg font-bold text-center text-orange-500 placeholder-orange-300 transition-all duration-200 bg-white border-2 border-orange-200 rounded-full landscape:py-3 landscape:px-4 landscape:text-base focus:outline-none focus:ring-4 focus:ring-orange-300"
                autoFocus
              />
            </div>

            {/* Instructions */}
            <div className="mb-6 text-center landscape:mb-4">
              <p className="text-xl font-bold leading-relaxed text-white landscape:text-lg">
                TOLONG KETIK NAMAMU UNTUK MEMULAI PERMAINAN
              </p>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="relative text-center -top-6">
          <button
            onClick={handleSubmit}
            disabled={playerName.trim().length < 2}
            className={`font-bold py-4 landscape:py-3 px-12 landscape:px-8 rounded-2xl text-xl landscape:text-lg shadow-lg transform transition-all duration-300 border-4 ${
              playerName.trim().length >= 2
                ? "bg-orange-600 hover:bg-orange-700 text-white hover:scale-105 active:scale-95 border-orange-500"
                : "bg-orange-600 text-orange-100 cursor-not-allowed border-orange-500"
            }`}
            style={
              playerName.trim().length >= 2
                ? {
                    transform: "perspective(300px) rotateX(-10deg)",
                    transformStyle: "preserve-3d",
                  }
                : {}
            }
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
};

export default NameInputScreen;
