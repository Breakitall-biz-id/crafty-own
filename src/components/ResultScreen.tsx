import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Screen } from "../types/GameTypes";

interface ResultScreenProps {
    playerName: string;
    totalStars: number;
    onNavigate: (screen: Screen) => void;
}

const getTitle = (stars: number) => {
    if (stars >= 13) return { title: "JUARA BUAH HEBAT!", color: "bg-blue-500 text-white" };
    if (stars >= 9) return { title: "PETANI BUAH PINTAR!", color: "bg-green-500 text-white" };
    return { title: "SAHABAT BUAH BAIK!", color: "bg-lime-500 text-white" };
};

const ResultScreen: React.FC<ResultScreenProps> = ({ playerName, totalStars, onNavigate }) => {
    const { title, color } = getTitle(totalStars);

    const hasilBoxRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (hasilBoxRef.current) {
            setIsDownloading(true);
            await new Promise(r => setTimeout(r, 50)); // pastikan re-render
            const canvas = await html2canvas(hasilBoxRef.current, { backgroundColor: null });
            const link = document.createElement('a');
            const namaFile = `HASIL-${(playerName ? playerName.toUpperCase().replace(/\s+/g, "") : "PEMAIN")}.png`;
            link.download = namaFile;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setIsDownloading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-center bg-cover flex flex-col items-center justify-center" style={{ backgroundImage: 'url(/images/bg-level.png)' }}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>
            {/* Pohon dekorasi */}
            <div className="absolute inset-0 z-0">
                =            </div>
            <div
                ref={hasilBoxRef}
                className="relative z-10 bg-white rounded-[36px] shadow-2xl border-[12px] overflow-visible w-[95%] max-w-5xl mx-auto"
                style={{ borderColor: '#c63903', padding: '32px 32px 48px 32px' }}
            >
                {/* Tulisan HASIL melengkung dengan SVG arc */}
                {!isDownloading && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-20">
                        <svg width="400" height="200">
                            {/* Kotak biru rounded */}
                            <rect
                                x="80"
                                y="10"
                                rx="20"
                                ry="20"
                                width="240"
                                height="80"
                                fill="#028c9b"
                            />
                            {/* Teks di tengah kotak */}
                            <text
                                x="200"
                                y="60"
                                textAnchor="middle"
                                fontSize="36"
                                fontWeight="bold"
                                fill="white"
                            >
                                HASIL
                            </text>
                        </svg>
                    </div>
                )}


                <div className="flex flex-col md:flex-row items-start justify-center gap-4 md:gap-8">
                    {/* Kiri: Info pemain, kotak kuning */}
                    <div className="bg-[#fbf5a6] rounded-2xl shadow p-8 flex flex-col items-center justify-center w-[480px] min-h-[340px] relative">
                        <div
                            className="text-xl font-extrabold text-[60px] text-[#c43c05] mb-5 tracking-wider"
                            style={{
                                letterSpacing: 2,
                                WebkitTextStroke: '2px #c43c05',
                                WebkitTextFillColor: '#c43c05'
                            }}
                        >
                            NAMA : {(playerName ? playerName.toUpperCase() : "PEMAIN")}
                        </div>
                        <div className="text-7xl font-extrabold text-[#c43c05] flex items-center gap-2 mb-2">
                            {totalStars} <span className="text-yellow-400 text-7xl">★</span>
                        </div>
                        <div className="w-full flex justify-center mt-8">
                            <div
                                className="bg-[#028c9b] text-white font-extrabold text-2xl px-8 py-6 rounded-2xl shadow-xl flex items-center justify-center text-center"
                                style={{ minWidth: 260, letterSpacing: 1 }}
                            >
                                {title} {totalStars >= 13 ? '🎉' : totalStars >= 9 ? '🍎' : '🌱'}
                            </div>
                        </div>
                    </div>

                    {/* Kanan: SVG apel statis seperti di level 5, icon download kanan bawah */}
                    <div className="bg-white rounded-2xl border-[12px] border-[#fbf5a6] shadow p-8 flex flex-col items-center justify-center w-[480px] h-[260px] relative">
                        <img
                            src="/images/gameLevel5.png"
                            alt="Preview Game Level 5"
                            className="w-[400px] h-[340px] object-contain"
                        />
                    </div>
                    {/* Tombol download di pojok kanan bawah kotak utama */}
                    <img
                        src="/images/download.png"
                        alt="Download"
                        className="absolute right-4 bottom-4 w-16 h-16 z-20 cursor-pointer hover:scale-110 transition"
                        onClick={handleDownload}
                    />
                </div>
            </div>
        </div>
    );
};

export default ResultScreen;
