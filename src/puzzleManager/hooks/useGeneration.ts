/**
 * useGeneration Hook
 * Handles puzzle generation logic
 */

import { useCallback } from "react";
import { generatePuzzle } from "../../puzzleGenerator";
import { usePuzzleHash } from "./usePuzzleHash";
import type { GenerationRequest, Generation, CuratedPuzzle } from "../types";
import enhancedWordlistData from "../../data/enhanced-wordlist.json";

// Type for enhanced wordlist structure
interface EnhancedWordData {
  subWords: string[];
  subWordCount: number;
  funScore: number;
}

interface EnhancedWordlist {
  metadata: {
    version: string;
    generatedAt: string;
    minSubWords: number;
    description: string;
  };
  wordsByLength: Record<string, string[]>;
  words: Record<string, EnhancedWordData>;
  naughtyWords: string[];
}

const enhancedWordlist = enhancedWordlistData as EnhancedWordlist;

// Create dictionary from enhanced wordlist (all sub-words are valid)
const allValidWords = new Set<string>();
for (const wordData of Object.values(enhancedWordlist.words)) {
  for (const subWord of wordData.subWords) {
    allValidWords.add(subWord.toUpperCase());
  }
}
const dictionary = allValidWords;

/**
 * Generate random letters by picking a random word from the enhanced wordlist
 * Words are pre-sorted by fun score, so we bias toward more interesting words
 */
function generateRandomLetters(count: number): string[] {
  const countKey = String(count);
  const wordsForLength = enhancedWordlist.wordsByLength[countKey];

  if (wordsForLength?.length > 0) {
    // Bias toward higher fun score words (they're sorted by fun score descending)
    // Use weighted random: 50% chance from top third, 30% from middle, 20% from bottom
    const third = Math.floor(wordsForLength.length / 3);
    const rand = Math.random();
    let index: number;

    if (rand < 0.5 && third > 0) {
      // Top third (highest fun scores)
      index = Math.floor(Math.random() * third);
    } else if (rand < 0.8 && third * 2 < wordsForLength.length) {
      // Middle third
      index = third + Math.floor(Math.random() * third);
    } else {
      // Bottom third or fallback to any
      index = Math.floor(Math.random() * wordsForLength.length);
    }

    const selectedWord = wordsForLength[index];
    return selectedWord.toUpperCase().split("");
  }

  // Fallback: shouldn't happen with our data
  console.warn(`No words found for length ${count}, using fallback`);
  return "ABCDEFGH".slice(0, count).split("");
}

/**
 * Get fun score for a word from enhanced wordlist
 */
function getFunScore(word: string): number {
  const wordData = enhancedWordlist.words[word.toUpperCase()];
  return wordData?.funScore || 0;
}

/**
 * Get pre-computed sub-words for a set of letters
 */
function getPreComputedSubWords(letters: string[]): string[] | null {
  const word = letters.join("").toUpperCase();
  const wordData = enhancedWordlist.words[word];
  return wordData?.subWords || null;
}

/**
 * Generate random seed
 */
function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000);
}

export function useGeneration() {
  const { hashGrid } = usePuzzleHash();

  const generate = useCallback(
    async (request: GenerationRequest): Promise<Generation> => {
      // Determine letters
      const letters =
        request.letters || generateRandomLetters(request.letterCount);

      // Determine seed
      const seed =
        request.seed !== undefined ? request.seed : generateRandomSeed();

      // Get fun score for the source word
      const sourceWord = letters.join("");
      const funScore = getFunScore(sourceWord);

      console.log("=".repeat(60));
      console.log("[Generation] Starting with:", {
        letters: sourceWord,
        letterCount: request.letterCount,
        seed,
        funScore,
        minWordCount: request.params.minWordCount,
        maxWordCount: request.params.maxWordCount,
      });

      // Try to use pre-computed sub-words for faster generation
      const preComputedSubWords = getPreComputedSubWords(letters);
      if (preComputedSubWords) {
        console.log(
          `\n[Step 1] Using pre-computed sub-words: ${preComputedSubWords.length} words`,
        );
        console.log(
          preComputedSubWords.slice(0, 20).join(", ") +
            (preComputedSubWords.length > 20 ? "..." : ""),
        );
      } else {
        console.log(
          "\n[Step 1] No pre-computed sub-words, will compute at runtime",
        );
      }

      // Generate puzzles
      const result = generatePuzzle(letters, dictionary, {
        ...request.params,
        candidatesToGenerate: request.params.candidatesToGenerate || 10,
      });

      if (!result.success || !result.puzzle || !result.allCandidates) {
        console.log("\n[Step 2] FAILED to generate puzzle");
        console.error("[Error Details]", {
          letters: sourceWord,
          preComputedSubWords: preComputedSubWords?.length || 0,
          error: result.error,
          minWordCount: request.params.minWordCount,
          maxWordCount: request.params.maxWordCount,
        });
        console.log("=".repeat(60));
        throw new Error(
          `${result.error}\n\nLetters: ${sourceWord}\nPre-computed sub-words: ${preComputedSubWords?.length || 0}\nSeed: ${seed}`,
        );
      }

      console.log("\n[Step 2] SUCCESS! Generated puzzles");
      console.log(`Puzzles: ${result.allCandidates.length} candidates`);
      console.log(`Top grid score: ${result.metrics?.overallScore.toFixed(4)}`);
      console.log(`Fun score bonus: ${funScore.toFixed(3)}`);
      console.log(
        `Words in top puzzle: ${result.puzzle.words.map((w) => w.word).join(", ")}`,
      );
      console.log("=".repeat(60));

      // Convert to CuratedPuzzles with hashes and feedback
      // Integrate funScore into overall score (85% grid, 15% fun)
      const curatedPuzzles: CuratedPuzzle[] = result.allCandidates.map(
        (candidate) => {
          const gridHash = hashGrid(candidate.puzzle.grid);
          const gridScore = candidate.metrics.overallScore;
          const combinedScore = gridScore * 0.85 + funScore * 0.15;

          return {
            id: candidate.puzzle.id,
            gridHash,
            score: combinedScore,
            metrics: {
              ...candidate.metrics,
              overallScore: combinedScore,
            },
            grid: candidate.puzzle.grid,
            words: candidate.puzzle.words,
            bonusWords: candidate.puzzle.bonusWords,
            feedback: {
              liked: null,
              notes: undefined,
            },
          };
        },
      );

      // Re-sort by combined score
      curatedPuzzles.sort((a, b) => b.score - a.score);

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
          placementStrategy: request.params.placementStrategy || "longestFirst",
          maxPlacementCandidates: 10,
          maxBacktrackDepth: 5,
          compactnessWeight: request.params.compactnessWeight || 0.4,
          densityWeight: request.params.densityWeight || 0.2,
          intersectionWeight: request.params.intersectionWeight || 0.3,
          symmetryWeight: request.params.symmetryWeight || 0.1,
          candidatesToGenerate: request.params.candidatesToGenerate || 10,
        },
        puzzles: curatedPuzzles,
      };

      return generation;
    },
    [hashGrid],
  );

  return { generate, naughtyWords: enhancedWordlist.naughtyWords };
}
