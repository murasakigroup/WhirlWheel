/**
 * GameBuilder Component
 * Overview of all 30 puzzle slots organized by area/location
 */

import React from 'react';
import type { GameData } from '../types';

interface GameBuilderProps {
  gameData: GameData;
  onAutoFill: () => void;
  onLocationClick: (locationId: string) => void;
  onExport: () => void;
}

export function GameBuilder({ gameData, onAutoFill, onLocationClick, onExport }: GameBuilderProps) {
  // Count filled and liked puzzles
  const totalSlots = gameData.areas.reduce((sum, area) => sum + area.locations.length, 0);
  const filledSlots = gameData.areas.reduce((sum, area) =>
    sum + area.locations.filter(loc => loc.assignedPuzzleId).length, 0
  );
  const likedPuzzles = gameData.generations.reduce((sum, gen) =>
    sum + gen.puzzles.filter(p => p.feedback.liked === true).length, 0
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Game Builder</h1>
        <div style={styles.headerActions}>
          <button onClick={onAutoFill} style={styles.autoFillButton}>
            🎲 Auto-fill
          </button>
          <button onClick={onExport} style={styles.exportButton}>
            📤 Export
          </button>
        </div>
      </header>

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
        {gameData.areas.map(area => (
          <section key={area.id} style={styles.areaSection}>
            <h2 style={styles.areaTitle}>
              {area.name} ({area.letterCount} letters)
            </h2>
            <div style={styles.locationsGrid}>
              {area.locations.map(location => {
                const isAssigned = !!location.assignedPuzzleId;
                const puzzle = location.assignedPuzzleId
                  ? gameData.generations
                      .flatMap(g => g.puzzles)
                      .find(p => p.id === location.assignedPuzzleId)
                  : null;

                return (
                  <div
                    key={location.id}
                    style={{
                      ...styles.locationCard,
                      ...(isAssigned ? styles.locationCardFilled : {})
                    }}
                    onClick={() => onLocationClick(location.id)}
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
    minHeight: '100vh',
    backgroundColor: '#121212',
    color: '#FFFFFF',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    borderBottom: '1px solid #2D2D2D',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  autoFillButton: {
    backgroundColor: '#6C5CE7',
    border: 'none',
    color: '#FFFFFF',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  exportButton: {
    backgroundColor: '#00B894',
    border: 'none',
    color: '#FFFFFF',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  summary: {
    display: 'flex',
    gap: '24px',
    padding: '20px',
    backgroundColor: '#1E1E1E',
    borderBottom: '1px solid #2D2D2D',
    flexWrap: 'wrap'
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#A0A0A0',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  summaryValue: {
    fontSize: '18px',
    fontWeight: '600'
  },
  content: {
    padding: '20px'
  },
  areaSection: {
    marginBottom: '32px'
  },
  areaTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#A0A0A0'
  },
  locationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px'
  },
  locationCard: {
    backgroundColor: '#1E1E1E',
    border: '1px solid #2D2D2D',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  locationCardFilled: {
    borderColor: '#6C5CE7',
    backgroundColor: '#252238'
  },
  locationName: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  puzzleInfo: {
    fontSize: '12px',
    color: '#A0A0A0'
  },
  puzzleScore: {
    marginBottom: '4px'
  },
  puzzleWords: {},
  emptySlot: {
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic'
  }
};
