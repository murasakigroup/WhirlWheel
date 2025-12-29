/**
 * Puzzle Manager
 * Main entry point for the puzzle curation UI
 *
 * Navigation flow:
 * GameBuilder (entry) → AreaView → LocationView → PuzzleDetail
 */

import React, { useState } from "react";
import { useGameData } from "./hooks/useGameData";
import { useGeneration } from "./hooks/useGeneration";
import { useBatchGeneration } from "./hooks/useBatchGeneration";
import { GenerationModal } from "./components/GenerationModal";
import { BatchGenerationModal } from "./components/BatchGenerationModal";
import type { BatchGenerationConfig } from "./components/BatchGenerationModal";
import { PuzzleDetail } from "./components/PuzzleDetail";
import { GameBuilder } from "./components/GameBuilder";
import { AreaView } from "./components/AreaView";
import { LocationView } from "./components/LocationView";
import type { GenerationRequest } from "./types";

interface PuzzleManagerProps {
  onBack?: () => void;
}

export function PuzzleManager({ onBack }: PuzzleManagerProps = {}) {
  const {
    gameData,
    addGeneration,
    updateGeneration,
    deleteGeneration,
    assignGeneration,
    selectPuzzleForLocation,
    autoFill,
    exportData,
  } = useGameData();
  const { generate } = useGeneration();
  const {
    progress: batchProgress,
    startBatch,
    cancelBatch,
  } = useBatchGeneration();

  // Navigation state
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);

  // Modal state
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Navigation handlers
  const handleAreaClick = (areaId: string) => {
    setSelectedAreaId(areaId);
    setSelectedLocationId(null);
    setSelectedPuzzleId(null);
  };

  const handleLocationClick = (locationId: string) => {
    setSelectedLocationId(locationId);
    setSelectedPuzzleId(null);
  };

  const handlePuzzleClick = (puzzleId: string) => {
    setSelectedPuzzleId(puzzleId);
  };

  const handleBack = () => {
    if (selectedPuzzleId) {
      setSelectedPuzzleId(null);
    } else if (selectedLocationId) {
      setSelectedLocationId(null);
    } else if (selectedAreaId) {
      setSelectedAreaId(null);
    }
  };

  // Generation handlers
  const handleNewGeneration = () => {
    setShowGenerationModal(true);
  };

  const handleGenerate = async (request: GenerationRequest) => {
    try {
      const generation = await generate(request);
      addGeneration(generation);
      setShowGenerationModal(false);
      console.log("Generated:", generation);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate puzzles: " + (error as Error).message);
    }
  };

  const handleBatchGenerate = () => {
    setShowBatchModal(true);
  };

  const handleStartBatch = async (config: BatchGenerationConfig) => {
    setShowBatchModal(false);
    await startBatch(
      gameData.areas,
      config,
      (generation) => {
        addGeneration(generation);
      },
      () => {
        // On complete - auto-assign if enabled
        if (config.autoAssign) {
          autoFill();
        }
      },
    );
  };

  // Calculate generation counts per area for the modal
  const generationCounts: Record<string, number> = {};
  for (const area of gameData.areas) {
    generationCounts[area.id] = gameData.generations.filter(
      (g) => g.letterCount === area.letterCount,
    ).length;
  }

  // Assignment handlers
  const handleAssignGeneration = (locationId: string, generationId: string) => {
    assignGeneration(locationId, generationId);
  };

  const handleSelectPuzzleForLocation = () => {
    if (selectedLocationId && selectedPuzzleId) {
      selectPuzzleForLocation(selectedLocationId, selectedPuzzleId);
      // Go back to location view after selection
      setSelectedPuzzleId(null);
    }
  };

  // Notes handler for PuzzleDetail
  const handleNotesChange = (puzzleId: string, notes: string) => {
    // Find which generation contains this puzzle
    const generation = gameData.generations.find((g) =>
      g.puzzles.some((p) => p.id === puzzleId),
    );
    if (!generation) return;

    const updatedPuzzles = generation.puzzles.map((p) =>
      p.id === puzzleId ? { ...p, feedback: { ...p.feedback, notes } } : p,
    );

    updateGeneration(generation.id, { puzzles: updatedPuzzles });
  };

  // Like/Skip handlers (for backward compatibility in PuzzleDetail)
  const handleLikePuzzle = () => {
    if (!selectedPuzzleId) return;
    const generation = gameData.generations.find((g) =>
      g.puzzles.some((p) => p.id === selectedPuzzleId),
    );
    if (!generation) return;

    const puzzle = generation.puzzles.find((p) => p.id === selectedPuzzleId);
    const currentlyLiked = puzzle?.feedback.liked === true;

    const updatedPuzzles = generation.puzzles.map((p) =>
      p.id === selectedPuzzleId
        ? {
            ...p,
            feedback: { ...p.feedback, liked: currentlyLiked ? null : true },
          }
        : p,
    );
    updateGeneration(generation.id, { puzzles: updatedPuzzles });
  };

  const handleSkipPuzzle = () => {
    if (!selectedPuzzleId) return;
    const generation = gameData.generations.find((g) =>
      g.puzzles.some((p) => p.id === selectedPuzzleId),
    );
    if (!generation) return;

    const puzzle = generation.puzzles.find((p) => p.id === selectedPuzzleId);
    const currentlySkipped = puzzle?.feedback.liked === false;

    const updatedPuzzles = generation.puzzles.map((p) =>
      p.id === selectedPuzzleId
        ? {
            ...p,
            feedback: { ...p.feedback, liked: currentlySkipped ? null : false },
          }
        : p,
    );
    updateGeneration(generation.id, { puzzles: updatedPuzzles });
  };

  // Derived state
  const selectedArea = gameData.areas.find((a) => a.id === selectedAreaId);
  const areaGenerations = selectedArea
    ? gameData.generations.filter(
        (g) => g.letterCount === selectedArea.letterCount,
      )
    : [];

  const selectedLocation = selectedArea?.locations.find(
    (loc) => loc.id === selectedLocationId,
  );

  const assignedGeneration = selectedLocation
    ? gameData.generations.find(
        (g) => g.id === selectedLocation.assignedGenerationId,
      )
    : null;

  const selectedPuzzle = assignedGeneration?.puzzles.find(
    (p) => p.id === selectedPuzzleId,
  );

  const currentlyAssignedPuzzle = selectedLocation
    ? assignedGeneration?.puzzles.find(
        (p) => p.id === selectedLocation.assignedPuzzleId,
      )
    : null;

  // ============ RENDER ============

  // Puzzle Detail View
  if (selectedPuzzle && assignedGeneration && selectedLocation) {
    return (
      <PuzzleDetail
        puzzle={selectedPuzzle}
        generation={assignedGeneration}
        onBack={handleBack}
        onLike={handleLikePuzzle}
        onSkip={handleSkipPuzzle}
        onNotesChange={(notes) => handleNotesChange(selectedPuzzle.id, notes)}
        locationName={selectedLocation.name}
        onSelectForLocation={handleSelectPuzzleForLocation}
      />
    );
  }

  // Location View
  if (selectedLocation && selectedArea) {
    return (
      <LocationView
        location={selectedLocation}
        area={selectedArea}
        generation={assignedGeneration}
        selectedPuzzle={currentlyAssignedPuzzle || null}
        onBack={handleBack}
        onPuzzleClick={handlePuzzleClick}
      />
    );
  }

  // Area View
  if (selectedArea) {
    return (
      <>
        <AreaView
          area={selectedArea}
          generations={areaGenerations}
          onBack={handleBack}
          onLocationClick={handleLocationClick}
          onNewGeneration={handleNewGeneration}
          onAssignGeneration={handleAssignGeneration}
        />
        {showGenerationModal && (
          <GenerationModal
            letterCount={selectedArea.letterCount}
            onGenerate={handleGenerate}
            onClose={() => setShowGenerationModal(false)}
          />
        )}
      </>
    );
  }

  // Game Builder (entry point)
  return (
    <>
      <GameBuilder
        gameData={gameData}
        onAutoFill={autoFill}
        onBatchGenerate={handleBatchGenerate}
        onCancelBatch={cancelBatch}
        onAreaClick={handleAreaClick}
        onLocationClick={handleLocationClick}
        onExport={exportData}
        onBack={onBack}
        batchProgress={batchProgress}
      />
      {showBatchModal && (
        <BatchGenerationModal
          areas={gameData.areas}
          generationCounts={generationCounts}
          onStart={handleStartBatch}
          onClose={() => setShowBatchModal(false)}
        />
      )}
    </>
  );
}

export default PuzzleManager;
