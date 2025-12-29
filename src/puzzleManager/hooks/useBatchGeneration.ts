/**
 * useBatchGeneration Hook
 * Handles batch puzzle generation for all areas
 */

import { useState, useCallback, useRef } from "react";
import { useGeneration } from "./useGeneration";
import type { BatchGenerationConfig } from "../components/BatchGenerationModal";
import type { Area, Generation } from "../types";
import enhancedWordlistData from "../../data/enhanced-wordlist.json";

// Type for enhanced wordlist structure
interface EnhancedWordlist {
  metadata: {
    version: string;
    generatedAt: string;
    minSubWords: number;
    description: string;
  };
  wordsByLength: Record<string, string[]>;
  words: Record<
    string,
    {
      subWords: string[];
      subWordCount: number;
      funScore: number;
    }
  >;
}

const enhancedWordlist = enhancedWordlistData as EnhancedWordlist;

/**
 * Select unique words for an area, avoiding duplicates
 * Returns array of letter arrays (e.g., [['C','A','T'], ['D','O','G']])
 */
function selectUniqueWordsForArea(
  letterCount: number,
  count: number,
  existingWords: Set<string>,
): string[][] {
  const countKey = String(letterCount);
  const wordsForLength = enhancedWordlist.wordsByLength[countKey] || [];

  if (wordsForLength.length === 0) {
    console.warn(`No words found for length ${letterCount}`);
    return [];
  }

  const selectedWords: string[][] = [];
  const usedInThisBatch = new Set<string>();

  // Try to select 'count' unique words using exponential distribution
  // With more attempts allowed to find unique ones
  const maxAttempts = count * 10;
  let attempts = 0;

  while (selectedWords.length < count && attempts < maxAttempts) {
    attempts++;

    // Use exponential distribution to bias toward high fun score words
    const scale = wordsForLength.length / 4;
    const rand = Math.random();
    const exponentialIndex = Math.floor(
      -Math.log(Math.max(rand, 0.001)) * scale,
    );
    const index = Math.min(exponentialIndex, wordsForLength.length - 1);

    const word = wordsForLength[index].toUpperCase();

    // Skip if already used in this batch or in existing generations
    if (usedInThisBatch.has(word) || existingWords.has(word)) {
      continue;
    }

    usedInThisBatch.add(word);
    selectedWords.push(word.split(""));
  }

  if (selectedWords.length < count) {
    console.warn(
      `Could only find ${selectedWords.length}/${count} unique words for length ${letterCount}`,
    );
  }

  return selectedWords;
}

export interface BatchProgress {
  isRunning: boolean;
  currentArea: string;
  currentWord: number;
  totalAreas: number;
  totalWords: number;
  completedWords: number;
  generatedPuzzles: number;
  errors: string[];
}

interface UseBatchGenerationResult {
  progress: BatchProgress;
  startBatch: (
    areas: Area[],
    config: BatchGenerationConfig,
    onGenerationCreated: (generation: Generation) => void,
    onComplete: () => void,
  ) => Promise<void>;
  cancelBatch: () => void;
}

/**
 * Telemetry logger for batch generation
 */
const BatchTelemetry = {
  startBatch(config: BatchGenerationConfig, totalAreas: number) {
    console.log("\n" + "=".repeat(70));
    console.log("[BATCH] Starting batch generation");
    console.log("=".repeat(70));
    console.log("[BATCH] Config:", {
      wordsPerArea: config.wordsPerArea,
      puzzlesPerWord: config.puzzlesPerWord,
      autoAssign: config.autoAssign,
    });
    console.log(`[BATCH] Total areas: ${totalAreas}`);
    console.log(
      `[BATCH] Total generations to create: ${totalAreas * config.wordsPerArea}`,
    );
    console.log("-".repeat(70));
  },

  startArea(
    areaName: string,
    letterCount: number,
    wordIndex: number,
    totalWords: number,
  ) {
    if (wordIndex === 1) {
      console.log(`\n[BATCH] >>> Area: ${areaName} (${letterCount} letters)`);
    }
    console.log(`[BATCH]   Word ${wordIndex}/${totalWords}...`);
  },

  generationSuccess(
    letters: string,
    puzzleCount: number,
    topScore: number,
    durationMs: number,
  ) {
    console.log(
      `[BATCH]   ✓ "${letters}" → ${puzzleCount} puzzles | ` +
        `Top: ${(topScore * 100).toFixed(0)} | ${durationMs}ms`,
    );
  },

  generationError(error: string) {
    console.error(`[BATCH]   ✗ FAILED: ${error}`);
  },

  cancelled(completed: number, total: number) {
    console.log("\n" + "-".repeat(70));
    console.log(`[BATCH] ⚠ CANCELLED at ${completed}/${total} words`);
    console.log("=".repeat(70) + "\n");
  },

  complete(
    totalGenerations: number,
    totalPuzzles: number,
    errorCount: number,
    durationMs: number,
  ) {
    console.log("\n" + "-".repeat(70));
    console.log("[BATCH] ✓ BATCH COMPLETE");
    console.log("-".repeat(70));
    console.log(`[BATCH] Generations created: ${totalGenerations}`);
    console.log(`[BATCH] Total puzzles: ${totalPuzzles}`);
    console.log(`[BATCH] Errors: ${errorCount}`);
    console.log(`[BATCH] Duration: ${(durationMs / 1000).toFixed(2)}s`);
    console.log("=".repeat(70) + "\n");
  },
};

