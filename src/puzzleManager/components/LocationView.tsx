/**
 * LocationView Component
 * Shows selected puzzle prominently at top, other options from generation below
 */

import React from "react";
import type { Area, Location, Generation, CuratedPuzzle } from "../types";
import { GridPreview } from "./GridPreview";

interface LocationViewProps {
  location: Location;
  area: Area;
  generation: Generation | null;
  selectedPuzzle: CuratedPuzzle | null;
  onBack: () => void;
  onPuzzleClick: (puzzleId: string) => void;
}

const DIFFICULTY_LABELS = ["Easiest", "Easy", "Medium", "Hard", "Hardest"];

export function LocationView({
  location,
  area,
  generation,
  selectedPuzzle,
  onBack,
  onPuzzleClick,
}: LocationViewProps) {
  // Determine difficulty label based on location index
  const locationIndex = area.locations.findIndex((loc) => loc.id === location.id);
  const difficultyLabel = DIFFICULTY_LABELS[locationIndex] || "Unknown";

  // Get other puzzles from the generation (excluding the selected one)
  const otherPuzzles = generation
    ? generation.puzzles.filter((p) => p.id !== selectedPuzzle?.id)
    : [];

  // Get puzzle index for display
  const getPuzzleIndex = (puzzle: CuratedPuzzle): number => {
    if (!generation) return 0;
    return generation.puzzles.findIndex((p) => p.id === puzzle.id) + 1;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← Back
        </button>
        <div style={styles.headerCenter}>
          <h1 style={styles.title}>{location.name}</h1>
          <p style={styles.difficulty}>Location {locationIndex + 1} ({difficultyLabel})</p>
        </div>
        <div style={styles.headerSpacer} />
      </header>

      <div style={styles.content}>
        {!generation ? (
          /* Empty State */
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              No generation assigned. Go back and assign a generation to this location.
            </p>
          </div>
        ) : (
          <>
            {/* Top Section - Selected Puzzle */}
            {selectedPuzzle && (
              <section style={styles.selectedSection}>
                <h2 style={styles.sectionLabel}>SELECTED PUZZLE</h2>
                <div
                  style={styles.selectedCard}
                  onClick={() => onPuzzleClick(selectedPuzzle.id)}
                >
                  <div style={styles.selectedGridContainer}>
                    <GridPreview grid={selectedPuzzle.grid} size="large" />
                  </div>

                  <div style={styles.selectedInfo}>
                    <div style={styles.selectedMeta}>
                      <span style={styles.generationName}>
                        {generation.letters.join("")}
                      </span>
                      <span style={styles.metaDot}>•</span>
                      <span style={styles.metaText}>
                        {selectedPuzzle.words.length} words
                      </span>
                    </div>
                    <div style={styles.scoreDisplay}>
                      <span style={styles.scoreLabel}>Score</span>
                      <span style={styles.scoreValue}>
                        {(selectedPuzzle.score * 100).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Bottom Section - Other Options */}
            {otherPuzzles.length > 0 && (
              <section style={styles.optionsSection}>
                <h2 style={styles.sectionLabel}>
                  OTHER OPTIONS FROM "{generation.letters.join("")}"
                  <span style={styles.optionsCount}>
                    {" "}({getPuzzleIndex(selectedPuzzle!)} of {generation.puzzles.length} selected)
                  </span>
                </h2>

                <div style={styles.optionsList}>
                  {otherPuzzles.map((puzzle) => (
                    <div
                      key={puzzle.id}
                      style={styles.optionRow}
                      onClick={() => onPuzzleClick(puzzle.id)}
                    >
                      <div style={styles.optionGridContainer}>
                        <GridPreview grid={puzzle.grid} size="small" />
                      </div>

                      <div style={styles.optionInfo}>
                        <div style={styles.optionMeta}>
                          <span style={styles.optionLabel}>
                            Puzzle {getPuzzleIndex(puzzle)}/{generation.puzzles.length}
                          </span>
                          <span style={styles.optionText}>
                            {puzzle.words.length} words
                          </span>
                        </div>
                        <div style={styles.optionScore}>
                          {(puzzle.score * 100).toFixed(0)}
                        </div>
                      </div>

                      <span style={styles.optionArrow}>→</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* No other options */}
            {otherPuzzles.length === 0 && selectedPuzzle && (
              <p style={styles.noOthers}>
                This is the only puzzle in this generation.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#121212",
    color: "#FFFFFF",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px",
    borderBottom: "1px solid #2D2D2D",
  },
  backButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#6C5CE7",
    fontSize: "16px",
    cursor: "pointer",
    padding: "8px",
  },
  headerCenter: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "600",
  },
  difficulty: {
    margin: 0,
    fontSize: "14px",
    color: "#A0A0A0",
    fontWeight: "500",
  },
  headerSpacer: {
    width: "60px",
  },
  content: {
    padding: "20px",
  },

  // Empty State
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyText: {
    color: "#A0A0A0",
    fontSize: "16px",
    lineHeight: 1.5,
    maxWidth: "400px",
    margin: "0 auto",
  },

  // Section Label
  sectionLabel: {
    margin: "0 0 16px 0",
    fontSize: "12px",
    fontWeight: "600",
    color: "#A0A0A0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  // Selected Puzzle Section
  selectedSection: {
    marginBottom: "32px",
  },
  selectedCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: "16px",
    padding: "24px",
    border: "2px solid #6C5CE7",
    cursor: "pointer",
  },
  selectedGridContainer: {
    backgroundColor: "#121212",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "center",
  },
  selectedInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },
  generationName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#6C5CE7",
  },
  metaDot: {
    color: "#666",
  },
  metaText: {
    fontSize: "14px",
    color: "#A0A0A0",
  },
  scoreDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  scoreLabel: {
    fontSize: "12px",
    color: "#A0A0A0",
    textTransform: "uppercase",
  },
  scoreValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#6C5CE7",
  },

  // Other Options Section
  optionsSection: {
    marginTop: "32px",
  },
  optionsCount: {
    color: "#6C5CE7",
    fontWeight: "400",
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  optionRow: {
    backgroundColor: "#1E1E1E",
    border: "1px solid #2D2D2D",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    cursor: "pointer",
  },
  optionGridContainer: {
    backgroundColor: "#121212",
    borderRadius: "8px",
    padding: "12px",
    flexShrink: 0,
  },
  optionInfo: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  optionLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  optionText: {
    fontSize: "12px",
    color: "#A0A0A0",
  },
  optionScore: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#A0A0A0",
  },
  optionArrow: {
    fontSize: "18px",
    color: "#666",
  },
  noOthers: {
    textAlign: "center",
    color: "#666",
    padding: "40px 20px",
    fontStyle: "italic",
  },
};
