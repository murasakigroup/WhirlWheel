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
import type { GenerationRequest } from "./types";

export function PuzzleManager() {
  const { gameData, addGeneration } = useGameData();
  const { generate } = useGeneration();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAreaClick = (areaId: string) => {
    setSelectedAreaId(areaId);
  };

  const handleBack = () => {
    setSelectedAreaId(null);
  };

  const handleLocationClick = (locationId: string) => {
    // TODO: Navigate to Location Detail
    console.log("Location clicked:", locationId);
  };

  const handleGenerationClick = (generationId: string) => {
    // TODO: Navigate to Puzzle Browser
    console.log("Generation clicked:", generationId);
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

  // Find selected area and its generations
  const selectedArea = gameData.areas.find((a) => a.id === selectedAreaId);
  const areaGenerations = selectedArea
    ? gameData.generations.filter(
        (g) => g.letterCount === selectedArea.letterCount,
      )
    : [];

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

  return <AreasList areas={gameData.areas} onAreaClick={handleAreaClick} />;
}

export default PuzzleManager;
