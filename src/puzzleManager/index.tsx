/**
 * Puzzle Manager
 * Main entry point for the puzzle curation UI
 */

import React, { useState } from "react";
import { useGameData } from "./hooks/useGameData";
import { AreasList } from "./components/AreasList";
import { AreaDetail } from "./components/AreaDetail";

export function PuzzleManager() {
  const { gameData } = useGameData();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [showGenerationModal, setShowGenerationModal] = useState(false);

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
    // TODO: Show Generation Parameters modal
    console.log("New generation clicked");
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
      <AreaDetail
        area={selectedArea}
        generations={areaGenerations}
        onBack={handleBack}
        onLocationClick={handleLocationClick}
        onGenerationClick={handleGenerationClick}
        onNewGeneration={handleNewGeneration}
      />
    );
  }

  return <AreasList areas={gameData.areas} onAreaClick={handleAreaClick} />;
}

export default PuzzleManager;
