/**
 * Generate Enhanced Wordlist
 *
 * This script analyzes the existing wordlist and creates an enhanced version with:
 * - Pre-computed sub-words for each word
 * - Fun scores to prioritize interesting words
 * - Naughty word filtering
 *
 * Usage: node scripts/generate-curated-wordlist.cjs
 */

const fs = require("fs");
const path = require("path");

// Load the wordlist
const wordlistPath = path.join(__dirname, "..", "src", "data", "wordlist.json");
const wordlistData = JSON.parse(fs.readFileSync(wordlistPath, "utf8"));
const allWords = wordlistData.words.map((w) => w.toUpperCase());
const dictionary = new Set(allWords);

// Load naughty words
const naughtyPath = path.join(
  __dirname,
  "..",
  "src",
  "data",
  "naughty-words.json",
);
const naughtyData = JSON.parse(fs.readFileSync(naughtyPath, "utf8"));
const excludedWords = new Set(naughtyData.excluded.map((w) => w.toUpperCase()));
const easterEggWords = naughtyData.easterEgg.map((w) => w.toUpperCase());

/**
 * Count letter occurrences
 */
function countLetters(word) {
  const counts = new Map();
  for (const letter of word.toUpperCase()) {
    counts.set(letter, (counts.get(letter) || 0) + 1);
  }
  return counts;
}

/**
 * Check if a word can be formed from available letters
 */
function canFormWord(word, availableLetters) {
  const needed = countLetters(word);
  for (const [letter, count] of needed) {
    if ((availableLetters.get(letter) || 0) < count) {
      return false;
    }
  }
  return true;
}

/**
 * Find all valid sub-words that can be formed from a word's letters
 * Excludes naughty words from the result
 */
function findSubWords(word, minLength = 3) {
  const letterCounts = countLetters(word);
  const subWords = [];

  for (const dictWord of dictionary) {
    // Skip if too short
    if (dictWord.length < minLength) {
      continue;
    }
    // Skip if longer than parent word
    if (dictWord.length > word.length) {
      continue;
    }
    // Skip naughty words
    if (excludedWords.has(dictWord)) {
      continue;
    }
    // Check if can be formed
    if (canFormWord(dictWord, letterCounts)) {
      subWords.push(dictWord);
    }
  }

  // Sort by length (descending), then alphabetically
  subWords.sort((a, b) => {
    if (b.length !== a.length) return b.length - a.length;
    return a.localeCompare(b);
  });

  return subWords;
}

/**
 * Calculate RAW fun score for a word (before percentile normalization)
 *
 * Factors:
 * 1. Letter diversity (0.2 weight) - unique letters / word length
 * 2. Sub-word variety (0.2 weight) - std dev of sub-word lengths
 * 3. Sub-word count bonus (0.3 weight) - normalized by letter count
 * 4. Meaty ratio (0.15 weight) - ratio of 4+ letter sub-words
 * 5. Long word bonus (0.15 weight) - bonus for having 5+ letter sub-words
 */
function calculateRawFunScore(word, subWords) {
  // 1. Letter diversity: unique letters / word length (reduced weight)
  const uniqueLetters = new Set(word.toUpperCase()).size;
  const letterDiversity = uniqueLetters / word.length;

  // 2. Sub-word variety: standard deviation of lengths
  let subWordVariety = 0;
  if (subWords.length > 1) {
    const lengths = subWords.map((w) => w.length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance =
      lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) /
      lengths.length;
    const stdDev = Math.sqrt(variance);
    // Normalize: max std dev for lengths 3-8 is about 2.5
    subWordVariety = Math.min(1, stdDev / 2.5);
  }

  // 3. Sub-word count bonus: normalized by expected max for word length
  const expectedMax = {
    3: 3,
    4: 12,
    5: 30,
    6: 50,
    7: 80,
    8: 100,
  };
  const maxForLength = expectedMax[word.length] || 50;
  const subWordBonus = Math.min(1, subWords.length / maxForLength);

  // 4. Meaty ratio: proportion of sub-words that are 4+ letters
  const meatyCount = subWords.filter((w) => w.length >= 4).length;
  const meatyRatio = subWords.length > 0 ? meatyCount / subWords.length : 0;

  // 5. Long word bonus: reward for having 5+ letter sub-words (max at 5)
  const longWords = subWords.filter((w) => w.length >= 5).length;
  const longWordBonus = Math.min(1, longWords / 5);

  // Weighted combination (raw score, will be normalized to percentile later)
  const rawScore =
    letterDiversity * 0.2 +
    subWordVariety * 0.2 +
    subWordBonus * 0.3 +
    meatyRatio * 0.15 +
    longWordBonus * 0.15;

  return rawScore;
}

/**
 * Convert raw scores to percentile ranks within each length bucket
 * Returns a map of word -> percentile (0.0 - 1.0)
 */
