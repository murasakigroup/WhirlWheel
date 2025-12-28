/**
 * GridPreview Component
 * Displays a crossword grid visualization
 */

import React from 'react';
import type { Grid } from '../../puzzleGenerator/types';

interface GridPreviewProps {
  grid: Grid;
  size?: 'small' | 'medium' | 'large';
}

export function GridPreview({ grid, size = 'medium' }: GridPreviewProps) {
  const { minRow, maxRow, minCol, maxCol } = grid.bounds;
  const width = maxCol - minCol + 1;
  const height = maxRow - minRow + 1;

  // Cell size based on size prop
  const cellSize = size === 'small' ? 20 : size === 'medium' ? 32 : 48;
  const fontSize = size === 'small' ? 10 : size === 'medium' ? 14 : 20;

  const cells: JSX.Element[] = [];

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const letter = grid.cells.get(`${row},${col}`);
      const x = (col - minCol) * cellSize;
      const y = (row - minRow) * cellSize;

      cells.push(
        <g key={`${row},${col}`}>
          <rect
            x={x}
            y={y}
            width={cellSize}
            height={cellSize}
            fill={letter ? '#6C5CE7' : '#2D2D2D'}
            stroke="#121212"
            strokeWidth={1}
          />
          {letter && (
            <text
              x={x + cellSize / 2}
              y={y + cellSize / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#FFFFFF"
              fontSize={fontSize}
              fontWeight="600"
              fontFamily="system-ui"
            >
              {letter}
            </text>
          )}
        </g>
      );
    }
  }

  return (
    <svg
      width={width * cellSize}
      height={height * cellSize}
      style={{ display: 'block', margin: '0 auto' }}
    >
      {cells}
    </svg>
  );
}
