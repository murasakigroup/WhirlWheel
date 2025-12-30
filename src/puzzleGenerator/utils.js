/**
 * Puzzle Generator Utilities
 * Helper functions for word deduplication and filtering
 */

/**
 * Get letter signature for a word
 * Returns sorted letters as a string for grouping anagrams
 *
 * @param {string} word - The word to get signature for
 * @returns {string} Sorted letters (e.g., "OPT" for both "TOP" and "POT")
 *
 * @example
 * getLetterSignature("TOP") // => "OPT"
 * getLetterSignature("POT") // => "OPT"
 * getLetterSignature("CATS") // => "ACST"
 */
export function getLetterSignature(word) {
  return word.toUpperCase().split('').sort().join('');
}

/**
 * Deduplicate words by their letter signature
 * Groups words with the same letters (anagrams) and keeps only the one with highest fun score
 *
 * @param {Array<{word?: string, funScore: number}>} words - Array of word objects with funScore
 * @returns {{filteredWords: Array, stats: {original: number, filtered: number, kept: number}}}
 *
 * @example
 * const words = [
 *   { word: "TOP", funScore: 0.8 },
 *   { word: "POT", funScore: 0.6 },
 *   { word: "CAT", funScore: 0.9 }
 * ];
 * const result = deduplicateWordsByLetters(words);
 * // result.filteredWords contains TOP and CAT (POT was filtered out)
 * // result.stats = { original: 3, filtered: 1, kept: 2 }
 */
export function deduplicateWordsByLetters(words) {
  if (!words || words.length === 0) {
    return {
      filteredWords: [],
      stats: {
        original: 0,
        filtered: 0,
        kept: 0
      }
    };
  }

  const originalCount = words.length;

  // Group words by their letter signature
  const groups = new Map();

  for (const wordObj of words) {
    // Support both string arrays and objects with 'word' property
    const word = typeof wordObj === 'string' ? wordObj : wordObj.word;
    if (!word) continue;

    const signature = getLetterSignature(word);

    if (!groups.has(signature)) {
      groups.set(signature, []);
    }
    groups.get(signature).push(wordObj);
  }

  // For each group, keep only the word with highest fun score
  const filteredWords = [];

  for (const group of groups.values()) {
    if (group.length === 1) {
      // Only one word with this signature, keep it
      filteredWords.push(group[0]);
    } else {
      // Multiple words (anagrams), keep the one with highest fun score
      const best = group.reduce((prev, current) => {
        const prevScore = typeof prev === 'string' ? 0 : (prev.funScore || 0);
        const currentScore = typeof current === 'string' ? 0 : (current.funScore || 0);
        return currentScore > prevScore ? current : prev;
      });
      filteredWords.push(best);
    }
  }

  const keptCount = filteredWords.length;
  const filteredCount = originalCount - keptCount;

  return {
    filteredWords,
    stats: {
      original: originalCount,
      filtered: filteredCount,
      kept: keptCount
    }
  };
}
