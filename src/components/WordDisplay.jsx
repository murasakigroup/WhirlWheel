import "./WordDisplay.css";

/**
 * WordDisplay component - shows the currently selected letters or feedback
 * @param {string[]} selectedLetters - Array of selected letters
 * @param {string|null} feedback - Feedback message ('correct', 'bonus', 'incorrect', 'already')
 */
function WordDisplay({ selectedLetters, feedback }) {
  const word = selectedLetters.map((sel) => sel.letter).join("");

  // Determine what to display
  let content;
  let className = "word-box";

  if (feedback) {
    // Show feedback message
    className += ` feedback ${feedback}`;
    if (feedback === "correct") content = "Correct!";
    else if (feedback === "bonus") content = "Bonus word!";
    else if (feedback === "incorrect") content = "Not a word";
    else if (feedback === "already") content = "Already found!";
  } else if (selectedLetters.length > 0) {
    // Show current word being formed
    content = <span className="current-word">{word}</span>;
  } else {
    // Show placeholder
    content = <span className="placeholder">Click letters to form a word</span>;
  }

  return (
    <div className="word-display">
      <div className={className}>{content}</div>
    </div>
  );
}

export default WordDisplay;
