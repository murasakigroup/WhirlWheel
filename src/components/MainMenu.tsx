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
import "./MainMenu.css";

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
      <div className="main-menu-container">
        <div className="main-menu-content">
          <button
            onClick={() => setShowAreaSelect(false)}
            className="back-button"
          >
            ← Back
          </button>

          <h1 className="area-select-title">Select Area</h1>
          <p className="progress-text">
            {progress.filledLocations}/{progress.totalLocations} puzzles ready
          </p>

          <div className="area-list">
            {/* Play All option */}
            <button onClick={handlePlayAll} className="play-all-button">
              <span className="area-icon">🌍</span>
              <div className="area-info">
                <span className="area-name">Play All</span>
                <span className="area-progress">Journey through all areas</span>
              </div>
              <span className="area-arrow">→</span>
            </button>

            {progress.areas.map((area) => {
              const isPlayable = area.filledLocations > 0;
              const areaEmoji = getAreaEmoji(area.id);

              return (
                <button
                  key={area.id}
                  onClick={() => isPlayable && handleSelectArea(area.id)}
                  className="area-button"
                  disabled={!isPlayable}
                >
                  <span className="area-icon">{areaEmoji}</span>
                  <div className="area-info">
                    <span className="area-name">{area.name}</span>
                    <span className="area-progress">
                      {area.letterCount} letters • {area.filledLocations}/
                      {area.totalLocations} puzzles
                    </span>
                  </div>
                  {isPlayable && <span className="area-arrow">→</span>}
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
    <div className="main-menu-container">
      <div className="main-menu-content">
        <h1 className="main-menu-title">Word Game</h1>
        <p className="main-menu-subtitle">Whirl Wheel Crossword Puzzle</p>

        <div className="main-menu">
          {/* Continue button (shown if saved progress exists) */}
          {savedProgress && savedProgress.puzzleIndex > 0 && (
            <button
              onClick={onContinueCampaign}
              className="glass-button continue"
            >
              <span className="button-icon">▶️</span>
              <div className="button-content">
                <span className="button-title">Continue</span>
                <span className="button-subtitle">
                  {getAreaNameById(savedProgress.areaId)} • Puzzle{" "}
                  {savedProgress.puzzleIndex + 1}
                </span>
              </div>
            </button>
          )}

          {/* Campaign button */}
          <button
            onClick={handlePlayCampaign}
            className={`glass-button campaign ${!campaignAvailable ? "disabled" : ""}`}
            disabled={!campaignAvailable}
          >
            <span className="button-icon">🗺️</span>
            <div className="button-content">
              <span className="button-title">Campaign</span>
              <span className="button-subtitle">
                {campaignAvailable && progress
                  ? `${progress.filledLocations} puzzles across ${progress.areas.filter((a) => a.filledLocations > 0).length} areas`
                  : "No puzzles generated yet"}
              </span>
            </div>
          </button>

          {/* Quick Play button */}
          <button onClick={onPlayQuickGame} className="glass-button">
            <span className="button-icon">🎮</span>
            <div className="button-content">
              <span className="button-title">Quick Play</span>
              <span className="button-subtitle">3 sample puzzles</span>
            </div>
          </button>

          {/* Puzzle Manager button */}
          <button onClick={onPuzzleManager} className="glass-button">
            <span className="button-icon">🔧</span>
            <div className="button-content">
              <span className="button-title">Puzzle Manager</span>
              <span className="button-subtitle">Generate & curate puzzles</span>
            </div>
          </button>

          {/* Reset Progress button (shown if saved progress exists) */}
          {savedProgress && savedProgress.puzzleIndex > 0 && (
            <button
              onClick={handleResetProgress}
              className="glass-button reset"
            >
              <span className="button-icon">🔄</span>
              <div className="button-content">
                <span className="button-title">Reset Progress</span>
                <span className="button-subtitle">
                  Clear all campaign progress
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Level Select (Debug/Test) */}
        {campaignAvailable && progress && (
          <div className="level-select-container">
            <button
              onClick={() => setShowLevelSelect(!showLevelSelect)}
              className="level-select-toggle"
            >
              <span>{showLevelSelect ? "▼" : "▶"}</span>
              <span style={{ marginLeft: "8px" }}>Level Select (Test)</span>
            </button>

            {showLevelSelect && (
              <div className="level-select-content">
                {progress.areas.map((area) => {
                  const areaEmoji = getAreaEmoji(area.id);
                  const hasAnyPuzzles = area.locations.some(
                    (loc) => loc.hasPuzzle,
                  );

                  if (!hasAnyPuzzles) return null;

                  return (
                    <div key={area.id} className="area-section">
                      <div className="area-section-header">
                        <span className="area-section-emoji">{areaEmoji}</span>
                        <span className="area-section-name">{area.name}</span>
                        <span className="area-section-count">
                          {area.locations.filter((l) => l.hasPuzzle).length}/
                          {area.locations.length}
                        </span>
                      </div>
                      <div className="puzzle-grid">
                        {area.locations.map((location, idx) => {
                          if (!location.hasPuzzle) return null;

                          const isComplete = isPuzzleComplete(area.id, idx);
                          return (
                            <button
                              key={idx}
                              onClick={() => onSelectLevel(area.id, idx)}
                              className={`puzzle-button ${isComplete ? "complete" : ""}`}
                              title={location.name}
                            >
                              {isComplete && (
                                <span className="checkmark">✓</span>
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

        <div className="main-menu-footer">
          <p className="footer-text">
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
