/**
 * MainMenu Component
 * Navigation between Campaign, Quick Play, and Puzzle Manager
 */

import React, { useState, useEffect } from "react";
import {
  loadCampaignData,
  getCampaignProgress,
  hasCampaignPuzzles,
} from "../data/campaignLoader";
import { loadProgress, isPuzzleComplete } from "../utils/progressStorage";

interface MainMenuProps {
  onPlayCampaign: (areaId?: string) => void;
  onPlayQuickGame: () => void;
  onPuzzleManager: () => void;
  onContinueCampaign: () => void;
  onResetProgress: () => void;
  onSelectLevel: (areaId: string, puzzleIndex: number) => void;
}

export function MainMenu({
  onPlayCampaign,
  onPlayQuickGame,
  onPuzzleManager,
  onContinueCampaign,
  onResetProgress,
  onSelectLevel,
}: MainMenuProps) {
  const [showAreaSelect, setShowAreaSelect] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [campaignAvailable, setCampaignAvailable] = useState(false);
  const [progress, setProgress] = useState<ReturnType<
    typeof getCampaignProgress
  > | null>(null);
  const [savedProgress, setSavedProgress] = useState<ReturnType<
    typeof loadProgress
  > | null>(null);

  useEffect(() => {
    const available = hasCampaignPuzzles();
    setCampaignAvailable(available);

    if (available) {
      const gameData = loadCampaignData();
      if (gameData) {
        setProgress(getCampaignProgress(gameData));
      }
    }

    // Load saved progress
    const saved = loadProgress();
    setSavedProgress(saved);
  }, []);

  const handlePlayCampaign = () => {
    if (progress && progress.areas.length > 0) {
      setShowAreaSelect(true);
    }
  };

  const handleSelectArea = (areaId: string) => {
    setShowAreaSelect(false);
    onPlayCampaign(areaId);
  };

  const handlePlayAll = () => {
    setShowAreaSelect(false);
    onPlayCampaign();
  };

  const handleResetProgress = () => {
    onResetProgress();
    // Reload saved progress after reset
    const saved = loadProgress();
    setSavedProgress(saved);
  };

  const getAreaNameById = (areaId: string | null): string => {
    if (!areaId) return "All Areas";
    if (!progress) return areaId;
    const area = progress.areas.find((a) => a.id === areaId);
    return area ? area.name : areaId;
  };

  // Area selection screen
  if (showAreaSelect && progress) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <button
            onClick={() => setShowAreaSelect(false)}
            style={styles.backButton}
          >
            ← Back
          </button>

          <h1 style={styles.areaSelectTitle}>Select Area</h1>
          <p style={styles.progressText}>
            {progress.filledLocations}/{progress.totalLocations} puzzles ready
          </p>

          <div style={styles.areaList}>
            {/* Play All option */}
            <button onClick={handlePlayAll} style={styles.playAllButton}>
              <span style={styles.areaIcon}>🌍</span>
              <div style={styles.areaInfo}>
                <span style={styles.areaName}>Play All</span>
                <span style={styles.areaProgress}>
                  Journey through all areas
                </span>
              </div>
              <span style={styles.areaArrow}>→</span>
            </button>

            {progress.areas.map((area) => {
              const isPlayable = area.filledLocations > 0;
              const areaEmoji = getAreaEmoji(area.id);

              return (
                <button
                  key={area.id}
                  onClick={() => isPlayable && handleSelectArea(area.id)}
                  style={{
                    ...styles.areaButton,
                    ...(isPlayable ? {} : styles.areaButtonDisabled),
                  }}
                  disabled={!isPlayable}
                >
                  <span style={styles.areaIcon}>{areaEmoji}</span>
                  <div style={styles.areaInfo}>
                    <span style={styles.areaName}>{area.name}</span>
                    <span style={styles.areaProgress}>
                      {area.letterCount} letters • {area.filledLocations}/
                      {area.totalLocations} puzzles
                    </span>
                  </div>
                  {isPlayable && <span style={styles.areaArrow}>→</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Main menu
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Word Game</h1>
        <p style={styles.subtitle}>Wordscapes-style Crossword Puzzle</p>

        <div style={styles.menu}>
          {/* Continue button (shown if saved progress exists) */}
          {savedProgress && savedProgress.puzzleIndex > 0 && (
            <button onClick={onContinueCampaign} style={styles.continueButton}>
              <span style={styles.buttonIcon}>▶️</span>
              <div style={styles.buttonContent}>
                <span style={styles.buttonTitle}>Continue</span>
                <span style={styles.buttonSubtitle}>
                  {getAreaNameById(savedProgress.areaId)} • Puzzle{" "}
                  {savedProgress.puzzleIndex + 1}
                </span>
              </div>
            </button>
          )}

          {/* Campaign button */}
          <button
            onClick={handlePlayCampaign}
            style={{
              ...styles.menuButton,
              ...styles.campaignButton,
              ...(campaignAvailable ? {} : styles.menuButtonDisabled),
            }}
            disabled={!campaignAvailable}
          >
            <span style={styles.buttonIcon}>🗺️</span>
            <div style={styles.buttonContent}>
              <span style={styles.buttonTitle}>Campaign</span>
              <span style={styles.buttonSubtitle}>
                {campaignAvailable && progress
                  ? `${progress.filledLocations} puzzles across ${progress.areas.filter((a) => a.filledLocations > 0).length} areas`
                  : "No puzzles generated yet"}
              </span>
            </div>
          </button>

          {/* Quick Play button */}
          <button onClick={onPlayQuickGame} style={styles.menuButton}>
            <span style={styles.buttonIcon}>🎮</span>
            <div style={styles.buttonContent}>
              <span style={styles.buttonTitle}>Quick Play</span>
              <span style={styles.buttonSubtitle}>3 sample puzzles</span>
            </div>
          </button>

          {/* Puzzle Manager button */}
          <button onClick={onPuzzleManager} style={styles.menuButton}>
            <span style={styles.buttonIcon}>🔧</span>
            <div style={styles.buttonContent}>
              <span style={styles.buttonTitle}>Puzzle Manager</span>
              <span style={styles.buttonSubtitle}>
                Generate & curate puzzles
              </span>
            </div>
          </button>

          {/* Reset Progress button (shown if saved progress exists) */}
          {savedProgress && savedProgress.puzzleIndex > 0 && (
            <button onClick={handleResetProgress} style={styles.resetButton}>
              <span style={styles.buttonIcon}>🔄</span>
              <div style={styles.buttonContent}>
                <span style={styles.buttonTitle}>Reset Progress</span>
                <span style={styles.buttonSubtitle}>
                  Clear all campaign progress
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Level Select (Debug/Test) */}
        {campaignAvailable && progress && (
          <div style={styles.levelSelectContainer}>
            <button
              onClick={() => setShowLevelSelect(!showLevelSelect)}
              style={styles.levelSelectToggle}
            >
              <span>{showLevelSelect ? "▼" : "▶"}</span>
              <span style={{ marginLeft: "8px" }}>Level Select (Test)</span>
            </button>

            {showLevelSelect && (
              <div style={styles.levelSelectContent}>
                {progress.areas.map((area) => {
                  const areaEmoji = getAreaEmoji(area.id);
                  const hasAnyPuzzles = area.locations.some(
                    (loc) => loc.hasPuzzle,
                  );

                  if (!hasAnyPuzzles) return null;

                  return (
                    <div key={area.id} style={styles.areaSection}>
                      <div style={styles.areaSectionHeader}>
                        <span style={styles.areaSectionEmoji}>{areaEmoji}</span>
                        <span style={styles.areaSectionName}>{area.name}</span>
                        <span style={styles.areaSectionCount}>
                          {area.locations.filter((l) => l.hasPuzzle).length}/
                          {area.locations.length}
                        </span>
                      </div>
                      <div style={styles.puzzleGrid}>
                        {area.locations.map((location, idx) => {
                          if (!location.hasPuzzle) return null;

                          const isComplete = isPuzzleComplete(area.id, idx);
                          return (
                            <button
                              key={idx}
                              onClick={() => onSelectLevel(area.id, idx)}
                              style={{
                                ...styles.puzzleButton,
                                ...(isComplete
                                  ? styles.puzzleButtonComplete
                                  : {}),
                              }}
                              title={location.name}
                            >
                              {isComplete && (
                                <span style={styles.checkmark}>✓</span>
                              )}
                              <span>{idx + 1}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Journey through Home, Forest, Desert, Mountains, Ocean, and Space
          </p>
        </div>
      </div>
    </div>
  );
}

function getAreaEmoji(areaId: string): string {
  const emojis: Record<string, string> = {
    home: "🏠",
    forest: "🌲",
    desert: "🏜️",
    mountains: "⛰️",
    ocean: "🌊",
    space: "🚀",
  };
  return emojis[areaId] || "📍";
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#121212",
    color: "#FFFFFF",
    fontFamily: "system-ui, -apple-system, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },
  content: {
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
  },
  title: {
    fontSize: "48px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #6C5CE7, #00B894)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "18px",
    color: "#A0A0A0",
    margin: "0 0 48px 0",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "48px",
  },
  menuButton: {
    backgroundColor: "#1E1E1E",
    border: "2px solid #2D2D2D",
    color: "#FFFFFF",
    padding: "20px 24px",
    borderRadius: "12px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    textAlign: "left",
  },
  campaignButton: {
    borderColor: "#6C5CE7",
    background: "linear-gradient(135deg, #1E1E1E 0%, #252238 100%)",
  },
  continueButton: {
    backgroundColor: "#2D4A2B",
    border: "2px solid #4CAF50",
    color: "#FFFFFF",
    padding: "20px 24px",
    borderRadius: "12px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    textAlign: "left",
    background: "linear-gradient(135deg, #1E1E1E 0%, #2D4A2B 100%)",
  },
  resetButton: {
    backgroundColor: "#1E1E1E",
    border: "1px solid #D32F2F",
    color: "#FFFFFF",
    padding: "16px 24px",
    borderRadius: "12px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    textAlign: "left",
    opacity: 0.7,
  },
  menuButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    borderColor: "#2D2D2D",
  },
  buttonIcon: {
    fontSize: "32px",
    flexShrink: 0,
  },
  buttonContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  buttonTitle: {
    fontSize: "20px",
    fontWeight: "600",
  },
  buttonSubtitle: {
    fontSize: "14px",
    color: "#A0A0A0",
  },
  footer: {
    marginTop: "32px",
  },
  footerText: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  },
  // Area selection styles
  backButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#6C5CE7",
    fontSize: "16px",
    cursor: "pointer",
    padding: "8px",
    marginBottom: "16px",
    alignSelf: "flex-start",
  },
  areaSelectTitle: {
    fontSize: "32px",
    fontWeight: "700",
    margin: "0 0 8px 0",
  },
  progressText: {
    fontSize: "16px",
    color: "#A0A0A0",
    margin: "0 0 32px 0",
  },
  areaList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  areaButton: {
    backgroundColor: "#1E1E1E",
    border: "1px solid #2D2D2D",
    color: "#FFFFFF",
    padding: "16px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    textAlign: "left",
    transition: "all 0.2s",
  },
  areaButtonDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  playAllButton: {
    backgroundColor: "#252238",
    border: "2px solid #6C5CE7",
    color: "#FFFFFF",
    padding: "16px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    textAlign: "left",
    marginBottom: "8px",
  },
  areaIcon: {
    fontSize: "28px",
    flexShrink: 0,
  },
  areaInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },
  areaName: {
    fontSize: "18px",
    fontWeight: "600",
  },
  areaProgress: {
    fontSize: "13px",
    color: "#A0A0A0",
  },
  areaArrow: {
    fontSize: "20px",
    color: "#6C5CE7",
  },
  // Level Select (Debug/Test) styles
  levelSelectContainer: {
    marginTop: "32px",
    marginBottom: "16px",
    border: "2px dashed #444",
    borderRadius: "12px",
    padding: "16px",
    backgroundColor: "#1A1A1A",
  },
  levelSelectToggle: {
    width: "100%",
    backgroundColor: "transparent",
    border: "none",
    color: "#888",
    fontSize: "14px",
    cursor: "pointer",
    padding: "8px",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    fontFamily: "monospace",
    transition: "color 0.2s",
  },
  levelSelectContent: {
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  areaSection: {
    backgroundColor: "#1E1E1E",
    borderRadius: "8px",
    padding: "12px",
    border: "1px solid #2D2D2D",
  },
  areaSectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid #2D2D2D",
  },
  areaSectionEmoji: {
    fontSize: "20px",
  },
  areaSectionName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
  },
  areaSectionCount: {
    fontSize: "13px",
    color: "#888",
    fontFamily: "monospace",
  },
  puzzleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "8px",
  },
  puzzleButton: {
    aspectRatio: "1",
    backgroundColor: "#2D2D2D",
    border: "1px solid #444",
    borderRadius: "6px",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
    transition: "all 0.2s",
  },
  puzzleButtonComplete: {
    backgroundColor: "#2D4A2B",
    borderColor: "#4CAF50",
  },
  checkmark: {
    position: "absolute" as const,
    top: "2px",
    right: "2px",
    fontSize: "10px",
    color: "#4CAF50",
  },
};
