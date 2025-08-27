import React from "react";
import { Screen } from "../types/GameTypes";
import { Download } from "lucide-react";

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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-200 to-yellow-200">
            <div className="bg-white rounded-3xl shadow-2xl border-8 border-orange-500 overflow-hidden w-[90%] max-w-4xl">
                {/* Header */}
                <div className="bg-cyan-600 text-white text-3xl font-bold py-3 text-center">
                    HASIL
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
                    {/* Kiri: Info pemain */}
                    <div className="flex-1 bg-yellow-100 rounded-2xl border-4 border-orange-300 shadow p-6 flex flex-col items-center justify-center">
                        <div className="text-xl font-bold text-orange-700 mb-3">
                            NAMA : {playerName || "Pemain"}
                        </div>
                        <div className="text-5xl font-extrabold text-red-600 flex items-center gap-2 mb-4">
                            {totalStars} <span className="text-yellow-400">★</span>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-bold text-lg shadow ${color}`}>
                            {title}
                        </div>
                    </div>

                    {/* Kanan: Gambar hasil */}
                    <div className="flex-1 bg-yellow-50 rounded-2xl border-4 border-orange-300 shadow p-4 relative">
                        <img
                            src="/images/apple-template.png"
                            alt="Hasil buah"
                            className="w-full h-auto"
                        />
                        <button
                            className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600 p-3 rounded-full shadow-lg border-4 border-white"
                            aria-label="Download hasil"
                        >
                            <Download className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Tombol kembali */}
                <div className="flex justify-center py-6">
                    <button
                        onClick={() => onNavigate("menu")}
                        className="px-8 py-3 bg-orange-500 text-white rounded-full font-bold text-lg shadow hover:bg-orange-600 transition"
                    >
                        Kembali ke Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultScreen;
