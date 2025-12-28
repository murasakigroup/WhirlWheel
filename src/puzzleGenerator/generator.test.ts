/**
 * Puzzle Generator Tests
 * Tests the puzzle generation with the letters H, O, M, E, W, O, R, K
 */

import { generatePuzzle, printGrid, findValidWords, buildIntersectionGraph } from './index';
import wordlistData from '../data/wordlist.json';

// Create dictionary from wordlist
const dictionary = new Set(wordlistData.words.map(w => w.toUpperCase()));

// Test letters
const testLetters = ['H', 'O', 'M', 'E', 'W', 'O', 'R', 'K'];

console.log('='.repeat(60));
console.log('PUZZLE GENERATOR TEST');
console.log('='.repeat(60));
console.log(`\nTest letters: ${testLetters.join(', ')}\n`);

// Step 1: Test word finding
console.log('--- Step 1: Finding Valid Words ---\n');
const validWords = findValidWords(testLetters, dictionary, {
  minLength: 3,
  maxLength: 10
});
console.log(`Found ${validWords.length} valid words:`);
console.log(validWords.join(', '));
console.log();

// Step 2: Test intersection graph
console.log('--- Step 2: Building Intersection Graph ---\n');
const graph = buildIntersectionGraph(validWords.slice(0, 8)); // Use top 8 words
console.log('Intersection graph built for top 8 words');
console.log(`Words: ${validWords.slice(0, 8).join(', ')}`);
console.log();

// Step 3: Generate puzzle
console.log('--- Step 3: Generating Puzzle ---\n');
const result = generatePuzzle(testLetters, dictionary, {
  minWordCount: 4,
  maxWordCount: 6,
  compactnessWeight: 0.5,
  densityWeight: 0.2,
  intersectionWeight: 0.2,
  symmetryWeight: 0.1,
  candidatesToGenerate: 3
});

if (result.success && result.puzzle) {
  console.log('SUCCESS! Puzzle generated.\n');

  console.log('--- Puzzle Details ---\n');
  console.log(`Puzzle ID: ${result.puzzle.id}`);
  console.log(`Letters: ${result.puzzle.letters.join(', ')}`);
  console.log(`\nWords in grid (${result.puzzle.words.length}):`);
  for (const pw of result.puzzle.words) {
    console.log(`  - ${pw.word} at (${pw.row}, ${pw.col}) ${pw.direction}`);
  }

  console.log(`\nBonus words (${result.puzzle.bonusWords.length}):`);
  console.log(`  ${result.puzzle.bonusWords.slice(0, 10).join(', ')}${result.puzzle.bonusWords.length > 10 ? '...' : ''}`);

  console.log('\n--- Grid Visualization ---\n');
  console.log(printGrid(result.puzzle.grid));

  console.log('\n--- Metrics ---\n');
  if (result.metrics) {
    console.log(`Grid size: ${result.metrics.gridWidth} x ${result.metrics.gridHeight}`);
    console.log(`Filled cells: ${result.metrics.filledCells} / ${result.metrics.totalCells}`);
    console.log(`Density: ${(result.metrics.density * 100).toFixed(1)}%`);
    console.log(`Intersections: ${result.metrics.intersectionCount}`);
    console.log(`Overall score: ${result.metrics.overallScore.toFixed(4)}`);
  }

  if (result.allCandidates && result.allCandidates.length > 1) {
    console.log(`\n--- Other Candidates (${result.allCandidates.length - 1}) ---\n`);
    for (let i = 1; i < result.allCandidates.length; i++) {
      const candidate = result.allCandidates[i];
      console.log(`Candidate ${i + 1} (score: ${candidate.metrics.overallScore.toFixed(4)}):`);
      console.log(printGrid(candidate.puzzle.grid));
      console.log();
    }
  }
} else {
  console.log('FAILED to generate puzzle.');
  console.log(`Error: ${result.error}`);
}

console.log('\n' + '='.repeat(60));
console.log('TEST COMPLETE');
console.log('='.repeat(60));
