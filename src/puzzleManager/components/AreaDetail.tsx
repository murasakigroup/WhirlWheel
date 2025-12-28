/**
 * AreaDetail Component
 * Shows locations and generations for a specific area
 */

import React from 'react';
import type { Area, Generation } from '../types';

interface AreaDetailProps {
  area: Area;
  generations: Generation[];
  onBack: () => void;
  onLocationClick: (locationId: string) => void;
  onGenerationClick: (generationId: string) => void;
  onNewGeneration: () => void;
}

export function AreaDetail({
  area,
  generations,
  onBack,
  onLocationClick,
  onGenerationClick,
  onNewGeneration
}: AreaDetailProps) {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← Back
        </button>
        <h1 style={styles.title}>{area.name}</h1>
        <div style={styles.headerSpacer} />
      </header>

      <div style={styles.content}>
        {/* Locations Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Locations ({area.locations.length})</h2>
          <div style={styles.locationsList}>
            {area.locations.map(location => {
              const isAssigned = !!location.assignedPuzzleId;
              return (
                <div
                  key={location.id}
                  style={{
                    ...styles.locationCard,
                    ...(isAssigned ? styles.locationCardFilled : {})
                  }}
                  onClick={() => onLocationClick(location.id)}
                >
                  <span style={styles.locationName}>{location.name}</span>
                  <span style={styles.locationStatus}>
                    {isAssigned ? '✓' : '○'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Generations Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Generations ({generations.length})</h2>
            <button onClick={onNewGeneration} style={styles.newButton}>
              🎲 New
            </button>
          </div>

          {generations.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No generations yet</p>
              <button onClick={onNewGeneration} style={styles.emptyButton}>
                Generate First Puzzles
              </button>
            </div>
          ) : (
            <div style={styles.generationsList}>
              {generations.map(generation => {
                const likedCount = generation.puzzles.filter(p => p.feedback.liked === true).length;
                const skippedCount = generation.puzzles.filter(p => p.feedback.liked === false).length;
                const date = new Date(generation.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={generation.id}
                    style={styles.generationCard}
                    onClick={() => onGenerationClick(generation.id)}
                  >
                    <div style={styles.generationHeader}>
                      <span style={styles.generationTitle}>
                        {generation.letters.join('')}
                      </span>
                      <span style={styles.generationDate}>{date}</span>
                    </div>
                    <div style={styles.generationInfo}>
                      <span>{generation.puzzles.length} puzzles</span>
                      {likedCount > 0 && (
                        <>
                          <span style={styles.generationDot}>•</span>
                          <span style={styles.generationLiked}>{likedCount} ❤️</span>
                        </>
                      )}
                      {skippedCount > 0 && (
                        <>
                          <span style={styles.generationDot}>•</span>
                          <span style={styles.generationSkipped}>{skippedCount} ✗</span>
                        </>
                      )}
                    </div>
                    <div style={styles.generationMeta}>
                      <span style={styles.generationSeed}>seed: {generation.seed}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
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
  headerSpacer: {
    width: '60px'
  },
  content: {
    padding: '20px'
  },
  section: {
    marginBottom: '32px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#A0A0A0'
  },
  newButton: {
    backgroundColor: '#6C5CE7',
    border: 'none',
    color: '#FFFFFF',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  locationsList: {
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'transform 0.2s'
  },
  locationCardFilled: {
    borderColor: '#6C5CE7'
  },
  locationName: {
    fontSize: '14px',
    fontWeight: '500'
  },
  locationStatus: {
    fontSize: '18px'
  },
  generationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  generationCard: {
    backgroundColor: '#1E1E1E',
    border: '1px solid #2D2D2D',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  generationHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  generationTitle: {
    fontSize: '16px',
    fontWeight: '600'
  },
  generationDate: {
    fontSize: '12px',
    color: '#A0A0A0'
  },
  generationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#A0A0A0',
    marginBottom: '8px'
  },
  generationDot: {},
  generationLiked: {
    color: '#00B894'
  },
  generationSkipped: {
    color: '#D63031'
  },
  generationMeta: {
    fontSize: '12px',
    color: '#666'
  },
  generationSeed: {},
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  emptyText: {
    color: '#A0A0A0',
    marginBottom: '16px'
  },
  emptyButton: {
    backgroundColor: '#6C5CE7',
    border: 'none',
    color: '#FFFFFF',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
