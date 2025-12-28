/**
 * Puzzle Manager
 * Main entry point for the puzzle curation UI
 */

import React, { useState } from "react";
import { useGameData } from "./hooks/useGameData";
import { useGeneration } from "./hooks/useGeneration";
import { AreasList } from "./components/AreasList";
import { AreaDetail } from "./components/AreaDetail";
import { GenerationModal } from "./components/GenerationModal";
import { PuzzleBrowser } from "./components/PuzzleBrowser";
import { GameBuilder } from "./components/GameBuilder";
import type { GenerationRequest } from "./types";

export function PuzzleManager() {
  const {
    gameData,
    addGeneration,
    updateGeneration,
    deleteGeneration,
    autoFill,
    exportData,
    importData,
  } = useGameData();
  const { generate } = useGeneration();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedGenerationId, setSelectedGenerationId] = useState<
    string | null
  >(null);
  const [showGameBuilder, setShowGameBuilder] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAreaClick = (areaId: string) => {
    setSelectedAreaId(areaId);
    setSelectedGenerationId(null);
  };

  const handleBack = () => {
    if (selectedGenerationId) {
      setSelectedGenerationId(null);
    } else if (showGameBuilder) {
      setShowGameBuilder(false);
    } else {
      setSelectedAreaId(null);
    }
  };

  const handleShowGameBuilder = () => {
    setShowGameBuilder(true);
    setSelectedAreaId(null);
    setSelectedGenerationId(null);
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const success = importData(text);
      if (success) {
        alert("Data imported successfully!");
      } else {
        alert("Failed to import data. Invalid format.");
      }
    } catch (error) {
      alert("Failed to read file: " + (error as Error).message);
    }
  };

  const handleLocationClick = (locationId: string) => {
    // TODO: Navigate to Location Detail
    console.log("Location clicked:", locationId);
  };

  const handleGenerationClick = (generationId: string) => {
    setSelectedGenerationId(generationId);
  };

  const handleNewGeneration = () => {
    setShowGenerationModal(true);
  };

  const handleGenerate = async (request: GenerationRequest) => {
    setIsGenerating(true);
    try {
      const generation = await generate(request);
      addGeneration(generation);
      setShowGenerationModal(false);
      console.log("Generated:", generation);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate puzzles: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLikePuzzle = (puzzleId: string) => {
    if (!selectedGenerationId) return;

    const generation = gameData.generations.find(
      (g) => g.id === selectedGenerationId,
    );
    if (!generation) return;

    const updatedPuzzles = generation.puzzles.map((p) =>
      p.id === puzzleId
        ? { ...p, feedback: { ...p.feedback, liked: true } }
        : p,
    );

    updateGeneration(selectedGenerationId, { puzzles: updatedPuzzles });
  };

  const handleSkipPuzzle = (puzzleId: string) => {
    if (!selectedGenerationId) return;

    const generation = gameData.generations.find(
      (g) => g.id === selectedGenerationId,
    );
    if (!generation) return;

    const updatedPuzzles = generation.puzzles.map((p) =>
      p.id === puzzleId
        ? { ...p, feedback: { ...p.feedback, liked: false } }
        : p,
    );

    updateGeneration(selectedGenerationId, { puzzles: updatedPuzzles });
  };

  const handlePuzzleDetails = (puzzleId: string) => {
    // TODO: Navigate to Puzzle Detail
    console.log("Puzzle details:", puzzleId);
  };

  // Find selected area and its generations
  const selectedArea = gameData.areas.find((a) => a.id === selectedAreaId);
  const areaGenerations = selectedArea
    ? gameData.generations.filter(
        (g) => g.letterCount === selectedArea.letterCount,
      )
    : [];

  const selectedGeneration = gameData.generations.find(
    (g) => g.id === selectedGenerationId,
  );

  // Game Builder
  if (showGameBuilder) {
    return (
      <GameBuilder
        gameData={gameData}
        onAutoFill={autoFill}
        onLocationClick={handleLocationClick}
        onExport={exportData}
      />
    );
  }

  // Puzzle Browser
  if (selectedGeneration) {
    return (
      <PuzzleBrowser
        generation={selectedGeneration}
        onBack={handleBack}
        onLikePuzzle={handleLikePuzzle}
        onSkipPuzzle={handleSkipPuzzle}
        onPuzzleDetails={handlePuzzleDetails}
      />
    );
  }

  // Area Detail
  if (selectedArea) {
    return (
      <>
        <AreaDetail
          area={selectedArea}
          generations={areaGenerations}
          onBack={handleBack}
          onLocationClick={handleLocationClick}
          onGenerationClick={handleGenerationClick}
          onNewGeneration={handleNewGeneration}
          onDeleteGeneration={deleteGeneration}
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

  // Areas List
  return (
    <AreasList
      areas={gameData.areas}
      onAreaClick={handleAreaClick}
      onGameBuilder={handleShowGameBuilder}
      onExport={exportData}
      onImport={handleImport}
    />
  );
}

export default PuzzleManager;
