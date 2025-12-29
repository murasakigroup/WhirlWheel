/**
 * Grid Placer Module
 * Core placement algorithm with validation.
 */

import type {
  Direction,
  Grid,
  PlacedWord,
  PlacementCandidate,
  ValidationResult,
  Intersection,
} from "./types";

/**
 * Create an empty grid
 */
export function createGrid(): Grid {
  return {
    cells: {},
    placedWords: [],
    bounds: { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 },
  };
}

/**
 * Get the letter at a specific cell
 */
export function getCell(
  grid: Grid,
  row: number,
  col: number,
): string | undefined {
  return grid.cells[`${row},${col}`];
}

/**
 * Set a letter at a specific cell
 */
export function setCell(
  grid: Grid,
  row: number,
  col: number,
  letter: string,
): void {
  const cellCount = Object.keys(grid.cells).length;
  grid.cells[`${row},${col}`] = letter;
  // Update bounds
  if (cellCount === 0) {
    // First cell sets initial bounds
    grid.bounds.minRow = row;
    grid.bounds.maxRow = row;
    grid.bounds.minCol = col;
    grid.bounds.maxCol = col;
  } else {
    grid.bounds.minRow = Math.min(grid.bounds.minRow, row);
    grid.bounds.maxRow = Math.max(grid.bounds.maxRow, row);
    grid.bounds.minCol = Math.min(grid.bounds.minCol, col);
    grid.bounds.maxCol = Math.max(grid.bounds.maxCol, col);
  }
}

/**
 * Clone a grid for immutable operations
 */
export function cloneGrid(grid: Grid): Grid {
  return {
    cells: { ...grid.cells },
    placedWords: [...grid.placedWords.map((pw) => ({ ...pw }))],
    bounds: { ...grid.bounds },
  };
}

/**
 * Get all cells a word would occupy
 */
export function getWordCells(
  word: string,
  row: number,
  col: number,
  direction: Direction,
): Array<{ r: number; c: number; letter: string }> {
  const cells = [];
  for (let i = 0; i < word.length; i++) {
    cells.push({
      r: direction === "horizontal" ? row : row + i,
      c: direction === "horizontal" ? col + i : col,
      letter: word[i],
    });
  }
  return cells;
}

/**
 * Validate if a word can be placed at a specific position
 * All five rules must pass for a valid placement.
 */
export function validatePlacement(
  word: string,
  row: number,
  col: number,
  direction: Direction,
  grid: Grid,
): ValidationResult {
  const cells = getWordCells(word, row, col, direction);
  let intersectionCount = 0;

  for (let i = 0; i < cells.length; i++) {
    const { r, c, letter } = cells[i];
    const existing = getCell(grid, r, c);

    // RULE 1: No letter conflicts
    // If cell is occupied, it must have the same letter
    if (existing && existing !== letter) {
      return {
        valid: false,
        reason: `Letter conflict at (${r},${c}): existing '${existing}' vs new '${letter}'`,
      };
    }

    const isIntersection = existing === letter;
    if (isIntersection) intersectionCount++;

    // RULE 2: No parallel adjacency
    // Perpendicular neighbors must be empty UNLESS this is an intersection point
    const perpNeighbors =
      direction === "horizontal"
        ? [getCell(grid, r - 1, c), getCell(grid, r + 1, c)] // above, below
        : [getCell(grid, r, c - 1), getCell(grid, r, c + 1)]; // left, right

    const hasAdjacentLetter = perpNeighbors.some((n) => n !== undefined);

    if (hasAdjacentLetter && !isIntersection) {
      return {
        valid: false,
        reason: `Parallel adjacency at (${r},${c}) - would create nonsense words`,
      };
    }
  }

  // RULE 3: Word boundary - cell BEFORE word must be empty
  const [beforeR, beforeC] =
    direction === "horizontal" ? [row, col - 1] : [row - 1, col];

  if (getCell(grid, beforeR, beforeC) !== undefined) {
    return {
      valid: false,
      reason: `Cell before word start is occupied at (${beforeR},${beforeC})`,
    };
  }

  // RULE 4: Word boundary - cell AFTER word must be empty
  const [afterR, afterC] =
    direction === "horizontal"
      ? [row, col + word.length]
      : [row + word.length, col];

  if (getCell(grid, afterR, afterC) !== undefined) {
    return {
      valid: false,
      reason: `Cell after word end is occupied at (${afterR},${afterC})`,
    };
  }

  // RULE 5: Must intersect at least one existing word (except first word)
  if (grid.placedWords.length > 0 && intersectionCount === 0) {
    return {
      valid: false,
      reason:
        "Word does not intersect any existing word - would create floating word",
    };
  }

  return { valid: true };
}

