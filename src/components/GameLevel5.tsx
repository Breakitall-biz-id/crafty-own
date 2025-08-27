import React, { useState } from "react";
import { useSound } from "../hooks/useSound";
import { Screen } from "../types/GameTypes";
import { Home, Lightbulb, Volume2, VolumeX, X } from "lucide-react";
import { motion } from "framer-motion";

interface GameLevel5Props {
    onNavigate: (screen: Screen) => void;
    onLevelComplete: (stars: number, timeElapsed: number, mistakes: number) => void;
    onNextLevel: () => void;
    soundEnabled: boolean;
    onSoundToggle: () => void;
    playerName: string;
}

const GameLevel5: React.FC<GameLevel5Props> = ({
    onNavigate,
    onLevelComplete,
    onNextLevel,
    soundEnabled,
    onSoundToggle,
    playerName,
}) => {
    // Palet warna dan tools
    const colors = ["#e53935", "#43a047", "#8d6e63"];
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
    const [fills, setFills] = useState<{ [key: number]: string }>({});
    const [showHint, setShowHint] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [showResults, setShowResults] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [stars, setStars] = useState(3);
    const [overallAccuracy] = useState(100);
    const { play, stop, unlock } = useSound(soundEnabled);

    const handleFill = (id: number) => {
        if (tool === "eraser") {
            const newFills = { ...fills };
            delete newFills[id]; // hapus key -> balik default
            setFills(newFills);
        } else {
            setFills({ ...fills, [id]: selectedColor });
        }
        if (soundEnabled) play("match");
    };

    const startGame = async () => {
        if (soundEnabled) {
            try { await unlock(); } catch { }
            play("start");
            play("bgm");
        }
        setShowInstructions(false);
        setGameStarted(true);
        setStartTime(Date.now());
        setFills({});
        setMistakes(0);
        setStars(3);
        setGameCompleted(false);
        setShowResults(false);
    };

    const handleNextLevel = () => {
        if (soundEnabled) stop("bgm");
        setShowResults(false);
        setGameCompleted(false);
        onLevelComplete(stars, timeElapsed, mistakes);
        onNextLevel();
    };

    const finishGame = () => {
        if (soundEnabled) {
            play("complete");
            stop("bgm");
        }
        setTimeElapsed(Date.now() - startTime);
        setGameCompleted(true);
        setTimeout(() => setShowResults(true), 800);
    };

    // --- Modal Petunjuk ---
    if (showInstructions) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-center bg-cover" style={{ backgroundImage: "url(/images/bg-level.png)" }}>
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <div className="absolute z-20 flex items-center justify-between top-4 left-4 right-4">
                    <button onClick={() => onNavigate("menu")}
                        className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500">
                        <Home className="w-6 h-6 text-amber-800" />
                    </button>
                    <button onClick={onSoundToggle}
                        className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500">
                        {soundEnabled ? <Volume2 className="w-6 h-6 text-amber-800" /> : <VolumeX className="w-6 h-6 text-amber-800" />}
                    </button>
                </div>
                <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
                    <div className="w-full max-w-2xl p-8 mx-4 bg-orange-500 shadow-2xl rounded-3xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="px-6 py-2 text-lg font-bold text-white bg-red-500 rounded-full">PETUNJUK</div>
                            <button onClick={startGame} className="flex items-center justify-center w-10 h-10 bg-yellow-400 rounded-full hover:bg-yellow-500">
                                <X className="w-6 h-6 text-amber-800" />
                            </button>
                        </div>
                        <div className="p-6 mb-6 bg-white rounded-2xl">
                            {/* Preview persis SVG utama, tanpa interaksi dan fill transparan */}
                            <div className="flex items-center justify-center mb-4">
                                <svg viewBox="0 0 400 260" className="w-[380px] h-[240px]">
                                    <polygon points="200,40 260,70 320,120 300,200 200,220 100,200 80,120 140,70"
                                        fill="transparent" stroke="#888" strokeWidth={2} strokeDasharray="6 6" />
                                    <polygon points="140,70 200,120 260,70"
                                        fill="transparent" stroke="#888" strokeWidth={2} strokeDasharray="6 6" />
                                    <polygon points="200,120 200,220 300,200 320,120"
                                        fill="transparent" stroke="#888" strokeWidth={2} strokeDasharray="6 6" />
                                    <polygon points="200,120 200,220 100,200 80,120"
                                        fill="transparent" stroke="#888" strokeWidth={2} strokeDasharray="6 6" />
                                    {/* Daun */}
                                    <polygon points="120,30 140,70 200,40 180,20"
                                        fill="transparent" stroke="#888" strokeWidth={2} strokeDasharray="6 6" />
                                    <polygon points="280,30 260,70 200,40 220,20"
                                        fill="transparent" stroke="#888" strokeWidth={2} strokeDasharray="6 6" />
                                    {/* Mata */}
                                    <circle cx="185" cy="110" r="10" fill="#fff" stroke="#222" strokeWidth={2} />
                                    <circle cx="215" cy="110" r="10" fill="#fff" stroke="#222" strokeWidth={2} />
                                    <circle cx="188" cy="113" r="3" fill="#222" />
                                    <circle cx="218" cy="113" r="3" fill="#222" />
                                </svg>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className="w-7 h-7 rounded-full border-2 border-orange-400" style={{ background: colors[0] }} />
                                <div className="w-7 h-7 rounded-full border-2 border-orange-400" style={{ background: colors[1] }} />
                                <div className="w-7 h-7 rounded-full border-2 border-orange-400" style={{ background: colors[2] }} />
                                <div className="w-7 h-7 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center ml-2"><span role="img" aria-label="Pencil" className="text-lg">✏️</span></div>
                                <div className="w-7 h-7 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center"><span role="img" aria-label="Eraser" className="text-lg">🧽</span></div>
                            </div>
                            <div className="p-4 text-center bg-yellow-100 rounded-xl mt-2">
                                <p className="text-lg font-bold text-amber-800">
                                    PILIH WARNA LALU KLIK AREA APEL UNTUK MEWARNAI. GUNAKAN PENGHAPUS UNTUK MENGHAPUS WARNA.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <button onClick={startGame} className="px-12 py-4 text-xl font-bold text-white transition-all duration-200 transform bg-orange-600 rounded-full shadow-lg hover:bg-orange-700 hover:scale-105">MULAI BERMAIN</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Modal Hasil ---
    if (showResults) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-center bg-cover" style={{ backgroundImage: "url(/images/bg-level.png)" }}>
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
                    <div className="w-full max-w-md p-8 mx-4 bg-white border-4 border-orange-500 shadow-2xl rounded-3xl">
                        <div className="mb-6 text-center">
                            <div className="px-6 py-3 mb-4 text-xl font-bold text-white bg-teal-500 rounded-full">LEVEL 5 COMPLETE</div>
                        </div>
                        <div className="flex justify-center mb-6">
                            {[1, 2, 3].map((star) => (
                                <div key={star} className={`w-16 h-16 mx-2 ${star <= stars ? "text-yellow-400" : "text-gray-300"}`}>
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                </div>
                            ))}
                        </div>
                        <div className="mb-6 text-center">
                            <h2 className="mb-2 text-3xl font-bold text-orange-600">GOOD JOB</h2>
                        </div>
                        <div className="text-center">
                            <button onClick={handleNextLevel} className="px-12 py-4 text-xl font-bold text-white transition-all duration-200 transform bg-teal-500 rounded-full shadow-lg hover:bg-teal-600 hover:scale-105">NEXT</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Game ---
    return (
        <div className="relative min-h-screen overflow-hidden bg-center bg-cover flex items-center justify-center" style={{ backgroundImage: "url(/images/bg-level.png)" }}>
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 w-full">
                {/* Header */}
                <div className="w-full max-w-4xl flex items-center justify-between px-6 py-4 bg-yellow-100 rounded-t-3xl border-b-4 border-orange-300 shadow-lg">
                    <button onClick={() => onNavigate("menu")}
                        className="w-12 h-12 bg-yellow-200 border-4 border-white rounded-full shadow flex items-center justify-center hover:bg-yellow-300"
                        aria-label="Kembali">
                        <Home className="w-7 h-7 text-orange-700" />
                    </button>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="px-8 py-2 bg-yellow-100 rounded-full shadow text-2xl font-bold text-orange-700 tracking-wide border-2 border-yellow-200">WARNAI BUAH APEL!</div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowHint(true)}
                            className="w-12 h-12 bg-yellow-200 border-4 border-white rounded-full shadow flex items-center justify-center hover:bg-yellow-300"
                            aria-label="Petunjuk">
                            <Lightbulb className="w-7 h-7 text-orange-700" />
                        </button>
                        <button onClick={onSoundToggle}
                            className="w-12 h-12 bg-yellow-200 border-4 border-white rounded-full shadow flex items-center justify-center hover:bg-yellow-300"
                            aria-label="Sound">
                            {soundEnabled ? <Volume2 className="w-7 h-7 text-orange-700" /> : <VolumeX className="w-7 h-7 text-orange-700" />}
                        </button>
                    </div>
                </div>

                {/* Main Card */}
                <div className="w-full max-w-4xl bg-white rounded-b-3xl shadow-2xl border-x-4 border-b-4 border-orange-300 flex flex-col items-center pb-8 pt-4">
                    <div className="flex justify-center items-center w-full mt-2">
                        <svg viewBox="0 0 400 260" className="w-[380px] h-[240px]">
                            <motion.polygon
                                points="200,40 260,70 320,120 300,200 200,220 100,200 80,120 140,70"
                                fill={fills[1] || "none"}
                                animate={{ fill: fills[1] || "transparent" }}
                                stroke="#888"
                                strokeWidth={2}
                                strokeDasharray="6 6"
                                onClick={() => handleFill(1)}
                                style={{ cursor: "pointer" }}
                                transition={{ duration: 0.3 }}
                            />
                            <motion.polygon
                                points="140,70 200,120 260,70"
                                fill={fills[2] || "none"}
                                animate={{ fill: fills[2] || "transparent" }}
                                stroke="#888"
                                strokeWidth={2}
                                strokeDasharray="6 6"
                                onClick={() => handleFill(2)}
                                style={{ cursor: "pointer" }}
                                transition={{ duration: 0.3 }}
                            />
                            <motion.polygon
                                points="200,120 200,220 300,200 320,120"
                                fill={fills[3] || "none"}
                                animate={{ fill: fills[3] || "transparent" }}
                                stroke="#888"
                                strokeWidth={2}
                                strokeDasharray="6 6"
                                onClick={() => handleFill(3)}
                                style={{ cursor: "pointer" }}
                                transition={{ duration: 0.3 }}
                            />
                            <motion.polygon
                                points="200,120 200,220 100,200 80,120"
                                fill={fills[4] || "none"}
                                animate={{ fill: fills[4] || "transparent" }}
                                stroke="#888"
                                strokeWidth={2}
                                strokeDasharray="6 6"
                                onClick={() => handleFill(4)}
                                style={{ cursor: "pointer" }}
                                transition={{ duration: 0.3 }}
                            />
                            {/* Daun */}
                            <motion.polygon
                                points="120,30 140,70 200,40 180,20"
                                fill={fills[5] || "none"}
                                animate={{ fill: fills[5] || "transparent" }}
                                stroke="#888"
                                strokeWidth={2}
                                strokeDasharray="6 6"
                                onClick={() => handleFill(5)}
                                style={{ cursor: "pointer" }}
                                transition={{ duration: 0.3 }}
                            />
                            <motion.polygon
                                points="280,30 260,70 200,40 220,20"
                                fill={fills[6] || "none"}
                                animate={{ fill: fills[6] || "transparent" }}
                                stroke="#888"
                                strokeWidth={2}
                                strokeDasharray="6 6"
                                onClick={() => handleFill(6)}
                                style={{ cursor: "pointer" }}
                                transition={{ duration: 0.3 }}
                            />
                            {/* Mata */}
                            <circle cx="185" cy="110" r="10" fill="#fff" stroke="#222" strokeWidth={2} />
                            <circle cx="215" cy="110" r="10" fill="#fff" stroke="#222" strokeWidth={2} />
                            <circle cx="188" cy="113" r="3" fill="#222" />
                            <circle cx="218" cy="113" r="3" fill="#222" />
                        </svg>

                    </div>

                    {/* Palet warna dan tools */}
                    <div className="flex items-center justify-center gap-4 mt-6 mb-2">
                        {colors.map((color) => (
                            <button key={color}
                                className={`w-10 h-10 rounded-full border-4 ${selectedColor === color ? "border-orange-500 scale-110" : "border-gray-300"} transition`}
                                style={{ background: color }}
                                onClick={() => { setSelectedColor(color); setTool("pencil"); }}
                                aria-label={`Pilih warna ${color}`} />
                        ))}
                        {/* Pencil */}
                        <button className={`w-10 h-10 rounded-full border-4 flex items-center justify-center bg-white ${tool === "pencil" ? "border-orange-500 scale-110" : "border-gray-300"} transition`}
                            onClick={() => setTool("pencil")} aria-label="Pilih pensil">
                            <span role="img" aria-label="Pencil" className="text-2xl">✏️</span>
                        </button>
                        {/* Eraser */}
                        <button className={`w-10 h-10 rounded-full border-4 flex items-center justify-center bg-white ${tool === "eraser" ? "border-orange-500 scale-110" : "border-gray-300"} transition`}
                            onClick={() => setTool("eraser")} aria-label="Pilih penghapus">
                            <span role="img" aria-label="Eraser" className="text-2xl">🧽</span>
                        </button>
                    </div>

                    {/* Tombol Next */}
                    <div className="flex justify-end w-full pr-8 mt-4">
                        <button onClick={finishGame}
                            className="w-16 h-16 bg-teal-400 rounded-full flex items-center justify-center shadow-lg hover:bg-teal-500 transition text-white text-3xl font-bold border-4 border-white"
                            aria-label="Lanjut">
                            <span>&#8594;</span>
                        </button>
                    </div>
                </div>

                {/* Modal Petunjuk kecil */}
                {showHint && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-80 border-4 border-orange-300">
                            <h2 className="text-lg font-bold text-orange-600 mb-2">Instruksi</h2>
                            <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
                                <li>Warnai buah apel.</li>
                                <li>Pilih pensil atau penghapus.</li>
                                <li>Klik area untuk mewarnai.</li>
                                <li>Gunakan penghapus untuk hapus warna.</li>
                            </ul>
                            <div className="mt-4 flex justify-end">
                                <button onClick={() => setShowHint(false)} className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600">Tutup</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameLevel5;
