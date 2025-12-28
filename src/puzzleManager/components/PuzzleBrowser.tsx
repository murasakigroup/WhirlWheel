/**
 * PuzzleBrowser Component
 * Browse and rate puzzles from a generation
 */

import React, { useState } from 'react';
import type { Generation } from '../types';
import { PuzzleCard } from './PuzzleCard';

interface PuzzleBrowserProps {
  generation: Generation;
  onBack: () => void;
  onLikePuzzle: (puzzleId: string) => void;
  onSkipPuzzle: (puzzleId: string) => void;
  onPuzzleDetails: (puzzleId: string) => void;
}

export function PuzzleBrowser({
  generation,
  onBack,
  onLikePuzzle,
  onSkipPuzzle,
  onPuzzleDetails
}: PuzzleBrowserProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sort puzzles by score (highest first)
  const sortedPuzzles = [...generation.puzzles].sort((a, b) => b.score - a.score);
  const currentPuzzle = sortedPuzzles[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(sortedPuzzles.length - 1, prev + 1));
  };

  const handleLike = () => {
    onLikePuzzle(currentPuzzle.id);
  };

  const handleSkip = () => {
    onSkipPuzzle(currentPuzzle.id);
  };

  const handleDetails = () => {
    onPuzzleDetails(currentPuzzle.id);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← Back
        </button>
        <h1 style={styles.title}>
          {generation.letters.join('')}
        </h1>
        <span style={styles.counter}>
          {currentIndex + 1}/{sortedPuzzles.length}
        </span>
      </header>

      <div style={styles.content}>
        <PuzzleCard
          puzzle={currentPuzzle}
          onLike={handleLike}
          onSkip={handleSkip}
          onDetails={handleDetails}
        />

        <div style={styles.navigation}>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{
              ...styles.navButton,
              ...(currentIndex === 0 ? styles.navButtonDisabled : {})
            }}
          >
            ◄ Prev
          </button>

          <div style={styles.dots}>
            {sortedPuzzles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  ...styles.dot,
                  ...(index === currentIndex ? styles.dotActive : {})
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === sortedPuzzles.length - 1}
            style={{
              ...styles.navButton,
              ...(currentIndex === sortedPuzzles.length - 1 ? styles.navButtonDisabled : {})
            }}
          >
            Next ►
          </button>
        </div>
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
    borderBottom: '1px solid #2D2D2D'
  },
  backButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6C5CE7',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '8px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600'
  },
  counter: {
    fontSize: '14px',
    color: '#A0A0A0',
    minWidth: '60px',
    textAlign: 'right'
  },
  content: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '24px',
    gap: '16px'
  },
  navButton: {
    backgroundColor: '#2D2D2D',
    border: 'none',
    color: '#FFFFFF',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '80px'
  },
  navButtonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed'
  },
  dots: {
    display: 'flex',
    gap: '8px',
    flex: 1,
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#2D2D2D',
    border: 'none',
    padding: 0,
    cursor: 'pointer'
  },
  dotActive: {
    backgroundColor: '#6C5CE7'
  }
};
