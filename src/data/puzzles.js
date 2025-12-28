// Hardcoded puzzles for MVP
// Each puzzle has letters, valid solution words, grid positions, and a background theme
// gridWords: words that appear in the crossword grid with their positions
// bonusWords: extra valid words that give bonus points but don't appear in grid

export const puzzles = [
  {
    id: 1,
    letters: ["C", "A", "T", "S"],
    // Grid words with positions (row, col, direction)
    gridWords: [
      { word: "CATS", row: 0, col: 0, direction: "across" },
      { word: "ACT", row: 0, col: 1, direction: "down" },
      { word: "SAT", row: 2, col: 0, direction: "across" },
    ],
    bonusWords: ["CAT", "CAST"],
    theme: "nature",
    background:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  },
  {
    id: 2,
    letters: ["R", "E", "A", "D", "S"],
    gridWords: [
      { word: "READS", row: 0, col: 0, direction: "across" },
      { word: "DEAR", row: 0, col: 3, direction: "down" },
      { word: "SEAR", row: 2, col: 1, direction: "across" },
      { word: "RED", row: 0, col: 0, direction: "down" },
    ],
    bonusWords: [
      "DARE",
      "REDS",
      "EARS",
      "ARE",
      "EAR",
      "SEA",
      "SAD",
      "ERA",
      "READ",
    ],
    theme: "library",
    background:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80",
  },
  {
    id: 3,
    letters: ["F", "L", "O", "W", "E", "R"],
    gridWords: [
      { word: "FLOWER", row: 0, col: 0, direction: "down" },
      { word: "LOWER", row: 1, col: 0, direction: "across" },
      { word: "FLOW", row: 0, col: 0, direction: "across" },
      { word: "WORE", row: 3, col: 2, direction: "across" },
      { word: "OWL", row: 2, col: 2, direction: "down" },
    ],
    bonusWords: [
      "FOWL",
      "WOLF",
      "ROLE",
      "LORE",
      "FLEW",
      "FEW",
      "ROW",
      "LOW",
      "ORE",
      "OWE",
      "FOR",
      "FOE",
    ],
    theme: "garden",
    background:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80",
  },
];
