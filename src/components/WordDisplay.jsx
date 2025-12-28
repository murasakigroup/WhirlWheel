import "./WordDisplay.css";

/**
 * WordDisplay component - shows the currently selected letters
 * @param {string[]} selectedLetters - Array of selected letters
 */
function WordDisplay({ selectedLetters }) {
  const word = selectedLetters.map((sel) => sel.letter).join("");

  return (
    <div className="word-display">
      <div className="word-box">
        {selectedLetters.length > 0 ? (
          <span className="current-word">{word}</span>
        ) : (
          <span className="placeholder">Click letters to form a word</span>
        )}
      </div>
    </div>
  );
}

export default WordDisplay;
