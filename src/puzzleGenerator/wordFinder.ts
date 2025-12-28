/**
 * Word Finder Module
 * Finds all valid words that can be formed from a given set of letters.
 */

/**
 * Count the occurrences of each letter in an array
 */
function countLetters(letters: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const letter of letters) {
    const upper = letter.toUpperCase();
    counts.set(upper, (counts.get(upper) || 0) + 1);
  }
  return counts;
}

/**
 * Check if a word can be formed from the available letters
 */
function canFormWord(word: string, availableLetters: Map<string, number>): boolean {
  const needed = countLetters(word.toUpperCase().split(''));
  for (const [letter, count] of needed) {
    if ((availableLetters.get(letter) || 0) < count) {
      return false;
    }
  }
  return true;
}

/**
 * Find all valid words that can be formed from the given letters
 *
 * @param letters - Array of available letters (e.g., ['H', 'O', 'M', 'E', 'W', 'O', 'R', 'K'])
 * @param dictionary - Set of valid dictionary words
 * @param params - Min and max word length constraints
 * @returns Array of valid words sorted by length (descending), then alphabetically
 */
export function findValidWords(
  letters: string[],
  dictionary: Set<string>,
  params: { minLength: number; maxLength: number }
): string[] {
  const { minLength, maxLength } = params;

  // Count available letters (handle duplicates)
  const letterCounts = countLetters(letters);

  const validWords: string[] = [];

  // Check each word in dictionary
  for (const word of dictionary) {
    // Skip if word length is outside bounds
    if (word.length < minLength || word.length > maxLength) {
      continue;
    }

    // Check if word can be formed from available letters
    if (canFormWord(word, letterCounts)) {
      validWords.push(word.toUpperCase());
    }
  }

  // Sort by length (descending), then alphabetically
  validWords.sort((a, b) => {
    if (b.length !== a.length) {
      return b.length - a.length;
    }
    return a.localeCompare(b);
  });

  return validWords;
}
