/**
 * GameBuilder Component
 * Overview of all 30 puzzle slots organized by area/location
 */

import React from "react";
import type { GameData } from "../types";
import type { BatchProgress } from "../hooks/useBatchGeneration";

interface GameBuilderProps {
  gameData: GameData;
  onAutoFill: () => void;
  onBatchGenerate: () => void;
  onCancelBatch: () => void;
  onAreaClick: (areaId: string) => void;
  onLocationClick: (locationId: string) => void;
  onExport: () => void;
  onBack?: () => void;
  batchProgress: BatchProgress | null;
}

export function GameBuilder({
  gameData,
  onAutoFill,
  onBatchGenerate,
  onCancelBatch,
  onAreaClick,
  onLocationClick,
  onExport,
  onBack,
  batchProgress,
}: GameBuilderProps) {
  // Count filled and liked puzzles
  const totalSlots = gameData.areas.reduce(
    (sum, area) => sum + area.locations.length,
    0,
  );
  const filledSlots = gameData.areas.reduce(
    (sum, area) =>
      sum + area.locations.filter((loc) => loc.assignedPuzzleId).length,
    0,
  );
  const likedPuzzles = gameData.generations.reduce(
    (sum, gen) =>
      sum + gen.puzzles.filter((p) => p.feedback.liked === true).length,
    0,
  );

  const isGenerating = batchProgress?.isRunning ?? false;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          {onBack && (
            <button onClick={onBack} style={styles.backButton}>
              ← Menu
            </button>
          )}
          <h1 style={styles.title}>Game Builder</h1>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={onBatchGenerate}
            style={{
              ...styles.batchButton,
              ...(isGenerating ? styles.buttonDisabled : {}),
            }}
            disabled={isGenerating}
          >
            ⚡ Batch Generate
          </button>
          <button
            onClick={onAutoFill}
            style={{
              ...styles.autoFillButton,
              ...(isGenerating ? styles.buttonDisabled : {}),
            }}
            disabled={isGenerating}
          >
            🎲 Auto-fill
          </button>
          <button onClick={onExport} style={styles.exportButton}>
            📤 Export
          </button>
        </div>
      </header>

      {/* Progress Banner */}
      {batchProgress && batchProgress.isRunning && (
        <div style={styles.progressBanner}>
          <div style={styles.progressInfo}>
            <div style={styles.progressTitle}>
              Generating: {batchProgress.currentArea} (Word{" "}
              {batchProgress.currentWord})
            </div>
            <div style={styles.progressStats}>
              {batchProgress.completedWords}/{batchProgress.totalWords} words •{" "}
              {batchProgress.generatedPuzzles} puzzles
            </div>
          </div>
          <div style={styles.progressBarContainer}>
            <div
              style={{
                ...styles.progressBar,
                width: `${(batchProgress.completedWords / batchProgress.totalWords) * 100}%`,
              }}
            />
          </div>
          <button onClick={onCancelBatch} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      )}

      {/* Completion Banner */}
      {batchProgress &&
        !batchProgress.isRunning &&
        batchProgress.completedWords > 0 && (
          <div style={styles.completionBanner}>
            <div style={styles.completionInfo}>
              ✓ Batch complete! Generated {batchProgress.completedWords} words
              with {batchProgress.generatedPuzzles} puzzles.
              {batchProgress.errors.length > 0 && (
                <span style={styles.errorCount}>
                  {" "}
                  ({batchProgress.errors.length} errors)
                </span>
              )}
            </div>
          </div>
        )}

      <div style={styles.summary}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Progress</span>
          <span style={styles.summaryValue}>
            {filledSlots}/{totalSlots} slots filled
          </span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Liked Puzzles</span>
          <span style={styles.summaryValue}>{likedPuzzles} available</span>
        </div>
      </div>

      <div style={styles.content}>
        {gameData.areas.map((area) => (
          <section
            key={area.id}
            style={styles.areaSection}
            onClick={() => onAreaClick(area.id)}
          >
            <h2 style={styles.areaTitle}>
              {area.name} ({area.letterCount} letters)
              <span style={styles.areaTitleArrow}> →</span>
            </h2>
            <div style={styles.locationsGrid}>
              {area.locations.map((location) => {
                const isAssigned = !!location.assignedPuzzleId;
                const puzzle = location.assignedPuzzleId
                  ? gameData.generations
                      .flatMap((g) => g.puzzles)
                      .find((p) => p.id === location.assignedPuzzleId)
                  : null;

                return (
                  <div
                    key={location.id}
                    style={{
                      ...styles.locationCard,
                      ...(isAssigned ? styles.locationCardFilled : {}),
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLocationClick(location.id);
                    }}
                  >
                    <div style={styles.locationName}>{location.name}</div>
                    {puzzle ? (
                      <div style={styles.puzzleInfo}>
                        <div style={styles.puzzleScore}>
                          {puzzle.score.toFixed(2)} ⭐
                        </div>
                        <div style={styles.puzzleWords}>
                          {puzzle.words.length} words
                        </div>
                      </div>
                    ) : (
                      <div style={styles.emptySlot}>Empty</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
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
    flexWrap: "wrap",
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "600",
  },
  backButton: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    color: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  batchButton: {
    backgroundColor: "#E17055",
    border: "none",
    color: "#FFFFFF",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  autoFillButton: {
    backgroundColor: "#6C5CE7",
    border: "none",
    color: "#FFFFFF",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  exportButton: {
    backgroundColor: "#00B894",
    border: "none",
    color: "#FFFFFF",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  progressBanner: {
    backgroundColor: "#2D2D2D",
    padding: "16px 20px",
    borderBottom: "1px solid #3D3D3D",
  },
  progressInfo: {
    marginBottom: "12px",
  },
  progressTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "4px",
  },
  progressStats: {
    fontSize: "13px",
    color: "#A0A0A0",
  },
  progressBarContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: "4px",
    height: "8px",
    overflow: "hidden",
    marginBottom: "12px",
  },
  progressBar: {
    backgroundColor: "#6C5CE7",
    height: "100%",
    transition: "width 0.3s ease",
  },
  cancelButton: {
    backgroundColor: "#E74C3C",
    border: "none",
    color: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  completionBanner: {
    backgroundColor: "#1E3A2F",
    padding: "16px 20px",
    borderBottom: "1px solid #2D4A3F",
  },
  completionInfo: {
    fontSize: "14px",
    color: "#00B894",
  },
  errorCount: {
    color: "#E74C3C",
  },
  summary: {
    display: "flex",
    gap: "24px",
    padding: "20px",
    backgroundColor: "#1E1E1E",
    borderBottom: "1px solid #2D2D2D",
    flexWrap: "wrap",
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  summaryLabel: {
    fontSize: "12px",
    color: "#A0A0A0",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: "18px",
    fontWeight: "600",
  },
  content: {
    padding: "20px",
  },
  areaSection: {
    marginBottom: "32px",
    cursor: "pointer",
    padding: "16px",
    margin: "-16px -16px 16px -16px",
    borderRadius: "12px",
    transition: "background-color 0.2s",
  },
  areaTitle: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#A0A0A0",
    display: "flex",
    alignItems: "center",
  },
  areaTitleArrow: {
    marginLeft: "8px",
    color: "#6C5CE7",
    fontSize: "16px",
  },
  locationsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "12px",
  },
  locationCard: {
    backgroundColor: "#1E1E1E",
    border: "1px solid #2D2D2D",
    borderRadius: "8px",
    padding: "16px",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  locationCardFilled: {
    borderColor: "#6C5CE7",
    backgroundColor: "#252238",
  },
  locationName: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  puzzleInfo: {
    fontSize: "12px",
    color: "#A0A0A0",
  },
  puzzleScore: {
    marginBottom: "4px",
  },
  puzzleWords: {},
  emptySlot: {
    fontSize: "12px",
    color: "#666",
    fontStyle: "italic",
  },
};
