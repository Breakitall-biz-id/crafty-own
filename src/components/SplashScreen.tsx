import React from "react";

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url(/images/first-page.png)" }}
    >
      {/* Content Container - hanya tombol mulai di tengah */}
      <div className="relative z-10 flex items-center justify-center mt-40">
        <button
          onClick={onStart}
          className="px-12 py-4 mt-10 text-xl font-bold text-white transition-all duration-200 transform bg-orange-500 border-4 border-white rounded-full shadow-lg hover:bg-orange-600 hover:scale-105 active:scale-95"
        >
          MULAI
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
