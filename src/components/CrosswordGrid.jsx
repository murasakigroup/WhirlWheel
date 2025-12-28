import "./CrosswordGrid.css";

/**
 * CrosswordGrid component - displays words in a crossword-style grid like Wordscapes
 * @param {Array} gridWords - Array of word objects with {word, row, col, direction}
 * @param {string[]} foundWords - Array of words that have been found
 */
function CrosswordGrid({ gridWords, foundWords }) {
  // Calculate grid dimensions based on word placements
  let maxRow = 0;
  let maxCol = 0;

  gridWords.forEach(({ word, row, col, direction }) => {
    if (direction === "down") {
      maxRow = Math.max(maxRow, row + word.length);
      maxCol = Math.max(maxCol, col + 1);
    } else {
      maxRow = Math.max(maxRow, row + 1);
      maxCol = Math.max(maxCol, col + word.length);
    }
  });

  const rows = maxRow;
  const cols = maxCol;

  // Create a 2D grid to track which cells have letters
  // Each cell tracks: letter, list of words it belongs to, and if any of those words are found
  const grid = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  // Place words in the grid
  gridWords.forEach((wordData) => {
    const { word, row, col, direction } = wordData;
    const isFound = foundWords.some(
      (fw) => fw.toUpperCase() === word.toUpperCase(),
    );

    for (let i = 0; i < word.length; i++) {
      const currentRow = direction === "down" ? row + i : row;
      const currentCol = direction === "across" ? col + i : col;

      if (currentRow < rows && currentCol < cols) {
        if (!grid[currentRow][currentCol]) {
          grid[currentRow][currentCol] = {
            letter: word[i],
            words: [{ word, isFound }],
          };
        } else {
          // Cell already has a letter (intersection)
          grid[currentRow][currentCol].words.push({ word, isFound });
        }
      }
    }
  });

  // Determine if a cell should show as found (any of its words is found)
  const isCellFound = (cell) => {
    if (!cell) return false;
    return cell.words.some((w) => w.isFound);
  };

  return (
    <div className="crossword-grid">
      <div
        className="grid-container"
        style={{
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const hasLetter = cell !== null;
            const found = isCellFound(cell);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${hasLetter ? "has-letter" : "empty"} ${found ? "found" : ""}`}
              >
                {hasLetter && (
                  <span className="letter">{found ? cell.letter : ""}</span>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

export default CrosswordGrid;
