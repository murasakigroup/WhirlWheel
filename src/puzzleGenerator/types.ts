export type Direction = 'horizontal' | 'vertical';

export interface Position {
  row: number;
  col: number;
}

export interface PlacedWord {
  word: string;
  row: number;      // Starting row (can be negative)
  col: number;      // Starting column (can be negative)
  direction: Direction;
}

export interface Cell {
  row: number;
  col: number;
  letter: string;
}

export interface Grid {
  cells: Map<string, string>;  // "row,col" -> letter
  placedWords: PlacedWord[];
  bounds: {
    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;
  };
}

export interface Intersection {
  wordA: string;
  indexA: number;   // Position in wordA where intersection occurs
  wordB: string;
  indexB: number;   // Position in wordB where intersection occurs
  letter: string;   // The shared letter
}

export interface PlacementCandidate {
  word: string;
  row: number;
  col: number;
  direction: Direction;
  intersections: number;  // How many existing words this crosses
  score: number;
}

export interface Puzzle {
  id: string;
  letters: string[];
  words: PlacedWord[];
  bonusWords: string[];   // Valid words not in the grid
  grid: Grid;
}

export interface PuzzleMetrics {
  gridWidth: number;
  gridHeight: number;
  totalCells: number;
  filledCells: number;
  density: number;
  intersectionCount: number;
  overallScore: number;
}

export interface GeneratorParams {
  // Word selection
  minWordLength: number;          // Default: 3
  maxWordLength: number;          // Default: 10
  minWordCount: number;           // Default: 4
  maxWordCount: number;           // Default: 8
  mustIncludeLongestWord: boolean; // Default: true

  // Placement strategy
  placementStrategy: 'longestFirst' | 'mostConnectedFirst' | 'random';
  maxPlacementCandidates: number; // Default: 10
  maxBacktrackDepth: number;      // Default: 5

  // Scoring weights (should sum to 1.0)
  compactnessWeight: number;      // Default: 0.4
  densityWeight: number;          // Default: 0.2
  intersectionWeight: number;     // Default: 0.3
  symmetryWeight: number;         // Default: 0.1

  // Output
  candidatesToGenerate: number;   // Default: 10
}

export interface GeneratorResult {
  success: boolean;
  puzzle?: Puzzle;
  metrics?: PuzzleMetrics;
  allCandidates?: Array<{ puzzle: Puzzle; metrics: PuzzleMetrics }>;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export interface ScoringWeights {
  compactness: number;   // 0-1, how square/tight the grid is
  density: number;       // 0-1, filled cells vs total cells
  intersections: number; // 0-1, number of word crossings
  symmetry: number;      // 0-1, visual balance
}
