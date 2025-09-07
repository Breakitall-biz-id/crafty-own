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
  backgroundImage = "/images/bg-level.png",
  accuracy,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-center bg-cover"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md p-8 mx-4 bg-white border-4 border-orange-500 shadow-2xl rounded-3xl">
          <div className="mb-6 text-center">
            <div className="px-6 py-3 mb-4 text-xl font-bold text-white bg-teal-500 rounded-full">
              LEVEL {level} COMPLETE
            </div>
          </div>

          <div className="flex justify-center mb-6">
            {[1, 2, 3].map((star) => (
              <div
                key={star}
                className={`w-16 h-16 mx-2 ${
                  star <= stars ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            ))}
          </div>

          <div className="mb-6 text-center">
            <h2 className="mb-2 text-3xl font-bold text-orange-600">
              GOOD JOB
            </h2>
            <p className="text-lg text-gray-600">
              Waktu: {Math.round(timeElapsed / 1000)} detik
            </p>
            {accuracy !== undefined && (
              <p className="text-lg text-gray-600">Akurasi: {accuracy}%</p>
            )}
            <p className="text-lg text-gray-600">Kesalahan: {mistakes}%</p>
          </div>

          <div className="text-center">
            <button
              onClick={onNextLevel}
              className="px-12 py-4 text-xl font-bold text-white transition-all duration-200 transform bg-teal-500 rounded-full shadow-lg hover:bg-teal-600 hover:scale-105"
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
