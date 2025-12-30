/**
 * BatchGenerationModal Component
 * Modal for configuring batch puzzle generation across all areas
 */

import React, { useState, useMemo } from "react";
import type { Area } from "../types";
import enhancedWordlistData from "../../data/enhanced-wordlist.json";
import { deduplicateWordsByLetters } from "../../puzzleGenerator/utils";

export interface BatchGenerationConfig {
  wordsPerArea: number;
  puzzlesPerWord: number;
  autoAssign: boolean;
}

interface BatchGenerationModalProps {
  areas: Area[];
  generationCounts: Record<string, number>; // areaId -> count of existing generations
  onStart: (config: BatchGenerationConfig) => void;
  onClose: () => void;
}

export function BatchGenerationModal({
  areas,
  generationCounts,
  onStart,
  onClose,
}: BatchGenerationModalProps) {
  const [wordsPerArea, setWordsPerArea] = useState(5);
  const [puzzlesPerWord, setPuzzlesPerWord] = useState(3);
  const [autoAssign, setAutoAssign] = useState(true);

  // Calculate deduplication stats once
  const deduplicationStats = useMemo(() => {
    const wordsArray = Object.entries((enhancedWordlistData as any).words).map(
      ([word, data]: [string, any]) => ({
        word,
        funScore: data.funScore,
      }),
    );
    const result = deduplicateWordsByLetters(wordsArray);
    return result.stats;
  }, []);

  const handleStart = () => {
    onStart({
      wordsPerArea,
      puzzlesPerWord,
      autoAssign,
    });
  };

  // Calculate totals
  const totalGenerations = areas.length * wordsPerArea;
  const totalPuzzles = totalGenerations * puzzlesPerWord;
  const puzzlesPerArea = wordsPerArea * puzzlesPerWord;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Batch Generate</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <div style={styles.content}>
          <p style={styles.description}>
            Generate puzzle candidates for each area using multiple source
            words.
          </p>

          {/* Deduplication Info */}
          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>ℹ️</span>
            <span style={styles.infoText}>
              Filtered {deduplicationStats.filtered} anagrams from{" "}
              {deduplicationStats.original} words → generating from{" "}
              {deduplicationStats.kept} unique puzzles
            </span>
          </div>

          <div style={styles.divider} />

          {/* Words per Area */}
          <div style={styles.field}>
            <label style={styles.label}>Words per Area: {wordsPerArea}</label>
            <input
              type="range"
              min={1}
              max={10}
              value={wordsPerArea}
              onChange={(e) => setWordsPerArea(parseInt(e.target.value))}
              style={styles.slider}
            />
            <div style={styles.hint}>
              {wordsPerArea} different source words per area (e.g., CATS, TACO,
              COAT)
            </div>
          </div>

          {/* Puzzles per Word */}
          <div style={styles.field}>
            <label style={styles.label}>
              Puzzles per Word: {puzzlesPerWord}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={puzzlesPerWord}
              onChange={(e) => setPuzzlesPerWord(parseInt(e.target.value))}
              style={styles.slider}
            />
            <div style={styles.hint}>
              {puzzlesPerWord} grid layouts generated from each source word
            </div>
          </div>

          <div style={styles.divider} />

          {/* Summary */}
          <div style={styles.summarySection}>
            <h3 style={styles.summaryTitle}>SUMMARY</h3>
            <div style={styles.summaryList}>
              {areas.map((area) => {
                const existingCount = generationCounts[area.id] || 0;
                return (
                  <div key={area.id} style={styles.summaryRow}>
                    <span style={styles.areaName}>
                      {area.name} ({area.letterCount} letters)
                    </span>
                    <span style={styles.areaSummary}>
                      {existingCount > 0 && (
                        <span style={styles.existingCount}>
                          {existingCount} existing +{" "}
                        </span>
                      )}
                      {wordsPerArea} words × {puzzlesPerWord} = {puzzlesPerArea}{" "}
                      puzzles
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={styles.totalRow}>
              <span>Total:</span>
              <span style={styles.totalValue}>
                {totalGenerations} generations, {totalPuzzles} puzzles
              </span>
            </div>
          </div>

          <div style={styles.divider} />

          {/* Auto-assign checkbox */}
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={autoAssign}
              onChange={(e) => setAutoAssign(e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.checkboxText}>
              Auto-assign best puzzle to each location
            </span>
          </label>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleStart} style={styles.startButton}>
            Generate {areas.length} Areas
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "#1E1E1E",
    borderRadius: "12px",
    maxWidth: "500px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    border: "1px solid #2D2D2D",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px",
    borderBottom: "1px solid #2D2D2D",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#A0A0A0",
    fontSize: "24px",
    cursor: "pointer",
    padding: "0",
    width: "32px",
    height: "32px",
  },
  content: {
    padding: "20px",
  },
  infoBox: {
    backgroundColor: "#2D2D2D",
    borderRadius: "8px",
    padding: "12px 16px",
    marginTop: "12px",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "1px solid #3D3D3D",
  },
  infoIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },
  infoText: {
    fontSize: "13px",
    color: "#A0A0A0",
    lineHeight: "1.5",
  },
  description: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: "#A0A0A0",
    lineHeight: "1.5",
  },
  divider: {
    height: "1px",
    backgroundColor: "#2D2D2D",
    margin: "20px 0",
  },
  field: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: "8px",
  },
  slider: {
    width: "100%",
    height: "4px",
    backgroundColor: "#2D2D2D",
    outline: "none",
    borderRadius: "2px",
  },
  hint: {
    fontSize: "12px",
    color: "#666",
    marginTop: "6px",
  },
  summarySection: {
    marginBottom: "8px",
  },
  summaryTitle: {
    margin: "0 0 12px 0",
    fontSize: "12px",
    fontWeight: "600",
    color: "#A0A0A0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  summaryList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
  },
  areaName: {
    color: "#FFFFFF",
  },
  areaSummary: {
    color: "#A0A0A0",
  },
  existingCount: {
    color: "#6C5CE7",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
    paddingTop: "12px",
    borderTop: "1px solid #2D2D2D",
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  totalValue: {
    color: "#6C5CE7",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  checkboxText: {
    fontSize: "14px",
    color: "#FFFFFF",
  },
  footer: {
    display: "flex",
    gap: "12px",
    padding: "20px",
    borderTop: "1px solid #2D2D2D",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#2D2D2D",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  startButton: {
    flex: 2,
    backgroundColor: "#6C5CE7",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
