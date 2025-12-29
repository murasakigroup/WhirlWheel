import { useRef, useState, useEffect } from "react";
import "./LetterWheel.css";

/**
 * LetterWheel component - displays letters in a circular layout with connecting lines
 * @param {string[]} letters - Array of letters to display
 * @param {Array<{letter: string, index: number}>} selectedLetters - Array of currently selected letter objects
 * @param {function} onLetterClick - Callback when a letter is clicked
 * @param {string} themeColor - Theme color for lines and selected buttons (default: var(--color-primary))
 */
function LetterWheel({
  letters,
  selectedLetters,
  onLetterClick,
  themeColor = "var(--color-primary)",
}) {
  const containerRef = useRef(null);
  const [radius, setRadius] = useState(80);

  // Calculate letter button size based on number of letters
  // Fewer letters = larger buttons (75px for 3-4 letters, 50px for 8)
  const getLetterSize = (letterCount) => {
    if (letterCount <= 4) return 75;
    if (letterCount <= 5) return 65;
    if (letterCount <= 6) return 58;
    return 50; // 7-8 letters
  };
  const letterSize = getLetterSize(letters.length);

  // Get radius multiplier based on letter count
  // Smaller radius for fewer letters to keep larger buttons inside wheel
  const getRadiusMultiplier = (letterCount) => {
    if (letterCount <= 3) return 0.32; // Tighter for 3 letters
    if (letterCount <= 4) return 0.32; // Tighter for 4 letters
    if (letterCount <= 5) return 0.34; // Slightly tighter for 5
    return 0.38; // Default for 6+
  };

  // Update radius based on container size and letter count
  useEffect(() => {
    const updateRadius = () => {
      if (containerRef.current) {
        const containerSize = containerRef.current.offsetWidth;
        const multiplier = getRadiusMultiplier(letters.length);
        setRadius(containerSize * multiplier);
      }
    };

    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, [letters.length]);

  const angleStep = (2 * Math.PI) / letters.length;

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

  // Calculate viewBox based on radius to keep SVG properly scaled
  const svgSize = radius + 50;

  return (
    <div className="letter-wheel">
      <div
        className="wheel-container"
        ref={containerRef}
        style={{
          "--current-theme-color": themeColor,
          "--letter-size": `${letterSize}px`,
          "--letter-font-size": `${letterSize * 0.5}px`,
        }}
      >
        {/* SVG for drawing connection lines */}
        <svg
          className="connection-lines"
          viewBox={`${-svgSize} ${-svgSize} ${svgSize * 2} ${svgSize * 2}`}
        >
          {lines.map((line) => (
            <line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className="connection-line"
              style={{ stroke: themeColor }}
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
