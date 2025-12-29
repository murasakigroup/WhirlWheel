import { useState, useEffect, useMemo } from "react";
import "./App.css";
import { puzzles as quickPlayPuzzles } from "./data/puzzles";
import {
  loadCampaignData,
  getAllCampaignPuzzles,
  getCampaignPuzzles,
} from "./data/campaignLoader";
import { isAlreadyFound } from "./utils/wordValidator";
import LetterWheel from "./components/LetterWheel";
import WordDisplay from "./components/WordDisplay";
import CrosswordGrid from "./components/CrosswordGrid";
import { MainMenu } from "./components/MainMenu";
import PuzzleManager from "./puzzleManager";
import bonusDictionary from "./data/bonusDictionary.json";

function App() {
  // Navigation state
  const [currentView, setCurrentView] = useState("menu"); // "menu" | "game" | "manager"
  const [gameMode, setGameMode] = useState("quick"); // "quick" | "campaign"
  const [selectedAreaId, setSelectedAreaId] = useState(null);

  // Game state
  const [puzzles, setPuzzles] = useState(quickPlayPuzzles);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentSelection, setCurrentSelection] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [bonusWordsFound, setBonusWordsFound] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [showBonusPopup, setShowBonusPopup] = useState(false);

  const currentPuzzle = puzzles[currentPuzzleIndex];

  // Create a Set for fast dictionary lookup (only once)
  const bonusDictionarySet = useMemo(() => new Set(bonusDictionary), []);

  // Get all valid words (grid words + bonus words)
  const allValidWords = currentPuzzle
    ? [
        ...currentPuzzle.gridWords.map((w) => w.word.toUpperCase()),
        ...(currentPuzzle.bonusWords || []).map((w) => w.toUpperCase()),
      ]
    : [];

  // Check if a word can be spelled by consecutive letters around the wheel (circular)
  const canSpellInCircle = (letters, word) => {
    const n = letters.length;
    if (word.length > n) return false;

    // Check both clockwise and counter-clockwise from each starting position
    for (let start = 0; start < n; start++) {
      // Clockwise
      let matchCW = true;
      for (let i = 0; i < word.length; i++) {
        if (letters[(start + i) % n] !== word[i]) {
          matchCW = false;
          break;
        }
      }
      if (matchCW) return true;

      // Counter-clockwise
      let matchCCW = true;
      for (let i = 0; i < word.length; i++) {
        if (letters[(start - i + n) % n] !== word[i]) {
          matchCCW = false;
          break;
        }
      }
      if (matchCCW) return true;
    }
    return false;
  };

  // Shuffle letters ensuring the main word isn't easily spelled in a circle
  const smartShuffle = (letters, gridWords) => {
    const shuffled = [...letters];
    const mainWord = gridWords
      .map((gw) => gw.word.toUpperCase())
      .sort((a, b) => b.length - a.length)[0]; // Longest word

    // Only apply this check for longer puzzles (6+ letters)
    const shouldCheck = letters.length >= 6 && mainWord;

    let attempts = 0;
    const maxAttempts = 20;

    do {
      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      attempts++;
    } while (
      shouldCheck &&
      canSpellInCircle(shuffled, mainWord) &&
      attempts < maxAttempts
    );

    return shuffled;
  };

  // Initialize shuffled letters when puzzle changes
  useEffect(() => {
    if (currentPuzzle) {
      setShuffledLetters(
        smartShuffle(currentPuzzle.letters, currentPuzzle.gridWords),
      );
      setFoundWords([]);
      setBonusWordsFound([]);
      setCurrentSelection([]);
      setFeedback(null);
    }
  }, [currentPuzzleIndex, puzzles]);

  // Handle letter click
  const handleLetterClick = (letter, index) => {
    const alreadySelected = currentSelection.some((sel) => sel.index === index);

    if (alreadySelected) {
      return;
    }

    setCurrentSelection([...currentSelection, { letter, index }]);
    setFeedback(null);
  };

  // Handle submit
  const handleSubmit = () => {
    const word = currentSelection
      .map((sel) => sel.letter)
      .join("")
      .toUpperCase();

    // Check if already found
    if (isAlreadyFound(word, [...foundWords, ...bonusWordsFound])) {
      setFeedback("already");
      setCurrentSelection([]);
      setTimeout(() => setFeedback(null), 2000);
      return;
    }

    // Check if it's a grid word
    const isGridWord = currentPuzzle.gridWords.some(
      (gw) => gw.word.toUpperCase() === word,
    );

    // Check if it's a bonus word (from puzzle list OR comprehensive dictionary)
    const isBonusWord =
      (currentPuzzle.bonusWords || []).some(
        (bw) => bw.toUpperCase() === word,
      ) || bonusDictionarySet.has(word);

    if (isGridWord) {
      setFoundWords([...foundWords, word]);
      setFeedback("correct");
      setCurrentSelection([]);

      // Check if puzzle is complete (all grid words found)
      if (foundWords.length + 1 === currentPuzzle.gridWords.length) {
        setTimeout(() => {
          if (currentPuzzleIndex < puzzles.length - 1) {
            setCurrentPuzzleIndex(currentPuzzleIndex + 1);
          } else {
            // All puzzles complete
            if (gameMode === "campaign") {
              alert(
                `Congratulations! You completed ${selectedAreaId ? "this area" : "the campaign"}!`,
              );
            } else {
              alert("Congratulations! You completed all puzzles!");
            }
            setCurrentView("menu");
          }
        }, 2000);
      }
    } else if (isBonusWord) {
      setBonusWordsFound([...bonusWordsFound, word]);
      setFeedback("bonus");
      setCurrentSelection([]);
    } else {
      setFeedback("incorrect");
      setCurrentSelection([]);
    }

    setTimeout(() => setFeedback(null), 2000);
  };

  // Handle clear
  const handleClear = () => {
    setCurrentSelection([]);
    setFeedback(null);
  };

  // Handle shuffle
  const handleShuffle = () => {
    const shuffled = [...shuffledLetters];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledLetters(shuffled);
    setCurrentSelection([]);
    setFeedback(null);
  };

  // Handle back to menu
  const handleBackToMenu = () => {
    setCurrentView("menu");
    setCurrentPuzzleIndex(0);
    setPuzzles(quickPlayPuzzles);
    setGameMode("quick");
    setSelectedAreaId(null);
  };

  // Play campaign
  const handlePlayCampaign = (areaId) => {
    const gameData = loadCampaignData();
    if (!gameData) {
      alert(
        "No campaign data found. Generate puzzles in the Puzzle Manager first.",
      );
      return;
    }

    let campaignPuzzles;

    if (areaId) {
      // Play specific area
      const puzzlesByArea = getCampaignPuzzles(gameData);
      campaignPuzzles = puzzlesByArea.get(areaId) || [];
      setSelectedAreaId(areaId);
    } else {
      // Play all areas
      campaignPuzzles = getAllCampaignPuzzles(gameData);
      setSelectedAreaId(null);
    }

    if (campaignPuzzles.length === 0) {
      alert("No puzzles available for this selection.");
      return;
    }

    setPuzzles(campaignPuzzles);
    setCurrentPuzzleIndex(0);
    setGameMode("campaign");
    setCurrentView("game");
  };

  // Play quick game
  const handlePlayQuickGame = () => {
    setPuzzles(quickPlayPuzzles);
    setCurrentPuzzleIndex(0);
    setGameMode("quick");
    setCurrentView("game");
  };

  // Show Main Menu
  if (currentView === "menu") {
    return (
      <MainMenu
        onPlayCampaign={handlePlayCampaign}
        onPlayQuickGame={handlePlayQuickGame}
        onPuzzleManager={() => setCurrentView("manager")}
      />
    );
  }

  // Show Puzzle Manager
  if (currentView === "manager") {
    return <PuzzleManager />;
  }

  // No puzzle available
  if (!currentPuzzle) {
    return (
      <div className="app" style={{ backgroundColor: "#121212" }}>
        <div style={{ textAlign: "center", padding: "40px", color: "#fff" }}>
          <h2>No puzzles available</h2>
          <button
            onClick={handleBackToMenu}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "#6C5CE7",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Show Game
  return (
    <div
      className="app"
      style={{
        backgroundImage: `url(${currentPuzzle.background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Back button */}
      <button className="back-button" onClick={handleBackToMenu}>
        ← Menu
      </button>

      {/* Campaign info banner */}
      {gameMode === "campaign" && currentPuzzle.locationName && (
        <div className="campaign-banner">
          <span className="campaign-area">{currentPuzzle.areaName}</span>
          <span className="campaign-location">
            {currentPuzzle.locationName}
          </span>
        </div>
      )}

      {feedback && (
        <div className={`feedback ${feedback}`}>
          {feedback === "correct" && "Correct!"}
          {feedback === "incorrect" && "Not a word"}
          {feedback === "already" && "Already found!"}
          {feedback === "bonus" && "Bonus word!"}
        </div>
      )}

      {/* Crossword Grid at top */}
      <CrosswordGrid
        gridWords={currentPuzzle.gridWords}
        foundWords={foundWords}
      />

      {/* Current word display */}
      <WordDisplay selectedLetters={currentSelection} />

      {/* Letter wheel section with positioned buttons */}
      <div className="wheel-section">
        <div className="wheel-wrapper">
          <button
            className="wheel-button shuffle-btn"
            onClick={handleShuffle}
            title="Shuffle"
          >
            <span>🔀</span>
          </button>

          <LetterWheel
            letters={shuffledLetters}
            selectedLetters={currentSelection}
            onLetterClick={handleLetterClick}
          />

          <button
            className="wheel-button clear-btn"
            onClick={handleClear}
            title="Clear"
          >
            <span>✕</span>
          </button>
        </div>
      </div>

      {/* Submit button */}
      <div className="bottom-controls">
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={currentSelection.length < 2}
        >
          Submit
        </button>
        <p className="level-indicator">
          {gameMode === "campaign" ? (
            <>
              Puzzle {currentPuzzleIndex + 1}/{puzzles.length} •{" "}
              {foundWords.length}/{currentPuzzle.gridWords.length} words
              {bonusWordsFound.length > 0 && (
                <>
                  {" • "}
                  <span
                    onClick={() => setShowBonusPopup(true)}
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                  >
                    {bonusWordsFound.length} bonus
                  </span>
                </>
              )}
            </>
          ) : (
            <>
              Level {currentPuzzleIndex + 1} • {foundWords.length}/
              {currentPuzzle.gridWords.length} words
              {bonusWordsFound.length > 0 && (
                <>
                  {" • "}
                  <span
                    onClick={() => setShowBonusPopup(true)}
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                  >
                    {bonusWordsFound.length} bonus
                  </span>
                </>
              )}
            </>
          )}
        </p>
      </div>

      {/* Bonus Words Popup */}
      {showBonusPopup && (
        <div
          className="modal-backdrop"
          onClick={() => setShowBonusPopup(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowBonusPopup(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#666",
                width: "32px",
                height: "32px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "50%",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#f0f0f0")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              ✕
            </button>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#333",
                fontSize: "24px",
                textAlign: "center",
              }}
            >
              Bonus Words Found
            </h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              {bonusWordsFound.map((word, index) => (
                <div
                  key={index}
                  style={{
                    background:
                      "linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
