/**
 * useGeneration Hook
 * Handles puzzle generation logic
 */

import { useCallback } from "react";
import { generatePuzzle } from "../../puzzleGenerator";
import { usePuzzleHash } from "./usePuzzleHash";
import type { GenerationRequest, Generation, CuratedPuzzle } from "../types";
import enhancedWordlistData from "../../data/enhanced-wordlist.json";
import { deduplicateWordsByLetters } from "../../puzzleGenerator/utils";

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
}

const enhancedWordlist = enhancedWordlistData as EnhancedWordlist;

// Deduplicate words by letter signature to avoid generating similar puzzles
// Convert words object to array format for deduplication
const wordsArray = Object.entries(enhancedWordlist.words).map(
  ([word, data]) => ({
    word,
    funScore: data.funScore,
    subWords: data.subWords,
    subWordCount: data.subWordCount,
  }),
);

const deduplicationResult = deduplicateWordsByLetters(wordsArray);
console.log(
  `[Deduplication] Filtered ${deduplicationResult.stats.filtered} anagrams from ${deduplicationResult.stats.original} words → ${deduplicationResult.stats.kept} unique puzzles available`,
);

// Rebuild enhanced wordlist with filtered words
const filteredWords: Record<string, EnhancedWordData> = {};
const filteredWordsByLength: Record<string, string[]> = {};

for (const wordObj of deduplicationResult.filteredWords) {
  filteredWords[wordObj.word] = {
    subWords: wordObj.subWords,
    subWordCount: wordObj.subWordCount,
    funScore: wordObj.funScore,
  };

  const length = String(wordObj.word.length);
  if (!filteredWordsByLength[length]) {
    filteredWordsByLength[length] = [];
  }
  filteredWordsByLength[length].push(wordObj.word);
}

// Sort each length group by fun score (descending) to maintain biased selection
for (const length in filteredWordsByLength) {
  filteredWordsByLength[length].sort((a, b) => {
    const scoreA = filteredWords[a]?.funScore || 0;
    const scoreB = filteredWords[b]?.funScore || 0;
    return scoreB - scoreA;
  });
}

const filteredEnhancedWordlist = {
  metadata: enhancedWordlist.metadata,
  wordsByLength: filteredWordsByLength,
  words: filteredWords,
};

// Create dictionary from filtered enhanced wordlist (all sub-words are valid)
const allValidWords = new Set<string>();
for (const wordData of Object.values(filteredEnhancedWordlist.words)) {
  for (const subWord of wordData.subWords) {
    allValidWords.add(subWord.toUpperCase());
  }
}
const dictionary = allValidWords;

/**
 * Generate random letters by picking a random word from the filtered enhanced wordlist
 * Words are pre-sorted by fun score, so we bias heavily toward interesting words
 * Uses exponential decay to strongly favor top-ranked words
 */
function generateRandomLetters(count: number): string[] {
  const countKey = String(count);
  const wordsForLength = filteredEnhancedWordlist.wordsByLength[countKey];

  if (wordsForLength?.length > 0) {
    // Use exponential distribution to heavily bias toward index 0 (highest fun score)
    // Formula: index = floor(-ln(rand) * scale), clamped to list length
    // With scale = length/4, ~63% of picks are from top 25%, ~86% from top 50%
    const scale = wordsForLength.length / 4;
    const rand = Math.random();
    // Avoid log(0) by using max(rand, small value)
    const exponentialIndex = Math.floor(
      -Math.log(Math.max(rand, 0.001)) * scale,
    );
    const index = Math.min(exponentialIndex, wordsForLength.length - 1);

    const selectedWord = wordsForLength[index];
    return selectedWord.toUpperCase().split("");
  }

  // Fallback: shouldn't happen with our data
  console.warn(`No words found for length ${count}, using fallback`);
  return "ABCDEFGH".slice(0, count).split("");
}

/**
 * Get fun score for a word from filtered enhanced wordlist
 */
function getFunScore(word: string): number {
  const wordData = filteredEnhancedWordlist.words[word.toUpperCase()];
  return wordData?.funScore || 0;
}

/**
 * Get pre-computed sub-words for a set of letters
 */
function getPreComputedSubWords(letters: string[]): string[] | null {
  const word = letters.join("").toUpperCase();
  const wordData = filteredEnhancedWordlist.words[word];
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
      const seenHashes = new Set<string>();
      const curatedPuzzles: CuratedPuzzle[] = [];

      for (const candidate of result.allCandidates) {
        const gridHash = hashGrid(candidate.puzzle.grid);

        // Deduplicate by gridHash
        if (seenHashes.has(gridHash)) {
          continue;
        }
        seenHashes.add(gridHash);

        const gridScore = candidate.metrics.overallScore;
        const combinedScore = gridScore * 0.85 + funScore * 0.15;

        curatedPuzzles.push({
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
        });
      }

      console.log(
        `[Dedup] ${result.allCandidates.length} candidates → ${curatedPuzzles.length} unique`,
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
        funScore,
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
