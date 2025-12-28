/**
 * MainMenu Component
 * Navigation between Game and Puzzle Manager
 */

import React from 'react';

interface MainMenuProps {
  onPlayGame: () => void;
  onPuzzleManager: () => void;
}

export function MainMenu({ onPlayGame, onPuzzleManager }: MainMenuProps) {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Word Game</h1>
        <p style={styles.subtitle}>Wordscapes-style Crossword Puzzle</p>

        <div style={styles.menu}>
          <button onClick={onPlayGame} style={styles.menuButton}>
            🎮 Play Game
          </button>
          <button onClick={onPuzzleManager} style={styles.menuButton}>
            🔧 Puzzle Manager
          </button>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>Journey through Home, Forest, Desert, Mountains, Ocean, and Space</p>
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
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  content: {
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center'
  },
  title: {
    fontSize: '48px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    background: 'linear-gradient(135deg, #6C5CE7, #00B894)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    fontSize: '18px',
    color: '#A0A0A0',
    margin: '0 0 48px 0'
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '48px'
  },
  menuButton: {
    backgroundColor: '#1E1E1E',
    border: '2px solid #2D2D2D',
    color: '#FFFFFF',
    padding: '20px 32px',
    borderRadius: '12px',
    fontSize: '20px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      borderColor: '#6C5CE7',
      transform: 'translateY(-2px)'
    }
  },
  footer: {
    marginTop: '32px'
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  }
};
