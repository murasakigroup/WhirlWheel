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
  // Grid must fit within its 45% of main content area
  const cellSize = useMemo(() => {
    // Main content = viewport - header(60px) - footer(60px)
    // Crossword section = 45% of main content
    const mainContentHeight = window.innerHeight - 120;
    const sectionHeight = mainContentHeight * 0.45;

    const maxGridWidth = window.innerWidth * 0.9;
    const maxGridHeight = sectionHeight * 0.9; // Leave some padding
    const gap = 3;
    const padding = 16;

    const availableWidth = maxGridWidth - padding;
    const availableHeight = maxGridHeight - padding;

    // Calculate cell size based on actual grid dimensions
    const totalGapX = gap * (cols - 1);
    const totalGapY = gap * (rows - 1);

    const cellByWidth = (availableWidth - totalGapX) / cols;
    const cellByHeight = (availableHeight - totalGapY) / rows;

    // Use the smaller to ensure it fits
    const size = Math.min(cellByWidth, cellByHeight);
    return Math.max(18, Math.min(45, size));
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
