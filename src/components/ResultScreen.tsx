import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Screen } from "../types/GameTypes";
import { div } from "framer-motion/client";

interface ResultScreenProps {
  playerName: string;
  totalStars: number;
  onNavigate: (screen: Screen) => void;
  level5Artwork?: string;
}

const getTitle = (stars: number) => {
  if (stars >= 13) {
    return { title: "LUAR BIASA!", color: "#c43c05" };
  } else if (stars >= 9) {
    return { title: "HEBAT!", color: "#c43c05" };
  } else {
    return { title: "TERUS BERLATIH!", color: "#c43c05" };
  }
};

const ResultScreen: React.FC<ResultScreenProps> = ({
  playerName,
  totalStars,
  onNavigate,
  level5Artwork,
}) => {
  const { title, color } = getTitle(totalStars);

  const hasilBoxRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (hasilBoxRef.current) {
      setIsDownloading(true);
      await new Promise((r) => setTimeout(r, 50)); // pastikan re-render
      const canvas = await html2canvas(hasilBoxRef.current, {
        backgroundColor: null,
      });
      const link = document.createElement("a");
      const namaFile = `HASIL-${
        playerName ? playerName.toUpperCase().replace(/\s+/g, "") : "PEMAIN"
      }.png`;
      link.download = namaFile;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-center bg-cover"
      style={{ backgroundImage: "url(/images/bg-level.png)" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 z-0 bg-black bg-opacity-50"></div>
      {/* Pohon dekorasi */}
      <div className="absolute inset-0 z-0"></div>
      <div
        ref={hasilBoxRef}
        className="relative z-10 bg-white rounded-[36px] shadow-2xl border-[12px] overflow-visible w-[80%] max-w-5xl mx-auto"
        style={{ borderColor: "#c63903", padding: "32px 32px 48px 32px" }}
      >
        {/* Tulisan HASIL dengan Tailwind */}
          <div className="absolute z-20 -translate-x-1/2 -top-5 left-1/2">
            <div className="bg-[#028c9b] text-white font-bold text-4xl px-12 py-4 rounded-3xl shadow-xl">
              HASIL
            </div>
          </div>

        <div className="flex flex-row items-start justify-center gap-4 mt-10 md:gap-8">
          {/* Kiri: Info pemain, kotak kuning */}
          <div className="bg-[#fbf5a6] rounded-2xl shadow p-2 flex flex-col items-center justify-center w-[290px] min-h-[240px] relative">
            <div
              className="text-xl font-extrabold text-[60px] text-[#c43c05] mb-5 tracking-wider"
              style={{
                letterSpacing: 2,
                WebkitTextStroke: "2px #c43c05",
                WebkitTextFillColor: "#c43c05",
              }}
            >
              NAMA : {playerName ? playerName.toUpperCase() : "PEMAIN"}
            </div>
            <div className="text-4xl font-extrabold text-[#c43c05] flex items-center gap-2 mb-2">
              {totalStars} <span className="text-4xl text-yellow-400">★</span>
            </div>
            <div className="flex justify-center w-full mt-2">
              <div
                className="flex items-center justify-center px-3 py-1 text-xl font-extrabold text-center shadow-xl text-[#c43c05] rounded-2xl"
              >
                {title}{" "}
                {totalStars >= 13 ? "🎉" : totalStars >= 9 ? "🍎" : "🌱"}
              </div>
            </div>
          </div>

          {/* Kanan: Hasil artwork dari level 5 tanpa kotak pembungkus */}
          <div className="flex flex-col items-center justify-center w-[320px] h-[260px] relative">
            {level5Artwork ? (
              <div
                className="flex items-center justify-center w-full h-full"
                dangerouslySetInnerHTML={{ __html: level5Artwork }}
              />
            ) : (
              <img
                src="/images/gameLevel5.png"
                alt="Preview Game Level 5"
                className="w-[400px] h-[320px] object-contain"
              />
            )}
          </div>
          {/* Tombol download di pojok kanan bawah kotak utama */}
          {!isDownloading && (
            <>
            <img
            src="/images/download.png"
            alt="Download"
            className="absolute z-20 w-16 h-16 transition cursor-pointer right-4 bottom-4 hover:scale-110"
            onClick={handleDownload}
          />
            </>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