export function useBatchGeneration(): UseBatchGenerationResult {
  const { generate } = useGeneration();
  const cancelRef = useRef(false);

  const [progress, setProgress] = useState<BatchProgress>({
    isRunning: false,
    currentArea: "",
    currentWord: 0,
    totalAreas: 6,
    totalWords: 0,
    completedWords: 0,
    generatedPuzzles: 0,
    errors: [],
  });

  const startBatch = useCallback(
    async (
      areas: Area[],
      config: BatchGenerationConfig,
      onGenerationCreated: (generation: Generation) => void,
      onComplete: () => void,
    ) => {
      const batchStartTime = performance.now();
      cancelRef.current = false;

      const totalWords = areas.length * config.wordsPerArea;

      BatchTelemetry.startBatch(config, areas.length);

      setProgress({
        isRunning: true,
        currentArea: "",
        currentWord: 0,
        totalAreas: areas.length,
        totalWords,
        completedWords: 0,
        generatedPuzzles: 0,
        errors: [],
      });

      let completedWords = 0;
      let generatedPuzzles = 0;
      const errors: string[] = [];

      // Track all used words across the batch to avoid duplicates
      const usedWordsByLetterCount = new Map<number, Set<string>>();

      for (const area of areas) {
        if (cancelRef.current) break;

        // Get or create the set of used words for this letter count
        if (!usedWordsByLetterCount.has(area.letterCount)) {
          usedWordsByLetterCount.set(area.letterCount, new Set<string>());
        }
        const usedWords = usedWordsByLetterCount.get(area.letterCount)!;

        // Pre-select unique words for this area
        const selectedWords = selectUniqueWordsForArea(
          area.letterCount,
          config.wordsPerArea,
          usedWords,
        );

        // Add selected words to used set
        for (const letters of selectedWords) {
          usedWords.add(letters.join(""));
        }

        console.log(
          `[BATCH] Selected ${selectedWords.length} unique words for ${area.name}: ${selectedWords.map((w) => w.join("")).join(", ")}`,
        );

        // Generate puzzles for each selected word
        for (let wordIndex = 0; wordIndex < selectedWords.length; wordIndex++) {
          if (cancelRef.current) break;

          const letters = selectedWords[wordIndex];

          BatchTelemetry.startArea(
            area.name,
            area.letterCount,
            wordIndex + 1,
            selectedWords.length,
          );

          setProgress((prev) => ({
            ...prev,
            currentArea: area.name,
            currentWord: wordIndex + 1,
          }));

          const genStartTime = performance.now();

          try {
            // Generate puzzles using the pre-selected letters
            const generation = await generate({
              letterCount: area.letterCount,
              letters, // Pass specific letters to avoid random selection
              params: {
                minWordCount: 3,
                maxWordCount: 6,
                candidatesToGenerate: config.puzzlesPerWord,
              },
            });

            const genDuration = Math.round(performance.now() - genStartTime);
            generatedPuzzles += generation.puzzles.length;

            const topScore =
              generation.puzzles.length > 0 ? generation.puzzles[0].score : 0;

            BatchTelemetry.generationSuccess(
              generation.letters.join(""),
              generation.puzzles.length,
              topScore,
              genDuration,
            );

            // Notify parent to save this generation
            onGenerationCreated(generation);
          } catch (error) {
            const errorMsg = `${area.name} word ${wordIndex + 1}: ${(error as Error).message}`;
            errors.push(errorMsg);
            BatchTelemetry.generationError((error as Error).message);
          }

          completedWords++;

          setProgress((prev) => ({
            ...prev,
            completedWords,
            generatedPuzzles,
            errors: [...errors],
          }));
        }
      }

      const batchDuration = Math.round(performance.now() - batchStartTime);

      if (cancelRef.current) {
        BatchTelemetry.cancelled(completedWords, totalWords);
      } else {
        BatchTelemetry.complete(
          completedWords,
          generatedPuzzles,
          errors.length,
          batchDuration,
        );
      }

      setProgress((prev) => ({
        ...prev,
        isRunning: false,
      }));

      // Call completion callback (for auto-assign)
      if (!cancelRef.current) {
        onComplete();
      }
    },
    [generate],
  );

  const cancelBatch = useCallback(() => {
    cancelRef.current = true;
    console.log("[BATCH] Cancel requested...");
  }, []);

  return {
    progress,
    startBatch,
    cancelBatch,
  };
}
