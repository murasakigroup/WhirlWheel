/**
 * Tests for Puzzle Generator Utilities
 */

import { getLetterSignature, deduplicateWordsByLetters } from './utils';

describe('getLetterSignature', () => {
  test('returns sorted letters for a word', () => {
    expect(getLetterSignature('TOP')).toBe('OPT');
    expect(getLetterSignature('POT')).toBe('OPT');
    expect(getLetterSignature('OPT')).toBe('OPT');
  });

  test('handles different case inputs', () => {
    expect(getLetterSignature('top')).toBe('OPT');
    expect(getLetterSignature('Top')).toBe('OPT');
    expect(getLetterSignature('TOP')).toBe('OPT');
  });

  test('handles longer words', () => {
    expect(getLetterSignature('CATS')).toBe('ACST');
    expect(getLetterSignature('CAST')).toBe('ACST');
    expect(getLetterSignature('ACTS')).toBe('ACST');
  });

  test('handles single letter', () => {
    expect(getLetterSignature('A')).toBe('A');
  });

  test('handles repeated letters', () => {
    expect(getLetterSignature('AAA')).toBe('AAA');
    expect(getLetterSignature('BANANA')).toBe('AAABNN');
  });
});

describe('deduplicateWordsByLetters', () => {
  test('filters anagrams and keeps highest fun score', () => {
    const words = [
      { word: 'TOP', funScore: 0.8 },
      { word: 'POT', funScore: 0.6 },
      { word: 'OPT', funScore: 0.5 },
      { word: 'CAT', funScore: 0.9 },
    ];

    const result = deduplicateWordsByLetters(words);

    expect(result.filteredWords).toHaveLength(2);
    expect(result.filteredWords).toContainEqual({ word: 'TOP', funScore: 0.8 });
    expect(result.filteredWords).toContainEqual({ word: 'CAT', funScore: 0.9 });
    expect(result.stats).toEqual({
      original: 4,
      filtered: 2,
      kept: 2,
    });
  });

  test('keeps all non-anagrams', () => {
    const words = [
      { word: 'CAT', funScore: 0.9 },
      { word: 'DOG', funScore: 0.8 },
      { word: 'BAT', funScore: 0.7 },
    ];

    const result = deduplicateWordsByLetters(words);

    expect(result.filteredWords).toHaveLength(3);
    expect(result.stats).toEqual({
      original: 3,
      filtered: 0,
      kept: 3,
    });
  });

  test('handles empty array', () => {
    const result = deduplicateWordsByLetters([]);

    expect(result.filteredWords).toEqual([]);
    expect(result.stats).toEqual({
      original: 0,
      filtered: 0,
      kept: 0,
    });
  });

  test('handles single word', () => {
    const words = [{ word: 'CAT', funScore: 0.9 }];

    const result = deduplicateWordsByLetters(words);

    expect(result.filteredWords).toHaveLength(1);
    expect(result.filteredWords[0]).toEqual({ word: 'CAT', funScore: 0.9 });
    expect(result.stats).toEqual({
      original: 1,
      filtered: 0,
      kept: 1,
    });
  });

  test('handles all anagrams', () => {
    const words = [
      { word: 'TOP', funScore: 0.8 },
      { word: 'POT', funScore: 0.6 },
      { word: 'OPT', funScore: 0.9 },
    ];

    const result = deduplicateWordsByLetters(words);

    expect(result.filteredWords).toHaveLength(1);
    expect(result.filteredWords[0]).toEqual({ word: 'OPT', funScore: 0.9 });
    expect(result.stats).toEqual({
      original: 3,
      filtered: 2,
      kept: 1,
    });
  });

  test('handles words with same fun score', () => {
    const words = [
      { word: 'TOP', funScore: 0.8 },
      { word: 'POT', funScore: 0.8 },
    ];

    const result = deduplicateWordsByLetters(words);

    expect(result.filteredWords).toHaveLength(1);
    expect(result.filteredWords[0].funScore).toBe(0.8);
    expect(result.stats).toEqual({
      original: 2,
      filtered: 1,
      kept: 1,
    });
  });

  test('handles mixed case words', () => {
    const words = [
      { word: 'Top', funScore: 0.8 },
      { word: 'POT', funScore: 0.6 },
      { word: 'opt', funScore: 0.5 },
    ];

    const result = deduplicateWordsByLetters(words);

    expect(result.filteredWords).toHaveLength(1);
    expect(result.filteredWords[0].funScore).toBe(0.8);
    expect(result.stats).toEqual({
      original: 3,
      filtered: 2,
      kept: 1,
    });
  });

  test('handles words with additional properties', () => {
    const words = [
      { word: 'TOP', funScore: 0.8, subWords: ['TO', 'TOP'], subWordCount: 2 },
      { word: 'POT', funScore: 0.6, subWords: ['PO', 'POT'], subWordCount: 2 },
      { word: 'CAT', funScore: 0.9, subWords: ['AT', 'CAT'], subWordCount: 2 },
    ];

    const result = deduplicateWordsByLetters(words);

    expect(result.filteredWords).toHaveLength(2);
    expect(result.filteredWords[0]).toHaveProperty('subWords');
    expect(result.filteredWords[0]).toHaveProperty('subWordCount');
  });

  test('handles null or undefined input gracefully', () => {
    expect(deduplicateWordsByLetters(null).filteredWords).toEqual([]);
    expect(deduplicateWordsByLetters(undefined).filteredWords).toEqual([]);
  });

  test('handles words without word property', () => {
    const words = [
      { funScore: 0.8 },
      { word: 'CAT', funScore: 0.9 },
    ];

    const result = deduplicateWordsByLetters(words);

    expect(result.filteredWords).toHaveLength(1);
    expect(result.filteredWords[0].word).toBe('CAT');
  });

  test('real-world scenario: multiple anagram groups', () => {
    const words = [
      // Group 1: CATS anagrams
      { word: 'CATS', funScore: 0.9 },
      { word: 'CAST', funScore: 0.8 },
      { word: 'ACTS', funScore: 0.7 },
      // Group 2: STOP anagrams
      { word: 'STOP', funScore: 0.95 },
      { word: 'TOPS', funScore: 0.85 },
      { word: 'SPOT', funScore: 0.75 },
      { word: 'POST', funScore: 0.65 },
      // Group 3: unique words
      { word: 'LOVE', funScore: 0.88 },
      { word: 'HATE', funScore: 0.77 },
    ];

    const result = deduplicateWordsByLetters(words);

    expect(result.filteredWords).toHaveLength(4); // CATS, STOP, LOVE, HATE
    expect(result.stats).toEqual({
      original: 9,
      filtered: 5,
      kept: 4,
    });

    // Verify we kept the highest scoring from each group
    const filteredWords = result.filteredWords.map((w) => w.word);
    expect(filteredWords).toContain('CATS'); // 0.9 > 0.8, 0.7
    expect(filteredWords).toContain('STOP'); // 0.95 > 0.85, 0.75, 0.65
    expect(filteredWords).toContain('LOVE');
    expect(filteredWords).toContain('HATE');
  });

  test('handles zero fun score', () => {
    const words = [
      { word: 'TOP', funScore: 0.0 },
      { word: 'POT', funScore: 0.5 },
    ];

    const result = deduplicateWordsByLetters(words);

    expect(result.filteredWords).toHaveLength(1);
    expect(result.filteredWords[0]).toEqual({ word: 'POT', funScore: 0.5 });
  });

  test('handles negative fun score (edge case)', () => {
    const words = [
      { word: 'TOP', funScore: -0.1 },
      { word: 'POT', funScore: 0.5 },
    ];

    const result = deduplicateWordsByLetters(words);

    expect(result.filteredWords).toHaveLength(1);
    expect(result.filteredWords[0]).toEqual({ word: 'POT', funScore: 0.5 });
  });
});
