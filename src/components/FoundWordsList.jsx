import './FoundWordsList.css';

/**
 * FoundWordsList component - displays all found words
 * @param {string[]} foundWords - Array of words that have been found
 * @param {number} totalWords - Total number of words in the puzzle
 */
function FoundWordsList({ foundWords, totalWords }) {
  return (
    <div className="found-words-list">
      <h3>Found Words ({foundWords.length}/{totalWords})</h3>
      <div className="words-container">
        {foundWords.length === 0 ? (
          <p className="no-words">No words found yet. Start playing!</p>
        ) : (
          <ul>
            {foundWords.map((word, index) => (
              <li key={index} className="found-word">
                {word}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default FoundWordsList;
