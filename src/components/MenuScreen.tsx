import React from 'react';
import { Sparkles } from 'lucide-react';
import { Screen } from '../types/GameTypes';

interface MenuScreenProps {
  onNavigate: (screen: Screen) => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-300 via-green-200 to-green-300">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Rolling hills */}
        <div className="absolute bottom-0 left-0 w-full h-1/2">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-green-400 rounded-t-full transform -rotate-1"></div>
          <div className="absolute bottom-4 left-1/4 w-3/4 h-24 bg-green-500 rounded-t-full transform rotate-2"></div>
          <div className="absolute bottom-8 right-1/4 w-1/2 h-20 bg-green-600 rounded-t-full transform -rotate-1"></div>
        </div>

        {/* Trees on hills */}
        <div className="absolute left-4 bottom-20 w-8 h-12 bg-amber-700 rounded-full"></div>
        <div className="absolute left-2 bottom-16 w-12 h-16 bg-green-600 rounded-full"></div>
        
        <div className="absolute right-8 bottom-24 w-6 h-10 bg-amber-600 rounded-full"></div>
        <div className="absolute right-6 bottom-20 w-10 h-14 bg-green-500 rounded-full"></div>

        {/* Clouds */}
        <div className="absolute top-8 left-1/4 w-20 h-10 bg-white bg-opacity-80 rounded-full"></div>
        <div className="absolute top-12 right-1/3 w-24 h-12 bg-white bg-opacity-70 rounded-full"></div>
        <div className="absolute top-4 right-1/4 w-16 h-8 bg-white bg-opacity-90 rounded-full"></div>

        {/* Sparkles in sky */}
        <Sparkles className="absolute top-16 left-1/3 w-6 h-6 text-yellow-400 animate-pulse" />
        <Sparkles className="absolute top-20 right-1/2 w-4 h-4 text-yellow-300 animate-pulse delay-300" />
        <Sparkles className="absolute top-12 left-2/3 w-5 h-5 text-yellow-400 animate-pulse delay-500" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Menu Title */}
        <div className="mb-12 landscape:mb-8">
          <div className="bg-orange-500 text-white font-bold py-4 px-8 rounded-full text-2xl landscape:text-xl shadow-lg">
            MENU
          </div>
        </div>

        {/* Menu Options */}
        <div className="flex items-center justify-center gap-8 landscape:gap-6 landscape:scale-90 portrait:flex-col portrait:gap-12">
          {/* About Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onNavigate('about')}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full w-24 h-24 landscape:w-20 landscape:h-20 flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-200 active:scale-95 mb-3"
            >
              {/* Pineapple Icon */}
              <div className="relative">
                <div className="w-8 h-10 bg-yellow-400 rounded-lg"></div>
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex">
                    <div className="w-1 h-3 bg-green-500 rounded-t-full transform -rotate-12"></div>
                    <div className="w-1 h-3 bg-green-500 rounded-t-full"></div>
                    <div className="w-1 h-3 bg-green-500 rounded-t-full transform rotate-12"></div>
                  </div>
                </div>
                {/* Pineapple pattern */}
                <div className="absolute top-1 left-1 w-1 h-1 bg-yellow-600 rounded-full"></div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-600 rounded-full"></div>
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-600 rounded-full"></div>
                <div className="absolute top-5 left-1 w-1 h-1 bg-yellow-600 rounded-full"></div>
                <div className="absolute top-5 right-1 w-1 h-1 bg-yellow-600 rounded-full"></div>
              </div>
            </button>
            <span className="bg-yellow-400 text-amber-800 font-bold py-2 px-4 rounded-full text-sm">
              Tentang
            </span>
          </div>

          {/* Play Button (Center, Larger) */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onNavigate('nameInput')}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full w-32 h-32 landscape:w-28 landscape:h-28 flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-200 active:scale-95 mb-3"
            >
              {/* Basket with fruits */}
              <div className="relative">
                <div className="w-12 h-8 bg-amber-600 rounded-b-full"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-amber-700 rounded-full"></div>
                {/* Fruits in basket */}
                <div className="absolute -top-2 left-2 w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="absolute -top-3 left-4 w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="absolute -top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
                {/* Basket handle */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-8 h-4 border-2 border-amber-700 rounded-t-full bg-transparent"></div>
              </div>
            </button>
            <span className="bg-orange-500 text-white font-bold py-3 px-6 rounded-full text-lg">
              MAINKAN
            </span>
          </div>

          {/* Profile Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onNavigate('profile')}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full w-24 h-24 landscape:w-20 landscape:h-20 flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-200 active:scale-95 mb-3"
            >
              {/* Carrot Icon */}
              <div className="relative">
                <div className="w-3 h-8 bg-orange-500 rounded-b-full"></div>
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex">
                    <div className="w-1 h-3 bg-green-500 rounded-t-full transform -rotate-30"></div>
                    <div className="w-1 h-3 bg-green-500 rounded-t-full"></div>
                    <div className="w-1 h-3 bg-green-500 rounded-t-full transform rotate-30"></div>
                  </div>
                </div>
                {/* Carrot lines */}
                <div className="absolute top-2 left-0 right-0 h-px bg-orange-600"></div>
                <div className="absolute top-4 left-0 right-0 h-px bg-orange-600"></div>
                <div className="absolute top-6 left-0 right-0 h-px bg-orange-600"></div>
              </div>
            </button>
            <span className="bg-blue-400 text-white font-bold py-2 px-4 rounded-full text-sm">
              Profil
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;