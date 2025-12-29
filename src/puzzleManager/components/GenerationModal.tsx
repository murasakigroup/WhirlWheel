/**
 * GenerationModal Component
 * Modal for configuring puzzle generation parameters
 */

import React, { useState } from "react";
import type { GenerationRequest } from "../types";
import type { GeneratorParams } from "../../puzzleGenerator/types";
import enhancedWordlistData from "../../data/enhanced-wordlist.json";

// Get random word from enhanced wordlist, biased toward high fun-score words
// Uses exponential distribution to strongly favor top-ranked words
function getRandomLetters(count: number): string {
  const wordsByLength = enhancedWordlistData.wordsByLength as Record<
    string,
    string[]
  >;
  const words = wordsByLength[String(count)] || [];
  if (words.length > 0) {
    // Use exponential distribution to heavily bias toward index 0 (highest fun score)
    // With scale = length/4, ~63% of picks are from top 25%, ~86% from top 50%
    const scale = words.length / 4;
    const rand = Math.random();
    const exponentialIndex = Math.floor(
      -Math.log(Math.max(rand, 0.001)) * scale,
    );
    const index = Math.min(exponentialIndex, words.length - 1);
    return words[index];
  }
  return "ABCDEFGH".slice(0, count);
}

// Get random seed
function getRandomSeed(): number {
  return Math.floor(Math.random() * 1000000);
}

interface GenerationModalProps {
  letterCount: number;
  onGenerate: (request: GenerationRequest) => void;
  onClose: () => void;
}

