/**
 * Main Generator Module
 * Orchestrates the full puzzle generation process.
 */

import { findValidWords } from './wordFinder';
import { buildIntersectionGraph, countWordConnections } from './intersectionGraph';
import {
  createGrid,
  findValidPlacements,
  placeWord,
  isGridConnected,
  normalizeGrid
} from './gridPlacer';
import { scoreGrid, calculateMetrics, scorePlacementCandidate } from './gridScorer';
import type {
  GeneratorParams,
  GeneratorResult,
  Puzzle,
  Grid,
  Intersection
} from './types';

const DEFAULT_PARAMS: GeneratorParams = {
  minWordLength: 3,
  maxWordLength: 10,
  minWordCount: 4,
  maxWordCount: 8,
  mustIncludeLongestWord: true,
  placementStrategy: 'longestFirst',
  maxPlacementCandidates: 10,
  maxBacktrackDepth: 5,
  compactnessWeight: 0.4,
  densityWeight: 0.2,
  intersectionWeight: 0.3,
  symmetryWeight: 0.1,
  candidatesToGenerate: 10
};

/**
 * Generate a puzzle from a set of letters
 *
 * @param letters - Array of available letters
 * @param dictionary - Set of valid dictionary words
 * @param params - Configuration parameters (optional)
 * @returns GeneratorResult with puzzle and metrics
 */
