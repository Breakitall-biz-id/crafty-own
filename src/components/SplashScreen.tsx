import React from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-green-200">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Trees on the left */}
        <div className="absolute left-0 top-0 w-32 h-full">
          <div className="absolute left-4 top-8 w-16 h-20 bg-amber-600 rounded-full transform -rotate-12"></div>
          <div className="absolute left-2 top-4 w-20 h-24 bg-green-500 rounded-full"></div>
          {/* Mangoes */}
          <div className="absolute left-6 top-12 w-4 h-5 bg-yellow-400 rounded-full transform rotate-45"></div>
          <div className="absolute left-10 top-8 w-4 h-5 bg-yellow-400 rounded-full transform -rotate-12"></div>
          <div className="absolute left-8 top-16 w-4 h-5 bg-yellow-400 rounded-full"></div>
        </div>

        {/* Trees on the right */}
        <div className="absolute right-0 top-0 w-32 h-full">
          <div className="absolute right-4 top-6 w-16 h-20 bg-amber-700 rounded-full transform rotate-12"></div>
          <div className="absolute right-2 top-2 w-20 h-24 bg-green-600 rounded-full"></div>
          {/* Apples */}
          <div className="absolute right-6 top-10 w-4 h-4 bg-red-500 rounded-full"></div>
          <div className="absolute right-10 top-6 w-4 h-4 bg-red-500 rounded-full"></div>
          <div className="absolute right-8 top-14 w-4 h-4 bg-red-500 rounded-full"></div>
          <div className="absolute right-12 top-18 w-4 h-4 bg-red-500 rounded-full"></div>
        </div>

        {/* Clouds */}
        <div className="absolute top-4 left-1/4 w-16 h-8 bg-white bg-opacity-80 rounded-full"></div>
        <div className="absolute top-8 right-1/3 w-20 h-10 bg-white bg-opacity-70 rounded-full"></div>
        <div className="absolute top-2 left-1/2 w-12 h-6 bg-white bg-opacity-90 rounded-full"></div>

        {/* Dragonflies */}
        <div className="absolute top-16 left-1/3 w-6 h-2 bg-orange-400 rounded-full transform rotate-45 animate-pulse"></div>
        <div className="absolute top-12 right-1/2 w-6 h-2 bg-orange-400 rounded-full transform -rotate-12 animate-pulse"></div>

        {/* Farm plots */}
        <div className="absolute bottom-20 left-1/4 w-24 h-8 bg-amber-800 rounded-lg transform perspective-1000 rotateX-45">
          <div className="flex justify-between items-center h-full px-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          </div>
        </div>

        <div className="absolute bottom-20 right-1/4 w-24 h-8 bg-amber-800 rounded-lg">
          <div className="flex justify-between items-center h-full px-2">
            <div className="w-2 h-4 bg-green-400 rounded-t-full"></div>
            <div className="w-2 h-4 bg-green-400 rounded-t-full"></div>
            <div className="w-2 h-4 bg-green-400 rounded-t-full"></div>
            <div className="w-2 h-4 bg-green-400 rounded-t-full"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Title with sparkles */}
        <div className="text-center mb-12 landscape:mb-8">
          <div className="relative inline-block">
            <Sparkles className="absolute -top-2 -left-2 w-6 h-6 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse delay-300" />
            <h1 className="text-6xl landscape:text-5xl portrait:text-7xl font-bold text-amber-600 drop-shadow-lg">
              CRAFTY
            </h1>
            <h1 className="text-6xl landscape:text-5xl portrait:text-7xl font-bold text-amber-700 drop-shadow-lg -mt-2">
              OWN
            </h1>
            <Sparkles className="absolute -bottom-2 left-1/2 w-5 h-5 text-yellow-400 animate-pulse delay-500" />
          </div>
        </div>

        {/* Characters */}
        <div className="flex items-end justify-center gap-8 mb-8 landscape:mb-6 landscape:scale-90">
          {/* Male character */}
          <div className="relative">
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

          {/* Female character */}
          <div className="relative">
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
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all duration-200 active:scale-95"
        >
          MULAI
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;