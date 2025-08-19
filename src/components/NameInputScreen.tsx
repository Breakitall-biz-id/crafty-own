import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { Screen } from '../types/GameTypes';

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
  const [playerName, setPlayerName] = useState('');
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
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-300 via-green-200 to-green-300">
      {/* Background Elements - Same as MenuScreen */}
      <div className="absolute inset-0">
        {/* Rolling hills */}
        <div className="absolute bottom-0 left-0 w-full h-1/2">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-green-400 rounded-t-full transform -rotate-1"></div>
          <div className="absolute bottom-4 left-1/4 w-3/4 h-24 bg-green-500 rounded-t-full transform rotate-2"></div>
          <div className="absolute bottom-8 right-1/4 w-1/2 h-20 bg-green-600 rounded-t-full transform -rotate-1"></div>
        </div>

        {/* Trees */}
        <div className="absolute left-4 bottom-20 w-8 h-12 bg-amber-700 rounded-full"></div>
        <div className="absolute left-2 bottom-16 w-12 h-16 bg-green-600 rounded-full"></div>
        
        <div className="absolute right-8 bottom-24 w-6 h-10 bg-amber-600 rounded-full"></div>
        <div className="absolute right-6 bottom-20 w-10 h-14 bg-green-500 rounded-full"></div>

        {/* Clouds */}
        <div className="absolute top-8 left-1/4 w-20 h-10 bg-white bg-opacity-80 rounded-full"></div>
        <div className="absolute top-12 right-1/3 w-24 h-12 bg-white bg-opacity-70 rounded-full"></div>
        <div className="absolute top-4 right-1/4 w-16 h-8 bg-white bg-opacity-90 rounded-full"></div>

        {/* Sparkles */}
        <div className="absolute top-16 left-1/3 w-6 h-6 text-yellow-400">
          <div className="w-full h-full bg-yellow-400 transform rotate-45 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 transform -rotate-45"></div>
        </div>
        <div className="absolute top-20 right-1/2 w-4 h-4 text-yellow-300">
          <div className="w-full h-full bg-yellow-300 transform rotate-45 animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-300 transform -rotate-45"></div>
        </div>
        <div className="absolute top-12 left-2/3 w-5 h-5 text-yellow-400">
          <div className="w-full h-full bg-yellow-400 transform rotate-45 animate-pulse delay-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 transform -rotate-45"></div>
        </div>
      </div>

      {/* Top Navigation */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('menu')}
          className="w-12 h-12 landscape:w-10 landscape:h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 landscape:w-5 landscape:h-5 text-amber-800" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onSoundToggle}
          className="w-12 h-12 landscape:w-10 landscape:h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-200 active:scale-95"
        >
          {soundEnabled ? (
            <Volume2 className="w-6 h-6 landscape:w-5 landscape:h-5 text-amber-800" />
          ) : (
            <VolumeX className="w-6 h-6 landscape:w-5 landscape:h-5 text-amber-800" />
          )}
        </button>
      </div>

      {/* Menu Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-orange-500 text-white font-bold py-3 px-6 landscape:py-2 landscape:px-4 rounded-full text-xl landscape:text-lg shadow-lg">
          MENU
        </div>
      </div>

      {/* Characters */}
      <div className="absolute bottom-8 left-8 landscape:left-4 landscape:bottom-4 z-10">
        {/* Male character */}
        <div className="relative scale-75 landscape:scale-50">
          <div className="w-20 h-24 bg-blue-500 rounded-lg relative">
            {/* Body */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-amber-200 rounded-full"></div>
            {/* Hat */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-14 h-3 bg-yellow-600 rounded-full"></div>
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-10 h-4 bg-yellow-500 rounded-t-full"></div>
            {/* Hair */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-10 h-6 bg-amber-800 rounded-t-full"></div>
            {/* Arms */}
            <div className="absolute top-2 -left-2 w-4 h-8 bg-amber-200 rounded-full transform -rotate-12"></div>
            <div className="absolute top-2 -right-2 w-4 h-8 bg-amber-200 rounded-full transform rotate-12"></div>
            {/* Legs */}
            <div className="absolute -bottom-6 left-2 w-3 h-8 bg-amber-600 rounded-full"></div>
            <div className="absolute -bottom-6 right-2 w-3 h-8 bg-amber-600 rounded-full"></div>
            {/* Gloves */}
            <div className="absolute top-8 -left-3 w-3 h-3 bg-red-600 rounded-full"></div>
            <div className="absolute top-8 -right-3 w-3 h-3 bg-red-600 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 landscape:right-4 landscape:bottom-4 z-10">
        {/* Female character */}
        <div className="relative scale-75 landscape:scale-50">
          <div className="w-20 h-24 bg-blue-500 rounded-lg relative">
            {/* Body */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-amber-100 rounded-full"></div>
            {/* Hat */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-14 h-3 bg-yellow-600 rounded-full"></div>
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-10 h-4 bg-yellow-500 rounded-t-full"></div>
            {/* Hair - longer */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-amber-700 rounded-t-full"></div>
            <div className="absolute -top-4 left-1/4 w-3 h-12 bg-amber-700 rounded-full"></div>
            <div className="absolute -top-4 right-1/4 w-3 h-12 bg-amber-700 rounded-full"></div>
            {/* Arms - waving */}
            <div className="absolute top-0 -left-3 w-4 h-8 bg-amber-100 rounded-full transform -rotate-45"></div>
            <div className="absolute top-2 -right-2 w-4 h-8 bg-amber-100 rounded-full transform rotate-45"></div>
            {/* Legs */}
            <div className="absolute -bottom-6 left-2 w-3 h-8 bg-amber-600 rounded-full"></div>
            <div className="absolute -bottom-6 right-2 w-3 h-8 bg-amber-600 rounded-full"></div>
            {/* Basket */}
            <div className="absolute top-6 -right-4 w-6 h-4 bg-amber-600 rounded-b-full"></div>
            <div className="absolute top-5 -right-4 w-6 h-1 bg-amber-700 rounded-full"></div>
            <div className="absolute top-4 -right-3 w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="absolute top-4 -right-5 w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Modal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className={`bg-orange-500 rounded-3xl p-8 landscape:p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 ${
          isShaking ? 'animate-bounce' : ''
        }`}>
          {/* Modal Header */}
          <div className="text-center mb-6 landscape:mb-4">
            <h2 className="text-white font-bold text-2xl landscape:text-xl mb-2">
              SIAPA NAMAMU?
            </h2>
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
              className="w-full bg-white rounded-full py-4 landscape:py-3 px-6 landscape:px-4 text-center text-orange-500 font-bold text-lg landscape:text-base placeholder-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-200"
              autoFocus
            />
          </div>

          {/* Instructions */}
          <div className="text-center mb-6 landscape:mb-4">
            <p className="text-white font-bold text-sm landscape:text-xs leading-relaxed">
              TOLONG KETIK NAMAMU UNTUK MEMULAI PERMAINAN
            </p>
          </div>

          {/* Next Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={playerName.trim().length < 2}
              className={`font-bold py-4 landscape:py-3 px-12 landscape:px-8 rounded-full text-xl landscape:text-lg shadow-lg transform transition-all duration-200 ${
                playerName.trim().length >= 2
                  ? 'bg-orange-600 hover:bg-orange-700 text-white hover:scale-105 active:scale-95'
                  : 'bg-orange-300 text-orange-100 cursor-not-allowed'
              }`}
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameInputScreen;