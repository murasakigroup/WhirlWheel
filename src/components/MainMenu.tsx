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

interface MainMenuProps {
  onPlayCampaign: (areaId?: string) => void;
  onPlayQuickGame: () => void;
  onPuzzleManager: () => void;
}

export function MainMenu({
  onPlayCampaign,
  onPlayQuickGame,
  onPuzzleManager,
}: MainMenuProps) {
  const [showAreaSelect, setShowAreaSelect] = useState(false);
  const [campaignAvailable, setCampaignAvailable] = useState(false);
  const [progress, setProgress] = useState<ReturnType<
    typeof getCampaignProgress
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
        </div>

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
};
