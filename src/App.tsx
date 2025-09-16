import { useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import MenuScreen from "./components/MenuScreen";
import NameInputScreen from "./components/NameInputScreen";
import GameLevel1 from "./components/GameLevel1";
import GameLevel2 from "./components/GameLevel2";
import GameLevel3 from "./components/GameLevel3";
import GameLevel4 from "./components/GameLevel4";
import GameLevel5 from "./components/GameLevel5";
import ResultScreen from "./components/ResultScreen";
import OrientationGate from "./components/OrientationGate";
import { useGameState } from "./hooks/useGameState";
import { Screen } from "./types/GameTypes";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  // const [currentScreen, setCurrentScreen] = useState<Screen>("level4");
  const { gameState, updateGameState } = useGameState();
  // Removed install prompt local state; keep listener minimal

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("💾 Install prompt detected");
      e.preventDefault();
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("📱 App is running in standalone mode");
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
    };
  }, []);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleNameSubmit = (name: string) => {
    updateGameState({
      playerName: name,
      gameStarted: true,
      // Reset completedLevels and results if ingin main baru
      completedLevels: [],
    });
    localStorage.removeItem("crafty-own-results");
    navigateTo("level1");
  };

  const handleSoundToggle = () => {
    updateGameState({ soundEnabled: !gameState.soundEnabled });
  };

  const handleLevelComplete = (
    stars: number,
    timeElapsed: number,
    mistakes: number,
    completedArtwork?: string
  ) => {
    const currentLevel =
      currentScreen === "level1"
        ? 1
        : currentScreen === "level2"
        ? 2
        : currentScreen === "level3"
        ? 3
        : currentScreen === "level4"
        ? 4
        : 5;

    // Save level completion
    if (!gameState.completedLevels.includes(currentLevel)) {
      updateGameState({
        completedLevels: [...gameState.completedLevels, currentLevel],
        currentLevel: currentLevel + 1,
      });
    }

    // Save game result with artwork if provided
    const result = {
      level: currentLevel,
      stars,
      timeElapsed,
      mistakes,
      completed: true,
      ...(completedArtwork && { artwork: completedArtwork }),
    };
    // Simpan ke localStorage
    if (window && window.localStorage) {
      const results = JSON.parse(
        localStorage.getItem("crafty-own-results") || "[]"
      );
      // replace if already exists for this level
      const idx = results.findIndex((r: any) => r.level === currentLevel);
      if (idx !== -1) {
        results[idx] = result;
      } else {
        results.push(result);
      }
      localStorage.setItem("crafty-own-results", JSON.stringify(results));
    }
  };

  const handleNextLevel = () => {
    const currentLevel =
      currentScreen === "level1"
        ? 1
        : currentScreen === "level2"
        ? 2
        : currentScreen === "level3"
        ? 3
        : currentScreen === "level4"
        ? 4
        : 5;

    // Navigate to next level or result screen
    if (currentLevel === 1) {
      navigateTo("level2");
    } else if (currentLevel === 2) {
      navigateTo("level3");
    } else if (currentLevel === 3) {
      navigateTo("level4");
    } else if (currentLevel === 4) {
      navigateTo("level5");
    } else {
      navigateTo("result");
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "splash":
        return <SplashScreen onStart={() => navigateTo("menu")} />;
      case "menu":
        return <MenuScreen onNavigate={navigateTo} />;
      case "nameInput":
        return (
          <NameInputScreen
            onNavigate={navigateTo}
            onNameSubmit={handleNameSubmit}
            soundEnabled={gameState.soundEnabled}
            onSoundToggle={handleSoundToggle}
          />
        );
      case "level1":
        return (
          <GameLevel1
            onNavigate={navigateTo}
            onLevelComplete={handleLevelComplete}
            onNextLevel={handleNextLevel}
            soundEnabled={gameState.soundEnabled}
            onSoundToggle={handleSoundToggle}
            playerName={gameState.playerName}
          />
        );
      case "level2":
        return (
          <GameLevel2
            onNavigate={navigateTo}
            onLevelComplete={handleLevelComplete}
            onNextLevel={handleNextLevel}
            soundEnabled={gameState.soundEnabled}
            onSoundToggle={handleSoundToggle}
            playerName={gameState.playerName}
          />
        );
      case "level3":
        return (
          <GameLevel3
            onNavigate={navigateTo}
            onLevelComplete={handleLevelComplete}
            onNextLevel={handleNextLevel}
            soundEnabled={gameState.soundEnabled}
            onSoundToggle={handleSoundToggle}
            playerName={gameState.playerName}
          />
        );
      case "level4":
        return (
          <GameLevel4
            onNavigate={navigateTo}
            onLevelComplete={handleLevelComplete}
            onNextLevel={handleNextLevel}
            soundEnabled={gameState.soundEnabled}
            onSoundToggle={handleSoundToggle}
            playerName={gameState.playerName}
          />
        );
      case "level5":
        return (
          <GameLevel5
            onNavigate={navigateTo}
            onLevelComplete={handleLevelComplete}
            onNextLevel={handleNextLevel}
            soundEnabled={gameState.soundEnabled}
            onSoundToggle={handleSoundToggle}
            setScreen={navigateTo}
            playerName={gameState.playerName}
          />
        );
      case "result": {
        // Hitung total bintang dari localStorage
        let totalStars = 0;
        let level5Artwork: string | undefined;
        const playerName = gameState.playerName;

        if (typeof window !== "undefined") {
          const results = JSON.parse(
            localStorage.getItem("crafty-own-results") || "[]"
          );
          totalStars = results.reduce(
            (sum: number, r: { stars?: number }) => sum + (r.stars || 0),
            0
          );

          const level5Result = results.find(
            (r: { level: number; artwork?: string }) => r.level === 5
          );
          if (level5Result && level5Result.artwork) {
            level5Artwork = level5Result.artwork;
          }
        }

        return (
          <ResultScreen
            playerName={playerName}
            totalStars={totalStars}
            onNavigate={navigateTo}
            level5Artwork={level5Artwork}
          />
        );
      }
      default:
        return <SplashScreen onStart={() => navigateTo("menu")} />;
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <OrientationGate>{renderScreen()}</OrientationGate>
    </div>
  );
}

export default App;
