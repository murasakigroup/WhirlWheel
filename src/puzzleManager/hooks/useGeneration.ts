/**
 * useGeneration Hook
 * Handles puzzle generation logic
 */

import { useCallback } from 'react';
import { generatePuzzle } from '../../puzzleGenerator';
import { usePuzzleHash } from './usePuzzleHash';
import type { GenerationRequest, Generation, CuratedPuzzle } from '../types';
import wordlistData from '../../data/wordlist.json';

// Create dictionary from wordlist
const dictionary = new Set(wordlistData.words.map(w => w.toUpperCase()));

/**
 * Generate random letters for a given count
 */
function generateRandomLetters(count: number): string[] {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letters: string[] = [];
  for (let i = 0; i < count; i++) {
    letters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
  }
  return letters;
}

/**
 * Generate random seed
 */
function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000);
}

export function useGeneration() {
  const { hashGrid } = usePuzzleHash();

  const generate = useCallback(async (request: GenerationRequest): Promise<Generation> => {
    // Determine letters
    const letters = request.letters || generateRandomLetters(request.letterCount);

    // Determine seed
    const seed = request.seed !== undefined ? request.seed : generateRandomSeed();

    // Generate puzzles
    const result = generatePuzzle(letters, dictionary, {
      ...request.params,
      // Ensure we use the seed for reproducibility
      candidatesToGenerate: request.params.candidatesToGenerate || 10
    });

    if (!result.success || !result.puzzle || !result.allCandidates) {
      throw new Error(result.error || 'Failed to generate puzzles');
    }

    // Convert to CuratedPuzzles with hashes and feedback
    const curatedPuzzles: CuratedPuzzle[] = result.allCandidates.map(candidate => {
      const gridHash = hashGrid(candidate.puzzle.grid);
      return {
        id: candidate.puzzle.id,
        gridHash,
        score: candidate.metrics.overallScore,
        metrics: candidate.metrics,
        grid: candidate.puzzle.grid,
        words: candidate.puzzle.words,
        bonusWords: candidate.puzzle.bonusWords,
        feedback: {
          liked: null,
          notes: undefined
        }
      };
    });

    // Create generation object
    const generation: Generation = {
      id: `gen-${Date.now()}-${seed}`,
      letterCount: request.letterCount,
      letters,
      createdAt: new Date().toISOString(),
      seed,
      params: {
        minWordLength: 3,
        maxWordLength: 10,
        minWordCount: request.params.minWordCount || 4,
        maxWordCount: request.params.maxWordCount || 6,
        mustIncludeLongestWord: true,
        placementStrategy: request.params.placementStrategy || 'longestFirst',
        maxPlacementCandidates: 10,
        maxBacktrackDepth: 5,
        compactnessWeight: request.params.compactnessWeight || 0.4,
        densityWeight: request.params.densityWeight || 0.2,
        intersectionWeight: request.params.intersectionWeight || 0.3,
        symmetryWeight: request.params.symmetryWeight || 0.1,
        candidatesToGenerate: request.params.candidatesToGenerate || 10
      },
      puzzles: curatedPuzzles
    };

    return generation;
  }, [hashGrid]);

  return { generate };
}
