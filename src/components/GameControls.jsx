import './GameControls.css';

/**
 * GameControls component - Submit, Clear, and Shuffle buttons
 * @param {function} onSubmit - Callback when Submit is clicked
 * @param {function} onClear - Callback when Clear is clicked
 * @param {function} onShuffle - Callback when Shuffle is clicked
 * @param {boolean} canSubmit - Whether Submit button should be enabled
 */
function GameControls({ onSubmit, onClear, onShuffle, canSubmit }) {
  return (
    <div className="game-controls">
      <button
        className="control-button submit-button"
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        Submit
      </button>
      <button
        className="control-button clear-button"
        onClick={onClear}
      >
        Clear
      </button>
      <button
        className="control-button shuffle-button"
        onClick={onShuffle}
      >
        Shuffle
      </button>
    </div>
  );
}

export default GameControls;
