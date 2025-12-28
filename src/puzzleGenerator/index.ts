/**
 * Puzzle Generator Module
 * Public API for generating Wordscapes-style crossword puzzles.
 */

// Main generator
export { generatePuzzle, printGrid } from './generator';

// Word finding
export { findValidWords } from './wordFinder';

// Intersection graph
export { buildIntersectionGraph, getIntersections, countWordConnections } from './intersectionGraph';

// Grid placement
export {
  createGrid,
  cloneGrid,
  getCell,
  setCell,
  getWordCells,
  validatePlacement,
  placeWord,
  findValidPlacements,
  isGridConnected,
  normalizeGrid
} from './gridPlacer';

// Grid scoring
export { scoreGrid, calculateMetrics, scorePlacementCandidate } from './gridScorer';

// Types
export type {
  Direction,
  Position,
  PlacedWord,
  Cell,
  Grid,
  Intersection,
  PlacementCandidate,
  Puzzle,
  PuzzleMetrics,
  GeneratorParams,
  GeneratorResult,
  ValidationResult,
  ScoringWeights
} from './types';
