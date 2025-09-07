import React from "react";

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageSrc: string;
  description: string;
  showStartButton?: boolean;
  startButtonText?: string;
}

const InstructionModal: React.FC<InstructionModalProps> = ({
  isOpen,
  onClose,
  title,
  imageSrc,
  description,
  showStartButton = false,
  startButtonText = "MULAI BERMAIN",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md mx-4 bg-white border-[15px] border-orange-700 shadow-2xl rounded-3xl">
        {/* Header */}
        <div className="relative px-6 py-1 font-bold text-center text-white rounded-t-3xl">
          <span
            className="relative p-4 text-2xl bg-red-700 -top-5 landscape:text-lg rounded-2xl"
            style={{
              transform: "perspective(300px) rotateX(15deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {title}
          </span>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute flex items-center justify-center transition-all duration-200 transform -translate-y-1/2 bg-yellow-400 border-2 border-yellow-300 rounded-full shadow-lg w-18 h-18 -right-4 top-1 hover:bg-yellow-500 hover:scale-105 active:scale-95"
          >
            <img src="/images/x-icon.png" alt="Close" className="w-16 h-16" />
          </button>
        </div>

        {/* Content */}
        <div className="">
          {/* Illustration */}
          <div className="flex justify-center">
            <div className="">
              <img
                src={imageSrc}
                alt="Instruction"
                className="object-contain w-64 h-64 mx-auto landscape:w-56 landscape:h-56"
              />
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-yellow-200 border-2 border-yellow-300 rounded-xl landscape:p-3">
            <p className="font-bold leading-relaxed text-center text-md text-amber-800 landscape:text-xs">
              {description}
            </p>
          </div>

          {/* Start Button */}
          {showStartButton && (
            <div className="mt-6 text-center landscape:mt-4">
              <button
                onClick={onClose}
                className="px-12 py-4 text-xl font-bold text-white transition-all duration-200 transform bg-orange-600 border-4 border-orange-500 shadow-lg hover:bg-orange-700 landscape:py-3 landscape:px-8 rounded-2xl landscape:text-lg hover:scale-105 active:scale-95"
                style={{
                  transform: "perspective(300px) rotateX(-10deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                {startButtonText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructionModal;
