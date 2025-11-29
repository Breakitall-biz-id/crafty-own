import React from "react";
import { Home } from "lucide-react";

interface PanduanScreenProps {
  onNavigate: (screen: string) => void;
}

export default function PanduanScreen({ onNavigate }: PanduanScreenProps) {
  return (
    <div className="flex flex-col w-screen overflow-hidden bg-gradient-to-br from-green-100 via-yellow-50 to-orange-100">
      {/* Content */}
      <div className="flex items-center justify-center flex-1 p-3">
        <div className="relative w-full h-full max-w-6xl bg-white shadow-xl rounded-2xl">
          {/* Title - Compact */}
          <div className="p-2 mb-3 text-center bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-t-2xl">
            <h2 className="text-xl font-bold text-red-700 md:text-2xl">
              Cara membuat papercraft apel
            </h2>
          </div>

          {/* Steps - Horizontal layout optimized for landscape */}
          <div className="flex justify-between h-[calc(100%-160px)] p-4 gap-3">
            {/* Step 1 - Gunting */}
            <div className="flex-1 p-3 text-center bg-yellow-100 rounded-xl">
              <div className="p-2 mb-2 rounded-lg bg-gradient-to-r from-orange-300 to-orange-400">
                <h3 className="text-sm font-bold text-gray-800 md:text-base">1. Gunting</h3>
              </div>
              <div className="flex items-center justify-center mb-2 bg-white rounded-lg h-[calc(100%-150px)] p-2">
                <img
                  src="/images/panduan/panduan-0.jpeg"
                  alt="Gunting"
                  className="object-contain w-full h-full"
                />
              </div>
              <p className="text-xs font-medium leading-tight text-gray-700 md:text-sm">
                Gunting bagian garis luar dari gambar papercraft apel
              </p>
            </div>

            {/* Step 2 - Lipat */}
            <div className="flex-1 p-3 text-center bg-yellow-100 rounded-xl">
              <div className="p-2 mb-2 rounded-lg bg-gradient-to-r from-orange-300 to-orange-400">
                <h3 className="text-sm font-bold text-gray-800 md:text-base">2. Lipat</h3>
              </div>
              <div className="flex items-center justify-center mb-2 bg-white rounded-lg h-[calc(100%-150px)] p-2">
               <img
                  src="/images/panduan/panduan-1.jpeg"
                  alt="Lipat"
                  className="object-contain w-full h-full"
                />
              </div>
              <p className="text-xs font-medium leading-tight text-gray-700 md:text-sm">
                Lipat bagian garis putus-putus pada papercraft yang sudah digunting
              </p>
            </div>

            {/* Step 3 - Lem */}
            <div className="flex-1 p-3 text-center bg-yellow-100 rounded-xl">
              <div className="p-2 mb-2 rounded-lg bg-gradient-to-r from-orange-300 to-orange-400">
                <h3 className="text-sm font-bold text-gray-800 md:text-base">3. Lem</h3>
              </div>
              <div className="flex items-center justify-center mb-2 bg-white rounded-lg h-[calc(100%-150px)] p-2">
                <img
                  src="/images/panduan/panduan-2.jpeg"
                  alt="Lem"
                  className="object-contain w-full h-full"
                />
              </div>
              <p className="text-xs font-medium leading-tight text-gray-700 md:text-sm">
                Beri lem di bagian yang tidak berwarna
              </p>
            </div>

            {/* Step 4 - Selesai */}
            <div className="flex-1 p-3 text-center bg-yellow-100 rounded-xl">
              <div className="p-2 mb-2 rounded-lg bg-gradient-to-r from-orange-300 to-orange-400">
                <h3 className="text-sm font-bold text-gray-800 md:text-base">4. Selesai</h3>
              </div>
              <div className="flex items-center justify-center mb-2 bg-white rounded-lg h-[calc(100%-150px)] p-2">
                <img
                  src="/images/panduan/panduan-4.jpeg"
                  alt="Selesai"
                  className="object-contain w-full h-full"
                />
              </div>
              <p className="text-xs font-medium leading-tight text-gray-700 md:text-sm">
                Tempel menjadi bentuk apel
              </p>
            </div>
          </div>

          {/* Home Button - Fixed at bottom */}
          <div className="absolute z-10 transform -translate-x-1/2 bottom-4 left-1/2">
            <button
              onClick={() => onNavigate("menu")}
              className="p-4 text-white transition-all transform rounded-full shadow-lg bg-gradient-to-r from-orange-400 to-yellow-400 hover:shadow-xl hover:scale-105"
            >
              <Home className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}