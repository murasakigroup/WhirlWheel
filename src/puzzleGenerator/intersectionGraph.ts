/**
 * Intersection Graph Module
 * Precomputes all possible intersections between words.
 */

import type { Intersection } from './types';

/**
 * Build a graph of all possible intersections between words
 *
 * @param words - List of valid words
 * @returns Map where intersections[wordA][wordB] = array of possible crossing points
 */
export function buildIntersectionGraph(
  words: string[]
): Map<string, Map<string, Intersection[]>> {
  const graph = new Map<string, Map<string, Intersection[]>>();

  // Initialize empty maps for each word
  for (const word of words) {
    graph.set(word, new Map());
  }

  // Find all intersections between each pair of words
  for (let i = 0; i < words.length; i++) {
    const wordA = words[i];

    for (let j = 0; j < words.length; j++) {
      if (i === j) continue; // Skip same word

      const wordB = words[j];
      const intersections: Intersection[] = [];

      // Check each position in wordA against each position in wordB
      for (let indexA = 0; indexA < wordA.length; indexA++) {
        for (let indexB = 0; indexB < wordB.length; indexB++) {
          if (wordA[indexA] === wordB[indexB]) {
            intersections.push({
              wordA,
              indexA,
              wordB,
              indexB,
              letter: wordA[indexA]
            });
          }
        }
      }

      // Only store if there are intersections
      if (intersections.length > 0) {
        graph.get(wordA)!.set(wordB, intersections);
      }
    }
  }

  return graph;
}

/**
 * Get intersections between two specific words
 *
 * @param graph - The intersection graph
 * @param wordA - First word
 * @param wordB - Second word
 * @returns Array of intersections between the two words
 */
export function getIntersections(
  graph: Map<string, Map<string, Intersection[]>>,
  wordA: string,
  wordB: string
): Intersection[] {
  return graph.get(wordA)?.get(wordB) || [];
}

/**
 * Count total possible intersections for a word with all other words
 * Useful for ordering words by connectivity
 *
 * @param graph - The intersection graph
 * @param word - The word to check
 * @returns Total number of intersection possibilities
 */
export function countWordConnections(
  graph: Map<string, Map<string, Intersection[]>>,
  word: string
): number {
  const wordIntersections = graph.get(word);
  if (!wordIntersections) return 0;

  let total = 0;
  for (const intersections of wordIntersections.values()) {
    total += intersections.length;
  }
  return total;
}
