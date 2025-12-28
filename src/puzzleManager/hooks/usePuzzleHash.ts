/**
 * usePuzzleHash Hook
 * Generates a hash for puzzle grids to detect duplicates
 */

import { useCallback } from 'react';
import type { Grid } from '../../puzzleGenerator/types';

/**
 * Simple string hash function (djb2)
 */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash).toString(36);
}

/**
 * Normalize and hash a grid layout
 * Same visual layout = same hash (ignores absolute positions)
 */
export function usePuzzleHash() {
  const hashGrid = useCallback((grid: Grid): string => {
    // Normalize grid to start at 0,0
    const minRow = grid.bounds.minRow;
    const minCol = grid.bounds.minCol;

    // Create sorted array of normalized cell positions
    const cells: string[] = [];
    for (const [key, letter] of grid.cells) {
      const [row, col] = key.split(',').map(Number);
      const normalizedRow = row - minRow;
      const normalizedCol = col - minCol;
      cells.push(`${normalizedRow},${normalizedCol}:${letter}`);
    }

    // Sort to ensure consistent ordering
    cells.sort();

    // Create hash from sorted cells
    const gridString = cells.join('|');
    return hashString(gridString);
  }, []);

  return { hashGrid };
}
