/**
 * AreaView Component
 * Shows location carousel at top, candidate generations list at bottom
 */

import React, { useState, useRef } from "react";
import type { Area, Generation } from "../types";
import { GridPreview } from "./GridPreview";

interface AreaViewProps {
  area: Area;
  generations: Generation[];
  onBack: () => void;
  onLocationClick: (locationId: string) => void;
  onNewGeneration: () => void;
  onAssignGeneration: (locationId: string, generationId: string) => void;
}

const DIFFICULTY_LABELS = ["Easiest", "Easy", "Medium", "Hard", "Hardest"];

export function AreaView({
  area,
  generations,
  onBack,
  onLocationClick,
  onNewGeneration,
  onAssignGeneration,
}: AreaViewProps) {
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [selectedGenerationId, setSelectedGenerationId] = useState<
    string | null
  >(null);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > minSwipeDistance;
    const isSwipeRight = distance < -minSwipeDistance;

    if (isSwipeLeft && currentLocationIndex < area.locations.length - 1) {
      setCurrentLocationIndex(currentLocationIndex + 1);
      setSelectedGenerationId(null);
    } else if (isSwipeRight && currentLocationIndex > 0) {
      setCurrentLocationIndex(currentLocationIndex - 1);
      setSelectedGenerationId(null);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentLocation = area.locations[currentLocationIndex];

  // Find the generation and puzzle assigned to current location
  const assignedGeneration = generations.find(
    (g) => g.id === currentLocation?.assignedGenerationId,
  );
  const assignedPuzzle = assignedGeneration?.puzzles.find(
    (p) => p.id === currentLocation?.assignedPuzzleId,
  );

  // Swipe handlers for arrow buttons
  const handleSwipeLeft = () => {
    if (currentLocationIndex < area.locations.length - 1) {
      setCurrentLocationIndex(currentLocationIndex + 1);
      setSelectedGenerationId(null);
    }
  };

  const handleSwipeRight = () => {
    if (currentLocationIndex > 0) {
      setCurrentLocationIndex(currentLocationIndex - 1);
      setSelectedGenerationId(null);
    }
  };

  // Handle generation tap (mobile-friendly assignment)
  const handleGenerationTap = (generationId: string) => {
    if (selectedGenerationId === generationId) {
      // Second tap - assign it
      onAssignGeneration(currentLocation.id, generationId);
      setSelectedGenerationId(null);
    } else {
      // First tap - select it
      setSelectedGenerationId(generationId);
    }
  };

  // Get puzzle count for selected puzzle within its generation
  const getPuzzleIndex = (): string => {
    if (!assignedGeneration || !assignedPuzzle) return "";
    const index = assignedGeneration.puzzles.findIndex(
      (p) => p.id === assignedPuzzle.id,
    );
    return `${index + 1}/${assignedGeneration.puzzles.length}`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← Back
        </button>
        <div style={styles.headerCenter}>
          <h1 style={styles.title}>{area.name}</h1>
          <p style={styles.subtitle}>{area.letterCount} letters</p>
        </div>
        <div style={styles.headerSpacer} />
      </header>

      {/* Location Carousel */}
      <section style={styles.carouselSection}>
        <div style={styles.carouselHeader}>
          <span style={styles.carouselLabel}>LOCATIONS</span>
          <div style={styles.dots}>
            {area.locations.map((_, i) => (
              <span
                key={i}
                style={{
                  ...styles.dot,
                  ...(i === currentLocationIndex ? styles.dotActive : {}),
                }}
                onClick={() => {
                  setCurrentLocationIndex(i);
                  setSelectedGenerationId(null);
                }}
              />
            ))}
          </div>
        </div>

        <div
          style={styles.carousel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Previous arrow */}
          <button
            onClick={handleSwipeRight}
            style={{
              ...styles.arrowButton,
              opacity: currentLocationIndex > 0 ? 1 : 0.3,
            }}
            disabled={currentLocationIndex === 0}
          >
            ←
          </button>

          {/* Current Location Card */}
          <div
            style={styles.locationCard}
            onClick={() => onLocationClick(currentLocation.id)}
          >
            <h2 style={styles.locationName}>{currentLocation.name}</h2>
            <p style={styles.locationDifficulty}>
              {DIFFICULTY_LABELS[currentLocationIndex]}
            </p>

            {assignedPuzzle ? (
              <div style={styles.puzzlePreview}>
                <div style={styles.gridContainer}>
                  <GridPreview grid={assignedPuzzle.grid} size="medium" />
                </div>
                <div style={styles.puzzleMeta}>
                  <span style={styles.generationLabel}>
                    {assignedGeneration?.letters.join("")}
                  </span>
                  <span style={styles.puzzleIndex}>{getPuzzleIndex()}</span>
                  <span style={styles.puzzleScore}>
                    Score: {(assignedPuzzle.score * 100).toFixed(0)}
                  </span>
                </div>
              </div>
            ) : (
              <div style={styles.emptyLocation}>
                <p style={styles.emptyText}>Empty</p>
                <p style={styles.dropHint}>Tap a generation below to assign</p>
              </div>
            )}
          </div>

          {/* Next arrow */}
          <button
            onClick={handleSwipeLeft}
            style={{
              ...styles.arrowButton,
              opacity:
                currentLocationIndex < area.locations.length - 1 ? 1 : 0.3,
            }}
            disabled={currentLocationIndex === area.locations.length - 1}
          >
            →
          </button>
        </div>
      </section>

      {/* Candidate Generations */}
      <section style={styles.generationsSection}>
        <div style={styles.generationsHeader}>
          <span style={styles.generationsLabel}>CANDIDATE GENERATIONS</span>
          <button onClick={onNewGeneration} style={styles.generateButton}>
            + Generate
          </button>
        </div>

        <div style={styles.generationsList}>
          {generations.length === 0 ? (
            <p style={styles.noGenerations}>
              No generations yet. Click "+ Generate" to create puzzles.
            </p>
          ) : (
            generations.map((gen) => {
              const isSelected = selectedGenerationId === gen.id;
              const topScore =
                gen.puzzles.length > 0
                  ? Math.max(...gen.puzzles.map((p) => p.score))
                  : 0;

              return (
                <div
                  key={gen.id}
                  style={{
                    ...styles.generationRow,
                    ...(isSelected ? styles.generationRowSelected : {}),
                  }}
                  onClick={() => handleGenerationTap(gen.id)}
                >
                  <div style={styles.generationInfo}>
                    <span style={styles.generationWord}>
                      "{gen.letters.join("")}"
                    </span>
                    <span style={styles.generationMeta}>
                      {gen.puzzles.length} puzzles • Top:{" "}
                      {(topScore * 100).toFixed(0)}
                    </span>
                  </div>

                  {isSelected && (
                    <button
                      style={styles.assignButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignGeneration(currentLocation.id, gen.id);
                        setSelectedGenerationId(null);
                      }}
                    >
                      Assign to {currentLocation.name}
                    </button>
                  )}

                  {!isSelected && (
                    <span style={styles.dragHint}>tap to assign</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#121212",
    color: "#FFFFFF",
    fontFamily: "system-ui, -apple-system, sans-serif",
    overflow: "hidden",
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "100vw",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderBottom: "1px solid #2D2D2D",
    boxSizing: "border-box",
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
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#A0A0A0",
  },
  headerSpacer: {
    width: "60px",
  },

  // Carousel Section
  carouselSection: {
    padding: "16px",
    borderBottom: "1px solid #2D2D2D",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  carouselHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  carouselLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#A0A0A0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  dots: {
    display: "flex",
    gap: "8px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#2D2D2D",
    cursor: "pointer",
  },
  dotActive: {
    backgroundColor: "#6C5CE7",
  },
  carousel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    boxSizing: "border-box",
    touchAction: "pan-y",
  },
  arrowButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#6C5CE7",
    fontSize: "20px",
    cursor: "pointer",
    padding: "8px",
    flexShrink: 0,
  },
  locationCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#1E1E1E",
    border: "1px solid #2D2D2D",
    borderRadius: "16px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  locationName: {
    margin: "0 0 4px 0",
    fontSize: "20px",
    fontWeight: "600",
  },
  locationDifficulty: {
    margin: "0 0 20px 0",
    fontSize: "14px",
    color: "#A0A0A0",
  },
  puzzlePreview: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  gridContainer: {
    backgroundColor: "#121212",
    borderRadius: "12px",
    padding: "16px",
  },
  puzzleMeta: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  generationLabel: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#6C5CE7",
  },
  puzzleIndex: {
    fontSize: "14px",
    color: "#A0A0A0",
  },
  puzzleScore: {
    fontSize: "14px",
    color: "#A0A0A0",
  },
  emptyLocation: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: "18px",
    color: "#666",
    fontStyle: "italic",
    margin: "0 0 8px 0",
  },
  dropHint: {
    fontSize: "14px",
    color: "#A0A0A0",
    margin: 0,
  },

  // Generations Section
  generationsSection: {
    padding: "16px",
    flex: 1,
    boxSizing: "border-box",
    overflowY: "auto",
  },
  generationsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  generationsLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#A0A0A0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  generateButton: {
    backgroundColor: "#6C5CE7",
    border: "none",
    color: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  generationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  noGenerations: {
    textAlign: "center",
    color: "#666",
    padding: "40px 20px",
    fontStyle: "italic",
  },
  generationRow: {
    backgroundColor: "#1E1E1E",
    border: "1px solid #2D2D2D",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  generationRowSelected: {
    borderColor: "#6C5CE7",
    backgroundColor: "#252238",
  },
  generationInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  generationWord: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  generationMeta: {
    fontSize: "13px",
    color: "#A0A0A0",
  },
  dragHint: {
    fontSize: "12px",
    color: "#666",
    fontStyle: "italic",
  },
  assignButton: {
    backgroundColor: "#6C5CE7",
    border: "none",
    color: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
