import "./WordDisplay.css";

// Celebratory messages for correct answers
const CELEBRATORY_MESSAGES = [
  "Correct!",
  "Great!",
  "Amazing!",
  "Fantastic!",
  "Wonderful!",
  "Brilliant!",
  "Superb!",
  "Excellent!",
];

/**
 * WordDisplay component - shows the currently selected letters or feedback
 * @param {string[]} selectedLetters - Array of selected letters
 * @param {string|null} feedback - Feedback message ('correct', 'bonus', 'incorrect', 'already')
 * @param {string} themeColor - Current theme color for styling
 * @param {function} onSubmit - Callback when word is tapped to submit
 */
function WordDisplay({ selectedLetters, feedback, themeColor, onSubmit }) {
  const word = selectedLetters.map((sel) => sel.letter).join("");
  const canSubmit = selectedLetters.length >= 2 && !feedback;

  // Determine what to display
  let content;
  let className = "word-box";

  if (feedback) {
    // Show feedback message (use word-feedback class to avoid fixed positioning from App.css)
    className += ` word-feedback ${feedback}`;
    if (feedback === "correct") {
      // Randomly pick a celebratory message
      const randomIndex = Math.floor(
        Math.random() * CELEBRATORY_MESSAGES.length,
      );
      content = CELEBRATORY_MESSAGES[randomIndex];
    } else if (feedback === "bonus") {
      content = "Bonus word!";
    } else if (feedback === "incorrect") {
      content = "Not a word";
    } else if (feedback === "already") {
      content = "Already found!";
    }
  } else if (selectedLetters.length > 0) {
    // Show current word being formed
    content = <span className="current-word">{word}</span>;
    className += " tappable";
  } else {
    // Show placeholder
    content = <span className="placeholder">Tap letters to form a word</span>;
  }

  const handleClick = () => {
    if (canSubmit && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="word-display">
      <div
        className={className}
        style={{ "--current-theme-color": themeColor }}
        onClick={handleClick}
      >
        {content}
      </div>
    </div>
  );
}

export default WordDisplay;
