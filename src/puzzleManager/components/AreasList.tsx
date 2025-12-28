/**
 * AreasList Component
 * Home screen showing all 6 areas with progress
 */

import React from "react";
import type { Area } from "../types";

interface AreasListProps {
  areas: Area[];
  onAreaClick: (areaId: string) => void;
  onGameBuilder: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

// Area emoji map
const AREA_EMOJIS: Record<string, string> = {
  home: "🏠",
  forest: "🌲",
  desert: "🏜️",
  mountains: "⛰️",
  ocean: "🌊",
  space: "🚀",
};

export function AreasList({
  areas,
  onAreaClick,
  onGameBuilder,
  onExport,
  onImport,
}: AreasListProps) {
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Puzzle Manager</h1>
        <div style={styles.headerActions}>
          <label style={styles.importButton}>
            📥 Import
            <input
              type="file"
              accept="application/json"
              onChange={handleImport}
              style={styles.fileInput}
            />
          </label>
          <button onClick={onExport} style={styles.exportButton}>
            📤 Export
          </button>
          <button onClick={onGameBuilder} style={styles.builderButton}>
            🎮 Game Builder
          </button>
        </div>
      </header>

      <div style={styles.areasList}>
        {areas.map((area) => {
          const filledCount = area.locations.filter(
            (loc) => loc.assignedPuzzleId,
          ).length;
          const totalCount = area.locations.length;
          const progress =
            totalCount > 0 ? (filledCount / totalCount) * 100 : 0;

          return (
            <div
              key={area.id}
              style={styles.areaCard}
              onClick={() => onAreaClick(area.id)}
            >
              <div style={styles.areaHeader}>
                <span style={styles.areaEmoji}>{AREA_EMOJIS[area.id]}</span>
                <span style={styles.areaName}>{area.name}</span>
              </div>
              <div style={styles.areaInfo}>
                <span style={styles.areaLetters}>
                  {area.letterCount} letters
                </span>
                <span style={styles.areaDot}>•</span>
                <span style={styles.areaProgress}>
                  {filledCount}/{totalCount} locations
                </span>
              </div>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
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
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "600",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  importButton: {
    backgroundColor: "#2D2D2D",
    border: "none",
    color: "#FFFFFF",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-block",
  },
  fileInput: {
    display: "none",
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
  builderButton: {
    backgroundColor: "#6C5CE7",
    border: "none",
    color: "#FFFFFF",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  areasList: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  areaCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: "12px",
    padding: "20px",
    cursor: "pointer",
    transition: "transform 0.2s, backgroundColor 0.2s",
    border: "1px solid #2D2D2D",
  },
  areaHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  areaEmoji: {
    fontSize: "32px",
  },
  areaName: {
    fontSize: "20px",
    fontWeight: "600",
  },
  areaInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#A0A0A0",
    marginBottom: "12px",
  },
  areaLetters: {},
  areaDot: {},
  areaProgress: {},
  progressBar: {
    height: "4px",
    backgroundColor: "#2D2D2D",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6C5CE7",
    transition: "width 0.3s ease",
  },
};
