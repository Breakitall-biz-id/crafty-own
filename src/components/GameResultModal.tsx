import React from "react";

interface GameResultModalProps {
  isOpen: boolean;
  level: number;
  stars: number;
  timeElapsed: number;
  mistakes: number;
  onNextLevel: () => void;
  backgroundImage?: string;
  accuracy?: number;
}

const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  level,
  stars,
  timeElapsed,
  mistakes,
  onNextLevel,
  accuracy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      {/* Results Modal - centered above the game */}
      <div className="relative w-full max-w-sm mx-4">
        {/* Main Card - White background with orange border */}
        <div className="relative bg-white rounded-3xl shadow-2xl border-8 border-[#c63c03] p-8 pt-12">
          {/* Teal Header Badge - Banner Style */}
          <div className="absolute z-10 transform -translate-x-1/2 -top-8 left-1/2 w-80">
            <div className="relative bg-[#008c9b] text-white rounded-3xl shadow-lg overflow-hidden">
              {/* Main banner content */}
              <div className="px-4 py-2 text-center">
                <div className="mb-1 text-xl font-bold">LEVEL {level}</div>
                <div className="text-xl font-black tracking-wide">
                  COMPLETE
                </div>
              </div>

              {/* Curved sides */}
              <div className="absolute top-0 left-0 w-6 h-full">
                <div className="w-full h-full bg-[#008c9b] rounded-l-3xl"></div>
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-[#008c9b] rounded-full"></div>
              </div>

              <div className="absolute top-0 right-0 w-6 h-full">
                <div className="w-full h-full bg-[#008c9b] rounded-r-3xl"></div>
                <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-[#008c9b] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Stars Display */}
          <div className="flex items-center justify-center w-full mb-6 h-28">
            <div className="relative flex items-center justify-center h-24 w-60">
              {[1, 2, 3].map((star, index) => {
                // Create a more natural rainbow arc with centered positioning
                const positions = [
                  { x: -80, y: 28, rotate: -15 }, // Left star - lower and tilted
                  { x: 0, y: 0, rotate: 0 }, // Center star - highest (centered)
                  { x: 80, y: 28, rotate: 15 }, // Right star - lower and tilted
                ];

                const pos = positions[index];

                return (
                  <div
                    key={star}
                    className={`absolute w-20 h-20 transition-all duration-700 ${
                      star <= stars
                        ? "text-yellow-400 scale-110 animate-pulse"
                        : "text-gray-300 scale-90"
                    }`}
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotate}deg)`,
                      transformOrigin: "center",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full drop-shadow-lg"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GOOD JOB Text */}
          <div className="flex items-center justify-center w-full mb-4">
            <div className="text-[#c63c03] text-3xl font-black tracking-wide text-center">
              GOOD JOB
            </div>
          </div>

          {/* Game Stats */}
          <div className="mb-2 space-y-1 text-center">
            <p className="text-lg font-semibold text-gray-700">
              Waktu: {Math.round(timeElapsed / 1000)} detik
            </p>
            <p className="text-lg font-semibold text-gray-700">
              Kesalahan: {mistakes}%
            </p>
            {accuracy !== undefined && (
              <p className="text-lg font-semibold text-gray-700">
                Akurasi: {accuracy}%
              </p>
            )}
          </div>

          {/* Next Button - Positioned at bottom */}
          <div className="absolute transform -translate-x-1/2 -bottom-6 left-1/2">
            <button
              onClick={onNextLevel}
              className="bg-[#008c9b] hover:bg-[#007080] text-white text-xl font-black py-4 px-12 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameResultModal;
