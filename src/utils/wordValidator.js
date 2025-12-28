// Word validation utilities

/**
 * Check if a word is valid for the current puzzle
 * @param {string} word - The word to validate
 * @param {string[]} puzzleWords - Array of valid words for current puzzle
 * @returns {boolean} - True if word is in the puzzle
 */
export const isValidPuzzleWord = (word, puzzleWords) => {
  return puzzleWords.includes(word.toUpperCase());
};

/**
 * Check if a word has already been found
 * @param {string} word - The word to check
 * @param {string[]} foundWords - Array of already found words
 * @returns {boolean} - True if word was already found
 */
export const isAlreadyFound = (word, foundWords) => {
  return foundWords.includes(word.toUpperCase());
};

/**
 * Check if the selected letters can form a word using available letters
 * @param {string[]} selection - Array of selected letters
 * @param {string[]} availableLetters - Array of letters in the puzzle
 * @returns {boolean} - True if selection is valid
 */
export const canFormWord = (selection, availableLetters) => {
  const letterCount = {};

  // Count available letters
  availableLetters.forEach(letter => {
    letterCount[letter] = (letterCount[letter] || 0) + 1;
  });

  // Check if selection uses only available letters
  for (let letter of selection) {
    if (!letterCount[letter] || letterCount[letter] === 0) {
      return false;
    }
    letterCount[letter]--;
  }

  return true;
};
