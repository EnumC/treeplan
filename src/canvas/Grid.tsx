import type React from 'react';
import type { CanvasSettings } from '@/types/document';

interface Props {
  canvas: CanvasSettings;
  drawingW: number;
  drawingH: number;
}

export const Grid: React.FC<Props> = ({ canvas, drawingW, drawingH }) => {
  if (!canvas.showGrid) return null;

  const spacing = canvas.gridSpacing;
  const totalW = drawingW * canvas.worldUnitsPerInch;
  const totalH = drawingH * canvas.worldUnitsPerInch;
  const patternId = `grid-pattern-${spacing}`;

  return (
    <g className="editor-only">
      <defs>
        <pattern
          id={patternId}
          width={spacing}
          height={spacing}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${spacing} 0 L 0 0 0 ${spacing}`}
            fill="none"
            stroke="#ccc"
            strokeWidth={0.2}
            opacity={0.6}
          />
        </pattern>
      </defs>
      <rect
        x={0}
        y={0}
        width={totalW}
        height={totalH}
        fill={`url(#${patternId})`}
      />
    </g>
  );
};
