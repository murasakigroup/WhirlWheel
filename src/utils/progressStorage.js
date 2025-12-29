/**
 * Campaign Progress Storage
 * Manages localStorage persistence for campaign progress
 */

const STORAGE_KEY = "wordgame-campaign-progress";

/**
 * Save current progress to localStorage
 * @param {string} areaId - The current area ID (or null for "Play All")
 * @param {number} puzzleIndex - Current puzzle index
 * @param {Set<string>|Array<string>} completedPuzzles - Set or array of completed puzzle IDs
 */
export function saveProgress(areaId, puzzleIndex, completedPuzzles) {
  try {
    const progress = {
      areaId,
      puzzleIndex,
      completedPuzzles: Array.from(completedPuzzles),
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
}

/**
 * Load saved progress from localStorage
 * @returns {{areaId: string|null, puzzleIndex: number, completedPuzzles: string[], lastUpdated: string}|null}
 */
export function loadProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const progress = JSON.parse(data);
    return {
      areaId: progress.areaId || null,
      puzzleIndex: progress.puzzleIndex || 0,
      completedPuzzles: progress.completedPuzzles || [],
      lastUpdated: progress.lastUpdated,
    };
  } catch (error) {
    console.error("Failed to load progress:", error);
    return null;
  }
}

/**
 * Clear all saved progress
 */
export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to reset progress:", error);
  }
}

/**
 * Mark a puzzle as complete
 * @param {string} areaId - The area ID
 * @param {number} puzzleIndex - The puzzle index
 */
export function markPuzzleComplete(areaId, puzzleIndex) {
  try {
    const progress = loadProgress();
    const completedPuzzles = progress ? progress.completedPuzzles : [];
    const puzzleId = `${areaId}-${puzzleIndex}`;

    if (!completedPuzzles.includes(puzzleId)) {
      completedPuzzles.push(puzzleId);
    }

    saveProgress(
      progress?.areaId || areaId,
      progress?.puzzleIndex || puzzleIndex,
      completedPuzzles,
    );
  } catch (error) {
    console.error("Failed to mark puzzle complete:", error);
  }
}

/**
 * Get all completed puzzles
 * @returns {Set<string>} - Set of completed puzzle IDs (format: "areaId-puzzleIndex")
 */
export function getCompletedPuzzles() {
  const progress = loadProgress();
  return new Set(progress ? progress.completedPuzzles : []);
}

/**
 * Check if a specific puzzle is complete
 * @param {string} areaId - The area ID
 * @param {number} puzzleIndex - The puzzle index
 * @returns {boolean}
 */
export function isPuzzleComplete(areaId, puzzleIndex) {
  const completed = getCompletedPuzzles();
  return completed.has(`${areaId}-${puzzleIndex}`);
}
