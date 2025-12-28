/**
 * PuzzleCard Component
 * Displays a single puzzle with grid, metrics, and actions
 */

import React from "react";
import type { CuratedPuzzle } from "../types";
import { GridPreview } from "./GridPreview";

interface PuzzleCardProps {
  puzzle: CuratedPuzzle;
  funScore: number;
  onLike: () => void;
  onSkip: () => void;
  onDetails: () => void;
}

export function PuzzleCard({
  puzzle,
  funScore,
  onLike,
  onSkip,
  onDetails,
}: PuzzleCardProps) {
  const isLiked = puzzle.feedback.liked === true;
  const isSkipped = puzzle.feedback.liked === false;

  // Calculate grid score (remove fun score contribution)
  const gridScore = (puzzle.score - funScore * 0.15) / 0.85;

  return (
    <div style={styles.card} onClick={onDetails}>
      <div style={styles.header}>
        <div style={styles.scoreSection}>
          <span style={styles.scoreLabel}>Score</span>
          <span style={styles.scoreValue}>
            {(puzzle.score * 100).toFixed(0)}
          </span>
          <span style={styles.scoreEquals}>=</span>
          <span style={styles.scoreComponent}>
            {(gridScore * 100).toFixed(0)}
          </span>
          <span style={styles.scorePlus}>+</span>
          <span style={styles.scoreComponent}>
            {(funScore * 100).toFixed(0)}
          </span>
          <span style={styles.scoreComponentLabel}>(grid+fun)</span>
        </div>
        <div style={styles.metricsSection}>
          <span style={styles.metric}>
            {puzzle.metrics.gridWidth}×{puzzle.metrics.gridHeight}
          </span>
          <span style={styles.metricDot}>•</span>
          <span style={styles.metric}>
            {(puzzle.metrics.density * 100).toFixed(0)}% dense
          </span>
          <span style={styles.metricDot}>•</span>
          <span style={styles.metric}>
            {puzzle.metrics.intersectionCount} cross
          </span>
        </div>
      </div>

      <div style={styles.gridContainer}>
        <GridPreview grid={puzzle.grid} size="medium" />
      </div>

      <div style={styles.words}>
        <span style={styles.wordsLabel}>Words:</span>
        <span style={styles.wordsList}>
          {puzzle.words
            .slice(0, 3)
            .map((w) => w.word)
            .join(", ")}
          {puzzle.words.length > 3 && ` +${puzzle.words.length - 3} more`}
        </span>
      </div>

      <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onSkip}
          style={{
            ...styles.button,
            ...styles.skipButton,
            ...(isSkipped ? styles.skipButtonActive : {}),
          }}
        >
          👎 Skip
        </button>
        <button
          onClick={onLike}
          style={{
            ...styles.button,
            ...styles.likeButton,
            ...(isLiked ? styles.likeButtonActive : {}),
          }}
        >
          👍 Like
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #2D2D2D",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    outline: "none",
  },
  header: {
    marginBottom: "16px",
  },
  scoreSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  scoreLabel: {
    fontSize: "14px",
    color: "#A0A0A0",
  },
  scoreValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#6C5CE7",
  },
  scoreEquals: {
    fontSize: "14px",
    color: "#666",
    marginLeft: "4px",
  },
  scoreComponent: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#A0A0A0",
  },
  scorePlus: {
    fontSize: "12px",
    color: "#666",
  },
  scoreComponentLabel: {
    fontSize: "11px",
    color: "#666",
  },
  metricsSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#A0A0A0",
  },
  metric: {},
  metricDot: {},
  gridContainer: {
    backgroundColor: "#121212",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "16px",
    overflow: "auto",
  },
  words: {
    fontSize: "14px",
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  wordsLabel: {
    color: "#A0A0A0",
    fontWeight: "500",
  },
  wordsList: {
    color: "#FFFFFF",
  },
  actions: {
    display: "flex",
    gap: "12px",
  },
  button: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  skipButton: {
    backgroundColor: "#2D2D2D",
    color: "#FFFFFF",
  },
  skipButtonActive: {
    backgroundColor: "#D63031",
    color: "#FFFFFF",
  },
  likeButton: {
    backgroundColor: "#2D2D2D",
    color: "#FFFFFF",
  },
  likeButtonActive: {
    backgroundColor: "#00B894",
    color: "#FFFFFF",
  },
};
