import React from "react";
import { Screen } from "../types/GameTypes";

interface AboutScreenProps {
  onNavigate: (screen: Screen) => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate }) => {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url(/images/bg-menu.png)" }}
    >
      {/* Top Navigation */}
      <div className="absolute z-20 flex items-center justify-between top-4 left-4 right-4">
        {/* Back Button */}
        <button
          onClick={() => onNavigate("menu")}
          className="flex items-center justify-center w-4 h-4 mt-10 ml-4 transition-all duration-200 transform bg-yellow-400 border-2 border-yellow-300 rounded-full shadow-lg landscape:w-14 landscape:h-14 hover:bg-yellow-500 hover:scale-105 active:scale-95"
        >
          <img
            src="/images/back-icon.png"
            alt="Back"
            className="w-4 h-4 landscape:w-12 landscape:h-12"
          />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-4xl p-8 bg-white border-8 border-orange-700 shadow-2xl rounded-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div
              className="inline-block px-8 py-4 text-3xl font-bold text-white bg-orange-500 shadow-lg rounded-2xl"
              style={{
                transform: "perspective(300px) rotateX(15deg)",
                transformStyle: "preserve-3d",
              }}
            >
              Tentang Aplikasi
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="flex items-center gap-12">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <img
                src="/images/apple-bucket.png"
                alt="Crafty Own"
                className="object-contain w-48 h-48"
              />
            </div>

            {/* App Description */}
            <div className="flex-1">
              <h2 className="mb-6 text-4xl font-bold text-orange-600">Crafty Own</h2>
              <div className="p-6 border-2 border-orange-200 bg-orange-50 rounded-xl">
                <p className="text-lg leading-relaxed text-gray-800">
                  Aplikasi game ini adalah game edukatif yang bertujuan untuk melatih motorik halus mereka. 
                  Melalui game interaktif, anak usia 5-6 tahun mampu mempraktikkan kemampuan motorik halusnya 
                  dengan tepat. Selain melatih motorik halus anak, game ini juga bisa sebagai salah satu 
                  hiburan anak yang memberikan edukasi untuk perkembangan anak.
                </p>
              </div>
        
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;