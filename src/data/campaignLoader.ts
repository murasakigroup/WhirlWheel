/**
 * Campaign Loader
 * Converts puzzle manager data to game-playable format
 */

import type {
  GameData,
  CuratedPuzzle,
  Area,
  Location,
} from "../puzzleManager/types";
import defaultCampaignData from "./defaultCampaign.json";

// Game puzzle format (what App.jsx expects)
export interface GamePuzzle {
  id: string;
  letters: string[];
  gridWords: Array<{
    word: string;
    row: number;
    col: number;
    direction: "across" | "down";
  }>;
  bonusWords: string[];
  theme: string;
  background: string;
  // Campaign metadata
  areaId: string;
  areaName: string;
  locationId: string;
  locationName: string;
  difficulty: number; // 0-4 (Easiest to Hardest)
}

// Location-specific backgrounds mapped by location ID
const LOCATION_BACKGROUNDS: Record<string, string> = {
  // Home (3 letters)
  "home-bedroom":
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80",
  "home-kitchen":
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
  "home-backyard":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  "home-garage":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  "home-mailbox":
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80",

  // Forest (4 letters)
  "forest-trail":
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  "forest-clearing":
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80",
  "forest-stream":
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80",
  "forest-cabin":
    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80",
  "forest-campfire":
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80",

  // Desert (5 letters)
  "desert-oasis":
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80",
  "desert-canyon":
    "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=1200&q=80",
  "desert-dunes":
    "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1200&q=80",
  "desert-ruins":
    "https://images.unsplash.com/photo-1547235001-d703406d3f17?w=1200&q=80",
  "desert-sunset":
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",

  // Mountains (6 letters)
  "mountains-basecamp":
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
  "mountains-waterfall":
    "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80",
  "mountains-cave":
    "https://images.unsplash.com/photo-1500740516770-92bd004b996e?w=1200&q=80",
  "mountains-summit":
    "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=80",
  "mountains-lodge":
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",

  // Ocean (7 letters)
  "ocean-beach":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
  "ocean-reef":
    "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
  "ocean-shipwreck":
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&q=80",
  "ocean-lighthouse":
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
  "ocean-island":
    "https://images.unsplash.com/photo-1439405326854-014607f694d7?w=1200&q=80",

  // Space (8 letters)
  "space-launchpad":
    "https://images.unsplash.com/photo-1457364887197-9150188c107b?w=1200&q=80",
  "space-station":
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80",
  "space-asteroid":
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80",
  "space-nebula":
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80",
  "space-planet":
    "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=1200&q=80",
};

// Fallback backgrounds by area theme
const AREA_FALLBACK_BACKGROUNDS: Record<string, string> = {
  home: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
  forest:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  desert:
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80",
  mountains:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
  ocean:
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=80",
  space:
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80",
};

const STORAGE_KEY = "puzzle-manager-data";

/**
 * Load the default campaign data from the bundled JSON file
 */
export function loadDefaultCampaign(): GameData {
  return defaultCampaignData as GameData;
}

/**
 * Load campaign data from localStorage
 * If no data exists, seeds from default campaign
 */
export function loadCampaignData(): GameData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // No data in localStorage - seed from default campaign
    const defaultData = loadDefaultCampaign();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  } catch (error) {
    console.error("Failed to load campaign data:", error);
  }
  return null;
}

/**
 * Convert a CuratedPuzzle to game format
 */
function convertPuzzleToGameFormat(
  puzzle: CuratedPuzzle,
  generation: { letters: string[] },
  area: Area,
  location: Location,
  locationIndex: number,
): GamePuzzle {
  // Normalize grid positions (generator can have negative rows/cols)
  const minRow = Math.min(...puzzle.words.map((w) => w.row));
  const minCol = Math.min(...puzzle.words.map((w) => w.col));

  const gridWords = puzzle.words.map((word) => ({
    word: word.word,
    row: word.row - minRow, // Normalize to 0-based
    col: word.col - minCol,
    direction: (word.direction === "horizontal" ? "across" : "down") as
      | "across"
      | "down",
  }));

  // Get background for this specific location, fallback to area default
  const background =
    LOCATION_BACKGROUNDS[location.id] ||
    AREA_FALLBACK_BACKGROUNDS[area.id] ||
    AREA_FALLBACK_BACKGROUNDS.forest;

  return {
    id: puzzle.id,
    letters: [...generation.letters],
    gridWords,
    bonusWords: puzzle.bonusWords || [],
    theme: area.id,
    background,
    areaId: area.id,
    areaName: area.name,
    locationId: location.id,
    locationName: location.name,
    difficulty: locationIndex,
  };
}

/**
 * Get all campaign puzzles organized by area
 */
export function getCampaignPuzzles(
  gameData: GameData,
): Map<string, GamePuzzle[]> {
  const puzzlesByArea = new Map<string, GamePuzzle[]>();

  for (const area of gameData.areas) {
    const areaPuzzles: GamePuzzle[] = [];

    for (let i = 0; i < area.locations.length; i++) {
      const location = area.locations[i];

      if (!location.assignedPuzzleId || !location.assignedGenerationId) {
        continue;
      }

      const generation = gameData.generations.find(
        (g) => g.id === location.assignedGenerationId,
      );
      if (!generation) continue;

      const puzzle = generation.puzzles.find(
        (p) => p.id === location.assignedPuzzleId,
      );
      if (!puzzle) continue;

      const gamePuzzle = convertPuzzleToGameFormat(
        puzzle,
        generation,
        area,
        location,
        i,
      );
      areaPuzzles.push(gamePuzzle);
    }

    if (areaPuzzles.length > 0) {
      puzzlesByArea.set(area.id, areaPuzzles);
    }
  }

  return puzzlesByArea;
}

/**
 * Get a flat list of all campaign puzzles in order
 */
export function getAllCampaignPuzzles(gameData: GameData): GamePuzzle[] {
  const allPuzzles: GamePuzzle[] = [];
  const puzzlesByArea = getCampaignPuzzles(gameData);

  for (const area of gameData.areas) {
    const areaPuzzles = puzzlesByArea.get(area.id);
    if (areaPuzzles) {
      allPuzzles.push(...areaPuzzles);
    }
  }

  return allPuzzles;
}

/**
 * Get campaign progress summary
 */
export function getCampaignProgress(gameData: GameData): {
  totalLocations: number;
  filledLocations: number;
  areas: Array<{
    id: string;
    name: string;
    letterCount: number;
    totalLocations: number;
    filledLocations: number;
    locations: Array<{
      id: string;
      name: string;
      hasPuzzle: boolean;
    }>;
  }>;
} {
  const areas = gameData.areas.map((area) => ({
    id: area.id,
    name: area.name,
    letterCount: area.letterCount,
    totalLocations: area.locations.length,
    filledLocations: area.locations.filter((l) => l.assignedPuzzleId).length,
    locations: area.locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      hasPuzzle: !!loc.assignedPuzzleId,
    })),
  }));

  return {
    totalLocations: areas.reduce((sum, a) => sum + a.totalLocations, 0),
    filledLocations: areas.reduce((sum, a) => sum + a.filledLocations, 0),
    areas,
  };
}

/**
 * Check if campaign has any playable puzzles
 */
export function hasCampaignPuzzles(): boolean {
  const gameData = loadCampaignData();
  if (!gameData) return false;

  return gameData.areas.some((area) =>
    area.locations.some((loc) => loc.assignedPuzzleId),
  );
}
