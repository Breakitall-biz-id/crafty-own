import React from "react";
import { Screen } from "../types/GameTypes";

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
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
        <div className="w-full max-w-4xl p-6 bg-white border-8 border-orange-700 shadow-2xl rounded-3xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <div
              className="inline-block px-6 py-3 text-3xl font-bold text-white bg-blue-500 shadow-lg rounded-2xl"
              style={{
                transform: "perspective(300px) rotateX(15deg)",
                transformStyle: "preserve-3d",
              }}
            >
              Profil
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="flex items-center gap-14">
            {/* Developer Photo */}
            <div className="flex-shrink-0 ml-6">
              <div className="flex items-center justify-center w-40 h-40 overflow-hidden bg-blue-100 border-4 border-blue-300 rounded-full shadow-lg">
                <img
                  src="/images/profile/foto.jpeg"
                  alt="Alflonita LuthfiAnggrini"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="hidden text-6xl text-blue-400">👩‍🎓</div>
              </div>
            </div>

            {/* Developer Info */}
            <div className="flex-2">
              <div className="space-y-3 text-lg">
                <div>
                  <span className="font-bold text-gray-800">Nama :</span>
                  <span className="ml-3 text-gray-700">Intan Nur Rahma</span>
                </div>
                
                <div>
                  <span className="font-bold text-gray-800">Universitas :</span>
                  <span className="ml-3 text-gray-700">Universitas Negeri Malang</span>
                </div>
                
                <div>
                  <span className="font-bold text-gray-800">Prodi :</span>
                  <span className="ml-3 text-gray-700">PG PAUD</span>
                </div>
                
                <div>
                  <span className="font-bold text-gray-800">Dosen Pembimbing:</span>
                  <div className="mt-2 ml-3 text-gray-700">
                    <div>- Dr.Pramono, S.Pd, M.Or</div>
                    <div>- Dr. Yudithia Dian Putra, M.Pd., M.M.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;