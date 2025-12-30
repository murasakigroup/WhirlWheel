/**
 * useGameData Hook
 * Manages GameData state with LocalStorage persistence
 */

import { useState, useEffect, useCallback } from "react";
import type { GameData, Area, Generation } from "../types";
import { INITIAL_AREAS } from "../data/scaffold";
import { loadDefaultCampaign } from "../../data/campaignLoader";

const STORAGE_KEY = "puzzle-manager-data";

function loadGameData(): GameData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load game data:", error);
  }

  // Return initial scaffold if no data exists
  return {
    areas: INITIAL_AREAS,
    generations: [],
  };
}

function saveGameData(data: GameData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save game data:", error);
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
    setGameData((prev) => ({
      ...prev,
      generations: [...prev.generations, generation],
    }));
  }, []);

  // Update a generation (e.g., when rating puzzles)
  const updateGeneration = useCallback(
    (generationId: string, updates: Partial<Generation>) => {
      setGameData((prev) => ({
        ...prev,
        generations: prev.generations.map((gen) =>
          gen.id === generationId ? { ...gen, ...updates } : gen,
        ),
      }));
    },
    [],
  );

  // Delete a generation
  const deleteGeneration = useCallback((generationId: string) => {
    setGameData((prev) => ({
      ...prev,
      generations: prev.generations.filter((gen) => gen.id !== generationId),
    }));
  }, []);

  // Assign a puzzle to a location
  const assignPuzzle = useCallback((locationId: string, puzzleId: string) => {
    setGameData((prev) => ({
      ...prev,
      areas: prev.areas.map((area) => ({
        ...area,
        locations: area.locations.map((loc) =>
          loc.id === locationId ? { ...loc, assignedPuzzleId: puzzleId } : loc,
        ),
      })),
    }));
  }, []);

  // Unassign a puzzle from a location
  const unassignPuzzle = useCallback((locationId: string) => {
    setGameData((prev) => ({
      ...prev,
      areas: prev.areas.map((area) => ({
        ...area,
        locations: area.locations.map((loc) =>
          loc.id === locationId
            ? {
                ...loc,
                assignedPuzzleId: undefined,
                assignedGenerationId: undefined,
              }
            : loc,
        ),
      })),
    }));
  }, []);

  // Assign a generation to a location (sets first puzzle as default)
  const assignGeneration = useCallback(
    (locationId: string, generationId: string) => {
      setGameData((prev) => {
        const generation = prev.generations.find((g) => g.id === generationId);
        const firstPuzzleId = generation?.puzzles[0]?.id;

        return {
          ...prev,
          areas: prev.areas.map((area) => ({
            ...area,
            locations: area.locations.map((loc) =>
              loc.id === locationId
                ? {
                    ...loc,
                    assignedGenerationId: generationId,
                    assignedPuzzleId: firstPuzzleId,
                  }
                : loc,
            ),
          })),
        };
      });
    },
    [],
  );

  // Select a specific puzzle within an assigned generation
  const selectPuzzleForLocation = useCallback(
    (locationId: string, puzzleId: string) => {
      setGameData((prev) => ({
        ...prev,
        areas: prev.areas.map((area) => ({
          ...area,
          locations: area.locations.map((loc) =>
            loc.id === locationId
              ? { ...loc, assignedPuzzleId: puzzleId }
              : loc,
          ),
        })),
      }));
    },
    [],
  );

  // Export data as JSON
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `puzzle-manager-backup-${new Date().toISOString().split("T")[0]}.json`;
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
      console.error("Failed to import data:", error);
      return false;
    }
  }, []);

  // Reset to initial scaffold
  const resetData = useCallback(() => {
    const initialData: GameData = {
      areas: INITIAL_AREAS,
      generations: [],
    };
    setGameData(initialData);
  }, []);

  // Reset to default campaign
  const resetToDefault = useCallback(() => {
    const defaultData = loadDefaultCampaign();
    setGameData(defaultData);
  }, []);

  // Auto-fill empty slots with generations (assigns first puzzle from each)
  const autoFill = useCallback(() => {
    setGameData((prev) => {
      const newAreas = prev.areas.map((area) => ({
        ...area,
        locations: [...area.locations],
      }));

      // Group generations by letter count
      const generationsByLetterCount = new Map<
        number,
        typeof prev.generations
      >();
      for (const generation of prev.generations) {
        const existing =
          generationsByLetterCount.get(generation.letterCount) || [];
        generationsByLetterCount.set(generation.letterCount, [
          ...existing,
          generation,
        ]);
      }

      // Assign generations to empty slots
      for (const area of newAreas) {
        const availableGenerations =
          generationsByLetterCount.get(area.letterCount) || [];
        let genIndex = 0;

        for (let i = 0; i < area.locations.length; i++) {
          const location = area.locations[i];
          // Skip if already has a generation assigned
          if (location.assignedGenerationId) continue;

          if (genIndex < availableGenerations.length) {
            const generation = availableGenerations[genIndex];
            const firstPuzzle = generation.puzzles[0];

            area.locations[i] = {
              ...location,
              assignedGenerationId: generation.id,
              assignedPuzzleId: firstPuzzle?.id,
            };
            genIndex++;
          }
        }
      }

      return { ...prev, areas: newAreas };
    });
  }, []);

  return {
    gameData,
    addGeneration,
    updateGeneration,
    deleteGeneration,
    assignPuzzle,
    unassignPuzzle,
    assignGeneration,
    selectPuzzleForLocation,
    autoFill,
    exportData,
    importData,
    resetData,
    resetToDefault,
  };
}
