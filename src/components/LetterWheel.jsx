import "./LetterWheel.css";

/**
 * LetterWheel component - displays letters in a circular layout with connecting lines
 * @param {string[]} letters - Array of letters to display
 * @param {Array<{letter: string, index: number}>} selectedLetters - Array of currently selected letter objects
 * @param {function} onLetterClick - Callback when a letter is clicked
 */
function LetterWheel({ letters, selectedLetters, onLetterClick }) {
  const radius = 100; // pixels from center (reduced for smaller screen)
  const angleStep = (2 * Math.PI) / letters.length;
  const buttonRadius = 27.5; // Half of button width (55px / 2)

  // Calculate positions for each letter
  const letterPositions = letters.map((letter, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return { x, y, index };
  });

  // Generate lines between selected letters
  const lines = [];
  for (let i = 0; i < selectedLetters.length - 1; i++) {
    const start = letterPositions[selectedLetters[i].index];
    const end = letterPositions[selectedLetters[i + 1].index];
    lines.push({
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      key: `${i}-${selectedLetters[i].index}-${selectedLetters[i + 1].index}`,
    });
  }

  return (
    <div className="letter-wheel">
      <div className="wheel-container">
        {/* SVG for drawing connection lines */}
        <svg className="connection-lines" viewBox="-150 -150 300 300">
          {lines.map((line) => (
            <line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className="connection-line"
            />
          ))}
        </svg>

        {/* Letter buttons */}
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
