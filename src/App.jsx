import { useState, useEffect } from "react";
import "./App.css";
import { puzzles } from "./data/puzzles";
import { isValidPuzzleWord, isAlreadyFound } from "./utils/wordValidator";
import LetterWheel from "./components/LetterWheel";
import WordDisplay from "./components/WordDisplay";
import FoundWordsList from "./components/FoundWordsList";
import GameControls from "./components/GameControls";

function App() {
  // Game state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentSelection, setCurrentSelection] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [shuffledLetters, setShuffledLetters] = useState([]);

  const currentPuzzle = puzzles[currentPuzzleIndex];

  // Initialize shuffled letters when puzzle changes
  useEffect(() => {
    setShuffledLetters([...currentPuzzle.letters]);
    setFoundWords([]);
    setCurrentSelection([]);
    setFeedback(null);
  }, [currentPuzzleIndex]);

  // Handle letter click
  const handleLetterClick = (letter, index) => {
    // Check if this specific letter (by index) is already selected
    const letterWithIndex = `${letter}-${index}`;
    const alreadySelected = currentSelection.some((sel) => sel.index === index);

    if (alreadySelected) {
      return; // Don't allow selecting the same letter twice
    }

    setCurrentSelection([...currentSelection, { letter, index }]);
    setFeedback(null);
  };

  // Handle submit
  const handleSubmit = () => {
    const word = currentSelection.map((sel) => sel.letter).join("");

    if (isAlreadyFound(word, foundWords)) {
      setFeedback("already");
      setCurrentSelection([]); // Clear selection
      setTimeout(() => setFeedback(null), 2000);
      return;
    }

    if (isValidPuzzleWord(word, currentPuzzle.words)) {
      setFoundWords([...foundWords, word.toUpperCase()]);
      setFeedback("correct");
      setCurrentSelection([]); // Clear selection

      // Check if puzzle is complete
      if (foundWords.length + 1 === currentPuzzle.words.length) {
        setTimeout(() => {
          if (currentPuzzleIndex < puzzles.length - 1) {
            setCurrentPuzzleIndex(currentPuzzleIndex + 1);
          } else {
            alert("Congratulations! You completed all puzzles!");
          }
        }, 2000);
      }
    } else {
      setFeedback("incorrect");
      setCurrentSelection([]); // Clear selection even for incorrect words
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
    setCurrentSelection([]); // Clear selection when shuffling
    setFeedback(null); // Clear any feedback messages
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
      <header>
        <h1>Word Game</h1>
        <p className="level-indicator">
          Level {currentPuzzleIndex + 1} of {puzzles.length}
        </p>
      </header>

      {feedback && (
        <div className={`feedback ${feedback}`}>
          {feedback === "correct" && "✓ Correct!"}
          {feedback === "incorrect" && "✗ Not a valid word"}
          {feedback === "already" && "Already found!"}
        </div>
      )}

      <WordDisplay selectedLetters={currentSelection} />

      <LetterWheel
        letters={shuffledLetters}
        selectedLetters={currentSelection}
        onLetterClick={handleLetterClick}
      />

      <GameControls
        onSubmit={handleSubmit}
        onClear={handleClear}
        onShuffle={handleShuffle}
        canSubmit={currentSelection.length >= 3}
      />

      <FoundWordsList
        foundWords={foundWords}
        totalWords={currentPuzzle.words.length}
      />
    </div>
  );
}

export default App;
