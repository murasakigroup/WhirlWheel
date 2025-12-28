/**
 * PuzzleDetail Component
 * Full view of a puzzle with large grid, metrics, word list, and notes
 */

import React, { useState } from "react";
import type { CuratedPuzzle, Generation } from "../types";
import { GridPreview } from "./GridPreview";

interface PuzzleDetailProps {
  puzzle: CuratedPuzzle;
  generation: Generation;
  onBack: () => void;
  onLike: () => void;
  onSkip: () => void;
  onNotesChange: (notes: string) => void;
}

export function PuzzleDetail({
  puzzle,
  generation,
  onBack,
  onLike,
  onSkip,
  onNotesChange,
}: PuzzleDetailProps) {
  const [notes, setNotes] = useState(puzzle.feedback.notes || "");

  // Calculate grid score (remove fun score contribution)
  const funScore = generation.funScore;
  const gridScore = (puzzle.score - funScore * 0.15) / 0.85;

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    onNotesChange(value);
  };

  const isLiked = puzzle.feedback.liked === true;
  const isSkipped = puzzle.feedback.liked === false;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← Back
        </button>
        <h1 style={styles.title}>Puzzle Detail</h1>
        <div style={styles.headerSpacer} />
      </header>

      <div style={styles.content}>
        {/* Score Section - Horizontal Layout */}
        <div style={styles.scoreSection}>
          <div style={styles.finalScoreGroup}>
            <span style={styles.finalScoreValue}>
              {(puzzle.score * 100).toFixed(0)}
            </span>
            <span style={styles.finalScoreLabel}>Final</span>
          </div>
          <span style={styles.scoreEquals}>=</span>
          <div style={styles.scoreComponent}>
            <span style={styles.componentValue}>
              {(gridScore * 100).toFixed(0)}
            </span>
            <span style={styles.componentLabel}>Grid</span>
          </div>
          <span style={styles.scorePlus}>+</span>
          <div style={styles.scoreComponent}>
            <span style={styles.componentValue}>
              {(funScore * 100).toFixed(0)}
            </span>
            <span style={styles.componentLabel}>Fun</span>
          </div>
          {isLiked && <span style={styles.statusBadgeLiked}>❤️</span>}
          {isSkipped && <span style={styles.statusBadgeSkipped}>✗</span>}
        </div>

        {/* Large Grid */}
        <div style={styles.gridContainer}>
          <GridPreview grid={puzzle.grid} size="large" />
        </div>

        {/* Metrics */}
        <div style={styles.metricsSection}>
          <h3 style={styles.sectionTitle}>Metrics</h3>
          <div style={styles.metricsGrid}>
            <div style={styles.metricItem}>
              <span style={styles.metricValue}>
                {puzzle.metrics.gridWidth}×{puzzle.metrics.gridHeight}
              </span>
              <span style={styles.metricLabel}>Grid Size</span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricValue}>
                {Math.round(puzzle.metrics.density * 100)}%
              </span>
              <span style={styles.metricLabel}>Density</span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricValue}>
                {puzzle.metrics.intersectionCount}
              </span>
              <span style={styles.metricLabel}>Crossings</span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricValue}>{puzzle.words.length}</span>
              <span style={styles.metricLabel}>Words</span>
            </div>
          </div>
        </div>

        {/* Word List */}
        <div style={styles.wordsSection}>
          <h3 style={styles.sectionTitle}>Words</h3>
          <div style={styles.wordsList}>
            {puzzle.words
              .sort((a, b) => b.word.length - a.word.length)
              .map((placedWord, index) => (
                <div key={index} style={styles.wordItem}>
                  <span style={styles.wordText}>{placedWord.word}</span>
                  <span style={styles.wordMeta}>
                    {placedWord.word.length} letters •{" "}
                    {placedWord.direction === "horizontal" ? "→" : "↓"}
                  </span>
                </div>
              ))}
          </div>
          {puzzle.bonusWords.length > 0 && (
            <div style={styles.bonusWords}>
              <span style={styles.bonusLabel}>Bonus words: </span>
              <span style={styles.bonusText}>
                {puzzle.bonusWords.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div style={styles.notesSection}>
          <h3 style={styles.sectionTitle}>Notes</h3>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Add notes about this puzzle..."
            style={styles.notesInput}
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button
            onClick={onSkip}
            style={{
              ...styles.actionButton,
              ...styles.skipButton,
              ...(isSkipped ? styles.skipButtonActive : {}),
            }}
          >
            👎 {isSkipped ? "Skipped" : "Skip"}
          </button>
          <button
            onClick={onLike}
            style={{
              ...styles.actionButton,
              ...styles.likeButton,
              ...(isLiked ? styles.likeButtonActive : {}),
            }}
          >
            👍 {isLiked ? "Liked" : "Like"}
          </button>
        </div>

        {/* Hash Info */}
        <div style={styles.hashInfo}>
          <span style={styles.hashLabel}>Grid Hash:</span>
          <span style={styles.hashValue}>{puzzle.gridHash}</span>
        </div>
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
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
  },
  headerSpacer: {
    width: "60px",
  },
  content: {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  scoreSection: {
    backgroundColor: "#1E1E1E",
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  finalScoreGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  finalScoreValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#6C5CE7",
  },
  finalScoreLabel: {
    fontSize: "10px",
    color: "#A0A0A0",
    textTransform: "uppercase",
  },
  scoreEquals: {
    fontSize: "18px",
    color: "#666",
  },
  scoreComponent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  componentValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  componentLabel: {
    fontSize: "10px",
    color: "#666",
    textTransform: "uppercase",
  },
  scorePlus: {
    fontSize: "14px",
    color: "#666",
  },
  statusBadgeLiked: {
    backgroundColor: "#00B894",
    color: "#FFFFFF",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "14px",
    marginLeft: "auto",
  },
  statusBadgeSkipped: {
    backgroundColor: "#D63031",
    color: "#FFFFFF",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "14px",
    marginLeft: "auto",
  },
  gridContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "center",
    overflow: "auto",
  },
  metricsSection: {
    marginBottom: "24px",
  },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#A0A0A0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },
  metricItem: {
    backgroundColor: "#1E1E1E",
    borderRadius: "8px",
    padding: "12px",
    textAlign: "center",
  },
  metricValue: {
    display: "block",
    fontSize: "18px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  metricLabel: {
    fontSize: "11px",
    color: "#A0A0A0",
  },
  wordsSection: {
    marginBottom: "24px",
  },
  wordsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  wordItem: {
    backgroundColor: "#1E1E1E",
    borderRadius: "8px",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordText: {
    fontSize: "16px",
    fontWeight: "600",
    letterSpacing: "1px",
  },
  wordMeta: {
    fontSize: "12px",
    color: "#A0A0A0",
  },
  bonusWords: {
    marginTop: "12px",
    padding: "12px",
    backgroundColor: "#1E1E1E",
    borderRadius: "8px",
  },
  bonusLabel: {
    fontSize: "12px",
    color: "#A0A0A0",
  },
  bonusText: {
    fontSize: "12px",
    color: "#6C5CE7",
  },
  notesSection: {
    marginBottom: "24px",
  },
  notesInput: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    border: "1px solid #2D2D2D",
    borderRadius: "8px",
    padding: "12px",
    color: "#FFFFFF",
    fontSize: "14px",
    fontFamily: "system-ui",
    resize: "vertical",
    boxSizing: "border-box",
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  actionButton: {
    flex: 1,
    padding: "16px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    transition: "transform 0.1s",
  },
  skipButton: {
    backgroundColor: "#2D2D2D",
    color: "#FFFFFF",
  },
  skipButtonActive: {
    backgroundColor: "#D63031",
  },
  likeButton: {
    backgroundColor: "#2D2D2D",
    color: "#FFFFFF",
  },
  likeButtonActive: {
    backgroundColor: "#00B894",
  },
  hashInfo: {
    textAlign: "center",
    padding: "12px",
    borderTop: "1px solid #2D2D2D",
  },
  hashLabel: {
    fontSize: "12px",
    color: "#666",
    marginRight: "8px",
  },
  hashValue: {
    fontSize: "12px",
    color: "#666",
    fontFamily: "monospace",
  },
};
