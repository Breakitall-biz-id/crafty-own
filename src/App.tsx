import { useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import MenuScreen from "./components/MenuScreen";
import NameInputScreen from "./components/NameInputScreen";
import GameLevel1 from "./components/GameLevel1";
import GameLevel2 from "./components/GameLevel2";
import GameLevel3 from "./components/GameLevel3";
import GameLevel4 from "./components/GameLevel4";
import OrientationGate from "./components/OrientationGate";
import { useGameState } from "./hooks/useGameState";
import { Screen } from "./types/GameTypes";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
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
    });
    navigateTo("level1");
  };

  const handleSoundToggle = () => {
    updateGameState({ soundEnabled: !gameState.soundEnabled });
  };

  const handleLevelComplete = (
    stars: number,
    timeElapsed: number,
    mistakes: number
  ) => {
    const currentLevel =
      currentScreen === "level1" ? 1 : currentScreen === "level2" ? 2 : currentScreen === "level3" ? 3 : 4;

    // Save level completion
    if (!gameState.completedLevels.includes(currentLevel)) {
      updateGameState({
        completedLevels: [...gameState.completedLevels, currentLevel],
        currentLevel: currentLevel + 1,
      });
    }

    // Save game result
    const result = {
      level: currentLevel,
      stars,
      timeElapsed,
      mistakes,
      completed: true,
    };

    // Save result
    console.log("Level completed:", result);
  };

  const handleNextLevel = () => {
    const currentLevel =
      currentScreen === "level1"
        ? 1
        : currentScreen === "level2"
          ? 2
          : currentScreen === "level3"
            ? 3
            : 4;

    // Navigate to next level or menu
    if (currentLevel === 1) {
      navigateTo("level2");
    } else if (currentLevel === 2) {
      navigateTo("level3");
    } else if (currentLevel === 3) {
      navigateTo("level4");
    } else {
      navigateTo("menu");
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