export function GenerationModal({
  letterCount,
  onGenerate,
  onClose,
}: GenerationModalProps) {
  const [letters, setLetters] = useState(() => getRandomLetters(letterCount));
  const [seed, setSeed] = useState(() => String(getRandomSeed()));

  // Randomize letters
  const randomizeLetters = () => {
    setLetters(getRandomLetters(letterCount));
  };

  // Randomize seed
  const randomizeSeed = () => {
    setSeed(String(getRandomSeed()));
  };
  const [minWordCount, setMinWordCount] = useState(3);
  const [maxWordCount, setMaxWordCount] = useState(6);
  const [candidatesToGenerate, setCandidatesToGenerate] = useState(10);
  const [strategy, setStrategy] = useState<
    "longestFirst" | "mostConnectedFirst" | "random"
  >("longestFirst");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Scoring weights
  const [compactnessWeight, setCompactnessWeight] = useState(0.4);
  const [densityWeight, setDensityWeight] = useState(0.2);
  const [intersectionWeight, setIntersectionWeight] = useState(0.3);
  const [symmetryWeight, setSymmetryWeight] = useState(0.1);

  const handleGenerate = () => {
    const request: GenerationRequest = {
      letterCount,
      // Always use the displayed letters (they're pre-generated for random mode)
      letters: letters
        .toUpperCase()
        .split("")
        .filter((c) => c.match(/[A-Z]/)),
      // Always use the displayed seed
      seed: parseInt(seed) || undefined,
      params: {
        minWordCount,
        maxWordCount,
        candidatesToGenerate,
        placementStrategy: strategy,
        compactnessWeight,
        densityWeight,
        intersectionWeight,
        symmetryWeight,
      },
    };
    onGenerate(request);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>New Generation</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <div style={styles.content}>
          {/* Letters */}
          <div style={styles.field}>
            <label style={styles.label}>Letters ({letterCount} letters)</label>
            <div style={styles.inputGroup}>
              <input
                type="text"
                value={letters}
                onChange={(e) => setLetters(e.target.value.toUpperCase())}
                maxLength={letterCount}
                style={styles.input}
              />
              <button
                onClick={randomizeLetters}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.95)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                style={styles.randomButton}
                title="Generate random letters"
              >
                🎲
              </button>
            </div>
          </div>

          {/* Seed */}
          <div style={styles.field}>
            <label style={styles.label}>Seed</label>
            <div style={styles.inputGroup}>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                style={styles.input}
              />
              <button
                onClick={randomizeSeed}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.95)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                style={styles.randomButton}
                title="Generate random seed"
              >
                🎲
              </button>
            </div>
          </div>

          {/* Word Count */}
          <div style={styles.field}>
            <label style={styles.label}>
              Word Count: {minWordCount} - {maxWordCount}
            </label>
            <div style={styles.sliderGroup}>
              <span style={styles.sliderLabel}>Min</span>
              <input
                type="range"
                min={3}
                max={8}
                value={minWordCount}
                onChange={(e) => setMinWordCount(parseInt(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.sliderLabel}>Max</span>
              <input
                type="range"
                min={3}
                max={8}
                value={maxWordCount}
                onChange={(e) => setMaxWordCount(parseInt(e.target.value))}
                style={styles.slider}
              />
            </div>
          </div>

          {/* Candidates */}
          <div style={styles.field}>
            <label style={styles.label}>
              Candidates to Generate: {candidatesToGenerate}
            </label>
            <input
              type="range"
              min={5}
              max={20}
              value={candidatesToGenerate}
              onChange={(e) =>
                setCandidatesToGenerate(parseInt(e.target.value))
              }
              style={styles.slider}
            />
          </div>

          {/* Strategy */}
          <div style={styles.field}>
            <label style={styles.label}>Strategy</label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="longestFirst"
                  checked={strategy === "longestFirst"}
                  onChange={(e) => setStrategy(e.target.value as any)}
                  style={styles.radio}
                />
                Longest First
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="mostConnectedFirst"
                  checked={strategy === "mostConnectedFirst"}
                  onChange={(e) => setStrategy(e.target.value as any)}
                  style={styles.radio}
                />
                Most Connected
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="random"
                  checked={strategy === "random"}
                  onChange={(e) => setStrategy(e.target.value as any)}
                  style={styles.radio}
                />
                Random
              </label>
            </div>
          </div>

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={styles.advancedToggle}
          >
            {showAdvanced ? "▼" : "▶"} Advanced
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div style={styles.advanced}>
              <h3 style={styles.advancedTitle}>Scoring Weights</h3>

              <div style={styles.field}>
                <label style={styles.label}>
                  Compactness: {compactnessWeight.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={compactnessWeight}
                  onChange={(e) =>
                    setCompactnessWeight(parseFloat(e.target.value))
                  }
                  style={styles.slider}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Density: {densityWeight.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={densityWeight}
                  onChange={(e) => setDensityWeight(parseFloat(e.target.value))}
                  style={styles.slider}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Intersections: {intersectionWeight.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={intersectionWeight}
                  onChange={(e) =>
                    setIntersectionWeight(parseFloat(e.target.value))
                  }
                  style={styles.slider}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Symmetry: {symmetryWeight.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={symmetryWeight}
                  onChange={(e) =>
                    setSymmetryWeight(parseFloat(e.target.value))
                  }
                  style={styles.slider}
                />
              </div>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={handleGenerate} style={styles.generateButton}>
            Generate Puzzles
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "#1E1E1E",
    borderRadius: "12px",
    maxWidth: "500px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    border: "1px solid #2D2D2D",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px",
    borderBottom: "1px solid #2D2D2D",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#A0A0A0",
    fontSize: "24px",
    cursor: "pointer",
    padding: "0",
    width: "32px",
    height: "32px",
  },
  content: {
    padding: "20px",
  },
  field: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: "8px",
  },
  inputGroup: {
    display: "flex",
    gap: "8px",
  },
  input: {
    flex: 1,
    backgroundColor: "#121212",
    border: "1px solid #2D2D2D",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#FFFFFF",
    fontSize: "14px",
    fontFamily: "system-ui",
  },
  randomButton: {
    backgroundColor: "#6C5CE7",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "18px",
    cursor: "pointer",
    transition: "transform 0.1s, opacity 0.1s",
  },
  sliderGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  sliderLabel: {
    fontSize: "12px",
    color: "#A0A0A0",
    minWidth: "32px",
  },
  slider: {
    flex: 1,
    height: "4px",
    backgroundColor: "#2D2D2D",
    outline: "none",
    borderRadius: "2px",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#FFFFFF",
    cursor: "pointer",
  },
  radio: {
    cursor: "pointer",
  },
  advancedToggle: {
    backgroundColor: "transparent",
    border: "none",
    color: "#6C5CE7",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "8px 0",
    marginBottom: "12px",
  },
  advanced: {
    backgroundColor: "#121212",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "12px",
  },
  advancedTitle: {
    margin: "0 0 16px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#A0A0A0",
  },
  footer: {
    padding: "20px",
    borderTop: "1px solid #2D2D2D",
  },
  generateButton: {
    width: "100%",
    backgroundColor: "#6C5CE7",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