function normalizeToPercentiles(wordsByLength, rawScores) {
  const percentiles = {};

  for (const len of Object.keys(wordsByLength)) {
    const wordsAtLength = wordsByLength[len];
    if (wordsAtLength.length === 0) continue;

    // Sort by raw score ascending
    const sorted = [...wordsAtLength].sort(
      (a, b) => rawScores[a] - rawScores[b],
    );

    // Assign percentile rank
    for (let i = 0; i < sorted.length; i++) {
      const word = sorted[i];
      // Percentile: position / (total - 1), so best word gets 1.0
      const percentile = sorted.length > 1 ? i / (sorted.length - 1) : 0.5;
      percentiles[word] = Math.round(percentile * 1000) / 1000;
    }
  }

  return percentiles;
}

/**
 * Main function
 */
function main() {
  console.log("Generating enhanced wordlist...");
  console.log(`Total words in dictionary: ${allWords.length}`);
  console.log(`Excluded naughty words: ${excludedWords.size}`);
  console.log("");

  // Group words by length
  const wordsByLength = {
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
  };

  // Detailed word data (will be populated in two phases)
  const words = {};
  const rawScores = {}; // Temporary storage for raw scores

  // Track statistics
  const stats = {
    processed: 0,
    passed: 0,
    excluded: 0,
    byLength: { 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
    funScoreSum: 0,
  };

  // Minimum sub-words required
  const MIN_SUBWORDS = 3;

  // PHASE 1: Process each word and calculate raw fun scores
  console.log("Phase 1: Computing raw scores...");
  for (const word of allWords) {
    const len = word.length;

    // Only process words 3-8 letters
    if (len < 3 || len > 8) {
      continue;
    }

    // Skip if word itself is naughty
    if (excludedWords.has(word)) {
      stats.excluded++;
      continue;
    }

    stats.processed++;

    // Find sub-words (already filters out naughty words)
    const subWords = findSubWords(word, 3);

    // Check if meets minimum
    if (subWords.length >= MIN_SUBWORDS) {
      const rawScore = calculateRawFunScore(word, subWords);

      wordsByLength[len].push(word);
      rawScores[word] = rawScore;
      words[word] = {
        subWords: subWords,
        subWordCount: subWords.length,
        funScore: 0, // Will be set in phase 2
      };

      stats.passed++;
      stats.byLength[len]++;
    }

    // Progress indicator
    if (stats.processed % 200 === 0) {
      process.stdout.write(
        `\rProcessed: ${stats.processed} words, Passed: ${stats.passed}`,
      );
    }
  }

  console.log(`\rProcessed: ${stats.processed} words, Passed: ${stats.passed}`);
  console.log("");

  // PHASE 2: Normalize raw scores to percentiles within each length bucket
  console.log("Phase 2: Normalizing to percentiles within length buckets...");
  const percentiles = normalizeToPercentiles(wordsByLength, rawScores);

  // Apply percentile scores to words
  for (const word of Object.keys(words)) {
    words[word].funScore = percentiles[word];
    stats.funScoreSum += percentiles[word];
  }

  // Sort each length group by fun score (best first)
  for (const len of Object.keys(wordsByLength)) {
    wordsByLength[len].sort((a, b) => words[b].funScore - words[a].funScore);
  }

  // Print statistics
  console.log("=== Statistics ===");
  console.log(`Total processed: ${stats.processed}`);
  console.log(`Total passed: ${stats.passed}`);
  console.log(`Excluded (naughty): ${stats.excluded}`);
  console.log(
    `Average fun score: ${(stats.funScoreSum / stats.passed).toFixed(3)}`,
  );
  console.log("");
  console.log("By length:");
  for (let len = 3; len <= 8; len++) {
    console.log(`  ${len} letters: ${stats.byLength[len]} words`);
  }
  console.log("");

  // Show top 5 for each length (by fun score)
  console.log("=== Top 5 Words Per Length (by Fun Score) ===");
  for (let len = 3; len <= 8; len++) {
    const top5 = wordsByLength[len].slice(0, 5);
    if (top5.length > 0) {
      console.log(`${len} letters:`);
      for (const word of top5) {
        const data = words[word];
        console.log(
          `  ${word}: funScore=${data.funScore}, ${data.subWordCount} sub-words`,
        );
      }
    }
  }
  console.log("");

  // Create output structure
  // NOTE: naughtyWords excluded from bundle to avoid app store issues
  // Naughty word filtering happens at generation time only
  const output = {
    metadata: {
      version: "2.0",
      generatedAt: new Date().toISOString(),
      minSubWords: MIN_SUBWORDS,
      description:
        "Enhanced wordlist with pre-computed sub-words and fun scores",
    },
    wordsByLength: wordsByLength,
    words: words,
  };

  // Write output
  const outputPath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "enhanced-wordlist.json",
  );
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  // Calculate file size
  const fileSizeBytes = fs.statSync(outputPath).size;
  const fileSizeKB = (fileSizeBytes / 1024).toFixed(1);
  const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);

  console.log(`Enhanced wordlist written to: ${outputPath}`);
  console.log(`Total curated words: ${stats.passed}`);
  console.log(`File size: ${fileSizeKB} KB (${fileSizeMB} MB)`);
}

main();
