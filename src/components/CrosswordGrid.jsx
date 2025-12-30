import { useMemo } from "react";
import "./CrosswordGrid.css";

/**
 * CrosswordGrid component - displays words in a crossword-style grid
 * @param {Array} gridWords - Array of word objects with {word, row, col, direction}
 * @param {string[]} foundWords - Array of words that have been found
 * @param {string} themeColor - Theme color for found word tiles (default: #4caf50)
 */
function CrosswordGrid({ gridWords, foundWords, themeColor = "#4caf50" }) {
  // Calculate grid dimensions and build grid data
  const { grid, rows, cols } = useMemo(() => {
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

    return { grid, rows, cols };
  }, [gridWords, foundWords]);

  // Calculate cell size based on grid dimensions and available space
  // Grid must maintain 1:1 aspect ratio and fit within 45% vertical space
  const cellSize = useMemo(() => {
    const maxGridWidth = Math.min(window.innerWidth * 0.85, 400);
    const maxGridHeight = window.innerHeight * 0.4; // Use 40% to leave room for padding
    const gap = 3;
    const padding = 16;

    const availableWidth = maxGridWidth - padding;
    const availableHeight = maxGridHeight - padding;

    // Calculate based on larger dimension to maintain square grid
    const maxDim = Math.max(rows, cols);
    const cellByWidth = (availableWidth - gap * (maxDim - 1)) / maxDim;
    const cellByHeight = (availableHeight - gap * (maxDim - 1)) / maxDim;

    // Use the smaller to ensure it fits, with min/max constraints
    const size = Math.min(cellByWidth, cellByHeight);
    return Math.max(24, Math.min(60, size));
  }, [rows, cols]);

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
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          "--cell-size": `${cellSize}px`,
          "--current-theme-color": themeColor,
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
