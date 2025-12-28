/**
 * useGameData Hook
 * Manages GameData state with LocalStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import type { GameData, Area, Generation } from '../types';
import { INITIAL_AREAS } from '../data/scaffold';

const STORAGE_KEY = 'puzzle-manager-data';

function loadGameData(): GameData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load game data:', error);
  }

  // Return initial scaffold if no data exists
  return {
    areas: INITIAL_AREAS,
    generations: []
  };
}

function saveGameData(data: GameData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save game data:', error);
  }
}

export function useGameData() {
  const [gameData, setGameData] = useState<GameData>(loadGameData);

  // Auto-save whenever gameData changes
  useEffect(() => {
    saveGameData(gameData);
  }, [gameData]);

  // Add a new generation
  const addGeneration = useCallback((generation: Generation) => {
    setGameData(prev => ({
      ...prev,
      generations: [...prev.generations, generation]
    }));
  }, []);

  // Update a generation (e.g., when rating puzzles)
  const updateGeneration = useCallback((generationId: string, updates: Partial<Generation>) => {
    setGameData(prev => ({
      ...prev,
      generations: prev.generations.map(gen =>
        gen.id === generationId ? { ...gen, ...updates } : gen
      )
    }));
  }, []);

  // Delete a generation
  const deleteGeneration = useCallback((generationId: string) => {
    setGameData(prev => ({
      ...prev,
      generations: prev.generations.filter(gen => gen.id !== generationId)
    }));
  }, []);

  // Assign a puzzle to a location
  const assignPuzzle = useCallback((locationId: string, puzzleId: string) => {
    setGameData(prev => ({
      ...prev,
      areas: prev.areas.map(area => ({
        ...area,
        locations: area.locations.map(loc =>
          loc.id === locationId ? { ...loc, assignedPuzzleId: puzzleId } : loc
        )
      }))
    }));
  }, []);

  // Unassign a puzzle from a location
  const unassignPuzzle = useCallback((locationId: string) => {
    setGameData(prev => ({
      ...prev,
      areas: prev.areas.map(area => ({
        ...area,
        locations: area.locations.map(loc =>
          loc.id === locationId ? { ...loc, assignedPuzzleId: undefined } : loc
        )
      }))
    }));
  }, []);

  // Export data as JSON
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `puzzle-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [gameData]);

  // Import data from JSON
  const importData = useCallback((jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString) as GameData;
      setGameData(imported);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }, []);

  // Reset to initial scaffold
  const resetData = useCallback(() => {
    const initialData: GameData = {
      areas: INITIAL_AREAS,
      generations: []
    };
    setGameData(initialData);
  }, []);

  return {
    gameData,
    addGeneration,
    updateGeneration,
    deleteGeneration,
    assignPuzzle,
    unassignPuzzle,
    exportData,
    importData,
    resetData
  };
}
