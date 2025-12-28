import { useState, useEffect } from "react";
import "./App.css";
import { puzzles } from "./data/puzzles";
import { isAlreadyFound } from "./utils/wordValidator";
import LetterWheel from "./components/LetterWheel";
import WordDisplay from "./components/WordDisplay";
import CrosswordGrid from "./components/CrosswordGrid";

function App() {
  // Game state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentSelection, setCurrentSelection] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [bonusWordsFound, setBonusWordsFound] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [shuffledLetters, setShuffledLetters] = useState([]);

  const currentPuzzle = puzzles[currentPuzzleIndex];

  // Get all valid words (grid words + bonus words)
  const allValidWords = [
    ...currentPuzzle.gridWords.map((w) => w.word.toUpperCase()),
    ...(currentPuzzle.bonusWords || []).map((w) => w.toUpperCase()),
  ];

  // Initialize shuffled letters when puzzle changes
  useEffect(() => {
    setShuffledLetters([...currentPuzzle.letters]);
    setFoundWords([]);
    setBonusWordsFound([]);
    setCurrentSelection([]);
    setFeedback(null);
  }, [currentPuzzleIndex]);

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

    // Check if it's a bonus word
    const isBonusWord = (currentPuzzle.bonusWords || []).some(
      (bw) => bw.toUpperCase() === word,
    );

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
            alert("Congratulations! You completed all puzzles!");
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

      {/* Letter wheel section with side buttons */}
      <div className="wheel-section">
        <button
          className="side-button shuffle-btn"
          onClick={handleShuffle}
          title="Shuffle"
        >
          <span>⟳</span>
        </button>

        <LetterWheel
          letters={shuffledLetters}
          selectedLetters={currentSelection}
          onLetterClick={handleLetterClick}
        />

        <button
          className="side-button clear-btn"
          onClick={handleClear}
          title="Clear"
        >
          <span>✕</span>
        </button>
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
          Level {currentPuzzleIndex + 1} • {foundWords.length}/
          {currentPuzzle.gridWords.length} words
          {bonusWordsFound.length > 0 && ` • ${bonusWordsFound.length} bonus`}
        </p>
      </div>
    </div>
  );
}

export default App;
