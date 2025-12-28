/**
 * useGeneration Hook
 * Handles puzzle generation logic
 */

import { useCallback } from "react";
import { generatePuzzle, findValidWords } from "../../puzzleGenerator";
import { usePuzzleHash } from "./usePuzzleHash";
import type { GenerationRequest, Generation, CuratedPuzzle } from "../types";
import wordlistData from "../../data/wordlist.json";

// Create dictionary from wordlist
const dictionary = new Set(wordlistData.words.map((w) => w.toUpperCase()));

/**
 * Generate random letters by picking a random word from the dictionary
 * Guarantees at least one valid word exists
 */
function generateRandomLetters(count: number): string[] {
  // Filter words by length
  const wordsOfLength = wordlistData.words.filter((w) => w.length === count);

  if (wordsOfLength.length === 0) {
    // Fallback: pick any word and use its letters
    const randomWord =
      wordlistData.words[Math.floor(Math.random() * wordlistData.words.length)];
    return randomWord.toUpperCase().split("").slice(0, count);
  }

  // Pick a random word of the desired length
  const randomWord =
    wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)];
  return randomWord.toUpperCase().split("");
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

      console.log("=".repeat(60));
      console.log("[Generation] Starting with:", {
        letters: letters.join(""),
        letterCount: request.letterCount,
        seed,
        minWordCount: request.params.minWordCount,
        maxWordCount: request.params.maxWordCount,
      });

      // Step 1: Find valid words first
      const validWords = findValidWords(letters, dictionary, {
        minLength: 3,
        maxLength: 10,
      });

      console.log(`\n[Step 1] Found ${validWords.length} valid words:`);
      console.log(
        validWords.slice(0, 20).join(", ") +
          (validWords.length > 20 ? "..." : ""),
      );

      // Generate puzzles
      const result = generatePuzzle(letters, dictionary, {
        ...request.params,
        // Ensure we use the seed for reproducibility
        candidatesToGenerate: request.params.candidatesToGenerate || 10,
      });

      if (!result.success || !result.puzzle || !result.allCandidates) {
        console.log("\n[Step 2] FAILED to generate puzzle");
        console.error("[Error Details]", {
          letters: letters.join(""),
          validWordsFound: validWords.length,
          error: result.error,
          minWordCount: request.params.minWordCount,
          maxWordCount: request.params.maxWordCount,
        });
        console.log("=".repeat(60));
        throw new Error(
          `${result.error}\n\nLetters: ${letters.join("")}\nValid words found: ${validWords.length}\nWords: ${validWords.join(", ")}\nSeed: ${seed}`,
        );
      }

      console.log("\n[Step 2] SUCCESS! Generated puzzles");
      console.log(`Puzzles: ${result.allCandidates.length} candidates`);
      console.log(`Top score: ${result.metrics?.overallScore.toFixed(4)}`);
      console.log(
        `Words in top puzzle: ${result.puzzle.words.map((w) => w.word).join(", ")}`,
      );
      console.log("=".repeat(60));

      // Convert to CuratedPuzzles with hashes and feedback
      const curatedPuzzles: CuratedPuzzle[] = result.allCandidates.map(
        (candidate) => {
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
              notes: undefined,
            },
          };
        },
      );

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

  return { generate };
}
