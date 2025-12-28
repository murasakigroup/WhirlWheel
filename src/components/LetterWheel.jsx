import "./LetterWheel.css";

/**
 * LetterWheel component - displays letters in a circular layout
 * @param {string[]} letters - Array of letters to display
 * @param {string[]} selectedLetters - Array of currently selected letters
 * @param {function} onLetterClick - Callback when a letter is clicked
 */
function LetterWheel({ letters, selectedLetters, onLetterClick }) {
  const radius = 100; // pixels from center (reduced for smaller screen)
  const angleStep = (2 * Math.PI) / letters.length;

  return (
    <div className="letter-wheel">
      <div className="wheel-container">
        {letters.map((letter, index) => {
          const angle = index * angleStep - Math.PI / 2; // Start from top
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          const isSelected = selectedLetters.some((sel) => sel.index === index);

          return (
            <button
              key={`${letter}-${index}`}
              className={`letter-button ${isSelected ? "selected" : ""}`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              onClick={() => onLetterClick(letter, index)}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LetterWheel;
