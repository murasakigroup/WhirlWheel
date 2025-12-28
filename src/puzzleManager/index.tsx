/**
 * Puzzle Manager
 * Main entry point for the puzzle curation UI
 */

import React, { useState } from "react";
import { useGameData } from "./hooks/useGameData";
import { AreasList } from "./components/AreasList";

export function PuzzleManager() {
  const { gameData } = useGameData();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const handleAreaClick = (areaId: string) => {
    setSelectedAreaId(areaId);
    // TODO: Navigate to Area Detail screen
    console.log("Area clicked:", areaId);
  };

  return <AreasList areas={gameData.areas} onAreaClick={handleAreaClick} />;
}

export default PuzzleManager;
