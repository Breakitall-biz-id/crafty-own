# Game Layout System

Sistem layout yang unified untuk semua level game Crafty menggunakan component `BaseGameLayout` dan `GameResultModal`.

## Components yang Tersedia

### 1. BaseGameLayout
Layout utama untuk semua level game yang menyediakan:
- Background dengan gambar level
- Papan putih rounded dengan shadow
- Tombol navigasi (Home dan Help) di kiri-kanan atas
- Banner judul di tengah atas
- Area permainan yang responsive

### 2. GameResultModal
Modal hasil game yang menampilkan:
- Level completion message
- Star rating (1-3 bintang)
- Waktu bermain dan jumlah kesalahan
- Tombol "NEXT" untuk lanjut ke level berikutnya

### 3. InstructionModal
Modal petunjuk yang dapat dikonfigurasi per level dengan:
- Gambar petunjuk
- Judul dan deskripsi
- Tombol start game

## Cara Menggunakan

### Struktur File Level Baru:
```tsx
import React, { useState, useEffect, useRef } from "react";
import { useSound } from "../hooks/useSound";
import { Screen } from "../types/GameTypes";
import InstructionModal from "./InstructionModal";
import BaseGameLayout from "./BaseGameLayout";
import GameResultModal from "./GameResultModal";

interface GameLevelXProps {
  onNavigate: (screen: Screen) => void;
  onLevelComplete: (stars: number, timeElapsed: number, mistakes: number) => void;
  onNextLevel: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  playerName: string;
}

const GameLevelX: React.FC<GameLevelXProps> = ({
  onNavigate,
  onLevelComplete,
  onNextLevel,
  soundEnabled,
  // onSoundToggle, // tidak digunakan lagi
  // playerName, // tidak digunakan lagi
}) => {
  // ... state dan logika game

  // Modal instruksi
  if (showInstructions) {
    return (
      <InstructionModal
        isOpen={showInstructions}
        onClose={startGame}
        title="PETUNJUK"
        imageSrc="/images/petunjuk/levelX.png"
        description="DESKRIPSI PETUNJUK LEVEL INI"
      />
    );
  }

  // Modal hasil
  if (showResults) {
    return (
      <GameResultModal
        isOpen={showResults}
        level={X} // nomor level
        stars={stars}
        timeElapsed={timeElapsed}
        mistakes={mistakes}
        onNextLevel={handleNextLevel}
      />
    );
  }

  // Layout utama game
  return (
    <BaseGameLayout
      onNavigate={onNavigate}
      onShowInstructions={() => setShowInstructions(true)}
      title="JUDUL LEVEL INI"
      gameAreaRef={gameAreaRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Konten game level di sini */}
      {/* Contoh: buah-buahan, keranjang, dll */}
    </BaseGameLayout>
  );
};

export default GameLevelX;
```

## Props untuk BaseGameLayout

- `children`: Konten game yang akan ditampilkan di dalam area permainan
- `onNavigate`: Function untuk navigasi ke screen lain
- `onShowInstructions`: Function untuk menampilkan modal petunjuk
- `title`: Judul yang ditampilkan di banner atas
- `gameAreaRef`: Ref untuk area permainan (opsional)
- `onMouseMove`, `onMouseUp`, `onMouseLeave`: Event handlers untuk mouse (opsional)
- `onTouchMove`, `onTouchEnd`: Event handlers untuk touch (opsional)
- `backgroundImage`: Path gambar background (default: "/images/bg-level.png")
- `touchAction`: CSS touch-action property (default: "none")

## Props untuk GameResultModal

- `isOpen`: Boolean untuk menampilkan/menyembunyikan modal
- `level`: Nomor level yang selesai
- `stars`: Jumlah bintang yang didapat (1-3)
- `timeElapsed`: Waktu bermain dalam milliseconds
- `mistakes`: Jumlah kesalahan
- `onNextLevel`: Function untuk lanjut ke level berikutnya
- `backgroundImage`: Path gambar background (opsional)

## Props untuk InstructionModal

- `isOpen`: Boolean untuk menampilkan/menyembunyikan modal
- `onClose`: Function untuk menutup modal dan mulai game
- `title`: Judul modal (biasanya "PETUNJUK")
- `imageSrc`: Path gambar petunjuk level
- `description`: Deskripsi cara bermain level
- `showStartButton`: Boolean untuk menampilkan tombol start (default: true)
- `startButtonText`: Teks tombol start (default: "MULAI")

## Migrasi Level Existing

1. Import component yang diperlukan
2. Ganti bagian render instruction dengan `InstructionModal`
3. Ganti bagian render results dengan `GameResultModal`
4. Wrap konten game dengan `BaseGameLayout`
5. Hapus kode duplikat untuk navigation, background, dll
6. Update props sesuai kebutuhan

## Keuntungan

- ✅ Konsistensi visual di semua level
- ✅ Mengurangi duplikasi kode
- ✅ Mudah maintenance dan update
- ✅ Responsive design yang terjamin
- ✅ Accessibility yang konsisten
