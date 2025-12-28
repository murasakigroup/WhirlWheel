/**
 * Puzzle Manager Types
 * Data model for curating puzzles for the game
 */

import type {
  Grid,
  PlacedWord,
  PuzzleMetrics,
  GeneratorParams
} from '../puzzleGenerator/types';

export interface GameData {
  areas: Area[];
  generations: Generation[];
}

export interface Area {
  id: string;           // "home", "forest", etc.
  name: string;         // "Home", "Forest", etc.
  letterCount: number;  // 3, 4, 5, 6, 7, 8
  locations: Location[];
}

export interface Location {
  id: string;              // "home-bedroom", "forest-trail"
  name: string;            // "Bedroom", "Trail"
  areaId: string;
  assignedPuzzleId?: string;  // ID of the liked puzzle assigned here
}

export interface Generation {
  id: string;              // Hash-based ID
  letterCount: number;     // Which letter count this is for
  letters: string[];       // e.g., ["C", "A", "T"]
  createdAt: string;       // ISO timestamp
  seed: number;
  params: GeneratorParams;
  puzzles: CuratedPuzzle[];
}

export interface CuratedPuzzle {
  id: string;              // From generator
  gridHash: string;        // Hash of grid for deduplication
  score: number;
  metrics: PuzzleMetrics;
  grid: Grid;
  words: PlacedWord[];
  bonusWords: string[];
  feedback: PuzzleFeedback;
}

export interface PuzzleFeedback {
  liked: boolean | null;  // null = unrated, true = liked, false = skipped
  notes?: string;
}

export interface GenerationRequest {
  letterCount: number;
  letters?: string[];      // If not provided, random letters for the count
  seed?: number;           // If not provided, random
  params: Partial<GeneratorParams>;
}