export function generatePuzzle(
  letters: string[],
  dictionary: Set<string>,
  params: Partial<GeneratorParams> = {}
): GeneratorResult {
  const config = { ...DEFAULT_PARAMS, ...params };

  try {
    // Step 1: Find valid words
    const validWords = findValidWords(letters, dictionary, {
      minLength: config.minWordLength,
      maxLength: config.maxWordLength
    });

    if (validWords.length < config.minWordCount) {
      return {
        success: false,
        error: `Not enough valid words. Found ${validWords.length}, need at least ${config.minWordCount}`
      };
    }

    // Step 2: Build intersection graph
    const intersectionGraph = buildIntersectionGraph(validWords);

    // Step 3: Select words for puzzle
    const selectedWords = selectWords(validWords, intersectionGraph, config);

    // Step 4: Generate grid layouts
    const candidates = generateGridCandidates(
      selectedWords,
      intersectionGraph,
      config
    );

    if (candidates.length === 0) {
      return {
        success: false,
        error: 'Could not generate any valid grid layouts'
      };
    }

    // Step 5: Score and rank
    const scored = candidates.map(grid => {
      const normalizedGrid = normalizeGrid(grid);
      const score = scoreGrid(normalizedGrid, {
        compactness: config.compactnessWeight,
        density: config.densityWeight,
        intersections: config.intersectionWeight,
        symmetry: config.symmetryWeight
      });
      const metrics = calculateMetrics(normalizedGrid);
      metrics.overallScore = score;

      const puzzle: Puzzle = {
        id: generateId(),
        letters: letters.map(l => l.toUpperCase()),
        words: normalizedGrid.placedWords,
        bonusWords: validWords.filter(w => !normalizedGrid.placedWords.some(pw => pw.word === w)),
        grid: normalizedGrid
      };

      return { puzzle, metrics };
    });

    // Sort by score descending
    scored.sort((a, b) => b.metrics.overallScore - a.metrics.overallScore);

    // Return best
    return {
      success: true,
      puzzle: scored[0].puzzle,
      metrics: scored[0].metrics,
      allCandidates: scored.slice(0, config.candidatesToGenerate)
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Select which words to include in the puzzle
 */
function selectWords(
  words: string[],
  intersectionGraph: Map<string, Map<string, Intersection[]>>,
  config: GeneratorParams
): string[] {
  let selected = [...words];

  // Sort based on strategy
  if (config.placementStrategy === 'mostConnectedFirst') {
    selected.sort((a, b) => {
      const connectionsA = countWordConnections(intersectionGraph, a);
      const connectionsB = countWordConnections(intersectionGraph, b);
      if (connectionsB !== connectionsA) {
        return connectionsB - connectionsA;
      }
      return b.length - a.length; // Fallback to length
    });
  } else {
    // Default: sort by length descending
    selected.sort((a, b) => b.length - a.length);
  }

  // Take top N words (between min and max count)
  const targetCount = Math.min(config.maxWordCount, selected.length);
  selected = selected.slice(0, targetCount);

  return selected;
}

/**
 * Generate multiple grid layout candidates
 */
function generateGridCandidates(
  words: string[],
  intersectionGraph: Map<string, Map<string, Intersection[]>>,
  config: GeneratorParams
): Grid[] {
  const results: Grid[] = [];

  // Try multiple generation attempts with different orderings
  for (let attempt = 0; attempt < config.candidatesToGenerate * 2; attempt++) {
    const grid = tryGenerateGrid(words, intersectionGraph, config, attempt);
    if (grid && isGridConnected(grid)) {
      results.push(grid);
    }

    if (results.length >= config.candidatesToGenerate) {
      break;
    }
  }

  return results;
}

/**
 * Attempt to generate a single grid
 */
function tryGenerateGrid(
  words: string[],
  intersectionGraph: Map<string, Map<string, Intersection[]>>,
  config: GeneratorParams,
  seed: number
): Grid | null {
  // Order words based on strategy and seed for variation
  const orderedWords = orderWords(words, intersectionGraph, config.placementStrategy, seed);

  // Recursive placement with backtracking
  return placeWordsRecursively(
    orderedWords,
    0,
    createGrid(),
    intersectionGraph,
    config
  );
}

/**
 * Recursively place words with backtracking
 */
function placeWordsRecursively(
  words: string[],
  index: number,
  grid: Grid,
  intersectionGraph: Map<string, Map<string, Intersection[]>>,
  config: GeneratorParams
): Grid | null {
  // Base case: all words placed
  if (index >= words.length) {
    return grid;
  }

  const word = words[index];
  const candidates = findValidPlacements(word, grid, intersectionGraph);

  // Score candidates
  const scoredCandidates = candidates.map(c => ({
    ...c,
    score: scorePlacementCandidate(c.word, c.row, c.col, c.direction, grid, c.intersections)
  }));

  // Sort by score descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  // Try top candidates
  const toTry = scoredCandidates.slice(0, config.maxPlacementCandidates);

  for (const candidate of toTry) {
    try {
      const newGrid = placeWord(grid, candidate.word, candidate.row, candidate.col, candidate.direction);

      // Recurse
      const result = placeWordsRecursively(
        words,
        index + 1,
        newGrid,
        intersectionGraph,
        config
      );

      if (result) {
        return result;
      }
    } catch {
      // Invalid placement, try next candidate
    }
  }

  return null; // Could not place this word
}

/**
 * Order words for placement attempts
 */
function orderWords(
  words: string[],
  intersectionGraph: Map<string, Map<string, Intersection[]>>,
  strategy: string,
  seed: number
): string[] {
  const ordered = [...words];

  switch (strategy) {
    case 'longestFirst':
      ordered.sort((a, b) => b.length - a.length);
      break;
    case 'random':
      // Fisher-Yates shuffle with seed
      for (let i = ordered.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
      }
      break;
    case 'mostConnectedFirst':
      ordered.sort((a, b) => {
        const connectionsA = countWordConnections(intersectionGraph, a);
        const connectionsB = countWordConnections(intersectionGraph, b);
        return connectionsB - connectionsA;
      });
      break;
  }

  // Add some randomness for variation when seed > 0
  if (seed > 0 && strategy !== 'random') {
    // Occasionally swap adjacent elements for variety
    for (let i = 0; i < ordered.length - 1; i++) {
      if (seededRandom(seed * 100 + i) > 0.7) {
        [ordered[i], ordered[i + 1]] = [ordered[i + 1], ordered[i]];
      }
    }
  }

  return ordered;
}

/**
 * Simple seeded random number generator
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate a unique puzzle ID
 */
function generateId(): string {
  return `puzzle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Helper function to print a grid to console (for debugging)
 */
export function printGrid(grid: Grid): string {
  const { minRow, maxRow, minCol, maxCol } = grid.bounds;
  const lines: string[] = [];

  for (let row = minRow; row <= maxRow; row++) {
    let line = '';
    for (let col = minCol; col <= maxCol; col++) {
      const cell = grid.cells.get(`${row},${col}`);
      line += cell ? cell : '.';
    }
    lines.push(line);
  }

  return lines.join('\n');
}