/**
 * Place a word on the grid
 * Returns a new grid with the word placed (immutable)
 */
export function placeWord(
  grid: Grid,
  word: string,
  row: number,
  col: number,
  direction: Direction,
): Grid {
  // Validate first
  const validation = validatePlacement(word, row, col, direction, grid);
  if (!validation.valid) {
    throw new Error(`Invalid placement: ${validation.reason}`);
  }

  // Clone grid for immutability
  const newGrid = cloneGrid(grid);

  // Place letters
  const cells = getWordCells(word, row, col, direction);
  for (const { r, c, letter } of cells) {
    setCell(newGrid, r, c, letter);
  }

  // Record placed word
  newGrid.placedWords.push({ word, row, col, direction });

  return newGrid;
}

/**
 * Find all valid placement positions for a word
 */
export function findValidPlacements(
  word: string,
  grid: Grid,
  intersectionGraph: Map<string, Map<string, Intersection[]>>,
): PlacementCandidate[] {
  const candidates: PlacementCandidate[] = [];

  // First word: place at origin
  if (grid.placedWords.length === 0) {
    // Try horizontal at origin
    candidates.push({
      word,
      row: 0,
      col: 0,
      direction: "horizontal",
      intersections: 0,
      score: 0,
    });
    // Also try vertical
    candidates.push({
      word,
      row: 0,
      col: 0,
      direction: "vertical",
      intersections: 0,
      score: 0,
    });
    return candidates;
  }

  // For subsequent words: find intersections with placed words
  for (const placedWord of grid.placedWords) {
    const intersections =
      intersectionGraph.get(word)?.get(placedWord.word) || [];

    for (const intersection of intersections) {
      // Calculate where the new word would be placed
      const newDirection: Direction =
        placedWord.direction === "horizontal" ? "vertical" : "horizontal";

      let newRow: number, newCol: number;

      if (placedWord.direction === "horizontal") {
        // Placed word is horizontal, new word will be vertical
        // intersection.indexB is position in placed word
        // intersection.indexA is position in new word
        newCol = placedWord.col + intersection.indexB;
        newRow = placedWord.row - intersection.indexA;
      } else {
        // Placed word is vertical, new word will be horizontal
        newRow = placedWord.row + intersection.indexB;
        newCol = placedWord.col - intersection.indexA;
      }

      // Validate placement
      const validation = validatePlacement(
        word,
        newRow,
        newCol,
        newDirection,
        grid,
      );

      if (validation.valid) {
        // Check if this candidate already exists (avoid duplicates)
        const isDuplicate = candidates.some(
          (c) =>
            c.row === newRow &&
            c.col === newCol &&
            c.direction === newDirection,
        );

        if (!isDuplicate) {
          candidates.push({
            word,
            row: newRow,
            col: newCol,
            direction: newDirection,
            intersections: 1, // Will be recounted by scorer if needed
            score: 0, // Will be calculated by scorer
          });
        }
      }
    }
  }

  return candidates;
}

/**
 * Check if all cells in the grid are connected (no islands)
 */
export function isGridConnected(grid: Grid): boolean {
  const cellKeys = Object.keys(grid.cells);
  if (cellKeys.length === 0) return true;

  // BFS from first cell
  const visited = new Set<string>();
  const queue: string[] = [cellKeys[0]];

  while (queue.length > 0) {
    const key = queue.shift()!;
    if (visited.has(key)) continue;
    visited.add(key);

    const [row, col] = key.split(",").map(Number);

    // Check 4 neighbors
    const neighbors = [
      `${row - 1},${col}`,
      `${row + 1},${col}`,
      `${row},${col - 1}`,
      `${row},${col + 1}`,
    ];

    for (const neighbor of neighbors) {
      if (neighbor in grid.cells && !visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  return visited.size === cellKeys.length;
}

/**
 * Normalize grid coordinates so minimum row and column are 0
 * This makes the grid easier to render
 */
export function normalizeGrid(grid: Grid): Grid {
  const normalized = createGrid();
  const { minRow, minCol } = grid.bounds;

  // Shift all cells
  for (const [key, letter] of Object.entries(grid.cells)) {
    const [row, col] = key.split(",").map(Number);
    setCell(normalized, row - minRow, col - minCol, letter);
  }

  // Shift all placed words
  for (const pw of grid.placedWords) {
    normalized.placedWords.push({
      word: pw.word,
      row: pw.row - minRow,
      col: pw.col - minCol,
      direction: pw.direction,
    });
  }

  return normalized;
}
