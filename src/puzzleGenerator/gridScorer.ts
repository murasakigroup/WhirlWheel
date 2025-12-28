/**
 * Grid Scorer Module
 * Scores grid quality for ranking candidates.
 */

import type { Direction, Grid, PuzzleMetrics, ScoringWeights } from './types';

/**
 * Get all cells a word would occupy (helper function)
 */
function getWordCells(
  word: string,
  row: number,
  col: number,
  direction: Direction
): Array<{ r: number; c: number }> {
  const cells = [];
  for (let i = 0; i < word.length; i++) {
    cells.push({
      r: direction === 'horizontal' ? row : row + i,
      c: direction === 'horizontal' ? col + i : col
    });
  }
  return cells;
}

/**
 * Calculate how compact/square the grid is
 * Higher score for square grids with high fill ratio
 */
function calculateCompactness(grid: Grid): number {
  if (grid.cells.size === 0) return 0;

  const width = grid.bounds.maxCol - grid.bounds.minCol + 1;
  const height = grid.bounds.maxRow - grid.bounds.minRow + 1;
  const area = width * height;
  const filledCells = grid.cells.size;

  // Ideal: square grid with high fill
  // Score: prefer smaller bounding box
  const aspectRatio = Math.min(width, height) / Math.max(width, height);
  const fillRatio = filledCells / area;

  return aspectRatio * 0.5 + fillRatio * 0.5;
}

/**
 * Calculate the density of filled cells
 */
function calculateDensity(grid: Grid): number {
  if (grid.cells.size === 0) return 0;

  const width = grid.bounds.maxCol - grid.bounds.minCol + 1;
  const height = grid.bounds.maxRow - grid.bounds.minRow + 1;
  const area = width * height;
  const filledCells = grid.cells.size;

  return filledCells / area;
}

/**
 * Calculate score based on number of word intersections
 */
function calculateIntersectionScore(grid: Grid): number {
  if (grid.placedWords.length <= 1) return 1;

  // Count cells that are part of multiple words
  const cellUsage = new Map<string, number>();

  for (const placedWord of grid.placedWords) {
    const cells = getWordCells(
      placedWord.word,
      placedWord.row,
      placedWord.col,
      placedWord.direction
    );
    for (const { r, c } of cells) {
      const key = `${r},${c}`;
      cellUsage.set(key, (cellUsage.get(key) || 0) + 1);
    }
  }

  const intersections = Array.from(cellUsage.values()).filter(v => v > 1).length;
  const maxPossible = grid.placedWords.length - 1; // At minimum, N-1 intersections needed

  return maxPossible > 0 ? Math.min(1, intersections / maxPossible) : 1;
}

/**
 * Calculate symmetry score (visual balance around center)
 */
function calculateSymmetry(grid: Grid): number {
  if (grid.cells.size === 0) return 0;

  const width = grid.bounds.maxCol - grid.bounds.minCol + 1;
  const height = grid.bounds.maxRow - grid.bounds.minRow + 1;
  const centerRow = grid.bounds.minRow + height / 2;
  const centerCol = grid.bounds.minCol + width / 2;

  let symmetryScore = 0;
  let totalCells = 0;

  for (const key of grid.cells.keys()) {
    const [row, col] = key.split(',').map(Number);
    const mirrorRow = 2 * centerRow - row;
    const mirrorCol = 2 * centerCol - col;
    const mirrorKey = `${Math.round(mirrorRow)},${Math.round(mirrorCol)}`;

    if (grid.cells.has(mirrorKey)) {
      symmetryScore++;
    }
    totalCells++;
  }

  return totalCells > 0 ? symmetryScore / totalCells : 0;
}

/**
 * Score a grid based on quality metrics
 *
 * @param grid - The grid to score
 * @param weights - Weights for each scoring component (should sum to 1.0)
 * @returns Overall score between 0 and 1
 */
export function scoreGrid(grid: Grid, weights: ScoringWeights): number {
  const compactness = calculateCompactness(grid);
  const density = calculateDensity(grid);
  const intersections = calculateIntersectionScore(grid);
  const symmetry = calculateSymmetry(grid);

  return (
    compactness * weights.compactness +
    density * weights.density +
    intersections * weights.intersections +
    symmetry * weights.symmetry
  );
}

/**
 * Calculate detailed metrics for a grid
 */
export function calculateMetrics(grid: Grid): PuzzleMetrics {
  const width = grid.bounds.maxCol - grid.bounds.minCol + 1;
  const height = grid.bounds.maxRow - grid.bounds.minRow + 1;
  const filledCells = grid.cells.size;
  const totalCells = width * height;

  // Count intersections
  const cellUsage = new Map<string, number>();
  for (const placedWord of grid.placedWords) {
    const cells = getWordCells(
      placedWord.word,
      placedWord.row,
      placedWord.col,
      placedWord.direction
    );
    for (const { r, c } of cells) {
      const key = `${r},${c}`;
      cellUsage.set(key, (cellUsage.get(key) || 0) + 1);
    }
  }
  const intersectionCount = Array.from(cellUsage.values()).filter(v => v > 1).length;

  return {
    gridWidth: width,
    gridHeight: height,
    totalCells,
    filledCells,
    density: totalCells > 0 ? filledCells / totalCells : 0,
    intersectionCount,
    overallScore: 0 // Set by caller
  };
}

/**
 * Score a placement candidate for ranking potential placements
 */
export function scorePlacementCandidate(
  word: string,
  row: number,
  col: number,
  direction: 'horizontal' | 'vertical',
  grid: Grid,
  intersections: number
): number {
  // Handle empty grid
  if (grid.cells.size === 0) {
    return 100; // Any placement is fine for first word
  }

  const currentWidth = grid.bounds.maxCol - grid.bounds.minCol + 1;
  const currentHeight = grid.bounds.maxRow - grid.bounds.minRow + 1;

  // Estimate new bounds
  let newMinRow = grid.bounds.minRow;
  let newMaxRow = grid.bounds.maxRow;
  let newMinCol = grid.bounds.minCol;
  let newMaxCol = grid.bounds.maxCol;

  if (direction === 'horizontal') {
    newMinCol = Math.min(newMinCol, col);
    newMaxCol = Math.max(newMaxCol, col + word.length - 1);
    newMinRow = Math.min(newMinRow, row);
    newMaxRow = Math.max(newMaxRow, row);
  } else {
    newMinRow = Math.min(newMinRow, row);
    newMaxRow = Math.max(newMaxRow, row + word.length - 1);
    newMinCol = Math.min(newMinCol, col);
    newMaxCol = Math.max(newMaxCol, col);
  }

  const newWidth = newMaxCol - newMinCol + 1;
  const newHeight = newMaxRow - newMinRow + 1;
  const newArea = newWidth * newHeight;

  // Penalize expansion
  const expansionPenalty = newArea - (currentWidth * currentHeight);

  // Reward compactness
  const aspectRatio = Math.min(newWidth, newHeight) / Math.max(newWidth, newHeight);

  return aspectRatio * 100 - expansionPenalty + intersections * 10;
}
